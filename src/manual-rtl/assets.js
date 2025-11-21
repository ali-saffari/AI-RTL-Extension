import { imagePath, extensionIconPath } from '../content/utils/constants.js';
import { manualRtlState } from './state.js';

function getRuntimeUrl(path) {
    try {
        // Try chrome.runtime first (Chrome/Edge)
        if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
            return chrome.runtime.getURL(path);
        }
        // Try browser.runtime (Firefox)
        if (typeof browser !== 'undefined' && browser.runtime && typeof browser.runtime.getURL === 'function') {
            return browser.runtime.getURL(path);
        }
        console.error('[Manual RTL] No runtime API available');
        return '';
    } catch (error) {
        console.error('[Manual RTL] Error getting runtime URL:', error);
        return '';
    }
}

export function getManualLogoUrl() {
    if (manualRtlState.cachedLogoUrl) {
        return manualRtlState.cachedLogoUrl;
    }
    const url = getRuntimeUrl(imagePath);
    manualRtlState.cachedLogoUrl = url;
    if (!url) {
        console.error('[Manual RTL] Failed to get manual logo URL for:', imagePath);
    }
    return manualRtlState.cachedLogoUrl;
}

export function getExtensionLogoUrl() {
    if (manualRtlState.cachedExtensionLogoUrl) {
        return manualRtlState.cachedExtensionLogoUrl;
    }
    const url = getRuntimeUrl(extensionIconPath);
    manualRtlState.cachedExtensionLogoUrl = url;
    if (!url) {
        console.error('[Manual RTL] Failed to get extension logo URL for:', extensionIconPath);
    }
    return manualRtlState.cachedExtensionLogoUrl;
}

