// duckduckgo.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

export function setDuckduckgo() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        // Add service-specific implementation here
        console.log("duckduckgo service initialized");
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

// Main activation function for DuckDuckGo
export function activateDuckduckgo() {
    // Initial setup
    setDuckduckgo();

    // SetInterval and Observer
    let interval = setInterval(() => {
        $(".is-duckchat").each(function (each) {
            if (each === 0) {
                console.log("setInterval");
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        setDuckduckgo();
                    });
                });
                const targetNode = document.querySelector('.is-duckchat');
                const config = {childList: true, subtree: true};
                observer.observe(targetNode, config);
                clearInterval(interval);
            }
        });
    }, 1000);
}

