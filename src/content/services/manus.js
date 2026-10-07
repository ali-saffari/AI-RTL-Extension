// manus.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const ELEMENT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk'
};

function applyManusFont() {
    if (!AQ('#manus-font-style').length) {
        AQ(`<style id="manus-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
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

    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function isIconElement(element) {
    return AQ(element).is(ICON_SELECTOR);
}

export function setManus(rtlAlgorithm = 'advanced_full') {
    applyManusFont();

    if (chrome.runtime?.id) {
        let fo2 = `.flex.flex-col.sticky.bottom-0`
        addCopyright(AQ(fo2), 'AsMistral', '');
    }

    AQ("body textarea, .tiptap.ProseMirror").each(function () {
        if (isIconElement(this)) {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        AQ(this).on('keyup paste input', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
            AQ(ICON_SELECTOR).removeClass('FontSet');
        });
    });

    AQ('.ProseMirror p, .whitespace-nowrap').each(function () {
        if (isIconElement(this)) {
            return;
        }

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
        });
    });

    AQ('.manus-markdown').each(function () {
        if (isIconElement(this)) {
            return;
        }

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    AQ("body p, body span, body h1, body h2, body h3, body h4, body h5, body h6, .truncate").each(function () {
        if (isIconElement(this)) {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, ELEMENT_OPTIONS);
    });

    AQ("span.text-start.font-serif, .u-break-words").each(function () {
        if (isIconElement(this)) {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, ELEMENT_OPTIONS);
    });

    AQ(ICON_SELECTOR).removeClass('FontSet');
}

export function activateManus(rtlAlgorithm = 'advanced_full') {
    console.log('Manus RTL activated with algorithm:', rtlAlgorithm);

    setManus(rtlAlgorithm);

    setInterval(() => {
        setManus(rtlAlgorithm);
    }, 500);
}
