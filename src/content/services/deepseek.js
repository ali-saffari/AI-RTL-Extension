// deepseek.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setDeepSeek(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#deepseek-font-style').length) {
        AQ(`<style id="deepseek-font-style">
            html.ai-rtl-has-font {
                --dsw-font-markdown-table: 15px / 25px var(--ai-rtl-font, iranyekan, sans-serif) !important;
                --dsw-font-markdown-table-font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font .ds-markdown h1,
            html.ai-rtl-has-font .ds-markdown h2,
            html.ai-rtl-has-font .ds-markdown h3,
            html.ai-rtl-has-font .ds-markdown h4 {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
        </style>`).appendTo('head');
    }

    if (chrome.runtime?.id) {
        let fo2 = `._871cbca`
        
        // Add copyright using utility function
        addCopyright(AQ(fo2), 'AsBoxDuckduckgo AsBoxB');
    }

    // Process textarea elements for text direction detection
    AQ('textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });


    AQ('.ds-markdown').each(function () {
        // AQ(this).addClass('AsOk FontSet FontClaude');

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });


    AQ('.ds-message > div:first-of-type').each(function () {
        const $el = AQ(this);
        if ($el.find('.ds-markdown').length) {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            rtlClass: 'AsOkRList'
        });
    });

    AQ('._546d736 , .afa34042').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            rtlClass: 'AsOkRList'
        });
    });

    AQ('text').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText'
        });
    });

}

// Main activation function for DeepSeek
export function activateDeepSeek(rtlAlgorithm = 'advanced_full') {
    console.log('DeepSeek RTL activated with algorithm:', rtlAlgorithm);
    // Initial setup
    setDeepSeek(rtlAlgorithm);

    // SetInterval and Observer
    let interval = setInterval(() => {
        setDeepSeek(rtlAlgorithm);
    }, 500);
}

