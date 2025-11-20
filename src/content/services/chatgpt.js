// ChatGPT service functions
import { isRTL, detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processParagraphWithBreaks, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function initializeChatGptElements(rtlAlgorithm = 'advanced_full') {
    // Check if React is still hydrating
    if (document.querySelector('[data-reactroot]') && !document.querySelector('[data-reactroot]').__reactInternalInstance) {
        console.log('React is still hydrating, skipping...');
        return;
    }
    
    let presentation = ".relative.flex.h-full "
    let fo = presentation + " .isolate.w-full.basis-auto .justify-center.min-h-8.text-xs.text-token-text-secondary "

    fo = presentation + " #thread-bottom "
    


    let foTest = ".relative.flex.h-full.overflow-hidden .relative.w-full.px-2.text-center"

    if (chrome.runtime?.id) {
        AQ(fo).each(function (each) {
                addCopyright(AQ(this).parent(), "text-xs text-token-text-secondary AsBoxB" , 'margin-top: 1px');
        })
    }

    AQ('.hljs-comment').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    })

    AQ('.text-message .markdown').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOkText',
            isContainer: true,
            siteConfig: 'chatgpt'
        });
    })

    AQ(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function (each) {
        if (!AQ(this).parent().hasClass("AsOk")) {
            AQ(this).parent().addClass('AsOk');
            const text = AQ(this).text()
            AQ(this).addClass('FontSetImportantGPT');
            if (isRTL(text)) {
                AQ(this).parent().addClass("setRight")
            }

        }
    })

    AQ('body').each(function (each) {
        AQ(this).addClass('FontSet');
    })

    AQ(presentation).each(function (each) {
        AQ(this).addClass('FontSet');
    })

    AQ(presentation + '#prosemirror-editor-container').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOk',
            rtlClass: 'flex-row-reverse'
        });
    })

    AQ("#prompt-textarea").each(function (each) {
        // Check if already processed to avoid duplicate event listeners
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('keyup paste', function() {
            const currentText = AQ(this).text();
            console.log('Prompt textarea text:', currentText);
            
            // Use requestAnimationFrame to avoid React conflicts
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                });
            });
        });
        
        // Mark as processed to prevent duplicate listeners
     
    })
}

export function initializeChatGptHistory() {
    AQ('#history .__menu-item').each(function (each) {
        const text = AQ(this).text()
        let p = isRTL(text);

        if ((text !== "New chat") && !AQ(this).hasClass("AsOkList")) {
            AQ(this).addClass('AsOkList');

            if (p) {
                AQ(this).attr("dir", "rtl");
                AQ(this).addClass('AsRtlList');
                AQ(this).addClass('FontSet');
                AQ(this).parent().addClass('AsRtlList_parent');
            }
        }

        let absoluteItem = AQ(this).parent().parent().find(".absolute.bottom-0")

        if (!absoluteItem.hasClass("AsOk")) {
            absoluteItem.addClass('AsOk');

            if (p) {
                absoluteItem.addClass('AsOkList_absolute');
            }
        }
    })
}

// Main activation function for ChatGPT
export function activateChatGptRTL(rtlAlgorithm = 'advanced_full') {
    // RTL algorithm is now available as parameter
    console.log('ChatGPT RTL activated with algorithm:', rtlAlgorithm);
    
    // Wait for React to fully load before initializing
    setTimeout(() => {
        initializeChatGptElements(rtlAlgorithm);
        initializeChatGptHistory();
    }, 1000);

    // SetInterval for periodic updates
    setInterval(() => {
        initializeChatGptElements(rtlAlgorithm);
        initializeChatGptHistory();
    }, 1000);
}



