// huggingface.js service functions (Hugging Face - huggingface.co)
import { addCopyright } from '../utils/copyright.js';
import { observeDomSections } from '../utils/domObserver.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], .ProseMirror';
const MARKDOWN_SELECTOR = '[class*="markdown"], [class*="prose"], [class*="message"], [class*="chat"], .msg-content, [data-message-type="user"]';
const COPYRIGHT_SELECTOR = 'form';

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

function applyHuggingFaceChrome() {
    if (!AQ('#huggingface-font-style').length) {
        AQ(`<style id="huggingface-font-style">
            html, body,
            body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
                font-family: iranyekan, sans-serif !important;
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

function processHuggingFaceInput(element, rtlAlgorithm) {
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

function processHuggingFaceMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    processTextElementsByRtlAlgorithm(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processHuggingFaceCopyright(form) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $form = AQ(form).parent().parent();
    if (!$form.has('textarea, [contenteditable="true"], .ProseMirror').length) {
        return;
    }

    addCopyright(
        $form,
        'AsBoxGemini AsBoxB',
        'margin-top: -14px; margin-bottom: -12px; font-size: 13px;'
    );
}

export function activateHuggingFace(rtlAlgorithm = 'advanced_full') {
    console.log('Hugging Face RTL activated with algorithm:', rtlAlgorithm);

    applyHuggingFaceChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => processHuggingFaceInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processHuggingFaceMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processHuggingFaceCopyright,
            debounceMs: 200
        }
    ]);
}
