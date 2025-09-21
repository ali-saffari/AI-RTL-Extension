// blackbox.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

// BlackBox service functions
export function setBlackBox() {
    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        let fo2 = `.relative.min-w-40.mx-auto.px-6.pb-4 > .px-4`

        if (!$(fo2).hasClass("AsOk")) {
            $(fo2).addClass("AsOk")
            $(fo2).append(`
<div class="AsRtl FontSet AsBox AsKimi">

                <a href="${saffariLink}" style="margin-bottom: 10px" target="_blank">

              <img src="${alisaffari}" alt="ali saffari" style="vertical-align: middle;"></a>



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



// Main activation function for Blackbox
export function activateBlackbox() {
    setBlackBox();
}