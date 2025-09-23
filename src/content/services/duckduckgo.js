// duckduckgo.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setDuckduckgo() {
    if (chrome.runtime?.id) {
        let fo2 = `.eRjZTOsvr6gqJe3E2Yc6`
        
        // Add copyright using utility function
        addCopyright($(fo2), 'AsBoxDuckduckgo');
    }

    // Process textarea elements for text direction detection
    $('textarea').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).val();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('FontSet');
                $(this).addClass('AsOk');
            }
            
            // Add event listener for real-time text direction detection
            $(this).on('input keyup', function() {
                const currentText = $(this).val();
                if (currentText && currentText.trim()) {
                    const direction = detectTextDirection(currentText);
                    $(this).attr('dir', direction);
                } else {
                    $(this).removeAttr('dir');
                }
            });
        }
    });

    // Process p elements for text direction detection
    $(".PMQFURe7WSKqXJk9e3Jn , .decaGrVqUoziItl4Iarp ").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('FontSet');
                $(this).addClass('AsOk');
            }
        }
    });

    // Process ucB71mHYvyHsWKjYfYKI elements using advanced function
    $('.ucB71mHYvyHsWKjYfYKI').each(function (each) {
        // Disable horizontal scroll only
        $(this).css({
            'overflow-x': 'hidden',
            'overflow-y': 'auto'
        });
        
        processTextElementsAdvanced($(this), 'FontSet', 'AsOk', true);
    });
}

// Main activation function for DuckDuckGo
export function activateDuckduckgo() {
    // Initial setup
    setDuckduckgo();

    // SetInterval for continuous processing
    setInterval(() => {
        setDuckduckgo();
    }, 1000);
}

