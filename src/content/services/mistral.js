// mistral.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setMistral(rtlAlgorithm = 'advanced_full') {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.relative.start-0.end-0.bottom-0.flex.w-full.flex-col.items-center`
        addCopyright($(fo2), 'AsMistral', '');
    }

    // Process textarea elements with RTL algorithm
    $('body textarea').each(function (each) {
        if ($(this).data('rtl-listener-added')) {
            return;
        }
        $(this).data('rtl-listener-added', true);

        
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time direction detection
        $(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

    // Process paragraph elements with RTL algorithm
    $('.select-text').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    



    // Process markdown-container-style elements using RTL algorithm
    $('.markdown-container-style').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
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
        $(".ProseMirror-focused").each(function (each) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk'
            });
        });
    }, 500);
}