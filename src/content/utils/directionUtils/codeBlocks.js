/**
 * Direction for fenced / editor code blocks (pre, code, custom hosts, CodeMirror).
 *
 * ChatGPT calls processCodeMirrorBlocks directly. Other sites hit this through
 * applyRtlToContainer / processTextElementsAdvanced when applyAlgorithmToCode is on.
 */

import { isRtlEngineActive, restoreElementFromSelf } from '../originalState.js';
import { flipRtlArrowsInTree } from './arrows.js';
import {
    CODE_BLOCK_SELECTOR,
    CUSTOM_CODE_BLOCK_SELECTOR,
    isCodeMirrorCodeBlock,
    setDebugAttr,
    unwrapElement
} from './shared.js';
import {
    DEFAULT_LOCKED_EDITOR_SELECTOR,
    invalidateLockedEditorCache,
    isInsideLockedCssEditor,
    processLockedEditorByCss
} from './lockedEditor.js';
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

function applyForcedCodeLtr($element) {
    $element.attr('dir', 'ltr');
    $element.attr('data-direction', 'ltr');
    $element.addClass('AsSetLtr');
    $element.removeClass('FontSet FontSetCode FontSetGPT FontSetCodeBlocksGPT AsRtl');
    const el = unwrapElement($element);
    if (el && el.style) {
        el.style.setProperty('direction', 'ltr', 'important');
        el.style.setProperty('text-align', 'left', 'important');
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

export function processCodeLikeElement($element, element, options = {}) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    const { fontClass, processedClass, codeFontClass } = options;
    const blockFontClass = resolveCodeFontClass(fontClass, codeFontClass);
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
    $container.find(selector).add($container.filter(selector)).each(function() {
        if (isInsideLockedCssEditor(this)) {
            return;
        }
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

export function processCodeMirrorBlock($element, element, options = {}) {
    if (!isApplyAlgorithmToCodeEnabled()) {
        return;
    }
    const { fontClass, processedClass, codeFontClass } = options;
    const blockFontClass = resolveCodeFontClass(fontClass, codeFontClass);
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

export function processCodeMirrorBlocks(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const $root = container ? AQ(container) : AQ(document);
    $root.find('.cm-content, .md-code-block').add($root.filter('.cm-content, .md-code-block')).each(function() {
        if (isInsideLockedCssEditor(this)) {
            return;
        }
        processCodeMirrorBlock(AQ(this), this, options);
    });
}
