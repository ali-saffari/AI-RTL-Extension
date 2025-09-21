// aistudio.js service functions
import { isRTL } from '../utils/textDirection.js';
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
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }

        let rtl = 0;

        $(this).find("p").each(function (each) {
            if (isRTL(this.textContent)) {
                rtl++;
            }
        });

        if (rtl) {
            $(this).attr("dir", "rtl");
        }
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