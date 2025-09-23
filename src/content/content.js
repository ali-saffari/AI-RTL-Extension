let saffariLink = "https://chromewebstore.google.com/detail/chatgpt-rtl-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne";
let textSaffari = "امیدوارم از نسخه بهینه شده برای فارسی زبانان لذت ببرید"
// let imagePath = "images/alisaffari11.jpg";

let imagePath = "images/myLogo.png";


function modalDonateFun() {
    const modal = document.getElementById('Asmodal');
    const openBtn = document.getElementById('AsopenBtn');
    const closeBtn = document.getElementById('AscloseBtn');


    if (openBtn)
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

    if (closeBtn)
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

}


function modalDonate() {


    return `
         
            <div class="As-modal-backdrop FontSet" id="Asmodal">
  <div class="As-modal">
 <h2 style="margin-top:0; color:#e67e22;">💛 ممنون که همراه ما هستی!</h2>
   <p>
اگر از این اکستنشن خوشت اومده، می‌تونی با این سه روش از ما حمایت کنی و مارو برای به‌روزرسانی و اضافه کردن قابلیت‌های جدید دلگرم نگه داری:


</p>



<div class="As-modal-block">
    <h3 style="color:#27ae60;">💸 ۱. حمایت مالی</h3>
    
    
    <p>حمایت مالی شما به ما کمک می‌کنه تا امکانات جدید اضافه کنیم، مشکلات رو سریع‌تر برطرف کنیم و تجربه کاربری بهتری بسازیم. هر مبلغی که دوست داری، واقعاً تاثیرگذار و دلگرم‌کننده است!</p>
    <a href="https://zarinp.al/719522" target="_blank" 
      style="display:inline-block; background:#27ae60; color:#fff; padding:5px 13px; border-radius:5px; text-decoration:none; font-weight:bold;        margin-top: 11px;
">
      حمایت مالی
    </a>
    
<!--    <p><small>هر مبلغی که دوست داری، کمک بزرگیه!</small></p>-->

</div>


<div class="As-modal-block">
    <h3 style="color:#f39c12;">⭐ ۲. دادن ۵ ستاره</h3>
    <p>اگر نمی‌تونی حمایت مالی کنی، اشکالی نداره! فقط با دادن ۵ ستاره به اکستنشن، کلی دلگرمی بهمون می‌دی و نشون می‌دی که کنارمون هستی!</p>
    
       <a href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne" target="_blank" 
      style="display:inline-block; background:#27ae60; color:#fff; padding:5px 13px; border-radius:5px; text-decoration:none; font-weight:bold;       margin-top: 11px;
">
      صفحه رسمی اکستنشن
    </a>
    
    
</div>

<div class="As-modal-block">
    <h3 style="color:#2980b9;">📢 ۳. معرفی به دوستان</h3>
    <p>معرفی این اکستنشن به دوستات، بهترین کمکه که می‌تونه باعث شه ما بیشتر دیده بشیم و بتونیم بهتر و سریع‌تر پیشرفت کنیم. فقط کافیه یه لحظه وقت بذاری و بهشون خبر بدی!
باورت نمی‌شه چقدر این کار کوچک، تاثیر بزرگی داره.</p>
</div>


    <button class="As-close-btn" id="AscloseBtn">بستن</button>
  </div>
</div>

`

}


function BtnDonate() {

    return `<div class="AsSBtn AsDonate" id="AsopenBtn" style="z-index: 900">دوست داری ازش حمایت کنی ؟</div>`
}

function isPersian(str) {

    return countWords(str)

}

