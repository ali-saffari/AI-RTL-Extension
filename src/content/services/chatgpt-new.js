// Current ChatGPT UI. Active when #stage-sidebar-tiny-bar is not in the DOM.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';
import { isRtlEngineActive, preserveOriginalDir } from '../utils/originalState.js';
import {
    createViewportMessageWatch,
    eachMatch,
    hasSelector,
    isNearViewport,
    MARKDOWN_THROTTLE_MS
} from '../utils/viewport.js';

const MARKDOWN_ROOT = '[class^="MarkdownRoot-"], [class*=" MarkdownRoot-"]';
const MARKDOWN_ASSISTANT = '[data-assistant-markdown]';
const MARKDOWN = `${MARKDOWN_ROOT}, ${MARKDOWN_ASSISTANT}`;
const MARKDOWN_IGNORE = '[class*="TableContainer"], [class*="tableContainer"], [class*="CodeBlock-"], [class*="InlineCodePane-"]';
const USER_MESSAGE = '[data-message-author-role="user"], .text-user-message, [data-user-message-bubble]';
const FOLLOWUP = 'button[class*="suggested-followup"]';
const COMPOSER = 'textarea, input[type="text"], input[type="search"], input:not([type]), .ProseMirror, [contenteditable="true"]';
const LOCKED_EDITOR = '.ProseMirror[contenteditable]';

const markdownOptions = {
    fontClass: 'FontSetGPT',
    codeFontClass: 'FontSetCodeBlocksGPT',
    processedClass: 'AsOk',
    isContainer: true,
    siteConfig: 'chatgpt',
    setTextAlign: 'class',
    setRootTextAlign: 'class',
    rtlClass: 'AsAlignRtl',
    ltrClass: 'AsAlignLtr',
    removeDirAuto: true,
    walkSkipSelector: MARKDOWN_IGNORE,
    onlyCss: LOCKED_EDITOR
};

const followupOptions = {
    fontClass: 'FontSetGPT',
    processedClass: 'AsOkSuggest',
    setTextAlign: 'important',
    ignoreSelector: 'svg'
};

const titleOptions = {
    fontClass: 'FontSetGPT',
    processedClass: 'AsOk',
    setTextAlign: true
};

let messageWatch = null;

function withForceCodeLtr(base, rtlAlgorithm) {
    return rtlAlgorithm === 'advanced_full' ? { ...base, forceCodeLtr: true } : base;
}

function ensureCopyright() {
    if (!chrome.runtime?.id) {
        return;
    }
    let $target = AQ('[data-thread-scroll-footer="true"] [data-pip-obstacle="thread-footer"]');
    if (!$target.length) {
        const body = document.querySelector('[class^="ComposerLayoutBody"], [class*=" ComposerLayoutBody"]');
        const form = body && body.closest && body.closest('form');
        const twoUp = form && form.parentElement && form.parentElement.parentElement;
        if (twoUp) {
            $target = AQ(twoUp);
        }
    }
    if (!$target.length) {
        $target = AQ('#thread-bottom .w-full .pointer-events-auto');
    }
    if ($target.length) {
        addCopyright($target, 'text-xs text-token-text-secondary AsBoxB', 'margin-top: 9px; margin-bottom: -11px;');
    }
}

function shouldSkipComposer(element) {
    return (
        !element ||
        element.id === 'mobile-composer-prompt' ||
        element.id === 'prompt-textarea' ||
        (element.classList.contains('ProseMirror') && element.closest(MARKDOWN_ROOT)) ||
        Boolean(element.closest && element.closest('[class*="InlineCodePane-"]')) ||
        Boolean(element.closest && element.closest('[data-writing-block-table-controls-container]'))
    );
}

function applyComposerRtl(element, rtlAlgorithm) {
    AQ(element).removeClass('AsOk');
    element.removeAttribute('data-ai-rtl-editor');
    element.removeAttribute('data-ai-rtl-sig');
    applyRtlToElement(element, rtlAlgorithm, { fontClass: 'FontSetGPT', setTextAlign: true });
}

function watchComposer(element, rtlAlgorithm) {
    if (shouldSkipComposer(element) || AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);
    applyComposerRtl(element, rtlAlgorithm);
    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => applyComposerRtl(this, rtlAlgorithm));
    });
}

function clearDirOnIgnored(root) {
    if (!root || root.nodeType !== 1) {
        return;
    }
    let nested;
    try {
        nested = root.querySelectorAll(MARKDOWN_IGNORE);
    } catch {
        return;
    }
    const targets = nested.length
        ? nested
        : (root.closest && root.closest(MARKDOWN_IGNORE) ? [root.closest(MARKDOWN_IGNORE)] : []);
    for (let i = 0; i < targets.length; i++) {
        const node = targets[i];
        if (node.hasAttribute('dir')) {
            preserveOriginalDir(node);
            node.removeAttribute('dir');
        }
        node.querySelectorAll('[dir]').forEach((child) => {
            preserveOriginalDir(child);
            child.removeAttribute('dir');
        });
    }
}

