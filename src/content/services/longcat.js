// longcat.js service functions (LongCat AI - longcat.ai / longcat.chat)
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
    '.msg-content',
    '.user-text',
    '.whitespace-pre-wrap',
    '.whitespace-normal'
].join(', ');

export function setLongcat(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        const $copyrightHost = AQ('footer, [role="contentinfo"], [class*="chat-input"], [class*="ChatInput"]').first();
        if ($copyrightHost.length) {
            addCopyright(
                $copyrightHost,
                'AsBoxGemini AsBoxB',
                'margin-top: 0; margin-bottom: 6px; font-size: 13px;'
            );
        }
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
}

export function activateLongcat(rtlAlgorithm = 'advanced_full') {
    console.log('LongCat RTL activated with algorithm:', rtlAlgorithm);

    setLongcat(rtlAlgorithm);

    setInterval(() => {
        setLongcat(rtlAlgorithm);
    }, 1000);
}
