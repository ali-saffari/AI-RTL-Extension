// monica.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setMonica() {
    if (chrome.runtime?.id) {
        let fo2 = `[class*="input-wrapper-"]`
        addCopyright($(fo2).parent(), 'AsBoxMonica AsBoxB');
    }

    // Add RTL functionality
    $("body textarea").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            $(this).addClass('FontSet');
            const text = $(this).val() || $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr("dir", direction);
                // Set text alignment based on direction
                if (direction === 'rtl') {
                    $(this).css('text-align', 'right');
                } else {
                    $(this).css('text-align', 'left');
                }
            }
            
            // Add event listener for real-time direction detection
            $(this).on('keyup paste input', function() {
                const currentText = $(this).val() || $(this).text();
                if (currentText && currentText.trim()) {
                    const direction = detectTextDirection(currentText);
                    $(this).attr("dir", direction);
                    // Set text alignment based on direction
                    if (direction === 'rtl') {
                        $(this).css('text-align', 'right');
                    } else {
                        $(this).css('text-align', 'left');
                    }
                }
            });
        }
    })

    
    $("body p, [class*='name-wrapper-']").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            $(this).addClass('FontSet');
            const text = $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
        }
    })

    // Process markdown elements
    $("[class*='chat-message-'] [class*='markdown-']").each(function (each) {
   
            processTextElementsAdvanced($(this), {
                fontClass: 'FontSet',
                processedClass: 'AsOk',
                isContainer: true,
                setTextAlign: true
            });
        
    })
}



// Main activation function for Monica
export function activateMonica() {
    setMonica();
    

    setInterval(() => {
        setMonica();
    }, 1000);
}