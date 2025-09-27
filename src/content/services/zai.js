// Z.ai service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Helper function to detect text direction based on algorithm
function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    let direction;
    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        direction = detectTextDirection(text);
    } else if (rtlAlgorithm === 'first_word') {
        direction = analyzeTextDirectionFirstWord(text);
    } else {
        direction = detectTextDirection(text); // fallback
    }
    
    return direction;
}

export function setZai(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {
        addCopyright('.footer, .chat-container, .main-container', 'AsBoxB');
    }

    // Process textarea and input elements with RTL algorithm
    $('body textarea, body input[type="text"], body input[type="search"]').each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOK'
        });
        
        // Add event listener for real-time direction detection
        $(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // // Process message content elements
    $(' .textGradientDark , .chat-user .rounded-xl').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOK',
            rtlClass: 'AsRtl'
        });
    });

    // // Process text content elements
    // $('.text-content, .message-text, .response-text, .content, .text').each(function (each) {
    //     if (!$(this).hasClass("AsOkFontSet")) {
    //         $(this).addClass('AsOkFontSet');
    //         const text = $(this).val() || $(this).text();
    //         const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);

    //         if (direction === 'rtl') {
    //             $(this).addClass('FontSet');
    //         }
    //     }
    // });

    // Process conversation elements using RTL algorithm
    $('.chat-assistant').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });
}

// Main activation function for Z.ai
export function activateZai(rtlAlgorithm = 'advanced_section') {
    console.log('Z.ai RTL activated with algorithm:', rtlAlgorithm);
    


    setTimeout(() => {
      
            // Initial setup
    setZai(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setZai(rtlAlgorithm);
    }, 500);


    }, 2000);
}
