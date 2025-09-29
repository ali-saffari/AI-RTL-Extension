// grok.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setGrok(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {
        // Add copyright if needed
        let copyrightElement = `.relative.w-full.px-gutter`
        addCopyright($(copyrightElement), 'AsBoxB', 'margin-bottom: -9px;margin-top: 7px;');
    }

    // Process response content markdown elements using RTL algorithm
    $('.response-content-markdown').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'noFont',
            processedClass: 'AsOk',
            isContainer: true
        });
    });


    $('.ProseMirror').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'noFont',
            processedClass: false,
            setTextAlign: true
        });
});

     



}


// Main activation function for Grok
export function activateGrok(rtlAlgorithm = 'advanced_section') {
    console.log('Grok RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setGrok(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setGrok(rtlAlgorithm);
    }, 1000);
    
    
    // MutationObserver for dynamic content updates
    // let timeoutId;
    // const observer = new MutationObserver((mutations) => {
    //     clearTimeout(timeoutId);
    //     timeoutId = setTimeout(() => {
    //         console.log("Grok content changed - reprocessing");
    //         setGrok(rtlAlgorithm);
    //     }, 200);
    // });
    
    // const config = {attributes: true, childList: true, subtree: true};
    // const targetNode = document.body;
    
    // if (targetNode) {
    //     observer.observe(targetNode, config);
    //     console.log('Grok observer started');
    // } else {
    //     console.log('Grok targetNode not found - observer not started');
    // }
}