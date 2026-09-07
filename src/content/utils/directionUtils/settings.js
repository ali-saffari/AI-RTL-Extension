/**
 * Live RTL settings shared by locked editors, advanced walk, and applyRtl.
 */

import { restoreFlippedArrowsInPage } from './arrows.js';
import { resetCodeMirrorDirectionStyles } from './codeBlocks.js';
import { resetLockedEditorCaches, syncLockedEditorSettings } from './lockedEditor.js';

const DEFAULT_MIXED_TITLE_DISPLAY_MODE = 'unified';
let mixedTitleDisplayModeCache = DEFAULT_MIXED_TITLE_DISPLAY_MODE;
let activeRtlAlgorithmCache = 'advanced_full';

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
    syncLockedEditorSettings({ mixedTitleDisplayMode: mixedTitleDisplayModeCache });
}

export function getMixedTitleDisplayMode() {
    return mixedTitleDisplayModeCache || DEFAULT_MIXED_TITLE_DISPLAY_MODE;
}

export function setActiveRtlAlgorithm(mode) {
    activeRtlAlgorithmCache = mode || 'advanced_full';
    syncLockedEditorSettings({ activeRtlAlgorithm: activeRtlAlgorithmCache });
}

export function getActiveRtlAlgorithm() {
    return activeRtlAlgorithmCache || 'advanced_full';
}

export function resolveRtlAlgorithm(passed) {
    return activeRtlAlgorithmCache || passed || 'advanced_full';
}

export function resetRtlDomCaches() {
    resetLockedEditorCaches();
    restoreFlippedArrowsInPage();
    resetCodeMirrorDirectionStyles();
}
