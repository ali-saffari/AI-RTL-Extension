const fs = require('fs');
const path = require('path');

const chromeManifestPath = path.join(__dirname, '../public/manifest.chrome.json');
const firefoxManifestPath = path.join(__dirname, '../public/manifest.firefox.json');
const packagePath = path.join(__dirname, '../package.json');

const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const currentVersion = chromeManifest.version;
console.log(`Current version: ${currentVersion}`);

const versionParts = currentVersion.split('.').map(Number);
versionParts[2] += 1;
const newVersion = versionParts.join('.');
console.log(`New version: ${newVersion}`);

chromeManifest.version = newVersion;
fs.writeFileSync(chromeManifestPath, JSON.stringify(chromeManifest, null, 4));

firefoxManifest.version = newVersion;
fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 4));

packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log(`✅ Version updated to ${newVersion} in manifest.chrome.json, manifest.firefox.json, and package.json`);
