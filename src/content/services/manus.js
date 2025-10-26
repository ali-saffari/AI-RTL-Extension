// manus.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setManus(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.flex.flex-col.sticky.bottom-0`
        addCopyright($(fo2), 'AsMistral', '');
    }

    // Process textarea elements with RTL algorithm
    $("body textarea").each(function (each) {
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



    // Process manus-markdown elements using RTL algorithm
    $('.manus-markdown').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // Process other common text elements with RTL algorithm
    $("body p و body span, body h1, body h2, body h3, body h4, body h5, body h6, .truncate").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    $("span.text-start.font-serif  , .u-break-words").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
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