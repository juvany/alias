// Downloads the Gradle wrapper JAR needed to build
const https = require('https');
const fs = require('fs');
const path = require('path');

const JAR_URL = 'https://github.com/gradle/gradle/raw/v8.4.0/gradle/wrapper/gradle-wrapper.jar';
const OUT = path.join(__dirname, 'gradle', 'wrapper', 'gradle-wrapper.jar');

if (fs.existsSync(OUT)) {
  console.log('gradle-wrapper.jar already exists, skipping download.');
  process.exit(0);
}

console.log('Downloading gradle-wrapper.jar...');

function download(url, dest, redirects = 0) {
  if (redirects > 5) { console.error('Too many redirects'); process.exit(1); }
  https.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return download(res.headers.location, dest, redirects + 1);
    }
    if (res.statusCode !== 200) {
      console.error('Download failed:', res.statusCode);
      process.exit(1);
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded:', dest);
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

download(JAR_URL, OUT);
