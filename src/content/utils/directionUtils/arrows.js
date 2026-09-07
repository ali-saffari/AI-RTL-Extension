/**
 * Flip ASCII / Unicode arrows in RTL text so diagrams stay readable.
 * Runs on every site that goes through applyRtlToContainer / applyRtlToElement
 * when the flipRtlArrows setting is on. Skips inputs, KaTeX, SVG, ProseMirror,
 * and LTR code hosts; RTL markdown code boxes still flip.
 */

import { detectTextDirection, isCode } from '../analyzeDirection.js';
import { isRtlEngineActive } from '../originalState.js';
import {
    CODE_BLOCK_HOST_SELECTOR,
    isInlineCodeElement,
    KATEX_SELECTOR,
    unwrapElement
} from './shared.js';

let flipRtlArrowsCache = false;
const flippedArrowOriginals = new WeakMap();
const flippedArrowNodes = new Set();

const ALWAYS_SKIP_ARROW_FLIP_SELECTOR = [
    'textarea', 'input', 'script', 'style', 'svg', 'math',
    KATEX_SELECTOR, '.ProseMirror'
].join(', ');

const CODE_SKIP_ARROW_FLIP_SELECTOR = CODE_BLOCK_HOST_SELECTOR;

const UNICODE_ARROW_FLIP_MAP = {
    '→': '←',
    '⇒': '⇐',
    '⟶': '⟵',
    '⟹': '⟸',
    '➡': '⬅',
    '▶': '◀',
    '▷': '◁',
    '►': '◄',
    '▸': '◂',
    '▻': '◅',
    '⇨': '⇦',
    '⇾': '⇽',
    '↦': '↤',
    '↠': '↞',
    '↝': '↜',
    '↣': '↢',
    '⇀': '↼',
    '⇝': '⇜',
    '⇢': '⇠',
    '☞': '☜',
    '☛': '☚',
    '➜': '←',
    '➔': '←',
    '➝': '←',
    '➞': '←'
};
const UNICODE_ARROW_FLIP_RE = new RegExp(`[${Object.keys(UNICODE_ARROW_FLIP_MAP).join('')}]`, 'g');
const FLIPPABLE_ARROW_RE = /==>|-->|=>|->|[→⇒⟶⟹➡▶▷►▸▻⇨⇾↦↠↝↣⇀⇝⇢☞☛➜➔➝➞]/;

export function setFlipRtlArrows(enabled) {
    flipRtlArrowsCache = enabled === true;
}

export function isFlipRtlArrowsEnabled() {
    return flipRtlArrowsCache === true;
}

function flipArrowsInText(text) {
    if (!text || !FLIPPABLE_ARROW_RE.test(text)) {
        return text;
    }
    return text
        .replace(/==>/g, '<==')
        .replace(/-->/g, '<--')
        .replace(/=>/g, '<=')
        .replace(/->/g, '<-')
        .replace(UNICODE_ARROW_FLIP_RE, (ch) => UNICODE_ARROW_FLIP_MAP[ch] || ch);
}

function isRtlCodeLikeHost(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    const dir = el.getAttribute('dir');
    if (dir === 'rtl') {
        return true;
    }
    if (dir === 'ltr') {
        return false;
    }
    const text = (el.textContent || '').trim();
    if (!text || isCode(text)) {
        return false;
    }
    return detectTextDirection(text) === 'rtl';
}

function shouldSkipArrowFlip(parent) {
    if (!parent || typeof parent.closest !== 'function') {
        return true;
    }
    if (parent.closest(ALWAYS_SKIP_ARROW_FLIP_SELECTOR)) {
        return true;
    }
    if (isInlineCodeElement(parent)) {
        return false;
    }
    const codeHost = parent.closest(CODE_SKIP_ARROW_FLIP_SELECTOR);
    if (!codeHost) {
        return false;
    }
    // Persian markdown code boxes already marked RTL should still flip process arrows.
    return !isRtlCodeLikeHost(parent) && !isRtlCodeLikeHost(codeHost);
}

function isTextNodeInRtlContext(textNode) {
    let current = textNode.parentElement;
    while (current) {
        const dir = current.getAttribute('dir');
        if (dir === 'rtl') {
            return true;
        }
        if (dir === 'ltr') {
            return false;
        }
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

export function flipRtlArrowsInTree(element) {
    if (!isFlipRtlArrowsEnabled()) {
        return;
    }

    const root = unwrapElement(element);
    if (!root || typeof document === 'undefined' || !document.createTreeWalker) {
        return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const text = node.nodeValue;
            if (!text || !FLIPPABLE_ARROW_RE.test(text)) {
                return NodeFilter.FILTER_REJECT;
            }

            const parent = node.parentElement;
            if (!parent) {
                return NodeFilter.FILTER_REJECT;
            }
            if (shouldSkipArrowFlip(parent)) {
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
        const next = flipArrowsInText(node.nodeValue);
        if (next !== node.nodeValue) {
            if (!flippedArrowOriginals.has(node)) {
                flippedArrowOriginals.set(node, node.nodeValue);
                flippedArrowNodes.add(node);
            }
            node.nodeValue = next;
        }
    }
}

export function restoreFlippedArrowsInPage() {
    flippedArrowNodes.forEach((node) => {
        const original = flippedArrowOriginals.get(node);
        if (original !== undefined && node.parentNode) {
            node.nodeValue = original;
        }
        flippedArrowOriginals.delete(node);
    });
    flippedArrowNodes.clear();
}

export function applyLiveFlipRtlArrowsSetting(enabled) {
    setFlipRtlArrows(enabled);
    if (typeof document === 'undefined' || !document.body || !isRtlEngineActive()) {
        return;
    }
    if (enabled) {
        flipRtlArrowsInTree(document.body);
        return;
    }
    restoreFlippedArrowsInPage();
}
