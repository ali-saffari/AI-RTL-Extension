// cursor.js service functions (Cursor - cursor.com)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setCursor(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#cursor-font-style').length) {
        AQ(`<style id="cursor-font-style">
            html, body,
            body *:not(code):not(pre):not(kbd):not(samp):not(.monaco-editor):not(.monaco-editor *) {
                font-family: iranyekan, sans-serif !important;
            }
            code, pre, kbd, samp, code *, pre *,
            .monaco-editor, .monaco-editor * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
        </style>`).appendTo('head');
    }

    AQ('body').each(function () {
        if (!AQ(this).hasClass('FontSet')) {
            AQ(this).addClass('FontSet');
        }
    });

    if (chrome.runtime?.id) {
        addCopyright(
            AQ('form').has('textarea, [contenteditable="true"]').last(),
            'AsBoxGemini AsBoxB',
            'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]').each(function () {
        if (AQ(this).closest('.monaco-editor, .monaco-editor-background, [class*="cm-editor"]').length) {
            return;
        }

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            setTextAlign: true
        });

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    setTextAlign: true
                });
            });
        });
    });

    AQ('[class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"], [class*="answer"], [class*="chat"], [class*="bubble"], .msg-content').each(function () {
        if (AQ(this).closest('.monaco-editor, [class*="cm-editor"]').length) {
            return;
        }
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateCursor(rtlAlgorithm = 'advanced_full') {
    console.log('Cursor RTL activated with algorithm:', rtlAlgorithm);

    setCursor(rtlAlgorithm);

    setInterval(() => {
        setCursor(rtlAlgorithm);
    }, 1000);
}
