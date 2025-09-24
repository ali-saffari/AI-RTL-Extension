// kimi.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont } from '../utils/textDirectionUtils.js';

// Kimi service functions
export function setKimi() {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.chat-action`
        addCopyright($(fo2), 'AsKimi', 'margin-bottom: 10px');
    }

    // Process markdown-container elements with processTextElementsAdvanced
    $('.markdown-container').each(function (each) {

        setTextDirectionAndFont(this, { fontClass: 'FontSet' });
    });

    // // Process textarea elements with improved text direction detection
    // $("body textarea").each(function (each) {
    //     if (!$(this).hasClass("AsOk")) {
    //         $(this).addClass('AsOk');
    //         const text = $(this).val() || $(this).text();
    //         setTextDirectionAndFont(this, text, 'FontSet');
            
    //         // Add event listener for real-time direction detection
    //         $(this).on('keyup paste input', function() {
    //             const currentText = $(this).val() || $(this).text();
    //             requestAnimationFrame(() => {
    //                 setTextDirectionAndFont(this, currentText, 'FontSet');
    //             });
    //         });
    //     }
    // });

    // Process paragraph elements with advanced text processing
    $(".user-content , .user-name").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSet', text });
        }
    });

    // // Process other common text elements
    $(" body span, body h1, body h2, body h3, body h4, body h5, body h6 , .chat-input-editor").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            if (text && text.trim()) {
                setTextDirectionAndFont(this, { fontClass: 'FontSet', text });
            }
        }
    });
}



// Main activation function for Kimi
export function activateKimi() {
    console.log("activateKimi");
    
    // Initial setup
    setKimi();
    
    // SetInterval for continuous processing
    setInterval(() => {
        setKimi();
    }, 1000);
    
    // MutationObserver for dynamic content updates
    let timeoutId;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log("Kimi content changed - reprocessing");
            setKimi();
        }, 200);
    });
    
    const config = {attributes: true, childList: true, subtree: true};
    const targetNode = document.body;
    
    if (targetNode) {
        observer.observe(targetNode, config);
        console.log('Kimi observer started');
    } else {
        console.log('Kimi targetNode not found - observer not started');
    }
}