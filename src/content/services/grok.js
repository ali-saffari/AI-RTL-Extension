// grok.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const GROK_FONT_STYLE_ID = 'grok-font-style';
const GROK_INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], .ProseMirror';
const GROK_MESSAGE_SELECTOR = '.response-content-markdown, .message-bubble';

function ensureGrokFontStyle() {
    if (document.getElementById(GROK_FONT_STYLE_ID)) {
        return;
    }
    const style = document.createElement('style');
    style.id = GROK_FONT_STYLE_ID;
    style.textContent = `
        html.ai-rtl-has-font, html.ai-rtl-has-font body, html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp) {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
        }
        code, pre, kbd, samp, code *, pre * {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
}

function applyGrokInputRtl(element, rtlAlgorithm) {
    applyRtlToElement(element, rtlAlgorithm, {
        fontClass: 'FontSet',
        setTextAlign: true,
        removeDirAuto: true
    });
}

export function setGrok(rtlAlgorithm = 'advanced_full') {
    ensureGrokFontStyle();

    if (document.body && !document.body.classList.contains('FontSet')) {
        document.body.classList.add('FontSet');
    }

    if (chrome.runtime?.id) {
        const $copyright = AQ('.relative.w-full.px-gutter');
        if ($copyright.length) {
            addCopyright($copyright, 'AsBoxB', 'margin-bottom: -9px;margin-top: 7px;');
        }
    }

    AQ(GROK_INPUT_SELECTOR).each(function () {
        applyGrokInputRtl(this, rtlAlgorithm);

        if (this.dataset.rtlListenerAdded === '1') {
            return;
        }
        this.dataset.rtlListenerAdded = '1';

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyGrokInputRtl(this, rtlAlgorithm);
            });
        });
    });

    AQ(GROK_MESSAGE_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            removeDirAuto: true,
            siteConfig: 'grok'
        });
    });

    AQ('.rtl-mask-applied').each(function () {
        AQ(this).css('mask-image', 'none');
    });
}

export function activateGrok(rtlAlgorithm = 'advanced_full') {
    console.log('Grok RTL activated with algorithm:', rtlAlgorithm);

    setGrok(rtlAlgorithm);

    setInterval(() => {
        setGrok(rtlAlgorithm);
    }, 1000);

    const maskObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const $node = AQ(node);
                        if ($node.hasClass('rtl-mask-applied')) {
                            $node.css('mask-image', 'none');
                        }

                        $node.find('.rtl-mask-applied').each(function () {
                            AQ(this).css('mask-image', 'none');
                        });
                    }
                });
            } else if (mutation.type === 'attributes') {
                const $target = AQ(mutation.target);
                if (!$target.hasClass('rtl-mask-applied')) {
                    return;
                }
                if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                    const currentMaskImage = $target.css('mask-image');
                    if (currentMaskImage && currentMaskImage !== 'none') {
                        $target.css('mask-image', 'none');
                    }
                }
            }
        });
    });

    if (document.body) {
        maskObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
}
