// thebai.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

export function setTheb() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        // Add service-specific implementation here
        console.log("thebai service initialized");
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

// Main activation function for ThebAI
export function activateTheb() {
    // Initial setup
    setTheb();

    // SetInterval and Observer
    let interval = setInterval(() => {
        $(".max-w-full .overflow-y-auto").each(function (each) {
            if (each === 0) {
                console.log("setInterval");
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        setTheb();
                    });
                });
                const targetNode = document.querySelector('.max-w-full div.overflow-y-auto');
                const config = {childList: true, subtree: true};
                observer.observe(targetNode, config);
                clearInterval(interval);
            }
        });
    }, 1000);
}

