// ChatGPT 4.0.16 UI. Used when #stage-sidebar-tiny-bar is on the page.
import { isRTL } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, processCodeMirrorBlocks } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';

let markdownObserver = null;
let markdownFlushRaf = 0;
let markdownScanInterval = 0;
let markdownProcessTimes = new WeakMap();
const MARKDOWN_SCAN_INTERVAL_MS = 8000;
const MARKDOWN_SELECTOR = '.markdown';
const CHATGPT_LOCKED_EDITOR_SELECTOR = '.ProseMirror.markdown[contenteditable]';
const MARKDOWN_PROCESS_OPTIONS = {
    fontClass: 'FontSetGPT',
    codeFontClass: 'FontSetCodeBlocksGPT',
    processedClass: 'AsOkText',
    isContainer: true,
    siteConfig: 'chatgpt',
    setTextAlign: true,
    removeDirAuto: true,
    onlyCss: CHATGPT_LOCKED_EDITOR_SELECTOR
};
const PRESENTATION = '.relative.flex.h-full ';

function isLockedMarkdownEditorEl(element) {
    return Boolean(
        element &&
        element.nodeType === Node.ELEMENT_NODE &&
        element.classList.contains('markdown') &&
        element.classList.contains('ProseMirror') &&
        element.isContentEditable
    );
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
    if (node.classList && node.classList.contains('markdown')) {
        return node;
    }
    return node.closest ? node.closest(MARKDOWN_SELECTOR) : null;
}

function processUserMessageNode(node, rtlAlgorithm) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const $node = AQ(node);
    const userMessages = $node.find('[data-message-author-role="user"]').add(
        $node.filter('[data-message-author-role="user"]')
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

function watchPromptTextarea(rtlAlgorithm) {
    AQ('#prompt-textarea').each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });

        AQ(this).on('keyup paste', function() {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSetGPT',
                });
            });
        });
    });
}

function processPresentationBubbles() {
    AQ(PRESENTATION + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function () {
        if (AQ(this).parent().hasClass('AsOk')) {
            return;
        }
        AQ(this).parent().addClass('AsOk');
        const text = AQ(this).text();
        AQ(this).addClass('FontSetGPT');
        if (isRTL(text)) {
            AQ(this).parent().addClass('setRight');
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
    const pendingUserNodes = new Set();
    const pendingSuggestionNodes = new Set();

    const processMarkdownElement = (element) => {
        if (!isRtlEngineActive()) {
            return;
        }
        const throttleMs = isLockedMarkdownEditorEl(element) ? 150 : 500;
        const now = Date.now();
        const last = markdownProcessTimes.get(element) || 0;
        if (now - last < throttleMs) {
            return;
        }
        markdownProcessTimes.set(element, now);

        AQ(element).addClass('AsSetAlgorithm');
        applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_PROCESS_OPTIONS);
        processCodeMirrorBlocks(element, {
            fontClass: 'FontSetCodeBlocksGPT',
            setTextAlign: true
        });
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
        pendingMarkdown.add(element);
        scheduleFlush();
    };

    const queueAddedNode = (node) => {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        if (node.classList && node.classList.contains('markdown')) {
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

    document.querySelectorAll(MARKDOWN_SELECTOR).forEach(queueMarkdown);

    // Rare catch-up — live updates are owned by the MutationObserver.
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
    if (document.querySelector('[data-reactroot]') && !document.querySelector('[data-reactroot]').__reactInternalInstance) {
        console.log('React is still hydrating, skipping...');
        return;
    }
    if (chrome.runtime?.id) {
        addCopyright(AQ('#thread-bottom').find('.w-full .pointer-events-auto'), 'text-xs text-token-text-secondary AsBoxB' , 'margin-top: 9px; margin-bottom: -11px;');
    }

    AQ('.hljs-comment').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    });

    processCodeMirrorBlocks(document.body, {
        fontClass: 'FontSetCodeBlocksGPT',
        setTextAlign: true
    });

    AQ('[data-message-author-role="user"]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        });
    });

    processPresentationBubbles();

    AQ('body').addClass('FontSetGPT');
    AQ(PRESENTATION).addClass('FontSetGPT');

    AQ(PRESENTATION + '#prosemirror-editor-container').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            rtlClass: 'flex-row-reverse'
        });
    });

    watchPromptTextarea(rtlAlgorithm);

    AQ('.text-token-text-secondary span').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    });
}

export function initializeChatGptHistory() {
    if (!isRtlEngineActive()) {
        return;
    }
    AQ('#history .__menu-item').each(function () {
        const text = AQ(this).text();
        const p = isRTL(text);

        if ((text !== 'New chat') && !AQ(this).hasClass('AsOkList')) {
            AQ(this).addClass('AsOkList');

            if (p) {
                AQ(this).attr('dir', 'rtl');
                AQ(this).addClass('AsRtlList');
                AQ(this).addClass('FontSetGPT');
                AQ(this).parent().addClass('AsRtlList_parent');
            }
        }

        const absoluteItem = AQ(this).parent().parent().find('.absolute.bottom-0');

        if (!absoluteItem.hasClass('AsOk')) {
            absoluteItem.addClass('AsOk');

            if (p) {
                absoluteItem.addClass('AsOkList_absolute');
            }
        }
    });
}

/** Cheap periodic pass: composer + history + bubbles. Messages stay on the observer. */
export function refreshChatGptOldLiveTargets(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }

    watchPromptTextarea(rtlAlgorithm);
    processPresentationBubbles();
    initializeChatGptHistory();

    AQ(PRESENTATION + '#prosemirror-editor-container').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            rtlClass: 'flex-row-reverse'
        });
    });
}

export function stopChatGptOld() {
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

export function runChatGptOld(rtlAlgorithm = 'advanced_full') {
    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory();
    if (!markdownObserver) {
        initializeMarkdownObserver(rtlAlgorithm);
    }
}
