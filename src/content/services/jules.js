// jules.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setJules(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.disclaimer`
        
        // Add copyright using utility function
        addCopyright($(fo2), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -16px; font-size: 13px;');
    }

    // Process markdown panels with RTL algorithm
    $('.markdown  , .ProseMirror , .research-step-description').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });


    $('textarea').each(function (each) {
        if ($(this).data('rtl-listener-added')) {
            return;
        }
        $(this).data('rtl-listener-added', true);

        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        $(this).on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

    

    $('.task-description  , .chat-header-text').each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });

}




// Main activation function for Jules
export function activateJules(rtlAlgorithm = 'advanced_full') {
    console.log("activateJules with RTL algorithm:", rtlAlgorithm);
    // Initial setup
    setJules(rtlAlgorithm);
  



   
    setInterval(() => {
        setJules(rtlAlgorithm);
    }, 1000);
}
