// youcom.js service functions
import { imagePath, saffariLink, textSaffari } from '../utils/constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from '../utils/modal.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced , setTextDirectionAndFontOneTime } from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';

export function setYouCom() {
   
    if (chrome.runtime?.id) {
        // Add copyright to Youcom interface
        let fo2 = `#ydc-content-area #ChatQueryBar`;
        addCopyright($(fo2), 'AsBoxYoucom AsBoxB', `margin-top: 8px; margin-bottom: 0px; transform: scale(0.9);`);
    }


    // Header elements
    $(".ebfm092").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text() || $(this).val();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).addClass('FontSet');
        }
    });


    // Title elements
    $("._1bxvbd41").each(function (each) {
        setTextDirectionAndFontOneTime($(this), {fontClass: 'FontSet' });
    });



    //history elements

    $("._1yjdfrt0").each(function (each) {
        setTextDirectionAndFontOneTime($(this), {fontClass: 'FontSet' });
    });


    //Sources
    $("._1g72v5i5 , ._1g72v5i6 , _1ynbgno6 , .jj3gyx7").each(function (each) {
           setTextDirectionAndFontOneTime($(this), {fontClass: 'FontSet' ,setTextAlign: true });
    });


    // Process markdown content if it exists
    $(".jfuQrJ").each(function (each) {
 
        processTextElementsAdvanced($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true,
            removeSkipTags: ['blockquote']
        });
    });

    $(".dINDbt").each(function (each) {
        setTextDirectionAndFontOneTime($(this), {fontClass: 'FontSet' });
    });
    



    $('textarea').each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            const text = $(this).val();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr('dir', direction);
                $(this).addClass('CopilotFontSet');
                $(this).addClass('AsOk');
            }
            
            // Add event listener for real-time text direction detection
            $(this).on('input keyup', function() {
                const currentText = $(this).val();
                if (currentText && currentText.trim()) {
                    const direction = detectTextDirection(currentText);
                    $(this).attr('dir', direction);
                } else {
                    $(this).removeAttr('dir');
                }
            });
        }
    });

    // Answer parser elements
    $(".AnswerParser_AnswerParserSharedStyles__0GZUj").each(function (each) {
        setTextDirectionAndFontOneTime($(this), {fontClass: 'FontSet' });
    });


    // Answer parser content elements
    $(".AnswerParser_TextContainer__z_Iiv ,.AnswerParser_AnswerParserUnorderedList__P_1FW ,.AnswerParser_AnswerParserH4__ghxg8").each(function (each) {
        setTextDirectionAndFontOneTime($(this), {fontClass: 'FontSet' });
    });


}



// Main activation function for Youcom
export function activateYoucom() {
    console.log("activateYoucom");
    
    // Initial setup
    setYouCom();

    // SetInterval for continuous processing
    setInterval(() => {
        setYouCom();
    }, 1000);

}