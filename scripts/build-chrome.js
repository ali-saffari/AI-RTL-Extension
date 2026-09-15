const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');
const { assertChromeManifestUnchanged } = require('./check-chrome-manifest');

// Paths
const chromeManifestPath = path.join(__dirname, '../public/manifest.chrome.json');
const firefoxManifestPath = path.join(__dirname, '../public/manifest.firefox.json');
const packagePath = path.join(__dirname, '../package.json');
const distPath = path.join(__dirname, '../dist-chrome');
const outputPath = path.join(__dirname, '../releases/chrome');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
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

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

async function main() {
    try {
        logStep('1', 'Starting build process...');

        logStep('1b', 'Checking Chrome manifest permissions against last store snapshot...');
        assertChromeManifestUnchanged();
        logSuccess('Chrome manifest permission check passed');
        
        // Step 1: Read current version
        logStep('2', 'Reading current version...');
        const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const currentVersion = chromeManifest.version;
        log(`Current version: ${currentVersion}`, 'cyan');
        
        // Step 2: Increment version
        logStep('3', 'Incrementing version...');
        const versionParts = currentVersion.split('.').map(Number);
        versionParts[2] += 1; // Increment patch version
        const newVersion = versionParts.join('.');
        
        log(`New version: ${newVersion}`, 'cyan');
        
        // Update manifest.chrome.json
        chromeManifest.version = newVersion;
        fs.writeFileSync(chromeManifestPath, JSON.stringify(chromeManifest, null, 4));

        // Keep Firefox manifest version in sync (Chrome release does not build Firefox)
        if (fs.existsSync(firefoxManifestPath)) {
            const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
            firefoxManifest.version = newVersion;
            fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 4));
        }
        
        // Update package.json
        packageJson.version = newVersion;
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        
        logSuccess(`Version updated to ${newVersion} in Chrome/Firefox manifests and package.json`);
        
        // Step 3: Clean dist-chrome directory
        logStep('4', 'Cleaning dist-chrome directory...');
        if (fs.existsSync(distPath)) {
            fs.rmSync(distPath, { recursive: true, force: true });
            logSuccess('Dist directory cleaned');
        }
        
        // Step 4: Build project
        logStep('5', 'Building project...');
        log('Running webpack build...', 'yellow');
        
        try {
            execSync('npm run build:chrome', { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            logSuccess('Build completed successfully');
        } catch (error) {
            logError('Build failed');
            throw error;
        }
        
        // Step 5: Create zip file
        logStep('6', 'Creating zip file...');
        
        // Ensure output directory exists
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
            logSuccess('Created releases/chrome directory');
        }
        
        const zipFileName = `chrome-extension-v${newVersion}.zip`;
        const zipFilePath = path.join(outputPath, zipFileName);
        
        // Remove existing zip file if it exists
        if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
        }
        
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });
        
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                logSuccess(`Zip file created: ${zipFileName}`);
                log(`File size: ${archive.pointer()} bytes`, 'cyan');
                log(`\n${colors.bright}${colors.green}🎉 Build process completed successfully!${colors.reset}`);
                log(`📦 Output file: ${zipFilePath}`, 'cyan');
                resolve();
            });
            
            archive.on('error', (err) => {
                logError(`Archive error: ${err.message}`);
                reject(err);
            });
            
            archive.pipe(output);
            
            // Add all files from dist directory
            archive.directory(distPath, false);
            
            // Finalize the archive
            archive.finalize();
        });
        
    } catch (error) {
        logError(`Build process failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the build process
main().catch((error) => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});
