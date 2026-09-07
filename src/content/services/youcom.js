// youcom.js service functions

import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement, setTextDirectionAndFontOneTime } from '../utils/directionUtils/index.js';
import { addCopyright } from '../utils/copyright.js';

export function setYouCom(rtlAlgorithm = 'advanced_full') {
   
    if (chrome.runtime?.id) {
        // Add copyright to Youcom interface
        let fo2 = `#ydc-content-area #ChatQueryBar`;
        addCopyright(AQ(fo2), 'AsBoxYoucom AsBoxB', `margin-top: 8px; margin-bottom: 0px; transform: scale(0.9);`);
    }


    // Process header elements
    AQ(".ebfm092").each(function (each) {
        if (!AQ(this).hasClass("AsRtl")) {
            AQ(this).addClass('AsRtl');
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
        }
    });


    // Process title elements
    AQ("._1bxvbd41").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });



    // Process history elements
    AQ("._1yjdfrt0").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


    // Process sources elements
    AQ("._1g72v5i5 , ._1g72v5i6 , _1ynbgno6 , .jj3gyx7").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });


    // Process markdown content if it exists
    AQ(".jfuQrJ").each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    // Process dINDbt elements
    AQ(".dINDbt").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });
    



    // Process textarea elements
    AQ('textarea').each(function (each) {

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        

        
        if (!AQ(this).hasClass("AsOk")) {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'CopilotFontSet',
                processedClass: 'AsOk'
            });
            
            // Add event listener for real-time text direction detection
            AQ(this).on('input keyup', function() {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'CopilotFontSet'
                });
            });
        }
    });

    // Process answer parser elements
    AQ(".AnswerParser_AnswerParserSharedStyles__0GZUj").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


    // Process answer parser content elements
    AQ(".AnswerParser_TextContainer__z_Iiv ,.AnswerParser_AnswerParserUnorderedList__P_1FW ,.AnswerParser_AnswerParserH4__ghxg8").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });


}



// Main activation function for Youcom
export function activateYoucom(rtlAlgorithm = 'advanced_full') {
    console.log('Youcom RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setYouCom(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setYouCom(rtlAlgorithm);
    }, 500);
}