const BROAD_ORIGINS = ['<all_urls>', '*://*/*', 'http://*/*', 'https://*/*'];

export function getDeclaredHostPermissions() {
    try {
        const manifest = chrome.runtime.getManifest();
        const origins = manifest?.host_permissions;
        return Array.isArray(origins) ? origins.filter(Boolean) : [];
    } catch {
        return [];
    }
}

function patternKey(pattern) {
    return String(pattern || '').replace(/\/\*+$/, '').replace(/\/$/, '');
}

function grantedCovers(grantedOrigins, needed) {
    if (grantedOrigins.some((origin) => BROAD_ORIGINS.includes(origin))) {
        return true;
    }
    const neededKey = patternKey(needed);
    return grantedOrigins.some((origin) => origin === needed || patternKey(origin) === neededKey);
}

/**
 * Host permissions listed in the Firefox manifest that are not granted yet.
 * Updates that add sites do not grant those hosts, so content scripts stay
 * inactive until the user approves them.
 */
export async function getMissingHostPermissions() {
    const declared = getDeclaredHostPermissions();
    if (!declared.length) {
        return [];
    }

    try {
        const granted = await chrome.permissions.getAll();
        const grantedOrigins = granted?.origins || [];
        return declared.filter((origin) => !grantedCovers(grantedOrigins, origin));
    } catch {
        return declared;
    }
}
