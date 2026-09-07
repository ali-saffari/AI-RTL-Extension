/**
 * Live RTL settings shared by locked editors, advanced walk, and applyRtl.
 * This module must stay a leaf (no imports from lockedEditor / codeBlocks / arrows).
 */

import { detectTextDirection, isCode } from '../analyzeDirection.js';

const DEFAULT_MIXED_TITLE_DISPLAY_MODE = 'unified';
let mixedTitleDisplayModeCache = DEFAULT_MIXED_TITLE_DISPLAY_MODE;
let activeRtlAlgorithmCache = 'advanced_full';
let applyAlgorithmToCodeCache = false;

export function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

export function isInvalidatedError(error) {
    const message = error?.message || String(error || '');
    return message.includes('Extension context invalidated') || !isExtensionContextValid();
}

export function setMixedTitleDisplayMode(mode) {
    mixedTitleDisplayModeCache = mode || DEFAULT_MIXED_TITLE_DISPLAY_MODE;
}

export function getMixedTitleDisplayMode() {
    return mixedTitleDisplayModeCache || DEFAULT_MIXED_TITLE_DISPLAY_MODE;
}

export function setActiveRtlAlgorithm(mode) {
    activeRtlAlgorithmCache = mode || 'advanced_full';
}

export function getActiveRtlAlgorithm() {
    return activeRtlAlgorithmCache || 'advanced_full';
}

export function resolveRtlAlgorithm(passed) {
    return activeRtlAlgorithmCache || passed || 'advanced_full';
}

export function setApplyAlgorithmToCodeEnabled(enabled) {
    applyAlgorithmToCodeCache = enabled === true;
}

export function isApplyAlgorithmToCodeEnabled() {
    return applyAlgorithmToCodeCache === true;
}

export function shouldApplyRtlToCodeBlock(text) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return false;
    }
    if (isCode(text)) {
        return false;
    }
    return detectTextDirection(text) === 'rtl';
}
