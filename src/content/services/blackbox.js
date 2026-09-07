// blackbox.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

// BlackBox service functions
export function setBlackBox(rtlAlgorithm = 'advanced_full') {
    // Add copyright using utility function
    const $targetElement = AQ('.relative.min-w-40 > .px-4');
    if ($targetElement.length > 0) {
        addCopyright($targetElement, 'AsKimi AsBoxB', 'margin-bottom: 0px; ');
    }

    // Process textarea elements using RTL algorithm
    AQ("body textarea").each(function (each) {


        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup paste', function() {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

    // Process prose elements using RTL algorithm
    AQ('.prose').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // Process cmdk-group-items elements using RTL algorithm
    AQ('[cmdk-group-items]').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    // Process markdown tables
    AQ('.markdown-table').each(function (each) {
        if (!AQ(this).prev('.table-scroll-help').length) {
            AQ(this).before(`
                <div class="table-scroll-help bg-blue-50 dark:bg-blue-900/20 border-2 rounded-lg px-3 py-2 my-2 text-xs text-gray-700 dark:text-gray-300 text-center font-iran-yekan" style="border-color: #3b82f6;">
                     💡 نکته: اگر جدول کامل نمایش داده نمی‌شه، با اسکرول افقی می‌تونی کل جدول رو ببینی
                </div>
            `);
        }
        
        // Add blue scroll styling to parent
        AQ(this).parent().addClass('custom-scrollbar');

        applyRtlToContainer(AQ(this).parent()[0], rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });
}



// Main activation function for Blackbox
export function activateBlackbox(rtlAlgorithm = 'advanced_full') {
    console.log("activateBlackbox with RTL algorithm:", rtlAlgorithm);
    
    // Initial setup
    setBlackBox(rtlAlgorithm);
    
    // SetInterval for periodic updates
    setInterval(() => {
        setBlackBox(rtlAlgorithm);
    }, 1000);
}