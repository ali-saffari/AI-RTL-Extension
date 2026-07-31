const { buildFirefoxDist } = require('./build-firefox');
const { execSync } = require('child_process');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const distFirefoxPath = path.join(rootPath, 'dist-firefox');

try {
    buildFirefoxDist();
    console.log('\nLaunching Firefox with web-ext run...\n');
    execSync(
        `npx web-ext run --source-dir "${distFirefoxPath}" --devtools`,
        { stdio: 'inherit', cwd: rootPath }
    );
} catch (error) {
    console.error(`Firefox run failed: ${error.message}`);
    process.exit(1);
}
