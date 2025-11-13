// lovable.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setLovable(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright($('#chat-input').parent(), 'AsBoxGemini AsBoxB' , 'margin-top: 2px; margin-bottom: -5px; font-size: 13px;');
    }


    


    // Process textarea elements for text direction detection
    $('textarea').each(function (each) {
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


    $('.font-normal , .font-medium').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'Asok',
            rtlClass: 'AsRtl',
            setTextAlign: true
        });
    });

    
    // Process markdown content
    $('.prose-markdown-mobile').each(function (each) {

        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: 'right'
        });
    });

    $('input[type="text"], input[type="search"]').each(function (each) {
        if ($(this).data('rtl-listener-added')) {
            return;
        }
        $(this).data('rtl-listener-added', true);
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        $(this).on('input keyup', function() {
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
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

