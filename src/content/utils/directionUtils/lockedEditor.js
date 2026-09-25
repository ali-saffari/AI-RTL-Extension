/**
 * Locked ProseMirror / contenteditable editors revert DOM edits on children.
 * Style them from a stylesheet keyed by an id on the editor root.
 * Also mirrors RTL blockquote bars (padding/border and Tailwind pl/pr).
 *
 * Sites that use this path today (via onlyCss):
 * - ChatGPT — composer and markdown editor (`.ProseMirror.markdown[contenteditable]`, also the default selector)
 * - MiniMax — TipTap composer (`.tiptap.ProseMirror`)
 *
 * Other services may still hit it if the processed node matches the default
 * selector or already has `data-ai-rtl-editor`.
 */

import { detectDirectionByAlgorithm } from '../analyzeDirection.js';
import { isRtlEngineActive } from '../originalState.js';
import {
    getMixedTitleDisplayMode,
    resolveRtlAlgorithm,
    shouldApplyRtlToCodeBlock
} from './settings.js';
import {
    getElementClassName,
    normalizeTagNameList,
    resolveAdjustedTagList
} from './shared.js';
import { isTextAlignEnabled } from './textStyles.js';

export const LOCKED_EDITOR_STYLE_ID = 'ai-rtl-locked-editor-css';
export const DEFAULT_LOCKED_EDITOR_SELECTOR = '.ProseMirror.markdown[contenteditable]';
const LOCKED_EDITOR_BLOCK_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol'];
const LOCKED_EDITOR_HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const lockedEditorCssById = new Map();
const lockedBlockquoteOriginals = new Map();
let lockedEditorSeq = 0;

function resolveLockedEditorBlockTags(options = {}) {
    return resolveAdjustedTagList(
        LOCKED_EDITOR_BLOCK_TAGS,
        options.includeTags,
        options.excludeTags
    );
}

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

export function mirrorRtlBlockquotesInTree(element) {
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

export function normalizeOnlyCssOption(onlyCss) {
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

export function isLockedMarkdownEditor(element, onlyCss) {
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

function isListElement(el) {
    const tagName = el.tagName.toLowerCase();
    return tagName === 'ul' || tagName === 'ol';
}

function getListItemOwnText(item) {
    let text = '';
    item.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && isListElement(node)) {
            return;
        }
        text += node.textContent || '';
    });
    return text.trim() ? text : (item.textContent || '');
}

/**
 * Nested items carry their own direction; inner `p[dir=auto]` would otherwise
 * fall back to first-strong detection, so they get an explicit rule too.
 */
function collectLockedListRules(list, listSelector, rtlAlgorithm, unifiedDirection, blockRules, allItemDirs) {
    const itemDirs = [];
    let itemCount = 0;
    Array.from(list.children).forEach((item) => {
        if (item.tagName.toLowerCase() !== 'li') {
            return;
        }
        itemCount += 1;
        const itemSelector = `${listSelector}>li:nth-of-type(${itemCount})`;
        const itemDirection = unifiedDirection || detectDirectionByAlgorithm(getListItemOwnText(item), rtlAlgorithm);
        itemDirs.push(itemDirection);
        allItemDirs.push(itemDirection);
        blockRules.push({ selector: itemSelector, direction: itemDirection });

        const nestedCount = {};
        let hasParagraph = false;
        Array.from(item.children).forEach((nested) => {
            const nestedTag = nested.tagName.toLowerCase();
            if (nestedTag === 'p') {
                hasParagraph = true;
                return;
            }
            if (!isListElement(nested)) {
                return;
            }
            nestedCount[nestedTag] = (nestedCount[nestedTag] || 0) + 1;
            collectLockedListRules(
                nested,
                `${itemSelector}>${nestedTag}:nth-of-type(${nestedCount[nestedTag]})`,
                rtlAlgorithm,
                unifiedDirection,
                blockRules,
                allItemDirs
            );
        });
        if (hasParagraph) {
            blockRules.push({ selector: `${itemSelector}>p`, direction: itemDirection });
        }
    });
    blockRules.push({ selector: listSelector, direction: unifiedDirection || majorityDirection(itemDirs) });
}

export function resetLockedEditorCaches() {
    lockedEditorCssById.clear();
    lockedBlockquoteOriginals.clear();
    lockedEditorSeq = 0;
    const lockedStyle = typeof document !== 'undefined' && document.getElementById(LOCKED_EDITOR_STYLE_ID);
    if (lockedStyle && lockedStyle.parentNode) {
        lockedStyle.parentNode.removeChild(lockedStyle);
    }
}

export function invalidateLockedEditorCache(el) {
    const editorId = el.getAttribute('data-ai-rtl-editor');
    if (editorId) {
        lockedEditorCssById.delete(editorId);
        el.removeAttribute('data-ai-rtl-sig');
    }
}

/**
 * advanced_section for editors whose child DOM cannot be mutated.
 * Assigns an id on the root, then targets p:nth-of-type, h3:nth-of-type, ...
 */
export function processLockedEditorByCss(element, rtlAlgorithm, options = {}) {
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

    const extraCssTags = new Set(normalizeTagNameList(options.includeTags));
    const blockTags = resolveLockedEditorBlockTags(options);

    const editorId = getLockedEditorId(el);
    let contentSig = `${rtlAlgorithm}:${setTextAlign}:${getMixedTitleDisplayMode() || ''}:${blockTags.join(',')}|`;
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
        if (!blockTags.includes(tagName)) {
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
            const listRules = [];
            const listItemDirs = [];
            collectLockedListRules(child, selector, rtlAlgorithm, unifiedDirection, listRules, listItemDirs);
            if (!unifiedDirection && majorityDirection(listItemDirs) === 'rtl') {
                listRules.forEach((rule) => {
                    rule.direction = 'rtl';
                });
            }
            blockRules.push(...listRules);
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

        let extraCss = extraCssTags.has(tagName) ? 'display:block;' : '';
        if (tagName === 'blockquote' && direction === 'rtl') {
            extraCss += buildMirroredBlockquoteCss(child, selector);
        }
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

    applyRules(getMixedTitleDisplayMode());
    return true;
}
