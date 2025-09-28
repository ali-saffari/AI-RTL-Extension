// ChatGPT service functions
import { isRTL, detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processParagraphWithBreaks, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Observer for .text-message .markdown elements
let markdownObserver = null;

export function initializeMarkdownObserver(rtlAlgorithm = 'advanced_section') {
    // Clean up existing observer
    if (markdownObserver) {
        markdownObserver.disconnect();
    }

    // Create new observer
    markdownObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a .text-message .markdown element
                        const markdownElements = $(node).find('.text-message .markdown').add(
                            $(node).filter('.text-message .markdown')
                        );
                        
                        markdownElements.each(function() {
                         
                            setTimeout(() => {
                                processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
                                    fontClass: 'FontSetImportantGPT',
                                    processedClass: 'AsOkText',
                                    isContainer: true
                                });
                            }, 100);
                        
                        });
                    }
                });
            }
        });
    });

    // Start observing
    markdownObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

export function initializeChatGptElements(rtlAlgorithm = 'advanced_section') {
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
        $(fo).each(function (each) {
                addCopyright($(this).parent(), "text-xs text-token-text-secondary AsBoxB" , 'margin-top: 1px');
        })
    }

    $('.hljs-comment').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    })

    // $('.text-message .markdown').each(function (each) {
    //     processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
    //         fontClass: 'FontSetImportantGPT',
    //         processedClass: 'AsOkText',
    //         isContainer: true
    //     });
    // })

    $(presentation + '.h-full .w-full.text-token-text-primary .relative.rounded-3xl').each(function (each) {
        if (!$(this).parent().hasClass("AsOk")) {
            $(this).parent().addClass('AsOk');
            const text = $(this).text()
            $(this).addClass('FontSetImportantGPT');
            if (isRTL(text)) {
                $(this).parent().addClass("setRight")
            }

        }
    })

    $('body').each(function (each) {
        $(this).addClass('FontSet');
    })

    $(presentation).each(function (each) {
        $(this).addClass('FontSet');
    })

    $(presentation + '#prosemirror-editor-container').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOk',
            rtlClass: 'flex-row-reverse'
        });
    })

    $("#prompt-textarea").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportantGPT',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        $(this).on('keyup paste', function() {
            const currentText = $(this).text();
            console.log('Prompt textarea text:', currentText);
            
            // Use requestAnimationFrame to avoid React conflicts
            requestAnimationFrame(() => {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                });
            });
        });
    })
}

export function initializeChatGptHistory() {
    $('#history .__menu-item').each(function (each) {
        const text = $(this).text()
        let p = isRTL(text);

        if ((text !== "New chat") && !$(this).hasClass("AsOkList")) {
            $(this).addClass('AsOkList');

            if (p) {
                $(this).attr("dir", "rtl");
                $(this).addClass('AsRtlList');
                $(this).addClass('FontSet');
                $(this).parent().addClass('AsRtlList_parent');
            }
        }

        let absoluteItem = $(this).parent().parent().find(".absolute.bottom-0")

        if (!absoluteItem.hasClass("AsOk")) {
            absoluteItem.addClass('AsOk');

            if (p) {
                absoluteItem.addClass('AsOkList_absolute');
            }
        }
    })
}

// Main activation function for ChatGPT
export function activateChatGptRTL(rtlAlgorithm = 'advanced_section') {
    // RTL algorithm is now available as parameter
    console.log('ChatGPT RTL activated with algorithm:', rtlAlgorithm);
    
    // Initialize the markdown observer
    initializeMarkdownObserver(rtlAlgorithm);
    
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



