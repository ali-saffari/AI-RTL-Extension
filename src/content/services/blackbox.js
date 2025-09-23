// blackbox.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElements, getArticleTextElements } from '../utils/textDirectionUtils.js';

// BlackBox service functions
export function setBlackBox() {
    // Add copyright using utility function
    const $targetElement = $('.relative.min-w-40 > .px-4');
    if ($targetElement.length > 0) {
        addCopyright($targetElement, 'AsKimi AsBoxB', 'margin-bottom: 0px; ');
    }

    $("body textarea").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('FontSet');
            $(this).addClass('AsOk');
            const text = $(this).val() || $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }

            $(this).on('input keyup paste', function() {
                const text = $(this).val();
                if (text && text.trim()) {
                    $(this).attr("dir", detectTextDirection(text));
                }
            })


        }
    })

    // Add event listeners for real-time text direction detection on textareas



    $('.prose ').each(function (each) {


            processTextElements(
                $(this), 
                getArticleTextElements(), 
                (element) => element.textContent,
                'FontSetImportantGPT',
                'AsOkText',
                true
            );
            
     
    })

    // Process cmdk-group-items elements
    $('[cmdk-group-items]').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            $(this).addClass('FontSet');
            
            const text = $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                console.log('cmdk-group-items processed:', text, direction);
            }
        }
    })

    

    $('.markdown-table ').each(function (each) {


        if (!$(this).prev('.table-scroll-help').length) {
            $(this).before(`
                <div class="table-scroll-help bg-blue-50 dark:bg-blue-900/20 border-2 rounded-lg px-3 py-2 my-2 text-xs text-gray-700 dark:text-gray-300 text-center font-iran-yekan" style="border-color: #3b82f6;">
                     💡 نکته: اگر جدول کامل نمایش داده نمی‌شه، با اسکرول افقی می‌تونی کل جدول رو ببینی
                </div>
            `);
        }
        
        // Add blue scroll styling to parent
        $(this).parent().addClass('custom-scrollbar');

        processTextElements(
            $(this).parent(), 
            getArticleTextElements(), 
            (element) => element.textContent,
            'FontSetImportantGPT',
            'AsOkText',
            true
        );
        
 
})

    

    // $("body p").each(function (each) {
    //     if (!$(this).hasClass("AsRtl")) {
    //         $(this).addClass('AsRtl');
    //         const text = $(this).text();
    //         if (text && text.trim()) {
    //             $(this).attr("dir", detectTextDirection(text));
    //         }
    //     }
    // })
}



// Main activation function for Blackbox
export function activateBlackbox() {
    console.log("activateBlackbox");
    setBlackBox();
    let interval = setInterval(() => {
        setBlackBox();
    }, 500);
}