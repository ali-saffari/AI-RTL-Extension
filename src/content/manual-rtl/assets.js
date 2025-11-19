import { imagePath, extensionIconPath } from '../utils/constants.js';
import { manualRtlState } from './state.js';

export function getManualLogoUrl() {
    if (manualRtlState.cachedLogoUrl) {
        return manualRtlState.cachedLogoUrl;
    }
    try {
        manualRtlState.cachedLogoUrl = chrome.runtime?.id
            ? chrome.runtime.getURL(imagePath)
            : imagePath;
    } catch (error) {
        manualRtlState.cachedLogoUrl = imagePath;
    }
    return manualRtlState.cachedLogoUrl;
}

export function getExtensionLogoUrl() {
    if (manualRtlState.cachedExtensionLogoUrl) {
        return manualRtlState.cachedExtensionLogoUrl;
    }
    try {
        manualRtlState.cachedExtensionLogoUrl = chrome.runtime?.id
            ? chrome.runtime.getURL(extensionIconPath)
            : extensionIconPath;
    } catch (error) {
        manualRtlState.cachedExtensionLogoUrl = extensionIconPath;
    }
    return manualRtlState.cachedExtensionLogoUrl;
}

