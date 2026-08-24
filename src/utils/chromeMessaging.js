/**
 * Chrome logs "Unchecked runtime.lastError: Could not establish connection.
 * Receiving end does not exist." when sendMessage has no listener and
 * lastError is not read in a callback. Promise .catch() does not suppress it.
 */

export function consumeLastError() {
    const lastError = chrome.runtime?.lastError;
    return lastError ? (lastError.message || 'Unknown error') : null;
}

export function sendTabMessage(tabId, message) {
    return new Promise((resolve) => {
        if (!tabId || !chrome?.tabs?.sendMessage) {
            resolve(undefined);
            return;
        }

        try {
            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (consumeLastError()) {
                    resolve(undefined);
                    return;
                }
                resolve(response);
            });
        } catch {
            resolve(undefined);
        }
    });
}

export function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
        if (!chrome?.runtime?.sendMessage) {
            resolve(undefined);
            return;
        }

        try {
            chrome.runtime.sendMessage(message, (response) => {
                if (consumeLastError()) {
                    resolve(undefined);
                    return;
                }
                resolve(response);
            });
        } catch {
            resolve(undefined);
        }
    });
}

export async function hasExtensionPageListeners() {
    try {
        if (typeof chrome.runtime?.getContexts === 'function') {
            const contexts = await chrome.runtime.getContexts({
                contextTypes: ['POPUP', 'TAB', 'SIDE_PANEL']
            });
            return Array.isArray(contexts) && contexts.length > 0;
        }
    } catch {
        // Older Chrome/Firefox builds
    }
    return true;
}
