// ChatGPT service functions
import { isRTL } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, processCodeMirrorBlocks } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';

let markdownObserver = null;
let markdownFlushRaf = 0;
const markdownProcessTimes = new WeakMap();
// ChatGPT currently ships multiple UI variants; keep selectors compatible with both.
const MARKDOWN_SELECTOR = '.markdown, [class^="MarkdownRoot-"], [class*=" MarkdownRoot-"], [data-assistant-markdown]';
const MARKDOWN_IGNORE_SELECTOR = '[class*="TableContainer"], [class*="tableContainer"]';
const USER_MESSAGE_SELECTOR = '[data-message-author-role="user"], .text-user-message, [data-user-message-bubble]';
const MOBILE_COMPOSER_SELECTOR = '#mobile-composer-prompt, [data-mobile-composer-prompt]';
const CHATGPT_LOCKED_EDITOR_SELECTOR = '.ProseMirror.markdown[contenteditable], .ProseMirror[contenteditable][class^="MarkdownRoot-"], .ProseMirror[contenteditable][class*=" MarkdownRoot-"], [data-assistant-writing-block]';

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
const COMPOSER_CSS_OPTIONS = {
    fontClass: 'FontSetGPT',
    processedClass: 'AsOk',
    setTextAlign: true,
    // onlyCss: true
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
        // User text nodes differ between old/new ChatGPT, selector above handles both.
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

        processCodeMirrorBlocks(element, {
            fontClass: 'FontSetCodeBlocksGPT',
            setTextAlign: true
        });
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
    let presentation = '.relative.flex.h-full ';
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

    AQ(USER_MESSAGE_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true
        });
    });

    AQ(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function () {
        if (!AQ(this).parent().hasClass('AsOk')) {
            AQ(this).parent().addClass('AsOk');
            const text = AQ(this).text();
            AQ(this).addClass('FontSetGPT');
            if (isRTL(text)) {
                AQ(this).parent().addClass('setRight');
            }
        }
    });

    // Temporarily disable global font injection for ChatGPT containers.
    // AQ('body').each(function () {
    //     AQ(this).addClass('FontSetGPT');
    // });
    //
    // AQ(presentation).each(function () {
    //     AQ(this).addClass('FontSetGPT');
    // });

    AQ(presentation + '#prosemirror-editor-container').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            rtlClass: 'flex-row-reverse'
        });
    });


    AQ('#prompt-textarea').each(function () {
        if (this.id === 'mobile-composer-prompt') {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, COMPOSER_CSS_OPTIONS);

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
    
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            setTextAlign: true
        });
        AQ(this).data('rtl-listener-added', true);


        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, COMPOSER_CSS_OPTIONS);

            });
        });
    });


    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]').each(function () {
        if (this.id === 'mobile-composer-prompt') {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, COMPOSER_CSS_OPTIONS);

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
    
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            setTextAlign: true
        });
        AQ(this).data('rtl-listener-added', true);


        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, COMPOSER_CSS_OPTIONS);

            });
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

    // [7] Sidebar history (#history .__menu-item)
    AQ('#history .__menu-item').each(function (each) {
        const text = AQ(this).text()
        let p = isRTL(text);
    
        if ((text !== "New chat") && !AQ(this).hasClass("AsOkList")) {
            AQ(this).addClass('AsOkList');
    
            if (p) {
                AQ(this).attr("dir", "rtl");
                AQ(this).addClass('AsRtlList');
                AQ(this).addClass('FontSetGPT');
                AQ(this).parent().addClass('AsRtlList_parent');
            }
        }
    
        let absoluteItem = AQ(this).parent().parent().find(".absolute.bottom-0")
    
        if (!absoluteItem.hasClass("AsOk")) {
            absoluteItem.addClass('AsOk');
    
            if (p) {
                absoluteItem.addClass('AsOkList_absolute');
            }
        }
    })

    // New ChatGPT sidebar history (Recents) and project rows
    AQ('[data-app-action-sidebar-section-heading="Recents"] [role="listitem"], [data-app-action-sidebar-project-row]').each(function () {
        console.log('this', this);
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });
}

export function activateChatGptRTL(rtlAlgorithm = 'advanced_full') {
    console.log('AI RTL activated with algorithm:', rtlAlgorithm);

    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory(rtlAlgorithm);
    initializeMarkdownObserver(rtlAlgorithm);
    enforceAlgorithmRtlTargets(rtlAlgorithm);

    setInterval(() => {
        initializeChatGptElements(rtlAlgorithm);
        initializeChatGptHistory(rtlAlgorithm);
        enforceAlgorithmRtlTargets(rtlAlgorithm);
    }, 1000);
}
