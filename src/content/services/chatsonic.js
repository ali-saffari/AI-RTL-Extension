// chatsonic.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setChatsonic(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {

        let fo2 = `.w-full.rounded-2xl.bg-sc-secondary`
        
        // Add copyright using utility function
        addCopyright(AQ(fo2).parent(), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -4px; font-size: 13px;');

    }

    // Process textarea elements for text direction detection
    AQ('textarea, input[type="text"], input[type="search"], input:not([type]) , .tiptap ').each(function (each) {
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

    

    // AQ('.font-inter ').each(function (each) {
    //     if (AQ(this).hasClass('AsOkText')) {
    //         return;
    //     }
    //     AQ(this).addClass('AsOkText')
    // });

    // Process markdown content
    AQ('.markdown, .chatsonic ').each(function (each) {
        if (AQ(this).hasClass('AsOkText')) {
            return;
        }
        
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // Process elements with font-normal and font-medium classes
    AQ('.text-n-subtle').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
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

