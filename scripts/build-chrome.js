const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');
const { assertChromeManifestUnchanged } = require('./check-chrome-manifest');
const {
    getChannelVersionInfo,
    bumpReleasePatch,
    bumpAlphaBuild,
    CHROME_MANIFEST_PATH,
} = require('./channel-version');

const distPath = path.join(__dirname, '../dist-chrome');

const args = process.argv.slice(2);
const channel = args.includes('--alpha') ? 'alpha' : 'release';
const outputPath = path.join(
    __dirname,
    channel === 'alpha' ? '../releases/chrome-alpha' : '../releases/chrome'
);
// Alpha zip bumps by default so each test package gets a new number.
// Release stays pinned unless --bump is passed.
const shouldBump =
    channel === 'alpha' ? !args.includes('--no-bump') : args.includes('--bump');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
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

async function main() {
    try {
        logStep('1', `Starting Chrome ${channel} build...`);

        logStep('1b', 'Checking Chrome manifest permissions against last store snapshot...');
        assertChromeManifestUnchanged();
        logSuccess('Chrome manifest permission check passed');

        if (shouldBump) {
            logStep('2', `Bumping ${channel} version...`);
            if (channel === 'alpha') {
                const info = bumpAlphaBuild();
                log(`Alpha version: ${info.versionName}`, 'cyan');
            } else {
                const newVersion = bumpReleasePatch();
                log(`Release version: ${newVersion}`, 'cyan');
            }
        } else {
            logStep('2', 'Using current version (no bump; pass --bump to increment)...');
        }

        const info = getChannelVersionInfo(channel);
        const sourceManifest = JSON.parse(fs.readFileSync(CHROME_MANIFEST_PATH, 'utf8'));
        log(`Source release version: ${sourceManifest.version}`, 'cyan');
        log(`Build channel: ${info.channel}`, 'cyan');
        log(`Output version: ${info.version}${info.channel === 'alpha' ? ` (${info.versionName})` : ''}`, 'cyan');

        logStep('3', 'Cleaning dist-chrome directory...');
        if (fs.existsSync(distPath)) {
            fs.rmSync(distPath, { recursive: true, force: true });
            logSuccess('Dist directory cleaned');
        }

        logStep('4', 'Building project...');
        const npmScript = channel === 'alpha' ? 'build:chrome:alpha' : 'build:chrome';
        try {
            execSync(`npm run ${npmScript}`, {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..'),
                env: { ...process.env, BUILD_CHANNEL: channel },
            });
            logSuccess('Build completed successfully');
        } catch (error) {
            logError('Build failed');
            throw error;
        }

        logStep('5', 'Creating zip file...');
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
            logSuccess(`Created ${path.relative(path.join(__dirname, '..'), outputPath)} directory`);
        }

        const zipFileName = `chrome-extension-v${info.zipTag}.zip`;
        const zipFilePath = path.join(outputPath, zipFileName);

        if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
        }

        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                logSuccess(`Zip file created: ${zipFileName}`);
                log(`File size: ${archive.pointer()} bytes`, 'cyan');
                log(`\n${colors.bright}${colors.green}Build completed successfully!${colors.reset}`);
                log(`Output file: ${zipFilePath}`, 'cyan');
                resolve();
            });

            archive.on('error', (err) => {
                logError(`Archive error: ${err.message}`);
                reject(err);
            });

            archive.pipe(output);
            archive.directory(distPath, false);
            archive.finalize();
        });
    } catch (error) {
        logError(`Build process failed: ${error.message}`);
        process.exit(1);
    }
}

main().catch((error) => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});
