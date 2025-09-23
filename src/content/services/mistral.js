// mistral.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, getArticleTextElements } from '../utils/textDirectionUtils.js';

export function setMistral() {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `form.mb-0.rounded-xl.large-box-shadow.delay-150.w-full`
        addCopyright($(fo2), 'AsMistral', '');
    }

    // Process textarea elements with improved text direction detection
    $("body textarea").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).val() || $(this).text();
            setTextDirectionAndFont(this, text, 'FontSet');
            
            // Add event listener for real-time direction detection
            $(this).on('keyup paste input', function() {
                const currentText = $(this).val() || $(this).text();
                requestAnimationFrame(() => {
                    setTextDirectionAndFont(this, currentText, 'FontSet');
                });
            });
        }
    });

    // Process paragraph elements with advanced text processing
    $("body p").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, text, 'FontSet');
        }
    });

    // Process markdown-container-style elements with processTextElementsAdvanced
    $('.markdown-container-style').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            processTextElementsAdvanced($(this), 'FontSet', 'AsOkText', true);
        }
    });

    // Process other common text elements
    // $(" body span, body h1, body h2, body h3, body h4, body h5, body h6").each(function (each) {
    //     if (!$(this).hasClass("AsOk")) {
    //         $(this).addClass('AsOk');
    //         const text = $(this).text();
    //         if (text && text.trim()) {
    //             setTextDirectionAndFont(this, text, 'FontSet');
    //         }
    //     }
    // });
}



// Main activation function for Mistral
export function activateMistral() {
    console.log("activateMistral");
    
    // Initial setup
    setMistral();
    
    // SetInterval for continuous processing
    setInterval(() => {
        setMistral();
    }, 1000);
    

}