const {
    getChannelVersionInfo,
    bumpReleasePatch,
    bumpAlphaBuild,
    getReleaseVersion,
    getAlphaBuild,
} = require('./channel-version');

const mode = (process.argv[2] || 'release').toLowerCase();

if (mode === 'alpha') {
    const before = getAlphaBuild();
    const info = bumpAlphaBuild();
    console.log(`Release base: ${getReleaseVersion()}`);
    console.log(`Alpha build: ${before} -> ${info.alphaBuild}`);
    console.log(`Alpha version: ${info.version} (${info.versionName})`);
    console.log('Source manifests stay on the release version; alpha is applied at build time.');
    process.exit(0);
}

if (mode === 'release' || mode === 'patch') {
    const before = getReleaseVersion();
    const after = bumpReleasePatch();
    console.log(`Release version: ${before} -> ${after}`);
    console.log(`Current alpha would be: ${getChannelVersionInfo('alpha').versionName}`);
    process.exit(0);
}

console.error('Usage: node scripts/version-bump.js [release|alpha]');
process.exit(1);
