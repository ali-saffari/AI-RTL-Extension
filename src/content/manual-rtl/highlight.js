import { manualRtlState } from './state.js';
import { refreshLogoDisplayOnManualElements, applyLogoDisplayToElement } from './logo.js';
import { getManualLogoUrl } from './assets.js';
import { findBestContainer } from './dom.js';

export function updateHighlightStyle(settings) {
    if (!settings) {
        return;
    }

    // به‌روزرسانی تنظیمات در state
    manualRtlState.manualRtlSettings = settings;

    const highlightColor = settings.highlightColor || '#ff0000';
    const highlightOpacity = typeof settings.highlightOpacity === 'number'
        ? Math.min(Math.max(settings.highlightOpacity, 0), 1)
        : 1;

    const r = parseInt(highlightColor.slice(1, 3), 16);
    const g = parseInt(highlightColor.slice(3, 5), 16);
    const b = parseInt(highlightColor.slice(5, 7), 16);

    const outlineAlpha = highlightOpacity;
    const backgroundAlpha = outlineAlpha >= 0.99 ? 0.4 : outlineAlpha * 0.4;
    const outlineColor = `rgba(${r}, ${g}, ${b}, ${outlineAlpha})`;
    const backgroundColor = `rgba(${r}, ${g}, ${b}, ${backgroundAlpha})`;

    document.documentElement.style.setProperty('--rtl-highlight-color', outlineColor);
    document.documentElement.style.setProperty('--rtl-highlight-bg', backgroundColor);

    const logoUrl = getManualLogoUrl();
    if (logoUrl) {
        document.documentElement.style.setProperty('--rtl-manual-logo-image', `url("${logoUrl}")`);
    }
    
    // به‌روزرسانی logo display برای تمام element های موجود
    refreshLogoDisplayOnManualElements();
}

export function updateElementHighlight(element, shouldHighlight) {
    if (shouldHighlight) {
        if (!element) {
            return;
        }

        if (manualRtlState.currentHighlightedElement && manualRtlState.currentHighlightedElement !== element) {
            manualRtlState.currentHighlightedElement.classList.remove('rtl-selected-element');
        }

        element.classList.add('rtl-selected-element');
        manualRtlState.currentHighlightedElement = element;
        return;
    }

    if (manualRtlState.currentHighlightedElement) {
        manualRtlState.currentHighlightedElement.classList.remove('rtl-selected-element');
        manualRtlState.currentHighlightedElement = null;
    }
}

export function handleSelectionChange() {
    if (!manualRtlState.manualRtlSettings || !manualRtlState.manualRtlSettings.manualRtlEnabled) {
        return;
    }

    if (manualRtlState.manualRtlSettings.highlightMode === 'disabled') {
        return;
    }

    if (manualRtlState.isMenuOpen) {
        return;
    }

    const selection = window.getSelection();
    updateElementHighlight(null, false);

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    let element = commonAncestor.nodeType === Node.TEXT_NODE
        ? commonAncestor.parentElement
        : commonAncestor;

    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        element = element?.parentElement || document.body;
    }

    element = findBestContainer(element);

    if (!element || element === document.body || element === document.documentElement) {
        return;
    }

    if (manualRtlState.manualRtlSettings.highlightMode === 'on_selection') {
        updateElementHighlight(element, true);
        // اعمال لوگو روی element انتخاب شده
        applyLogoDisplayToElement(element);
    }

    try {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {
        // ignore
    }
}

