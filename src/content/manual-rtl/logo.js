import { manualRtlState } from './state.js';
import { LOGO_ICON_OFFSET, LOGO_ICON_SIZE } from './constants.js';
import { getManualLogoUrl } from './assets.js';

export function applyLogoDisplayToElement(element) {
    if (!element || !element.classList) {
        return;
    }

    element.classList.add('rtl-manual-direction-element');
    element.classList.remove('rtl-manual-logo-always', 'rtl-manual-logo-hover', 'rtl-manual-logo-disabled');

    const logoDisplay = manualRtlState.manualRtlSettings?.logoDisplay || 'always';
    let className = 'rtl-manual-logo-always';
    if (logoDisplay === 'on_hover') {
        className = 'rtl-manual-logo-hover';
    } else if (logoDisplay === 'disabled') {
        className = 'rtl-manual-logo-disabled';
    }
    element.classList.add(className);

    // اضافه کردن element لوگو اگر وجود نداشته باشد
    let logoIcon = element.querySelector('.rtl-manual-logo-icon');
    if (!logoIcon) {
        logoIcon = document.createElement('span');
        logoIcon.className = 'rtl-manual-logo-icon';
        element.appendChild(logoIcon);
    }

    const logoUrl = getManualLogoUrl();
    if (logoUrl) {
        logoIcon.style.setProperty('background-image', `url("${logoUrl}")`);
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
    const computedStyle = window.getComputedStyle(element);
    const direction = computedStyle.direction || 'ltr';
    
    // لوگو در bottom: 6px و inset-inline-end: 6px قرار دارد
    const bottom = rect.bottom - LOGO_ICON_OFFSET;
    const top = bottom - LOGO_ICON_SIZE;
    
    let left, right;
    if (direction === 'rtl') {
        // برای RTL: inset-inline-end = right
        right = rect.right - LOGO_ICON_OFFSET;
        left = right - LOGO_ICON_SIZE;
    } else {
        // برای LTR: inset-inline-end = left
        left = rect.left + LOGO_ICON_OFFSET;
        right = left + LOGO_ICON_SIZE;
    }

    return event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
}

