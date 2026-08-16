// deepseek.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setDeepSeek(rtlAlgorithm = 'advanced_full') {
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
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });


    AQ(' .ds-markdown , .ds-message div').each(function (each) {
        // AQ(this).addClass('AsOk FontSet FontClaude');
        
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });



    AQ('._546d736 , .afa34042').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            // processedClass: 'AsOk',
            rtlClass: 'AsOkRList'
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

