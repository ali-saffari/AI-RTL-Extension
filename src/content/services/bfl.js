// bfl.js service functions (Black Forest Labs - bfl.ai)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setBfl(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#bfl-font-style').length) {
        AQ(`<style id="bfl-font-style">
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

    AQ('[class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"], [class*="answer"], [class*="chat"], .msg-content').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateBfl(rtlAlgorithm = 'advanced_full') {
    console.log('Black Forest Labs RTL activated with algorithm:', rtlAlgorithm);

    setBfl(rtlAlgorithm);

    setInterval(() => {
        setBfl(rtlAlgorithm);
    }, 1000);
}
