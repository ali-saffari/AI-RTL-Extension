/**
 * Isolate Latin phrases inside RTL text so "ChatGPT Plus" stays in LTR order.
 * Off by default (fixMixedText). Skips inputs, code, KaTeX, SVG, and editors.
 */

import { isRtlEngineActive } from '../originalState.js';
import {
    CODE_BLOCK_HOST_SELECTOR,
    KATEX_SELECTOR,
    unwrapElement
} from './shared.js';

export const MIXED_LTR_ATTR = 'data-ai-rtl-mixed-ltr';

let fixMixedTextCache = false;

const SKIP_MIXED_PHRASE_SELECTOR = [
    'textarea', 'input', 'script', 'style', 'svg', 'math',
    'code', 'kbd', 'samp', 'pre',
    '[contenteditable="true"]',
    '.ProseMirror',
    '[data-ai-rtl-editor]',
    KATEX_SELECTOR,
    CODE_BLOCK_HOST_SELECTOR
].join(', ');

const HAS_LATIN_RE = /[A-Za-z]/;
const LATIN_PHRASE_RE = /([A-Za-z][A-Za-z0-9.\/\-\s]*(?:\s*,\s*[A-Za-z][A-Za-z0-9.\/\-\s]*)*)/g;

export function setFixMixedText(_enabled) {
    fixMixedTextCache = false;
}

export function isFixMixedTextEnabled() {
    return fixMixedTextCache === true;
}

function readExplicitDirection(el) {
    if (!el || el.nodeType !== 1) {
        return '';
    }
    const dir = (el.getAttribute('dir') || '').toLowerCase();
    if (dir === 'rtl' || dir === 'ltr') {
        return dir;
    }
    const dataDir = (el.getAttribute('data-direction') || '').toLowerCase();
    if (dataDir === 'rtl' || dataDir === 'ltr') {
        return dataDir;
    }
    return '';
}

function isTextNodeInRtlContext(textNode) {
    let current = textNode.parentElement;
    while (current) {
        const explicit = readExplicitDirection(current);
        if (explicit === 'rtl') {
            return true;
        }
        if (explicit === 'ltr') {
            return false;
        }
        const dir = (current.getAttribute('dir') || '').toLowerCase();
        if (dir === 'auto') {
            try {
                return getComputedStyle(current).direction === 'rtl';
            } catch {
                return false;
            }
        }
        current = current.parentElement;
    }

    const parent = textNode.parentElement;
    if (!parent) {
        return false;
    }
    try {
        return getComputedStyle(parent).direction === 'rtl';
    } catch {
        return false;
    }
}

function shouldSkipMixedPhrase(parent) {
    if (!parent || typeof parent.closest !== 'function') {
        return true;
    }
    if (parent.hasAttribute(MIXED_LTR_ATTR) || parent.closest(`[${MIXED_LTR_ATTR}]`)) {
        return true;
    }
    try {
        return Boolean(parent.closest(SKIP_MIXED_PHRASE_SELECTOR));
    } catch {
        return true;
    }
}

function createIsolateSpan(phrase) {
    const span = document.createElement('span');
    span.setAttribute('dir', 'ltr');
    span.setAttribute(MIXED_LTR_ATTR, '');
    span.style.setProperty('unicode-bidi', 'isolate');
    span.textContent = phrase;
    return span;
}

function wrapLatinPhrasesInTextNode(textNode) {
    const text = textNode.nodeValue;
    if (!text || !HAS_LATIN_RE.test(text)) {
        return;
    }

    LATIN_PHRASE_RE.lastIndex = 0;
    const pieces = [];
    let lastIndex = 0;
    let match = LATIN_PHRASE_RE.exec(text);

    while (match) {
        const raw = match[0];
        const trailingSpace = raw.match(/\s+$/);
        const phrase = trailingSpace ? raw.slice(0, raw.length - trailingSpace[0].length) : raw;
        const start = match.index;
        const phraseEnd = start + phrase.length;

        if (phrase && HAS_LATIN_RE.test(phrase)) {
            if (start > lastIndex) {
                pieces.push({ type: 'text', value: text.slice(lastIndex, start) });
            }
            pieces.push({ type: 'isolate', value: phrase });
            lastIndex = phraseEnd;
        }

        match = LATIN_PHRASE_RE.exec(text);
    }

    if (lastIndex === 0 || (pieces.length === 1 && pieces[0].type === 'text')) {
        return;
    }

    if (lastIndex < text.length) {
        pieces.push({ type: 'text', value: text.slice(lastIndex) });
    }

    const parent = textNode.parentNode;
    if (!parent) {
        return;
    }

    const fragment = document.createDocumentFragment();
    for (const piece of pieces) {
        if (piece.type === 'isolate') {
            fragment.appendChild(createIsolateSpan(piece.value));
        } else if (piece.value) {
            fragment.appendChild(document.createTextNode(piece.value));
        }
    }
    parent.replaceChild(fragment, textNode);
}

function normalizeElement(el) {
    if (el && typeof el.normalize === 'function') {
        el.normalize();
    }
}

export function isolateMixedPhrasesInTree(element) {
    if (!isFixMixedTextEnabled()) {
        return;
    }

    const root = unwrapElement(element);
    if (!root || typeof document === 'undefined' || !document.createTreeWalker) {
        return;
    }

    normalizeElement(root);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const text = node.nodeValue;
            if (!text || !HAS_LATIN_RE.test(text)) {
                return NodeFilter.FILTER_REJECT;
            }

            const parent = node.parentElement;
            if (!parent || shouldSkipMixedPhrase(parent)) {
                return NodeFilter.FILTER_REJECT;
            }
            if (!isTextNodeInRtlContext(node)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {
        wrapLatinPhrasesInTextNode(node);
    }
}

export function restoreMixedPhrasesInPage(root = typeof document !== 'undefined' ? document.body : null) {
    if (!root || !root.querySelectorAll) {
        return;
    }

    const spans = root.querySelectorAll(`[${MIXED_LTR_ATTR}]`);
    const parents = new Set();
    for (let i = 0; i < spans.length; i++) {
        const span = spans[i];
        const parent = span.parentNode;
        if (!parent) {
            continue;
        }
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parents.add(parent);
    }
    parents.forEach(normalizeElement);
}

export function applyLiveFixMixedTextSetting(enabled) {
    setFixMixedText(enabled);
    if (typeof document === 'undefined' || !document.body || !isRtlEngineActive()) {
        return;
    }
    restoreMixedPhrasesInPage(document.body);
    if (enabled) {
        isolateMixedPhrasesInTree(document.body);
    }
}
