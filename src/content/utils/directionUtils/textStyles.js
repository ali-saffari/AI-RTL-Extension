/**
 * Apply dir / class / text-align / unicode-bidi from a detected direction.
 * Shared by tables, single-element apply, and advanced walk.
 */

import { unwrapElement } from './shared.js';

export function isTextAlignEnabled(setTextAlign) {
    return Boolean(setTextAlign);
}

export function isTextAlignImportant(setTextAlign) {
    return setTextAlign === 'important';
}

const ALIGN_RTL_CLASS = 'AsAlignRtl';
const ALIGN_LTR_CLASS = 'AsAlignLtr';

export function textAlignClassFor(setTextAlign, direction) {
    if (setTextAlign !== 'class') {
        return '';
    }
    if (direction === 'rtl') {
        return ALIGN_RTL_CLASS;
    }
    if (direction === 'ltr') {
        return ALIGN_LTR_CLASS;
    }
    return '';
}

export function applyTextAlignStyle(target, align, setTextAlign) {
    if (!isTextAlignEnabled(setTextAlign) || !align) {
        return;
    }
    const useClass = setTextAlign === 'class';
    const priority = isTextAlignImportant(setTextAlign) ? 'important' : '';
    const applyOne = (el) => {
        if (!el || el.nodeType !== 1) {
            return;
        }
        if (useClass) {
            el.classList.toggle(ALIGN_RTL_CLASS, align === 'right');
            el.classList.toggle(ALIGN_LTR_CLASS, align === 'left');
            if (el.style) {
                el.style.removeProperty('text-align');
            }
            return;
        }
        if (el.style) {
            el.style.setProperty('text-align', align, priority);
        }
    };

    if (target && target.nodeType === 1) {
        applyOne(target);
        return;
    }
    if (target && typeof target.each === 'function') {
        target.each(function() {
            applyOne(this);
        });
        return;
    }
    applyOne(unwrapElement(target));
}

export function applyTextAlignByDirection(target, direction, setTextAlign) {
    if (direction !== 'rtl' && direction !== 'ltr') {
        return;
    }
    applyTextAlignStyle(target, direction === 'rtl' ? 'right' : 'left', setTextAlign);
}

const UNICODE_BIDI_KEYWORDS = new Set([
    'isolate',
    'plaintext',
    'embed',
    'bidi-override',
    'isolate-override',
    'normal'
]);
const ORIG_BIDI_ATTR = 'data-ai-rtl-orig-bidi';

export function parseUnicodeBidiOption(setUnicodeBidi) {
    if (!setUnicodeBidi) {
        return { enabled: false, value: 'isolate', important: false };
    }

    if (setUnicodeBidi === true) {
        return { enabled: true, value: 'isolate', important: false };
    }

    if (typeof setUnicodeBidi !== 'string') {
        return { enabled: true, value: 'isolate', important: false };
    }

    const normalized = setUnicodeBidi.trim().toLowerCase().replace(/\s+/g, ' ');
    const important = normalized.includes('important');
    const withoutImportant = normalized.replace(/!?\s*important/g, '').trim();
    const value = UNICODE_BIDI_KEYWORDS.has(withoutImportant) ? withoutImportant : 'isolate';

    return { enabled: true, value, important };
}

export function isUnicodeBidiEnabled(setUnicodeBidi) {
    return parseUnicodeBidiOption(setUnicodeBidi).enabled;
}

export function applyUnicodeBidiStyle(target, setUnicodeBidi) {
    const parsed = parseUnicodeBidiOption(setUnicodeBidi);
    if (!parsed.enabled) {
        return;
    }
    const priority = parsed.important ? 'important' : '';
    const applyOne = (el) => {
        if (el && el.nodeType === 1 && el.style) {
            el.style.setProperty('unicode-bidi', parsed.value, priority);
        }
    };

    if (target && target.nodeType === 1) {
        applyOne(target);
        return;
    }
    if (target && typeof target.each === 'function') {
        target.each(function() {
            applyOne(this);
        });
        return;
    }
    applyOne(unwrapElement(target));
}

export function restoreUnicodeBidiStyle(target) {
    const applyOne = (el) => {
        if (!el || el.nodeType !== 1 || !el.style || !el.hasAttribute(ORIG_BIDI_ATTR)) {
            return;
        }
        const original = el.getAttribute(ORIG_BIDI_ATTR);
        if (original) {
            el.style.setProperty('unicode-bidi', original);
        } else {
            el.style.removeProperty('unicode-bidi');
        }
    };

    if (target && target.nodeType === 1) {
        applyOne(target);
        return;
    }
    if (target && typeof target.each === 'function') {
        target.each(function() {
            applyOne(this);
        });
        return;
    }
    applyOne(unwrapElement(target));
}

export function applyUnicodeBidiByDirection(target, direction, setUnicodeBidi) {
    if (!isUnicodeBidiEnabled(setUnicodeBidi)) {
        return;
    }
    if (direction === 'rtl') {
        applyUnicodeBidiStyle(target, setUnicodeBidi);
        return;
    }
    restoreUnicodeBidiStyle(target);
}

export function usesDirectionClasses(options = {}) {
    return Boolean(options.rtlClass || options.ltrClass);
}

export function applyDirectionMarker($element, direction, options = {}) {
    if (!$element || !$element.length) {
        return;
    }

    const rtlClass = options.rtlClass;
    const ltrClass = options.ltrClass;
    const dir = direction || $element.attr('data-ai-rtl-direction') || $element.attr('dir');

    if (rtlClass) {
        if (dir === 'rtl') {
            $element.addClass(rtlClass);
        } else {
            $element.removeClass(rtlClass);
        }
    }

    if (ltrClass) {
        if (dir === 'ltr') {
            $element.addClass(ltrClass);
        } else {
            $element.removeClass(ltrClass);
        }
    }

      
    if (dir) {
        $element.attr('dir', dir);
    }

    if (usesDirectionClasses(options)) {
        return;
    }

  
}
