// mistral.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, getArticleTextElements } from '../utils/textDirectionUtils.js';

export function setMistral() {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.relative.start-0.end-0.bottom-0.flex.w-full.flex-col.items-center`
        addCopyright($(fo2), 'AsMistral', '');
    }

    // Process textarea elements with improved text direction detection
    $("body textarea").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).val() || $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSet', text });
            
            // Add event listener for real-time direction detection
            $(this).on('keyup paste input', function() {
                const currentText = $(this).val() || $(this).text();
                requestAnimationFrame(() => {
                    setTextDirectionAndFont(this, { fontClass: 'FontSet', text: currentText });
                });
            });
        }
    });

    // Process paragraph elements with advanced text processing
    $(" .select-text").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSet', text });
        }
    });

    



    // Process markdown-container-style elements with processTextElementsAdvanced
    $('.markdown-container-style').each(function (each) {
    
            processTextElementsAdvanced($(this), {
                fontClass: 'FontSet',
                processedClass: 'AsOkText',
                isContainer: true
            });
        
    });

    // Process other common text elements
    // $(" body span, body h1, body h2, body h3, body h4, body h5, body h6").each(function (each) {
    //     if (!$(this).hasClass("AsOk")) {
    //         $(this).addClass('AsOk');
    //         const text = $(this).text();
    //         if (text && text.trim()) {
    //             setTextDirectionAndFont(this, { fontClass: 'FontSet', text });
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


    setInterval(() => {
        $(".ProseMirror-focused").each(function (each) {

            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSet', text });
        
    });
    }, 500);
    

}