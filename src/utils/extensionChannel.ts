type ManifestWithVersionName = chrome.runtime.Manifest & {
    version_name?: string;
};

export function getExtensionChannelInfo() {
    const manifest = chrome.runtime.getManifest() as ManifestWithVersionName;
    const versionName = typeof manifest.version_name === 'string' ? manifest.version_name.trim() : '';
    const isAlpha =
        /-alpha\./i.test(versionName) ||
        /\(Alpha\)/i.test(manifest.name || '') ||
        /α/i.test(manifest.short_name || '');

    return {
        isAlpha,
        version: manifest.version,
        displayVersion: versionName || manifest.version,
        name: manifest.name || 'AI RTL',
    };
}
