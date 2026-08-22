// kimi.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setKimi(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.chat-action`
        addCopyright(AQ(fo2), 'AsKimi', 'margin-bottom: 10px');
    }

    // Process markdown-container elements using RTL algorithm
    AQ('.markdown-container').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });

    // Process paragraph elements with RTL algorithm
    AQ(".user-content , .user-name").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    // Process other common text elements with RTL algorithm
    AQ("body span, body h1, body h2, body h3, body h4, body h5, body h6, .chat-input-editor").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });
}



// Main activation function for Kimi
export function activateKimi(rtlAlgorithm = 'advanced_full') {
    console.log('Kimi RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setKimi(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setKimi(rtlAlgorithm);
    }, 1000);
    
    // MutationObserver for dynamic content updates
    let timeoutId;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log("Kimi content changed - reprocessing");
            setKimi(rtlAlgorithm);
        }, 200);
    });
    
    const config = {attributes: true, childList: true, subtree: true};
    const targetNode = document.body;
    
    if (targetNode) {
        observer.observe(targetNode, config);
        console.log('Kimi observer started');
    } else {
        console.log('Kimi targetNode not found - observer not started');
    }
}