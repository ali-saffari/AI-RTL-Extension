// genspark.js service functions (Genspark - genspark.ai)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], .ProseMirror';
const MARKDOWN_SELECTOR = '.markdown-viewer, [class*="markdown"], [class*="prose"], [class*="message"], [class*="chat"], .msg-content, [data-message-type="user"], .plain-text .user .content';
const COPYRIGHT_SELECTOR = '.j-input-wrapper-wrapper, form';

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

function applyGensparkChrome() {
    if (!AQ('#genspark-font-style').length) {
        AQ(`<style id="genspark-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font :is(code, pre, kbd, samp),
            html.ai-rtl-has-font :is(code, pre) * {
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

function processGensparkInput(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToElement(element, rtlAlgorithm, INPUT_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            AQ(ICON_SELECTOR).removeClass('FontSet');
        });
    });
}

function processGensparkMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processGensparkCopyright(element) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $el = AQ(element);
    if ($el.is('.j-input-wrapper-wrapper')) {
        addCopyright($el, 'AsBoxGenspark AsBoxB', 'margin-top: 7px; margin-bottom: -21px;');
        return;
    }

    const $form = $el.parent().parent();
    if (!$form.has('textarea, [contenteditable="true"], .ProseMirror').length) {
        return;
    }

    addCopyright(
        $form,
        'AsBoxGenspark AsBoxB',
        'margin-top: 7px; margin-bottom: -21px;'
    );
}

export function activateGenspark(rtlAlgorithm = 'advanced_full') {
    console.log('Genspark RTL activated with algorithm:', rtlAlgorithm);

    applyGensparkChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => processGensparkInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processGensparkMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processGensparkCopyright,
            debounceMs: 200
        }
    ]);
}
