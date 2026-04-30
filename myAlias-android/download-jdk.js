var https = require('https');
var fs    = require('fs');
var path  = require('path');
var sp    = require('child_process');

// Eclipse Temurin 17 full JDK (not JRE) - Windows x64
var URL  = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip';
var ZIP  = path.join(__dirname, 'jdk17.zip');
var DEST = path.join(__dirname, 'jdk17');

if (fs.existsSync(path.join(DEST, 'jdk-17.0.10+7', 'bin', 'java.exe'))) {
  console.log('JDK already at', DEST);
  process.exit(0);
}

console.log('Downloading Eclipse Temurin JDK 17 (~180MB)...');
var file = fs.createWriteStream(ZIP);
var dl = 0, tot = 0, last = -1;

function fetch(u, hops) {
  if (hops > 10) { console.error('too many redirects'); process.exit(1); }
  var mod = u.startsWith('https') ? https : require('http');
  mod.get(u, function(res) {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetch(res.headers.location, hops + 1);
    }
    if (res.statusCode !== 200) { console.error('HTTP ' + res.statusCode + ' ' + u); process.exit(1); }
    tot = parseInt(res.headers['content-length'] || '0');
    res.on('data', function(c) {
      dl += c.length;
      if (tot) {
        var p = Math.floor(dl / tot * 100);
        if (p !== last && p % 10 === 0) { process.stdout.write(p + '%...'); last = p; }
      }
    });
    res.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log('\nDownloaded. Now run: node extract-jdk.js');
    });
  }).on('error', function(e) { console.error(e.message); process.exit(1); });
}
fetch(URL, 0);
