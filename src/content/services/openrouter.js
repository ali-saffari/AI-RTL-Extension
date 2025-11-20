// openrouter.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setOpenRouter(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright notice
        addCopyright(AQ('.sm\\:mb-2.sm\\:mt-0.flex-shrink-0.md\\:px-4'), 'AsBoxOpenRouter AsBoxB', 'margin-top: 5px;margin-bottom: -8px;');
    }

    // Process message content
    AQ('.items-stretch .font-normal').each(function() {

            processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet FontOpenRouter',
                processedClass: 'AsOkText',
                isContainer: true
            });
    
    });

    

    AQ('.break-words').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
    
    });
    

    // Process input fields
    AQ('textarea, input[type="text"], .input-field').each(function() {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // // Apply font to body
    AQ('body').each(function() {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
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
