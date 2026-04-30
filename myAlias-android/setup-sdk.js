#!/usr/bin/env node
/**
 * Downloads Android command-line tools and installs the SDK packages needed
 * to build a debug APK. Requires: Node.js, internet access.
 * JDK is taken from PDF24's bundled OpenJDK 17.
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { execSync, spawnSync } = require('child_process');
const os    = require('os');

const SDK_DIR     = path.join(__dirname, 'android-sdk');
const TOOLS_URL   = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip';
const TOOLS_ZIP   = path.join(SDK_DIR, 'cmdline-tools.zip');
const JAVA_HOME   = 'C:\\Program Files\\PDF24\\jre';
const ANDROID_HOME = SDK_DIR;

function log(msg) { process.stdout.write('\n' + msg + '\n'); }
function run(cmd, opts = {}) {
  log('> ' + cmd);
  return spawnSync(cmd, { shell: true, stdio: 'inherit', env: {
    ...process.env,
    JAVA_HOME,
    ANDROID_HOME,
    PATH: `${JAVA_HOME}\\bin;${process.env.PATH}`
  }, ...opts });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { log(`Already exists: ${dest}`); return resolve(); }
    log(`Downloading: ${url}`);
    log(`         to: ${dest}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    let downloaded = 0;
    let total = 0;
    let lastPct = -1;

    function get(u) {
      const mod = u.startsWith('https') ? https : http;
      mod.get(u, res => {
        if (res.statusCode === 301 || res.statusCode === 302) return get(res.headers.location);
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        total = parseInt(res.headers['content-length'] || '0');
        res.on('data', chunk => {
          downloaded += chunk.length;
          if (total) {
            const pct = Math.floor(downloaded / total * 100);
            if (pct !== lastPct && pct % 10 === 0) { process.stdout.write(`  ${pct}%...`); lastPct = pct; }
          }
        });
        res.pipe(file);
        file.on('finish', () => { file.close(); log('\nDone.'); resolve(); });
      }).on('error', reject);
    }
    get(url);
  });
}

async function main() {
  log('=== myAlias APK Builder ===');

  // Check Java
  const javaPath = path.join(JAVA_HOME, 'bin', 'java.exe');
  if (!fs.existsSync(javaPath)) {
    log('ERROR: JRE not found at ' + JAVA_HOME);
    log('Please install PDF24 or set JAVA_HOME manually.');
    process.exit(1);
  }
  log('✓ Java found: ' + javaPath);

  // Download cmdline-tools
  fs.mkdirSync(SDK_DIR, { recursive: true });
  await download(TOOLS_URL, TOOLS_ZIP);

  // Unzip cmdline-tools
  const toolsLatest = path.join(SDK_DIR, 'cmdline-tools', 'latest');
  if (!fs.existsSync(toolsLatest)) {
    log('Extracting cmdline-tools...');
    // Use PowerShell to unzip
    const r = spawnSync('powershell', [
      '-NoProfile', '-Command',
      `Expand-Archive -Path '${TOOLS_ZIP}' -DestinationPath '${SDK_DIR}\\cmdline-tools-tmp' -Force`
    ], { stdio: 'inherit' });
    if (r.status !== 0) { log('Extraction failed'); process.exit(1); }
    // Move to correct location: cmdline-tools/latest/
    fs.mkdirSync(path.dirname(toolsLatest), { recursive: true });
    fs.renameSync(path.join(SDK_DIR, 'cmdline-tools-tmp', 'cmdline-tools'), toolsLatest);
    fs.rmdirSync(path.join(SDK_DIR, 'cmdline-tools-tmp'), { recursive: true });
    log('✓ cmdline-tools extracted');
  } else {
    log('✓ cmdline-tools already extracted');
  }

  const sdkmanager = path.join(toolsLatest, 'bin', 'sdkmanager.bat');

  // Accept licenses
  log('\nAccepting Android SDK licenses...');
  spawnSync(sdkmanager, ['--licenses'], {
    input: 'y\ny\ny\ny\ny\ny\ny\n',
    shell: true,
    stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env, JAVA_HOME, ANDROID_HOME, PATH: `${JAVA_HOME}\\bin;${process.env.PATH}` }
  });

  // Install required packages
  const packages = ['platform-tools', 'platforms;android-34', 'build-tools;34.0.0'];
  for (const pkg of packages) {
    log(`\nInstalling: ${pkg}`);
    const r = spawnSync(sdkmanager, [pkg], {
      shell: true, stdio: 'inherit',
      env: { ...process.env, JAVA_HOME, ANDROID_HOME, PATH: `${JAVA_HOME}\\bin;${process.env.PATH}` }
    });
    if (r.status !== 0) { log(`Failed to install ${pkg}`); process.exit(1); }
    log(`✓ ${pkg} installed`);
  }

  // Copy latest HTML
  log('\nCopying latest game HTML...');
  fs.copyFileSync(
    path.join(__dirname, '..', 'myAlias', 'index.html'),
    path.join(__dirname, 'app', 'src', 'main', 'assets', 'index.html')
  );
  log('✓ index.html copied');

  // Build APK
  log('\n=== Building debug APK ===');
  log('(This may take a few minutes on first run as Gradle downloads dependencies)\n');
  const gradlew = path.join(__dirname, 'gradlew.bat');
  const build = spawnSync(gradlew, ['assembleDebug'], {
    shell: true, stdio: 'inherit', cwd: __dirname,
    env: { ...process.env, JAVA_HOME, ANDROID_HOME, PATH: `${JAVA_HOME}\\bin;${process.env.PATH}` }
  });

  if (build.status !== 0) {
    log('\n✗ Build FAILED. See errors above.');
    process.exit(1);
  }

  const apk = path.join(__dirname, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apk)) {
    const size = (fs.statSync(apk).size / 1024 / 1024).toFixed(1);
    log(`\n✓ APK built successfully! (${size} MB)`);
    log(`  Location: ${apk}`);
    // Open folder
    spawnSync('explorer', [`/select,${apk}`], { shell: true, detached: true });
  } else {
    log('\n✗ APK file not found after build.');
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
