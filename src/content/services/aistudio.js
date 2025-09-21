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

        // پردازش عناصر با attributes مربوط به مقالات
        processTextElements($(this), getAttributeTextElements(), (element) => 
            element.title || element.alt || element.getAttribute('aria-label') || element.textContent
        );
    });

    $("ms-text-chunk textarea").each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
            $(this).addClass('FontSetImportant2');
            $(this).attr("dir", "auto");
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