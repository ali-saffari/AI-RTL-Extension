// youcom.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm, setTextDirectionAndFontOneTime } from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';

export function setYouCom(rtlAlgorithm = 'advanced_section') {
   
    if (chrome.runtime?.id) {
        // Add copyright to Youcom interface
        let fo2 = `#ydc-content-area #ChatQueryBar`;
        addCopyright($(fo2), 'AsBoxYoucom AsBoxB', `margin-top: 8px; margin-bottom: 0px; transform: scale(0.9);`);
    }


    // Process header elements
    $(".ebfm092").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
        }
    });


    // Process title elements
    $("._1bxvbd41").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });



    // Process history elements
    $("._1yjdfrt0").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


    // Process sources elements
    $("._1g72v5i5 , ._1g72v5i6 , _1ynbgno6 , .jj3gyx7").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });


    // Process markdown content if it exists
    $(".jfuQrJ").each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    // Process dINDbt elements
    $(".dINDbt").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });
    



    // Process textarea elements
    $('textarea').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'CopilotFontSet',
                processedClass: 'AsOk'
            });
            
            // Add event listener for real-time text direction detection
            $(this).on('input keyup', function() {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'CopilotFontSet'
                });
            });
        }
    });

    // Process answer parser elements
    $(".AnswerParser_AnswerParserSharedStyles__0GZUj").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


    // Process answer parser content elements
    $(".AnswerParser_TextContainer__z_Iiv ,.AnswerParser_AnswerParserUnorderedList__P_1FW ,.AnswerParser_AnswerParserH4__ghxg8").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


}



// Main activation function for Youcom
export function activateYoucom(rtlAlgorithm = 'advanced_section') {
    console.log('Youcom RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setYouCom(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setYouCom(rtlAlgorithm);
    }, 500);
}