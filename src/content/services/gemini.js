// gemini.js service functions
import { addCopyright } from '../utils/copyright.js';
import { observeDomSections } from '../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

const MARKDOWN_SELECTOR = [
    '.markdown-main-panel',
    '.immersive-editor',
    '.research-step-description'
].join(', ');

const FOLLOW_UP_SELECTOR = [
    '.follow-up-text',
    '.follow-up-container.hide-from-message-actions'
].join(', ');

const FOLLOW_UP_TEXT_SELECTOR = '.follow-up-text';
const FOLLOW_UP_INNER_SELECTOR = 'button, p, span, .follow-up-text';

const INPUT_SELECTOR = '.ql-editor, .ql-editor p';
const FONT_SELECTOR = [
    '.bot-name-ugc-label',
    '.gds-label-l',
    '.gds-body-l',
    '.gds-body-m',
    '.gds-title-m',
    '.research-step-title',
    '.mat-button-toggle-label-content',
    '.title-text',
    '.mdc-button__label',
    '.gds-body-s',
    '.gds-label-m',
    '.gds-label-s',
    '.gds-label-xs',
    '.gds-label-xxs',
    '.gds-label-m-alt',
    '.gds-body-m-alt',
    '.gds-body-s-alt',
    '.gds-body-xs-alt',
    '.ql-editor'
].join(', ');
const COPYRIGHT_SELECTOR = '.hallucination-disclaimer';

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    isContainer: true,
    setTextAlign: true
};

let geminiDomObserver = null;
let geminiDirObserver = null;

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

function isInvalidatedError(error) {
    return !isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated');
}

function runSafely(fn) {
    try {
        if (!isExtensionContextValid()) {
            return;
        }
        fn();
    } catch (error) {
        if (isInvalidatedError(error)) {
            return;
        }
        console.warn('[Gemini RTL]', error);
    }
}

function invalidateStaleGeminiRtl(element) {
    const $el = AQ(element);
    const intended = $el.attr('data-direction');
    const dir = $el.attr('dir');

    // Gemini re-renders and drops dir while keeping our length/processed cache
    if (intended && dir !== intended) {
        $el.removeAttr('data-text-length');
        $el.removeClass('AsOk');
        $el.find('.AsOk').removeClass('AsOk');
    }
}

function collectFollowUpTextTargets(element) {
    const $el = AQ(element);

    if ($el.is(FOLLOW_UP_TEXT_SELECTOR)) {
        return $el;
    }

    const $texts = $el.find(FOLLOW_UP_TEXT_SELECTOR);
    if ($texts.length) {
        return $texts;
    }

    return $el.is(FOLLOW_UP_INNER_SELECTOR)
        ? $el
        : $el.find(FOLLOW_UP_INNER_SELECTOR);
}

function processGeminiFollowUp(element, rtlAlgorithm) {
    runSafely(() => {
        collectFollowUpTextTargets(element).each(function () {
            const $target = AQ(this);
            const text = $target.text().trim();
            if (!text) {
                return;
            }
            invalidateStaleGeminiRtl(this);
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: false,
                setTextAlign: true
            });
        });
    });
}

function processGeminiMarkdown(element, rtlAlgorithm) {
    runSafely(() => {
        invalidateStaleGeminiRtl(element);
        applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    });
}

function processGeminiInput(element, rtlAlgorithm) {
    runSafely(() => {
        const $el = AQ(element);

        if ($el.is('.ql-editor') && !$el.hasClass('FontSet')) {
            $el.addClass('FontSet');
        }

        const applyInputDir = (node) => {
            applyRtlToElement(node, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: false,
                setTextAlign: true
            });
        };

        if ($el.is('.ql-editor p')) {
            applyInputDir(element);
        } else if ($el.is('.ql-editor')) {
            $el.find('p').each(function () {
                applyInputDir(this);
            });
        }

        if ($el.data('rtl-listener-added')) {
            return;
        }
        $el.data('rtl-listener-added', true);
        $el.on('input keyup paste', function () {
            processGeminiInput(this, rtlAlgorithm);
        });
    });
}

