// copilot.js service functions (copilot.com — same UI as Microsoft 365 Copilot)
import { addCopyright } from '../utils/copyright.js';
import { observeDomSections } from '../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

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
].join(', ');
const COPYRIGHT_SELECTOR = '#suggestions-above-input-portal';

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

function applyCopilotChrome() {
    if (!AQ('#copilot-font-style').length) {
        AQ(`<style id="copilot-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]):not(.scriptor-component-code-block) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font :is(code, pre, kbd, samp, .scriptor-component-code-block),
            html.ai-rtl-has-font :is(code, pre, .scriptor-component-code-block) * {
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

function processCopilotInput(element, rtlAlgorithm) {
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

function processCopilotMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processCopilotCopyright(portal) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $target = AQ(portal).parent();
    if (!$target.length) {
        return;
    }

    addCopyright(
        $target,
        'AsBox_copilotBing AsBoxB',
        'margin-top: -8px; margin-bottom: -2px; font-size: 13px;'
    );
}

export function activateCopilot(rtlAlgorithm = 'advanced_full') {
    console.log('Copilot RTL activated with algorithm:', rtlAlgorithm);

    applyCopilotChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: INPUT_IGNORE_SELECTOR,
            process: (el) => processCopilotInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processCopilotMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processCopilotCopyright,
            debounceMs: 200
        }
    ]);
}
