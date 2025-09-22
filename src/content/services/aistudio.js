// aistudio.js service functions
import { 
    analyzeTextDirection
} from '../utils/analyzeDirection.js';
import { 
    processTextElements,
    getArticleTextElements,
    getAttributeTextElements
} from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';

export function setAiStudio() {
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


        // پردازش عناصر متنی مقاله
        processTextElements($(this), getArticleTextElements(), (element) => element.textContent);

   
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
    setAiStudio();
    
    let interval = setInterval(() => {
        setAiStudio();
    }, 1000);
}