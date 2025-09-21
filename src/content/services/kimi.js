// kimi.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

// Kimi service functions
export function setKimi() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        let fo2 = `.chat-action`

        if (!$(fo2).hasClass("AsOk")) {
            $(fo2).addClass("AsOk")
            $(fo2).append(`<div style="display: flex">
<div class="AsRtl FontSet AsBox AsKimi">

                <a href="${saffariLink}" style="margin-bottom: 10px" target="_blank">

              <img src="${alisaffari}" alt="ali saffari" style="vertical-align: middle;"></a>



                ${textSaffari}
                
                    ${BtnDonate()}




            </div>
</div>`)

            $('body').each(function (each) {
                if (!$(this).hasClass("AsDonateOk")) {
                    $(this).append(modalDonate())
                }
            })
            modalDonateFun()
        }
    }

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



// Main activation function for Kimi
export function activateKimi() {
    setKimi();
}