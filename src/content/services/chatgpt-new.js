// Current ChatGPT UI. Active when #stage-sidebar-tiny-bar is not in the DOM.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, processCodeMirrorBlocks } from '../utils/directionUtils/index.js';
import { logDebug } from '../utils/directionUtils/shared.js';
import { isRtlEngineActive, preserveOriginalDir } from '../utils/originalState.js';

let markdownObserver = null;
let markdownVisibilityObserver = null;
let markdownFlushRaf = 0;
let markdownScanInterval = 0;
let markdownProcessTimes = new WeakMap();
const MARKDOWN_SCAN_INTERVAL_MS = 8000;
const VIEWPORT_ROOT_MARGIN = '300px 0px';
const VIEWPORT_MARGIN_PX = 300;
const MARKDOWN_ROOT_SELECTOR = '[class^="MarkdownRoot-"], [class*=" MarkdownRoot-"]';
const MARKDOWN_ASSISTANT_SELECTOR = '[data-assistant-markdown]';
const MARKDOWN_SELECTOR = `${MARKDOWN_ROOT_SELECTOR}, ${MARKDOWN_ASSISTANT_SELECTOR}`;
const MARKDOWN_IGNORE_SELECTOR = '[class*="TableContainer"], [class*="tableContainer"], [class*="CodeBlock-"], [class*="InlineCodePane-"]';
const TABLE_CONTROLS_SELECTOR = '[data-writing-block-table-controls-container]';
const USER_MESSAGE_SELECTOR = '[data-message-author-role="user"], .text-user-message, [data-user-message-bubble]';
const MOBILE_COMPOSER_SELECTOR = '#mobile-composer-prompt, [data-mobile-composer-prompt]';
const COMPOSER_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), .ProseMirror, [contenteditable="true"]';
const CHATGPT_LOCKED_EDITOR_SELECTOR = '.ProseMirror[contenteditable], .ProseMirror[contenteditable]';

/** True when element is within viewport ± margin (same band as IntersectionObserver rootMargin). */
function isNearViewport(element, marginPx = VIEWPORT_MARGIN_PX) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
        return false;
    }
    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.bottom >= -marginPx && rect.top <= vh + marginPx;
}

const COMPOSER_LIVE_OPTIONS = {
    fontClass: 'FontSetGPT',
    setTextAlign: true,
};

function applyChatGptComposerRtl(element, rtlAlgorithm) {
    const $element = AQ(element);
    $element.removeClass('AsOk');
    element.removeAttribute('data-ai-rtl-editor');
    element.removeAttribute('data-ai-rtl-sig');
    applyRtlToElement(element, rtlAlgorithm, COMPOSER_LIVE_OPTIONS);
}

function isProseMirrorInsideMarkdownRoot(element) {
    return Boolean(
        element &&
        element.classList &&
        element.classList.contains('ProseMirror') &&
        element.closest &&
        element.closest(MARKDOWN_ROOT_SELECTOR)
    );
}

function isInsideInlineCodePane(element) {
    return Boolean(element && element.closest && element.closest('[class*="InlineCodePane-"]'));
}

function isInsideTableControls(element) {
    return Boolean(element && element.closest && element.closest(TABLE_CONTROLS_SELECTOR));
}

function shouldSkipComposer(element) {
    return (
        !element ||
        element.id === 'mobile-composer-prompt' ||
        element.id === 'prompt-textarea' ||
        isProseMirrorInsideMarkdownRoot(element) ||
        isInsideInlineCodePane(element) ||
        isInsideTableControls(element)
    );
}

function watchChatGptComposer(element, rtlAlgorithm) {
    if (shouldSkipComposer(element)) {
        return;
    }

    // Already attached: do not strip skip-state / re-analyze every tick.
    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    applyChatGptComposerRtl(element, rtlAlgorithm);

    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            applyChatGptComposerRtl(this, rtlAlgorithm);
        });
    });
}

