import { manualRtlState } from './state.js';
import { LOGO_ICON_OFFSET, LOGO_ICON_SIZE } from './constants.js';
import { getManualLogoUrl } from './assets.js';

export function applyLogoDisplayToElement(element) {
    if (!element || !element.classList) {
        return;
    }

    element.classList.add('rtl-manual-direction-element');
    element.classList.remove('rtl-manual-logo-always', 'rtl-manual-logo-hover', 'rtl-manual-logo-disabled');

    const logoDisplay = manualRtlState.textSelectorSettings?.logoDisplay || 'always';
    let className = 'rtl-manual-logo-always';
    if (logoDisplay === 'on_hover') {
        className = 'rtl-manual-logo-hover';
    } else if (logoDisplay === 'disabled') {
        className = 'rtl-manual-logo-disabled';
    }
    element.classList.add(className);

    const logoUrl = getManualLogoUrl();
    if (logoUrl) {
        element.style.setProperty('--rtl-manual-logo-image', `url("${logoUrl}")`);
    }
}

export function refreshLogoDisplayOnManualElements() {
    const elements = document.querySelectorAll('.rtl-manual-direction-element');
    elements.forEach((el) => applyLogoDisplayToElement(el));
}

export function isLogoAreaClick(element, event) {
    if (!element || !event || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    const left = rect.left + LOGO_ICON_OFFSET;
    const top = rect.top + LOGO_ICON_OFFSET;
    const right = left + LOGO_ICON_SIZE;
    const bottom = top + LOGO_ICON_SIZE;

    return event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
}

