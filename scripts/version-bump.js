const fs = require('fs');
const path = require('path');

// Paths to manifest files
const manifestPath = path.join(__dirname, '../public/manifest.json');
const packagePath = path.join(__dirname, '../package.json');

// Read and parse manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Get current version
const currentVersion = manifest.version;
console.log(`Current version: ${currentVersion}`);

// Parse version (e.g., "3.0.0" -> [3, 0, 0])
const versionParts = currentVersion.split('.').map(Number);

// Increment patch version (last number)
versionParts[2] += 1;

// Create new version
const newVersion = versionParts.join('.');
console.log(`New version: ${newVersion}`);

// Update manifest.json
manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log(`✅ Version updated to ${newVersion} in both manifest.json and package.json`);
