// duckduckgo.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setDuckduckgo(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {
        let fo2 = `.eRjZTOsvr6gqJe3E2Yc6`
        
        // Add copyright using utility function
        addCopyright($(fo2), 'AsBoxDuckduckgo');
    }

    // Process textarea elements for text direction detection
    $('textarea').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        $(this).on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

    // Process p elements for text direction detection
    $(".PMQFURe7WSKqXJk9e3Jn , .decaGrVqUoziItl4Iarp ").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    // Process ucB71mHYvyHsWKjYfYKI elements using advanced function
    $('.ucB71mHYvyHsWKjYfYKI').each(function (each) {
        // Disable horizontal scroll only
        $(this).css({
            'overflow-x': 'hidden',
            'overflow-y': 'auto'
        });
        
        $(this).addClass('activateDuckduckgo')

        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });
}

// Main activation function for DuckDuckGo
export function activateDuckduckgo(rtlAlgorithm = 'advanced_section') {
    console.log('DuckDuckGo RTL activated with algorithm:', rtlAlgorithm);
    // Initial setup
    setDuckduckgo(rtlAlgorithm);

    // SetInterval and Observer
    let interval = setInterval(() => {
        setDuckduckgo(rtlAlgorithm);
    }, 500);
}

