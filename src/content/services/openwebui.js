// openwebui.js — Open WebUI chat. Same observer shape as ChatGPT's UI watcher.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const INPUT_SELECTOR = '#chat-input';
const TEXT_SELECTOR = '.markdown-prose, #user-message, [id^="response-content-"]';
const ELEMENT_SELECTOR = '.line-clamp-1';
const FONT_STYLE_ID = 'openwebui-font-style';
const UI_MS = 1000;

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    setTextAlign: true
};

const TEXT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true,
    siteConfig: 'openwebui',
    walkSkipSelector: '.cm-editor'
};

let rtlAlgorithm = 'advanced_full';
let uiObserver = null;
let uiLastRun = 0;
let uiTimer = null;

function ensureOpenWebuiFontStyle() {
    if (document.getElementById(FONT_STYLE_ID)) {
        return;
    }
    const style = document.createElement('style');
    style.id = FONT_STYLE_ID;
    style.textContent = `
        html.ai-rtl-has-font, html.ai-rtl-has-font body,
        html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(.katex):not(.katex-display):not(.katex *):not(.katex-display *):not(.cm-editor):not(.cm-editor *) {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
        }
        html.ai-rtl-has-font :is(code, pre, kbd, samp, .cm-editor),
        html.ai-rtl-has-font :is(code, pre, .cm-editor) * {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
}

function setOpenWebui() {
    ensureOpenWebuiFontStyle();

    if (document.body && !document.body.classList.contains('FontSet')) {
        document.body.classList.add('FontSet');
    }

    if (chrome.runtime?.id) {
        const $host = AQ('#message-input-container').parent();
        if ($host.length) {
            addCopyright(
                $host,
                'AsBoxGemini AsBoxB',
                'margin-top: -12px; margin-bottom: -5px; font-size: 13px;'
            );
        }
    }

    AQ(INPUT_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            });
        });
    });

    AQ(TEXT_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, TEXT_OPTIONS);
    });

    AQ(ELEMENT_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
    });
}

export function stopOpenWebui() {
    if (uiTimer) {
        clearTimeout(uiTimer);
        uiTimer = null;
    }
    if (uiObserver) {
        uiObserver.disconnect();
        uiObserver = null;
    }
}

export function activateOpenWebui(algorithm = 'advanced_full') {
    console.log('Open WebUI RTL activated with algorithm:', algorithm);
    stopOpenWebui();
    rtlAlgorithm = algorithm;
    setOpenWebui();

    uiLastRun = 0;
    uiObserver = new MutationObserver(() => {
        const elapsed = Date.now() - uiLastRun;
        const run = () => {
            uiLastRun = Date.now();
            setOpenWebui();
        };
        if (elapsed < UI_MS) {
            if (!uiTimer) {
                uiTimer = setTimeout(() => {
                    uiTimer = null;
                    run();
                }, UI_MS - elapsed);
            }
            return;
        }
        run();
    });
    uiObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}
