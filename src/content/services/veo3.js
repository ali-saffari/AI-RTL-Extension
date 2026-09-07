// veo3.js service functions (Veo 3 - www-veo3.com)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setVeo3(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#veo3-font-style').length) {
        AQ(`<style id="veo3-font-style">
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
        const $copyrightTarget = AQ('footer .mt-6.text-center');
        addCopyright(
            $copyrightTarget.length ? $copyrightTarget : AQ('footer, [class*="footer"]'),
            'AsBoxGemini AsBoxB',
            'margin-top: 4px; margin-bottom: -16px; font-size: 13px;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]').each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

    AQ('p.italic, [class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"], [class*="answer"], [class*="chat"], .msg-content').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateVeo3(rtlAlgorithm = 'advanced_full') {
    console.log('Veo 3 RTL activated with algorithm:', rtlAlgorithm);

    setVeo3(rtlAlgorithm);

    setInterval(() => {
        setVeo3(rtlAlgorithm);
    }, 1000);
}
