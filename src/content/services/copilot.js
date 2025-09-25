// copilot.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

// Copilot/Bing service functions
export function setItems_copilotBing() {
    let fo = `.relative.max-h-full.w-expanded-composer.max-w-chat`
    console.log("setItems_copilotBing")

    if (chrome.runtime?.id) {
        // Add copyright using utility function
        const targetElement = $(fo);
        // targetElement.addClass("red")



        if (targetElement.length > 0) {
            addCopyright(targetElement, 'AsBox_copilotBing', 'margin-top: 5px; padding: 0px;');
        }
    }

    // Process all text elements using processTextElementsAdvanced
    $('[data-content="ai-message"] .break-words').each(function (each) {
        // if (!$(this).hasClass("AsOk")) {
    
            processTextElementsAdvanced($(this), {
                fontClass: 'CopilotFontSet',
                processedClass: 'AsOk',
                isContainer: true,
                skipTags: ['span']
            });
        // }
    });

    $('[data-content="user-message"] .break-words').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('CopilotFontSet');
                $(this).addClass('AsOk');
            }
        }
    });

    // Process listbox options for text direction detection
    $('[role="listbox"] [role="option"]').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('CopilotFontSet');
                $(this).addClass('AsOk');
                
                // Add RTL specific class if direction is RTL
                if (direction === 'rtl') {
                    $(this).addClass('listboxRtlCopilot');
                }
            }
        }
    });

    



    // Process textarea elements for text direction detection
    $('textarea').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).val();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('CopilotFontSet');
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
}



// Main activation function for Copilot
export function activateCopilot(rtlAlgorithm = 'advanced_section') {
    console.log("activateCopilot with RTL algorithm:", rtlAlgorithm);
    setItems_copilotBing();

    setInterval(() => {
        setItems_copilotBing();
    }, 1000);
}

