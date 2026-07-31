/**
 * Shared Firefox detection (background, content, popup, options).
 */
export function isFirefoxRuntime() {
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL('').startsWith('moz-extension:');
        }
    } catch (e) {
        // ignore
    }
    return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
}
