// Current ChatGPT UI. Active when #stage-sidebar-tiny-bar is not in the DOM.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, processCodeMirrorBlocks } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';

let markdownObserver = null;
let markdownFlushRaf = 0;
let markdownScanInterval = 0;
let markdownProcessTimes = new WeakMap();
const MARKDOWN_SCAN_INTERVAL_MS = 1000;
const MARKDOWN_SELECTOR = ' [class^="MarkdownRoot-"], [class*=" MarkdownRoot-"], [data-assistant-markdown] , [data-writing-block-table-controls-container]';
const MARKDOWN_IGNORE_SELECTOR = '[class*="TableContainer"], [class*="tableContainer"], [class*="CodeBlock-"], [class*="InlineCodePane-"]';
const USER_MESSAGE_SELECTOR = '[data-message-author-role="user"], .text-user-message, [data-user-message-bubble]';
const MOBILE_COMPOSER_SELECTOR = '#mobile-composer-prompt, [data-mobile-composer-prompt]';
const MARKDOWN_ROOT_SELECTOR = '[class^="MarkdownRoot-"], [class*=" MarkdownRoot-"]';
const CHATGPT_LOCKED_EDITOR_SELECTOR = '.ProseMirror[contenteditable], .ProseMirror[contenteditable]';
// const CHAT_PAGE_SELECTOR = '[data-app-shell-main-content-layout="thread-edge-scroll"]';

// let lastLoggedPage = '';

// function logChatPage() {
//     const isChatPage = document.querySelector(CHAT_PAGE_SELECTOR) !== null;
//     const signature = `${isChatPage}|${location.pathname}`;
//     if (signature === lastLoggedPage) {
//         return;
//     }
//     lastLoggedPage = signature;
//     console.log('ChatGPT RTL: chat page', isChatPage, location.pathname);
// }

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
    return Boolean(element && element.closest && element.closest('[data-writing-block-table-controls-container]'));
}

function watchChatGptComposer(element, rtlAlgorithm) {
    if (!element || element.id === 'mobile-composer-prompt' || element.id === 'prompt-textarea') {
        return;
    }
    if (isProseMirrorInsideMarkdownRoot(element) || isInsideInlineCodePane(element) || isInsideTableControls(element)) {
        return;
    }

    applyChatGptComposerRtl(element, rtlAlgorithm);

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            applyChatGptComposerRtl(this, rtlAlgorithm);
        });
    });
}

const MARKDOWN_PROCESS_OPTIONS = {
    fontClass: 'FontSetGPT',
    codeFontClass: 'FontSetCodeBlocksGPT',
    processedClass: 'AsOkText',
    isContainer: true,
    siteConfig: 'chatgpt',
    setTextAlign: true,
    removeDirAuto: true,
    ignoreSelector: MARKDOWN_IGNORE_SELECTOR,
    onlyCss: CHATGPT_LOCKED_EDITOR_SELECTOR
};
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
        node.removeAttribute('dir');
    }
    const dirs = node.querySelectorAll('[dir]');
    for (let i = 0; i < dirs.length; i++) {
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
    if (node.matches && node.matches(MARKDOWN_SELECTOR)) {
        return node;
    }
    return node.closest ? node.closest(MARKDOWN_SELECTOR) : null;
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
            applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        });
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

    const processMarkdownElement = (element) => {
        if (!isRtlEngineActive()) {
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

        AQ(element).addClass('AsSetAlgorithm');
        applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_PROCESS_OPTIONS);

        // processCodeMirrorBlocks(element, {
        //     fontClass: 'FontSetCodeBlocksGPT',
        //     setTextAlign: true
        // });
        clearDirOnIgnoredMarkdown(element);
    };

    const flushPendingMarkdown = () => {
        markdownFlushRaf = 0;
        pendingMarkdown.forEach((element) => {
            if (element.isConnected) {
                processMarkdownElement(element);
            }
        });
        pendingMarkdown.clear();
    };

    const queueMarkdown = (element) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        // Batch multiple mutation events into a single RAF flush.
        pendingMarkdown.add(element);
        if (!markdownFlushRaf) {
            markdownFlushRaf = requestAnimationFrame(flushPendingMarkdown);
        }
    };

    const queueAddedNode = (node) => {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        if (node.matches && node.matches(MARKDOWN_SELECTOR)) {
            queueMarkdown(node);
        }
        if (node.querySelector && node.querySelector(MARKDOWN_SELECTOR)) {
            node.querySelectorAll(MARKDOWN_SELECTOR).forEach(queueMarkdown);
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
                    processUserMessageNode(node, rtlAlgorithm);
                    processSuggestionNode(node, rtlAlgorithm);
                }

                if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE &&
                    mutation.target.matches && mutation.target.matches('ul.divide-token-border-light')) {
                    processSuggestionNode(mutation.target, rtlAlgorithm);
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

    document.querySelectorAll(MARKDOWN_SELECTOR).forEach(queueMarkdown);

    markdownScanInterval = setInterval(() => {
        if (!isRtlEngineActive()) {
            return;
        }
        document.querySelectorAll(MARKDOWN_SELECTOR).forEach(processMarkdownElement);
    }, MARKDOWN_SCAN_INTERVAL_MS);
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

    // processCodeMirrorBlocks(document.body, {
    //     fontClass: 'FontSetCodeBlocksGPT',
    //     setTextAlign: true
    // });

    AQ(USER_MESSAGE_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        });
    });

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), .ProseMirror, [contenteditable="true"]').each(function () {
        if (this.id === 'mobile-composer-prompt' || this.id === 'prompt-textarea' || isProseMirrorInsideMarkdownRoot(this) || isInsideInlineCodePane(this) || isInsideTableControls(this)) {
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

    // // Keep mobile composer isolated from generic input rules.
    // AQ(MOBILE_COMPOSER_SELECTOR).each(function () {
    //     const applyMobileComposer = () => {
    //         applyRtlToElement(this, rtlAlgorithm, {
    //             fontClass: 'FontSetGPT',
    //             setTextAlign: true,
    //             removeDirAuto: true
    //         });
    //     };

    //     applyMobileComposer();

    //     if (AQ(this).data('rtl-mobile-listener-added')) {
    //         return;
    //     }
    //     AQ(this).data('rtl-mobile-listener-added', true);

    //     AQ(this).on('beforeinput input keyup paste change compositionend', function () {
    //         requestAnimationFrame(() => {
    //             applyMobileComposer();
    //         });
    //     });
    // });

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
        applyRtlToElement(this, elementAlgorithm, {
            fontClass: 'FontSetGPT',
            setTextAlign: true,
            removeDirAuto: true
        });
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

export function stopChatGptNew() {
    // lastLoggedPage = '';
    if (markdownObserver) {
        markdownObserver.disconnect();
        markdownObserver = null;
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
    // logChatPage();
    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory(rtlAlgorithm);
    enforceAlgorithmRtlTargets(rtlAlgorithm);
    if (!markdownObserver) {
        initializeMarkdownObserver(rtlAlgorithm);
    }
}
