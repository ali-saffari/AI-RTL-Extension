// aistudio.js service functions
import { 
    analyzeTextDirection
} from '../utils/analyzeDirection.js';
import { 
    processTextElementsAdvanced,
    processTablesInContainer,
    getAttributeTextElements
} from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';



// Recurring tasks that need to run periodically
export function setAiStudio() {
    // Add copyright to footer sections
    if (chrome.runtime?.id) {
        let fo2 = `section footer`;
        addCopyright($(fo2), 'AsBoxB', 'margin-top: 14px');
    }

    $("ms-chat-turn").each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });

    $("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTablesInContainer($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            siteConfig: 'aistudio'
        }); // Enable tracking for AI Studio
    });

    $("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTextElementsAdvanced($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: false
        }); // Enable tracking for AI Studio
    });

    $("ms-text-chunk textarea").each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
            $(this).addClass('FontSetImportant2');
            
            const text = $(this).val() || $(this).text();

            if (text && text.trim()) {
                $(this).attr("dir", analyzeTextDirection(text));
            }

            // Add input event listener for real-time direction detection
            $(this).on('input keyup paste', function() {
                const currentText = $(this).val();
                if (currentText && currentText.trim()) {
                    $(this).attr("dir", analyzeTextDirection(currentText));
                }
            });
        }
    });
}

// Main activation function for Aistudio
export function activateAistudio() {

    // Run initial setup
    setAiStudio();
    
    // Continue running setAiStudio every 100ms for other tasks
    let interval = setInterval(() => {
        setAiStudio();
    }, 500);
}

