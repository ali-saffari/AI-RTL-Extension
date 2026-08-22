// perplexity.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setPerplexity(rtlAlgorithm = 'advanced_full') {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.bottom-safeAreaInsetBottom .pointer-events-auto .grow`
        
        // Remove elements with .bg-subtler class inside fo2
        AQ('.bottom-safeAreaInsetBottom .pointer-events-auto').find('.bg-subtler').removeClass('bg-subtler');
        
        addCopyright(AQ(fo2), 'AsBoxPerplexity AsBoxPerplexity bg-background dark:bg-backgroundDark', '');
    }

    // Set body font class
    AQ("body").each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
            AQ(this).addClass('FontSetPerplexity');
        }
    });

    // عنوان های چت
    AQ(".group\\/title").each(function (each) {
        const parentGroup = AQ(this).closest('.group');
        if (parentGroup.length > 0 && !parentGroup.hasClass("AsRtl")) {
            // Apply RTL to parent group using RTL algorithm
            parentGroup.addClass('AsRtl');
            applyRtlToElement(parentGroup[0], rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
            
            // Change margin-right to margin-left for internal elements
            parentGroup.find('.md\\:mr-xl').each(function() {
                if (!AQ(this).hasClass("AsRtl")) {
                    AQ(this).addClass('AsRtl');
                }
                AQ(this).removeClass('md:mr-xl').addClass('md:ml-xl');
            });
            
            // Change right-0 to left-0 for internal elements
            parentGroup.find('.right-0').each(function() {
                if (!AQ(this).hasClass("AsRtl")) {
                    AQ(this).addClass('AsRtl');
                }
                AQ(this).removeClass('right-0').addClass('left-0');
            });
        }
    });


        // چت ها
        AQ('.prose').each(function (each) {
            applyRtlToContainer(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk',
                isContainer: true,
                setTextAlign: true
            });
        });




        AQ('.not-prose').each(function (each) {
       
            

            const notProse = this;

            // Find all elements inside .not-prose (including itself)
     
            // Find elements with data-testid="code-language-indicator" inside .not-prose
            AQ(this).find('[data-testid="code-language-indicator"]').each(function() {
                const element = this;
                const textContent = AQ(element).text().trim();
                

                console.log(textContent);
                // If textContent equals "text", apply RTL algorithm on code element
                if (textContent === 'text') {
                    // Find code element inside .not-prose
                    const codeElement = AQ(notProse).find('code').first()[0];
                    if (codeElement) {
               
                        AQ(codeElement).find('span').each(function() {
                            const spanElement = this;
                            if (!AQ(spanElement).hasClass('AsOk')) {
                                applyRtlToElement(spanElement, rtlAlgorithm, {
                                    fontClass: 'FontSet',
                                    processedClass: 'AsOk',
                                    setTextAlign: true
                                });
                            }
                        });

                    }

                } else {
                    AQ(notProse).find('*').addBack().each(function() {
                        const element = this;
                        const computedStyle = window.getComputedStyle(element);
                        const textAlign = computedStyle.textAlign;
                        
                        // Check if text-align is right
                        if (textAlign === 'right') {
                            AQ(element).css('text-align', 'left');
                        }
                    });
                    
                }
            });
            
       
        });

        



    // Process noopener links (site cards)
    AQ('a[rel="noopener"]').each(function (each) {
        if (!AQ(this).hasClass("AsRtl")) {
            AQ(this).addClass('AsRtl');
            
            // Apply RTL algorithm
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
            
            // Get text from .text-foreground or fallback to link text for additional styling
            const textForegroundElement = AQ(this).find('.text-foreground').first();
            const textToAnalyze = textForegroundElement.length > 0 
                ? textForegroundElement.text() 
                : AQ(this).text();
            
            // For RTL text, change text-left to text-right in text-foreground
            if (textToAnalyze && textToAnalyze.trim()) {
                let direction = null;
                
                if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
                    direction = detectTextDirection(textToAnalyze);
                } else if (rtlAlgorithm === 'first_word') {
                    direction = analyzeTextDirectionFirstWord(textToAnalyze);
                }
              
                if (direction === 'rtl' && textForegroundElement.length > 0) {
                    const textLeftElement = textForegroundElement.find('.text-left');
                    if (textLeftElement.length > 0) {
                        textLeftElement.removeClass('text-left').addClass('text-right');
                    }
                }
            }
        }
    });

    // // Process Related list items
    AQ(".group.flex.interactable.py-sm").each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
    });

    // Process typing suggestions
    // AQ(".grow.block .w-full").each(function (each) {
    //     applyRtlToElement(this, rtlAlgorithm, {
    //         fontClass: 'FontSet FontSetImportant',
    //         processedClass: 'AsRtl'
    //     });
    // });


            AQ('[role="textbox"] p').each(function (each) {

                if (!AQ(this).hasClass("FontSet")) {
                    AQ(this).addClass('FontSet');
                }
             
        
        });



}



