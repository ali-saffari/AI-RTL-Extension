// ChatGPT service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { isRTL, detectTextDirection } from '../utils/textDirection.js';

export function initializeChatGptElements() {
    let presentation = ".relative.flex.h-full "
    let fo = presentation + " .isolate.w-full.basis-auto .justify-center.min-h-8.text-xs.text-token-text-secondary "
    let foTest = ".relative.flex.h-full.overflow-hidden .relative.w-full.px-2.text-center"

    if (chrome.runtime?.id) {
        const alisaffari = chrome.runtime.getURL(imagePath)

        $(fo).each(function (each) {
            if (!$(this).parent().hasClass("AsOk")) {
                $(this).parent().addClass("AsOk")
                $(this).parent().append(`<div class="AsRtl FontSet AsBox text-xs text-token-text-secondary">
         <a href="${saffariLink}" target="_blank">
                <img src="${alisaffari}" alt="ali saffari">
</a>
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
        })
    }

    $('.hljs-comment').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            $(this).attr("dir", "auto");
        }
    })

    $('.text-message').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            $(this).addClass('FontSetImportantGPT');
            const text = $(this).text()
            if (typeof text == "string") {
                $(this).attr("dir", detectTextDirection(text));
            }
        }
    })

    $(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function (each) {
        if (!$(this).parent().hasClass("AsOk")) {
            $(this).parent().addClass('AsOk');
            const text = $(this).text()
            $(this).addClass('FontSetImportantGPT');
            if (isRTL(text)) {
                $(this).parent().addClass("setRight")
            }
        }
    })

    $('body').each(function (each) {
        $(this).addClass('FontSet');
    })

    $(presentation).each(function (each) {
        $(this).addClass('FontSet');
    })

    $(presentation + '#prosemirror-editor-container').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            $(this).attr("dir", "auto");
            $(this).addClass('flex-row-reverse');
            $(this).addClass('FontSetImportantGPT');
        }
    })

    $("#prompt-textarea").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            $(this).attr("dir", "auto");
            $(this).addClass('FontSetImportantGPT');
        }
    })
}

export function initializeChatGptHistory() {
    $('#history .__menu-item').each(function (each) {
        const text = $(this).text()
        let p = isRTL(text);

        if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {
            $(this).addClass('AsOkList');

            if (p) {
                $(this).attr("dir", "rtl");
                $(this).addClass('AsRtlList');
                $(this).addClass('FontSet');
                $(this).parent().addClass('AsRtlList_parent');
            }
        }

        let absoluteItem = $(this).parent().parent().find(".absolute.bottom-0")

        if (!absoluteItem.hasClass("AsOk")) {
            absoluteItem.addClass('AsOk');

            if (p) {
                absoluteItem.addClass('AsOkList_absolute');
            }
        }
    })
}

// Main activation function for ChatGPT
export function activateChatGptRTL() {
    // Initial setup
    initializeChatGptElements();
    initializeChatGptHistory();

    // SetInterval for periodic updates
    setInterval(() => {
        initializeChatGptElements();
        initializeChatGptHistory();
    }, 1000);

    // MutationObserver for content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log("تغیر");
            setTimeout(() => {
                initializeChatGptElements();
            }, 80);
        });
    });

    const observerB = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log("تغیر B");
            setTimeout(() => {
                initializeChatGptHistory();
            }, 100);
        });
    });

    const targetNode = document.querySelector('main.relative.h-full.w-full');
    const config = {attributes: true, childList: true, subtree: true};
    
    if (targetNode) {
        observer.observe(targetNode, config);
    } else {
        console.log('targetNode not found - observer not started');
    }

    const targetNodeB = document.querySelector('.bg-token-sidebar-surface-primary');
    const configB = {attributes: true, childList: true, subtree: true};
    
    if (targetNodeB) {
        observerB.observe(targetNodeB, configB);
    } else {
        console.log('targetNodeB not found - observerB not started');
    }
}

