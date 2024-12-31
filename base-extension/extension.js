let saffariLink = "http://alisaffari.ir/";
let textSaffari = "امیداورم از نسخه بهینه شده برای فارسی زبانان لذت ببرید"

function isPersian(str) {

    return countWords(str)

}


function countChars(str) {
    let rightToLeft = 0;
    let leftToRight = 0;

    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);

        // Check if the character is right-to-left or left-to-right
        if ((charCode >= 0x0590 && charCode <= 0x05FF) || // Hebrew
            (charCode >= 0x0600 && charCode <= 0x06FF) || // Arabic
            (charCode >= 0x0700 && charCode <= 0x08FF) || // Syriac
            (charCode >= 0x08A0 && charCode <= 0x08FF) || // Arabic Extended-A
            (charCode >= 0xFB1D && charCode <= 0xFDFF) || // Hebrew Presentation Forms
            (charCode >= 0xFE70 && charCode <= 0xFEFF)) { // Arabic Presentation Forms
            rightToLeft++;
        } else {
            leftToRight++;
        }
    }


    return {rightToLeft, leftToRight};
}


function countWords(text) {
    // جدا کردن کلمات از متن


    if (typeof text == "boolean") {
        return false;
    }
    const words = text.split(" ");

    let leftCount = 0;
    let rightCount = 0;

    for (let i = 0; i < words.length; i++) {
        if (i < 5) {

            const word = words[i]
            let a = 1;
            if (i === 0) {
                a = 10
            }
            if (i === 1) {
                a = 7
            }
            if (i > 1 && i > 4) {
                a = 5
            }


            if (word && word !== "") {

                const x = countChars(word);
                if (x.rightToLeft > x.leftToRight) {
                    rightCount += a;
                } else {
                    leftCount += a;
                }
            }
        }
    }


    // console.log({
    //     text ,
    //     rightCount, leftCount
    // })

    if (rightCount > leftCount) {
        return true;
    } else {
        return false;
    }

}


