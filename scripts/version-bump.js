const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../public/manifest.json');
const firefoxManifestPath = path.join(__dirname, '../public/manifest.firefox.json');
const packagePath = path.join(__dirname, '../package.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const currentVersion = manifest.version;
console.log(`Current version: ${currentVersion}`);

const versionParts = currentVersion.split('.').map(Number);
versionParts[2] += 1;
const newVersion = versionParts.join('.');
console.log(`New version: ${newVersion}`);

manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));

firefoxManifest.version = newVersion;
fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 4));

packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log(`✅ Version updated to ${newVersion} in manifest.json, manifest.firefox.json, and package.json`);
