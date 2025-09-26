// blackbox.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// BlackBox service functions
export function setBlackBox(rtlAlgorithm = 'advanced_section') {
    // Add copyright using utility function
    const $targetElement = $('.relative.min-w-40 > .px-4');
    if ($targetElement.length > 0) {
        addCopyright($targetElement, 'AsKimi AsBoxB', 'margin-bottom: 0px; ');
    }

    // Process textarea elements using RTL algorithm
    $("body textarea").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        $(this).on('input keyup paste', function() {
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

    // Process prose elements using RTL algorithm
    $('.prose').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // Process cmdk-group-items elements using RTL algorithm
    $('[cmdk-group-items]').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    // Process markdown tables
    $('.markdown-table').each(function (each) {
        if (!$(this).prev('.table-scroll-help').length) {
            $(this).before(`
                <div class="table-scroll-help bg-blue-50 dark:bg-blue-900/20 border-2 rounded-lg px-3 py-2 my-2 text-xs text-gray-700 dark:text-gray-300 text-center font-iran-yekan" style="border-color: #3b82f6;">
                     💡 نکته: اگر جدول کامل نمایش داده نمی‌شه، با اسکرول افقی می‌تونی کل جدول رو ببینی
                </div>
            `);
        }
        
        // Add blue scroll styling to parent
        $(this).parent().addClass('custom-scrollbar');

        processTextElementsByRtlAlgorithm($(this).parent()[0], rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });
}



// Main activation function for Blackbox
export function activateBlackbox(rtlAlgorithm = 'advanced_section') {
    console.log("activateBlackbox with RTL algorithm:", rtlAlgorithm);
    
    // Initial setup
    setBlackBox(rtlAlgorithm);
    
    // SetInterval for periodic updates
    setInterval(() => {
        setBlackBox(rtlAlgorithm);
    }, 1000);
}