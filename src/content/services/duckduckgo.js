// duckduckgo.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setDuckduckgo(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.eRjZTOsvr6gqJe3E2Yc6`
        
        // Add copyright using utility function
        addCopyright(AQ(fo2), 'AsBoxDuckduckgo');
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
        AQ(this).on('input keyup', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

    // Process p elements for text direction detection
    AQ(".PMQFURe7WSKqXJk9e3Jn , .decaGrVqUoziItl4Iarp ").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    // Process ucB71mHYvyHsWKjYfYKI elements using advanced function
    AQ('.ucB71mHYvyHsWKjYfYKI').each(function (each) {
        // Disable horizontal scroll only
        AQ(this).css({
            'overflow-x': 'hidden',
            'overflow-y': 'auto'
        });
        
        AQ(this).addClass('activateDuckduckgo')

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });
}

// Main activation function for DuckDuckGo
export function activateDuckduckgo(rtlAlgorithm = 'advanced_full') {
    console.log('DuckDuckGo RTL activated with algorithm:', rtlAlgorithm);
    // Initial setup
    setDuckduckgo(rtlAlgorithm);

    // SetInterval and Observer
    let interval = setInterval(() => {
        setDuckduckgo(rtlAlgorithm);
    }, 500);
}

