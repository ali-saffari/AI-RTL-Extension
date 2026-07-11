// vivado.js service functions (Vivado Doc Search - vivado.amd.com/chat)
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setVivado(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        const footer = AQ('.ot-sdk-show-settings').closest('.lobe-flex').parent('.lobe-flex');
        if (footer.length) {
            addCopyright(
                footer,
                'AsBoxGemini AsBoxB',
                'width: 100%; margin-top: 4px; margin-bottom: 0; font-size: 10px; text-align: center;'
            );
        }
    }

    AQ('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetVivadoInput',
            processedClass: 'AsOk'
        });

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSetVivadoInput'
                });
            });
        });
    });

    AQ('[class*="markdown"], [class*="prose"], .ant-typography, .lobe-md, .whitespace-pre-wrap').each(function () {
        AQ(this).css({
            '--lobe-markdown-font-size': '11px',
            '--lobe-markdown-line-height': '29.6px'
        });

        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetVivado',
            processedClass: 'AsOkText',
            // isContainer: true,
            setTextAlign: true
        });
    });



     

    
}

export function activateVivado(rtlAlgorithm = 'advanced_full') {
    console.log('Vivado Doc Search RTL activated with algorithm:', rtlAlgorithm);

    setVivado(rtlAlgorithm);

    setInterval(() => {
        setVivado(rtlAlgorithm);
    }, 1000);
}
