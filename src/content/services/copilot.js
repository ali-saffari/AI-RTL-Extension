// copilot.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord , analyzeTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced , setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const ELEMENT_OPTIONS = {
    fontClass: 'CopilotFontSet',
    processedClass: 'AsOk'
};

function applyCopilotFont() {
    if (!AQ('#copilot-font-style').length) {
        AQ(`<style id="copilot-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            code, pre, kbd, samp, code *, pre * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
        </style>`).appendTo('head');
    }

    AQ('body').each(function () {
        if (!AQ(this).hasClass('CopilotFontSet')) {
            AQ(this).addClass('CopilotFontSet');
        }
    });

    AQ(ICON_SELECTOR).removeClass('CopilotFontSet FontSet');
}


// Copilot/Bing service functions
export function setItems_copilotBing(rtlAlgorithm) {
    let fo = `.relative.max-h-full.w-expanded-composer.max-w-chat`
    console.log("setItems_copilotBing")

    applyCopilotFont();

    if (chrome.runtime?.id) {
        // Add copyright using utility function
        const targetElement = AQ(fo);
        // targetElement.addClass("red")

        if (targetElement.length > 0) {
            addCopyright(targetElement, 'AsBox_copilotBing AsBoxB', 'transform: scale(0.75); margin-top: 5px; padding: 0px;');
        }
    }

    // Process all text elements using processTextElementsAdvanced
    AQ('[data-content="ai-message"] .break-words').each(function (each) {
    
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'CopilotFontSet',
            processedClass: 'AsOk',
            isContainer: true,
            // skipTags: ['span']
        });
           
    });

    AQ('[data-content="user-message"], [data-content="user-message"] .break-words').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, ELEMENT_OPTIONS);
    });

    AQ('[role="link"]').each(function () {
        if (AQ(this).is(ICON_SELECTOR)) {
            return;
        }

        const text = AQ(this).text();
        if (!text || !text.trim()) {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, ELEMENT_OPTIONS);
    });

        // Process listbox options for text direction detection
        AQ('[role="listbox"] [role="option"]').each(function (each) {
            const text = AQ(this).text();
            if (text && text.trim()) {
                applyRtlToElement(this, rtlAlgorithm, {
                    ...ELEMENT_OPTIONS,
                    rtlClass: 'listboxRtlCopilot'
                });
            }
        });


    // Process textarea elements for text direction detection
    AQ('textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'CopilotFontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'CopilotFontSet',
            });
        });
    });

    applyCopilotFont();


    
    // AQ('.hljs-comment').each(function (each) {
    //     const $element = AQ(this);
        
    //     // اگر قبلاً پردازش شده، رد شو
    //     if ($element.hasClass('AsOk')) {
    //         return;
    //     }
        
    //     // علامت‌گذاری به عنوان پردازش شده
    //     $element.addClass('AsOk');
        
    //     // دریافت متن
    //     let text = $element.text() || $element.html() || '';
        
    //     if (!text || !text.trim()) {
    //         return;
    //     }
        
    //     const originalText = text.trim();
    //     let commentPrefix = '';
    //     let commentSuffix = '';
    //     let cleanedText = originalText;

    //     console.log("cleanedText:", cleanedText);
        
    //     // شناسایی و ذخیره علامت کامنت از ابتدا
    //     if (cleanedText.startsWith('///')) {
    //         // کامنت‌های سه‌خطی (مثل /// در C#)
    //         commentPrefix = '///';
    //         cleanedText = cleanedText.replace(/^\/\/\/\s*/, '');
            
    //         // برای کامنت‌های چندخطی با ///، حذف /// از ابتدای هر خط
    //         const lines = cleanedText.split('\n');
    //         const cleanedLines = lines.map(line => {
    //             // حذف /// از ابتدای خط (با فاصله‌های اختیاری)
    //             return line.replace(/^\s*\/\/\/\s*/, '').trim();
    //         });
    //         cleanedText = cleanedLines.join('\n').trim();
    //     } else if (cleanedText.startsWith('//')) {
    //         commentPrefix = '//';
    //         cleanedText = cleanedText.replace(/^\/\/\s*/, '');
    //     } else if (cleanedText.startsWith('/*')) {
    //         commentPrefix = '/*';
    //         if (cleanedText.endsWith('*/')) {
    //             commentSuffix = '*/';
    //             // حذف /* از ابتدا و */ از انتها
    //             cleanedText = cleanedText.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '');
                
    //             // برای کامنت‌های چندخطی، حذف * از ابتدای هر خط
    //             const lines = cleanedText.split('\n');
    //             const cleanedLines = lines.map(line => {
    //                 // حذف * از ابتدای خط (با فاصله‌های اختیاری)
    //                 return line.replace(/^\s*\*\s*/, '').trim();
    //             });
    //             cleanedText = cleanedLines.join('\n').trim();
    //         } else {
    //             cleanedText = cleanedText.replace(/^\/\*\s*/, '');
    //             // حذف * از ابتدای هر خط
    //             const lines = cleanedText.split('\n');
    //             const cleanedLines = lines.map(line => {
    //                 return line.replace(/^\s*\*\s*/, '').trim();
    //             });
    //             cleanedText = cleanedLines.join('\n').trim();
    //         }
    //     } else if (cleanedText.startsWith('#')) {
    //         commentPrefix = '#';
    //         cleanedText = cleanedText.replace(/^#\s*/, '');
    //     } else if (cleanedText.startsWith('<!--')) {
    //         commentPrefix = '<!--';
    //         if (cleanedText.endsWith('-->')) {
    //             commentSuffix = '-->';
    //             cleanedText = cleanedText.replace(/^<!--\s*/, '').replace(/\s*-->$/, '');
    //         } else {
    //             cleanedText = cleanedText.replace(/^<!--\s*/, '');
    //         }
    //     } else if (cleanedText.startsWith('--')) {
    //         commentPrefix = '--';
    //         cleanedText = cleanedText.replace(/^--\s*/, '');
    //     } else if (cleanedText.startsWith('%')) {
    //         commentPrefix = '%';
    //         cleanedText = cleanedText.replace(/^%\s*/, '');
    //     } else if (cleanedText.startsWith(';')) {
    //         commentPrefix = ';';
    //         cleanedText = cleanedText.replace(/^;\s*/, '');
    //     }
        
    //     // حذف فاصله‌های اضافی
    //     cleanedText = cleanedText.trim();
        
    //     // اگر بعد از حذف کامنت‌ها متنی باقی ماند، بررسی راست‌چین بودن
    //     if (cleanedText && cleanedText.length > 0) {
    //         const direction = analyzeTextDirection(cleanedText);
            
    //         if (direction === 'rtl') {
    //             // اگر علامت کامنت وجود دارد، آن را در سمت چپ نگه دار
    //             if (commentPrefix) {
    //                 // برای کامنت‌های چندخطی، باید خطوط را حفظ کنیم
    //                 const isMultiline = cleanedText.includes('\n');
                    
    //                 if (isMultiline && commentPrefix === '/*') {
    //                     // برای کامنت‌های چندخطی، هر خط را جداگانه پردازش می‌کنیم
    //                     const lines = cleanedText.split('\n');
    //                     const processedLines = lines.map((line, index) => {
    //                         const trimmedLine = line.trim();
    //                         // برای خط اول، علامت /* را اضافه می‌کنیم
    //                         if (index === 0) {
    //                             if (!trimmedLine) {
    //                                 return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">/*</span>`;
    //                             }
    //                             return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">/*</span> <span dir="rtl" class="FontSet">${trimmedLine}</span>`;
    //                         }
    //                         // برای خط آخر، علامت */ را اضافه می‌کنیم
    //                         if (index === lines.length - 1) {
    //                             if (!trimmedLine) {
    //                                 return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">*/</span>`;
    //                             }
    //                             return `<span dir="rtl" class="FontSet">${trimmedLine}</span> <span dir="ltr" style="unicode-bidi: embed; display: inline-block;">*/</span>`;
    //                         }
    //                         // برای خطوط میانی
    //                         if (!trimmedLine) {
    //                             return '';
    //                         }
    //                         return `<span dir="rtl" class="FontSet">${trimmedLine}</span>`;
    //                     });
    //                     // فیلتر کردن خطوط خالی و join کردن با <br>
    //                     const htmlContent = processedLines.filter(line => line !== '').join('<br>');
    //                     $element.html(htmlContent);
    //                 } else if (isMultiline && commentPrefix === '///') {
    //                     // برای کامنت‌های سه‌خطی چندخطی، هر خط را جداگانه پردازش می‌کنیم
    //                     const lines = cleanedText.split('\n');
    //                     const processedLines = lines.map((line) => {
    //                         const trimmedLine = line.trim();
    //                         if (!trimmedLine) {
    //                             return '';
    //                         }
    //                         return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">///</span> <span dir="rtl" class="FontSet">${trimmedLine}</span>`;
    //                     });
    //                     // فیلتر کردن خطوط خالی و join کردن با <br>
    //                     const htmlContent = processedLines.filter(line => line !== '').join('<br>');
    //                     $element.html(htmlContent);
    //                 } else {
    //                     // برای کامنت‌های تک خطی
    //                     const prefixSpan = `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">${commentPrefix}</span>`;
    //                     const contentSpan = `<span dir="rtl" class="FontSet">${cleanedText}</span>`;
    //                     const suffixSpan = commentSuffix ? `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">${commentSuffix}</span>` : '';
    //                     const htmlContent = prefixSpan + ' ' + contentSpan + suffixSpan;
    //                     $element.html(htmlContent);
    //                 }
    //             } else {
    //                 // اگر علامت کامنت نداریم، فقط dir را تنظیم کن
    //                 $element.attr('dir', 'rtl');
    //                 $element.addClass('FontSet');
    //             }
    //         }
    //     }
    // });



}



// Main activation function for Copilot
export function activateCopilot(rtlAlgorithm = 'advanced_full') {
    console.log("activateCopilot with RTL algorithm:", rtlAlgorithm);
    setItems_copilotBing(rtlAlgorithm);

    setInterval(() => {
        setItems_copilotBing(rtlAlgorithm);
    }, 1000);
}

