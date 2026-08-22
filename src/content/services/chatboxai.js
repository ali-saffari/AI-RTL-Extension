// chatboxai.js service functions (Chatbox AI - web.chatboxai.app)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setChatboxai(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        const $disclaimer = AQ('.disclaimer-safe-area.mantine-Text-root');
        if ($disclaimer.length && !$disclaimer.hasClass('AsOk')) {
            $disclaimer.empty();
            addCopyright(
                $disclaimer,
                'AsBoxGemini AsBoxB',
                'margin-top: 0; margin-bottom: -14px; font-size: 13px;'
            );
        }
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

    // AQ('[class*="whitespace-pre-wrap"], [class*="whitespace-pre-line"]').each(function () {
    //     applyRtlToElement(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsOkUser',
    //         setTextAlign: true
    //     });
    // });

    AQ('[class*="markdown"], [class*="prose"], [class*="message"], [class*="answer"], [class*="chat"]  , .msg-content').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateChatboxai(rtlAlgorithm = 'advanced_full') {
    console.log('Chatbox AI RTL activated with algorithm:', rtlAlgorithm);

    setChatboxai(rtlAlgorithm);

    setInterval(() => {
        setChatboxai(rtlAlgorithm);
    }, 1000);
}
