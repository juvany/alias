/**
 * Downloads Android SDK packages directly (bypasses sdkmanager SSL issues).
 * Fetches the repository manifest, finds exact package URLs, downloads & extracts.
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { spawnSync } = require('child_process');

const SDK_DIR = path.join(__dirname, 'android-sdk');

function log(msg) { process.stdout.write(msg + '\n'); }

function get(url) {
  return new Promise((resolve, reject) => {
    function fetch(u, redirects = 0) {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const mod = u.startsWith('https') ? https : http;
      mod.get(u, res => {
        if (res.statusCode === 301 || res.statusCode === 302) return fetch(res.headers.location, redirects + 1);
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    }
    fetch(url);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { log(`  already exists: ${path.basename(dest)}`); return resolve(); }
    log(`  downloading ${path.basename(dest)} from ${url}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    let downloaded = 0, total = 0, lastPct = -1;
    function fetch(u, redirects = 0) {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const mod = u.startsWith('https') ? https : http;
      mod.get(u, res => {
        if (res.statusCode === 301 || res.statusCode === 302) return fetch(res.headers.location, redirects + 1);
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        total = parseInt(res.headers['content-length'] || '0');
        res.on('data', chunk => {
          downloaded += chunk.length;
          if (total) {
            const pct = Math.floor(downloaded / total * 100);
            if (pct !== lastPct && pct % 20 === 0) { process.stdout.write(`  ${pct}%...`); lastPct = pct; }
          }
        });
        res.pipe(file);
        file.on('finish', () => { file.close(); process.stdout.write('\n'); resolve(); });
      }).on('error', reject);
    }
    fetch(url);
  });
}

function unzip(zipPath, destDir) {
  log(`  extracting to ${destDir}...`);
  fs.mkdirSync(destDir, { recursive: true });
  const r = spawnSync('powershell', [
    '-NoProfile', '-Command',
    `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force`
  ], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('Extraction failed for ' + zipPath);
}

async function main() {
  log('=== Fetching Android repository manifest ===');
  const manifestUrl = 'https://dl.google.com/android/repository/repository2-3.xml';
  const manifest = (await get(manifestUrl)).toString();
  log('Manifest fetched, searching for packages...\n');

  // Parse URLs for needed packages from manifest
  function findUrl(pattern) {
    // Find <remotePackage path="..."> blocks
    const regex = new RegExp(`<remotePackage[^>]*path="${pattern}"[^>]*>[\\s\\S]*?<archive>[\\s\\S]*?<complete>[\\s\\S]*?<url>([^<]+)<\\/url>`, 'g');
    const matches = [];
    let m;
    while ((m = regex.exec(manifest)) !== null) matches.push(m[1]);
    // Also try inner archive with host-os windows
    if (!matches.length) {
      // Try broader search
      const idx = manifest.indexOf(`path="${pattern}"`);
      if (idx === -1) return null;
      const block = manifest.slice(idx, idx + 8000);
      const urlM = block.match(/windows[^<]*<\/host-os>[\s\S]*?<url>([^<]+\.zip)<\/url>/);
      if (urlM) return 'https://dl.google.com/android/repository/' + urlM[1];
      const urlM2 = block.match(/<url>([^<]+\.zip)<\/url>/);
      if (urlM2) return 'https://dl.google.com/android/repository/' + urlM2[1];
    }
    return matches.length ? 'https://dl.google.com/android/repository/' + matches[0] : null;
  }

  // Known stable direct URLs (fallback if manifest parsing fails)
  const KNOWN = {
    'platform-tools': 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
    'platforms;android-34': null, // will parse from manifest
    'build-tools;34.0.0': null,   // will parse from manifest
  };

  const packages = [
    {
      id:   'platform-tools',
      dest: path.join(SDK_DIR, 'platform-tools'),
      zip:  path.join(SDK_DIR, 'platform-tools.zip'),
      url:  KNOWN['platform-tools'],
      subdir: null, // zip root IS platform-tools/
    },
    {
      id:   'platforms;android-34',
      dest: path.join(SDK_DIR, 'platforms', 'android-34'),
      zip:  path.join(SDK_DIR, 'android-34.zip'),
      url:  null,
      subdir: 'android-34',
    },
    {
      id:   'build-tools;34.0.0',
      dest: path.join(SDK_DIR, 'build-tools', '34.0.0'),
      zip:  path.join(SDK_DIR, 'build-tools-34.zip'),
      url:  null,
      subdir: '34.0.0',
    },
  ];

  // Parse manifest for platform and build-tools URLs
  // Build-tools pattern in manifest
  function findInManifest(pathId) {
    const escaped = pathId.replace(/;/g, ';').replace(/\./g, '\\.');
    // Search for all <url> tags within 5000 chars of the package path
    const idx = manifest.indexOf(`path="${pathId}"`);
    if (idx === -1) {
      log(`  WARNING: ${pathId} not found in manifest, will try known URL`);
      return null;
    }
    const block = manifest.slice(idx, idx + 10000);
    // Find Windows-specific URL or any zip URL
    const winMatch = block.match(/windows[^<]{0,200}<url>([^<]+\.zip)<\/url>/s);
    if (winMatch) return 'https://dl.google.com/android/repository/' + winMatch[1];
    const anyMatch = block.match(/<url>([^<]+\.zip)<\/url>/);
    if (anyMatch) return 'https://dl.google.com/android/repository/' + anyMatch[1];
    return null;
  }

  // Known fallback URLs derived from repository structure
  const FALLBACK_PLATFORM  = 'https://dl.google.com/android/repository/platform-34-ext7_r01.zip';
  const FALLBACK_BUILDTOOLS = 'https://dl.google.com/android/repository/build-tools_r34.0.0-windows.zip';

  for (const pkg of packages) {
    if (!pkg.url) {
      pkg.url = findInManifest(pkg.id) || (pkg.id.startsWith('platforms') ? FALLBACK_PLATFORM : FALLBACK_BUILDTOOLS);
      log(`Package ${pkg.id}: ${pkg.url}`);
    }
  }

  log('');

  for (const pkg of packages) {
    if (fs.existsSync(pkg.dest)) {
      log(`✓ ${pkg.id} already installed`);
      continue;
    }
    log(`Installing: ${pkg.id}`);
    await download(pkg.url, pkg.zip);
    const extractTo = path.join(SDK_DIR, '_tmp_' + pkg.id.replace(/[;.]/g, '_'));
    unzip(pkg.zip, extractTo);

    // Move extracted content to correct SDK location
    const entries = fs.readdirSync(extractTo);
    log(`  extracted entries: ${entries.join(', ')}`);

    fs.mkdirSync(path.dirname(pkg.dest), { recursive: true });

    if (pkg.subdir && entries.includes(pkg.subdir)) {
      fs.renameSync(path.join(extractTo, pkg.subdir), pkg.dest);
    } else if (entries.length === 1) {
      fs.renameSync(path.join(extractTo, entries[0]), pkg.dest);
    } else {
      // Move the whole extractTo as dest
      fs.renameSync(extractTo, pkg.dest);
    }
    try { fs.rmdirSync(extractTo, { recursive: true }); } catch (_) {}
    log(`✓ ${pkg.id} installed`);
  }

  log('\n=== Building APK ===\n');
  // Copy latest HTML
  fs.copyFileSync(
    path.join(__dirname, '..', 'myAlias', 'index.html'),
    path.join(__dirname, 'app', 'src', 'main', 'assets', 'index.html')
  );
  log('✓ index.html copied\n');

  const JAVA_HOME   = 'C:\\Program Files\\PDF24\\jre';
  const ANDROID_HOME_W = require('path').win32.resolve(SDK_DIR.replace(/\//g, '\\'));

  const build = spawnSync(
    path.join(__dirname, 'gradlew.bat'),
    ['assembleDebug', '--stacktrace'],
    {
      shell: true,
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        JAVA_HOME,
        ANDROID_HOME: SDK_DIR.replace(/\//g, '\\'),
        PATH: `${JAVA_HOME}\\bin;${process.env.PATH}`,
      }
    }
  );

  if (build.status !== 0) {
    log('\n✗ Build FAILED');
    process.exit(1);
  }

  const apk = path.join(__dirname, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apk)) {
    const mb = (fs.statSync(apk).size / 1024 / 1024).toFixed(1);
    log(`\n✓ SUCCESS! APK built (${mb} MB)`);
    log(`  ${apk}`);
    spawnSync('explorer', [`/select,${apk.replace(/\//g,'\\')}`], { shell: true, detached: true });
  } else {
    log('\n✗ APK not found after build');
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
