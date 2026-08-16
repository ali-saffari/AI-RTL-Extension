// meta.js service functions (Meta AI - meta.ai)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setMeta(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#meta-font-style').length) {
        AQ(`<style id="meta-font-style">
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
            AQ('[data-slot="flexbox"] .pointer-events-none.relative.z-20.flex.w-full.shrink-0.flex-col.items-center.px-6.pb-6'),
            'AsBoxGemini AsBoxB',
            'margin-top: 4px; margin-bottom: -17px; font-size: 13px; pointer-events: auto;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], [data-lexical-editor="true"]').each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

    AQ('[class*="markdown-content"]').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateMeta(rtlAlgorithm = 'advanced_full') {
    console.log('Meta AI RTL activated with algorithm:', rtlAlgorithm);

    setMeta(rtlAlgorithm);

    setInterval(() => {
        setMeta(rtlAlgorithm);
    }, 1000);
}
