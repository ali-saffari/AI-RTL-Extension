// cursor.js service functions (Cursor - cursor.com)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const EDITOR_IGNORE = '.monaco-editor, .monaco-editor-background, [class*="cm-editor"]';
const ICON_SELECTOR = 'i, svg, path, use, [class*="codicon"], [class*="icon"], [class*="Icon"]';
const SECTION_IGNORE = `${EDITOR_IGNORE}, ${ICON_SELECTOR}`;
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]';
const MARKDOWN_SELECTOR = '[class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"], [class*="answer"], [class*="chat"], [class*="bubble"], .msg-content';

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

function applyCursorChrome() {
    if (!AQ('#cursor-font-style').length) {
        AQ(`<style id="cursor-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not(.monaco-editor):not(.monaco-editor *):not([class*="codicon"]):not([class*="icon"]):not([class*="Icon"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font :is(code, pre, kbd, samp, .monaco-editor),
            html.ai-rtl-has-font :is(code, pre, .monaco-editor) * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
            html.ai-rtl-has-font :is(.codicon, [class*="codicon"]),
            html.ai-rtl-has-font .FontSet :is(.codicon, [class*="codicon"]) {
                font-family: codicon, Codicon !important;
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

function processCursorInput(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR) || AQ(element).closest(EDITOR_IGNORE).length) {
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

function processCursorMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR) || AQ(element).closest(EDITOR_IGNORE).length) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processCursorCopyright(form) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $form = AQ(form);
    if (!$form.has('textarea, [contenteditable="true"]').length) {
        return;
    }

    addCopyright(
        $form,
        'AsBoxGemini AsBoxB',
        'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
    );
}

export function setCursor(rtlAlgorithm = 'advanced_full') {
    applyCursorChrome();

    AQ(INPUT_SELECTOR).each(function () {
        if (AQ(this).closest(EDITOR_IGNORE).length) {
            return;
        }
        processCursorInput(this, rtlAlgorithm);
    });

    AQ(MARKDOWN_SELECTOR).each(function () {
        if (AQ(this).closest(EDITOR_IGNORE).length) {
            return;
        }
        processCursorMarkdown(this, rtlAlgorithm);
    });

    AQ('form').each(function () {
        processCursorCopyright(this);
    });
}

export function activateCursor(rtlAlgorithm = 'advanced_full') {
    console.log('Cursor RTL activated with algorithm:', rtlAlgorithm);

    applyCursorChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: SECTION_IGNORE,
            process: (el) => processCursorInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: SECTION_IGNORE,
            exclude: INPUT_SELECTOR,
            process: (el) => processCursorMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: 'form',
            process: processCursorCopyright,
            debounceMs: 200
        }
    ]);
}
