// pi.js service functions (Pi - pi.ai)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setPi(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#pi-font-style').length) {
        AQ(`<style id="pi-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body, html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(.katex):not(.katex-display):not(.katex *):not(.katex-display *) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font :is(code, pre, kbd, samp),
            html.ai-rtl-has-font :is(code, pre) * {
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
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            setTextAlign: true
        });

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    setTextAlign: true
                });
            });
        });
    });

    AQ('[class*="markdown"], .break-anywhere .whitespace-pre-wrap').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
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
