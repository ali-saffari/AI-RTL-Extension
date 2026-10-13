// پاسخ‌های کلاد با آبزرور دیده می‌شوند و فقط نزدیک صفحه پردازش می‌شوند.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, detectDirectionByAlgorithm } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';
import {
    createViewportMessageWatch,
    eachMatch,
    hasSelector,
    isNearViewport
} from '../utils/viewport.js';

const MARKDOWN = '.standard-markdown, .progressive-markdown, .font-claude-response, #standard-markdown-artifact, #markdown-artifact';

const markdownOptions = {
    fontClass: 'FontSet FontClaude',
    processedClass: 'AsOkText',
    isContainer: true,
    removeInnerDir: true,
    siteConfig: 'claude',
    walkSkipSelector: '[data-not-prose]'
};

let messageWatch = null;
let refreshTimer = 0;

function watchComposer(element, rtlAlgorithm) {
    const $element = AQ(element);
    if ($element.data('rtl-listener-added')) {
        return;
    }
    $element.data('rtl-listener-added', true);
    if (!$element.hasClass('AsOk')) {
        $element.addClass('AsOk FontClaude');
        applyRtlToElement(element, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    }
    $element.on('keyup paste input', function () {
        requestAnimationFrame(() => {
            applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSet' });
        });
    });
}

// نوار کناری، باکس نوشتن و کپی‌رایت. پیام‌ها اینجا نیستند.
function refreshChrome(rtlAlgorithm) {
    if (!isRtlEngineActive()) {
        return;
    }

    if (chrome.runtime?.id) {
        const field = document.querySelector('.sticky fieldset.flex.flex-col .items-stretch.transition-all');
        if (field && field.parentElement) {
            addCopyright(AQ(field.parentElement), 'AsBoxClaude AsBoxB', '');
        }
    }

    AQ('.ProseMirror, textarea').each(function () {
        watchComposer(this, rtlAlgorithm);
    });

    AQ('ul.flex.flex-col li > div').each(function () {
        const $item = AQ(this);
        if ($item.data('rtl-listener-added')) {
            return;
        }
        $item.data('rtl-listener-added', true);
        if (detectDirectionByAlgorithm($item.find('.whitespace-nowrap').text(), rtlAlgorithm) === 'rtl') {
            $item.addClass('AsRtlClaudeList');
        }
    });

    AQ('.mb-1 .group').each(function () {
        const $group = AQ(this);
        if ($group.data('rtl-listener-added')) {
            return;
        }
        $group.data('rtl-listener-added', true);
        if (detectDirectionByAlgorithm($group.find('.break-words').text(), rtlAlgorithm) === 'rtl') {
            $group.addClass('AsRtlClaudeUser FontSet');
            $group.find('.break-words').addClass('AsRtl');
        }
    });

    eachMatch(document, '[data-row-key^="chat:"] .flex-1', (element) => {
        applyRtlToElement(element, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    });

    if (messageWatch) {
        messageWatch.recheck();
    }
}

function applyUserMessages(root, rtlAlgorithm) {
    eachMatch(root, '[data-testid="user-message"]', (element) => {
        if (!isNearViewport(element)) {
            return;
        }
        applyRtlToElement(element, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    });
}

function applySmallBlocks(root, rtlAlgorithm) {
    const textOptions = {
        fontClass: 'FontSet FontClaude',
        processedClass: 'AsOkText',
        removeInnerDir: true
    };
    eachMatch(root, '.contents .truncate', (element) => {
        applyRtlToContainer(element, rtlAlgorithm, { ...textOptions, isContainer: false });
    });
    eachMatch(root, '[data-ask-user-input-banner="true"], [data-testid="ask-user-answers-card"]', (element) => {
        applyRtlToContainer(element, rtlAlgorithm, { ...textOptions, isContainer: true });
    });
    eachMatch(root, '.contents .font-base-bold, [data-orientation="horizontal"] button', (element) => {
        applyRtlToElement(element, rtlAlgorithm, { ...textOptions, isContainer: true });
    });
    eachMatch(root, '.artifact-block-cell .leading-tight, .whitespace-pre-wrap.rounded-lg, .group\\/thumbnail p', (element) => {
        applyRtlToElement(element, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    });
    eachMatch(root, 'text', (element) => {
        applyRtlToElement(element, rtlAlgorithm, textOptions);
    });
}

function startMessageWatch(rtlAlgorithm) {
    if (messageWatch) {
        messageWatch.stop();
    }

    messageWatch = createViewportMessageWatch({
        markdownSelector: MARKDOWN,
        isEngineActive: isRtlEngineActive,
        processMarkdown: (element) => {
            const $element = AQ(element);
            $element.addClass('AsSetAlgorithm');
            if (element.id === 'standard-markdown-artifact' || element.id === 'markdown-artifact') {
                $element.addClass('AsOk FontSet FontClaude');
            }
            applyRtlToContainer(element, rtlAlgorithm, markdownOptions);
        },
        onAdded: (node, { queueExtra }) => {
            if (hasSelector(node, '[data-testid="user-message"]')) {
                queueExtra('users', node);
            }
            if (hasSelector(node, '.contents .truncate, [data-ask-user-input-banner="true"], [data-testid="ask-user-answers-card"], .artifact-block-cell, text')) {
                queueExtra('small', node);
            }
        }
    });

    messageWatch.setExtraFlush('users', (node) => applyUserMessages(node, rtlAlgorithm));
    messageWatch.setExtraFlush('small', (node) => applySmallBlocks(node, rtlAlgorithm));
    messageWatch.start();
}

const fontStyleId = 'ai-rtl-claude-font-weights';
const markdownCss = ':is(.standard-markdown, .progressive-markdown, #standard-markdown-artifact, #markdown-artifact)';
const fontCss = `
* {
    --cds-font-weight-regular: 350 !important;
    --cds-font-weight-medium: 500 !important;
    --cds-font-weight-semibold: 680 !important;
    --cds-font-weight-bold: 700 !important;
}
${markdownCss}[dir="rtl"] :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss}[data-ai-rtl-direction="rtl"] :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
[dir="rtl"] ${markdownCss} :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss} :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6)[dir="rtl"] {
    padding-left: calc(var(--spacing) * 8) !important;
    padding-right: 0 !important;
}
${markdownCss}[dir="rtl"] :is(p, blockquote, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss}[data-ai-rtl-direction="rtl"] :is(p, blockquote, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
[dir="rtl"] ${markdownCss} :is(p, blockquote, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss} :is(p, blockquote, h1, h2, h3, h4, h5, h6)[dir="rtl"] {
    padding-right: var(--msg-text-inset, .5rem) !important;
}
`;

function applyFontWeights() {
    let style = document.getElementById(fontStyleId);
    if (!style) {
        style = document.createElement('style');
        style.id = fontStyleId;
    }
    if (style.textContent !== fontCss) {
        style.textContent = fontCss;
    }
    const parent = document.head || document.documentElement;
    if (style.parentNode !== parent || parent.lastElementChild !== style) {
        parent.appendChild(style);
    }
}

export function stopClaude() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = 0;
    }
    if (messageWatch) {
        messageWatch.stop();
        messageWatch = null;
    }
}

export function activateClaude(rtlAlgorithm = 'advanced_full') {
    stopClaude();
    if (!isRtlEngineActive()) {
        return;
    }
    applyFontWeights();
    refreshChrome(rtlAlgorithm);
    applyUserMessages(document.body, rtlAlgorithm);
    applySmallBlocks(document.body, rtlAlgorithm);
    startMessageWatch(rtlAlgorithm);
    refreshTimer = setInterval(() => refreshChrome(rtlAlgorithm), 1000);
}
