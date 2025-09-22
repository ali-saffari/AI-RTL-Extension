// blackbox.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElements, getArticleTextElements } from '../utils/textDirectionUtils.js';

// BlackBox service functions
export function setBlackBox() {
    // Add copyright using utility function
    const $targetElement = $('.relative.min-w-40 > .px-4');
    if ($targetElement.length > 0) {
        addCopyright($targetElement, 'AsKimi AsBoxB', 'margin-bottom: 0px; ');
    }

    $("body textarea").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('FontSet');
            $(this).addClass('AsRtl');
            const text = $(this).val() || $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }

            $(this).on('input keyup paste', function() {
                const text = $(this).val();
                if (text && text.trim()) {
                    $(this).attr("dir", detectTextDirection(text));
                }
            })


        }
    })

    // Add event listeners for real-time text direction detection on textareas



    $('.prose').each(function (each) {

        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            $(this).addClass('FontSet');
            
            // Use textDirectionUtils for comprehensive text analysis
            processTextElements(
                $(this), 
                getArticleTextElements(), 
                (element) => element.textContent,
                'FontSetImportantGPT',
                'AsOkText'
            );
            
            // // Also analyze the main text-message content
            // const mainText = $(this).text();
            // if (mainText && mainText.trim()) {
            //     setTextDirectionAndFont(this, mainText, 'FontSetImportantGPT');
            //     console.log('Main text-message processed:', mainText);
            // }
        }
    })


    // $("body p").each(function (each) {
    //     if (!$(this).hasClass("AsRtl")) {
    //         $(this).addClass('AsRtl');
    //         const text = $(this).text();
    //         if (text && text.trim()) {
    //             $(this).attr("dir", detectTextDirection(text));
    //         }
    //     }
    // })
}



// Main activation function for Blackbox
export function activateBlackbox() {
    console.log("activateBlackbox");
    setBlackBox();
    let interval = setInterval(() => {
        setBlackBox();
    }, 1000);
}