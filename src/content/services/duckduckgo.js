// duckduckgo.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';

export function setDuckduckgo() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        let fo2 = `.eRjZTOsvr6gqJe3E2Yc6`

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
            const text = $(this).val() || $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
        }
    })

    $("body p").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
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

