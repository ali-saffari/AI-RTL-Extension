/**
 * Optionally strip inner dir attributes before processing (saved on the node
 * and restored when RTL is turned off). Code, KaTeX, and SVG hosts are skipped.
 */

import { preserveOriginalDir } from '../originalState.js';
import { CUSTOM_CODE_BLOCK_SELECTOR, KATEX_SELECTOR, unwrapElement } from './codeSelectors.js';

const INNER_DIR_SKIP_SELECTOR = [
    'pre', 'code', 'textarea', 'input', 'script', 'style', 'svg', 'math',
    '.cm-content', '.cm-editor', '.cm-line', '.md-code-block',
    CUSTOM_CODE_BLOCK_SELECTOR,
    KATEX_SELECTOR
].join(', ');

function isRemoveInnerDirEnabled(options = {}) {
    return options.removeInnerDir === true;
}

function shouldSkipInnerDirStrip(el) {
    if (!el || typeof el.closest !== 'function') {
        return true;
    }
    return el.matches(INNER_DIR_SKIP_SELECTOR) || Boolean(el.closest(INNER_DIR_SKIP_SELECTOR));
}

function stripInnerDirAttributes($element) {
    const root = unwrapElement($element);
    if (!root || !root.querySelectorAll) {
        return;
    }
    const nodes = root.querySelectorAll('[dir]');
    for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (shouldSkipInnerDirStrip(el) || el.hasAttribute('data-ai-rtl-orig-dir')) {
            continue;
        }
        preserveOriginalDir(el);
        el.removeAttribute('dir');
    }
}

export function applyRemoveInnerDir($element, options = {}) {
    if (!isRemoveInnerDirEnabled(options)) {
        return;
    }
    stripInnerDirAttributes($element);
}
