// minimax.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setMinimax(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright notice
        addCopyright($('.relative.hidden .drag-wrapper'), 'AsBoxMinimax AsBoxB', 'margin-top: 5px;margin-bottom: -2px;');
    }

    // Process message content
    $('.message-content, .message-text, .conversation-message, .chat-message, .content').each(function() {
     
            processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet FontMinimax',
                processedClass: 'AsOkText',
                isContainer: true
            });
        
    });

    // Process input fields
    $('textarea, input[type="text"], .input-field').each(function() {

        
        if (!$(this).hasClass("FontSetImportant")) {
            $(this).addClass('FontSetImportant');
        }

        if ($(this).data('rtl-listener-added')) {
            return;
        }
        $(this).data('rtl-listener-added', true);

        
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportant',
            processedClass: 'AsRtl'
        });
        
        // Add event listener for real-time direction detection
        $(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSetImportant',
                setTextAlign: true
            });
        });
    });

    // Apply font to body
    $('body').each(function() {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });
}

// Main activation function for Minimax
export function activateMinimax(rtlAlgorithm = 'advanced_full') {
    console.log("activateMinimax with RTL algorithm:", rtlAlgorithm);
    
    // Initial setup
    setMinimax(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setMinimax(rtlAlgorithm);
    }, 1000);
}