const MARKDOWN_PROCESS_OPTIONS = {
    fontClass: 'FontSetGPT',
    codeFontClass: 'FontSetCodeBlocksGPT',
    processedClass: 'AsOk',
    isContainer: true,
    siteConfig: 'chatgpt',
    setTextAlign: true,
    // Do not set text-align on MarkdownRoot / assistant markdown container.
    setRootTextAlign: false,
    removeDirAuto: true,
    // Skip tables/code in advanced walk only (like ms-code-block), not via ignoreSelector.
    walkSkipSelector: MARKDOWN_IGNORE_SELECTOR,
    onlyCss: CHATGPT_LOCKED_EDITOR_SELECTOR
};

function chatGptRtlOptions(base, rtlAlgorithm) {
    if (rtlAlgorithm !== 'advanced_full') {
        return base;
    }
    // Unified mode: force code blocks LTR.
    return { ...base, forceCodeLtr: true };
}

function isLockedMarkdownEditorEl(element) {
    return Boolean(
        element &&
        element.nodeType === Node.ELEMENT_NODE &&
        element.matches(MARKDOWN_SELECTOR) &&
        element.classList.contains('ProseMirror') &&
        element.isContentEditable
    );
}

function clearDirInTree(node) {
    if (node.hasAttribute('dir')) {
        preserveOriginalDir(node);
        node.removeAttribute('dir');
    }
    const dirs = node.querySelectorAll('[dir]');
    for (let i = 0; i < dirs.length; i++) {
        preserveOriginalDir(dirs[i]);
        dirs[i].removeAttribute('dir');
    }
}

function clearDirOnIgnoredMarkdown(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    let nested;
    try {
        nested = root.querySelectorAll(MARKDOWN_IGNORE_SELECTOR);
    } catch {
        return;
    }
    if (!nested.length) {
        const ancestor = root.closest && root.closest(MARKDOWN_IGNORE_SELECTOR);
        if (!ancestor) {
            return;
        }
        clearDirInTree(ancestor);
        return;
    }

    for (let i = 0; i < nested.length; i++) {
        clearDirInTree(nested[i]);
    }
}

function closestMarkdown(node) {
    if (!node) {
        return null;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
    }
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    // Prefer MarkdownRoot so nested assistant-markdown is not double-processed.
    if (node.matches && node.matches(MARKDOWN_ROOT_SELECTOR)) {
        return node;
    }
    const root = node.closest ? node.closest(MARKDOWN_ROOT_SELECTOR) : null;
    if (root) {
        return root;
    }
    if (node.matches && node.matches(MARKDOWN_ASSISTANT_SELECTOR)) {
        return node;
    }
    return node.closest ? node.closest(MARKDOWN_ASSISTANT_SELECTOR) : null;
}

function processUserMessageNode(node, rtlAlgorithm) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const $node = AQ(node);
    const userMessages = $node.find(USER_MESSAGE_SELECTOR).add(
        $node.filter(USER_MESSAGE_SELECTOR)
    );

    userMessages.each(function() {
        if (!isNearViewport(this)) {
            logDebug('skip viewport user-message', this);
            return;
        }
        applyRtlToElement(this, rtlAlgorithm, chatGptRtlOptions({
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        }, rtlAlgorithm));
    });
}

function processSuggestionNode(node, rtlAlgorithm) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const $node = AQ(node);
    const suggestionElements = $node.find('ul.divide-token-border-light .whitespace-pre-wrap').add(
        $node.filter('ul.divide-token-border-light .whitespace-pre-wrap')
    );

    if ($node.is('ul.divide-token-border-light')) {
        $node.find('.whitespace-pre-wrap').each(function() {
            if (!AQ(this).hasClass('AsOk')) {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSetGPT',
                    processedClass: 'AsOk'
                });
            }
        });
    }

    suggestionElements.each(function() {
        if (!AQ(this).hasClass('AsOk')) {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSetGPT',
                processedClass: 'AsOk'
            });
        }
    });
}

