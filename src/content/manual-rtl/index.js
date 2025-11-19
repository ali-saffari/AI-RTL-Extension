import { manualRtlState } from './state.js';
import { ensureHighlightStyle, removeHighlightStyle } from './styles.js';
import { shouldEnableTextSelector } from './settings.js';
import { updateHighlightStyle, handleSelectionChange, updateElementHighlight } from './highlight.js';
import { showMenuAfterSelection } from './menu.js';
import { handleManualLogoClick } from './logoTrigger.js';
import { updateMousePositionFromEvent, resetMousePosition } from './dom.js';

export function initTextSelector() {
    shouldEnableTextSelector((enabled) => {
        if (!enabled) {
            console.log('[RTL Text Selector] Disabled based on settings');
            return;
        }

        initTextSelectorInternal();
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.textSelectorSettings) {
            if (changes.textSelectorSettings.newValue) {
                manualRtlState.textSelectorSettings = changes.textSelectorSettings.newValue;
                updateHighlightStyle(changes.textSelectorSettings.newValue);
            }

            shouldEnableTextSelector((enabled) => {
                if (!enabled) {
                    cleanupTextSelector();
                } else if (!manualRtlState.highlightStyle) {
                    initTextSelectorInternal();
                }
            });
        }
    });
}

function initTextSelectorInternal() {
    ensureHighlightStyle();

    chrome.storage.sync.get(['textSelectorSettings'], (result) => {
        if (result.textSelectorSettings) {
            manualRtlState.textSelectorSettings = result.textSelectorSettings;
            updateHighlightStyle(result.textSelectorSettings);
        }
    });

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', handleManualLogoClick, true);
}

function onMouseUp(event) {
    updateMousePositionFromEvent(event);

    setTimeout(() => {
        if (!manualRtlState.isMenuOpen) {
            showMenuAfterSelection();
        }
    }, 100);
}

function onKeyUp() {
    resetMousePosition();

    if (!manualRtlState.isMenuOpen) {
        setTimeout(() => {
            showMenuAfterSelection();
        }, 50);
    }
}

export function removeHighlight() {
    updateElementHighlight(null, false);
}

export function cleanupTextSelector() {
    removeHighlightStyle();
    removeHighlight();

    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('click', handleManualLogoClick, true);
}

