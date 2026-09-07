// mistral.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setMistral(rtlAlgorithm = 'advanced_full') {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.relative.start-0.end-0.bottom-0.flex.w-full.flex-col.items-center`
        addCopyright(AQ(fo2), 'AsMistral', '');
    }

    // Process textarea elements with RTL algorithm
    AQ('body textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

    // Process paragraph elements with RTL algorithm
    AQ('.select-text').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    



    // Process markdown-container-style elements using RTL algorithm
    AQ('.markdown-container-style').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

}



// Main activation function for Mistral
export function activateMistral(rtlAlgorithm = 'advanced_full') {
    console.log('Mistral RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setMistral(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setMistral(rtlAlgorithm);
    }, 500);

    // Additional processing for ProseMirror elements
    setInterval(() => {
        AQ(".ProseMirror-focused").each(function (each) {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk'
            });
        });
    }, 500);
}