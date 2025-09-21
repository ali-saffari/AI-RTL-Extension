// claude.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isPersian, detectTextDirection } from '../utils/textDirection.js';

// Claude service functions
export function setItems_Claude() {
    let interval = setInterval(() => {
        set()
    }, 500)

    function set() {
        if (chrome.runtime?.id) {
            const alisaffari = chrome.runtime.getURL(imagePath)

            let fo2 = `.sticky fieldset.flex.flex-col .items-stretch.transition-all`

            if (!$(fo2).hasClass("AsOk")) {
                $(fo2).addClass("AsOk")
                $(fo2).parent().append(`<div class="AsRtl FontSet AsBox AsBoxClaude">

                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                امیداورم از نسخه بهینه شده برای فارسی زبانان لذت ببرید.




            </div>`)

                $('body').each(function (each) {
                    if (!$(this).hasClass("AsDonateOk")) {
                        $(this).append(modalDonate())
                    }
                })
                modalDonateFun()
            }
        }

        $('[data-testid="conversation-turn-3"]').each(function (each) {
            if (!$(this).hasClass("AsRtlClaudeUser")) {
                $(this).addClass('AsRtlClaudeUser');
                $(this).attr("dir", "auto");
            }
        })
    }
}

// Main activation function for Claude
export function activateClaude() {
    setItems_Claude();
}

