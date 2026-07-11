// t3chat.js service functions
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setT3chat(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(
            AQ('#chat-input-form').parent(),
            'AsBoxGemini AsBoxB',
            'margin-top: 2px; margin-bottom: -0px; font-size: 13px;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').each(function () {
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

    AQ('.chat-markdown, [class*="prose"], .whitespace-pre-wrap').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateT3chat(rtlAlgorithm = 'advanced_full') {
    console.log('T3 Chat RTL activated with algorithm:', rtlAlgorithm);

    setT3chat(rtlAlgorithm);

    setInterval(() => {
        setT3chat(rtlAlgorithm);
    }, 1000);
}
