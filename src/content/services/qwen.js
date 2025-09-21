// qwen.js service functions
import { addCopyright } from '../utils/copyright.js';

export function setQwenlm() {
    if (chrome.runtime?.id) {
        let fo2 = `.flex.flex-col.sticky.bottom-0`
        addCopyright($(fo2).parent().parent(), 'AsBoxQwen');
    }

    // Add RTL functionality
    $("body textarea").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            $(this).attr("dir", "auto");
        }
    })

    $("body p").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            $(this).attr("dir", "auto");
        }
    })
}



// Main activation function for Qwen
export function activateQwen() {
    setQwenlm();
}