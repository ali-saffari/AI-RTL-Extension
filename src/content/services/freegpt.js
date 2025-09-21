// freegpt.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isRTL } from '../utils/analyzeDirection.js';

// FreeGPT service functions
export function setItems_freegpt() {


    if (chrome.runtime?.id) {

        const alisaffari = chrome.runtime.getURL(imagePath)
        // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')


        let fo = "main.flex.h-full .absolute.bottom-0.left-0.w-full .px-3.pt-2.pb-3.text-center"


        // $(fo).addClass("red")


        if (!$(fo).hasClass("AsOk")) {
            $(fo).addClass("AsOk")
            $(fo).append(`<div class="AsRtl FontSet AsBox">


                <a href="${saffariLink}" target="_blank"><img src="
${alisaffari}" alt="ali saffari"></a>


               ${textSaffari}



<!--               <a class="AsSBtn" href="https://alisaffari.ir/supporters-of-rtl-chatgpt-extension/">حامیان</a>-->
<!--              -->
<!--              -->

${BtnDonate()}


            </div>`)


            $('body').each(function (each) {

                // ${BtnDonate()}


                if (!$(this).hasClass("AsDonateOk")) {
                    $(this).append(modalDonate())
                }

            })
            modalDonateFun()

        }


        $('.flex.h-full[role="presentation"] .h-full .w-full.text-token-text-primary').each(function (each) {

            if (!$(this).hasClass("AsRtl")) {
                $(this).addClass('AsRtl');
            }

            const pList = $(this).find('p');

            pList.each(function () {

                if (isRTL($(this).text())) {

                    $(this).css('direction', 'rtl');
                    $(this).css('text-align', 'right');

                } else {

                    $(this).css('direction', 'ltr');
                    $(this).css('text-align', 'left');

                }

            });

        });


        $(".flex main.h-full .group.w-full").each(function (each) {

            if (!$(this).hasClass("AsRtl")) {
                $(this).addClass('AsRtl');
            }

            const pList = $(this).find('p');

            pList.each(function () {

                if (isRTL($(this).text())) {

                    $(this).css('direction', 'rtl');
                    $(this).css('text-align', 'right');

                } else {

                    $(this).css('direction', 'ltr');
                    $(this).css('text-align', 'left');

                }

            });

        });


        $("textarea").each(function (each) {

            if (!$(this).hasClass("AsRtl")) {
                $(this).addClass('AsRtl');
            }

            $(this).keyup(function () {

                if (isRTL($(this).val())) {

                    $(this).css('direction', 'rtl');
                    $(this).css('text-align', 'right');

                } else {

                    $(this).css('direction', 'ltr');
                    $(this).css('text-align', 'left');

                }

            });

        });

    }

}

// Main activation function for FreeGPT
export function activateFreegpt() {
    setItems_freegpt();
}

