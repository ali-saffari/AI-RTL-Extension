import { manualRtlState } from './state.js';
import { ensureHighlightStyle, removeHighlightStyle, applyStylesToImages, removeStylesFromImages } from './styles.js';
import { shouldEnableTextSelector } from './settings.js';
import { updateHighlightStyle, handleSelectionChange, updateElementHighlight } from './highlight.js';
import { hidePopupMenu, showMenuAfterSelection } from './menu.js';
import { EXTENSION_ENABLED_STORAGE_KEY, isExtensionEnabledValue } from '../constants/extensionEnabled.js';
import { removeDirectionChanges } from './direction.js';
import { handleManualLogoClick } from './logoTrigger.js';
import { updateMousePositionFromEvent, resetMousePosition } from './dom.js';

function clearManualDirections() {
    document.querySelectorAll('.rtl-manual-direction-element').forEach((element) => {
        removeDirectionChanges(element);
    });
}

function refreshTextSelector(settings) {
    chrome.storage.sync.get([EXTENSION_ENABLED_STORAGE_KEY], (result) => {
        if (!isExtensionEnabledValue(result[EXTENSION_ENABLED_STORAGE_KEY])) {
            clearManualDirections();
            cleanupTextSelector();
            return;
        }

        shouldEnableTextSelector((enabled) => {
            if (!enabled) {
                cleanupTextSelector();
            } else if (!manualRtlState.highlightStyle) {
                initTextSelectorInternal();
            } else if (settings) {
                updateHighlightStyle(settings);
            }
        });
    });
}

export function initTextSelector() {
    refreshTextSelector();

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync') {
            return;
        }
        if (!changes.manualRtlSettings && !changes[EXTENSION_ENABLED_STORAGE_KEY]) {
            return;
        }

        const newSettings = changes.manualRtlSettings?.newValue;
        if (newSettings) {
            manualRtlState.manualRtlSettings = newSettings;
        }

        refreshTextSelector(newSettings);
    });
}

function initTextSelectorInternal() {
    // Check if already initialized by checking for class on body
    if (document.body && document.body.classList.contains('rtl-manual-loaded')) {
        console.log('[RTL Text Selector] Already loaded (class exists on body), skipping...');
        return;
    }
    
    // Add class to body to mark as loaded
    if (document.body) {
        document.body.classList.add('rtl-manual-loaded');
    }
    
    ensureHighlightStyle();
    
    // Apply styles to existing images
    applyStylesToImages();
    
    // Set up MutationObserver to apply styles to dynamically added images
    if (!manualRtlState.imageObserver) {
        manualRtlState.imageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if the added node is an image
                            if (node.tagName === 'IMG') {
                                if (node.getAttribute('alt') === 'torobcheImage' || 
                                    (node.getAttribute('src') && node.getAttribute('src').startsWith('chrome-extension'))) {
                                    applyStylesToImages();
                                }
                            }
                            // Check for images inside the added node
                            const images = node.querySelectorAll?.('img[alt="torobcheImage"], img[src^="chrome-extension"]');
                            if (images && images.length > 0) {
                                applyStylesToImages();
                            }
                        }
                    });
                }
            });
        });
        
        manualRtlState.imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    chrome.storage.sync.get(['manualRtlSettings'], (result) => {
        const settings = result.manualRtlSettings;
        if (settings) {
            manualRtlState.manualRtlSettings = settings;
            updateHighlightStyle(settings);
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
    hidePopupMenu();
    removeHighlightStyle();
    removeHighlight();
    removeStylesFromImages();
    
    // Remove class from body when deactivated
    if (document.body) {
        document.body.classList.remove('rtl-manual-loaded');
    }
    
    // Disconnect image observer
    if (manualRtlState.imageObserver) {
        manualRtlState.imageObserver.disconnect();
        manualRtlState.imageObserver = null;
    }

    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('click', handleManualLogoClick, true);
}

