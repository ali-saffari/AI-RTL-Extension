// genspark.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setGenspark(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright if needed
        addCopyright(AQ(".j-input-wrapper-wrapper"), 'AsBoxGenspark AsBoxB', 'margin-top: 2px;');
    }

    // Process textareas and inputs
    AQ('textarea, input[type="text"], input[type="search"]').each(function (each) {
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


    // Process content elements (prose, content containers, message containers)
    AQ('.markdown-viewer').each(function() {

        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('.plain-text .user .content code').each(function (each) {

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
      
    });

    
}

// Main activation function for Genspark
export function activateGenspark(rtlAlgorithm = 'advanced_full') {
    console.log('Genspark RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setGenspark(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setGenspark(rtlAlgorithm);
    }, 1000);
}
