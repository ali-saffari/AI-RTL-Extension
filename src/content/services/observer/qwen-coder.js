// qwen-coder.js service functions (Qwen Coder - coder.qwen.ai)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../../utils/textDirectionUtils.js';

const EDITOR_IGNORE = '.monaco-editor, .monaco-editor-background, [class*="cm-editor"]';
const ICON_SELECTOR = 'i, svg, path, use, [class*="codicon"], [class*="icon"], [class*="Icon"]';
const SECTION_IGNORE = `${EDITOR_IGNORE}, ${ICON_SELECTOR}`;
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], #chat-input';
const MARKDOWN_SELECTOR = '.qwen-markdown, .chat-assistant, .user-message, .chat-user-message, [class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"], [class*="answer"], [class*="chat"], [class*="bubble"], .msg-content';
const COPYRIGHT_SELECTOR = '.chat-message-input-container, form';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true,
    rtlClass: 'rtlEelemt'
};

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true
};

function applyQwenCoderChrome() {
    if (!AQ('#qwen-coder-font-style').length) {
        AQ(`<style id="qwen-coder-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not(.monaco-editor):not(.monaco-editor *):not([class*="codicon"]):not([class*="icon"]):not([class*="Icon"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
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

function processQwenCoderInput(element, rtlAlgorithm) {
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

function processQwenCoderMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR) || AQ(element).closest(EDITOR_IGNORE).length) {
        return;
    }

    processTextElementsByRtlAlgorithm(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function processQwenCoderCopyright(container) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $container = AQ(container);
    if (!$container.has('textarea, [contenteditable="true"], #chat-input').length) {
        return;
    }

    addCopyright(
        $container,
        'AsBoxQwen AsBoxB',
        'margin-top: 11px; margin-bottom: -5px; transform: scale(0.9);'
    );
}

export function activateQwenCoder(rtlAlgorithm = 'advanced_full') {
    console.log('Qwen Coder RTL activated with algorithm:', rtlAlgorithm);

    applyQwenCoderChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: SECTION_IGNORE,
            process: (el) => processQwenCoderInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: SECTION_IGNORE,
            exclude: INPUT_SELECTOR,
            process: (el) => processQwenCoderMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processQwenCoderCopyright,
            debounceMs: 200
        }
    ]);
}
