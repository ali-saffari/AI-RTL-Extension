const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootPath = path.join(__dirname, '..');
const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8')
);
const version = packageJson.version;
const folderName = `ai-rtl-${version}`;
const outputDir = path.join(rootPath, '..');
const zipPath = path.join(outputDir, `${folderName}.zip`);

/** Top-level names to skip entirely */
const EXCLUDE_DIRS = new Set([
    '.git',
    '.idea',
    '.vscode',
    '.cache',
    '.parcel-cache',
    '.nyc_output',
    'node_modules',
    'dist',
    'dist-firefox',
    'releases',
    'addons-linter',
    'bench',
    'coverage',
    'tmp',
    'temp',
    'logs'
]);

/** Exact top-level file names to skip */
const EXCLUDE_FILES = new Set([
    '.cursorrules',
    '.DS_Store',
    'Thumbs.db',
    'Desktop.ini',
    'tofo',
    'readme',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local'
]);

function shouldExclude(relPath, isDirectory) {
    const parts = relPath.split(/[/\\]/).filter(Boolean);
    if (!parts.length) return false;

    const top = parts[0];
    if (EXCLUDE_DIRS.has(top)) return true;
    if (parts.length === 1 && !isDirectory && EXCLUDE_FILES.has(top)) return true;

    const base = parts[parts.length - 1];
    if (base.endsWith('.zip') || base.endsWith('.tgz') || base.endsWith('.log')) return true;
    if (base === '.DS_Store' || base === 'Thumbs.db') return true;
    if (base.startsWith('.env')) return true;

    return false;
}

function addDirectory(archive, dir, archivePrefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        const relFromRoot = path.relative(rootPath, fullPath);
        const archivePath = path.posix.join(
            archivePrefix,
            relFromRoot.split(path.sep).join('/')
        );

        if (shouldExclude(relFromRoot, entry.isDirectory())) {
            continue;
        }

        if (entry.isDirectory()) {
            addDirectory(archive, fullPath, archivePrefix);
        } else if (entry.isFile()) {
            archive.file(fullPath, { name: archivePath });
        }
    }
}

function main() {
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
        console.log(`Source zip created: ${zipPath}`);
        console.log(`Size: ${sizeMb} MB`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    addDirectory(archive, rootPath, folderName);
    archive.finalize();
}

main();