function closestMarkdown(node) {
    if (!node) {
        return null;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
    }
    if (!node || node.nodeType !== 1 || !node.closest) {
        return null;
    }
    if (node.matches(MARKDOWN_ROOT)) {
        return node;
    }
    const root = node.closest(MARKDOWN_ROOT);
    if (root) {
        return root;
    }
    return node.matches(MARKDOWN_ASSISTANT) ? node : node.closest(MARKDOWN_ASSISTANT);
}

function collectMarkdown(node, queueMarkdown) {
    if (!node || node.nodeType !== 1) {
        return;
    }
    if (node.matches && node.matches(MARKDOWN_ROOT)) {
        queueMarkdown(node);
    } else if (node.matches && node.matches(MARKDOWN_ASSISTANT) && !node.closest(MARKDOWN_ROOT)) {
        queueMarkdown(node);
    }
    if (!node.querySelectorAll) {
        return;
    }
    node.querySelectorAll(MARKDOWN_ROOT).forEach(queueMarkdown);
    node.querySelectorAll(MARKDOWN_ASSISTANT).forEach((el) => {
        if (!el.closest(MARKDOWN_ROOT)) {
            queueMarkdown(el);
        }
    });
}

function applyUserMessages(root, rtlAlgorithm) {
    eachMatch(root, USER_MESSAGE, (element) => {
        if (!isNearViewport(element)) {
            return;
        }
        applyRtlToElement(element, rtlAlgorithm, withForceCodeLtr({
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        }, rtlAlgorithm));
    });
}

function applyFollowups(root, rtlAlgorithm) {
    eachMatch(root, FOLLOWUP, (element) => {
        if (AQ(element).hasClass(followupOptions.processedClass)) {
            return;
        }
        applyRtlToElement(element, rtlAlgorithm, followupOptions);
    });
}

function applySuggestions(root, rtlAlgorithm) {
    eachMatch(root, 'ul.divide-token-border-light .whitespace-pre-wrap', (element) => {
        if (!AQ(element).hasClass('AsOk')) {
            applyRtlToElement(element, rtlAlgorithm, {
                fontClass: 'FontSetGPT',
                processedClass: 'AsOk'
            });
        }
    });
    applyFollowups(root, rtlAlgorithm);
}

function isWritingBlockTitle(element) {
    const header = element && element.closest && element.closest('header[class*="header-"]');
    if (!header || !header.parentElement) {
        return false;
    }
    try {
        return Boolean(header.parentElement.querySelector('.writing-block-editor, textarea[name="subject"], textarea[aria-label="Subject"]'));
    } catch {
        return false;
    }
}

function applyWritingTitles(root, rtlAlgorithm) {
    eachMatch(root, 'header[class*="header-"] .overflow-hidden.whitespace-nowrap', (element) => {
        if (!isWritingBlockTitle(element)) {
            return;
        }
        const text = (element.textContent || '').trim();
        if (!text) {
            return;
        }
        const sig = `${text.length}:${text.slice(0, 24)}:${text.slice(-24)}`;
        if (element.getAttribute('data-ai-rtl-title-sig') === sig && AQ(element).hasClass('AsOk')) {
            return;
        }
        AQ(element).removeClass('AsOk');
        applyRtlToElement(element, rtlAlgorithm, titleOptions);
        element.setAttribute('data-ai-rtl-title-sig', sig);
    });
}

function isLockedMarkdownEditor(element) {
    return Boolean(
        element &&
        element.nodeType === 1 &&
        element.matches(MARKDOWN) &&
        element.classList.contains('ProseMirror') &&
        element.isContentEditable
    );
}

