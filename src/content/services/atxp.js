// atxp.js service functions (ATXP Chat - chat.atxp.ai)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setAtxp(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        const $footer = AQ('[role="contentinfo"]');
        if ($footer.length) {
            $footer.css({
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center'
            });

            addCopyright(
                $footer,
                'AsBoxGemini AsBoxB',
                'margin-top: 0; margin-bottom: 0px; font-size: 13px;'
            );
            const $span = $footer.children('span').first();
            if ($span.length) {
                $span.css('display', 'none');
            }
       
        }
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

    AQ('[class*="markdown"], [class*="prose"], .whitespace-pre-wrap, .whitespace-normal').each(function () {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            setTextAlign: true
        });
    });
}

export function activateAtxp(rtlAlgorithm = 'advanced_full') {
    console.log('ATXP Chat RTL activated with algorithm:', rtlAlgorithm);

    setAtxp(rtlAlgorithm);

    setInterval(() => {
        setAtxp(rtlAlgorithm);
    }, 1000);
}