// Monitor changes to elements with data-type="portal"
function observePortalElements(rtlAlgorithm) {
    const portalProcessTimes = new WeakMap();

    // Process portal element
    const processPortalElement = function(portalElement) {
        // Throttle processing per element to avoid spamming
        const now = Date.now();
        const last = portalProcessTimes.get(portalElement) || 0;
        if (now - last < 500) {
            return;
        }
        portalProcessTimes.set(portalElement, now);

        // Async to avoid layout thrash with rapid DOM updates
        
        const portalText = portalElement.textContent || '';
        const direction = (rtlAlgorithm === 'first_word') 
            ? analyzeTextDirectionFirstWord(portalText)
            : detectTextDirection(portalText);
        
        if (direction) {
            portalElement.setAttribute('dir', direction);
            if (direction === 'rtl') {
                AQ(portalElement).addClass('AsRtlPerplexity');
            } else {
                AQ(portalElement).removeClass('AsRtlPerplexity');
            }
        }


        setTimeout(() => {
            const portalText = portalElement.textContent || '';
            const direction = (rtlAlgorithm === 'first_word') 
                ? analyzeTextDirectionFirstWord(portalText)
                : detectTextDirection(portalText);
            
            if (direction) {
                portalElement.setAttribute('dir', direction);
                if (direction === 'rtl') {
                    AQ(portalElement).addClass('AsRtlPerplexity');
                } else {
                    AQ(portalElement).removeClass('AsRtlPerplexity');
                }
            }
        }, 500);
    };

    // Observer for portal changes
    const portalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a portal or contains portals
                        const portalElements = AQ(node).find('[data-type="portal"]').add(
                            AQ(node).filter('[data-type="portal"]')
                        );
                        
                        portalElements.each(function() {
                            processPortalElement(this);
                        });
                    }
                });
            }

            // Handle content changes (characterData mutations and childList changes inside portal)
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                let targetElement = mutation.target;
                
                // If it's a text node, get its parent element
                if (targetElement.nodeType === Node.TEXT_NODE) {
                    targetElement = targetElement.parentElement;
                }
                
                if (targetElement && targetElement.nodeType === Node.ELEMENT_NODE) {
                    const $target = AQ(targetElement);
                    
                    // Check if target itself is portal
                    if ($target.is('[data-type="portal"]')) {
                        processPortalElement(targetElement);
                    } else {
                        // Check if target is inside a portal
                        const portalParent = $target.closest('[data-type="portal"]');
                        if (portalParent.length > 0) {
                            processPortalElement(portalParent[0]);
                        }
                    }
                }
            }
        });
    });

    // Observe document body for new portals
    portalObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Process existing portals
    AQ('[data-type="portal"]').each(function() {
        processPortalElement(this);
    });
}

// Main activation function for Perplexity
export function activatePerplexity(rtlAlgorithm = 'advanced_full') {
    console.log('Perplexity RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setPerplexity(rtlAlgorithm);
    
    // Monitor changes to elements with data-type="portal"
    observePortalElements(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setPerplexity(rtlAlgorithm);
    }, 500);

    // Additional processing for specific elements
    setInterval(() => {
    //     // AQ('[role="textbox"]').each(function (each) {
    //     //     applyRtlToElement(this, rtlAlgorithm, {
    //     //         fontClass: 'FontSet',
    //     //         processedClass: 'AsRtl'
    //     //     });
    //     // });

        // AQ('[role="textbox"] p').each(function (each) {
        //     applyRtlToElement(this, rtlAlgorithm, {
        //         fontClass: 'FontSet',
        //         processedClass: 'AsOK'

        //     });
        // });

    //     AQ(".will-change-auto").each(function (each) {
    //             applyRtlToElement(this, rtlAlgorithm, {
    //                 fontClass: 'FontSet FontSetImportant',
    //                 processedClass: 'AsRtl'
    //             });
    //     });
    }, 300);
}