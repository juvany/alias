var sp   = require('child_process');
var fs   = require('fs');
var path = require('path');

var ZIP  = path.join(__dirname, 'gradle-dist.zip');
var DEST = path.join(__dirname, 'gradle-dist');

if (fs.existsSync(path.join(DEST, 'gradle-8.4'))) {
  console.log('Already extracted.');
  process.exit(0);
}

console.log('Extracting Gradle 8.4 (takes ~1 minute)...');
fs.mkdirSync(DEST, { recursive: true });

var r = sp.spawnSync('powershell', [
  '-NoProfile', '-Command',
  'Expand-Archive -Path "' + ZIP + '" -DestinationPath "' + DEST + '" -Force'
], { stdio: 'inherit', timeout: 300000 });

if (r.status !== 0) { console.error('Extraction failed'); process.exit(1); }

var entries = fs.readdirSync(DEST);
console.log('Extracted:', entries.join(', '));

var gradleBat = path.join(DEST, entries[0], 'bin', 'gradle.bat');
if (fs.existsSync(gradleBat)) {
  console.log('Gradle ready:', gradleBat);
} else {
  console.log('Contents:', entries);
}
