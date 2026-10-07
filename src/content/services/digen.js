// digen.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], [contenteditable="plaintext-only"], .tiptap, .ProseMirror';
const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: 'important'
};

function ensureDigenStyles() {
    if (AQ('#digen-font-style').length) {
        return;
    }

    AQ(`<style id="digen-font-style">
        html.ai-rtl-has-font, html.ai-rtl-has-font body, html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp) {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
        }
        html.ai-rtl-has-font :is(code, pre, kbd, samp),
        html.ai-rtl-has-font :is(code, pre) * {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
        [contenteditable][dir="rtl"],
        [role="textbox"][dir="rtl"],
        .tiptap[dir="rtl"],
        .ProseMirror[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }
        [contenteditable][dir="ltr"],
        [role="textbox"][dir="ltr"],
        .tiptap[dir="ltr"],
        .ProseMirror[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }
        button.group.flex.h-12.w-full.items-center[dir="rtl"],
        button.group.flex.h-12.w-full.items-center[dir="rtl"] span {
            direction: rtl !important;
            text-align: right !important;
        }
        button.group.flex.h-12.w-full.items-center[dir="ltr"],
        button.group.flex.h-12.w-full.items-center[dir="ltr"] span {
            direction: ltr !important;
            text-align: left !important;
        }
    </style>`).appendTo('head');
}

export function setDigen(rtlAlgorithm = 'advanced_full') {
    ensureDigenStyles();

    if (chrome.runtime?.id) {
        addCopyright(
            AQ('.z-30.flex.flex-col.items-center.pointer-events-none.absolute.inset-x-0.bottom-0.justify-end.pb-4'),
            'AsBoxGemini AsBoxB',
            'margin-top: 4px; margin-bottom: 0; font-size: 13px; pointer-events: auto;'
        );
    }

    AQ(INPUT_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            });
        });
    });

    AQ('.line-clamp-2, [class*="markdown"], [class*="prose"], [class*="message"], [class*="prompt"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('button.group.flex.h-12.w-full.items-center').each(function () {
        const $btn = AQ(this);
        const $label = $btn.children('span.min-w-0.flex-1.truncate, span.truncate');

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkChip',
            setTextAlign: 'important'
        });

        if ($label.length) {
            applyRtlToElement($label[0], rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOkChipLabel',
                setTextAlign: 'important'
            });
        }

        const isRtl = $btn.attr('dir') === 'rtl' || $label.attr('dir') === 'rtl';
        if (isRtl) {
            $btn.removeClass('text-left').addClass('text-right').attr('dir', 'rtl');
            $label.attr('dir', 'rtl');
        } else if ($btn.attr('dir') === 'ltr' || $label.attr('dir') === 'ltr') {
            $btn.removeClass('text-right').addClass('text-left');
        }
    });
}

export function activateDigen(rtlAlgorithm = 'advanced_full') {
    console.log('Digen RTL activated with algorithm:', rtlAlgorithm);

    setDigen(rtlAlgorithm);
    setInterval(() => {
        setDigen(rtlAlgorithm);
    }, 1000);
}
