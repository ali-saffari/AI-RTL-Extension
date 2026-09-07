// m365.js service functions (Microsoft 365 Copilot - m365.cloud.microsoft)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const CODE_BLOCK_SELECTOR = '.scriptor-component-code-block';
const INPUT_IGNORE_SELECTOR = `${ICON_SELECTOR}, ${CODE_BLOCK_SELECTOR}`;
const INPUT_SELECTOR = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    '[contenteditable="true"]',
    '[role="textbox"]',
    '.ProseMirror'
].join(', ');
const MARKDOWN_SELECTOR = [
    '[data-testid="markdown-reply"]',
    // '[data-content="user-message"]',
    // '[data-content="ai-message"] .break-words',
    // '[data-content="user-message"] .break-words',
    // '[class*="markdown"]',
    // '[class*="Markdown"]',
    // '[class*="prose"]',
    // '[class*="message"]',
    // '[class*="Message"]',
    // '[class*="chat"]',
    // '.msg-content'
].join(', ');
const COPYRIGHT_SELECTOR = 'form, [class*="composer"], [class*="Composer"]';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: 'important'
};

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    rtlClass: 'AsRtl',
    ltrClass: 'AsLtr',
    isContainer: true,
    setTextAlign: 'important',
    includeTags: ['p']
};

function applyM365Chrome() {
    if (!AQ('#m365-font-style').length) {
        AQ(`<style id="m365-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]):not(.scriptor-component-code-block) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            code, pre, kbd, samp, code *, pre *,
            .scriptor-component-code-block, .scriptor-component-code-block * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
            .scriptor-component-code-block:not([dir="rtl"]),
            .scriptor-component-code-block:not([dir="rtl"]) [role="textbox"],
            .scriptor-component-code-block:not([dir="rtl"]) [aria-label="Code editor"],
            [data-testid="markdown-reply"] pre:not([dir="rtl"]),
            [data-testid="markdown-reply"] code:not([dir="rtl"]) {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }
            .scriptor-component-code-block[dir="rtl"],
            .scriptor-component-code-block[dir="rtl"] [role="textbox"],
            .scriptor-component-code-block[dir="rtl"] [aria-label="Code editor"],
            [data-testid="markdown-reply"] pre[dir="rtl"],
            [data-testid="markdown-reply"] code[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
            /* اعداد باکس کد در فارسی */
            [dir="rtl"] .bfdc9b3bfaf83e8b {
                direction: ltr !important;
                text-align: left !important;
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

function processM365Input(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR) || AQ(element).closest(CODE_BLOCK_SELECTOR).length) {
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

function processM365Markdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processM365Copyright(form) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $form = AQ(form);
    if (!$form.has('textarea, [contenteditable="true"], [role="textbox"], .ProseMirror').length) {
        return;
    }

    addCopyright(
        $form,
        'AsBoxGemini AsBoxB',
        'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
    );
}

export function activateM365(rtlAlgorithm = 'advanced_full') {
    console.log('Microsoft 365 Copilot RTL activated with algorithm:', rtlAlgorithm);

    applyM365Chrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: INPUT_IGNORE_SELECTOR,
            process: (el) => processM365Input(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processM365Markdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processM365Copyright,
            debounceMs: 200
        }
    ]);
}
