var sp   = require('child_process');
var fs   = require('fs');
var path = require('path');

var ZIP  = path.join(__dirname, 'jdk17.zip');
var DEST = path.join(__dirname, 'jdk17');

if (!fs.existsSync(ZIP)) { console.error('jdk17.zip not found'); process.exit(1); }

console.log('Extracting JDK 17...');
fs.mkdirSync(DEST, { recursive: true });

var r = sp.spawnSync('powershell', [
  '-NoProfile', '-Command',
  'Expand-Archive -Path "' + ZIP + '" -DestinationPath "' + DEST + '" -Force'
], { stdio: 'inherit', timeout: 300000 });

if (r.status !== 0) { console.error('Failed'); process.exit(1); }

var entries = fs.readdirSync(DEST);
console.log('Extracted:', entries.join(', '));
var javaExe = path.join(DEST, entries[0], 'bin', 'java.exe');
console.log('Java exe:', javaExe, '- exists:', fs.existsSync(javaExe));
