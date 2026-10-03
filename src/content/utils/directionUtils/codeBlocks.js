/**
 * Direction for fenced / editor code blocks (pre, code, custom hosts, CodeMirror).
 *
 * ChatGPT calls processCodeMirrorBlocks directly. Other sites hit this through
 * applyRtlToContainer / processTextElementsAdvanced when applyAlgorithmToCode is on.
 */

import { isRtlEngineActive, preserveOriginalDir, restoreElementFromSelf } from '../originalState.js';
import { flipRtlArrowsInTree } from './arrows.js';
import {
    CODE_BLOCK_SELECTOR,
    CUSTOM_CODE_BLOCK_SELECTOR,
    isCodeMirrorCodeBlock,
    logDebugProcess,
    setDebugAttr,
    unwrapElement
} from './shared.js';
import {
    DEFAULT_LOCKED_EDITOR_SELECTOR,
    invalidateLockedEditorCache,
    processLockedEditorByCss
} from './lockedEditor.js';
import {
    alignCodeCommentsIn,
    codeBlockKind,
    restoreCodeCommentsIn
} from './codeLanguage.js';
import {
    isApplyAlgorithmToCodeEnabled,
    setApplyAlgorithmToCodeEnabled,
    shouldApplyRtlToCodeBlock
} from './settings.js';

export const CM_DIR_STYLE_ID = 'ai-rtl-cm-code-direction';

export function setApplyAlgorithmToCode(enabled) {
    setApplyAlgorithmToCodeEnabled(enabled === true);
    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.toggle('ai-rtl-code-algorithm', enabled === true);
    }
}

function isGeminiHost() {
    return typeof location !== 'undefined' && /(^|\.)gemini\.google\.com$/i.test(location.hostname);
}

function resolveCodeFontClass(fontClass, codeFontClass) {
    if (codeFontClass === false) {
        return '';
    }
    return codeFontClass || fontClass;
}

function getLiveCodeProcessOptions() {
    const isGpt = Boolean(document.body && document.body.classList.contains('FontSetGPT'));
    return {
        fontClass: isGpt ? 'FontSetGPT' : 'FontSet',
        codeFontClass: isGpt ? 'FontSetCodeBlocksGPT' : (isGeminiHost() ? false : 'FontSet'),
        setTextAlign: true
    };
}

function refreshLockedEditorsForCodeSetting() {
    if (typeof document === 'undefined' || !document.body) {
        return;
    }
    const options = getLiveCodeProcessOptions();
    document.querySelectorAll(`[data-ai-rtl-editor], ${DEFAULT_LOCKED_EDITOR_SELECTOR}`).forEach((el) => {
        invalidateLockedEditorCache(el);
        processLockedEditorByCss(el, undefined, { ...options, onlyCss: true });
    });
}

function isCodeHeaderElement(el) {
    return Boolean(el && el.closest && el.closest('[data-markdown-copy="exclude"]'));
}

function applyForcedCodeLtr($element) {
    const el = unwrapElement($element);
    if (isCodeHeaderElement(el)) {
        return;
    }
    $element.attr('dir', 'ltr');
    $element.attr('data-direction', 'ltr');
    $element.addClass('AsSetLtr');
    $element.removeClass('FontSet FontSetCode FontSetGPT FontSetCodeBlocksGPT AsRtl');
    if (el && el.style) {
        el.style.setProperty('direction', 'ltr', 'important');
        el.style.setProperty('text-align', 'left', 'important');
    }
}

function applyProseCodeRtl($element) {
    const el = unwrapElement($element);
    if (!el || isCodeHeaderElement(el)) {
        return;
    }
    $element.attr('dir', 'rtl');
    $element.attr('data-direction', 'rtl');
    $element.removeClass('AsSetLtr');
    el.style.setProperty('direction', 'rtl', 'important');
    el.style.setProperty('text-align', 'right', 'important');

    const pane = el.closest && el.closest('.chatgpt-code-scrollport');
    if (pane && !isCodeHeaderElement(pane)) {
        pane.setAttribute('dir', 'rtl');
        pane.setAttribute('data-direction', 'rtl');
        pane.style.setProperty('direction', 'rtl', 'important');
        pane.style.setProperty('text-align', 'right', 'important');
    }
}

function restoreCodeElementToOriginal(el) {
    restoreElementFromSelf(el);
}

