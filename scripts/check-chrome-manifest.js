const fs = require('fs');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const projectManifestPath = path.join(rootPath, 'public/manifest.chrome.json');
const releasedManifestPath = path.join(rootPath, 'private/chrome/manifest.json');

/**
 * Fields that affect Chrome Web Store review / update permission prompts.
 * version, name, description, icons, and content_scripts.matches are ignored
 * so site additions and version bumps do not fail the build.
 */
const SENSITIVE_KEYS = [
    'manifest_version',
    'permissions',
    'optional_permissions',
    'host_permissions',
    'optional_host_permissions',
    'content_security_policy',
    'externally_connectable',
    'declarative_net_request',
    'chrome_url_overrides',
    'chrome_settings_overrides',
    'oauth2',
    'incognito',
    'sandbox',
];

const STRING_ARRAY_KEYS = new Set([
    'permissions',
    'optional_permissions',
    'host_permissions',
    'optional_host_permissions',
]);

function normalizeValue(key, value) {
    if (value === undefined) {
        return undefined;
    }
    if (STRING_ARRAY_KEYS.has(key)) {
        if (!Array.isArray(value)) {
            return value;
        }
        return [...new Set(value)].sort();
    }
    return value;
}

function valuesEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function formatValue(value) {
    if (value === undefined) {
        return '(missing)';
    }
    return JSON.stringify(value, null, 2);
}

function collectSensitiveDiffs(released, project) {
    const diffs = [];
    const keys = new Set([...SENSITIVE_KEYS, ...Object.keys(released), ...Object.keys(project)]);

    for (const key of SENSITIVE_KEYS) {
        if (!keys.has(key) && released[key] === undefined && project[key] === undefined) {
            continue;
        }
        const releasedValue = normalizeValue(key, released[key]);
        const projectValue = normalizeValue(key, project[key]);
        if (!valuesEqual(releasedValue, projectValue)) {
            diffs.push({ key, releasedValue, projectValue });
        }
    }

    return diffs;
}

function assertChromeManifestUnchanged() {
    if (!fs.existsSync(releasedManifestPath)) {
        throw new Error(
            `Chrome permission baseline is missing:\n  ${releasedManifestPath}\n` +
            'Copy the last uploaded Chrome Web Store manifest.json there (do this yourself, not via AI).'
        );
    }

    if (!fs.existsSync(projectManifestPath)) {
        throw new Error(`Project Chrome manifest is missing:\n  ${projectManifestPath}`);
    }

    const released = JSON.parse(fs.readFileSync(releasedManifestPath, 'utf8'));
    const project = JSON.parse(fs.readFileSync(projectManifestPath, 'utf8'));
    const diffs = collectSensitiveDiffs(released, project);

    if (diffs.length === 0) {
        return;
    }

    const details = diffs.map(({ key, releasedValue, projectValue }) => (
        `  • ${key}\n` +
        `      released: ${formatValue(releasedValue).replace(/\n/g, '\n      ')}\n` +
        `      project:  ${formatValue(projectValue).replace(/\n/g, '\n      ')}`
    )).join('\n');

    throw new Error(
        'Chrome manifest permission check failed.\n' +
        'Sensitive fields in public/manifest.chrome.json differ from the last uploaded store snapshot.\n' +
        `Baseline: ${releasedManifestPath}\n` +
        `Project:  ${projectManifestPath}\n\n` +
        `${details}\n\n` +
        'If this change is intentional, update private/chrome/manifest.json yourself after you accept the store permission change.\n' +
        'Do not ask the AI to edit that baseline file.'
    );
}

if (require.main === module) {
    try {
        assertChromeManifestUnchanged();
        console.log('✅ Chrome manifest permission check passed (matches private/chrome/manifest.json)');
    } catch (error) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
    }
}

module.exports = {
    assertChromeManifestUnchanged,
    SENSITIVE_KEYS,
    releasedManifestPath,
    projectManifestPath,
};
