// poe.js service functions

import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setPoeCom(rtlAlgorithm = 'advanced_section') {

    if (chrome.runtime?.id) {
        let fo2 = `[class*="ChatPageMainFooter_footerInner"]`
        addCopyright($(fo2), 'AsBoxDuckduckgo', '');
    }


    // Process text area and button elements with RTL algorithm
    $('[class*="GrowingTextArea_textArea"], [class*="ResendRemixFollowupButton_right"], [class*="ChatHistoryListItem_seenTitle"]').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
    });

    
    // Process markdown container elements using RTL algorithm
    $('[class*="Markdown_markdownContainer"]').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}



// Main activation function for Poe
export function activatePoe(rtlAlgorithm = 'advanced_section') {
    console.log('Poe RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setPoeCom(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setPoeCom(rtlAlgorithm);
    }, 500);
}