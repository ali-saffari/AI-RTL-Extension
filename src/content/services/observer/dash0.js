// dash0.js service functions (Dash0 - dash0.com / app.dash0.com)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], .ProseMirror';
const MARKDOWN_SELECTOR = '[class*="markdown"], [class*="prose"], [class*="message"], [class*="chat"], .msg-content';
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

function applyDash0Chrome() {
    if (!AQ('#dash0-font-style').length) {
        AQ(`<style id="dash0-font-style">
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

function processDash0Input(element, rtlAlgorithm) {
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

function processDash0Markdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processDash0Copyright(form) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $form = AQ(form);
    if (!$form.has('textarea, [contenteditable="true"], .ProseMirror').length) {
        return;
    }

    addCopyright(
        $form,
        'AsBoxGemini AsBoxB',
        'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
    );
}

export function activateDash0(rtlAlgorithm = 'advanced_full') {
    console.log('Dash0 RTL activated with algorithm:', rtlAlgorithm);

    applyDash0Chrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => processDash0Input(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processDash0Markdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processDash0Copyright,
            debounceMs: 200
        }
    ]);
}
