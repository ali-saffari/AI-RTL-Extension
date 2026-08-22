// manus.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setManus(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.flex.flex-col.sticky.bottom-0`
        addCopyright(AQ(fo2), 'AsMistral', '');
    }

    // Process textarea elements with RTL algorithm
    AQ("body textarea , .tiptap.ProseMirror").each(function (each) {
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





    AQ('.ProseMirror p , .whitespace-nowrap').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
        });
    });


    // Process manus-markdown elements using RTL algorithm
    AQ('.manus-markdown').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // Process other common text elements with RTL algorithm
    AQ("body p و body span, body h1, body h2, body h3, body h4, body h5, body h6, .truncate").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    AQ("span.text-start.font-serif  , .u-break-words").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


}






// Main activation function for Manus
export function activateManus(rtlAlgorithm = 'advanced_full') {
    console.log('Manus RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setManus(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setManus(rtlAlgorithm);
    }, 500);
}