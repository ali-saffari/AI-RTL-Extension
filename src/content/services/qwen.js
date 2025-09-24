// qwen.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setQwenlm() {
    if (chrome.runtime?.id) {
       
        // let fo2 = `.chat-message-input`
        // addCopyright($(fo2).parent().find('.z-\[999\].w-full'), 'AsBoxQwen');


              let fo2 = `.chat-message-input-container.in-chat`
         addCopyright($(fo2), 'AsBoxQwen AsBoxB' ,`margin-top: 11px; margin-bottom: -5px; transform: scale(0.9);`);


    }






    $(".chat-assistant , .user-message , #chat-input").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text() || $(this).val();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).addClass('FontSet');
        }
    });


    $(".chat-item-drag").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text() || $(this).val();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).addClass('FontSet');
        }
    });
    

    $(".markdown-prose").each(function (each) {
 
        
        processTextElementsAdvanced($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
        });


    });


    $(".font-primary ,.scrollbar-hidden").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text() || $(this).val();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).addClass('FontSet');
        }
    });

}



// Main activation function for Qwen
export function activateQwen() {
    setQwenlm();

    setInterval(() => {
        setQwenlm();
    }, 1000);
}