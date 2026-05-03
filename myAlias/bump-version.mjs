import { readFileSync, writeFileSync } from 'node:fs';

const versionPath = 'public/version.json';
const indexPath = 'index.html';

const current = JSON.parse(readFileSync(versionPath, 'utf8')).version;
const [maj, min, patch] = current.split('.').map(Number);
const next = `${maj}.${min}.${patch + 1}`;

writeFileSync(versionPath, `{ "version": "${next}" }\n`);

const html = readFileSync(indexPath, 'utf8');
const updated = html.replace(
  /const APP_VERSION = "[^"]+";/,
  `const APP_VERSION = "${next}";`
);
if (html === updated) {
  console.error(`[bump-version] ERROR: APP_VERSION not found in ${indexPath}`);
  process.exit(1);
}
writeFileSync(indexPath, updated);

console.log(`[bump-version] ${current} -> ${next}`);
