const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PACKAGE_PATH = path.join(ROOT, 'package.json');
const CHROME_MANIFEST_PATH = path.join(ROOT, 'public/manifest.chrome.json');
const FIREFOX_MANIFEST_PATH = path.join(ROOT, 'public/manifest.firefox.json');

function readPackage() {
    return JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
}

function writePackage(pkg) {
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n');
}

function getChannel() {
    const raw = (process.env.BUILD_CHANNEL || 'release').toLowerCase();
    return raw === 'alpha' ? 'alpha' : 'release';
}

function getReleaseVersion(pkg = readPackage()) {
    return pkg.version;
}

function getAlphaBuild(pkg = readPackage()) {
    const n = Number(pkg.alphaBuild);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** Chrome/Firefox store version must be 1–4 integer parts. */
function getChannelVersionInfo(channel = getChannel(), pkg = readPackage()) {
    const release = getReleaseVersion(pkg);
    if (channel !== 'alpha') {
        return {
            channel: 'release',
            version: release,
            versionName: release,
            alphaBuild: null,
            zipTag: release,
        };
    }

    const alphaBuild = getAlphaBuild(pkg);
    return {
        channel: 'alpha',
        version: `${release}.${alphaBuild}`,
        versionName: `${release}-alpha.${alphaBuild}`,
        alphaBuild,
        zipTag: `${release}-alpha.${alphaBuild}`,
    };
}

function applyChannelToManifest(manifest, channel = getChannel(), pkg = readPackage()) {
    const info = getChannelVersionInfo(channel, pkg);
    const next = { ...manifest, version: info.version };

    if (info.channel === 'alpha') {
        next.version_name = info.versionName;
        next.name = 'AI RTL (Alpha)';
        next.short_name = 'AI RTL α';
    } else {
        delete next.version_name;
    }

    return { manifest: next, info };
}

function syncReleaseVersionFiles(newVersion) {
    const chromeManifest = JSON.parse(fs.readFileSync(CHROME_MANIFEST_PATH, 'utf8'));
    chromeManifest.version = newVersion;
    delete chromeManifest.version_name;
    fs.writeFileSync(CHROME_MANIFEST_PATH, JSON.stringify(chromeManifest, null, 4) + '\n');

    if (fs.existsSync(FIREFOX_MANIFEST_PATH)) {
        const firefoxManifest = JSON.parse(fs.readFileSync(FIREFOX_MANIFEST_PATH, 'utf8'));
        firefoxManifest.version = newVersion;
        delete firefoxManifest.version_name;
        fs.writeFileSync(FIREFOX_MANIFEST_PATH, JSON.stringify(firefoxManifest, null, 4) + '\n');
    }

    const pkg = readPackage();
    pkg.version = newVersion;
    writePackage(pkg);
}

function bumpReleasePatch() {
    const pkg = readPackage();
    const parts = getReleaseVersion(pkg).split('.').map(Number);
    if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) {
        throw new Error(`Invalid release version: ${pkg.version}`);
    }
    parts[2] += 1;
    const newVersion = parts.join('.');
    syncReleaseVersionFiles(newVersion);
    return newVersion;
}

function bumpAlphaBuild() {
    const pkg = readPackage();
    const next = getAlphaBuild(pkg) + 1;
    pkg.alphaBuild = next;
    writePackage(pkg);
    return getChannelVersionInfo('alpha', pkg);
}

module.exports = {
    PACKAGE_PATH,
    CHROME_MANIFEST_PATH,
    FIREFOX_MANIFEST_PATH,
    getChannel,
    getReleaseVersion,
    getAlphaBuild,
    getChannelVersionInfo,
    applyChannelToManifest,
    syncReleaseVersionFiles,
    bumpReleasePatch,
    bumpAlphaBuild,
    readPackage,
};
