/**
 * Shared code / KaTeX selectors used by codeBlocks, arrows, and textDirectionUtils.
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
