// aistudio.js service functions
import { 
    analyzeTextDirection
} from '../utils/analyzeDirection.js';
import { 
    processTextElementsAdvanced,
    processTablesInContainer,
    getAttributeTextElements
} from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';



// Recurring tasks that need to run periodically
export function setAiStudio() {
    // Add copyright to footer sections
    if (chrome.runtime?.id) {
        let fo2 = `section footer`;
        addCopyright(AQ(fo2), 'AsBoxB', 'margin-top: 14px');
    }

    AQ("ms-chat-turn").each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }
    });

    AQ("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTablesInContainer(AQ(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            siteConfig: 'aistudio'
        });
    });

    AQ("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTextElementsAdvanced(AQ(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: false
        });
    });

    AQ("ms-text-chunk textarea").each(function (each) {
        
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
            AQ(this).addClass('FontSetImportant2');
            
            const text = AQ(this).val() || AQ(this).text();

            if (text && text.trim()) {
                AQ(this).attr("dir", analyzeTextDirection(text));
            }

            // Add input event listener for real-time direction detection
            AQ(this).on('input keyup paste', function() {
                const currentText = AQ(this).val();
                if (currentText && currentText.trim()) {
                    AQ(this).attr("dir", analyzeTextDirection(currentText));
                }
            });
        }
    });
}

// Main activation function for Aistudio
export function activateAistudio() {

    // Run initial setup
    setAiStudio();
    
    // Continue running setAiStudio every 100ms for other tasks
    let interval = setInterval(() => {
        setAiStudio();
    }, 500);
}

