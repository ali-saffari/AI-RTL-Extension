const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootPath = path.join(__dirname, '..');
const distFirefoxPath = path.join(rootPath, 'dist-firefox');
const firefoxManifestPath = path.join(rootPath, 'public/manifest.firefox.json');
const outputPath = path.join(rootPath, 'releases/firefox');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${colors.bright}${colors.blue}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function removeSourceMaps(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            removeSourceMaps(fullPath);
        } else if (entry.name.endsWith('.map')) {
            fs.unlinkSync(fullPath);
        }
    }
}

/**
 * Build Firefox extension into dist-firefox/ (separate from Chrome dist-chrome/).
 * Returns the extension version string.
 */
function buildFirefoxDist({ watch = false } = {}) {
    logStep('1', 'Building Firefox extension (separate webpack config)...');

    if (fs.existsSync(distFirefoxPath)) {
        fs.rmSync(distFirefoxPath, { recursive: true, force: true });
    }

    const watchFlag = watch ? ' --watch' : '';
    execSync(
        `cross-env NODE_ENV=production webpack --config webpack.config.firefox.js${watchFlag}`,
        { stdio: 'inherit', cwd: rootPath }
    );
    logSuccess('Firefox webpack build completed → dist-firefox/');

    logStep('2', 'Removing source maps (if any)...');
    removeSourceMaps(distFirefoxPath);
    logSuccess('Source maps cleaned');

    const builtManifest = JSON.parse(
        fs.readFileSync(path.join(distFirefoxPath, 'manifest.json'), 'utf8')
    );
    return builtManifest.version;
}

function main() {
    try {
        const sourceManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
        log(`Firefox source manifest: v${sourceManifest.version}`, 'cyan');

        const version = buildFirefoxDist();

        logStep('3', 'Packaging with web-ext...');
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const zipFileName = `firefox-extension-v${version}.zip`;
        execSync(
            [
                'npx web-ext build',
                `--source-dir "${distFirefoxPath}"`,
                `--artifacts-dir "${outputPath}"`,
                `--filename "${zipFileName}"`,
                '--overwrite-dest'
            ].join(' '),
            { stdio: 'inherit', cwd: rootPath }
        );

        const zipFilePath = path.join(outputPath, zipFileName);
        const size = fs.existsSync(zipFilePath) ? fs.statSync(zipFilePath).size : 0;

        logSuccess(`Zip file created: ${zipFileName}`);
        if (size) {
            log(`File size: ${size} bytes`, 'cyan');
        }
        log(`\n${colors.bright}${colors.green}Firefox build completed successfully!${colors.reset}`);
        log(`Output dir: ${distFirefoxPath}`, 'cyan');
        log(`Zip: ${zipFilePath}`, 'cyan');
        log(`Chrome dist-chrome/ was not touched.`, 'yellow');
        log(`Run temporary: npm run firefox`, 'yellow');
    } catch (error) {
        logError(`Firefox build failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { buildFirefoxDist };
