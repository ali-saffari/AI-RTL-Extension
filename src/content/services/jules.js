// jules.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setJules(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.disclaimer`
        
        // Add copyright using utility function
        addCopyright(AQ(fo2), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -16px; font-size: 13px;');
    }

    // Process markdown panels with RTL algorithm
    AQ('.markdown  , .ProseMirror , .research-step-description').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });


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

    

    AQ('.task-description  , .chat-header-text').each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
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
