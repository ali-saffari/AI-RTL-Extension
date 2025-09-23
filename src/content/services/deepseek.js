// deepseek.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setDeepSeek() {
    if (chrome.runtime?.id) {
        let fo2 = `._871cbca`
        
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



    // Process ds-message elements (messages in chat)
    $('.ds-message').each(function (each) {
        if ($(this).find('.ds-markdown').length > 0) {
            // If ds-markdown exists inside, use advanced function for complex messages
            processTextElementsAdvanced($(this), {
                fontClass: 'FontSet',
                processedClass: 'AsOk',
                isContainer: true
            });
        } else {
            // Otherwise, style the div inside ds-message for simple messages
            $(this).find('div').each(function() {
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
        }
    });

    // Process _546d736 elements for text direction detection (history items)
    $('._546d736 , .afa34042').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('FontSet');
                $(this).addClass('AsOk');
                
                // If RTL (Persian), add AsOkRList class for special styling
                if (direction === 'rtl') {
                    $(this).addClass('AsOkRList');
                } 
            }
        }
    });

 
}

// Main activation function for DeepSeek
export function activateDeepSeek() {
    // Initial setup
    setDeepSeek();

    // SetInterval and Observer
    let interval = setInterval(() => {
        setDeepSeek();
    }, 500);
}

