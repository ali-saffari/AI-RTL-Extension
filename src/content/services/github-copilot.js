// github-copilot.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setGitHubCopilot(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `[class*="ConversationView-module__footer"]`
        addCopyright($(fo2), 'AsBoxGitHubCopilot AsBoxB', `margin-top: 11px; margin-bottom: -5px; transform: scale(0.9);`);
    }


    
    $('[class*="ChatInput-module__inputContainer"]').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        $(this).on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });


    // Process markdown container elements using RTL algorithm
    $('[class*="ChatMessage-module__content"]').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
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
