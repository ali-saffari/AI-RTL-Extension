let saffariLink = "http://alisaffari.ir/";


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


                امیداورم از نسخه راست چین و بهینه شده برای فارسی زبانان لذت ببرید. 



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

              امیداورم از نسخه راست چین و بهینه شده برای فارسی زبانان لذت ببرید. 


       


<!--               <a class="AsSBtn" href="https://alisaffari.ir/supporters-of-rtl-chatgpt-extension/">حامیان</a>-->
<!--              -->
<!--              -->



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


    $(presentation + ' .h-full .w-full.text-token-text-primary').each(function (each) {


        let streaming = $(this).find(".result-streaming")

        if (streaming && streaming.length) {

        } else {
            let mx_auto = $(this).find(".mx-auto")

            let message = $(this).find(".text-message")


            if (message.css("direction") === 'rtl') {
                mx_auto.addClass('AsRtl_rowReverse')

            }
        }

        // }

    })

    //
    $("textarea").each(function (each) {

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
                            // $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    } else {
                        if ($(this).hasClass("FontSet")) {
                            lastD = false
                            // $(this).removeClass('AsRtl');
                            $(this).removeClass('FontSet');
                        }
                    }
                } else {
                    if (lastD) {

                        if (!$(this).hasClass("FontSet")) {
                            // $(this).addClass('AsRtl');
                            $(this).addClass('FontSet');
                        }
                    } else {
                        if ($(this).hasClass("FontSet")) {

                            // $(this).removeClass('AsRtl');
                            $(this).removeClass('FontSet');
                        }
                    }

                }
            })
        }


    });


}


function setItems_copilotBing() {


    let fo = `[role="complementary"]`


    var url = new URL(window.location);
    let params = url.searchParams;
    let lang = params.get("setlang");


    console.log("lang", lang)


    setInterval(() => {
//
        if (chrome.runtime?.id && lang === 'fa') {
            const alisaffari = chrome.runtime.getURL('images/alisaffari11.jpg')
//                 // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')
//
//
            let fo2 = `[role="complementary"]`

            console.log("adddddd")

//
//
//                 $(fo2).addClass("red")
//
//
            if (!$(fo2).hasClass("AsOk")) {
                $(fo2).addClass("AsOk")
                $(fo2).append(`<div class="AsRtl FontSet AsBox AsBinBox">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                امیداورم از نسخه بهینه شده برای فارسی زبانان لذت ببرید.





            </div>`)


//
            }
        }
//
    }, 1000)

    function setBing() {
        var r = document.querySelector(':root');


        if (chrome.runtime?.id) {


            const icon = chrome.runtime.getURL('images/icon-32.png')
            // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')


            if (lang === 'fa') {

                $('.BinFarsiBtn').remove()
                $(fo).removeClass("AsOk_BinFarsiBtn")
                r.style.setProperty('--cib-font-text', 'iranyekan, sans-serif');

                $(fo).prepend(`<span id="langChange" class="FontSet BinFarsiBtn langdisp b_hide farsiOk">
         

               <a class="AsSBtn" href="${saffariLink}" target="_blank"> 
                
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#c8e6c9" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path><path fill="#4caf50" d="M34.586,14.586l-13.57,13.586l-5.602-5.586l-2.828,2.828l8.434,8.414l16.395-16.414L34.586,14.586z"></path>
</svg>
                

        <img src="
${icon}" alt="ali saffari">
</a>
              
              



            </span>`)


            } else {


                // if (lang) {
                //     url.searchParams.set('form', 'LGWQS2');
                var url = new URL(window.location);
                url.searchParams.set('setlang', 'fa');
                // } else {
                //     url.searchParams.append('setlang', 'fa');
                // }

                if (!$(fo).hasClass("AsOk_BinFarsiBtn")) {
                    $(fo).addClass("AsOk_BinFarsiBtn")
                    $(fo).prepend(`<span id="langChange" class="FontSet BinFarsiBtn langdisp b_hide ">
         

               <a class="AsSBtn" href="${url.href}"> 
                
                فارسی (بهینه)
                

        <img src="
${icon}" alt="ali saffari">
</a>
              
              



            </span>`)


                }


            }


            // url.searchParams.append('setlang', 'fa')


// If your expected result is "http://foo.bar/?x=1&y=2&x=42";

// // If your expected result is "http://foo.bar/?x=42&y=2"
//                 url.searchParams.set('x', 42);


        }


        // alert("sett")


    }


    var r = document.querySelector(':root');
    var rs = getComputedStyle(r);
    let font = rs.getPropertyValue('--cib-font-text')


    if (font) {
        setBing()
    }

    //


    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {


            if (mutation.type === 'attributes') {

                // $('.BinFarsiBtn').remove()
                // $(fo).removeClass("AsOk_BinFarsiBtn")


                if ($(mutation.target).hasClass("b_sydConvMode")) {

                    setTimeout(() => {
                        $('.BinFarsiBtn').remove()
                        $(fo).removeClass("AsOk_BinFarsiBtn")
                        setBing()
                    }, 500)


                } else {
                    $('.BinFarsiBtn').remove()
                    $(fo).removeClass("AsOk_BinFarsiBtn")

                }

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

            let fo2 = `.w-full.sticky .flex.flex-col.flex-1`

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



                امیداورم از نسخه بهینه شده برای فارسی زبانان لذت ببرید.





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


        $(".w-full.flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col.mx-auto.w-full > div .mt-4").each(function (each) {


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


$(document).ready(function () {


    let site = window.location.host;


    function active_chatGpt() {


        if (site === "chatgpt.com") {


            setInterval(() => {
                setItems_ChatGpt()

                $('.bg-token-sidebar-surface-primary nav ol li:not(.AsOkList)').each(function (each) {

                    // $(this).addClass("red")
                    // let pList = $(this).find("p,ol,ul,h3")
                    const text = $(this).text()
                    console.log("text", text)


                    if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {


                        $(this).addClass('AsOkList');

                        if (isPersian(text)) {
                            $(this).addClass('AsRtlList');
                            $(this).addClass('FontSet');
                        } else {
                            // backD = false
                        }

                    }


                })



            }, 1000)


            // addAliSaffari()
            setItems_ChatGpt()

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


                        $('.bg-token-sidebar-surface-primary nav ol li:not(.AsOkList)').each(function (each) {

                            // $(this).addClass("red")
                            // let pList = $(this).find("p,ol,ul,h3")
                            const text = $(this).text()
                            console.log("text", text)


                            if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {


                                $(this).addClass('AsOkList');

                                if (isPersian(text)) {
                                    $(this).addClass('AsRtlList');
                                    $(this).addClass('FontSet');
                                } else {
                                    // backD = false
                                }

                            }


                        })

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





                            $('.history .scrollbar-test > div').each(function (each) {
                                $(this).attr("dir", "auto");


                                if (!$(this).hasClass("FontSet")) {
                                    $(this).addClass('FontSet');
                                }

                            })

                            const observerB = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    console.log("تغیر B")


                                    setTimeout(() => {


                                        $('.history .scrollbar-test > div').each(function (each) {
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




});

