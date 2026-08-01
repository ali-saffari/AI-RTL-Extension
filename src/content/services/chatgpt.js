// ChatGPT service functions
import { isRTL } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

let markdownObserver = null;
// Track last processing time per markdown element to avoid spamming
const markdownProcessTimes = new WeakMap();

export function initializeMarkdownObserver(rtlAlgorithm = 'advanced_section') {
    // Clean up existing observer
    if (markdownObserver) {
        markdownObserver.disconnect();
    }

    // Helper function to process markdown elements
    const processMarkdownElement = function(element) {

        // let text = AQ(element).text();

        console.log('processMarkdownElement');

    
        
        // Throttle processing per element to avoid spamming
        const now = Date.now();
        const last = markdownProcessTimes.get(element) || 0;
        if (now - last < 500) {
            return;
        }
        markdownProcessTimes.set(element, now);

        // Async to avoid layout thrash with rapid DOM updates
        // setTimeout(() => {

            console.log('processMarkdownElement ');


            AQ(element).addClass("AsSetAlgorithm")
            processTextElementsByRtlAlgorithm(element, rtlAlgorithm, {
                fontClass: 'FontSetImportantGPT',
                processedClass: 'AsOkText',
                isContainer: true,
                siteConfig: 'chatgpt',
                setTextAlign: true
            });

            
      


        // }, 500);
    };

    // Create new observer
    markdownObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a .text-message .markdown element
                        const markdownElements = AQ(node).find('.markdown').add(
                            AQ(node).filter('.markdown')
                        );
                        
                        markdownElements.each(function() {
                            processMarkdownElement(this);
                        });

                        // Check if the added node is ul.divide-token-border-light or contains it
                        const suggestionElements = AQ(node).find('ul.divide-token-border-light .whitespace-pre-wrap').add(
                            AQ(node).filter('ul.divide-token-border-light .whitespace-pre-wrap')
                        );
                        
                        // Also check if the added node itself is ul.divide-token-border-light
                        if (AQ(node).is('ul.divide-token-border-light')) {
                            AQ(node).find('.whitespace-pre-wrap').each(function() {
                                if (!AQ(this).hasClass('AsOk')) {
                                    setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                                        fontClass: 'FontSet',
                                        processedClass: 'AsOk'
                                    });
                                }
                            });
                        }
                        
                        suggestionElements.each(function() {
                            if (!AQ(this).hasClass('AsOk')) {
                                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                                    fontClass: 'FontSet',
                                    processedClass: 'AsOk'
                                });
                            }
                        });
                    }
                });

                // If the mutation target is the suggestion list itself, re-process its items
                if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
                    const $target = AQ(mutation.target);
                    if ($target.is('ul.divide-token-border-light')) {
                        $target.find('.whitespace-pre-wrap').each(function() {
                            if (!AQ(this).hasClass('AsOk')) {
                                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                                    fontClass: 'FontSet',
                                    processedClass: 'AsOk'
                                });
                            }
                        });
                    }
                }
            }

            // Handle content changes (characterData mutations and childList changes inside markdown)
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                // Check if mutation target or its parent is .text-message .markdown
                let targetElement = mutation.target;
                
                // If it's a text node, get its parent element
                if (targetElement.nodeType === Node.TEXT_NODE) {
                    targetElement = targetElement.parentElement;
                }
                
                if (targetElement && targetElement.nodeType === Node.ELEMENT_NODE) {
                    const $target = AQ(targetElement);
                    
                    // Check if target itself is .text-message .markdown
                    if ($target.is('.markdown')) {
                        processMarkdownElement(targetElement);
                    } else {
                        // Check if target is inside .text-message .markdown
                        const markdownParent = $target.closest(' .markdown');
                        if (markdownParent.length > 0) {
                            processMarkdownElement(markdownParent[0]);
                        }
                    }
                }
            }
        });
    });

    // Start observing
    markdownObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

export function initializeChatGptElements(rtlAlgorithm = 'advanced_full') {
    // Check if React is still hydrating
    if (document.querySelector('[data-reactroot]') && !document.querySelector('[data-reactroot]').__reactInternalInstance) {
        console.log('React is still hydrating, skipping...');
        return;
    }
    let presentation = ".relative.flex.h-full "
    if (chrome.runtime?.id) {
        // AQ(fo).each(function (each) {
                addCopyright(AQ('#thread-bottom').find('.w-full .pointer-events-auto'), "text-xs text-token-text-secondary AsBoxB" , 'margin-top: 9px; margin-bottom: -11px;');
        // })
    }




    AQ('.hljs-comment').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    })

    // AQ('.markdown').each(function (each) {
    
    // AQ(element).addClass("AsSetAlgorithm")
    //     processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
    //         fontClass: 'FontSetImportantGPT',
    //         processedClass: 'AsOkText',
    //         isContainer: true,
    //         siteConfig: 'chatgpt',
    //         setTextAlign: true

    //     });
    // })

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



        // //پیشنهادات رو به زبان فارسی نشون بده
        // AQ('ul.divide-token-border-light .whitespace-pre-wrap').each(function (each) {
        //     setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
        //         fontClass: 'FontSet',
        //         processedClass: 'AsOk'
        //     });
        // })

  


     
    })


    
    AQ('.text-token-text-secondary span').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
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
    console.log('AI RTL activated with algorithm:', rtlAlgorithm);
    
    // // Wait for React to fully load before initializing
    // setTimeout(() => {
    //     initializeChatGptElements(rtlAlgorithm);
    //     initializeChatGptHistory();
    // }, 1000);

    // Run once immediately on activation
    initializeChatGptElements(rtlAlgorithm);
    initializeChatGptHistory();

    // Initialize MutationObserver for real-time markdown processing
    initializeMarkdownObserver(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        initializeChatGptElements(rtlAlgorithm);
        initializeChatGptHistory();
    }, 1000);
}



