// mathgpt.js service functions (MathGPT - math-gpt.org)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const INPUT_SELECTOR = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    '[contenteditable="true"]',
    '[role="textbox"]'
].join(', ');

const TEXT_SELECTOR = [
    '[class*="markdown"]',
    '[class*="prose"]',
    '[class*="message"]',
    '[class*="answer"]',
    '[class*="solution"]',
    '[class*="explanation"]',
    '.whitespace-pre-wrap',
    '.whitespace-normal'
].join(', ');

export function setMathgpt(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(
            AQ('.pointer-events-auto.px-2.flex.flex-col.gap-1.md\\:px-4.lg\\:mx-auto.lg\\:max-w-3xl.mb-2'),
            'AsBoxGemini AsBoxB',
            'margin-top: 0; margin-bottom: 6px; font-size: 13px;'
        );
    }

    AQ(INPUT_SELECTOR).each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk'
            });
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

    AQ(TEXT_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('[data-testid="user-message"]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });
}

export function activateMathgpt(rtlAlgorithm = 'advanced_full') {
    console.log('MathGPT RTL activated with algorithm:', rtlAlgorithm);

    setMathgpt(rtlAlgorithm);

    setInterval(() => {
        setMathgpt(rtlAlgorithm);
    }, 1000);
}
