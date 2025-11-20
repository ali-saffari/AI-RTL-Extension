// copilot.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced , setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Copilot/Bing service functions
export function setItems_copilotBing(rtlAlgorithm) {
    let fo = `.relative.max-h-full.w-expanded-composer.max-w-chat`
    console.log("setItems_copilotBing")

    if (chrome.runtime?.id) {
        // Add copyright using utility function
        const targetElement = AQ(fo);
        // targetElement.addClass("red")

        if (targetElement.length > 0) {
            addCopyright(targetElement, 'AsBox_copilotBing', 'margin-top: 5px; padding: 0px;');
        }
    }

    // Process all text elements using processTextElementsAdvanced
    AQ('[data-content="ai-message"] .break-words').each(function (each) {
    
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'CopilotFontSet',
            processedClass: 'AsOk',
            isContainer: true,
            // skipTags: ['span']
        });
           
    });

    AQ('[data-content="user-message"] .break-words').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'CopilotFontSet',
            processedClass: 'AsOk'
        });
    });

        // Process listbox options for text direction detection
        AQ('[role="listbox"] [role="option"]').each(function (each) {
            const text = AQ(this).text();
            if (text && text.trim()) {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'CopilotFontSet',
                    processedClass: 'AsOk',
                    rtlClass: 'listboxRtlCopilot'
                });
            }
        });


    // Process textarea elements for text direction detection
    AQ('textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'CopilotFontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'CopilotFontSet',
            });
        });
    });
}



// Main activation function for Copilot
export function activateCopilot(rtlAlgorithm = 'advanced_full') {
    console.log("activateCopilot with RTL algorithm:", rtlAlgorithm);
    setItems_copilotBing(rtlAlgorithm);

    setInterval(() => {
        setItems_copilotBing(rtlAlgorithm);
    }, 1000);
}

