// manus.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, getArticleTextElements } from '../utils/textDirectionUtils.js';

export function setManus() {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.flex.flex-col.sticky.bottom-0`
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

    // Process manus-markdown elements with processTextElementsAdvanced
    $('.manus-markdown').each(function (each) {
  
            processTextElementsAdvanced($(this), 'FontSet', 'AsOkText', true);
        
    });

    // Process other common text elements
    $("body span, body h1, body h2, body h3, body h4, body h5, body h6, .truncate ").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            if (text && text.trim()) {
                setTextDirectionAndFont(this, text, 'FontSet');
            }
        }
    });


}



// Main activation function for Manus
export function activateManus() {
    console.log("activateManus");
    
    // Initial setup
    setManus();
    
    // SetInterval for continuous processing
    setInterval(() => {
        setManus();
    }, 1000);
    
    
}