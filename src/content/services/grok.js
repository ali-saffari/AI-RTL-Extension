// grok.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

export function setGrok() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        // Add service-specific implementation here
        console.log("grok service initialized");
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



// Main activation function for Grok
export function activateGrok() {
    setGrok();
}