const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { spawnSync } = require('child_process');

const SDK = path.join(__dirname, 'android-sdk');
const ZIP = path.join(SDK, 'build-tools-34-win.zip');
const DEST = path.join(SDK, 'build-tools', '34.0.0');
const URL  = 'https://dl.google.com/android/repository/build-tools_r34-windows.zip';

if (fs.existsSync(DEST)) {
  console.log('build-tools 34.0.0 already installed at', DEST);
  process.exit(0);
}

console.log('Downloading build-tools 34 (Windows)...');
fs.mkdirSync(SDK, { recursive: true });
const file = fs.createWriteStream(ZIP);
let dl = 0, tot = 0, last = -1;

function fetch(u, hops) {
  if (hops > 5) { console.error('too many redirects'); process.exit(1); }
  https.get(u, function(res) {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return fetch(res.headers.location, hops + 1);
    }
    if (res.statusCode !== 200) {
      console.error('HTTP ' + res.statusCode + ' for ' + u);
      process.exit(1);
    }
    tot = parseInt(res.headers['content-length'] || '0');
    res.on('data', function(c) {
      dl += c.length;
      if (tot) {
        var p = Math.floor(dl / tot * 100);
        if (p !== last && p % 20 === 0) { process.stdout.write(p + '%...'); last = p; }
      }
    });
    res.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log('\nDownloaded. Extracting...');

      var tmp = path.join(SDK, '_tmp_bt34');
      spawnSync('powershell', [
        '-NoProfile', '-Command',
        "Expand-Archive -Path '" + ZIP + "' -DestinationPath '" + tmp + "' -Force"
      ], { stdio: 'inherit' });

      var entries = fs.readdirSync(tmp);
      console.log('zip contents:', entries.join(', '));

      fs.mkdirSync(path.join(SDK, 'build-tools'), { recursive: true });

      // Android build-tools zip usually extracts to "android-XX" folder
      var src = path.join(tmp, entries[0]);
      fs.renameSync(src, DEST);
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch(e) {}

      console.log('Installed to:', DEST);
      console.log('Files:', fs.readdirSync(DEST).slice(0, 6).join(', '));
    });
  }).on('error', function(e) {
    console.error('Download error:', e.message);
    process.exit(1);
  });
}

fetch(URL, 0);
