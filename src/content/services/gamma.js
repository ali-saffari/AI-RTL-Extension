// gamma.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setGamma(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright if needed - adjust selector based on actual site structure
        // addCopyright(AQ('selector'), 'AsBoxGemini AsBoxB' , 'margin-top: 2px; margin-bottom: -5px; font-size: 13px;');
    }

    // Process textarea elements for text direction detection
    AQ('.tiptap ').each(function (each) {
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

    // Process input elements
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

    // Process content containers - adjust selectors based on actual site structure
    AQ('[class*="message"], [class*="content"], [class*="text"], .prose, .markdown , .react-renderer').each(function (each) {
        if (AQ(this).hasClass('AsOkText')) {
            return;
        }
        
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

     
    AQ(".react-renderer .heading , .react-renderer .title ,.chakra-editable ").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


}

// Main activation function for Gamma
export function activateGamma(rtlAlgorithm = 'advanced_full') {
    console.log('Gamma RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setGamma(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setGamma(rtlAlgorithm);
    }, 1000);
}

