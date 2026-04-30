var https = require('https');
var fs    = require('fs');
var path  = require('path');
var sp    = require('child_process');

var URL  = 'https://services.gradle.org/distributions/gradle-8.4-bin.zip';
var ZIP  = path.join(__dirname, 'gradle-dist.zip');
var DEST = path.join(__dirname, 'gradle-dist');

if (fs.existsSync(path.join(DEST, 'gradle-8.4', 'bin', 'gradle.bat'))) {
  console.log('Gradle already extracted at', DEST);
  process.exit(0);
}

console.log('Downloading Gradle 8.4...');
var file = fs.createWriteStream(ZIP);
var dl = 0, tot = 0, last = -1;

function fetch(u, hops) {
  if (hops > 5) { console.error('too many redirects'); process.exit(1); }
  https.get(u, function(res) {
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) return fetch(res.headers.location, hops + 1);
    if (res.statusCode !== 200) { console.error('HTTP ' + res.statusCode); process.exit(1); }
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
      console.log('\nDownloaded. Extracting (~120MB, takes a minute)...');
      fs.mkdirSync(DEST, { recursive: true });
      var r = sp.spawnSync('powershell', [
        '-NoProfile', '-Command',
        "Expand-Archive -Path '" + ZIP + "' -DestinationPath '" + DEST + "' -Force"
      ], { stdio: 'inherit', timeout: 180000 });
      if (r.status !== 0) { console.error('Extraction failed'); process.exit(1); }
      var entries = fs.readdirSync(DEST);
      console.log('Extracted:', entries.join(', '));
      console.log('Gradle ready at:', path.join(DEST, entries[0], 'bin', 'gradle.bat'));
    });
  }).on('error', function(e) { console.error(e.message); process.exit(1); });
}
fetch(URL, 0);
