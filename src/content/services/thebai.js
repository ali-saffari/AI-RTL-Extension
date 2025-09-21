// thebai.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';

export function setTheb() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        let fo2 = `.max-w-full .overflow-y-auto`

        if (!$(fo2).hasClass("AsOk")) {
            $(fo2).addClass("AsOk")
            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxDuckduckgo">

                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}

${BtnDonate()}



            </div>`)

            $('body').each(function (each) {
                if (!$(this).hasClass("AsDonateOk")) {
                    $(this).append(modalDonate())
                }
            })
            modalDonateFun()
        }
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

