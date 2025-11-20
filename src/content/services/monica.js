// monica.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setMonica(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `[class*="input-wrapper-"]`
        addCopyright(AQ(fo2).parent(), 'AsBoxMonica AsBoxB');
    }

    // Process textarea elements with RTL algorithm
    AQ('body textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'Asok',
            rtlClass: 'AsRtl',
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    
    // Process paragraph and name wrapper elements with RTL algorithm
    AQ('body p, [class*="name-wrapper-"]').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'Asok',
            rtlClass: 'AsRtl',
            setTextAlign: true
        });
    });

    // Process markdown elements using RTL algorithm
    AQ('[class*="chat-message-"] [class*="markdown-"]').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}



// Main activation function for Monica
export function activateMonica(rtlAlgorithm = 'advanced_full') {
    console.log('Monica RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setMonica(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setMonica(rtlAlgorithm);
    }, 500);
}