export function initializeMarkdownObserver(rtlAlgorithm = 'advanced_section') {
    if (markdownObserver) {
        markdownObserver.disconnect();
        markdownObserver = null;
    }
    if (markdownVisibilityObserver) {
        markdownVisibilityObserver.disconnect();
        markdownVisibilityObserver = null;
    }
    if (markdownFlushRaf) {
        cancelAnimationFrame(markdownFlushRaf);
        markdownFlushRaf = 0;
    }
    if (markdownScanInterval) {
        clearInterval(markdownScanInterval);
        markdownScanInterval = 0;
    }
    markdownProcessTimes = new WeakMap();

    const pendingMarkdown = new Set();
    const pendingUserNodes = new Set();
    const pendingSuggestionNodes = new Set();
    const visibleMarkdown = new Set();
    const dirtyMarkdown = new Set();
    const observedMarkdown = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

    const processMarkdownElement = (element) => {
        if (!isRtlEngineActive()) {
            return;
        }
        if (!visibleMarkdown.has(element)) {
            dirtyMarkdown.add(element);
            logDebug('skip viewport markdown', element);
            return;
        }
        const throttleMs = isLockedMarkdownEditorEl(element) ? 150 : 500;
        const now = Date.now();
        const last = markdownProcessTimes.get(element) || 0;
        // Throttle expensive DOM processing during token streaming.
        if (now - last < throttleMs) {
            return;
        }
        markdownProcessTimes.set(element, now);
        dirtyMarkdown.delete(element);

        logDebug('apply viewport markdown', element);
        AQ(element).addClass('AsSetAlgorithm');
        applyRtlToContainer(element, rtlAlgorithm, chatGptRtlOptions(MARKDOWN_PROCESS_OPTIONS, rtlAlgorithm));
        clearDirOnIgnoredMarkdown(element);
    };

    markdownVisibilityObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const el = entry.target;
            if (entry.isIntersecting) {
                visibleMarkdown.add(el);
                if (dirtyMarkdown.has(el) || !markdownProcessTimes.has(el)) {
                    processMarkdownElement(el);
                }
            } else {
                visibleMarkdown.delete(el);
            }
        }
    }, {
        root: null,
        rootMargin: VIEWPORT_ROOT_MARGIN,
        threshold: 0
    });

    const observeMarkdown = (element) => {
        if (!element || !markdownVisibilityObserver) {
            return;
        }
        if (observedMarkdown) {
            if (observedMarkdown.has(element)) {
                return;
            }
            observedMarkdown.add(element);
        }
        markdownVisibilityObserver.observe(element);
    };

    const flushPending = () => {
        markdownFlushRaf = 0;

        pendingMarkdown.forEach((element) => {
            if (element.isConnected) {
                processMarkdownElement(element);
            }
        });
        pendingMarkdown.clear();

        pendingUserNodes.forEach((node) => {
            if (node.isConnected) {
                processUserMessageNode(node, rtlAlgorithm);
            }
        });
        pendingUserNodes.clear();

        pendingSuggestionNodes.forEach((node) => {
            if (node.isConnected) {
                processSuggestionNode(node, rtlAlgorithm);
            }
        });
        pendingSuggestionNodes.clear();
    };

    const scheduleFlush = () => {
        if (!markdownFlushRaf) {
            markdownFlushRaf = requestAnimationFrame(flushPending);
        }
    };

    const queueMarkdown = (element) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        observeMarkdown(element);
        pendingMarkdown.add(element);
        scheduleFlush();
    };

    const queueAddedNode = (node) => {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        if (node.matches && node.matches(MARKDOWN_ROOT_SELECTOR)) {
            queueMarkdown(node);
        } else if (node.matches && node.matches(MARKDOWN_ASSISTANT_SELECTOR) && !node.closest(MARKDOWN_ROOT_SELECTOR)) {
            queueMarkdown(node);
        }

        if (node.querySelector) {
            node.querySelectorAll(MARKDOWN_ROOT_SELECTOR).forEach(queueMarkdown);
            node.querySelectorAll(MARKDOWN_ASSISTANT_SELECTOR).forEach((el) => {
                if (!el.closest(MARKDOWN_ROOT_SELECTOR)) {
                    queueMarkdown(el);
                }
            });
        }
    };

    markdownObserver = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            const mutation = mutations[i];

            if (mutation.type === 'childList') {
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    const node = mutation.addedNodes[j];
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        continue;
                    }
                    queueAddedNode(node);
                    pendingUserNodes.add(node);
                    pendingSuggestionNodes.add(node);
                    scheduleFlush();
                }

                if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE &&
                    mutation.target.matches && mutation.target.matches('ul.divide-token-border-light')) {
                    pendingSuggestionNodes.add(mutation.target);
                    scheduleFlush();
                }
            }

            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const markdown = closestMarkdown(mutation.target);
                if (markdown) {
                    queueMarkdown(markdown);
                }
            }
        }
    });

    markdownObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    document.querySelectorAll(MARKDOWN_ROOT_SELECTOR).forEach(queueMarkdown);
    document.querySelectorAll(MARKDOWN_ASSISTANT_SELECTOR).forEach((el) => {
        if (!el.closest(MARKDOWN_ROOT_SELECTOR)) {
            queueMarkdown(el);
        }
    });
}

