// ChatGPT service functions
import { isRTL } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, processCodeMirrorBlocks } from '../utils/textDirectionUtils.js';
import { isRtlEngineActive } from '../utils/originalState.js';

let markdownObserver = null;
let markdownFlushRaf = 0;
const markdownProcessTimes = new WeakMap();
const CHATGPT_LOCKED_EDITOR_SELECTOR = '.ProseMirror.markdown[contenteditable]';
const MARKDOWN_PROCESS_OPTIONS = {
    fontClass: 'FontSetGPT',
    codeFontClass: 'FontSetCodeBlocksGPT',
    processedClass: 'AsOkText',
    isContainer: true,
    siteConfig: 'chatgpt',
    setTextAlign: true,
    onlyCss: CHATGPT_LOCKED_EDITOR_SELECTOR
};
const COMPOSER_CSS_OPTIONS = {
    fontClass: 'FontSetGPT',
    processedClass: 'AsOk',
    setTextAlign: true,
    onlyCss: true
};

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
    return node.closest ? node.closest('.markdown') : null;
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
            setTextAlign: true
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
        pendingMarkdown.add(element);
        if (!markdownFlushRaf) {
            markdownFlushRaf = requestAnimationFrame(flushPendingMarkdown);
        }
    };

    const queueAddedNode = (node) => {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        if (node.classList && node.classList.contains('markdown')) {
            queueMarkdown(node);
        }
        if (node.querySelector && node.querySelector('.markdown')) {
            node.querySelectorAll('.markdown').forEach(queueMarkdown);
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

    document.querySelectorAll('.markdown').forEach(queueMarkdown);
}

export function initializeChatGptElements(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }
    if (document.querySelector('[data-reactroot]') && !document.querySelector('[data-reactroot]').__reactInternalInstance) {
        console.log('React is still hydrating, skipping...');
        return;
    }
    let presentation = ".relative.flex.h-full "
    if (chrome.runtime?.id) {
        addCopyright(AQ('#thread-bottom').find('.w-full .pointer-events-auto'), "text-xs text-token-text-secondary AsBoxB" , 'margin-top: 9px; margin-bottom: -11px;');
    }

    AQ('.hljs-comment').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    })

    processCodeMirrorBlocks(document.body, {
        fontClass: 'FontSetCodeBlocksGPT',
        setTextAlign: true
    });

    AQ('[data-message-author-role="user"]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });

    AQ(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function (each) {
        if (!AQ(this).parent().hasClass("AsOk")) {
            AQ(this).parent().addClass('AsOk');
            const text = AQ(this).text()
            AQ(this).addClass('FontSetGPT');
            if (isRTL(text)) {
                AQ(this).parent().addClass("setRight")
            }

        }
    })


    AQ('body').each(function (each) {
        AQ(this).addClass('FontSetGPT');
    })

    AQ(presentation).each(function (each) {
        AQ(this).addClass('FontSetGPT');
    })

    AQ(presentation + '#prosemirror-editor-container').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            rtlClass: 'flex-row-reverse'
        });
    })

    AQ("#prompt-textarea").each(function (each) {
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
    })

    
    AQ('.text-token-text-secondary span').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    })


}

export function initializeChatGptHistory() {
    if (!isRtlEngineActive()) {
        return;
    }
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
}

export function activateChatGptRTL(rtlAlgorithm = 'advanced_full') {
    console.log('AI RTL activated with algorithm:', rtlAlgorithm);

    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory();
    initializeMarkdownObserver(rtlAlgorithm);

    setInterval(() => {
        initializeChatGptElements(rtlAlgorithm);
        initializeChatGptHistory();
    }, 1000);
}
