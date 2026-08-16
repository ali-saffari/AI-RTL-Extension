// typingmind.js service functions (TypingMind - typingmind.com)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../../utils/textDirectionUtils.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const INPUT_SELECTOR = '#chat-input-textbox, [data-element-id="chat-input-textbox"], textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]';
const MARKDOWN_SELECTOR = '[class*="prose"], [class*="message"], [class*="whitespace-pre-wrap"]';
const COPYRIGHT_SELECTOR = '[data-element-id="chat-space-end-part"]';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true
};

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true
};

function applyTypingMindChrome() {
    if (!AQ('#typingmind-font-style').length) {
        AQ(`<style id="typingmind-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            code, pre, kbd, samp, code *, pre * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
        </style>`).appendTo('head');
    }

    AQ('body').each(function () {
        if (!AQ(this).hasClass('FontSet')) {
            AQ(this).addClass('FontSet');
        }
    });

    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processTypingMindInput(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    setTextDirectionAndFontByRtlAlgorithm(element, rtlAlgorithm, INPUT_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, INPUT_OPTIONS);
            AQ(ICON_SELECTOR).removeClass('FontSet');
        });
    });
}

function processTypingMindMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    processTextElementsByRtlAlgorithm(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processTypingMindCopyright(element) {
    if (!chrome.runtime?.id) {
        return;
    }

    addCopyright(
        AQ(element),
        'AsBoxGemini AsBoxB',
        'margin-top: -11px; margin-bottom: 2px; font-size: 13px;'
    );
}

export function activateTypingMind(rtlAlgorithm = 'advanced_full') {
    console.log('TypingMind RTL activated with algorithm:', rtlAlgorithm);

    applyTypingMindChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => processTypingMindInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processTypingMindMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processTypingMindCopyright,
            debounceMs: 200
        }
    ]);
}
