const INSTALLED_ATTR = 'data-ai-rtl-extension';
const PINNED_ATTR = 'data-ai-rtl-pinned';
const INSTALLED_EVENT = 'ai-rtl-extension-installed';

function isOwnWebsite() {
    const host = String(window.location.hostname || '').toLowerCase();
    const port = String(window.location.port || '');
    // Temporary: local website on port 3000
    if ((host === 'localhost' || host === '127.0.0.1') && port === '3000') {
        return true;
    }
    return /(^|\.)ai-rtl\.ir$/.test(host) || /(^|\.)chatgpt-rtl\.ir$/.test(host);
}

function getPinnedState() {
    return new Promise((resolve) => {
        if (!chrome?.runtime?.sendMessage) {
            resolve(false);
            return;
        }

        try {
            chrome.runtime.sendMessage({ action: 'getToolbarPinState' }, (response) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                    return;
                }
                resolve(response?.pinned === true);
            });
        } catch {
            resolve(false);
        }
    });
}

export async function markWebsitePresence() {
    if (!isOwnWebsite()) return;

    const pinned = await getPinnedState();
    const root = document.documentElement;
    const nextPinned = pinned ? 'true' : 'false';
    const changed =
        root.getAttribute(INSTALLED_ATTR) !== 'installed' ||
        root.getAttribute(PINNED_ATTR) !== nextPinned;

    root.setAttribute(INSTALLED_ATTR, 'installed');
    root.setAttribute(PINNED_ATTR, nextPinned);

    if (changed) {
        root.dispatchEvent(new CustomEvent(INSTALLED_EVENT, { bubbles: true }));
    }
}

if (isOwnWebsite()) {
    markWebsitePresence();
    setInterval(markWebsitePresence, 2000);
}
