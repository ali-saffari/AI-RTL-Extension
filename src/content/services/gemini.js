// gemini.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setGemini() {
    if (chrome.runtime?.id) {
        let fo2 = `.hallucination-disclaimer`
        
        // Add copyright using utility function
        addCopyright($(fo2), 'AsBoxGemini' , 'margin-top: 1pxmargin-top: -6px;margin-bottom: 4px;');
    }


    $('.markdown-main-panel').each(function (each) {

        processTextElementsAdvanced($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });


    // Process .gds-label-l elements for text direction detection
    $('.gds-label-l , .gds-body-l , h1 , .gds-body-m , .gds-body-s , .gds-label-m , .gds-label-s , .gds-label-xs , .gds-label-xxs , .gds-label-m-alt , .gds-body-m-alt , .gds-body-s-alt , .gds-body-xs-alt').each(function (each) {
        // console.log("gds-label-l", this)
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });
}



// Main activation function for Gemini
export function activateGemini() {
    // Initial setup
    setGemini();
    console.log("setGemini")




    let oldText = '';
    setInterval(() => {  
        

        $('.bot-name-ugc-label ').each(function (each) {
            // console.log("gds-label-l", this)
            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }
        });


        

        $('.ql-editor').each(function (each) {
            // console.log("gds-label-l", this)
            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }
        });


    $('.ql-editor p').each(function (each) {
        const text = $(this).text();
        if (text !== oldText) {
            oldText = text;

            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('FontSet');
                $(this).addClass('AsOk');
                
                // Set text alignment based on direction
                if (direction === 'rtl') {
                    $(this).css('text-align', 'right');
                } else {
                    $(this).css('text-align', 'left');
                }
            }
        }
    });
    }, 100);




    // Function to find and observe target node
    // function findAndObserveTarget() {

        
    //     console.log("جستجو برای .ql-editor p");
    //     console.log("تعداد عناصر یافت شده:", $('.ql-editor p').length);
    //     console.log("targetNode:", targetNode);

    //     if (targetNode) {
    //         // Check if the element is active/focused
    //         const isActive = document.activeElement === targetNode || 
    //                        $(targetNode).is(':focus') || 
    //                        $(targetNode).hasClass('active') ||
    //                        $(targetNode).closest('.ql-editor').hasClass('active');
            
    //         console.log("آیا عنصر فعال است؟", isActive);
    //         console.log("activeElement:", document.activeElement);
    //         console.log("is focused:", $(targetNode).is(':focus'));
    //         console.log("has active class:", $(targetNode).hasClass('active'));
    //         console.log("parent has active class:", $(targetNode).closest('.ql-editor').hasClass('active'));

    //         if (isActive) {
    //             observer.observe(targetNode, config);
    //             console.log('targetNode found and active - observer started');
                
    //             // Test the observer by adding a test event listener
    //             $(targetNode).on('input keyup paste', function() {
    //                 console.log('تست: تغییر در input/keyup/paste تشخیص داده شد');
    //                 console.log('متن فعلی:', $(this).text());
    //             });
                
    //             return true; // Success
    //         } else {
    //             console.log('targetNode found but not active - waiting...');
    //             return false; // Not active yet
    //         }
    //     } else {
    //         console.log('targetNode not found - retrying...');
    //         return false; // Not found
    //     }
    // }

    // // Try to find target immediately
    // if (!findAndObserveTarget()) {
    //     // If not found, retry every 500ms until found
    //     const retryInterval = setInterval(() => {
    //         if (findAndObserveTarget()) {
    //             clearInterval(retryInterval); // Stop retrying once found
    //         }
    //     }, 500);
    // }






    // SetInterval for continuous processing
    setInterval(() => {
        setGemini();
    }, 1000);
}