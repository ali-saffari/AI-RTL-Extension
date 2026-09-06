import { addCopyright } from '../utils/copyright.js';
import { observeDomSections } from '../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';
import { isRtlEngineActive } from '../utils/originalState.js';

const MESSAGE_SELECTOR = [
    'ms-cmark-node',
    'ms-text-chunk',
    'ms-prompt-chunk',
    'ms-thought-chunk',
    'ms-thought-accordion .markdown-content',
    '[data-turn-role="User"] .turn-content',
    '[data-turn-role="Model"] .turn-content'
].join(', ');

const INPUT_SELECTOR = [
    'ms-prompt-box textarea',
    'ms-prompt-input-wrapper textarea',
    'ms-chunk-input textarea',
    'ms-autosize-textarea textarea',
    'textarea.textarea',
    'textarea[aria-label*="prompt" i]',
    '[contenteditable="true"]'
].join(', ');

const RTL_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    isContainer: true,
    setTextAlign: true,
    siteConfig: 'aistudio',
    ignoreSelector: 'ms-code-block, ms-function-call-chunk, .cm-editor, pre, code, mat-icon, .google-symbols, [class*="material-symbols"]'
};

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

function resetIfDirectionChanged($el) {
    const intended = $el.attr('data-direction');
    const dir = $el.attr('dir');
    if (intended && dir !== intended) {
        $el.removeAttr('data-text-length');
        $el.removeClass('AsOk');
        $el.find('.AsOk').removeClass('AsOk');
    }
}

function processMessageNode(el, rtlAlgorithm) {
    if (!el || el.closest?.('ms-code-block, ms-function-call-chunk, .cm-editor')) {
        return;
    }

    const $el = AQ(el);
    resetIfDirectionChanged($el);

    applyRtlToContainer(el, rtlAlgorithm, RTL_OPTIONS);

    if (rtlAlgorithm === 'advanced_full') {
        $el.children('p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, ms-cmark-node').each(function () {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: false,
                setTextAlign: true
            });
        });
    }
}

function processTextLabeledCodeBlocks(rtlAlgorithm) {
    AQ('ms-code-block').each(function () {
        const $codeBlock = AQ(this);
        $codeBlock.attr('dir', 'ltr');

        const title = ($codeBlock.find('mat-panel-title, .mat-expansion-panel-header-title').text() || '').trim();
        if (!/^text$/i.test(title)) {
            return;
        }

        $codeBlock.find('code, pre').each(function () {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: false,
                setTextAlign: true
            });
        });
    });
}

function bindPromptInputs(rtlAlgorithm) {
    AQ(INPUT_SELECTOR).each(function () {
        const $input = AQ(this);
        if ($input.closest('ms-code-block, .cm-editor').length) {
            return;
        }

        if (!$input.data('rtl-listener-added')) {
            $input.data('rtl-listener-added', true);
            $input.on('input keyup paste', function () {
                requestAnimationFrame(() => {
                    applyRtlToElement(this, rtlAlgorithm, {
                        fontClass: 'FontSet',
                        setTextAlign: true
                    });
                });
            });
        }

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: false,
            setTextAlign: true
        });
    });
}

export function setAiStudio(rtlAlgorithm = 'advanced_full') {
    if (isExtensionContextValid()) {
        addCopyright(
            AQ('section footer, .disclaimer, ms-prompt-box, .chat-session-content footer'),
            'AsBoxB',
            'margin-top: 14px'
        );
    }

    AQ(MESSAGE_SELECTOR).each(function () {
        processMessageNode(this, rtlAlgorithm);
    });

    AQ('[data-test-id="suggestion-chip"], .above-carousel, .below-carousel p').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });

    processTextLabeledCodeBlocks(rtlAlgorithm);
    bindPromptInputs(rtlAlgorithm);
}

export function activateAistudio(rtlAlgorithm = 'advanced_full') {
    console.log('AI Studio RTL activated with algorithm:', rtlAlgorithm);

    setAiStudio(rtlAlgorithm);

    let refreshInterval;
    let markdownObserver;
    const stopAiStudioTimers = () => {
        clearInterval(refreshInterval);
        if (markdownObserver) {
            markdownObserver.disconnect();
            markdownObserver = null;
        }
    };

    markdownObserver = observeDomSections([
        {
            selector: MESSAGE_SELECTOR,
            ignore: 'ms-code-block, ms-function-call-chunk, .cm-editor',
            process: (el) => {
                if (!isExtensionContextValid() || !isRtlEngineActive()) {
                    stopAiStudioTimers();
                    return;
                }
                processMessageNode(el, rtlAlgorithm);
            },
            debounceMs: 150,
            throttleMs: 400,
            idleMs: 800
        }
    ]);

    refreshInterval = setInterval(() => {
        if (!isExtensionContextValid() || !isRtlEngineActive()) {
            stopAiStudioTimers();
            return;
        }

        try {
            setAiStudio(rtlAlgorithm);
        } catch (error) {
            if (!isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated')) {
                stopAiStudioTimers();
                return;
            }
            throw error;
        }
    }, 1000);
}
