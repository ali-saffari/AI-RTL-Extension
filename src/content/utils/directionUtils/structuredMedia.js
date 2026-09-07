/**
 * Skip and lock direction on KaTeX / MathML / SVG / Mermaid.
 * Used while walking message HTML so formulas and charts stay LTR.
 */

import { KATEX_SELECTOR, unwrapElement } from './codeSelectors.js';

export const STRUCTURED_MEDIA_SELECTOR = `${KATEX_SELECTOR}, math, svg, .mermaid, [data-code-block-preview-pane]`;

function getElementClassName(el) {
    if (!el) return '';
    const className = el.className;
    if (typeof className === 'string') return className;
    if (className && typeof className.baseVal === 'string') return className.baseVal;
    return el.getAttribute('class') || '';
}

function isKatexClassName(className) {
    if (!className || typeof className !== 'string') {
        return false;
    }
    return className.split(/\s+/).some((name) => name === 'katex' || name.startsWith('katex-'));
}

export function isKatexTreeElement(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    if (el.tagName && el.tagName.toLowerCase() === 'math') {
        return true;
    }
    if (isKatexClassName(getElementClassName(el))) {
        return true;
    }
    try {
        return Boolean(el.closest && el.closest(KATEX_SELECTOR));
    } catch {
        return false;
    }
}

export function containsKatexOrMath(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    if (isKatexTreeElement(el)) {
        return true;
    }
    try {
        return Boolean(el.querySelector && el.querySelector(`${KATEX_SELECTOR}, math`));
    } catch {
        return false;
    }
}

export function isSvgTreeElement(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
        return true;
    }
    const tagName = el.tagName && el.tagName.toLowerCase();
    if (tagName === 'svg') {
        return true;
    }
    try {
        return Boolean(el.closest && el.closest('svg, .mermaid, [data-code-block-preview-pane]'));
    } catch {
        return false;
    }
}

export function containsStructuredMarkup(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    if (isKatexTreeElement(el) || isSvgTreeElement(el)) {
        return true;
    }
    try {
        return Boolean(el.querySelector && el.querySelector(STRUCTURED_MEDIA_SELECTOR));
    } catch {
        return false;
    }
}

export function lockKatexDirection($element, processedClass) {
    const root = unwrapElement($element);
    if (!root || !root.querySelectorAll) {
        return;
    }
    const nodes = [];
    if (root.matches && root.matches(`${KATEX_SELECTOR}, math`)) {
        nodes.push(root);
    }
    root.querySelectorAll(`${KATEX_SELECTOR}, math`).forEach((node) => {
        nodes.push(node);
    });
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.setAttribute('dir', 'ltr');
        if (processedClass) {
            node.classList.add(processedClass);
            const descendants = node.querySelectorAll('*');
            for (let j = 0; j < descendants.length; j++) {
                descendants[j].classList.add(processedClass);
            }
        }
    }
}

export function skipStructuredMedia($element, processedClass) {
    lockKatexDirection($element, processedClass);
    const root = unwrapElement($element);
    if (!root || !root.querySelectorAll) {
        return;
    }
    const nodes = [];
    if (root.matches && root.matches('svg, .mermaid, [data-code-block-preview-pane]')) {
        nodes.push(root);
    }
    root.querySelectorAll('svg, .mermaid, [data-code-block-preview-pane]').forEach((node) => {
        nodes.push(node);
    });
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.tagName && node.tagName.toLowerCase() === 'svg') {
            node.setAttribute('dir', 'ltr');
        }
        if (processedClass) {
            node.classList.add(processedClass);
            const descendants = node.querySelectorAll('*');
            for (let j = 0; j < descendants.length; j++) {
                descendants[j].classList.add(processedClass);
            }
        }
    }
}
