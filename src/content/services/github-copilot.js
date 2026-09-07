// github-copilot.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setGitHubCopilot(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `[class*="ConversationView-module__footer"]`
        addCopyright(AQ(fo2), 'AsBoxGitHubCopilot AsBoxB', `margin-top: 11px; margin-bottom: -5px; transform: scale(0.9);`);
    }


    
    AQ('[class*="ChatInput-module__inputContainer"]').each(function (each) {

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });


    // Process markdown container elements using RTL algorithm
    AQ('.markdown-body').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    

    
    AQ('[class*="UserMessage"] , [class*="ConversationListV2-module__item"]').each(function (each) {

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
      
    });

}

// Main activation function for GitHub Copilot
export function activateGitHubCopilot(rtlAlgorithm = 'advanced_full') {
    console.log('GitHub Copilot RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setGitHubCopilot(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setGitHubCopilot(rtlAlgorithm);
    }, 500);
}
