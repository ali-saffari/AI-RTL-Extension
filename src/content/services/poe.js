// poe.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';

export function setPoeCom() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        let fo2 = `.ChatPageMainFooter_footerInner__BEj26`

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



// Main activation function for Poe
export function activatePoe() {
    setPoeCom();
}