function setItems_freegpt() {


    if (chrome.runtime?.id) {

        const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')
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



            </div>`)


        }

    }


    $('.flex.h-full[role="presentation"] .h-full .w-full.text-token-text-primary').each(function (each) {


        let pList = $(this).find("p,ol,ul")
        let streaming = $(this).find(".result-streaming")

        if (pList.length) {

            let backD = false
            pList.each(function () {


                // $(this).p
                if (!$(this).hasClass("AsOk") || streaming.length) {
                    $(this).addClass('AsOk');


                    if ($(this).prop('nodeName') === "P") {

                        const text = $(this).text()

                        if (isPersian(text)) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                            backD = true
                        } else {
                            backD = false
                        }

                    } else {
                        if (backD) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    }

                }
            });

        } else {

            const D = $(this).find(".flex.flex-grow.flex-col.max-w-full")


            if (!D.hasClass("AsOk") || streaming.length) {
                D.addClass('AsOk');

                const text = D.text()

                if (isPersian(text)) {
                    D.addClass('AsRtl');
                    D.addClass('FontSet');
                }

            }


        }

    })


    $(".flex main.h-full .group.w-full").each(function (each) {


        let pList = $(this).find("p,ol,ul")
        let streaming = $(this).find(".result-streaming")

        if (pList.length) {


            let backD = false
            pList.each(function () {


                // $(this).p
                if (!$(this).hasClass("AsOk") || streaming.length) {
                    $(this).addClass('AsOk');


                    if ($(this).prop('nodeName') === "P") {

                        const text = $(this).text()

                        if (isPersian(text)) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                            backD = true
                        } else {
                            backD = false
                        }

                    } else {
                        if (backD) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    }

                }
            });

        } else {

            const D = $(this).find(".items-start")


            if (!D.hasClass("AsOk") || streaming.length) {
                D.addClass('AsOk');

                const text = D.text()

                if (isPersian(text)) {
                    D.addClass('AsRtl');
                    D.addClass('FontSet');
                }

            }


        }


    });


    $("textarea").each(function (each) {

        if (!$(this).hasClass("AsOk")) {


            $(this).addClass("AsOk")

            let lastD = false

            $(this).keyup(function () {


                const text = $(this).text()
                console.log("textarea keypress", text);

                if (text && text !== "") {
                    if (isPersian(text)) {
                        lastD = true
                        if (!$(this).hasClass("AsRtl")) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    } else {
                        if ($(this).hasClass("AsRtl")) {
                            lastD = false
                            $(this).removeClass('AsRtl');
                            $(this).removeClass('FontSet');
                        }
                    }
                } else {
                    if (lastD) {

                        if (!$(this).hasClass("AsRtl")) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    } else {
                        if ($(this).hasClass("AsRtl")) {

                            $(this).removeClass('AsRtl');
                            $(this).removeClass('FontSet');
                        }
                    }

                }
            })
        }


    });

}


// function addAliSaffari() {
//
// }


function setItems_ChatGpt() {


    let presentation = ".relative.flex.h-full.overflow-hidden "
    let fo = presentation + " .relative.text-center .min-h-4 div"
    let foTest = ".relative.flex.h-full.overflow-hidden .relative.w-full.px-2.text-center"

    if (chrome.runtime?.id) {

        const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')
        // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')


        // $(foTest).addClass("red")


        if (!$(fo).parent().hasClass("AsOk")) {
            $(fo).parent().addClass("AsOk")
            $(fo).parent().append(`<div class="AsRtl FontSet AsBox">


         <a href="${saffariLink}" target="_blank">
                
                <img src="
${alisaffari}" alt="ali saffari">

</a>
${textSaffari}
            </div>`)


        }

    }


    // $('.flex.h-full[role="presentation"] .h-full .w-full.text-token-text-primary').each(function (each) {
    //
    //     $(this).addClass('FontSet');
    //
    //     let pList = $(this).find(".relative.rounded-3xl")
    //
    //
    //     if (pList.length) {
    //
    //
    //         pList.each(function () {
    //
    //             // $(this).addClass('red')
    //
    //             if (!$(this).hasClass("AsOk")) {
    //                 $(this).addClass('AsOk');
    //
    //
    //                 const text = $(this).text()
    //
    //                 if (isPersian(text)) {
    //
    //                     // let BoxSend =     $(this).find('.relative.rounded-3xl')
    //                     // if (   $(this).length) {
    //                     $(this).parent().addClass("setRight")
    //                     $(this).addClass('FontSet');
    //                     // }
    //
    //                 }
    //
    //
    //             }
    //         });
    //
    //     }
    //
    // })


    $(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function (each) {


        if (!$(this).parent().hasClass("AsOk")) {
            $(this).parent().addClass('AsOk');


            const text = $(this).text()

            if (isPersian(text)) {

                // let BoxSend =     $(this).find('.relative.rounded-3xl')
                // if (   $(this).length) {
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


        }


    })


    //
    // $(presentation + '#prosemirror-editor-container .pointer-events-none.relative').each(function (each) {
    //
    //
    //
    //
    //     if (!$(this).parent().hasClass("AsOk")) {
    //         $(this).parent().addClass('AsOk');
    //
    //         $(this).attr("dir", "left");
    //
    //     }
    //
    //
    // })


    // $(presentation + ' .h-full .w-full.text-token-text-primary').each(function (each) {
    //
    //
    //     let streaming = $(this).find(".result-streaming")
    //
    //     if (streaming && streaming.length) {
    //
    //     } else {
    //         let mx_auto = $(this).find(".mx-auto")
    //
    //         let message = $(this).find(".text-message")
    //
    //
    //         if (message.css("direction") === 'rtl') {
    //             mx_auto.addClass('AsRtl_rowReverse')
    //
    //         }
    //     }
    //
    //     // }
    //
    // })

    //
    $("#prompt-textarea").each(function (each) {

        if (!$(this).hasClass("AsOk")) {


            $(this).addClass("AsOk")

            // $(this).addClass('FontSet');

            let lastD = false

            $(this).keyup(function () {


                const text = $(this).text()
                console.log("textarea keypress", text);

                if (text && text !== "") {
                    if (isPersian(text)) {
                        lastD = true
                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    } else {
                        if ($(this).hasClass("FontSet")) {
                            lastD = false
                            $(this).removeClass('AsRtl');
                            $(this).removeClass('FontSet');
                        }
                    }
                } else {

                    $(this).removeClass('AsRtl');
                    $(this).removeClass('FontSet');


                    // if (lastD) {
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('AsRtl');
                    //         $(this).addClass('FontSet');
                    //     }
                    // } else {
                    //     if ($(this).hasClass("FontSet")) {
                    //
                    //         $(this).removeClass('AsRtl');
                    //         $(this).removeClass('FontSet');
                    //     }
                    // }

                }
            })
        }


    });

    $('.markdown pre').each(function (each) {

        let code = $(this).find("code").text()


        let plaintext = $(this).find(".language-plaintext")


        // console.log("plaintext" , plaintext)


        if (!$(this).hasClass("AsOk")) {


            $(this).addClass('AsOk');

            let p = isPersian(code);


            if (plaintext) {

                if (isPersian(plaintext.text())) {


                    $(this).find("[dir=ltr]").attr("dir", "rtl").addClass('FontSet')

                    // $(this).find("[dir=ltr]").addClass('FontSet');
                    $(this).find("code").addClass('FontSet');
                }


            }

            if (p) {


                $(this).addClass('AsSetRtl');
                // $(this).addClass('FontSet');


            } else {
                $(this).addClass('AsSetLtr');
                // backD = false
            }

        }


    })


}


function setItems_copilotBing() {


    let fo = `[role="complementary"]`
    console.log("setItems_copilotBing")


    // var url = new URL(window.location);
    // let params = url.searchParams;
    // let lang = params.get("setlang");
    //
    //
    // console.log("lang", lang)


//     setInterval(() => {
// //
//         if (chrome.runtime?.id && lang === 'fa') {
//             const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')
// //                 // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')
// //
// //
//             let fo2 = `[role="complementary"]`
//
//             console.log("adddddd")
//
// //
// //
// //                 $(fo2).addClass("red")
// //
// //
//             if (!$(fo2).hasClass("AsOk")) {
//                 $(fo2).addClass("AsOk")
//                 $(fo2).append(`<div class="AsRtl FontSet AsBox AsBinBox">
//
//
//                 <a href="${saffariLink}" target="_blank">
//
//               <img src="${alisaffari}" alt="ali saffari"></a>
//
//
//
//                 امیداورم از نسخه بهینه شده برای فارسی زبانان لذت ببرید.
//
//
//
//
//
//             </div>`)
//
//
// //
//             }
//         }
// //
//     }, 1000)

    function setBing() {
        var r = document.querySelector(':root');


        if (chrome.runtime?.id) {


            $('.pointer-events-none.absolute.bottom-0.flex.w-full').each(function (each) {

                // $(this).addClass('red');


                const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')
                // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')


                // $(foTest).addClass("red")


                let fo = $(this).find(".relative.mb-4.flex.w-full.flex-col.items-center")


                if (!$(this).hasClass("AsOk")) {
                    $(this).addClass("AsOk")
                    fo.append(`<div class="relative max-h-full  AsBox_copilotBingBlock" style=""><div class="AsRtl FontSet AsBox AsBox_copilotBing">


         <a href="${saffariLink}" target="_blank">
                
                <img src="
${alisaffari}" alt="ali saffari">

</a>

${textSaffari}

            </div></div>`)


                }


            })


        }


        // alert("sett")


    }


    let setBingInterval = () => {


        setBing()


        $('.space-y-3').each(function (each) {
            // console.log(each)
            if (!$(this).hasClass("CopilotFontSet")) {
                $(this).attr("dir", "auto");

                $(this).addClass('CopilotFontSet');

            }

        })

        $('.t-table th, .t-table td').each(function (each) {


            let text = $(this).text()


            if (!$(this).hasClass("AsOk")) {


                $(this).addClass('AsOk');


                if (isPersian(text + "")) {

                    $(this).addClass('AsAlignRtl');


                }

                // else if (/^\d+$/.test(text)) {
                //     $(this).addClass('AsAlignC');
                // }


            }

        })


    }


    setInterval(() => {
        setBingInterval()
    }, 1000)
    setBingInterval()


    setBing()


    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {


            if (mutation.type === 'attributes') {

                // $('.BinFarsiBtn').remove()
                // $(fo).removeClass("AsOk_BinFarsiBtn")

                // setBing()


                // if ($(mutation.target).hasClass("b_sydConvMode")) {
                //
                //     setTimeout(() => {
                //         $('.BinFarsiBtn').remove()
                //         // $(fo).removeClass("AsOk_BinFarsiBtn")
                //         setBing()
                //     }, 500)
                //
                //
                // } else {
                //     $('.BinFarsiBtn').remove()
                //     // $(fo).removeClass("AsOk_BinFarsiBtn")
                //
                // }

            }

        });
    });


    const targetNode = document.querySelector('body');

    const config = {attributes: true};

    observer.observe(targetNode, config);
}