function getTextDirection(text) {
    // شمارش کاراکترهای فارسی و عربی
    const rtlChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || [];
    // شمارش کاراکترهای لاتین
    const ltrChars = text.match(/[A-Za-z]/g) || [];

    // اگر تعداد کاراکترهای فارسی بیشتر بود، rtl برگردان
    return rtlChars.length > ltrChars.length ? true : false;
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






function isRTL(text) {
    let dir = detectTextDirection(text)


    console.log("ALI")

    // console.log(
    //     dir , text
    // )


    if (dir === "rtl") {
        return true
    }
    return false
}

function detectTextDirection(text) {
    const rtlCharRanges = [
        [0x0590, 0x05FF], // عبری
        [0x0600, 0x06FF], // عربی و فارسی
        [0x0750, 0x077F], // عربی افزوده
        [0x08A0, 0x08FF], // عربی اضافی
        [0xFB50, 0xFDFF], // عربی نمایشی
        [0xFE70, 0xFEFF], // عربی نمایشی
    ];

    function isRTLChar(char) {
        const code = char.charCodeAt(0);
        return rtlCharRanges.some(([start, end]) => code >= start && code <= end);
    }

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 'ltr';

    // محاسبه تعداد کلمه‌ای که بررسی می‌کنیم (30% کلمات، حداقل 5 و حداکثر 10)
    let checkWordsCount = Math.ceil(words.length * 0.3);
    checkWordsCount = Math.min(Math.max(checkWordsCount, 5), 10);
    if (words.length < checkWordsCount) checkWordsCount = words.length;

    const wordsToCheck = words.slice(0, checkWordsCount);

    let rtlWordsCount = 0;
    for (const word of wordsToCheck) {
        if ([...word].some(isRTLChar)) rtlWordsCount++;
    }

    if (rtlWordsCount > checkWordsCount / 2) return 'rtl';
    if (rtlWordsCount < checkWordsCount / 2) return 'ltr';

    // اگر مساوی یا نامشخص، کل متن را بررسی کن
    let totalRTLWords = 0;
    for (const word of words) {
        if ([...word].some(isRTLChar)) totalRTLWords++;
    }

    if (totalRTLWords > words.length / 2) return 'rtl';
    else return 'ltr';
}




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

                        if (isRTL(text)) {
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

                if (isRTL(text)) {
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

                        if (isRTL(text)) {
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

                if (isRTL(text)) {
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
                    if (isRTL(text)) {
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

// function addAliSaffari() {
//
// }


function setItems_ChatGpt() {


    let presentation = ".relative.flex.h-full "
    let fo = presentation + " .isolate.w-full.basis-auto .justify-center.min-h-8.text-xs.text-token-text-secondary "
    let foTest = ".relative.flex.h-full.overflow-hidden .relative.w-full.px-2.text-center"


    // $(presentation).addClass('red');


    if (chrome.runtime?.id) {


        // relative mt-auto flex min-h-8 w-full items-center justify-center p-2 text-center text-xs text-token-text-secondary md:px-[60px]


        const alisaffari = chrome.runtime.getURL(imagePath)


        $(fo).each(function (each) {


            // $(this).addClass('red');


            if (!$(this).parent().hasClass("AsOk")) {
                $(this).parent().addClass("AsOk")
                $(this).parent().append(`<div class="AsRtl FontSet AsBox text-xs text-token-text-secondary">


         <a href="${saffariLink}" target="_blank">
                
                <img src="
${alisaffari}" alt="ali saffari">

</a>
${textSaffari}



 ${BtnDonate()}


 



            </div>`)


                $('body').each(function (each) {

                    // ${BtnDonate()}


                    if (!$(this).hasClass("AsDonateOk")) {
                        $(this).append(modalDonate())
                    }

                })
                modalDonateFun()

                // document.addEventListener("DOMContentLoaded", () => {

                // });


            }


        })


//
//
//         let fo2 = `.w-full.text-center.\\@lg\\/thread\\:absolute.\\@lg\\/thread\\:bottom-0.\\@lg\\/thread\\:left-0`
//
//
//
//         if (!$(fo2).hasClass("AsOk")) {
//             $(fo2).addClass("AsOk")
//             $(fo2).append(`<div class="AsRtl FontSet AsBox">
//
//
//          <a href="${saffariLink}" target="_blank">
//
//                 <img src="
// ${alisaffari}" alt="ali saffari">
//
// </a>
// ${textSaffari}
//             </div>`)
//
//
//         }
//


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

//

            // $(this).attr("dir", "auto");

            $(this).addClass('FontSetImportantGPT');

 const text = $(this).text()
//
 if (typeof text == "string") {
    $(this).attr("dir", detectTextDirection(text) ? "rtl" : "ltr");
}


        }


    })

    $(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function (each) {


        if (!$(this).parent().hasClass("AsOk")) {
            $(this).parent().addClass('AsOk');


            const text = $(this).text()

            $(this).addClass('FontSetImportantGPT');


            if (isRTL(text)) {

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
            $(this).addClass('FontSetImportantGPT');


        }


    })





    $("#prompt-textarea").each(function (each) {




        if (!$(this).hasClass("AsOk")) {


            $(this).addClass("AsOk")

            // $(this).addClass('FontSet');

            let lastD = false

            $(this).keyup(function () {


                const text = $(this).text()


                if (text && text !== "") {
                    if (isRTL(text)) {
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


    // /* $("#prompt-textarea").each(function (each) {
    //
    //      if (!$(this).hasClass("AsOk")) {
    //
    //
    //          $(this).addClass("AsOk")
    //
    //          // $(this).addClass('FontSet');
    //
    //          let lastD = false
    //
    //          $(this).keyup(function () {
    //
    //
    //              const text = $(this).text()
    //              console.log("textarea keypress", text);
    //
    //              if (text && text !== "") {
    //                  if (isRTL(text)) {
    //                      lastD = true
    //                      if (!$(this).hasClass("FontSet")) {
    //                          $(this).addClass('AsRtl');
    //                          $(this).addClass('FontSet');
    //                      }
    //                  } else {
    //                      if ($(this).hasClass("FontSet")) {
    //                          lastD = false
    //                          $(this).removeClass('AsRtl');
    //                          $(this).removeClass('FontSet');
    //                      }
    //                  }
    //              } else {
    //
    //                  $(this).removeClass('AsRtl');
    //                  $(this).removeClass('FontSet');
    //
    //
    //                  // if (lastD) {
    //                  //
    //                  //     if (!$(this).hasClass("FontSet")) {
    //                  //         $(this).addClass('AsRtl');
    //                  //         $(this).addClass('FontSet');
    //                  //     }
    //                  // } else {
    //                  //     if ($(this).hasClass("FontSet")) {
    //                  //
    //                  //         $(this).removeClass('AsRtl');
    //                  //         $(this).removeClass('FontSet');
    //                  //     }
    //                  // }
    //
    //              }
    //          })
    //      }
    //
    //
    //  });*/

    $('.markdown pre').each(function (each) {

        let code = $(this).find("code").text()


        let plaintext = $(this).find(".language-plaintext")


        // console.log("plaintext" , plaintext)


        if (!$(this).hasClass("AsOk")) {


            $(this).addClass('AsOk');

            let p = isRTL(code);


            if (plaintext) {

                if (isRTL(plaintext.text())) {


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
//             const alisaffari = chrome.runtime.getURL(imagePath)
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


            $('.pointer-events-none.absolute.bottom-0.flex').each(function (each) {

                // $(this).addClass('red');


                const alisaffari = chrome.runtime.getURL(imagePath)
                // const fontiran = chrome.runtime.getURL('images/fontiran-72.png')


                let fo = $(this).find(".relative.max-h-full.w-expanded-composer.max-w-chat")
                // fo.addClass("red")

                if (!fo.hasClass("AsOk")) {
                    fo.addClass("AsOk")
                    fo.parent().append(`<div class="relative max-h-full  AsBox_copilotBingBlock" style=""><div class="AsRtl FontSet AsBox AsBox_copilotBing">


         <a href="${saffariLink}" target="_blank">
                
                <img src="
${alisaffari}" alt="ali saffari">

</a>

${textSaffari}
     ${BtnDonate()}

            </div></div>`)


                    $('body').each(function (each) {

                        // ${BtnDonate()}


                        if (!$(this).hasClass("AsDonateOk")) {
                            $(this).append(modalDonate())
                        }

                    })
                    modalDonateFun()


                }


            })


        }


        // alert("sett")


    }


    let setBingInterval = () => {


        setBing()


        // اینپوت

        $('.min-h-user-input').each(function (each) {
            // console.log(each)
            if (!$(this).hasClass("CopilotFontSet")) {
                $(this).attr("dir", "auto");

                $(this).addClass('CopilotFontSet');

            }

        })


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


                if (isRTL(text + "")) {

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


        set()

        // $(".w-full.flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col.mx-auto.w-full").each(function (each) {
        //     if (each === 0) {
        //         console.log("setInterval")
        //         set()
        //
        //         const observer = new MutationObserver((mutations) => {
        //             mutations.forEach((mutation) => {
        //                 console.log("تغیر", mutation)
        //                 set()
        //
        //
        //             });
        //         });
        //
        //
        //         const targetNode = document.querySelector('div.overflow-y-scroll');
        //
        //         const config = {childList: true, subtree: true};
        //
        //         observer.observe(targetNode, config);
        //
        //         clearInterval(interval)
        //     }
        //
        //
        // });


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
${textSaffari} ${BtnDonate()}
 </div>`)


                $('body').each(function (each) {

                    // ${BtnDonate()}


                    if (!$(this).hasClass("AsDonateOk")) {
                        $(this).append(modalDonate())
                    }

                })
                modalDonateFun()


            }
        }


        $(".ProseMirror").each(function (each) {
            console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
            $(this).parent().attr("dir", "auto");


            if (!$(this).parent().hasClass("FontSet")) {
                $(this).parent().addClass('FontSet');
            }


        });


        $(".flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col  .mb-1.mt-1 ").each(function (each) {


            // $(this).addClass('red');
            const text = $(this).find(".font-user-message  p.break-words").text()
            // console.log("text", text, isPersian(text))
            if (isRTL(text)) {
                // $(this).addClass('red');
                if (!$(this).hasClass("AsRtlClaudeUser")) {
                    $(this).addClass('AsRtlClaudeUser');
                }


            }


        });


        $(".flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col > div").each(function (each) {
            console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
            $(this).attr("dir", "auto");


            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }


        });


    }


}


let setList_ChatGpt = () => {

    $('#history .__menu-item').each(function (each) {

        // $(this).addClass("red")
        // let pList = $(this).find("p,ol,ul,h3")
        const text = $(this).text()
        // console.log("text", text)
        let p = isRTL(text);


        if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {


            $(this).addClass('AsOkList');


            if (p) {

                $(this).attr("dir", "rtl");


                $(this).addClass('AsRtlList');
                $(this).addClass('FontSet');

                $(this).parent().addClass('AsRtlList_parent');

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
    //     ['chatGpt' , 'claude' ,  'copilot']


    chrome.storage.sync.onChanged.addListener((changes) => {
        const siteMap = {
            chatGpt: "chatgpt.com",
            claude: "claude.ai",
            copilot: ["copilot.microsoft.com", "bing.com", "www.bing.com"],
            thebAi: ["beta.theb.ai", "chatbot.theb.ai"],
            duckduckgo: "duckduckgo.com",
            perplexity: ["www.perplexity.ai", "perplexity.ai"],
            aiStudio: "aistudio.google.com",
            deepseek: "chat.deepseek.com",
            youCom: "you.com",
            qwenlm: ["chat.qwenlm.ai", "chat.qwen.ai"],
            poeCom: "poe.com",
            monica: "monica.im",
            gemini: "gemini.google.com",
            grok: "grok.com",
            mistral: "chat.mistral.ai",
            manus: "manus.im",
            kimi: "www.kimi.com",
            blackbox: "www.blackbox.ai"


        };

        Object.entries(siteMap).forEach(([key, urls]) => {
            if (changes[key] && (
                (Array.isArray(urls) && urls.includes(site)) ||
                urls === site
            )) {
                location.reload();
                return;
            }
        });
    });


    chrome.storage.sync.get(["blackbox"]).then((result) => {

        console.log("blackbox ok")

        if (result.blackbox) {
            if (site === "www.blackbox.ai") {


                function setBlackBox() {


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

                                // ${BtnDonate()}


                                if (!$(this).hasClass("AsDonateOk")) {
                                    $(this).append(modalDonate())
                                }

                            })
                            modalDonateFun()


                        }
                    }


                    $("body textarea").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    $(".chat-input-editor").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".whitespace-pre-wrap").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".break-words ").each(function (each) {

                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                            // $(this).css("text-align", "initial");
                        }


                    });


                }


                setBlackBox()


                let interval = setInterval(() => {


                    setBlackBox()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["kimi"]).then((result) => {


        if (result.kimi) {
            if (site === "www.kimi.com") {


                function setKimi() {


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

                                // ${BtnDonate()}


                                if (!$(this).hasClass("AsDonateOk")) {
                                    $(this).append(modalDonate())
                                }

                            })
                            modalDonateFun()


                        }
                    }


                    $("body textarea").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    $(".chat-input-editor").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".user-content").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".paragraph , .markdown *  ").each(function (each) {

                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                            // $(this).css("text-align", "initial");
                        }


                    });


                    $(".paragraph , .markdown li ").each(function (each) {

                        // $(this).attr("dir", "auto");


                        const text = $(this).text()
                        if (isRTL(text)) {
                            $(this).attr("dir", "rtl");
                            $(this).css("text-align", "right");
                        }


                        // if (!$(this).hasClass("FontSet")) {
                        //     $(this).addClass('FontSet');
                        //
                        //     //
                        // }


                    });


                }


                setKimi()


                let interval = setInterval(() => {


                    setKimi()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["manus"]).then((result) => {

        console.log("manus ok")

        if (result.manus) {
            if (site === "manus.im") {


                function setManusl() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `.flex.flex-col.sticky.bottom-0`


                        if (!$(fo2).hasClass("AsOk")) {


                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsMistral">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}
                
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
                    }


                    $("body textarea").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    $(".ProseMirror").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".whitespace-pre-wrap").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".break-words , .u-break-words ").each(function (each) {


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".whitespace-pre-wrap , .truncate , .w-full.flex.pl-4.items-end.justify-between.pb-4").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                }


                setManusl()


                let interval = setInterval(() => {


                    setManusl()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["mistral"]).then((result) => {

        console.log("mistral ok")

        if (result.mistral) {
            if (site === "chat.mistral.ai") {


                function setMistral() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `form.mb-0.rounded-xl.large-box-shadow.delay-150.w-full`


                        if (!$(fo2).hasClass("AsOk")) {


                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsMistral">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}
                
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
                    }


                    $("body textarea").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    $(".ProseMirror").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".whitespace-pre-wrap").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $(".break-words").each(function (each) {


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                }


                setMistral()


                let interval = setInterval(() => {


                    setMistral()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["grok"]).then((result) => {

        console.log("grok.com ok")

        if (result.grok) {
            if (site === "grok.com") {


                function setGrok() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `.bottom-0.absolute.mx-auto.inset-x-0`
                        // absolute bottom-0 mx-auto inset-x-0


                        // absolute bottom-0 w-full h-10 bg-background chat-input-backdrop


                        if (!$(fo2).find('.absolute.chat-input-backdrop').hasClass("AsOk")) {


                            $(fo2).find('.absolute.chat-input-backdrop').addClass("AsOk")
                            $(fo2).find('.absolute.chat-input-backdrop').hide()
                            $(fo2).find('.absolute.chat-input-backdrop').removeClass("bg-background")
                        }

                        if (!$(fo2).hasClass("AsOk")) {


                            // absolute bottom-0 w-full h-10 bg-background chat-input-backdrop


                            // $(fo2).removeClass(".bg-background")
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxgrok AsBoxGemini">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}
                
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
                    }


                    $(".message-bubble > *").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    // $(".break-words").each(function (each) {
                    //
                    //
                    //     $(this).attr("dir", "auto");
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //     }
                    //
                    //
                    // });


                    $(".text-fg-secondary").each(function (each) {


                        let t = $(this).text();

                        console.log(" tt", t)

                        if (t === "چگونه Grok میتواند کمک کd؟") {
                            $(this).text("چگونه Grok میتواند کمک کند ؟");
                        }


                    });


                    $(".bottom-0 textarea").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });

                    $(".text-sm").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    $("a.col-start-1").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).parent().hasClass("FontSetImportant")) {
                            $(this).parent().addClass('FontSetImportant');
                        }


                    });


                }


                setGrok()


                let interval = setInterval(() => {


                    setGrok()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["gemini"]).then((result) => {

        // console.log("Sdfsdfsdfsdfsdfsdf")

        if (result.gemini) {
            if (site === "gemini.google.com") {

                console.log(":ssssssssssssssssss")


                function setGemini() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `.capabilities-disclaimer`


                        if (!$(fo2).hasClass("AsOk")) {
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxGemini">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}

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
                    }


                    $('.markdown , .user-query-container , .conversation-title ').each(function (each) {


                        $(this).addClass('FontSet');

                    })


                    $('.gds-label-m-alt ').each(function (each) {


                        $(this).addClass('FontSet');

                    })

                    $('.textarea').each(function (each) {

                        $(this).attr("dir", "auto");
                        $(this).addClass('FontSetImportant');
                        $(this).css("unicode-bidi", "normal");
                    })


                    //
                    //
                    // $('.markdown--UqDin').each(function (each) {
                    //
                    //     if (!$(this).hasClass("AsOk")) {
                    //         $(this).addClass('AsOk');
                    //         $(this).attr("dir", "auto");
                    //         $(this).css("text-align", "initial");
                    //     }
                    //
                    //
                    //
                    //
                    // })
                    //


                }


                setGemini()


                let interval = setInterval(() => {


                    setGemini()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["monica"]).then((result) => {

        // console.log("Sdfsdfsdfsdfsdfsdf")

        if (result.monica) {
            if (site === "monica.im") {


                function setMonica() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `.input-wrapper--oYXfL`


                        if (!$(fo2).parent().hasClass("AsOk")) {
                            $(fo2).parent().addClass("AsOk")
                            $(fo2).parent().append(`<div class="AsRtl FontSet AsBox AsBoxMonica">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}

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
                    }


                    $('body').each(function (each) {


                        $(this).addClass('FontSet');

                    })


                    $('textarea').each(function (each) {

                        $(this).attr("dir", "auto");
                        $(this).addClass('FontSetImportant');

                    })


                    $('.markdown--UqDin').each(function (each) {

                        if (!$(this).hasClass("AsOk")) {
                            $(this).addClass('AsOk');
                            $(this).attr("dir", "auto");
                            $(this).css("text-align", "initial");
                        }


                    })


                    // .textarea--JX_6f.textarea--JX_6f.textarea-primary--OH3BL


                    // $(".GrowingTextArea_textArea__ZWQbP , .ResendRemixFollowupButton_right__du4Gd ").each(function (each) {
                    //
                    //
                    //     $(this).attr("dir", "auto");
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //
                    //     }
                    //
                    //
                    // });
                    //
                    //
                    //
                    //
                    // $(".Message_messageTextContainer__w64Sc").each(function (each) {
                    //
                    //
                    //     $(this).attr("dir", "auto");
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //     }
                    //
                    //
                    // });


                }


                setMonica()


                let interval = setInterval(() => {


                    setMonica()


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["poeCom"]).then((result) => {

        // console.log("Sdfsdfsdfsdfsdfsdf")

        if (result.poeCom) {
            if (site === "poe.com") {


                function setPoeCom() {


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

                                // ${BtnDonate()}


                                if (!$(this).hasClass("AsDonateOk")) {
                                    $(this).append(modalDonate())
                                }

                            })
                            modalDonateFun()


                        }
                    }


                    $(".GrowingTextArea_textArea__ZWQbP , .ResendRemixFollowupButton_right__du4Gd ").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                        }


                    });


                    $(".Message_messageTextContainer__w64Sc").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                }


                setPoeCom()


                let interval = setInterval(() => {


                    setPoeCom()


                }, 1000)


            }


        }

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
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `.bottom-safeAreaInsetBottom .pointer-events-auto`

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
                        const alisaffari = chrome.runtime.getURL(imagePath)

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
                    }


                    // فرستنده
                    $(".IwPq3HoxJc8guGUBwTKv").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    //جواب
                    $(".ucB71mHYvyHsWKjYfYKI").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    //اینپوت

                    $(".JRDRiEf5NPKWK43sArdC").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                            $(this).addClass('FontSetImportant');

                        }


                    });


                    //لیست
                    $(".clS_s3a7onj0_NFty2Qh").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
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


                function setDeepSeek() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)


                        // صفحه شروع جت
                        let fo2 = `._0fcaa63._7941d9f`

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


// صفحه چت
                        let fo3 = `._0fcaa63`


                        if (!$(fo3).hasClass("AsOk")) {
                            $(fo3).addClass("AsOk")
                            $(fo3).parent().append(`<div class="AsRtl FontSet AsBox AsBoxDuckduckgo">

         <a href="${saffariLink}" target="_blank">
           
                <img src="
${alisaffari}" alt="ali saffari">
</a>
${textSaffari}${BtnDonate()}
            </div>`)
                            $('body').each(function (each) {

                                // ${BtnDonate()}


                                if (!$(this).hasClass("AsDonateOk")) {
                                    $(this).append(modalDonate())
                                }

                            })
                            modalDonateFun()

                        }


                    }


                    // لیست
                    $("._83421f9").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        const text = $(this).text()
                        // console.log("text", text)
                        let p = isRTL(text);


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                        if (p) {
                            $(this).addClass('AsOkRList');
                        }

                        //
                        // if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {
                        //
                        //
                        //     $(this).addClass('AsOkList');
                        //
                        //     if (p) {
                        //         $(this).addClass('AsRtlList');
                        //         $(this).addClass('FontSet');
                        //
                        //         $(this).parent().addClass('AsRtlList_parent');
                        //
                        //     } else {
                        //         // backD = false
                        //     }
                        //
                        // }
                        //
                        //
                        // let absoluteItem = $(this).parent().parent().find(".absolute.bottom-0")
                        //
                        //
                        // if (!absoluteItem.hasClass("AsOk")) {
                        //
                        //
                        //     absoluteItem.addClass('AsOk');
                        //
                        //
                        //     if (p) {
                        //         absoluteItem.addClass('AsOkList_absolute');
                        //     }
                        //
                        //
                        // }
                        //


                    });


                    //پاسخ
                    $("._4f9bf79 .ds-markdown").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    //سوال
                    $("._9663006").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        // $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    // اینپوت
                    $("._24fad49").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    // تینگ
                    $(".e1675d8b").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    // هدر
                    $(".f8d1e4c0").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    // اینپوت داخل چت
                    $(".ds-textarea__textarea").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                        }


                    });


                    //
                    //
                    // $(".JRDRiEf5NPKWK43sArdC").each(function (each) {
                    //     // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                    //     $(this).attr("dir", "auto");
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
                        const alisaffari = chrome.runtime.getURL(imagePath)

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

                            if (isRTL(this.textContent)) {
                                rtl++
                                // $(this).attr("dir", "rtl");

                            }

                        });

                        if (rtl) {
                            $(this).attr("dir", "rtl");
                        }

                        console.log("rtl , rtl", rtl)


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


    chrome.storage.sync.get(["youCom"]).then((result) => {

        // console.log("Sdfsdfsdfsdfsdfsdf")

        if (result.youCom) {
            if (site === "you.com") {


                function setYouCom() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `#ChatQueryBar`


                        if (!$(fo2).hasClass("AsOk")) {
                            $(fo2).addClass("AsOk")
                            $(fo2).append(`<div class="AsRtl FontSet AsBox AsBoxDuckduckgo">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}


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
                    }


                    //هدر
                    $(".ebfm092").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    //عنوان
                    $("._1bxvbd41").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $("._1vwisb38 , ._1vwisb37 , ._1vwisb34 , ._1vwisb33 ").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $(".gdhZwr").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $(".hEYYiC").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $(".suggested-chat-chip").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                        }


                    });


                    $(".fQvrap").each(function (each) {


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $(".fQvrap textarea").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $("textarea").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                            $(this).addClass('FontSetImportant');
                        }


                    });


                    $(".AnswerParser_AnswerParserSharedStyles__0GZUj").each(function (each) {
                        // console.log("asdasdasdasdasdasdadasdasdasdasdasdad")
                        $(this).attr("dir", "auto");


                    });


                    $(".AnswerParser_TextContainer__z_Iiv ,.AnswerParser_AnswerParserUnorderedList__P_1FW ,.AnswerParser_AnswerParserH4__ghxg8").each(function (each) {


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('AlignSet');
                        }


                    });


                }


                setYouCom()


                let interval = setInterval(() => {

                    // $(".AppProvider_Wrapper").each(function (each) {
                    //     if (each === 0) {
                    //         console.log("setInterval")
                    //
                    //
                    //         const observer = new MutationObserver((mutations) => {
                    //             mutations.forEach((mutation) => {
                    // console.log("تغیر", mutation)
                    setYouCom()

                    //
                    //             });
                    //         });
                    //
                    //
                    //         const targetNode = document.querySelector('.AppProvider_Wrapper');
                    //
                    //         const config = {childList: true, subtree: true};
                    //
                    //         observer.observe(targetNode, config);
                    //
                    //
                    //         clearInterval(interval)
                    //     }
                    //
                    // });


                }, 1000)


            }


        }

    });


    chrome.storage.sync.get(["qwenlm"]).then((result) => {

        // console.log("Sdfsdfsdfsdfsdfsdf")

        if (result.qwenlm) {
            if (site === "chat.qwenlm.ai" || site === "chat.qwen.ai") {


                function setQwenlm() {


                    if (chrome.runtime?.id) {
                        const alisaffari = chrome.runtime.getURL(imagePath)

                        let fo2 = `.chat-message-input`


                        if (!$(fo2).parent().hasClass("AsOk")) {
                            $(fo2).parent().addClass("AsOk")
                            $(fo2).parent().parent().append(`<div style="z-index: 900" class="AsRtl FontSet AsBox AsBoxDuckduckgo AsBoxqwenlm">


                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}
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
                    }


                    // $(".gdhZwr").each(function (each) {
                    //
                    //     $(this).attr("dir", "auto");
                    //
                    //
                    //     if (!$(this).hasClass("FontSet")) {
                    //         $(this).addClass('FontSet');
                    //
                    //     }
                    //
                    //
                    // });

                    $(".chat-assistant , .user-message , #chat-input").each(function (each) {


                        $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                        }


                    });


                    $(".chat-item-drag").each(function (each) {


                        // $(this).attr("dir", "auto");

                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');

                        }


                    });


                    $(".font-primary ,.scrollbar-hidden").each(function (each) {


                        if (!$(this).hasClass("FontSet")) {
                            $(this).addClass('FontSet');
                            $(this).addClass('FontSetImportant');

                        }


                    });
                    // $("#response-content-container").each(function (each) {
                    //
                    //     $(this).attr("dir", "auto");
                    //
                    //
                    // });


                }


                setQwenlm()


                let interval = setInterval(() => {

                    // $(".AppProvider_Wrapper").each(function (each) {
                    //     if (each === 0) {
                    //         console.log("setInterval")
                    //
                    //
                    //         const observer = new MutationObserver((mutations) => {
                    //             mutations.forEach((mutation) => {
                    // console.log("تغیر", mutation)
                    setQwenlm()

                    //
                    //             });
                    //         });
                    //
                    //
                    //         const targetNode = document.querySelector('.AppProvider_Wrapper');
                    //
                    //         const config = {childList: true, subtree: true};
                    //
                    //         observer.observe(targetNode, config);
                    //
                    //
                    //         clearInterval(interval)
                    //     }
                    //
                    // });


                }, 1000)


            }


        }

    });


});

