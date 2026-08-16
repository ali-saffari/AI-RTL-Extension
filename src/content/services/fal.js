// fal.js service functions (fal.ai)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setFal(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#fal-font-style').length) {
        AQ(`<style id="fal-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(.monaco-editor):not(.monaco-editor *) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
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
            AQ('footer, [class*="footer"]'),
            'AsBoxGemini AsBoxB',
            'margin-top: 4px; margin-bottom: -16px; font-size: 13px;'
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

    AQ('[class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"], [class*="answer"], [class*="chat"], .msg-content').each(function () {
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

export function activateFal(rtlAlgorithm = 'advanced_full') {
    console.log('fal.ai RTL activated with algorithm:', rtlAlgorithm);

    setFal(rtlAlgorithm);

    setInterval(() => {
        setFal(rtlAlgorithm);
    }, 1000);
}
