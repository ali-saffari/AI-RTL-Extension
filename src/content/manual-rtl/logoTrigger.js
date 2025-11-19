import { manualRtlState } from './state.js';
import { LOGO_ICON_OFFSET } from './constants.js';
import { isLogoAreaClick } from './logo.js';
import { createRangeForElement } from './dom.js';
import { handleMenuDisplayForElement } from './menu.js';

export function handleManualLogoClick(event) {
    if (!manualRtlState.textSelectorSettings || !manualRtlState.textSelectorSettings.manualRtlEnabled) {
        return;
    }

    const logoDisplay = manualRtlState.textSelectorSettings.logoDisplay || 'always';
    if (logoDisplay === 'disabled') {
        return;
    }

    if (manualRtlState.popupMenu && manualRtlState.popupMenu.contains(event.target)) {
        return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
        return;
    }

    let manualElement = null;
    if (target instanceof Element) {
        manualElement = target.closest('.rtl-manual-direction-element');
    } else if (target.parentElement) {
        manualElement = target.parentElement.closest('.rtl-manual-direction-element');
    }

    if (!manualElement || !isLogoAreaClick(manualElement, event)) {
        return;
    }

    event.preventDefault();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();

    const range = createRangeForElement(manualElement);
    if (!range) {
        return;
    }

    const rect = manualElement.getBoundingClientRect();
    manualRtlState.mousePosition = {
        x: rect.left + LOGO_ICON_OFFSET,
        y: rect.top + LOGO_ICON_OFFSET,
    };

    handleMenuDisplayForElement(manualElement, range, { forceHighlight: true, forceExpanded: true });
}

