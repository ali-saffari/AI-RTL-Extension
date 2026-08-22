// minimax.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setMinimax(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright notice
        addCopyright(AQ('.relative.hidden .drag-wrapper'), 'AsBoxMinimax AsBoxB', 'margin-top: 5px;margin-bottom: -2px;');
    }

    // Process message content
    AQ('.message-content, .message-text, .conversation-message, .chat-message, .content').each(function() {
     
            applyRtlToContainer(this, rtlAlgorithm, {
                fontClass: 'FontSet FontMinimax',
                processedClass: 'AsOkText',
                isContainer: true
            });
        
    });

    // Process input fields
    AQ('textarea, input[type="text"], .input-field').each(function() {

        
        if (!AQ(this).hasClass("FontSetImportant")) {
            AQ(this).addClass('FontSetImportant');
        }

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetImportant',
            processedClass: 'AsRtl'
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSetImportant',
                setTextAlign: true
            });
        });
    });

    // Apply font to body
    AQ('body').each(function() {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
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
