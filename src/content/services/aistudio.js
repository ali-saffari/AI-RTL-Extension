// aistudio.js service functions
import { 
    analyzeTextDirection
} from '../utils/analyzeDirection.js';
import { 
    processTextElementsAdvanced,
    processTablesInContainer,
    getAttributeTextElements,
    setTextDirectionAndFont
} from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';



// Recurring tasks that need to run periodically
export function setAiStudio() {
    // Add copyright to footer sections
    if (chrome.runtime?.id) {
        let fo2 = `section footer`;
        addCopyright(AQ(fo2), 'AsBoxB', 'margin-top: 14px');
    }

    


    AQ('.hljs-comment').each(function (each) {
        const $element = AQ(this);
        
        // اگر قبلاً پردازش شده، رد شو
        if ($element.hasClass('AsOk')) {
            return;
        }
        
        // علامت‌گذاری به عنوان پردازش شده
        $element.addClass('AsOk');
        
        // دریافت متن
        let text = $element.text() || $element.html() || '';
        
        if (!text || !text.trim()) {
            return;
        }
        
        const originalText = text.trim();
        let commentPrefix = '';
        let commentSuffix = '';
        let cleanedText = originalText;
        
        // شناسایی و ذخیره علامت کامنت از ابتدا
        if (cleanedText.startsWith('///')) {
            // کامنت‌های سه‌خطی (مثل /// در C#)
            commentPrefix = '///';
            cleanedText = cleanedText.replace(/^\/\/\/\s*/, '');
            
            // برای کامنت‌های چندخطی با ///، حذف /// از ابتدای هر خط
            const lines = cleanedText.split('\n');
            const cleanedLines = lines.map(line => {
                // حذف /// از ابتدای خط (با فاصله‌های اختیاری)
                return line.replace(/^\s*\/\/\/\s*/, '').trim();
            });
            cleanedText = cleanedLines.join('\n').trim();
        } else if (cleanedText.startsWith('//')) {
            commentPrefix = '//';
            cleanedText = cleanedText.replace(/^\/\/\s*/, '');
        } else if (cleanedText.startsWith('/*')) {
            commentPrefix = '/*';
            if (cleanedText.endsWith('*/')) {
                commentSuffix = '*/';
                // حذف /* از ابتدا و */ از انتها
                cleanedText = cleanedText.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '');
                
                // برای کامنت‌های چندخطی، حذف * از ابتدای هر خط
                const lines = cleanedText.split('\n');
                const cleanedLines = lines.map(line => {
                    // حذف * از ابتدای خط (با فاصله‌های اختیاری)
                    return line.replace(/^\s*\*\s*/, '').trim();
                });
                cleanedText = cleanedLines.join('\n').trim();
            } else {
                cleanedText = cleanedText.replace(/^\/\*\s*/, '');
                // حذف * از ابتدای هر خط
                const lines = cleanedText.split('\n');
                const cleanedLines = lines.map(line => {
                    return line.replace(/^\s*\*\s*/, '').trim();
                });
                cleanedText = cleanedLines.join('\n').trim();
            }
        } else if (cleanedText.startsWith('#')) {
            commentPrefix = '#';
            cleanedText = cleanedText.replace(/^#\s*/, '');
        } else if (cleanedText.startsWith('<!--')) {
            commentPrefix = '<!--';
            if (cleanedText.endsWith('-->')) {
                commentSuffix = '-->';
                cleanedText = cleanedText.replace(/^<!--\s*/, '').replace(/\s*-->$/, '');
            } else {
                cleanedText = cleanedText.replace(/^<!--\s*/, '');
            }
        } else if (cleanedText.startsWith('--')) {
            commentPrefix = '--';
            cleanedText = cleanedText.replace(/^--\s*/, '');
        } else if (cleanedText.startsWith('%')) {
            commentPrefix = '%';
            cleanedText = cleanedText.replace(/^%\s*/, '');
        } else if (cleanedText.startsWith(';')) {
            commentPrefix = ';';
            cleanedText = cleanedText.replace(/^;\s*/, '');
        }
        
        // حذف فاصله‌های اضافی
        cleanedText = cleanedText.trim();
        
        // اگر بعد از حذف کامنت‌ها متنی باقی ماند، بررسی راست‌چین بودن
        if (cleanedText && cleanedText.length > 0) {
            const direction = analyzeTextDirection(cleanedText);
            
            if (direction === 'rtl') {
                // اگر علامت کامنت وجود دارد، آن را در سمت چپ نگه دار
                if (commentPrefix) {
                    // برای کامنت‌های چندخطی، باید خطوط را حفظ کنیم
                    const isMultiline = cleanedText.includes('\n');
                    
                    if (isMultiline && commentPrefix === '/*') {
                        // برای کامنت‌های چندخطی، هر خط را جداگانه پردازش می‌کنیم
                        const lines = cleanedText.split('\n');
                        const processedLines = lines.map((line, index) => {
                            const trimmedLine = line.trim();
                            // برای خط اول، علامت /* را اضافه می‌کنیم
                            if (index === 0) {
                                if (!trimmedLine) {
                                    return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">/*</span>`;
                                }
                                return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">/*</span> <span dir="rtl" class="FontSet">${trimmedLine}</span>`;
                            }
                            // برای خط آخر، علامت */ را اضافه می‌کنیم
                            if (index === lines.length - 1) {
                                if (!trimmedLine) {
                                    return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">*/</span>`;
                                }
                                return `<span dir="rtl" class="FontSet">${trimmedLine}</span> <span dir="ltr" style="unicode-bidi: embed; display: inline-block;">*/</span>`;
                            }
                            // برای خطوط میانی
                            if (!trimmedLine) {
                                return '';
                            }
                            return `<span dir="rtl" class="FontSet">${trimmedLine}</span>`;
                        });
                        // فیلتر کردن خطوط خالی و join کردن با <br>
                        const htmlContent = processedLines.filter(line => line !== '').join('<br>');
                        $element.html(htmlContent);
                    } else if (isMultiline && commentPrefix === '///') {
                        // برای کامنت‌های سه‌خطی چندخطی، هر خط را جداگانه پردازش می‌کنیم
                        const lines = cleanedText.split('\n');
                        const processedLines = lines.map((line) => {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) {
                                return '';
                            }
                            return `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">///</span> <span dir="rtl" class="FontSet">${trimmedLine}</span>`;
                        });
                        // فیلتر کردن خطوط خالی و join کردن با <br>
                        const htmlContent = processedLines.filter(line => line !== '').join('<br>');
                        $element.html(htmlContent);
                    } else {
                        // برای کامنت‌های تک خطی
                        const prefixSpan = `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">${commentPrefix}</span>`;
                        const contentSpan = `<span dir="rtl" class="FontSet">${cleanedText}</span>`;
                        const suffixSpan = commentSuffix ? `<span dir="ltr" style="unicode-bidi: embed; display: inline-block;">${commentSuffix}</span>` : '';
                        const htmlContent = prefixSpan + ' ' + contentSpan + suffixSpan;
                        $element.html(htmlContent);
                    }
                } else {
                    // اگر علامت کامنت نداریم، فقط dir را تنظیم کن
                    $element.attr('dir', 'rtl');
                    $element.addClass('FontSet');
                }
            }
        }
    });

    AQ("ms-code-block").each(function (each) {
        var $codeBlock = AQ(this);
        

        if ($codeBlock.hasClass('AsOkCode')) {
            return;
        }
        
        // علامت‌گذاری به عنوان پردازش شده
        $codeBlock.addClass('AsOkCode');
        
        $codeBlock.removeClass('AsOk');

        // بررسی mat-panel-title داخل ms-code-block
        console.log("mat-panel-title");
        var $panelTitle = $codeBlock.find('mat-panel-title');
        if ($panelTitle.length > 0) {
            var $spans = $panelTitle.find('span');

            // console.log("spans:", $spans);

            if ($spans.length > 0) {
                // بررسی همه span‌ها
                var foundText = false;
                $spans.each(function() {
                    var $span = AQ(this);
                    var spanText = $span.text() || $span.html() || '';

                    console.log("spanText:", spanText);

                    if (spanText && spanText.trim() === 'Text') {
                        foundText = true;
                        // console.log("text found in span:", $span);
                        return false; // break loop
                    }
                });
                
                    if (foundText) {
                        console.log("----------------------:");
                    // شرط: اگر span متن برابر با "text" بود
                    // جستجوی code داخل ms-code-block
                    var $codeElements = $codeBlock.find('code');
                    if ($codeElements.length > 0) {
                        $codeElements.each(function() {
                            var $codeElement = AQ(this);
                            
                            // حذف کلاس‌های قبلی
                            $codeElement.removeClass('AsOk');
                            
                            // بررسی اگر قبلاً پردازش شده
                            if ($codeElement.hasClass('AsOkCodeBlock')) {
                                return;
                            }
                            
                            // علامت‌گذاری به عنوان پردازش شده
                            $codeElement.addClass('AsOkCodeBlock');
                            
                            // تنظیم عرض به 100%
                            $codeElement.css('width', '100%');
                            
                            // دریافت متن
                            var codeText = $codeElement.text() || $codeElement.html() || '';
                            
                            if (codeText && codeText.trim()) {
                                // بررسی راست‌چین بودن با analyzeTextDirection
                                var direction = analyzeTextDirection(codeText);
                                
                                if (direction === 'rtl') {
                                    $codeElement.attr('dir', 'rtl');
                                    $codeElement.addClass('FontSet');
                                } else {
                                    $codeElement.attr('dir', 'ltr');
                                }
                            }
                        });
                    }
                }
            }
        }
    });

    AQ("ms-chat-turn").each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }
    });

    AQ("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTablesInContainer(AQ(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            siteConfig: 'aistudio'
        });
    });

    

    AQ("ms-text-chunk , .above-carousel , .below-carousel p ").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTextElementsAdvanced(AQ(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: false
        });
    });

    AQ(".turn-container").each(function (each) {
        var $turnContainer = AQ(this);
        // پیدا کردن اولین ms-cmark-node داخل turn-container
        var $firstCmarkNode = $turnContainer.find('ms-cmark-node').first();
        if ($firstCmarkNode.length > 0) {
            processTextElementsAdvanced($firstCmarkNode, {
                fontClass: 'FontSet',
                processedClass: 'AsOk',
                isContainer: false
            });
        }
    });

    AQ('[data-test-id="suggestion-chip"]').each(function (each) {
        setTextDirectionAndFont(AQ(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    AQ("textarea").each(function (each) {
        
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
            AQ(this).addClass('FontSetImportant2');
            
            const text = AQ(this).val() || AQ(this).text();

            if (text && text.trim()) {
                AQ(this).attr("dir", analyzeTextDirection(text));
            }

            // Add input event listener for real-time direction detection
            AQ(this).on('input keyup paste', function() {
                const currentText = AQ(this).val();
                if (currentText && currentText.trim()) {
                    AQ(this).attr("dir", analyzeTextDirection(currentText));
                }
            });
        }
    });
}

// Main activation function for Aistudio
export function activateAistudio() {

    // Run initial setup
    setAiStudio();
    
    // Continue running setAiStudio every 100ms for other tasks
    let interval = setInterval(() => {
        setAiStudio();
    }, 500);
}

