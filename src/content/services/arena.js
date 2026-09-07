// Arena (arena.ai) service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

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

export function setArena(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {

                
        // let fo3 = AQ('.relative .flex.flex-col.items-center.px-4')
        // fo3.addClass('pb-12');
        // fo3.removeClass('pb-6');

        // let fo4 = AQ('.bg-surface-primary .bg-surface-secondary .absolute')
        // fo4.css('bottom', '-2.8rem');
        // fo4.css('text-align', 'center');


        // addCopyright('.bg-surface-primary .bg-surface-secondary .absolute  p');


        addCopyright(
            '[role="presentation"].relative' ,
            'AsBoxGemini AsBoxB',
            'margin-top: 6px; margin-bottom: -10px; font-size: 13px;'
        );


    }



    // Process textarea and input elements with RTL algorithm
    AQ('body textarea, body input[type="text"], body input[type="search"]').each(function (each) {

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // Sidebar chat titles: Arena's .body-sm sets its own font-family, so
    // FontSet on the <li> does not reach the inner <span>.
    AQ('[data-sidebar="menu-item"]').each(function () {
        const $item = AQ(this);

        if (!$item.hasClass('AsOkText')) {
            $item.addClass('AsOkText');
            const text = $item.val() || $item.text();
            const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);
            $item.attr('dir', direction);
            if (direction === 'rtl') {
                $item.addClass('FontSet');
            }
        }

        if ($item.hasClass('FontSet')) {
            $item.find('span.body-sm, span.truncate').addClass('FontSet');
        }
    });

    
    AQ('.relative.overflow-hidden.bg-surface-primary.w-full .border-border-faint , .relative.overflow-hidden.bg-surface-primary.w-full .body-base').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            setTextAlign: true
        });
    });



    

    AQ('.prose').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });
}

// Main activation function for Arena
export function activateArena(rtlAlgorithm = 'advanced_full') {
    console.log('Arena RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setArena(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setArena(rtlAlgorithm);
    }, 500);
}
