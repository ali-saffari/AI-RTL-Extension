// cursor.js service functions (Cursor - cursor.com)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../../utils/textDirectionUtils.js';

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
            html, body,
            body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not(.monaco-editor):not(.monaco-editor *):not([class*="codicon"]):not([class*="icon"]):not([class*="Icon"]) {
                font-family: iranyekan, sans-serif !important;
            }
            code, pre, kbd, samp, code *, pre *,
            .monaco-editor, .monaco-editor * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
            .codicon,
            [class*="codicon"],
            .FontSet .codicon,
            .FontSet [class*="codicon"],
            .codicon.FontSet,
            [class*="codicon"].FontSet {
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

function processCursorMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR) || AQ(element).closest(EDITOR_IGNORE).length) {
        return;
    }

    processTextElementsByRtlAlgorithm(element, rtlAlgorithm, MARKDOWN_OPTIONS);
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
