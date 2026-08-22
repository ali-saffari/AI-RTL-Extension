// google-labs.js service functions (Google Labs - labs.google)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setGoogleLabs(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#google-labs-font-style').length) {
        AQ(`<style id="google-labs-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not(md-icon):not([class*="material-icons"]):not([class*="material-symbols"]):not([class*="google-symbols"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            code, pre, kbd, samp, code *, pre * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
            i, svg, md-icon,
            .material-icons,
            .material-icons-outlined,
            .material-icons-round,
            .material-icons-sharp,
            .material-icons-two-tone,
            .material-symbols-outlined,
            .material-symbols-rounded,
            .material-symbols-sharp,
            .google-symbols,
            [class*="material-icons"],
            [class*="material-symbols"],
            [class*="google-symbols"],
            .FontSet i,
            .FontSet svg,
            .FontSet md-icon,
            .FontSet .google-symbols,
            .FontSet [class*="material-icons"],
            .FontSet [class*="material-symbols"],
            .FontSet [class*="google-symbols"] {
                font-family: 'Google Symbols', 'google-symbols', 'Material Symbols Outlined', 'Material Symbols Rounded', 'Material Symbols Sharp', 'Material Icons', 'Material Icons Outlined' !important;
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
            AQ('footer, [class*="footer"], [class*="disclaimer"]'),
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

    AQ('[role="dialog"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('[for="marketing-emails"], [for="research-emails"]').each(function () {
        const isIconButton = this.tagName === 'BUTTON' && (
            /material-icons|material-symbols|google-symbols/i.test(this.className || '') ||
            AQ(this).find('svg, i, md-icon, [class*="material-icons"], [class*="material-symbols"], [class*="google-symbols"]').length > 0
        );

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: isIconButton ? false : 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: !isIconButton
        });
    });


    // .dwkBgm برای چت ارسالی هست
    // .fRdnLN برای جواب هست
    AQ('[data-content=""], [class*="markdown"], [class*="prose"], [class*="message"], [class*="answer"], [class*="chat"], .msg-content  ,.dwkBgm  ,.fRdnLN').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateGoogleLabs(rtlAlgorithm = 'advanced_full') {
    console.log('Google Labs RTL activated with algorithm:', rtlAlgorithm);

    setGoogleLabs(rtlAlgorithm);

    setInterval(() => {
        setGoogleLabs(rtlAlgorithm);
    }, 1000);
}
