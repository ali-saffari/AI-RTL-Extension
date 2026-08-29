/**
 * Text direction utility functions
 * Helper functions for text direction processing across different websites
 */

// Import analysis functions from analyzeDirection.js
import { analyzeTextDirection, detectTextDirection, isRTL, isCode, analyzeTextDirectionFirstWord } from './analyzeDirection.js';
import { isRtlEngineActive, restoreElementFromSelf } from './originalState.js';

// Debug flag - set to false for release builds
const DEBUG_MODE = false;

// Helper function to set debug attributes only in debug mode
function setDebugAttr($element, attrName, value) {
    if (DEBUG_MODE) {
        $element.attr(attrName, value);
    }
}

// Common formatting tags array - defined once for consistency
const FORMATTING_TAGS = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'a', 'button'];

const DEFAULT_MIXED_TITLE_DISPLAY_MODE = 'unified';
let mixedTitleDisplayModeCache = DEFAULT_MIXED_TITLE_DISPLAY_MODE;
let applyAlgorithmToCodeCache = false;
let flipRtlArrowsCache = false;
let activeRtlAlgorithmCache = 'advanced_full';
const flippedArrowOriginals = new WeakMap();
const flippedArrowNodes = new Set();

const KATEX_SELECTOR = '.katex, .katex-html, .katex-display, .katex-mathml';

const ALWAYS_SKIP_ARROW_FLIP_SELECTOR = [
    'textarea', 'input', 'script', 'style', 'svg', 'math',
    KATEX_SELECTOR, '.ProseMirror'
].join(', ');

const CODE_BLOCK_HOST_SELECTOR = [
    'pre',
    '.cm-content', '.cm-editor', '.cm-line', '.md-code-block',
    '[data-language]', '[data-streamdown="code-block"]'
].join(', ');

const CODE_SKIP_ARROW_FLIP_SELECTOR = CODE_BLOCK_HOST_SELECTOR;

const CUSTOM_CODE_BLOCK_SELECTOR = '[data-language], [data-streamdown="code-block"]';
const STANDARD_CODE_BLOCK_SELECTOR = 'code, pre, .cm-content, .cm-editor, .md-code-block';
const CODE_BLOCK_SELECTOR = `${STANDARD_CODE_BLOCK_SELECTOR}, ${CUSTOM_CODE_BLOCK_SELECTOR}`;
const INLINE_CODE_TAGS = new Set(['code', 'kbd', 'samp']);

function isInsideCodeBlock(el) {
    if (!el || typeof el.closest !== 'function') {
        return false;
    }
    try {
        return Boolean(el.closest(CODE_BLOCK_HOST_SELECTOR));
    } catch {
        return false;
    }
}

function isInlineCodeElement(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    const tag = el.tagName && el.tagName.toLowerCase();
    if (!INLINE_CODE_TAGS.has(tag)) {
        return false;
    }
    return !isInsideCodeBlock(el);
}

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
const loggedIgnoredEls = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

function getElementClassName(el) {
    if (!el) return '';
    const className = el.className;
    if (typeof className === 'string') return className;
    if (className && typeof className.baseVal === 'string') return className.baseVal;
    return el.getAttribute('class') || '';
}

function getIgnoreSelector(options = {}) {
    const value = options.ignoreSelector;
    return typeof value === 'string' && value.length ? value : null;
}

function queryIgnoredElements(root, selector, includeRoot = true) {
    if (!root || root.nodeType !== 1 || !selector) {
        return [];
    }
    try {
        if (!root.firstElementChild) {
            return includeRoot && root.matches(selector) ? [root] : [];
        }
        const found = root.querySelectorAll(selector);
        if (!includeRoot || !root.matches(selector)) {
            return found;
        }
        const matches = [root];
        for (let i = 0; i < found.length; i++) {
            matches.push(found[i]);
        }
        return matches;
    } catch {
        return [];
    }
}

function logIgnoredIfSensed(el, selector) {
    if (!DEBUG_MODE || !el || !el.isConnected) {
        return;
    }
    if (loggedIgnoredEls && loggedIgnoredEls.has(el)) {
        return;
    }
    loggedIgnoredEls?.add(el);
    console.log('ignoreSelector sensed', {
        element: el,
        selector,
        className: getElementClassName(el)
    });
}

const SKIP_ANALYZABLE_SELECTOR = [
    'a', 'button', 'script', 'style', 'svg', 'math', 'canvas',
    'textarea', 'input', 'pre', 'code',
    'div.rounded-xl',
    '.cm-content', '.cm-editor', '.md-code-block',
    '[data-copy="false"]',
    CUSTOM_CODE_BLOCK_SELECTOR,
    KATEX_SELECTOR
].join(', ');

const STRUCTURED_MEDIA_SELECTOR = `${KATEX_SELECTOR}, math, svg, .mermaid, [data-code-block-preview-pane]`;

function isNonAnalyzableElement(el, ignoreSelector) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
        return true;
    }
    try {
        if (el.matches(SKIP_ANALYZABLE_SELECTOR)) {
            // Inline markdown `code` is UI/prose (e.g. Settings → System), not a fenced block.
            if (isInlineCodeElement(el)) {
                return false;
            }
            return true;
        }
        if (ignoreSelector && el.matches(ignoreSelector)) {
            return true;
        }
    } catch {
        return false;
    }
    return false;
}

function collectAnalyzableText(node, ignoreSelector, parts) {
    if (!node) {
        return;
    }
    if (node.nodeType === 3) {
        if (node.nodeValue) {
            parts.push(node.nodeValue);
        }
        return;
    }
    if (node.nodeType !== 1) {
        return;
    }
    if (isNonAnalyzableElement(node, ignoreSelector)) {
        return;
    }
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        collectAnalyzableText(children[i], ignoreSelector, parts);
    }
}

function getAnalyzableText($element, options = {}) {
    const root = unwrapElement($element);
    if (!root) {
        return '';
    }
    if (root.nodeType === 3) {
        return (root.nodeValue || '').trim();
    }
    const ignoreSelector = getIgnoreSelector(options);
    const parts = [];
    const children = root.childNodes;
    for (let i = 0; i < children.length; i++) {
        collectAnalyzableText(children[i], ignoreSelector, parts);
    }
    return parts.join('').trim();
}

function isolateIgnoredElements($element, selector) {
    const root = unwrapElement($element);
    const ignored = queryIgnoredElements(root, selector, true);
    for (let i = 0; i < ignored.length; i++) {
        const el = ignored[i];
        logIgnoredIfSensed(el, selector);
        if (!el.hasAttribute('dir')) {
            el.setAttribute('dir', 'auto');
        }
    }
}

const INNER_DIR_TARGET_SELECTOR = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'blockquote', 'div', 'section', 'article', 'header',
    'span', 'ul', 'ol'
].join(', ');

const INNER_DIR_SKIP_SELECTOR = [
    'pre', 'code', 'textarea', 'input', 'script', 'style', 'svg', 'math',
    '.cm-content', '.cm-editor', '.cm-line', '.md-code-block',
    '[data-language]', '[data-streamdown="code-block"]',
    KATEX_SELECTOR
].join(', ');

function isKatexClassName(className) {
    if (!className || typeof className !== 'string') {
        return false;
    }
    return className.split(/\s+/).some((name) => name === 'katex' || name.startsWith('katex-'));
}

