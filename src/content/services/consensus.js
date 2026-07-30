// consensus.js service functions (Consensus - consensus.app)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setConsensus(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(
            AQ('[data-testid="ask-follow-up-container"].sticky'),
            'AsBoxGemini AsBoxB ',
            '  margin-top: -10px; margin-bottom: 6px; font-size: 13px;'
        );
    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"] و').each(function () {
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

    AQ('[class*="NavigationButton_textTruncate"] , .break-words , .truncate ').each(function () {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkCON',
            setTextAlign: true
        });
    });

    



    AQ('[class*="markdown"], [class*="prose"], [class*="result"], [class*="abstract"], [class*="answer"], .whitespace-pre-wrap ,.whitespace-pre-line').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateConsensus(rtlAlgorithm = 'advanced_full') {
    console.log('Consensus RTL activated with algorithm:', rtlAlgorithm);

    setConsensus(rtlAlgorithm);

    setInterval(() => {
        setConsensus(rtlAlgorithm);
    }, 1000);
}
