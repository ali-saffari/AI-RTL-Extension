import { detectTextDirection } from '../content/utils/analyzeDirection.js';
import { applyLogoDisplayToElement } from './logo.js';
import { manualRtlState } from './state.js';

export function applyDirection(element, direction) {
    if (!element) {
        console.error('[RTL Text Selector] ❌ No element provided!');
        return;
    }

    // حذف تغییرات از element های فرزند که قبلاً تغییرات روی آن‌ها اعمال شده
    const childElementsWithChanges = element.querySelectorAll('.rtl-manual-direction-element');
    childElementsWithChanges.forEach((childElement) => {
        // حذف تغییرات از تمام element های فرزند (مستقیم و غیرمستقیم)
        removeDirectionChanges(childElement);
    });

    let finalDirection = direction;

    if (direction === 'auto') {
        const text = element.textContent || element.innerText || '';
        finalDirection = detectTextDirection(text);
    }

    try {
        element.setAttribute('dir', finalDirection);
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error setting dir attribute:', error);
    }

    const textAlignValue = finalDirection === 'rtl' ? 'right' : 'left';
    try {
        element.style.setProperty('text-align', textAlignValue, 'important');
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error setting text-align:', error);
    }

    try {
        element.style.setProperty('direction', finalDirection, 'important');
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error setting direction style:', error);
    }

    // اعمال فونت اگر تنظیمات فعال باشد
    const applyFont = manualRtlState.manualRtlSettings?.applyFont !== false; // به صورت پیش‌فرض true
    if (applyFont) {
        try {
            element.style.setProperty('font-family', "iranyekan, 'IRANYekan', Tahoma, Arial, sans-serif", 'important');
        } catch (error) {
            console.error('[RTL Text Selector] ❌ Error setting font-family:', error);
        }
    }

    applyLogoDisplayToElement(element);
}

export function hasDirectionChanges(element) {
    if (!element) {
        return false;
    }

    // بررسی اینکه آیا element کلاس افزونه را دارد یا نه
    if (element.classList && element.classList.contains('rtl-manual-direction-element')) {
        return true;
    }

    // بررسی dir attribute
    const dirAttr = element.getAttribute('dir');
    if (dirAttr && (dirAttr === 'rtl' || dirAttr === 'ltr')) {
        return true;
    }

    // بررسی direction style
    const directionStyle = element.style.getPropertyValue('direction');
    if (directionStyle && (directionStyle === 'rtl' || directionStyle === 'ltr')) {
        return true;
    }

    // بررسی text-align style
    const textAlignStyle = element.style.getPropertyValue('text-align');
    if (textAlignStyle && (textAlignStyle === 'right' || textAlignStyle === 'left')) {
        // بررسی اینکه آیا این style با important است یا نه
        const computedStyle = window.getComputedStyle(element);
        const computedTextAlign = computedStyle.textAlign;
        if (computedTextAlign === 'right' || computedTextAlign === 'left') {
            return true;
        }
    }

    // بررسی font-family style (اگر تنظیمات فونت فعال باشد)
    const applyFont = manualRtlState.manualRtlSettings?.applyFont !== false;
    if (applyFont) {
        const fontFamilyStyle = element.style.getPropertyValue('font-family');
        if (fontFamilyStyle && fontFamilyStyle.includes('iranyekan')) {
            return true;
        }
    }

    return false;
}

export function removeDirectionChanges(element) {
    if (!element) {
        return;
    }

    try {
        // حذف dir attribute
        const dirAttr = element.getAttribute('dir');
        if (dirAttr && (dirAttr === 'rtl' || dirAttr === 'ltr')) {
            element.removeAttribute('dir');
        }

        // حذف direction style
        element.style.removeProperty('direction');

        // حذف text-align style
        element.style.removeProperty('text-align');

        // حذف font-family style (اگر تنظیمات فونت فعال باشد)
        const applyFont = manualRtlState.manualRtlSettings?.applyFont !== false;
        if (applyFont) {
            const fontFamilyStyle = element.style.getPropertyValue('font-family');
            if (fontFamilyStyle && fontFamilyStyle.includes('iranyekan')) {
                element.style.removeProperty('font-family');
            }
        }

        // حذف کلاس‌های مربوط به افزونه
        if (element.classList) {
            element.classList.remove('rtl-manual-direction-element');
            element.classList.remove('rtl-manual-logo-always');
            element.classList.remove('rtl-manual-logo-hover');
            element.classList.remove('rtl-manual-logo-disabled');
            element.classList.remove('rtl-menu-open');
            element.classList.remove('rtl-selected-element');
        }

        // حذف element لوگو
        const logoIcon = element.querySelector('.rtl-manual-logo-icon');
        if (logoIcon && logoIcon.parentNode) {
            logoIcon.parentNode.removeChild(logoIcon);
        }
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error removing direction changes:', error);
    }
}