function startMessageWatch(rtlAlgorithm) {
    if (messageWatch) {
        messageWatch.stop();
    }

    messageWatch = createViewportMessageWatch({
        markdownSelector: MARKDOWN,
        closestMarkdown,
        collectMarkdown,
        isEngineActive: isRtlEngineActive,
        throttleMs: (element) => (isLockedMarkdownEditor(element) ? 150 : MARKDOWN_THROTTLE_MS),
        unprocessedSelector: [
            '[class^="MarkdownRoot-"]:not([data-text-length]):not(.AsSetAlgorithm)',
            '[class*=" MarkdownRoot-"]:not([data-text-length]):not(.AsSetAlgorithm)',
            '[data-assistant-markdown]:not([data-text-length]):not(.AsSetAlgorithm)'
        ].join(', '),
        shouldSkipMissed: (element) => (
            element.matches(MARKDOWN_ASSISTANT) &&
            !element.matches(MARKDOWN_ROOT) &&
            Boolean(element.closest(MARKDOWN_ROOT))
        ),
        processMarkdown: (element) => {
            AQ(element).addClass('AsSetAlgorithm');
            applyRtlToContainer(element, rtlAlgorithm, withForceCodeLtr(markdownOptions, rtlAlgorithm));
            clearDirOnIgnored(element);
            applyFollowups(element, rtlAlgorithm);
        },
        onAdded: (node, { queueExtra }) => {
            if (hasSelector(node, USER_MESSAGE)) {
                queueExtra('users', node);
            }
            if (hasSelector(node, `ul.divide-token-border-light, .whitespace-pre-wrap, ${FOLLOWUP}`, `ul.divide-token-border-light .whitespace-pre-wrap, ${FOLLOWUP}`)) {
                queueExtra('suggestions', node);
            }
            if (
                hasSelector(node, 'header[class*="header-"] .overflow-hidden.whitespace-nowrap') ||
                hasSelector(node, '.writing-block-editor, textarea[name="subject"], textarea[aria-label="Subject"]')
            ) {
                queueExtra('titles', node);
            }
        },
        onMutationTarget: (target, { queueExtra, scheduleFlush }) => {
            if (
                target &&
                target.nodeType === 1 &&
                target.matches &&
                (
                    target.matches('ul.divide-token-border-light') ||
                    target.matches(FOLLOWUP) ||
                    Boolean(target.querySelector && target.querySelector(FOLLOWUP))
                )
            ) {
                queueExtra('suggestions', target);
                scheduleFlush();
            }
        }
    });

    messageWatch.setExtraFlush('users', (node) => applyUserMessages(node, rtlAlgorithm));
    messageWatch.setExtraFlush('suggestions', (node) => applySuggestions(node, rtlAlgorithm));
    messageWatch.setExtraFlush('titles', (node) => applyWritingTitles(node, rtlAlgorithm));
    messageWatch.start();
}

export function initializeChatGptElements(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }
    const reactRoot = document.querySelector('[data-reactroot]');
    if (reactRoot && '__reactInternalInstance' in reactRoot && !reactRoot.__reactInternalInstance) {
        console.log('React is still hydrating, skipping...');
        return;
    }

    ensureCopyright();
    AQ('body').addClass('FontSetGPT');

    AQ('.hljs-comment').each(function () {
        applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSetGPT', processedClass: 'AsOk' });
    });

    applyUserMessages(document.body, rtlAlgorithm);

    AQ(COMPOSER).each(function () {
        if (shouldSkipComposer(this)) {
            return;
        }
        const tag = this.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || this.classList.contains('ProseMirror')) {
            watchComposer(this, rtlAlgorithm);
            return;
        }
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            onlyCss: true
        });
    });

    AQ('.text-token-text-secondary span').each(function () {
        applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSetGPT', processedClass: 'AsOk' });
    });

    applyFollowups(document.body, rtlAlgorithm);
    applyWritingTitles(document.body, rtlAlgorithm);
}

export function initializeChatGptHistory(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }
    AQ('[data-app-action-sidebar-section-heading="Recents"] [role="listitem"], [data-app-action-sidebar-project-row]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });
}

function enforceMobileComposer(defaultAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }
    AQ('#mobile-composer-prompt, [data-mobile-composer-prompt]').each(function () {
        const algorithm = AQ(this).attr('data-algorithm-rtl') || defaultAlgorithm;
        applyRtlToElement(this, algorithm, withForceCodeLtr({
            fontClass: 'FontSetGPT',
            setTextAlign: true,
            removeDirAuto: true
        }, algorithm));
    });
}

/** Cheap periodic pass: composers + sidebar. Messages stay on the observer. */
export function refreshChatGptLiveTargets(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }
    AQ(COMPOSER).each(function () {
        const tag = this.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || this.classList.contains('ProseMirror')) {
            watchComposer(this, rtlAlgorithm);
        }
    });
    initializeChatGptHistory(rtlAlgorithm);
    enforceMobileComposer(rtlAlgorithm);
    applyWritingTitles(document.body, rtlAlgorithm);
    ensureCopyright();
    if (messageWatch) {
        messageWatch.recheck();
    }
}

export function stopChatGptNew() {
    if (messageWatch) {
        messageWatch.stop();
        messageWatch = null;
    }
}

export function runChatGptNew(rtlAlgorithm = 'advanced_full') {
    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory(rtlAlgorithm);
    enforceMobileComposer(rtlAlgorithm);
    if (!messageWatch) {
        startMessageWatch(rtlAlgorithm);
    }
}
