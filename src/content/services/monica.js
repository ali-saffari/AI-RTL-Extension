// monica.js service functions
import { addCopyright } from '../utils/copyright.js';

export function setMonica() {
    if (chrome.runtime?.id) {
        let fo2 = `.input-wrapper--oYXfL`
        addCopyright($(fo2).parent(), 'AsBoxMonica');
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



// Main activation function for Monica
export function activateMonica() {
    setMonica();
}