import { isFirefoxRuntime } from './isFirefox.js';

const ALL_URLS_PATTERNS = ['<all_urls>', '*://*/*', 'http://*/*', 'https://*/*'];

function originList(origins) {
    if (!origins) {
        return [];
    }
    return Array.isArray(origins) ? origins.filter(Boolean) : [origins];
}

function grantedHasAllUrls(grantedOrigins) {
    return (grantedOrigins || []).some((origin) => ALL_URLS_PATTERNS.includes(origin));
}

/**
 * True when the extension has broad host access.
 * Firefox's permissions.contains(specific origin) stays false even with <all_urls>.
 */
export async function hasAllUrlsPermission() {
    try {
        if (await chrome.permissions.contains({ origins: ['<all_urls>'] })) {
            return true;
        }
    } catch {
        // Firefox may not accept this pattern in contains()
    }

    try {
        if (await chrome.permissions.contains({ origins: ['*://*/*'] })) {
            return true;
        }
    } catch {
        // Ignore
    }

    try {
        const granted = await chrome.permissions.getAll();
        return grantedHasAllUrls(granted.origins);
    } catch {
        return false;
    }
}

/**
 * True when every requested origin is covered, including via <all_urls>.
 */
export async function hasHostPermission(origins) {
    const originsToCheck = originList(origins);
    if (!originsToCheck.length) {
        return false;
    }

    try {
        if (await chrome.permissions.contains({ origins: originsToCheck })) {
            return true;
        }
    } catch {
        // Fall through to all_urls / getAll()
    }

    if (await hasAllUrlsPermission()) {
        return true;
    }

    try {
        const granted = await chrome.permissions.getAll();
        const grantedOrigins = granted.origins || [];
        if (grantedHasAllUrls(grantedOrigins)) {
            return true;
        }
        return originsToCheck.every((needed) => grantedOrigins.includes(needed));
    } catch {
        return false;
    }
}

export function injectCurrentTabOnPopupOpen() {
    if (!isFirefoxRuntime()) {
        return;
    }
    chrome.runtime.sendMessage({
        action: 'activateCurrentTab',
        activateAllTabs: false
    }).catch(() => {});
}
