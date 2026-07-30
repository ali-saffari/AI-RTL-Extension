// scispace.js service functions (SciSpace - scispace.com)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setScispace(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(
            AQ('#scispace-agent-input').parent(),
            'AsBoxGemini AsBoxB',
            'margin-top: 6px; margin-bottom: -11px; font-size: 13px;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]').each(function () {
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

    // User message bubble
    AQ('[class*="ds:whitespace-pre-wrap"], [class*="whitespace-pre-wrap"] , [data-design-system="p"]').each(function () {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkUser',
            setTextAlign: true
        });
    });

    AQ('[class*="markdown"], [class*="prose"], [class*="message"], [class*="answer"], [class*="chat"], .whitespace-pre-line').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateScispace(rtlAlgorithm = 'advanced_full') {
    console.log('SciSpace RTL activated with algorithm:', rtlAlgorithm);

    setScispace(rtlAlgorithm);

    setInterval(() => {
        setScispace(rtlAlgorithm);
    }, 1000);
}
