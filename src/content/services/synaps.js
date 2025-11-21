// synaps.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setSynaps(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright if needed
        // addCopyright(AQ(selector), 'AsBoxSynaps', 'margin-top: 2px;');
    }

    AQ('textarea , input[type="text"],  input[type="search"]').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup paste', function() {

            console.log('input keyup paste');
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

}

// Main activation function for Synaps
export function activateSynaps(rtlAlgorithm = 'advanced_full') {
    console.log('Synaps RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setSynaps(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setSynaps(rtlAlgorithm);
    }, 1000);
}

