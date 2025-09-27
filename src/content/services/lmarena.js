// LM Arena service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Helper function to detect text direction based on algorithm
function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    let direction;
    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        direction = detectTextDirection(text);
    } else if (rtlAlgorithm === 'first_word') {
        direction = analyzeTextDirectionFirstWord(text);
    } else {
        direction = detectTextDirection(text); // fallback
    }
    
    return direction;
}

export function setLmarena(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {

                
        let fo3 = $('.relative .flex.flex-col.items-center.px-4')
        fo3.addClass('pb-12');
        fo3.removeClass('pb-6');

        let fo4 = $('.bg-surface-primary .border-border-faint.bg-surface-primary.min-h-0.w-full.flex-none .absolute')
        fo4.css('bottom', '-2.8rem');
        fo4.css('text-align', 'center');


        addCopyright('.bg-surface-primary .border-border-faint.bg-surface-primary.min-h-0.w-full.flex-none .absolute  p');


   




    }



    // Process textarea and input elements with RTL algorithm
    $('body textarea, body input[type="text"], body input[type="search"]').each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time direction detection
        $(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // Process message content elements
    $(' [data-sidebar="menu-item"] ').each(function (each) {
        if (!$(this).hasClass("AsOkText")) {
            $(this).addClass('AsOkText');
            const text = $(this).val() || $(this).text();
            const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);
            $(this).attr('dir' , direction);
            if (direction === 'rtl') {
                $(this).addClass('FontSet');
            }
          
        }
    });

    $('.prose').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });
}

// Main activation function for LM Arena
export function activateLmarena(rtlAlgorithm = 'advanced_section') {
    console.log('LM Arena RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setLmarena(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setLmarena(rtlAlgorithm);
    }, 500);
}
