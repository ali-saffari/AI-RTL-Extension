// qwen.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setQwenlm(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {

              let fo2 = `.chat-message-input-container.in-chat`
         addCopyright($(fo2), 'AsBoxQwen AsBoxB' ,`margin-top: 11px; margin-bottom: -5px; transform: scale(0.9);`);


    }

    // Process chat messages and input elements
    $(".chat-assistant , .user-message , #chat-input").each(function (each) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
        
    });

    // Process chat item drag elements
    $(".chat-item-drag").each(function (each) {

            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
        
    });
    

    // Process markdown prose elements
    $(".response-message-body .markdown-prose").each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });


    // Process font primary and scrollbar hidden elements
    $(".font-primary ,.scrollbar-hidden").each(function (each) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
    });

}



// Main activation function for Qwen
export function activateQwen(rtlAlgorithm = 'advanced_section') {
    console.log('Qwen RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setQwenlm(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setQwenlm(rtlAlgorithm);
    }, 500);
}