function restoreCodeBlocksToOriginal() {
    if (typeof document === 'undefined' || !document.body) {
        return;
    }

    restoreCodeCommentsIn(document.body);

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

export function applyLiveCodeAlgorithmSetting(enabled) {
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

export function resetCodeMirrorDirectionStyles() {
    const cmStyle = typeof document !== 'undefined' && document.getElementById(CM_DIR_STYLE_ID);
    if (cmStyle && cmStyle.parentNode) {
        cmStyle.parentNode.removeChild(cmStyle);
    }
}

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

function getCodeBlockDirectionTargets($element) {
    const $inner = $element.find('pre, code, [role="textbox"], [aria-label="Code editor"]');
    return $inner.length ? $element.add($inner) : $element;
}

const CODE_PROCESSED_CLASS = 'AsOkCode';
const CODE_PROCESSED_LEN_ATTR = 'data-ai-rtl-code-len';

function getCodeTextLength($element) {
    return (($element.text && $element.text()) || '').length;
}

/** Independent skip for code blocks — not tied to container shouldProcess. */
function shouldProcessCodeBlock($element) {
    const el = unwrapElement($element);
    if (!el) {
        return true;
    }
    if (!$element.hasClass(CODE_PROCESSED_CLASS)) {
        return true;
    }
    const storedAttr = el.getAttribute(CODE_PROCESSED_LEN_ATTR);
    if (storedAttr === null) {
        return true;
    }
    const storedLength = parseInt(storedAttr, 10);
    const currentLength = getCodeTextLength($element);
    return Math.abs(currentLength - storedLength) > 3;
}

function markCodeBlockProcessed($element, options = {}) {
    const el = unwrapElement($element);
    $element.addClass(CODE_PROCESSED_CLASS);
    if (options.processedClass) {
        $element.addClass(options.processedClass);
    }
    if (el) {
        el.setAttribute(CODE_PROCESSED_LEN_ATTR, String(getCodeTextLength($element)));
    }
}

export function processCodeLikeElement($element, element, options = {}) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    if (!shouldProcessCodeBlock($element)) {
        return;
    }
    const { fontClass, codeFontClass, forceCodeLtr = false } = options;
    const blockFontClass = resolveCodeFontClass(fontClass, codeFontClass);

    const text = $element.text();
    const $targets = getCodeBlockDirectionTargets($element);
    const kind = codeBlockKind(unwrapElement($element));
    if (!forceCodeLtr && kind === 'prose') {
        setDebugAttr($element, 'data-debug-mode', 'code-prose-rtl');
        $targets.each(function() {
            applyProseCodeRtl(AQ(this));
        });
        markCodeBlockProcessed($element, options);
        return;
    }
    if (forceCodeLtr || kind === 'code' || !shouldApplyRtlToCodeBlock(text)) {
        setDebugAttr($element, 'data-debug-mode', forceCodeLtr ? 'code-forced-ltr' : (kind === 'code' ? 'code-lang-ltr' : 'code-element-ltr'));
        $targets.each(function() {
            applyForcedCodeLtr(AQ(this));
        });
        if (kind === 'code') {
            alignCodeCommentsIn(unwrapElement($element));
        }
        markCodeBlockProcessed($element, options);
        return;
    }

    setDebugAttr($element, 'data-debug-mode', 'code-element-normal');
    $element.find('[dir]').each(function () {
        preserveOriginalDir(this);
        this.removeAttribute('dir');
    });
    applyCodeBlockDirection($targets, 'rtl', blockFontClass);
    markCodeBlockProcessed($element, options);
}

export function processCodeBlockNode($codeElement, options = {}) {
    const el = $codeElement[0];
    if (isCodeMirrorCodeBlock($codeElement)) {
        processCodeMirrorBlock($codeElement, el, options);
        return;
    }
    processCodeLikeElement($codeElement, el, options);
}

export function processCodeBlocksInContainer($container, options = {}, includeStandard = true) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    const selector = includeStandard ? CODE_BLOCK_SELECTOR : CUSTOM_CODE_BLOCK_SELECTOR;
    const $targets = $container.find(selector).add($container.filter(selector));
    let processedCount = 0;
    let skippedCount = 0;
    $targets.each(function() {
        if (!shouldProcessCodeBlock(AQ(this))) {
            skippedCount += 1;
            return;
        }
        processedCount += 1;
        processCodeBlockNode(AQ(this), options);
    });
    if (processedCount > 0) {
        logDebugProcess('code', $container, {
            includeStandard,
            forceCodeLtr: options.forceCodeLtr === true,
            matchCount: $targets.length,
            processedCount,
            skippedCount
        });
    }
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

export function processCodeMirrorBlock($element, element, options = {}) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    if (!shouldProcessCodeBlock($element)) {
        return;
    }
    const { fontClass, codeFontClass, forceCodeLtr = false } = options;
    const blockFontClass = resolveCodeFontClass(fontClass, codeFontClass);
    const $content = $element.hasClass('cm-content')
        ? $element
        : ($element.find('.cm-content').first().length ? $element.find('.cm-content').first() : $element);

    ensureCodeMirrorDirectionStyles();

    const $targets = getCodeMirrorTargets($element, $content);

    const blockText = $content.text();
    const kind = codeBlockKind($content[0] || unwrapElement($element));
    if (!forceCodeLtr && kind === 'prose') {
        setDebugAttr($element, 'data-debug-mode', 'cm-code-prose-rtl');
        $targets.each(function() {
            applyProseCodeRtl(AQ(this));
        });
        markCodeBlockProcessed($element, options);
        $element.find('*').addClass(CODE_PROCESSED_CLASS);
        return;
    }
    if (forceCodeLtr || kind === 'code' || !shouldApplyRtlToCodeBlock(blockText)) {
        setDebugAttr($element, 'data-debug-mode', forceCodeLtr ? 'cm-code-forced-ltr' : (kind === 'code' ? 'cm-code-lang-ltr' : 'cm-code-block-ltr'));
        applyCodeBlockDirection($targets, 'ltr', blockFontClass);
        if (kind === 'code') {
            alignCodeCommentsIn($content[0] || unwrapElement($element));
        }
        markCodeBlockProcessed($element, options);
        $element.find('*').addClass(CODE_PROCESSED_CLASS);
        return;
    }

    setDebugAttr($element, 'data-debug-mode', 'cm-code-block-persian');
    applyCodeBlockDirection($targets, 'rtl', blockFontClass);
    markCodeBlockProcessed($element, options);
    $element.find('*').addClass(CODE_PROCESSED_CLASS);
}

export function processCodeMirrorBlocks(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const $root = container ? AQ(container) : AQ(document);
    $root.find('.cm-content, .md-code-block').add($root.filter('.cm-content, .md-code-block')).each(function() {
        processCodeMirrorBlock(AQ(this), this, options);
    });
}
