// gemini.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setGemini(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {
        let fo2 = `.hallucination-disclaimer`
        
        // Add copyright using utility function
        addCopyright($(fo2), 'AsBoxGemini' , 'margin-top: 1px; margin-top: -6px; margin-bottom: 4px;');
    }

    // Process markdown panels with RTL algorithm
    $('.markdown-main-panel').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    // Process Gemini UI elements
    $('.gds-label-l , .gds-body-l , h1 , .gds-body-m , .gds-body-s , .gds-label-m , .gds-label-s , .gds-label-xs , .gds-label-xxs , .gds-label-m-alt , .gds-body-m-alt , .gds-body-s-alt , .gds-body-xs-alt').each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });
}



// Main activation function for Gemini
export function activateGemini(rtlAlgorithm = 'advanced_section') {
    console.log("activateGemini with RTL algorithm:", rtlAlgorithm);
    // Initial setup
    setGemini(rtlAlgorithm);
  


    let oldText = '';
    setInterval(() => {  
        

        $('.bot-name-ugc-label ').each(function (each) {
            // console.log("gds-label-l", this)
            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }
        });


        

        $('.ql-editor').each(function (each) {
            // console.log("gds-label-l", this)
            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }
        });


    $('.ql-editor p').each(function (each) {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: false,
                    setTextAlign: true
                });
    });
    }, 100);


   
    setInterval(() => {
        setGemini(rtlAlgorithm);
    }, 1000);
}