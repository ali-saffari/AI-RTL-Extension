// qwen.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setQwenlm(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {

              let fo2 = `.chat-layout-input-container`
         addCopyright(AQ(fo2), 'AsBoxQwen AsBoxB' ,`margin-top: 11px; margin-bottom: -5px; transform: scale(0.7);`);


    }

    // Process chat messages and input elements
    AQ(".chat-assistant , .user-message , #chat-input ").each(function (each) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOK',
                setTextAlign: true
            });
        
    });
    
    
    AQ('textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            rtlClass: 'rtlEelemt'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true,
                rtlClass: 'rtlEelemt'
            });
        });
    });


    // Process chat item drag elements
    AQ(".chat-item-drag , .chat-item-drag-link ").each(function (each) {

            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOK'
            });
        
    });
    

    
    AQ(".chat-user-message").each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });

    // Process markdown prose elements
    AQ(".qwen-markdown").each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });


    // Process font primary and scrollbar hidden elements
    AQ(".font-primary ,.scrollbar-hidden").each(function (each) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
    });

}



// Main activation function for Qwen
export function activateQwen(rtlAlgorithm = 'advanced_full') {
    console.log('Qwen RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setQwenlm(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setQwenlm(rtlAlgorithm);
    }, 500);
}