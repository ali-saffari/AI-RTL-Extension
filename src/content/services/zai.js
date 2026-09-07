// Z.ai service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const IGNORE_SELECTOR = '.thinking-chain-container';

export function setZai(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright('.footer, .chat-container, .main-container', 'AsBoxB');
    }

    // Process textarea and input elements with RTL algorithm
    AQ('body textarea, body input[type="text"], body input[type="search"]').each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        

        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOK',
            ignoreSelector: IGNORE_SELECTOR,
            removeInnerDir: true
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true,
                ignoreSelector: IGNORE_SELECTOR,
            removeInnerDir: true
            });
        });
    });

    // // Process message content elements
    AQ(' .textGradientDark , .chat-user .rounded-xl').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOK',
            rtlClass: 'AsRtl',
            ignoreSelector: IGNORE_SELECTOR,
            removeInnerDir: true
        });
    });

    // // Process text content elements
    // AQ('.text-content, .message-text, .response-text, .content, .text').each(function (each) {
    //     if (!AQ(this).hasClass("AsOkFontSet")) {
    //         AQ(this).addClass('AsOkFontSet');
    //         const text = AQ(this).val() || AQ(this).text();
    //         const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);

    //         if (direction === 'rtl') {
    //             AQ(this).addClass('FontSet');
    //         }
    //     }
    // });

    // Process conversation elements using RTL algorithm
    AQ('.chat-assistant').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            ignoreSelector: IGNORE_SELECTOR,
            removeInnerDir: true
        });
    });
}

// Main activation function for Z.ai
export function activateZai(rtlAlgorithm = 'advanced_full') {
    console.log('Z.ai RTL activated with algorithm:', rtlAlgorithm);
    


    setTimeout(() => {
      
            // Initial setup
    setZai(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setZai(rtlAlgorithm);
    }, 500);


    }, 2000);
}
