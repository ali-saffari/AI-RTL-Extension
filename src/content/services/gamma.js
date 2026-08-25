// gamma.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

const INPUT_SELECTOR = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    '[contenteditable="true"]',
    '[contenteditable="plaintext-only"]',
    '[role="textbox"]',
    '.tiptap',
    '.ProseMirror',
    '.chakra-textarea',
    '.chakra-editable'
].join(', ');

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: 'important'
};

function ensureGammaStyles() {
    if (AQ('#gamma-rtl-style').length) {
        return;
    }

    AQ(`<style id="gamma-rtl-style">
        html.ai-rtl-has-font, html.ai-rtl-has-font body,
        html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp) {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
        }
        code, pre, kbd, samp, code *, pre * {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
        textarea[dir="rtl"],
        input[dir="rtl"],
        [contenteditable][dir="rtl"],
        [role="textbox"][dir="rtl"],
        .tiptap[dir="rtl"],
        .ProseMirror[dir="rtl"],
        .chakra-textarea[dir="rtl"],
        .chakra-editable[dir="rtl"],
        .css-5bdxzq[dir="rtl"],
        .css-5nw0s1[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }
        textarea[dir="ltr"],
        input[dir="ltr"],
        [contenteditable][dir="ltr"],
        [role="textbox"][dir="ltr"],
        .tiptap[dir="ltr"],
        .ProseMirror[dir="ltr"],
        .chakra-textarea[dir="ltr"],
        .chakra-editable[dir="ltr"],
        .css-5bdxzq[dir="ltr"],
        .css-5nw0s1[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }
    </style>`).appendTo('head');
}

function isGammaCodeEditor(element) {
    return AQ(element).closest('pre, code, .monaco-editor, [class*="cm-editor"]').length > 0;
}

export function setGamma(rtlAlgorithm = 'advanced_full') {
    ensureGammaStyles();

    AQ('body').each(function () {
        if (!AQ(this).hasClass('FontSet')) {
            AQ(this).addClass('FontSet');
        }
    });

    if (chrome.runtime?.id) {
        // Add copyright if needed - adjust selector based on actual site structure
        // addCopyright(AQ('selector'), 'AsBoxGemini AsBoxB' , 'margin-top: 2px; margin-bottom: -5px; font-size: 13px;');
    }

    AQ(INPUT_SELECTOR).each(function () {
        if (isGammaCodeEditor(this)) {
            return;
        }

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

    // Process content containers - adjust selectors based on actual site structure
    AQ('[class*="message"], [class*="content"], [class*="text"], .prose, .markdown , .react-renderer').each(function (each) {
        if (AQ(this).hasClass('AsOkText')) {
            return;
        }
        
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

     
    AQ(".react-renderer .heading , .react-renderer .title ,.chakra-editable , .css-bj3v83").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    AQ('.css-5bdxzq').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            setTextAlign: 'important'
        });
    });

    AQ('.css-5nw0s1').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

// Main activation function for Gamma
export function activateGamma(rtlAlgorithm = 'advanced_full') {
    console.log('Gamma RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setGamma(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setGamma(rtlAlgorithm);
    }, 1000);
}

