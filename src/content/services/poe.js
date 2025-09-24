// poe.js service functions

import { detectTextDirection } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setPoeCom() {

    if (chrome.runtime?.id) {
        let fo2 = `[class*="ChatPageMainFooter_footerInner"]`
        addCopyright($(fo2), 'AsBoxDuckduckgo', '');
    }


    $("[class*='GrowingTextArea_textArea'], [class*='ResendRemixFollowupButton_right'], [class*='ChatHistoryListItem_seenTitle']").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text() || $(this).val();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).addClass('FontSet');
        }
    });

    
    $("[class*='Markdown_markdownContainer']").each(function (each) {
        processTextElementsAdvanced($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}



// Main activation function for Poe
export function activatePoe() {
    setPoeCom();

    setInterval(() => {
        setPoeCom();
    }, 1000);

 

}