function processGeminiFont(element) {
    runSafely(() => {
        const $el = AQ(element);
        if (!$el.hasClass('FontSet')) {
            $el.addClass('FontSet');
        }
    });
}

function processGeminiCopyright() {
    runSafely(() => {
        addCopyright(
            AQ(COPYRIGHT_SELECTOR),
            'AsBoxGemini AsBoxB',
            'margin-top: 1px; margin-top: -6px; margin-bottom: 4px; font-size: 13px;'
        );
    });
}

function stopGeminiObservers() {
    if (geminiDomObserver) {
        geminiDomObserver.disconnect();
        geminiDomObserver = null;
    }
    if (geminiDirObserver) {
        geminiDirObserver.disconnect();
        geminiDirObserver = null;
    }
}

export function setGemini(rtlAlgorithm = 'advanced_full') {
    if (!isExtensionContextValid()) {
        return;
    }

    processGeminiCopyright();

    AQ(MARKDOWN_SELECTOR).each(function () {
        processGeminiMarkdown(this, rtlAlgorithm);
    });

    AQ(FOLLOW_UP_SELECTOR).each(function () {
        processGeminiFollowUp(this, rtlAlgorithm);
    });

    AQ(INPUT_SELECTOR).each(function () {
        processGeminiInput(this, rtlAlgorithm);
    });

    AQ(FONT_SELECTOR).each(function () {
        processGeminiFont(this);
    });
}

export function activateGemini(rtlAlgorithm = 'advanced_full') {
    console.log('activateGemini with RTL algorithm:', rtlAlgorithm);

    stopGeminiObservers();
    setGemini(rtlAlgorithm);

    geminiDomObserver = observeDomSections([
        {
            selector: MARKDOWN_SELECTOR,
            process: (el) => processGeminiMarkdown(el, rtlAlgorithm),
            debounceMs: 150,
            throttleMs: 400,
            idleMs: 800
        },
        {
            selector: FOLLOW_UP_SELECTOR,
            process: (el) => processGeminiFollowUp(el, rtlAlgorithm),
            debounceMs: 150,
            throttleMs: 400,
            idleMs: 800
        },
        {
            selector: INPUT_SELECTOR,
            process: (el) => processGeminiInput(el, rtlAlgorithm),
            debounceMs: 50,
            throttleMs: 100,
            idleMs: 400
        },
        {
            selector: FONT_SELECTOR,
            process: processGeminiFont,
            debounceMs: 250,
            throttleMs: 800,
            idleMs: 0
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processGeminiCopyright,
            debounceMs: 400,
            throttleMs: 2000,
            idleMs: 0
        }
    ]);

    geminiDirObserver = new MutationObserver((mutations) => {
        if (!isExtensionContextValid()) {
            stopGeminiObservers();
            return;
        }

        for (let i = 0; i < mutations.length; i++) {
            const target = mutations[i].target;
            if (!target || target.nodeType !== Node.ELEMENT_NODE || !target.closest) {
                continue;
            }

            const followUp = target.closest(FOLLOW_UP_SELECTOR);
            if (followUp) {
                const intended = target.getAttribute('data-direction');
                const dir = target.getAttribute('dir');
                if (!(intended && dir === intended)) {
                    processGeminiFollowUp(followUp, rtlAlgorithm);
                }
                continue;
            }

            const markdown = target.closest(MARKDOWN_SELECTOR);
            if (!markdown) {
                continue;
            }

            const intended = target.getAttribute('data-direction') || markdown.getAttribute('data-direction');
            const dir = target.getAttribute('dir');
            if (intended && dir === intended) {
                continue;
            }

            processGeminiMarkdown(markdown, rtlAlgorithm);
        }
    });

    if (document.body) {
        geminiDirObserver.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['dir']
        });
    }
}