function setItems_Claude() {


    let interval = setInterval(() => {

        $(".w-full.flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col.mx-auto.w-full").each(function (each) {
            if (each === 0) {
                console.log("setInterval")
                set()

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        console.log("تغیر", mutation)
                        set()


                    });
                });


                const targetNode = document.querySelector('div.overflow-y-scroll');

                const config = {childList: true, subtree: true};

                observer.observe(targetNode, config);

                clearInterval(interval)
            }


        });


    }, 200)


    function set() {


        if (chrome.runtime?.id) {
            const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')

            let fo2 = `.sticky .flex.flex-col`

            console.log("adddddd")

//
//
//                 $(fo2).addClass("red")
//
//
            if (!$(fo2).hasClass("AsOk")) {
                $(fo2).addClass("AsOk")
                $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxClaude">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>
${textSaffari}
 </div>`)


            }
        }


        $(".w-full.flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col.mx-auto.w-full > div").each(function (each) {
            console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
            $(this).attr("dir", "auto");


            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }


        });


        $(".w-full.flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col.mx-auto.w-full > div .mb-1.mt-1").each(function (each) {


            const text = $(this).find(".font-user-message  p.break-words").text()
            // console.log("text", text, isPersian(text))
            if (isPersian(text)) {
                // $(this).addClass('red');
                if (!$(this).hasClass("AsRtlClaudeUser")) {
                    $(this).addClass('AsRtlClaudeUser');
                }


            }


            //
            // let dir = console.log("dddd", $(this).css("direction"))
            //
            //
            // $(this).addClass('FontSet');
            //
            //
            // let Block = this;
            // let user_message = $(this).find(".font-user-message")
            //
            //
            // if (user_message.length) {
            //
            //
            //     const m4 = $(this).find(".mt-4")
            //
            //     const text = m4.find(".font-user-message  p.break-words").text()
            //     console.log("text", text, isPersian(text))
            //
            //
            //     if (isPersian(text)) {
            //         m4.addClass('red');
            //         m4.addClass('AsRtl_rowReverse')
            //         m4.addClass(text)
            //     }
            //
            //
            //     //
            //     // if (dir === 'rtl') {
            //     //
            //     //     $(this).find(".mt-4").addClass('red');
            //     //     $(this).find(".mt-4").addClass('AsRtl_rowReverse')
            //     //     // $(this).addClass('FontSet');
            //     // }
            //
            //
            // }


        });

    }

    // setInterval(() => {
    //     console.log("sss")
    //
    //
    //     set()
    //
    //
    // }, 500)


}


let setList_ChatGpt = () => {

    $('.bg-token-sidebar-surface-primary nav ol li .relative.grow.overflow-hidden').each(function (each) {

        // $(this).addClass("red")
        // let pList = $(this).find("p,ol,ul,h3")
        const text = $(this).text()
        // console.log("text", text)
        let p = isPersian(text);


        if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {


            $(this).addClass('AsOkList');

            if (p) {
                $(this).addClass('AsRtlList');
                $(this).addClass('FontSet');
            } else {
                // backD = false
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
$(document).ready(function () {


    let site = window.location.host;

    console.log("site", site)

    function active_chatGpt() {


        if (site === "chatgpt.com") {


            setInterval(() => {
                setItems_ChatGpt()

                // !overflow-visible

                setList_ChatGpt()


            }, 1000)


            // addAliSaffari()
            setItems_ChatGpt()
            setList_ChatGpt()


            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    console.log("تغیر")


                    setTimeout(() => {
                        setItems_ChatGpt()
                    }, 80)
                });
            });
            const observerB = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    console.log("تغیر B")


                    setTimeout(() => {


                        setList_ChatGpt()


                    }, 100)
                });
            });


            const targetNode = document.querySelector('main.relative.h-full.w-full');

            const config = {attributes: true, childList: true, subtree: true};

            observer.observe(targetNode, config);


            const targetNodeB = document.querySelector('.bg-token-sidebar-surface-primary');

            const configB = {attributes: true, childList: true, subtree: true};

            observerB.observe(targetNodeB, configB);


        }


    }


    // console.log("site", site)
    //     ['chatGpt' , 'claude' ,  'copilot' ,  'freegpt']


    chrome.storage.sync.onChanged.addListener((changes) => {

        console.log(changes)

        if (changes.chatGpt && site === "chatgpt.com") location.reload();
        if (changes.claude && site === "claude.ai") location.reload();
        if (changes.copilot && (site === "copilot.microsoft.com" || site === "bing.com" || site === "www.bing.com")) location.reload();
        if (changes.freegpt && (site === "freegpt.one" || site === "freegpt.cc")) location.reload();
        if (changes.thebAi && (site === "beta.theb.ai" || site === "chatbot.theb.ai")) location.reload();
        if (changes.duckduckgo && site === "duckduckgo.com") location.reload();

        if (changes.perplexity && (site === "www.perplexity.ai" || site === "perplexity.ai")) location.reload();


        if (changes.aiStudio && site === "aistudio.google.com") location.reload();

        if (changes.deepseek && site === "chat.deepseek.com") location.reload();





    });


    chrome.storage.sync.get(["chatGpt"]).then((result) => {

        if (result.chatGpt) {
            active_chatGpt()
        }


    });


    chrome.storage.sync.get(["claude"]).then((result) => {

        if (result.claude) {
            if (site === "claude.ai") {

                setItems_Claude()
            }
        }


    });
    chrome.storage.sync.get(["copilot"]).then((result) => {

        if (result.copilot) {
            if (site === "copilot.microsoft.com" || site === "bing.com" || site === "www.bing.com") {

                setItems_copilotBing()
            }
        }


    });

    chrome.storage.sync.get(["freegpt"]).then((result) => {


        if (result.freegpt) {
            if (site === "freegpt.one" || site === "freegpt.cc") {
                setItems_freegpt()
                // addAliSaffari()
            }


            setInterval(() => {

                if (site === "freegpt.one" || site === "freegpt.cc") {
                    setItems_freegpt()
                    // addAliSaffari()
                }


                // if (site === "chatgpt.com" ) {
                //     setItems_ChatGpt()
                //
                //
                //
                //
                //     // addAliSaffari()
                // }
                //


            }, 1000)

        }

    });


    chrome.storage.sync.get(["thebAi"]).then((result) => {


        if (result.thebAi) {
            if (site === "beta.theb.ai" || site === "chatbot.theb.ai") {


                function setTheb() {


                    $(".overflow-y-auto .whitespace-pre-wrap.break-words.flex-col").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    $(".overflow-y-auto .markdown.overflow-x-auto.prose").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                }


                setTheb()

                let interval = setInterval(() => {

                    $(".max-w-full .overflow-y-auto").each(function (each) {
                        if (each === 0) {
                            console.log("setInterval")


                            const observer = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    // console.log("تغیر", mutation)
                                    setTheb()


                                });
                            });


                            const targetNode = document.querySelector('.max-w-full div.overflow-y-auto');

                            const config = {childList: true, subtree: true};

                            observer.observe(targetNode, config);


                            $('.history .scrollbar-test .relative.mt-2').each(function (each) {
                                $(this).attr("dir", "auto");


                                if (!$(this).hasClass("FontSet")) {
                                    $(this).addClass('FontSet');
                                }

                            })
                            const observerB = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    console.log("تغیر B")


                                    setTimeout(() => {


                                        $('.history .scrollbar-test .relative.mt-2').each(function (each) {
                                            $(this).attr("dir", "auto");


                                            if (!$(this).hasClass("FontSet")) {
                                                $(this).addClass('FontSet');
                                            }

                                        })
                                    }, 100)
                                });
                            });


                            const targetNodeB = document.querySelector('.history');

                            const configB = {attributes: true, childList: true, subtree: true};

                            observerB.observe(targetNodeB, configB);


                            clearInterval(interval)
                        }


                    });


                }, 200)


                setInterval(() => {


                }, 1000)
            }


        }

    });


    chrome.storage.sync.get(["perplexity"]).then((result) => {


        console.log("site", site)

        if (result.perplexity) {
            if ((site === "www.perplexity.ai" || site === "perplexity.ai")) {
                console.log("setPerplexity")


                function setPerplexity() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')

                        let fo2 = `.bottom-mobileNavHeight .pointer-events-auto`

                        console.log("adddddd")

//
//
//                 $(fo2).addClass("red")
//
//
                        if (!$(fo2).hasClass("AsOk")) {
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxPerplexity bg-background dark:bg-backgroundDark">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}





            </div>`)


                        }
                    }


                    //
                    $(".kOMSj8TE0LBty6yatos7").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".JXNYs5FNOplxLlVAOswQ").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".mx-auto.h-full.w-full.max-w-threadWidth .text-3xl").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('FontSetImportant2');


                        }


                    });

                    $(".mx-auto.h-full.w-full.max-w-threadWidth .items .font-sans").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('FontSetImportant2');
                            $(this).removeClass('text-left');
                        }


                    });

                    $("body").each(function (each) {


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('FontSetPerplexity');
                        }


                    });


                    $(".text-left.font-sans").each(function (each) {
                        $(this).removeClass('text-left');
                        $(this).attr("dir", "auto");
                    });
                    $(".group.flex.cursor-pointer.items-center.justify-between.py-sm").each(function (each) {
                        $(this).attr("dir", "auto");
                    });


                    $(".grow.block .w-full ").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");

                        // $(this).addClass('red');


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                            $(this).addClass('FontSetImportant');

                        }


                    });

                    // mx-auto size-full sm:max-w-screen-md sm:px-md md:px-lg


                    // $("body").each(function (each) {
                    //     // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                    //     // $(this).attr("dir", "auto");
                    //
                    //     // $(this).addClass('red');
                    //
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //
                    //         $(this).addClass('FontSetImportant');
                    //
                    //     }
                    //
                    //
                    // });


                    // $(".overflow-y-auto .markdown.overflow-x-auto.prose").each(function (each) {
                    //     // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                    //     $(this).attr("dir", "auto");
                    //
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //     }
                    //
                    //
                    // });


                }


                setPerplexity()


                let interval = setInterval(() => {


                    setPerplexity()


                    // $("body").each(function (each) {
                    //     if (each === 0) {
                    //         console.log("setInterval")
                    //
                    //
                    //         const observer = new MutationObserver((mutations) => {
                    //             mutations.forEach((mutation) => {
                    //                 // console.log("تغیر", mutation)
                    //                 setPerplexity()
                    //
                    //
                    //             });
                    //         });
                    //
                    //
                    //         const targetNode = document.querySelector('body');
                    //
                    //         const config = {childList: true, subtree: true};
                    //
                    //         observer.observe(targetNode, config);
                    //
                    //
                    //         clearInterval(interval)
                    //     }
                    //
                    //
                    // });


                }, 200)


            }


        }

    });


    chrome.storage.sync.get(["duckduckgo"]).then((result) => {


        if (result.duckduckgo) {
            if (site === "duckduckgo.com") {


                function setDuckduckgo() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')

                        let fo2 = `.eRjZTOsvr6gqJe3E2Yc6`

                        console.log("adddddd")

//
//
//                 $(fo2).addClass("red")
//
//
                        if (!$(fo2).hasClass("AsOk")) {
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxDuckduckgo">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}





            </div>`)


                        }
                    }


                    //
                    $(".kOMSj8TE0LBty6yatos7").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".JXNYs5FNOplxLlVAOswQ").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".JRDRiEf5NPKWK43sArdC").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                            $(this).addClass('FontSetImportant');

                        }


                    });


                    // $(".overflow-y-auto .markdown.overflow-x-auto.prose").each(function (each) {
                    //     // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                    //     $(this).attr("dir", "auto");
                    //
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //     }
                    //
                    //
                    // });


                }


                setDuckduckgo()


                let interval = setInterval(() => {

                    $(".is-duckchat").each(function (each) {
                        if (each === 0) {
                            console.log("setInterval")


                            const observer = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    // console.log("تغیر", mutation)
                                    setDuckduckgo()


                                });
                            });


                            const targetNode = document.querySelector('.is-duckchat');

                            const config = {childList: true, subtree: true};

                            observer.observe(targetNode, config);


                            clearInterval(interval)
                        }


                    });


                }, 200)


            }


        }

    });






    chrome.storage.sync.get(["deepseek"]).then((result) => {

        // console.log("Sdfsdfsdfsdfsdfsdf")

        if (result.deepseek) {
            if (site === "chat.deepseek.com") {

                // console.log(":ssssssssssssssssss")


                function setDeepSeek() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')

                        let fo2 = `.cbcaa82c`

                        // console.log("adddddd")

//
//
//                 $(fo2).addClass("red")
//
//
                        if (!$(fo2).hasClass("AsOk")) {
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxDuckduckgo">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}





            </div>`)


                        }
                    }


                    //
                    $(".f9bf7997").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });
                    $(".fa81").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        // $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });




                    $(".fad49dec").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".JRDRiEf5NPKWK43sArdC").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                            $(this).addClass('FontSetImportant');

                        }


                    });


                    // $(".overflow-y-auto .markdown.overflow-x-auto.prose").each(function (each) {
                    //     // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                    //     $(this).attr("dir", "auto");
                    //
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //     }
                    //
                    //
                    // });


                }


                setDeepSeek()


                let interval = setInterval(() => {

                    $("#root").each(function (each) {
                        if (each === 0) {
                            console.log("setInterval")


                            const observer = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    // console.log("تغیر", mutation)
                    setDeepSeek()


                                });
                            });


                            const targetNode = document.querySelector('#root');

                            const config = {childList: true, subtree: true};

                            observer.observe(targetNode, config);


                            clearInterval(interval)
                        }

                    });


                }, 200)


            }


        }

    });


    chrome.storage.sync.get(["aiStudio"]).then((result) => {


        if (result.aiStudio) {
            if (site === "aistudio.google.com") {


                function setAiStudio() {


                    console.log("sdfsdfsdf")

                    // console.log("$(this).text()" , $(this).text())



                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')

                        let fo2 = `.app-prompts footer`

                        console.log("adddddd")

//
//
//                 $(fo2).addClass("red")
//
//
                        if (!$(fo2).hasClass("AsOk")) {
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxDuckduckgo">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}





            </div>`)


                        }
                    }



                    $("ms-chat-turn").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');


                            // console.log(this.textContent)

                            // console.log(this.innerText, "innerText")


                            // if ( isPersian($(this).text())) {
                            //
                            //     $(this).attr("dir", "rtl");
                            //
                            // }


                            // $(this).addClass('FontSetImportant');

                        }


                    });


                    $("ms-text-chunk").each(function (each) {
                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }

                        // $(this).attr("dir", "rtl");


                        let rtl = 0


                        $(this).find("p").each(function (each) {

                            if (isPersian(this.textContent)) {
                                rtl++
                                // $(this).attr("dir", "rtl");

                            }

                        });

                        if (rtl) {
                            $(this).attr("dir", "rtl");
                        }

                        console.log("rtl , rtl"  , rtl)


                    });


                    $("ms-text-chunk textarea").each(function (each) {
                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('FontSetImportant2');
                            $(this).attr("dir", "auto");

                        }



                    });




                    //
                    // $("ms-text-chunk ul,ms-text-chunk span").each(function (each) {
                    //
                    //
                    //     console.log("ul this.textContent" , this.textContent , isPersian(this.textContent))
                    //
                    //
                    //
                    //
                    //
                    //     if (isPersian(this.textContent)) {
                    //     //
                    //         $(this).attr("dir", "rtl");
                    //     //
                    //     }
                    //
                    // });





                }


                setAiStudio()


                let interval = setInterval(() => {

                    // $(".is-duckchat").each(function (each) {
                    //     if (each === 0) {
                    //         console.log("setInterval")
                    //
                    //
                    //         const observer = new MutationObserver((mutations) => {
                    //             mutations.forEach((mutation) => {
                    //                 // console.log("تغیر", mutation)
                    setAiStudio()
                    //
                    //
                    //             });
                    //         });
                    //
                    //
                    //         const targetNode = document.querySelector('.is-duckchat');
                    //
                    //         const config = {childList: true, subtree: true};
                    //
                    //         observer.observe(targetNode, config);
                    //
                    //
                    //         clearInterval(interval)
                    //     }
                    //
                    //
                    // });


                }, 1000)


            }


        }

    });


});

