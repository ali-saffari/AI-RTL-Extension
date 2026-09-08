const fs = require('fs');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const privateDir = path.join(rootPath, 'private');
const iranyekanDir = path.join(privateDir, 'fonts', 'iranyekan');

function copyCursorrules() {
    const src = path.join(privateDir, '.cursorrules');
    const dest = path.join(rootPath, '.cursorrules');
    if (!fs.existsSync(src)) {
        return;
    }
    fs.copyFileSync(src, dest);
}

function iranyekanFontPattern(to) {
    return {
        from: iranyekanDir,
        to,
        noErrorOnMissing: true,
    };
}

function warnIfIranYekanMissing() {
    const hasFonts =
        fs.existsSync(iranyekanDir) &&
        fs.readdirSync(iranyekanDir).some((name) => name.toLowerCase().endsWith('.woff'));
    if (!hasFonts) {
        console.warn(
            'IranYekan .woff files not found in private/fonts/iranyekan; continuing without them.'
        );
    }
}

copyCursorrules();
warnIfIranYekanMissing();

module.exports = {
    copyCursorrules,
    iranyekanFontPattern,
    iranyekanDir,
};
