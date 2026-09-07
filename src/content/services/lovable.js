// lovable.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setLovable(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(AQ('#chat-input').parent(), 'AsBoxGemini AsBoxB' , 'margin-top: 2px; margin-bottom: -5px; font-size: 13px;');
    }


    


    // Process textarea elements for text direction detection
    AQ('textarea').each(function (each) {
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


    AQ('.font-normal , .font-medium').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'Asok',
            rtlClass: 'AsRtl',
            setTextAlign: true
        });
    });

    
    // Process markdown content
    AQ('.prose-markdown-mobile').each(function (each) {

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: 'right'
        });
    });

    AQ('input[type="text"], input[type="search"]').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        AQ(this).on('input keyup', function() {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });
}

// Main activation function for Lovable
export function activateLovable(rtlAlgorithm = 'advanced_full') {
    console.log('Lovable RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setLovable(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setLovable(rtlAlgorithm);
    }, 1000);
}

