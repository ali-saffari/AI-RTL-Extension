// pi.js service functions (Pi - pi.ai)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setPi(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#pi-font-style').length) {
        AQ(`<style id="pi-font-style">
            html, body, body *:not(code):not(pre):not(kbd):not(samp) {
                font-family: iranyekan, sans-serif !important;
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
            AQ('.px-4.pb-0.pt-2.w-full.mx-auto.max-w-chat-shell[class*="2xl:max-w-chat-shell-lg"]'),
            'AsBoxGemini AsBoxB',
            'margin-top: -9px; margin-bottom: 3px; font-size: 13px;'
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

    AQ('[class*="markdown"], .break-anywhere .whitespace-pre-wrap').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activatePi(rtlAlgorithm = 'advanced_full') {
    console.log('Pi RTL activated with algorithm:', rtlAlgorithm);

    setPi(rtlAlgorithm);

    setInterval(() => {
        setPi(rtlAlgorithm);
    }, 1000);
}
