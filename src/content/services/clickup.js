// clickup.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setClickup(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(
            AQ('.global-launch-screen-footer'),
            'AsBoxGemini AsBoxB',
            'margin-top: 0px; margin-bottom: -4px; font-size: 13px;'
        );
    }
    AQ('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').each(function () {
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

    AQ('[data-test="ai-chat-message"], [class*="markdown"], [class*="prose"], .ql-editor').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('[class*="link-text-inner"], [class*="title__overlay"]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });
}

export function activateClickup(rtlAlgorithm = 'advanced_full') {
    console.log('ClickUp RTL activated with algorithm:', rtlAlgorithm);

    setClickup(rtlAlgorithm);

    setInterval(() => {
        setClickup(rtlAlgorithm);
    }, 1000);
}
