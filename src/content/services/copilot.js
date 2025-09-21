// copilot.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

// Copilot/Bing service functions
export function setItems_copilotBing() {
    let fo = `[role="complementary"]`
    console.log("setItems_copilotBing")

    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        if (!$(fo).hasClass("AsOk")) {
            $(fo).addClass("AsOk")
            $(fo).append(`<div class="relative max-h-full  AsBox_copilotBingBlock" style=""><div class="AsRtl FontSet AsBox AsBox_copilotBing">

                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                امیداورم از نسخه بهینه شده برای فارسی زبانان لذت ببرید.




            </div></div>`)

            $('body').each(function (each) {
                if (!$(this).hasClass("AsDonateOk")) {
                    $(this).append(modalDonate())
                }
            })
            modalDonateFun()
        }
    }

    $('.cib-message-content').each(function (each) {
        if (!$(this).hasClass("CopilotFontSet")) {
            $(this).addClass('CopilotFontSet');
            $(this).attr("dir", "auto");
        }
    })

    $('.cib-message-content p').each(function (each) {
        if (!$(this).hasClass("CopilotFontSet")) {
            $(this).addClass('CopilotFontSet');
            $(this).attr("dir", "auto");
        }
    })
}

export function setBing() {
    $('.cib-message-content').each(function (each) {
        if (!$(this).hasClass("CopilotFontSet")) {
            $(this).addClass('CopilotFontSet');
            $(this).attr("dir", "auto");
        }
    })
}

// Main activation function for Copilot
export function activateCopilot() {
    setItems_copilotBing();
    setBing();
}