function isKatexTreeElement(el) {
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

function containsKatexOrMath(el) {
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

function isSvgTreeElement(el) {
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

function containsStructuredMarkup(el) {
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

function skipStructuredMedia($element, processedClass) {
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

function lockKatexDirection($element, processedClass) {
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
    if (!$element || !$element.length) {
        return;
    }
    $element.find(INNER_DIR_TARGET_SELECTOR).each(function() {
        if (!this.hasAttribute('dir') || shouldSkipInnerDirStrip(this)) {
            return;
        }
        AQ(this).removeAttr('dir');
    });
}

function applyRemoveInnerDir($element, rtlAlgorithm, options = {}) {
    if (rtlAlgorithm === 'advanced_section' || !isRemoveInnerDirEnabled(options)) {
        return;
    }
    stripInnerDirAttributes($element);
}

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

function isInvalidatedError(error) {
    const message = error?.message || String(error || '');
    return message.includes('Extension context invalidated') || !isExtensionContextValid();
}

function setMixedTitleDisplayMode(mode) {
    mixedTitleDisplayModeCache = mode || DEFAULT_MIXED_TITLE_DISPLAY_MODE;
}

function setActiveRtlAlgorithm(mode) {
    activeRtlAlgorithmCache = mode || 'advanced_full';
}

function getActiveRtlAlgorithm() {
    return activeRtlAlgorithmCache || 'advanced_full';
}

function resolveRtlAlgorithm(passed) {
    return activeRtlAlgorithmCache || passed || 'advanced_full';
}

function resetRtlDomCaches() {
    lockedEditorCssById.clear();
    lockedBlockquoteOriginals.clear();
    lockedEditorSeq = 0;
    flippedArrowNodes.clear();
    const lockedStyle = typeof document !== 'undefined' && document.getElementById(LOCKED_EDITOR_STYLE_ID);
    if (lockedStyle && lockedStyle.parentNode) {
        lockedStyle.parentNode.removeChild(lockedStyle);
    }
    const cmStyle = typeof document !== 'undefined' && document.getElementById(CM_DIR_STYLE_ID);
    if (cmStyle && cmStyle.parentNode) {
        cmStyle.parentNode.removeChild(cmStyle);
    }
}

function setApplyAlgorithmToCode(enabled) {
    applyAlgorithmToCodeCache = enabled === true;
    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.toggle('ai-rtl-code-algorithm', applyAlgorithmToCodeCache);
    }
}

function isApplyAlgorithmToCodeEnabled() {
    return applyAlgorithmToCodeCache === true;
}

function setFlipRtlArrows(enabled) {
    flipRtlArrowsCache = enabled === true;
}

function isFlipRtlArrowsEnabled() {
    return flipRtlArrowsCache === true;
}

function unwrapElement(element) {
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

function isTextAlignEnabled(setTextAlign) {
    return Boolean(setTextAlign);
}

function isTextAlignImportant(setTextAlign) {
    return setTextAlign === 'important';
}

function applyTextAlignStyle(target, align, setTextAlign) {
    if (!isTextAlignEnabled(setTextAlign) || !align) {
        return;
    }
    const priority = isTextAlignImportant(setTextAlign) ? 'important' : '';
    const applyOne = (el) => {
        if (el && el.nodeType === 1 && el.style) {
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

function applyTextAlignByDirection(target, direction, setTextAlign) {
    if (direction !== 'rtl' && direction !== 'ltr') {
        return;
    }
    applyTextAlignStyle(target, direction === 'rtl' ? 'right' : 'left', setTextAlign);
}

function isCustomCodeBlock($element) {
    const el = unwrapElement($element);
    if (!el || el.nodeType !== 1 || typeof el.hasAttribute !== 'function') {
        return false;
    }
    return el.hasAttribute('data-language') || el.getAttribute('data-streamdown') === 'code-block';
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

function flipRtlArrowsInTree(element) {
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

function restoreFlippedArrowsInPage() {
    flippedArrowNodes.forEach((node) => {
        const original = flippedArrowOriginals.get(node);
        if (original !== undefined && node.parentNode) {
            node.nodeValue = original;
        }
        flippedArrowOriginals.delete(node);
    });
    flippedArrowNodes.clear();
}

function applyLiveFlipRtlArrowsSetting(enabled) {
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

function getLiveCodeProcessOptions() {
    const isGpt = Boolean(document.body && document.body.classList.contains('FontSetGPT'));
    return {
        fontClass: isGpt ? 'FontSetGPT' : 'FontSet',
        codeFontClass: isGpt ? 'FontSetCodeBlocksGPT' : 'FontSet',
        setTextAlign: true
    };
}

function refreshLockedEditorsForCodeSetting() {
    if (typeof document === 'undefined' || !document.body) {
        return;
    }
    const options = getLiveCodeProcessOptions();
    document.querySelectorAll(`[data-ai-rtl-editor], ${DEFAULT_LOCKED_EDITOR_SELECTOR}`).forEach((el) => {
        const editorId = el.getAttribute('data-ai-rtl-editor');
        if (editorId) {
            lockedEditorCssById.delete(editorId);
            el.removeAttribute('data-ai-rtl-sig');
        }
        processLockedEditorByCss(el, getActiveRtlAlgorithm(), { ...options, onlyCss: true });
    });
}

function applyForcedCodeLtr($element) {
    $element.attr('dir', 'ltr');
    $element.attr('data-direction', 'ltr');
    $element.css('text-align', 'left');
    $element.addClass('AsSetLtr');
    $element.removeClass('FontSet FontSetCode FontSetGPT FontSetCodeBlocksGPT');
    const el = unwrapElement($element);
    if (el && el.style) {
        el.style.setProperty('text-align', 'left');
    }
}

function restoreCodeElementToOriginal(el) {
    restoreElementFromSelf(el);
}

function restoreCodeBlocksToOriginal() {
    if (typeof document === 'undefined' || !document.body) {
        return;
    }

    const blocks = document.body.querySelectorAll(CODE_BLOCK_SELECTOR);
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        restoreCodeElementToOriginal(block);
        const nested = block.querySelectorAll('[dir], [data-direction], [data-ai-rtl-orig-dir], .AsSetLtr, .cm-line, code, pre');
        for (let j = 0; j < nested.length; j++) {
            restoreCodeElementToOriginal(nested[j]);
        }
    }

    document.body.querySelectorAll('.cm-line[dir], .cm-content[dir], code.AsSetLtr, pre.AsSetLtr').forEach(restoreCodeElementToOriginal);
}

function applyLiveCodeAlgorithmSetting(enabled) {
    setApplyAlgorithmToCode(enabled);
    if (typeof document === 'undefined' || !document.body || !isRtlEngineActive()) {
        return;
    }
    if (!enabled) {
        restoreCodeBlocksToOriginal();
        refreshLockedEditorsForCodeSetting();
        return;
    }
    const options = getLiveCodeProcessOptions();
    processCodeBlocksInContainer(AQ(document.body), options, true);
    processCodeMirrorBlocks(document.body, options);
    refreshLockedEditorsForCodeSetting();
    flipRtlArrowsInTree(document.body);
}

const CM_DIR_STYLE_ID = 'ai-rtl-cm-code-direction';

function ensureCodeMirrorDirectionStyles() {
    if (typeof document === 'undefined' || document.getElementById(CM_DIR_STYLE_ID)) {
        return;
    }
    const style = document.createElement('style');
    style.id = CM_DIR_STYLE_ID;
    style.textContent = `
        .cm-content[dir="rtl"], .cm-line[dir="rtl"] {
            direction: rtl !important;
            unicode-bidi: isolate;
        }
        .cm-content[dir="ltr"], .cm-line[dir="ltr"] {
            direction: ltr !important;
            unicode-bidi: isolate;
        }
        .cm-content[dir="rtl"], .cm-line[dir="rtl"] { text-align: right !important; }
        .cm-content[dir="ltr"], .cm-line[dir="ltr"] { text-align: left !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
}

function shouldApplyRtlToCodeBlock(text) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return false;
    }
    if (isCode(text)) {
        return false;
    }
    return detectTextDirection(text) === 'rtl';
}

function getCodeBlockDirectionTargets($element) {
    const $inner = $element.find('pre, code');
    return $inner.length ? $element.add($inner) : $element;
}

function processCodeLikeElement($element, element, options = {}) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    const { fontClass, processedClass, codeFontClass } = options;
    const blockFontClass = codeFontClass || fontClass;
    if (processedClass) {
        $element.addClass(processedClass);
    }

    const text = $element.text();
    const $targets = getCodeBlockDirectionTargets($element);
    if (!shouldApplyRtlToCodeBlock(text)) {
        setDebugAttr($element, 'data-debug-mode', 'code-element-ltr');
        $targets.each(function() {
            applyForcedCodeLtr(AQ(this));
        });
        return;
    }

    setDebugAttr($element, 'data-debug-mode', 'code-element-normal');
    $element.find('*').removeAttr('dir');
    applyCodeBlockDirection($targets, 'rtl', blockFontClass);
}

function isCodeMirrorCodeBlock($element) {
    return $element.hasClass('cm-content') || $element.hasClass('cm-editor') || $element.hasClass('md-code-block');
}

function processCodeBlockNode($codeElement, options = {}) {
    const el = $codeElement[0];
    if (isCodeMirrorCodeBlock($codeElement)) {
        processCodeMirrorBlock($codeElement, el, options);
        return;
    }
    processCodeLikeElement($codeElement, el, options);
}

function processCodeBlocksInContainer($container, options = {}, includeStandard = true) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    const selector = includeStandard ? CODE_BLOCK_SELECTOR : CUSTOM_CODE_BLOCK_SELECTOR;
    $container.find(selector).add($container.filter(selector)).each(function() {
        processCodeBlockNode(AQ(this), options);
    });
}

function getCodeMirrorTargets($element, $content) {
    let $targets = $content.add($content.children('.cm-line'));
    if ($element[0] !== $content[0]) {
        $targets = $targets.add($element);
    }
    return $targets;
}

function applyCodeBlockDirection($targets, direction, fontClass) {
    $targets.each(function() {
        const $el = AQ(this);
        if (direction === 'rtl') {
            $el.attr('dir', 'rtl');
            $el.attr('data-direction', 'rtl');
            $el.css('text-align', 'right');
            $el.removeClass('AsSetLtr');
            if (fontClass) {
                $el.addClass(fontClass);
            }
            return;
        }
        applyForcedCodeLtr($el);
        if (fontClass) {
            $el.removeClass(fontClass);
        }
    });
}

function processCodeMirrorBlock($element, element, options = {}) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    const { fontClass, processedClass, codeFontClass } = options;
    const blockFontClass = codeFontClass || fontClass;
    const $content = $element.hasClass('cm-content')
        ? $element
        : ($element.find('.cm-content').first().length ? $element.find('.cm-content').first() : $element);

    ensureCodeMirrorDirectionStyles();

    if (processedClass) {
        $element.addClass(processedClass);
        $element.find('*').addClass(processedClass);
    }

    const $targets = getCodeMirrorTargets($element, $content);

    const blockText = $content.text();
    if (!shouldApplyRtlToCodeBlock(blockText)) {
        setDebugAttr($element, 'data-debug-mode', 'cm-code-block-ltr');
        applyCodeBlockDirection($targets, 'ltr', blockFontClass);
        return;
    }

    setDebugAttr($element, 'data-debug-mode', 'cm-code-block-persian');
    applyCodeBlockDirection($targets, 'rtl', blockFontClass);
}

function processCodeMirrorBlocks(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const $root = container ? AQ(container) : AQ(document);
    $root.find('.cm-content, .md-code-block').add($root.filter('.cm-content, .md-code-block')).each(function() {
        processCodeMirrorBlock(AQ(this), this, options);
    });
}


/**
 * One-time function to set text direction and font for any element
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {Object} options - Options object
 * @param {string} options.processedClass - Class to mark processed elements (default: 'AsSet')
 * @param {string} options.fontClass - Font class to apply (optional)
 * @param {string} options.text - Text content to analyze (optional)
 * @param {boolean|'important'} options.setTextAlign - Whether to set text alignment; pass 'important' to use !important
 */
function setTextDirectionAndFontOneTime(element, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const {
        processedClass = 'AsSet',
        fontClass = 'FontSet',
        text: providedText = null,
        setTextAlign = false
    } = options;
    
    const $element = AQ(element);
    
    // Check if already processed
    if ($element.hasClass(processedClass)) {
        return;
    }
    
    // Mark as processed
    $element.addClass(processedClass);
    
    // Delegate processing to setTextDirectionAndFont
    setTextDirectionAndFont(element, {
        fontClass,
        text: providedText,
        setTextAlign
    });
}

/**
 * Universal function to set text direction and font for any element
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {Object} options - Options object
 * @param {string} options.fontClass - Font class to apply (optional)
 * @param {string} options.text - Text content to analyze (optional)
 * @param {boolean|'important'} options.setTextAlign - Off: false, On: true, with !important: 'important'
 */
function setTextDirectionAndFont(element, options = {}) {
    if (!isRtlEngineActive()) {
        return 'auto';
    }
    const {
        fontClass = 'FontSet',
        text: providedText = null,
        setTextAlign = false,
        applyFontIfRtl = false
    } = options;
    const ignoreSelector = getIgnoreSelector(options);
    
    // اگر متن پاس شده، از اون استفاده کن، وگرنه textWithoutLinks محاسبه کن
    let textToUse;
    if (providedText) {
        textToUse = providedText;
    } else {
        // متن رو بدون محتوای تگ a برای تشخیص جهت استفاده کن
        textToUse = getAnalyzableText(AQ(element), { ignoreSelector });
        
        // اگر text() خالی بود، val() رو چک کن (برای input/textarea)
        if (!textToUse || !textToUse.trim()) {
            textToUse = AQ(element).val();
            if (textToUse) {
                textToUse = textToUse.trim();
            }
        }
    }
    
    if (!textToUse || !textToUse.trim()) return 'auto';
    
    const direction = detectTextDirection(textToUse);
    
    // If detectTextDirection returns empty or null, use 'auto'
    const finalDirection = direction || 'auto';

    if (DEBUG_MODE && ignoreSelector) {
        console.log('ignoreSelector analyzed text', {
            element: unwrapElement(element),
            selector: ignoreSelector,
            text: textToUse,
            direction: finalDirection
        });
    }

        // AQ(element).attr('data-text', textToUse)
        AQ(element).attr('data-direction', finalDirection)

    AQ(element).attr("dir", finalDirection);
    if (fontClass) {
        if (!applyFontIfRtl || finalDirection === 'rtl') {
            AQ(element).addClass(fontClass);
        } else {
            AQ(element).removeClass(fontClass);
        }
    }
    
    // Set text alignment if setTextAlign is enabled (true or 'important')
    if (finalDirection !== 'auto') {
        applyTextAlignByDirection(element, finalDirection, setTextAlign);
    }

    if (finalDirection === 'rtl') {
        flipRtlArrowsInTree(element);
    }
    
    return finalDirection;
}

/**
 * Process paragraph elements that may contain <br> tags
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} fontClass - Font class to apply (optional)
 */
function processParagraphWithBreaks(element, fontClass = 'FontSet' , setTextAlign) {
    if (!isRtlEngineActive()) {
        return;
    }
    const $element = AQ(element);
    const el = unwrapElement($element);
    
    // Check if already processed using data attribute
    if ($element.data('rtl-processed')) {
        return;
    }

    // KaTeX keeps real newlines in MathML / TeX annotations. Splitting innerHTML
    // by those newlines destroys the formula. Wrapping the fragments in <div>
    // inside a <p> then makes the browser close the paragraph and emit extra <p>s.
    if (containsStructuredMarkup(el)) {
        setTextDirectionAndFont(element, { fontClass, setTextAlign });
        skipStructuredMedia($element);
        $element.data('rtl-processed', true);
        return;
    }
    
    // Process each line separated by <br> tags or line break characters
    const htmlContent = $element.html();
    const hasNestedElements = Boolean(el && el.children && el.children.length > 0);
    const hasBrTags = Boolean(htmlContent && /<br\b/i.test(htmlContent));
    // Only treat \n as a visual break in plain text. Nested HTML (KaTeX, SVG, ...)
    // often contains newlines that are not rendered as line breaks.
    const hasTextNodeLineBreaks = Boolean(htmlContent && !hasNestedElements && /[\n\r]/.test(htmlContent));
    
    if (hasBrTags || hasTextNodeLineBreaks) {
        let parts = hasBrTags ? htmlContent.split(/<br[^>]*>/i) : htmlContent.split(/[\n\r]/);
        


        // If we have multiple parts with different directions, we need to restructure
        if (parts.length > 1) {
            const directions = [];
            const texts = [];
            
            parts.forEach((part, index) => {
                if (part.trim()) {
                    const tempDiv = AQ('<div>').html(part);
                    const cleanText = tempDiv.text().trim();
                    
                    if (cleanText) {
                        const direction = detectTextDirection(cleanText);
                        directions.push(direction);
                        texts.push(cleanText);
                    }
                }
            });
            
            // Check if we have mixed directions
            const uniqueDirections = [...new Set(directions)];
            
            if (uniqueDirections.length > 1) {
                // <p> cannot contain <div>; the parser would close the paragraph.
                const wrapperTag = el && el.tagName && el.tagName.toLowerCase() === 'p' ? 'span' : 'div';
                const wrapperStyle = wrapperTag === 'span' ? ' style="display:block"' : '';
                let newHtml = '';
                parts.forEach((part, index) => {
                    if (part.trim()) {
                        const tempDiv = AQ('<div>').html(part);
                        const cleanText = tempDiv.text().trim();
                        
                        if (cleanText) {
                            const direction = detectTextDirection(cleanText);
                            const divClass = fontClass ? ` class="${fontClass}"` : '';
                            newHtml += `<${wrapperTag}${divClass} dir="${direction}" data-rtl-processed="true"${wrapperStyle}>${part}</${wrapperTag}>`;
                        }
                    }
                });
                
                // Replace the content
                $element.html(newHtml);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
            } else {
                // All parts have the same direction, apply to the main element
                $element.attr("dir", directions[0]);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
            }
        } else {
            // Single part, process normally
            const mainText = $element.text();
            if (mainText && mainText.trim()) {
                setTextDirectionAndFont(element, { fontClass, setTextAlign });
                $element.data('rtl-processed', true);
            }
        }
    } else {
        // No <br> tags, process normally
        const mainText = $element.text();
        if (mainText && mainText.trim()) {
            setTextDirectionAndFont(element, { fontClass, text: mainText, setTextAlign });
            $element.data('rtl-processed', true);
        }
    }
}




const TABLE_STRUCTURE_SELECTOR = 'table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col';
const TABLE_CELL_SELECTOR = 'th, td, caption';
const ARIA_TABLE_STRUCTURE_SELECTOR = '[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]';
const ARIA_TABLE_CELL_SELECTOR = '[role="cell"], [role="columnheader"], [role="rowheader"]';
const TABLE_FONT_SKIP_SELECTOR = `${CODE_BLOCK_SELECTOR}, ${KATEX_SELECTOR}, svg, math`;

function applyFontClassToTableContents($table, fontClass, structureSelector, cellSelector) {
    if (!fontClass || !$table || !$table.length) {
        return;
    }

    $table.addClass(fontClass);
    $table.find(structureSelector).addClass(fontClass);
    $table.find(cellSelector).find(INNER_DIR_TARGET_SELECTOR).each(function() {
        try {
            if (this.closest(TABLE_FONT_SKIP_SELECTOR)) {
                return;
            }
        } catch {
            return;
        }
        AQ(this).addClass(fontClass);
    });
}

/**
 * Process tables in container with unified direction decision
 * @param {jQuery} container - Container to search in
 * @param {Object} options - Options object
 * @param {string} options.fontClass - Font class to apply (optional, default: 'FontSet')
 * @param {string} options.processedClass - Class to mark processed elements (optional, default: 'AsOk')
 * @param {string} options.siteConfig - Site configuration for specific optimizations (optional)
 * @param {boolean|'important'} options.setTextAlign - Whether to set text alignment (default: true); pass 'important' to use !important
 */
export function processTablesInContainer(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        siteConfig = null,
        setTextAlign = true
    } = options;
    // Find all table elements in the container

 

    container.find('table').each(function() {
        const $table = AQ(this);




        console.log('siteConfig', siteConfig);
        setDebugAttr($table, 'data-debug-mode-site', siteConfig);
        setDebugAttr($table, 'data-debug-mode-2', 'table-element');

        // $table.addClass('red');
        
        // Check if all table items are already processed
        const allTableItems = $table.find('th, td, caption, tr');
        const unprocessedItems = allTableItems.filter(function() {
            return !AQ(this).hasClass(processedClass);
        });
        
        // If all structural items are processed, still ensure FontSet on inner sections
        if (unprocessedItems.length === 0) {
            applyFontClassToTableContents($table, fontClass, TABLE_STRUCTURE_SELECTOR, TABLE_CELL_SELECTOR);
            return;
        }
        
        // If no unprocessed items, continue processing
        
        // Collect all text content from the entire table

        console.log("processTablesInContainer", $table)


        let allTableText = '';
        const tableElements = $table.find('th, td, caption').add($table.find('tr').not(':has(th, td)'));
        
        tableElements.each(function() {
            const text = AQ(this).text();
            if (text && text.trim()) {
                allTableText += ' ' + text.trim();
            }
        });
        
        // Make unified direction decision for entire table
        if (allTableText.trim()) {
            const tableDirection = detectTextDirection(allTableText.trim());
            
            // Apply direction to table and all its elements
            $table.attr('dir', tableDirection);
            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').attr('dir', tableDirection);
            
            // If site is ChatGPT and table is RTL, add AsJustRtl class and set direction manually
            if (siteConfig === 'chatgpt' && tableDirection === 'rtl') {
                $table[0].style.setProperty('direction', 'rtl', 'important');
                $table.find('th, td, caption').each(function() {
                    this.style.setProperty('direction', 'rtl', 'important');
                });
            }
            
            // If tbody is RTL, search for mask-image in parent elements (for Grok)
            if (tableDirection === 'rtl' && siteConfig === 'grok') {
                const $tbody = $table.find('tbody');
                if ($tbody.length > 0) {
                    // Search for mask-image in parent elements
                    let $current = $table;
                    while ($current.length > 0 && $current[0] !== document.body && $current[0] !== container[0]) {
                        const maskImage = $current.css('mask-image');
                        if (maskImage && maskImage !== 'none') {
                            console.log('Checking element for mask-image:', $current[0], 'current mask-image:', maskImage);
                        
                 
                            // Add class to mark that mask-image has been applied
                            $current.addClass('rtl-mask-applied');
                            
                            console.log('Applied mask-image to element:', $current[0]);
                        }
                        
                        // Search for .absolute.top-1.right-1 elements in current parent
                        const $absoluteElements = $current.find('.absolute.top-1.right-1');
                        if ($absoluteElements.length > 0) {
                            console.log('Found .absolute.top-1.right-1 elements:', $absoluteElements.length, 'in parent:', $current[0]);
                            // Change right-1 to left for RTL optimization
                            $absoluteElements.each(function() {
                                AQ(this).removeClass('right-1').addClass('left-1');
                                console.log('Changed right-1 to left-1 for element:', this);
                            });
                        }
                        
                        $current = $current.parent();
                    }
                }
            }
            
            // Set text alignment for all cells based on table direction
            applyTextAlignByDirection($table.find('th, td'), tableDirection, setTextAlign);
            if (tableDirection === 'rtl') {
                $table.find('.text-left').removeClass('text-left');
                $table.removeClass('text-left');
            }
            
            



            applyFontClassToTableContents($table, fontClass, TABLE_STRUCTURE_SELECTOR, TABLE_CELL_SELECTOR);
            
            // Mark all table elements as processed
            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').addClass(processedClass);
            
            // console.log(`Table processed with direction: ${tableDirection}, Text: ${allTableText.substring(0, 100)}...`);
        }
    });
    
    // Also process ARIA table roles
    container.find('[role="table"]').each(function() {
        const $table = AQ(this);
        
        // Check if all ARIA table items are already processed
        const allAriaTableItems = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"], [role="row"]');
        const unprocessedAriaItems = allAriaTableItems.filter(function() {
            return !AQ(this).hasClass(processedClass);
        });
        
        if (unprocessedAriaItems.length === 0) {
            applyFontClassToTableContents($table, fontClass, ARIA_TABLE_STRUCTURE_SELECTOR, ARIA_TABLE_CELL_SELECTOR);
            return;
        }
        
        // console.log("processTablesInContainer", $table)


        // If no unprocessed items, continue processing
        
        // Collect all text content from the entire table
        let allTableText = '';
        const tableElements = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]');
        
        tableElements.each(function() {
            const text = AQ(this).text();
            if (text && text.trim()) {
                allTableText += ' ' + text.trim();
            }
        });
        
        // Make unified direction decision for entire table
        if (allTableText.trim()) {
            const tableDirection = detectTextDirection(allTableText.trim());
            
            // Apply direction to table and all its elements
            $table.attr('dir', tableDirection);
            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').attr('dir', tableDirection);
            
            // If site is ChatGPT and table is RTL, add AsJustRtl class and set direction manually
            if (siteConfig === 'chatgpt' && tableDirection === 'rtl') {
                $table.addClass('AsJustRtl');
                $table[0].style.setProperty('direction', 'rtl', 'important');
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').each(function() {
                    this.style.setProperty('direction', 'rtl', 'important');
                });
            }
            
            // Set text alignment for all cells based on table direction
            applyTextAlignByDirection(
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]'),
                tableDirection,
                setTextAlign
            );
            if (tableDirection === 'rtl') {
                $table.find('.text-left').removeClass('text-left');
                $table.removeClass('text-left');
            }
            
            applyFontClassToTableContents($table, fontClass, ARIA_TABLE_STRUCTURE_SELECTOR, ARIA_TABLE_CELL_SELECTOR);
            
            // Mark all table elements as processed
            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').addClass(processedClass);
            
            // console.log(`ARIA Table processed with direction: ${tableDirection}, Text: ${allTableText.substring(0, 100)}...`);
        }
    });
}

/**
 * Advanced recursive text processing function that examines all elements
 * @param {jQuery} container - Container to search in
 * @param {string} fontClass - Font class to apply (optional)
 * @param {string} processedClass - Class to mark processed elements (optional)
 * @param {boolean} isContainer - Whether this is a container element (optional)
 */
function processTextElementsAdvanced(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    try {
    let {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        isContainer = false,
        skipTags = [],
        removeSkipTags = [],
        setTextAlign = false,
        removeDirAuto = false,
        endTyping = false,
        codeFontClass
    } = options;
    // console.log(`processTextElemntsAdvanced  ` , container[0] , {
    //     setTextAlign,
    //     isContainer
    // });


   let mainContainer = false;
    // If this is a container, process tables first
    if (isContainer) {
        // processTablesInContainer(container, {
        //     fontClass,
        //     processedClass,
        //     siteConfig: options.siteConfig
        // });

        mainContainer = container
        // برای همه المان‌هایی که allSkipTags هستن فونت ست کن (به جز تگ‌های کد)
        const allTagsSetFont = [...FORMATTING_TAGS, ...skipTags].filter(tag => 
            !['code', 'pre'].includes(tag)
        );
        container.find(allTagsSetFont.join(',')).each(function() {
            const $element = AQ(this);
            if (!$element.hasClass(fontClass)) {
                $element.addClass(fontClass);
            }
        });


   
    }


    if (removeDirAuto) {
        container.find('*[dir="auto"]').each(function() {
            if (!AQ(this).hasClass("removeedDirAuto")) {
                AQ(this).removeAttr('dir').addClass("removeedDirAuto");
            }
        });
    }


    // Combine FORMATTING_TAGS with skipTags, then remove specified tags
    const allSkipTags = [...FORMATTING_TAGS, ...skipTags].filter(tag => 
        !removeSkipTags.includes(tag)
    );

    // Get only direct children of the container
    const allElements = container.children();
    
    allElements.each(function() {
        const $element = AQ(this);
        
        // Skip if already processed
        if ($element.hasClass(processedClass)) {
            return;
        }
        
        // Mark as processed
       
        
        // Get element tag name
        const tagName = this.tagName.toLowerCase();
        
    
        
        // Process header elements normally
        if ( ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {


            // If not processed, process normally
            // 

            const textToUse = $element.text();


         

            
            const direction = detectTextDirection(textToUse);

            console.log('textToUse', textToUse , 'direction', direction);

             $element.attr("dir", direction);
            if (fontClass) {
                $element.addClass(fontClass);
            }
            
            applyTextAlignByDirection($element, direction, setTextAlign);



        
        
            // // let dir = setTextDirectionAndFont(this, { fontClass, setTextAlign });

            AQ(this).attr('data-org-dir', direction);

            // If this is a main container, check all similar header tags and set direction based on majority

            
            // if (!endTyping) {
            //     return;
            // }
            // $element.addClass(processedClass);

            // Check mixedTitleDisplayMode setting
            // Default to 'unified' if not set
            const mixedTitleMode = mixedTitleDisplayModeCache;
            if (mixedTitleMode === 'unified' && mainContainer) {
                    const allHeaders = mainContainer.find(tagName);
                    let rtlCount = 0;
                    let ltrCount = 0;
                    
                    // Count directions of all headers
                    allHeaders.each(function() {
                        const headerDir = AQ(this).attr('data-org-dir');
                        if (headerDir === 'rtl') {
                            rtlCount++;
                        } else if (headerDir === 'ltr') {
                            ltrCount++;
                        }
                    });
                    
                    // Determine majority direction
                    let majorityDir;
                    if (rtlCount >= ltrCount) {
                        majorityDir = 'rtl';
                    } else if (ltrCount > rtlCount) {
                        majorityDir = 'ltr';
                    } 
                    
                    // Apply majority direction to all headers if we have a majority
                    if (majorityDir) {
                        mainContainer.find(tagName).each(function() {
                            AQ(this).attr('dir', majorityDir);
                
                            applyTextAlignByDirection(this, majorityDir, setTextAlign);
                        });
                        
                        console.log(`Header ${tagName} direction set to ${majorityDir} (RTL: ${rtlCount}, LTR: ${ltrCount}) - Unified mode`);
                    }
                }
                // In individual mode, each header keeps its own direction (already set above)

            setDebugAttr($element, 'data-debug-mode', 'header-processed');
            return;
        }
        
        // Skip ms-code-block elements completely (for AI Studio code sections)
        if (tagName === 'ms-code-block') {
            // console.log("processTextElementsAdvanced: ms-code-block skipped", $element);
            setDebugAttr($element, 'data-debug-mode', 'ms-code-block-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip formatting tags completely

   
        if (allSkipTags.includes(tagName)) {
            setDebugAttr($element, 'data-debug-mode', 'formatting-tag-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip table elements and elements with table roles (they are handled by processTablesInContainer)
        const tableRoles = ['table', 'row', 'cell', 'columnheader', 'rowheader'];
        const elementRole = $element.attr('role');
        
        // Check if it's a table HTML tag
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(tagName)) {
            setDebugAttr($element, 'data-debug-mode', 'table-element-skipped');
            return;
        }
        
        // Check if it has table role attribute
        if (elementRole && tableRoles.includes(elementRole)) {
            setDebugAttr($element, 'data-debug-mode', 'table-role-skipped');
            return;
        }
        
        // Handle li elements that are inside ol or ul
        if (tagName === 'li' && ($element.parent().is('ol') || $element.parent().is('ul'))) {
            // Check if li contains pre or code elements
            const hasPreOrCode = $element.find(`pre, code, .cm-content, .cm-editor, ${CUSTOM_CODE_BLOCK_SELECTOR}`).length > 0;
            
            if (hasPreOrCode) {
                processCodeLikeElement($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            } else {
                // If li doesn't contain pre or code, skip processing
                setDebugAttr($element, 'data-debug-mode', 'li-inside-list-skipped');
                // Don't mark as processed, just skip processing
            }
            return;
        }
        
        // Skip div elements with rounded-xl class (for Copilot code sections),
        // unless they wrap a code editor that should follow the code setting
        if (tagName === 'div' && $element.hasClass('rounded-xl')) {
            const $innerCode = $element.find(CODE_BLOCK_SELECTOR);
            if ($innerCode.length) {
                $innerCode.each(function() {
                    const $inner = AQ(this);
                    if (isCodeMirrorCodeBlock($inner)) {
                        processCodeMirrorBlock($inner, this, { fontClass, setTextAlign, processedClass, codeFontClass });
                    } else {
                        processCodeLikeElement($inner, this, { fontClass, setTextAlign, processedClass, codeFontClass });
                    }
                });
                $element.addClass(processedClass);
                $element.find('*').addClass(processedClass);
                return;
            }
            setDebugAttr($element, 'data-debug-mode', 'div-rounded-xl-skipped');
            $element.find('*').addClass(processedClass);
            return;
        }
        

        if (tagName === 'button') {
            setDebugAttr($element, 'data-debug-mode', 'div-rounded-xl-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }

        if (isLockedMarkdownEditor(this, options.onlyCss)) {
            setDebugAttr($element, 'data-debug-mode', 'locked-markdown-editor-skipped');
            return;
        }
        


        // Special handling for div elements with ds-scroll-area class
        if (tagName === 'div' && $element.hasClass('ds-scroll-area')) {
            setDebugAttr($element, 'data-debug-mode', 'div-ds-scroll-area-processed');
            const text = $element.text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $element.attr('dir', direction);
                if (fontClass) {
                    $element.addClass(fontClass);
                }
                $element.addClass('AsOk2');
            }
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            $element.addClass(processedClass);
            return;
        }
        
        // CodeMirror / markdown code editors (ChatGPT cm-content, DeepSeek md-code-block, ...)
        if (tagName === 'div' && isCodeMirrorCodeBlock($element)) {
            processCodeMirrorBlock($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        // Custom code boxes that don't use pre/code (data-language, data-streamdown="code-block")
        if (isCustomCodeBlock($element)) {
            processCodeLikeElement($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        // Skip KaTeX / MathML / SVG (Mermaid charts) — do not rewrite their HTML
        if (isKatexTreeElement(this) || isSvgTreeElement(this)) {
            setDebugAttr($element, 'data-debug-mode', 'structured-media-skipped');
            $element.attr("dir", "ltr");
            $element.find('*').addClass(processedClass);
            $element.addClass(processedClass);
            return;
        }

        
        // Skip table elements - they are processed by processTablesInContainer
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(tagName)) {
            $element.attr('data-debug-mode', 'table-element-skipped');
            // Mark all children as processed without processing them
            return;
        }
        
        // Special handling for code elements - use code detection algorithm
        if (['pre', 'code'].includes(tagName)) {
            processCodeLikeElement($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        
        // Special handling for paragraph or span elements with line breaks
         if (tagName === 'p' || tagName === 'span' || tagName === 'text') {
            if (containsStructuredMarkup(this)) {
                setDebugAttr($element, 'data-debug-mode', 'paragraph-with-structured-media');
                setTextDirectionAndFont(this, { fontClass, setTextAlign });
                skipStructuredMedia($element, processedClass);
                $element.addClass(processedClass);
                return;
            }

            // Check if element only contains line break elements or whitespace
            const children = $element.children();
            const textContent = $element.text().trim();
            const htmlContent = $element.html();
            
            // Check if element only contains br elements
            const onlyBrElements = children.length > 0 && children.filter(function() {
                const tag = this.tagName.toLowerCase();
                return tag === 'br';
            }).length === children.length;
            
            // Check if element contains only whitespace characters (including \n, \r, spaces, tabs)
            const onlyWhitespace = textContent === '' || /^[\s\n\r\t]+$/.test(textContent);
            
            // Nested HTML (KaTeX, pretty-printed spans) often has \n that are not visual breaks.
            // Only treat newlines as line breaks when there are no nested elements, or when <br> exists.
            const hasBrTags = /<br\b/i.test(htmlContent);
            const containsLineBreaks = hasBrTags || (children.length === 0 && /[\n\r]/.test(htmlContent));

  
            if (onlyBrElements || onlyWhitespace || containsLineBreaks) {
                $element.addClass(processedClass);
                processParagraphWithBreaks(this, fontClass, setTextAlign);

                return;
            } 
        }
        // For all other elements, check if they have children (excluding formatting tags)
       
            // Count children excluding formatting tags
            const nonFormattingChildren = $element.children().filter(function() {
                return !allSkipTags.includes(this.tagName.toLowerCase());
            });
            const hasChildren = nonFormattingChildren.length > 0;
            
            if (hasChildren) {
                // حالت 1: المان فرزند غیرفرمت‌بندی دارد
                // بررسی اینکه آیا همه فرزندان فرمت‌بندی هستند یا نه
                const allChildren = $element.children();
                const formattingChildren = allChildren.filter(function() {
                    return allSkipTags.includes(this.tagName.toLowerCase());
                });
                
                if (formattingChildren.length === allChildren.length) {
                    // حالت 2: همه فرزندان allSkipTags هستند
                        setDebugAttr($element, 'data-debug-mode', 'all-formatting-tags');
                
                        setTextDirectionAndFont(this, { fontClass, setTextAlign });
                     $element.addClass(processedClass);
                } else if (formattingChildren.length > 0) {
                    // حالت 3: فقط بعضی از فرزندان allSkipTags هستند
                    setDebugAttr($element, 'data-debug-mode', 'mixed-children');
                   
                        setTextDirectionAndFont(this, { fontClass, setTextAlign });
                

                    $element.addClass(processedClass);


                } else {
                    // حالت 4: هیچ فرزندی allSkipTags نیست
               
                    
                    // اگر المان ol یا ul هست، جدا تصمیم بگیر
                    if (tagName === 'ol' || tagName === 'ul') {
                        setDebugAttr($element, 'data-debug-mode', 'list-processing');
                        setDebugAttr($element, 'data-as-mode', 'list-processing');
                        
                        // آیتم‌های داخل لیست رو مستقل بررسی کن
                        const listItems = $element.children('li');
                        let processedCount = 0;
                        let unprocessedCount = 0;
                        
                        listItems.each(function() {
                            const $li = AQ(this);
                            if ($li.hasClass(processedClass)) {
                                processedCount++;
                            } else {
                                unprocessedCount++;
                                
                                // بررسی اولین چیلد - اگر strong بود، از محتوای strong استفاده کن
                                // const firstChild = $li.children().first();
                                // let textForDirection = null;
                                
                                // if (firstChild.length && firstChild.is('strong')) {
                                //     textForDirection = firstChild.text().trim();
                                //     $li.attr('data-debug-mode', 'li-first-child-strong');
                                // }
                                setTextDirectionAndFont(this, { 
                                    fontClass, 
                                    setTextAlign,
                                    // text: textForDirection 
                                });
                                
                                // آیتم‌های پردازش نشده رو با setTextDirectionAndFont پردازش کن
                            

                                $li.find(CODE_BLOCK_SELECTOR).each(function() {
                                    processCodeBlockNode(AQ(this), { fontClass, setTextAlign, processedClass, codeFontClass });
                                })

                            }
                        });
                        
                        // بر اساس جهت آیتم‌های لیست، جهت اصل لیست رو تعیین کن
                        const processedItems = $element.find('li[dir]');
                        let rtlCount = 0;
                        let ltrCount = 0;
                        
                        processedItems.each(function() {
                            const dir = AQ(this).attr('data-direction');
                            if (dir === 'rtl') {
                                rtlCount++;
                            } else if (dir === 'ltr') {
                                ltrCount++;
                            }
                        });
                        
                        let listDirection;
                        let debugReason;
                        if (rtlCount > ltrCount) {
                            listDirection = 'rtl';
                            debugReason = `list-rtl-majority-${rtlCount}-${ltrCount}`;
                        } else if (ltrCount > rtlCount) {
                            listDirection = 'ltr';
                            debugReason = `list-ltr-majority-${ltrCount}-${rtlCount}`;
                        } else {
                            // اگر تعداد مساوی باشه، به المنت قبل نگاه کن
                            const prevElementDir = $element.prev().attr('dir');
                            if (prevElementDir && (prevElementDir === 'rtl' || prevElementDir === 'ltr')) {
                                listDirection = prevElementDir;
                                debugReason = `list-prev-dir-${prevElementDir}`;
                            } else {
                                // اگر المنت قبلی وجود نداشت، تعداد کلمات فارسی و انگلیسی رو بشمار
                                const listText = $element.text().trim();
                                if (listText) {
                                    const persianWords = (listText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g) || []).length;
                                    const englishWords = (listText.match(/[a-zA-Z]+/g) || []).length;
                                    
                                    if (persianWords > englishWords) {
                                        listDirection = 'rtl';
                                        debugReason = `list-persian-words-${persianWords}-${englishWords}`;
                                    } else if (englishWords > persianWords) {
                                        listDirection = 'ltr';
                                        debugReason = `list-english-words-${englishWords}-${persianWords}`;
                                    } else {
                                        listDirection = 'ltr';
                                        debugReason = 'list-words-equal-default-ltr';
                                    }
                                } else {
                                    listDirection = 'ltr';
                                    debugReason = 'list-default-ltr';
                                }
                            }
                        }
                        
              
                        // جهت آیتم‌ها رو به جهت لیست تغییر بده
                        processedItems.each(function() {

                            AQ(this).attr('data-org-dir',  AQ(this).attr('dir'));

                            // AQ(this).attr('data-dir', listDirection);
                           
                            AQ(this).attr('dir', listDirection);
                            
                            applyTextAlignByDirection(this, listDirection, setTextAlign);
                           
                        });
                        
                        $element.attr('dir', listDirection);
                        setDebugAttr($element, 'data-debug-reason', debugReason);
                        setDebugAttr($element, 'data-debug-processed', `${processedCount}-${unprocessedCount}`);
                        
                        applyTextAlignByDirection($element, listDirection, setTextAlign);
                        
                    } else {
                        // برای سایر المان‌ها، پردازش بازگشتی انجام بده
                        processTextElementsAdvanced($element, {
                            fontClass,
                            processedClass,
                            isContainer: false,
                            skipTags,
                            removeSkipTags,
                            setTextAlign
                        });

                        // برای خود المان هم تصمیم بگیر
                    
                            setTextDirectionAndFont(this, { fontClass, setTextAlign });
                        

                        setDebugAttr($element, 'data-debug-mode', 'no-formatting-children');
                    }
                }
            } else {
                // حالت 5: المان فرزند ندارد
                setDebugAttr($element, 'data-debug-mode', 'no-children');
                
                // اگر المان مادرش در حالت list-processing باشه، پردازش نکن
                if ($element.parent().attr('data-as-mode') === 'list-processing') {
                    setDebugAttr($element, 'data-debug-mode', 'no-children-skipped-list-parent');
                    return;
                }
                // console.log("setTextDirectionAndFont no-children", $element , setTextAlign);
                
             $element.addClass(processedClass);
                 setTextDirectionAndFont($element, { fontClass, setTextAlign });
                
            }
        
    });
    flipRtlArrowsInTree(container);
    } catch (error) {
        if (isInvalidatedError(error)) {
            return;
        }
        throw error;
    }
}



/**
 * Get common attribute selectors for text content
 * @returns {Array} Array of CSS selectors for elements with text attributes
 */
function getAttributeTextElements() {
    return [
        "[title]", "[alt]", "[aria-label]"
    ];
}

/**
 * Locked ProseMirror editors revert DOM edits on children.
 * Style them from a stylesheet keyed by an id on the editor root.
 */
const LOCKED_EDITOR_STYLE_ID = 'ai-rtl-locked-editor-css';
const DEFAULT_LOCKED_EDITOR_SELECTOR = '.ProseMirror.markdown[contenteditable]';
const LOCKED_EDITOR_BLOCK_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol'];
const LOCKED_EDITOR_HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const lockedEditorCssById = new Map();
const lockedBlockquoteOriginals = new Map();
let lockedEditorSeq = 0;

const BLOCKQUOTE_MIRROR_ATTR = 'data-ai-rtl-bq-mirrored';
const BLOCKQUOTE_TW_CLASS_ATTR = 'data-ai-rtl-bq-tw';
const BLOCKQUOTE_BOX_PROPS = [
    'padding-left', 'padding-right',
    'border-left-width', 'border-right-width',
    'border-left-style', 'border-right-style',
    'border-left-color', 'border-right-color'
];
const BLOCKQUOTE_TW_SKIP_TAGS = {
    ul: true, ol: true, li: true, pre: true, code: true,
    table: true, thead: true, tbody: true, tfoot: true,
    tr: true, th: true, td: true, svg: true, math: true
};
const TW_BOX_SIDE_UTIL_RE = /^(?:p|m|scroll-p|scroll-m)(l|r)-/;
const TW_BORDER_SIDE_UTIL_RE = /^border-(l|r)(?:-|$)/;

function readBlockquoteBoxSides(el) {
    const cs = getComputedStyle(el);
    return {
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        borderLeftWidth: cs.borderLeftWidth,
        borderRightWidth: cs.borderRightWidth,
        borderLeftStyle: cs.borderLeftStyle,
        borderRightStyle: cs.borderRightStyle,
        borderLeftColor: cs.borderLeftColor,
        borderRightColor: cs.borderRightColor
    };
}

function blockquoteHasQuoteBarOnLeft(sides) {
    const leftBorder = parseFloat(sides.borderLeftWidth) || 0;
    const rightBorder = parseFloat(sides.borderRightWidth) || 0;
    const leftPadding = parseFloat(sides.paddingLeft) || 0;
    const rightPadding = parseFloat(sides.paddingRight) || 0;
    return leftBorder > rightBorder || (leftBorder === rightBorder && leftPadding > rightPadding);
}

function mirroredBlockquoteDeclarations(sides) {
    return [
        `padding-left:${sides.paddingRight}!important`,
        `padding-right:${sides.paddingLeft}!important`,
        `border-left-width:${sides.borderRightWidth}!important`,
        `border-right-width:${sides.borderLeftWidth}!important`,
        `border-left-style:${sides.borderRightStyle}!important`,
        `border-right-style:${sides.borderLeftStyle}!important`,
        `border-left-color:${sides.borderRightColor}!important`,
        `border-right-color:${sides.borderLeftColor}!important`
    ].join(';') + ';';
}

function buildMirroredBlockquoteCss(el, cacheKey) {
    try {
        let original = lockedBlockquoteOriginals.get(cacheKey);
        if (!original) {
            original = readBlockquoteBoxSides(el);
            lockedBlockquoteOriginals.set(cacheKey, original);
        }
        if (!blockquoteHasQuoteBarOnLeft(original)) {
            return '';
        }
        return mirroredBlockquoteDeclarations(original);
    } catch {
        return '';
    }
}

function isElementDirectionRtl(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    const dirAttr = (el.getAttribute('dir') || el.getAttribute('data-direction') || '').toLowerCase();
    if (dirAttr === 'rtl') {
        return true;
    }
    if (dirAttr === 'ltr') {
        return false;
    }
    try {
        return getComputedStyle(el).direction === 'rtl';
    } catch {
        return false;
    }
}

function splitTailwindClass(token) {
    let depth = 0;
    let lastColon = -1;
    for (let i = 0; i < token.length; i++) {
        const ch = token[i];
        if (ch === '[') {
            depth += 1;
        } else if (ch === ']') {
            depth -= 1;
        } else if (ch === ':' && depth === 0) {
            lastColon = i;
        }
    }
    if (lastColon === -1) {
        return { prefix: '', utility: token };
    }
    return {
        prefix: token.slice(0, lastColon + 1),
        utility: token.slice(lastColon + 1)
    };
}

function swapTailwindBoxSideUtility(utility) {
    let important = '';
    let value = utility;
    if (value.charAt(0) === '!') {
        important = '!';
        value = value.slice(1);
    }

    let match = value.match(TW_BOX_SIDE_UTIL_RE);
    if (match) {
        const side = match[1] === 'l' ? 'r' : 'l';
        return important + value.slice(0, match[0].length - 2) + side + '-' + value.slice(match[0].length);
    }

    match = value.match(TW_BORDER_SIDE_UTIL_RE);
    if (match) {
        const side = match[1] === 'l' ? 'r' : 'l';
        return important + 'border-' + side + value.slice(match[0].length);
    }

    return utility;
}

function swapTailwindBoxSideToken(token) {
    const { prefix, utility } = splitTailwindClass(token);
    const swapped = swapTailwindBoxSideUtility(utility);
    if (swapped === utility) {
        return token;
    }
    return prefix + swapped;
}

function getTailwindBoxSide(token) {
    const { utility } = splitTailwindClass(token);
    const value = utility.charAt(0) === '!' ? utility.slice(1) : utility;
    const boxMatch = value.match(TW_BOX_SIDE_UTIL_RE);
    if (boxMatch) {
        return boxMatch[1];
    }
    const borderMatch = value.match(TW_BORDER_SIDE_UTIL_RE);
    if (borderMatch) {
        return borderMatch[1];
    }
    return '';
}

function inspectTailwindBoxSides(className) {
    const result = { hasLeft: false, hasRight: false, hasAny: false };
    if (!className) {
        return result;
    }
    const tokens = className.split(/\s+/);
    for (let i = 0; i < tokens.length; i++) {
        const side = getTailwindBoxSide(tokens[i]);
        if (!side) {
            continue;
        }
        result.hasAny = true;
        if (side === 'l') {
            result.hasLeft = true;
        } else {
            result.hasRight = true;
        }
    }
    return result;
}

function swapTailwindBoxSideClassName(className) {
    if (!className) {
        return className;
    }
    return className.split(/\s+/).filter(Boolean).map(swapTailwindBoxSideToken).join(' ');
}

function applyMirroredBlockquoteStyles(el, sides) {
    el.style.setProperty('padding-left', sides.paddingRight, 'important');
    el.style.setProperty('padding-right', sides.paddingLeft, 'important');
    el.style.setProperty('border-left-width', sides.borderRightWidth, 'important');
    el.style.setProperty('border-right-width', sides.borderLeftWidth, 'important');
    el.style.setProperty('border-left-style', sides.borderRightStyle, 'important');
    el.style.setProperty('border-right-style', sides.borderLeftStyle, 'important');
    el.style.setProperty('border-left-color', sides.borderRightColor, 'important');
    el.style.setProperty('border-right-color', sides.borderLeftColor, 'important');
}

function restoreBlockquoteClassName(el) {
    if (!el.hasAttribute(BLOCKQUOTE_TW_CLASS_ATTR)) {
        return;
    }
    el.setAttribute('class', el.getAttribute(BLOCKQUOTE_TW_CLASS_ATTR) || '');
    el.removeAttribute(BLOCKQUOTE_TW_CLASS_ATTR);
}

function clearMirroredBlockquoteStyles(el) {
    restoreBlockquoteClassName(el);
    for (let i = 0; i < BLOCKQUOTE_BOX_PROPS.length; i++) {
        el.style.removeProperty(BLOCKQUOTE_BOX_PROPS[i]);
    }
    el.removeAttribute(BLOCKQUOTE_MIRROR_ATTR);
}

function applyTailwindBlockquoteClassSwap(el) {
    const className = getElementClassName(el);
    const nextClassName = swapTailwindBoxSideClassName(className);
    if (nextClassName === className) {
        return false;
    }
    if (!el.hasAttribute(BLOCKQUOTE_TW_CLASS_ATTR)) {
        el.setAttribute(BLOCKQUOTE_TW_CLASS_ATTR, className);
    }
    el.setAttribute('class', nextClassName);
    el.setAttribute(BLOCKQUOTE_MIRROR_ATTR, '1');
    return true;
}

function isInsideNestedBlockquote(node, rootBlockquote) {
    let parent = node.parentElement;
    while (parent && parent !== rootBlockquote) {
        if (parent.tagName === 'BLOCKQUOTE') {
            return true;
        }
        parent = parent.parentElement;
    }
    return false;
}

function forEachBlockquoteBoxTarget(blockquote, callback) {
    callback(blockquote);
    const nodes = blockquote.querySelectorAll('[class]');
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (BLOCKQUOTE_TW_SKIP_TAGS[node.tagName.toLowerCase()]) {
            continue;
        }
        if (isInsideNestedBlockquote(node, blockquote)) {
            continue;
        }
        if (!inspectTailwindBoxSides(getElementClassName(node)).hasAny) {
            continue;
        }
        callback(node);
    }
}

function mirrorRtlBlockquoteTarget(el) {
    const alreadyMirrored = el.getAttribute(BLOCKQUOTE_MIRROR_ATTR) === '1';
    const isRtl = isElementDirectionRtl(el);
    const twSides = inspectTailwindBoxSides(getElementClassName(el));

    if (!isRtl) {
        if (alreadyMirrored || el.hasAttribute(BLOCKQUOTE_TW_CLASS_ATTR)) {
            clearMirroredBlockquoteStyles(el);
        }
        return;
    }

    if (twSides.hasLeft) {
        applyTailwindBlockquoteClassSwap(el);
        return;
    }

    if (alreadyMirrored || twSides.hasRight) {
        return;
    }

    const sides = readBlockquoteBoxSides(el);
    if (!blockquoteHasQuoteBarOnLeft(sides)) {
        return;
    }

    applyMirroredBlockquoteStyles(el, sides);
    el.setAttribute(BLOCKQUOTE_MIRROR_ATTR, '1');
}

function mirrorRtlBlockquote(el) {
    forEachBlockquoteBoxTarget(el, mirrorRtlBlockquoteTarget);
}

function mirrorRtlBlockquotesInTree(element) {
    const root = element && element.jquery ? element[0] : element;
    if (!root || root.nodeType !== 1) {
        return;
    }

    if (root.tagName && root.tagName.toLowerCase() === 'blockquote') {
        mirrorRtlBlockquote(root);
    }

    const quotes = root.getElementsByTagName('blockquote');
    for (let i = 0; i < quotes.length; i++) {
        mirrorRtlBlockquote(quotes[i]);
    }
}

function normalizeOnlyCssOption(onlyCss) {
    if (onlyCss === true) {
        return true;
    }
    if (!onlyCss) {
        return '';
    }
    if (Array.isArray(onlyCss)) {
        return onlyCss.filter((item) => typeof item === 'string' && item.trim()).join(', ');
    }
    if (typeof onlyCss === 'string') {
        return onlyCss.trim();
    }
    return '';
}

function getLockedEditorSelector(onlyCss) {
    const normalized = normalizeOnlyCssOption(onlyCss);
    if (normalized === true) {
        return true;
    }
    if (normalized) {
        return normalized;
    }
    return DEFAULT_LOCKED_EDITOR_SELECTOR;
}

function shouldHandleElementByCss(element, onlyCss) {
    const el = element && element.jquery ? element[0] : element;
    if (!el || el.nodeType !== Node.ELEMENT_NODE || !el.matches) {
        return false;
    }
    if (el.getAttribute('data-ai-rtl-editor')) {
        return true;
    }
    const selector = getLockedEditorSelector(onlyCss);
    if (selector === true) {
        return true;
    }
    try {
        return el.matches(selector);
    } catch {
        return false;
    }
}

function isLockedMarkdownEditor(element, onlyCss) {
    return shouldHandleElementByCss(element, onlyCss);
}

function getLockedEditorId(element) {
    let editorId = element.getAttribute('data-ai-rtl-editor');
    if (!editorId) {
        lockedEditorSeq += 1;
        editorId = `e${lockedEditorSeq}`;
        element.setAttribute('data-ai-rtl-editor', editorId);
    }
    return editorId;
}

function flushLockedEditorStyles() {
    let styleEl = document.getElementById(LOCKED_EDITOR_STYLE_ID);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = LOCKED_EDITOR_STYLE_ID;
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = Array.from(lockedEditorCssById.values()).join('\n');
}

function lockedEditorDirRule(selector, direction, setTextAlign, extraCss = '') {
    const align = direction === 'rtl' ? 'right' : 'left';
    let rule = `${selector}{direction:${direction}!important;unicode-bidi:isolate;`;
    if (setTextAlign) {
        rule += `text-align:${align}!important;`;
    }
    if (selector.includes('>pre:') && direction !== 'rtl') {
        rule += 'font-family:revert!important;';
    }
    if (extraCss) {
        rule += extraCss;
    }
    return `${rule}}`;
}

function majorityDirection(directions) {
    let rtlCount = 0;
    let ltrCount = 0;
    directions.forEach((direction) => {
        if (direction === 'rtl') {
            rtlCount += 1;
        } else if (direction === 'ltr') {
            ltrCount += 1;
        }
    });
    if (rtlCount === 0 && ltrCount === 0) {
        return 'ltr';
    }
    return rtlCount >= ltrCount ? 'rtl' : 'ltr';
}

/**
 * advanced_section for editors whose child DOM cannot be mutated.
 * Assigns an id on the root, then targets p:nth-of-type, h3:nth-of-type, ...
 */
function processLockedEditorByCss(element, rtlAlgorithm, options = {}) {
    if (!isRtlEngineActive()) {
        return false;
    }
    rtlAlgorithm = resolveRtlAlgorithm(rtlAlgorithm);
    const el = element && element.jquery ? element[0] : element;
    if (!shouldHandleElementByCss(el, options.onlyCss)) {
        return false;
    }

    const fontClass = options.fontClass || 'FontSet';
    const setTextAlign = isTextAlignEnabled(options.setTextAlign);
    const $element = AQ(el);
    const processedClass = options.processedClass;
    const unifiedDirection = rtlAlgorithm === 'advanced_section'
        ? null
        : detectDirectionByAlgorithm(el.textContent || '', rtlAlgorithm);

    $element.addClass(`AsSetAlgorithm ${fontClass}`);
    if (processedClass) {
        $element.addClass(processedClass);
    }
    el.removeAttribute('dir');
    el.removeAttribute('data-direction');
    el.style.removeProperty('text-align');

    const editorId = getLockedEditorId(el);
    let contentSig = `${rtlAlgorithm}:${setTextAlign}:${mixedTitleDisplayModeCache || ''}|`;
    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        const text = (child.textContent || '').trim();
        contentSig += `${child.tagName}:${text.length}:${text.slice(0, 12)}:${text.slice(-12)}|`;
    }
    if (el.getAttribute('data-ai-rtl-sig') === contentSig && lockedEditorCssById.has(editorId)) {
        return true;
    }
    el.setAttribute('data-ai-rtl-sig', contentSig);

    const rootSelector = `[data-ai-rtl-editor="${editorId}"]`;
    const typeCount = {};
    const headingDirs = {};
    const blockRules = [];

    Array.from(el.children).forEach((child) => {
        const tagName = child.tagName.toLowerCase();
        if (!LOCKED_EDITOR_BLOCK_TAGS.includes(tagName)) {
            return;
        }

        typeCount[tagName] = (typeCount[tagName] || 0) + 1;
        const nth = typeCount[tagName];
        const selector = `${rootSelector}>${tagName}:nth-of-type(${nth})`;

        if (tagName === 'pre') {
            const preText = child.textContent || '';
            const preDirection = shouldApplyRtlToCodeBlock(preText) ? 'rtl' : 'ltr';
            blockRules.push({ selector, direction: preDirection });
            return;
        }

        if (tagName === 'ul' || tagName === 'ol') {
            const itemDirs = [];
            Array.from(child.children).forEach((item, itemIndex) => {
                if (item.tagName.toLowerCase() !== 'li') {
                    return;
                }
                const itemDirection = unifiedDirection || detectDirectionByAlgorithm(item.textContent || '', rtlAlgorithm);
                itemDirs.push(itemDirection);
                blockRules.push({
                    selector: `${selector}>li:nth-of-type(${itemIndex + 1})`,
                    direction: itemDirection
                });
            });
            blockRules.push({ selector, direction: unifiedDirection || majorityDirection(itemDirs) });
            return;
        }

        const direction = unifiedDirection || detectDirectionByAlgorithm(child.textContent || '', rtlAlgorithm);
        if (!unifiedDirection && LOCKED_EDITOR_HEADING_TAGS.includes(tagName)) {
            if (!headingDirs[tagName]) {
                headingDirs[tagName] = [];
            }
            headingDirs[tagName].push({ selector, direction });
            return;
        }

        const extraCss = tagName === 'blockquote' && direction === 'rtl'
            ? buildMirroredBlockquoteCss(child, selector)
            : '';
        blockRules.push({ selector, direction, extraCss });
    });

    const applyRules = (headingMode) => {
        const rules = blockRules.slice();
        Object.keys(headingDirs).forEach((tagName) => {
            const headings = headingDirs[tagName];
            const headingUnified = majorityDirection(headings.map((item) => item.direction));
            headings.forEach((item) => {
                rules.push({
                    selector: item.selector,
                    direction: headingMode === 'unified' ? headingUnified : item.direction
                });
            });
        });

        const rootDirection = unifiedDirection || majorityDirection(rules.map((item) => item.direction));
        rules.unshift({ selector: rootSelector, direction: rootDirection });

        const css = rules.map((item) => {
            const alignForRule = setTextAlign || item.selector.includes('>pre:');
            return lockedEditorDirRule(item.selector, item.direction, alignForRule, item.extraCss || '');
        }).join('');
        if (lockedEditorCssById.get(editorId) !== css) {
            lockedEditorCssById.set(editorId, css);
            flushLockedEditorStyles();
        }

        $element.attr('data-algorithm-rtl', rtlAlgorithm);
    };

    applyRules(mixedTitleDisplayModeCache || DEFAULT_MIXED_TITLE_DISPLAY_MODE);
    return true;
}

/**
 * Apply RTL to a large container (markdown, message body, prose).
 * Walks children, tables, code blocks, and nested sections according to the selected mode.
 * @param {jQuery|HTMLElement} element - Container to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} options - Additional options (optional)
 * @param {string} [options.ignoreSelector] - CSS selector of elements to ignore; skipped if omitted
 * @param {boolean} [options.removeInnerDir] - If true and algorithm is not advanced_section, strip dir from inner paragraphs/sections
 * @param {boolean} [options.processTables] - For advanced_full: process tables even without isContainer; runs independently of shouldProcess
 * @param {boolean|string|string[]} [options.onlyCss] - Handle with CSS instead of mutating child DOM.
 *   `true`: this element only. A selector (e.g. `.tiptap.ProseMirror`) becomes LOCKED_EDITOR_SELECTOR for this call.
 * RTL blockquotes get left/right padding and border swapped so the quote bar sits on the start side
 */
function applyRtlToContainer(element, rtlAlgorithm, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    rtlAlgorithm = resolveRtlAlgorithm(rtlAlgorithm);
    try {
    const $element = AQ(element);
    const el = $element[0];
    const onlyCss = options.onlyCss;

    if (onlyCss === true) {
        processLockedEditorByCss(el, rtlAlgorithm, options);
        return;
    }

    if (processLockedEditorByCss(el, rtlAlgorithm, options)) {
        return;
    }

    const nestedSelector = normalizeOnlyCssOption(onlyCss);
    if (nestedSelector && el && el.querySelectorAll) {
        el.querySelectorAll(nestedSelector).forEach((child) => {
            processLockedEditorByCss(child, rtlAlgorithm, { ...options, onlyCss: true });
        });
    }
    
    // Default options for each algorithm
    const defaultOptions = {
        advanced_section: {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        },
        advanced_full: {
            fontClass: 'FontSet'
        },
        first_word: {
            fontClass: 'FontSet'
        }
    };
    
    /**
     * Helper function to check if processing should be triggered based on text length and processed elements count
     * @param {jQuery} $element - jQuery element to check
     * @param {string} processedClass - Class name to count processed elements
     * @returns {Object} - Object containing shouldProcess boolean and currentTextLength number
     */
    function shouldProcessElement($element, processedClass, processOptions = {}) {
        // Get current text content for length comparison
        const currentText = getAnalyzableText($element, processOptions);
        

        
        const currentTextLength = currentText.length;
        
        // Get stored text length from attribute
        const storedLengthAttr = $element.attr('data-text-length');
        const storedLength = storedLengthAttr ? parseInt(storedLengthAttr, 10) : null;
        
        // Calculate the difference in text length
        const lengthDifference = storedLength !== null ? Math.abs(currentTextLength - storedLength) : 0;
        
        // Count elements with processedClass in this section
        const processedElementsCount = $element.find(`.${processedClass}`).length;
        
        // Only process if text length changed by more than 3 characters, if it's the first time (no attribute), or if fewer than 2 elements are processed
        const shouldProcess = lengthDifference > 3 || storedLength === null || processedElementsCount < 2;
        
        return {
            shouldProcess,
            currentText,
            currentTextLength,
            storedLength,
            lengthDifference,
            processedElementsCount
        };
    }
    
    if (rtlAlgorithm === 'advanced_section') {
        const mergedOptions = { ...defaultOptions.advanced_section, ...options };
        
        const { shouldProcess, currentTextLength, storedLength, lengthDifference, processedElementsCount } = shouldProcessElement($element, mergedOptions.processedClass);
        
        if (shouldProcess) {
            // console.log("applyRtlToContainer advanced_section", currentTextLength, storedLength, lengthDifference);
            processTextElementsAdvanced($element, mergedOptions);

            $element.attr('data-algorithm-rtl', 'advanced_section');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            // Reset skip log flag when processing happens
            $element.removeAttr('data-skip-log-sent');
            flipRtlArrowsInTree($element);
        }

        processTablesInContainer($element, {
            fontClass: mergedOptions.fontClass,
            processedClass: mergedOptions.processedClass,
            siteConfig: mergedOptions.siteConfig,
            setTextAlign: mergedOptions.setTextAlign
        });
        processCodeBlocksInContainer($element, {
            fontClass: mergedOptions.fontClass,
            codeFontClass: mergedOptions.codeFontClass,
            setTextAlign: mergedOptions.setTextAlign,
            processedClass: mergedOptions.processedClass
        }, true);
        flipRtlArrowsInTree($element);
        //  else {
        //     // Log when processing is skipped (only once)
        //     const skipLogSent = $element.attr('data-skip-log-sent');
        //     if (!skipLogSent) {
        //         let reason = 'Unknown';
        //         if (storedLength !== null && lengthDifference <= 3 && processedElementsCount >= 2) {
        //             reason = `Text length changed by ${lengthDifference} characters (threshold: 3), and ${processedElementsCount} elements already processed`;
        //         } else if (storedLength === null) {
        //             reason = 'No stored length (should not happen)';
        //         }
                
        //         console.log('applyRtlToContainer advanced_section: Skipped processing', {
        //             element: $element[0],
        //             currentTextLength,
        //             storedLength,
        //             lengthDifference,
        //             processedElementsCount,
        //             reason
        //         });
                
        //         // Mark that log has been sent
        //         $element.attr('data-skip-log-sent', 'true');
                
        //         // Process headers only when typing ends
        //         processTextElementsAdvanced($element, {
        //             ...mergedOptions,
        //             endTyping: true
        //         });
        //     }
        // }
        
    } else if (rtlAlgorithm === 'advanced_full') {
        const mergedOptions = { ...defaultOptions.advanced_full, ...options };
        
        const ignoreSelector = getIgnoreSelector(mergedOptions);
        const { shouldProcess, currentText, currentTextLength } = shouldProcessElement($element, mergedOptions.processedClass, {
            ignoreSelector
        });
        
        if (shouldProcess) {
            // console.log("applyRtlToContainer advanced_full", currentTextLength, storedLength, lengthDifference);
            setTextDirectionAndFont(element, { ...mergedOptions, ignoreSelector, text: currentText });

            const codeOptions = {
                fontClass: mergedOptions.fontClass,
                codeFontClass: mergedOptions.codeFontClass,
                setTextAlign: mergedOptions.setTextAlign,
                processedClass: mergedOptions.processedClass
            };

            if (mergedOptions.isContainer) {
                processCodeBlocksInContainer($element, codeOptions, true);
            }
            
            $element.attr('data-algorithm-rtl', 'advanced_full');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            flipRtlArrowsInTree($element);
        }

        processCodeBlocksInContainer($element, {
            fontClass: mergedOptions.fontClass,
            codeFontClass: mergedOptions.codeFontClass,
            setTextAlign: mergedOptions.setTextAlign,
            processedClass: mergedOptions.processedClass
        }, false);

        if (mergedOptions.processTables || mergedOptions.isContainer) {
            processTablesInContainer($element, {
                fontClass: mergedOptions.fontClass,
                processedClass: mergedOptions.processedClass,
                siteConfig: mergedOptions.siteConfig,
                setTextAlign: mergedOptions.setTextAlign
            });
        }

        flipRtlArrowsInTree($element);

        applyRemoveInnerDir($element, rtlAlgorithm, mergedOptions);
        if (ignoreSelector) {
            isolateIgnoredElements($element, ignoreSelector);
        }

    } else if (rtlAlgorithm === 'first_word') {
        $element.attr("dir", "auto");
        
        const fontClass = options.fontClass || defaultOptions.first_word.fontClass;
        if (!$element.hasClass(fontClass)) {
            $element.addClass(fontClass);
        }
        
        // Process tables in container for first_word algorithm (only if isContainer is true)
        if (options.isContainer) {
            const { shouldProcess, currentTextLength } = shouldProcessElement($element, options.processedClass);
            
            if (shouldProcess) {
                // console.log("applyRtlToContainer first_word tables", currentTextLength, storedLength, lengthDifference);
                processTablesInContainer($element, {
                    fontClass,
                    processedClass: options.processedClass,
                    siteConfig: options.siteConfig,
                    setTextAlign: options.setTextAlign
                });
                // Store the new text length
                $element.attr('data-text-length', currentTextLength.toString());
            }
        }
        
        $element.attr('data-algorithm-rtl', 'first_word');
        flipRtlArrowsInTree($element);

        applyRemoveInnerDir($element, rtlAlgorithm, options);
        const firstWordIgnoreSelector = getIgnoreSelector(options);
        if (firstWordIgnoreSelector) {
            isolateIgnoredElements($element, firstWordIgnoreSelector);
        }
    }

    mirrorRtlBlockquotesInTree($element);
    } catch (error) {
        if (isInvalidatedError(error)) {
            return;
        }
        throw error;
    }
}

/**
 * Detect text direction based on RTL algorithm
 * @param {string} text - Text to analyze
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @returns {string} - Detected direction ('rtl' or 'ltr')
 */
function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    if (rtlAlgorithm === 'first_word') {
        return analyzeTextDirectionFirstWord(text);
    } else {
        // For 'advanced_section' and 'advanced_full', use detectTextDirection
        return detectTextDirection(text);
    }
}

/**
 * Apply RTL to a single element (textarea, input, title, simple text node).
 * Sets dir and font on that element only; does not walk nested blocks.
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} options - Additional options (optional)
 * @param {string} options.rtlClass - Class to add when direction is RTL (optional, defaults to null)
 * @param {string} [options.ignoreSelector] - CSS selector of elements to ignore; skipped if omitted
 * @param {boolean} [options.removeInnerDir] - If true and algorithm is not advanced_section, strip dir from inner paragraphs/sections
 */
function applyRtlToElement(element, rtlAlgorithm, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    rtlAlgorithm = resolveRtlAlgorithm(rtlAlgorithm);
    const $element = AQ(element);

    if (processLockedEditorByCss($element[0], rtlAlgorithm, options)) {
        return;
    }
    
    // Default options for each algorithm
    const defaultOptions = {
        fontClass: 'FontSet'
    };
    
    const processedClass = options.processedClass || false;
    const rtlClass = options.rtlClass || false;
    const storedAlgorithm = $element.attr('data-algorithm-rtl');
    if (storedAlgorithm !== rtlAlgorithm) {
        if (processedClass) {
            $element.removeClass(processedClass);
        }
        if (rtlClass) {
            $element.removeClass(rtlClass);
        }
    }

    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        // Check processedClass only if it's not false
        if (!processedClass || !$element.hasClass(processedClass)) {
            const ignoreSelector = getIgnoreSelector(options);
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                ignoreSelector
            };
            const direction = setTextDirectionAndFont(element, mergedOptions);
            
            // Add processedClass only if it's not false
            if (processedClass) {
                $element.addClass(processedClass);
            }
            
            // Add RTL-specific class if direction is RTL
            if (rtlClass && direction === 'rtl') {
                $element.addClass(rtlClass);
            }

            if (direction === 'rtl') {
                flipRtlArrowsInTree($element);
            }
        }

    } else if (rtlAlgorithm === 'first_word') {
        // Check processedClass only if it's not false
        if (!processedClass || !$element.hasClass(processedClass)) {
            $element.attr("dir", "auto");
            const fontClass = options.fontClass || defaultOptions.fontClass;
            $element.addClass(fontClass);
            
            // Add processedClass only if it's not false
            if (processedClass) {
                $element.addClass(processedClass);
            }
            
            // Get text content once for both textAlign and rtlClass operations
            if (options.setTextAlign || rtlClass) {
                let text = $element.text();
                if (!text || !text.trim()) {
                    text = $element.val();
                    if (text) {
                        text = text.trim();
                    }
                }
                
                if (text && text.trim()) {
                    const direction = analyzeTextDirectionFirstWord(text);
                    
                    applyTextAlignByDirection($element, direction, options.setTextAlign);
                    
                    // Add RTL-specific class if direction is RTL
                    if (rtlClass && direction === 'rtl') {
                        $element.addClass(rtlClass);
                    }
                }
            }

            flipRtlArrowsInTree($element);
        }

        

    }

    $element.attr('data-algorithm-rtl', rtlAlgorithm);

    applyRemoveInnerDir($element, rtlAlgorithm, options);
    const ignoreSelector = getIgnoreSelector(options);
    if (ignoreSelector) {
        isolateIgnoredElements($element, ignoreSelector);
    }
}

export {
        analyzeTextDirection,
        detectTextDirection,
        isRTL,
        isCode,
        setTextDirectionAndFontOneTime,
        setTextDirectionAndFont,
        processParagraphWithBreaks,
        processTextElementsAdvanced,
        getAttributeTextElements,
        applyRtlToContainer,
        applyRtlToElement,
        detectDirectionByAlgorithm,
        setMixedTitleDisplayMode,
        setApplyAlgorithmToCode,
        setFlipRtlArrows,
        applyLiveCodeAlgorithmSetting,
        applyLiveFlipRtlArrowsSetting,
        setActiveRtlAlgorithm,
        getActiveRtlAlgorithm,
        resetRtlDomCaches,
        processCodeMirrorBlocks,
        isLockedMarkdownEditor,
        processLockedEditorByCss
    };