export function initializeChatGptElements(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }
    const reactRoot = document.querySelector('[data-reactroot]');
    // Guard only legacy roots that expose this field; modern roots may not.
    if (reactRoot && '__reactInternalInstance' in reactRoot && !reactRoot.__reactInternalInstance) {
        console.log('React is still hydrating, skipping...');
        return;
    }
    if (chrome.runtime?.id) {
        addCopyright(AQ('#thread-bottom').find('.w-full .pointer-events-auto'), 'text-xs text-token-text-secondary AsBoxB' , 'margin-top: 9px; margin-bottom: -11px;');
    }

    AQ('body').addClass('FontSetGPT');

    AQ('.hljs-comment').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    });

    AQ(USER_MESSAGE_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, chatGptRtlOptions({
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        }, rtlAlgorithm));
    });

    AQ(COMPOSER_SELECTOR).each(function () {
        if (shouldSkipComposer(this)) {
            return;
        }

        const tag = this.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || this.classList.contains('ProseMirror')) {
            watchChatGptComposer(this, rtlAlgorithm);
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
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    });
}

function enforceAlgorithmRtlTargets(defaultAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }

    AQ(MOBILE_COMPOSER_SELECTOR).each(function () {
        const elementAlgorithm = AQ(this).attr('data-algorithm-rtl') || defaultAlgorithm;
        applyRtlToElement(this, elementAlgorithm, chatGptRtlOptions({
            fontClass: 'FontSetGPT',
            setTextAlign: true,
            removeDirAuto: true
        }, elementAlgorithm));
    });
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

/** Cheap periodic pass: new composers + sidebar only. Messages stay on the observer. */
export function refreshChatGptLiveTargets(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }

    AQ(COMPOSER_SELECTOR).each(function () {
        const tag = this.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || this.classList.contains('ProseMirror')) {
            watchChatGptComposer(this, rtlAlgorithm);
        }
    });

    initializeChatGptHistory(rtlAlgorithm);
    enforceAlgorithmRtlTargets(rtlAlgorithm);
}

export function stopChatGptNew() {
    if (markdownObserver) {
        markdownObserver.disconnect();
        markdownObserver = null;
    }
    if (markdownVisibilityObserver) {
        markdownVisibilityObserver.disconnect();
        markdownVisibilityObserver = null;
    }
    if (markdownFlushRaf) {
        cancelAnimationFrame(markdownFlushRaf);
        markdownFlushRaf = 0;
    }
    if (markdownScanInterval) {
        clearInterval(markdownScanInterval);
        markdownScanInterval = 0;
    }
}

export function runChatGptNew(rtlAlgorithm = 'advanced_full') {
    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory(rtlAlgorithm);
    enforceAlgorithmRtlTargets(rtlAlgorithm);
    if (!markdownObserver) {
        initializeMarkdownObserver(rtlAlgorithm);
    }
}
