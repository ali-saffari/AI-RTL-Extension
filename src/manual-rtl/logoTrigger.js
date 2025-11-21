import { manualRtlState } from './state.js';
import { LOGO_ICON_OFFSET } from './constants.js';
import { isLogoAreaClick } from './logo.js';
import { createRangeForElement } from './dom.js';
import { handleMenuDisplayForElement } from './menu.js';

export function handleManualLogoClick(event) {
    if (!manualRtlState.manualRtlSettings || !manualRtlState.manualRtlSettings.manualRtlEnabled) {
        return;
    }

    const logoDisplay = manualRtlState.manualRtlSettings.logoDisplay || 'always';
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

    // بررسی اینکه آیا کلیک روی icon بوده یا نه
    const isLogoIconClick = target instanceof Element && target.classList.contains('rtl-manual-logo-icon');
    
    let manualElement = null;
    if (target instanceof Element) {
        manualElement = target.closest('.rtl-manual-direction-element');
    } else if (target.parentElement) {
        manualElement = target.parentElement.closest('.rtl-manual-direction-element');
    }

    // اگر کلیک روی icon نبوده، بررسی کن که آیا در ناحیه لوگو کلیک شده یا نه
    if (!isLogoIconClick && (!manualElement || !isLogoAreaClick(manualElement, event))) {
        return;
    }
    
    // اگر manualElement پیدا نشد، return کن
    if (!manualElement) {
        return;
    }

    event.preventDefault();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();

    const range = createRangeForElement(manualElement);
    if (!range) {
        return;
    }

    // استفاده از موقعیت واقعی موس برای باز کردن منو کنار موس
    manualRtlState.mousePosition = {
        x: event.clientX,
        y: event.clientY
    };

    handleMenuDisplayForElement(manualElement, range, { forceHighlight: true, forceExpanded: true });
}

