// ernie.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setErnie(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright notice - selector should be adjusted based on actual site structure
        let fo2 = `footer`
        addCopyright(AQ(fo2), 'AsBoxErnie AsBoxB', 'margin-top: 4px; margin-bottom: -5px; font-size: 13px;');
    }

    // Process textarea elements
    AQ('textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        AQ(this).on('input keyup paste', function() {
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

    // Process message content and chat elements
    AQ('.dialog-card-wrapper').each(function (each) {
   
        
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });


    // Process common text elements
    
    AQ(' [class*="container_"] span').each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }

    });



    AQ('[class*="questionText_"] span, [class*="sessionName"]').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'Asok',
            rtlClass: 'AsRtl',
        });
    });
}

// Main activation function for Ernie
export function activateErnie(rtlAlgorithm = 'advanced_full') {
    console.log('Ernie RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setErnie(rtlAlgorithm);

    // Periodic updates
    setInterval(() => {
        setErnie(rtlAlgorithm);
    }, 1000);
}

