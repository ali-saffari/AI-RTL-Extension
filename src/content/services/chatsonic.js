// chatsonic.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setChatsonic(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {

        let fo2 = `.w-full.rounded-2xl.bg-sc-secondary`
        
        // Add copyright using utility function
        addCopyright($(fo2).parent(), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -4px; font-size: 13px;');

    }

    // Process textarea elements for text direction detection
    $('textarea, input[type="text"], input[type="search"], input:not([type]) , .tiptap ').each(function (each) {
        if ($(this).data('rtl-listener-added')) {
            return;
        }
        $(this).data('rtl-listener-added', true);
        
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

    

    // $('.font-inter ').each(function (each) {
    //     if ($(this).hasClass('AsOkText')) {
    //         return;
    //     }
    //     $(this).addClass('AsOkText')
    // });

    // Process markdown content
    $('.markdown, .chatsonic ').each(function (each) {
        if ($(this).hasClass('AsOkText')) {
            return;
        }
        
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // Process elements with font-normal and font-medium classes
    $('.text-n-subtle').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'Asok',
            rtlClass: 'AsRtl',
        });
    });
}

// Main activation function for Chatsonic
export function activateChatsonic(rtlAlgorithm = 'advanced_full') {
    console.log('Chatsonic RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setChatsonic(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setChatsonic(rtlAlgorithm);
    }, 1000);
}

