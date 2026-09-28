/**
 * Shared primitives: code/KaTeX selectors, debug helpers, tag-list helpers.
 * Leaf module — do not import other directionUtils files here.
 */

export function getElementClassName(el) {
    if (!el) return '';
    const className = el.className;
    if (typeof className === 'string') return className;
    if (className && typeof className.baseVal === 'string') return className.baseVal;
    return el.getAttribute('class') || '';
}

export function unwrapElement(element) {
    if (!element) {
        return null;
    }
    if (element.nodeType === 1) {
        return element;
    }
    if (element[0] && element[0].nodeType === 1) {
        return element[0];
    }
    return null;
}

export const KATEX_SELECTOR = '.katex, .katex-html, .katex-display, .katex-mathml';

export const CUSTOM_CODE_BLOCK_SELECTOR = [
    '[data-language]',
    '[data-streamdown="code-block"]',
    '.scriptor-component-code-block'
].join(', ');

export const CODE_BLOCK_HOST_SELECTOR = [
    'pre',
    '.cm-content', '.cm-editor', '.cm-line', '.md-code-block',
    CUSTOM_CODE_BLOCK_SELECTOR
].join(', ');

export const STANDARD_CODE_BLOCK_SELECTOR = 'code, pre, .cm-content, .cm-editor, .md-code-block';
export const CODE_BLOCK_SELECTOR = `${STANDARD_CODE_BLOCK_SELECTOR}, ${CUSTOM_CODE_BLOCK_SELECTOR}`;
const INLINE_CODE_TAGS = new Set(['code', 'kbd', 'samp']);

export function isInsideCodeBlock(el) {
    if (!el || typeof el.closest !== 'function') {
        return false;
    }
    try {
        return Boolean(el.closest(CODE_BLOCK_HOST_SELECTOR));
    } catch {
        return false;
    }
}

export function isInlineCodeElement(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    const tag = el.tagName && el.tagName.toLowerCase();
    if (!INLINE_CODE_TAGS.has(tag)) {
        return false;
    }
    return !isInsideCodeBlock(el);
}

export function isCustomCodeBlock($element) {
    const el = unwrapElement($element);
    if (!el || el.nodeType !== 1 || typeof el.matches !== 'function') {
        return false;
    }
    try {
        return el.matches(CUSTOM_CODE_BLOCK_SELECTOR);
    } catch {
        return false;
    }
}

export function isCodeMirrorCodeBlock($element) {
    return $element.hasClass('cm-content') || $element.hasClass('cm-editor') || $element.hasClass('md-code-block');
}

export const DEBUG_MODE = process.env.NODE_ENV !== 'production';

export function isDebugMode() {
    if (DEBUG_MODE) {
        return true;
    }
    try {
        return typeof window !== 'undefined' && window.__AI_RTL_DEBUG === true;
    } catch {
        return false;
    }
}

export function setDebugAttr($element, attrName, value) {
    if (isDebugMode()) {
        $element.attr(attrName, value);
    }
}

export function logDebug(...args) {
    if (!isDebugMode()) {
        return;
    }
    console.log('[AI-RTL]', ...args);
}

function describeDebugElement(element) {
    const el = unwrapElement(element);
    if (!el || !el.tagName) {
        return { tag: 'unknown' };
    }
    const className = typeof el.className === 'string'
        ? el.className.trim().split(/\s+/).slice(0, 3).join('.')
        : '';
    return {
        tag: el.tagName.toLowerCase(),
        className: className || undefined,
        textLength: typeof el.textContent === 'string' ? el.textContent.length : undefined
    };
}

export function logDebugProcess(section, element, details = {}) {
    if (!isDebugMode()) {
        return;
    }
    const el = unwrapElement(element);
    // Pass the live DOM node so DevTools hover highlights it on the page.
    console.log('[AI-RTL]', section, el, {
        ...describeDebugElement(el),
        ...details
    });
}

const lastSkipReasons = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

/** Log skip once per element, again only when the skip reason changes. */
export function logDebugSkipOnce(element, details = {}) {
    if (!isDebugMode()) {
        return;
    }
    const el = unwrapElement(element);
    if (!el) {
        return;
    }
    const reason = details.reason || '';
    if (lastSkipReasons) {
        if (lastSkipReasons.get(el) === reason) {
            return;
        }
        lastSkipReasons.set(el, reason);
    }
    const info = { ...describeDebugElement(el), ...details };
    // console.log(`[AI-RTL] skip ${info.tag}${info.className ? '.' + info.className : ''} reason=${info.reason || ''} textLength=${info.textLength ?? ''}`, el);
}

export function clearDebugSkipReason(element) {
    if (!lastSkipReasons) {
        return;
    }
    const el = unwrapElement(element);
    if (el) {
        lastSkipReasons.delete(el);
    }
}

export function normalizeTagNameList(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .map((tag) => String(tag || '').trim().toLowerCase())
        .filter(Boolean);
}

export function resolveAdjustedTagList(defaults, addTags, removeTags) {
    const extraTags = normalizeTagNameList(addTags);
    const removeSet = new Set(normalizeTagNameList(removeTags));
    const seen = new Set();
    const resolved = [];

    [...defaults, ...extraTags].forEach((tag) => {
        if (removeSet.has(tag) || seen.has(tag)) {
            return;
        }
        seen.add(tag);
        resolved.push(tag);
    });

    return resolved;
}
