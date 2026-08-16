// character-ai.js service functions (Character.AI - character.ai / c.ai)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setCharacterAi(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#character-ai-font-style').length) {
        AQ(`<style id="character-ai-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body, html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp) {
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

    if (chrome.runtime?.id) {
        addCopyright(
            AQ('#chat-input-box').parent().parent(),
            'AsBoxGemini AsBoxB',
            'margin-top: 4px; margin-bottom: -16px; font-size: 13px;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]').each(function () {
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

    AQ('[class*="markdown"], [class*="prose"], [class*="message"], [class*="chat"], [class*="bubble"], .msg-content').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateCharacterAi(rtlAlgorithm = 'advanced_full') {
    console.log('Character.AI RTL activated with algorithm:', rtlAlgorithm);

    setCharacterAi(rtlAlgorithm);

    setInterval(() => {
        setCharacterAi(rtlAlgorithm);
    }, 1000);
}
