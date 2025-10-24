// openrouter.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setOpenRouter(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright notice
        addCopyright($('.sm\\:mb-2.sm\\:mt-0.flex-shrink-0.md\\:px-4'), 'AsBoxOpenRouter AsBoxB', 'margin-top: 5px;margin-bottom: -8px;');
    }

    // Process message content
    $('.items-stretch .font-normal').each(function() {

            processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet FontOpenRouter',
                processedClass: 'AsOkText',
                isContainer: true
            });
    
    });

    

    $('.break-words').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
    
    });
    

    // Process input fields
    $('textarea, input[type="text"], .input-field').each(function() {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
        // Add event listener for real-time direction detection
        $(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // // Apply font to body
    $('body').each(function() {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });
}

// Main activation function for OpenRouter
export function activateOpenRouter(rtlAlgorithm = 'advanced_full') {
    console.log("activateOpenRouter with RTL algorithm:", rtlAlgorithm);
    
    // Initial setup
    setOpenRouter(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setOpenRouter(rtlAlgorithm);
    }, 1000);
}
