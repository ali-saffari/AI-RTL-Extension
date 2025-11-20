// grok.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setGrok(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        // Add copyright if needed
        let copyrightElement = `.relative.w-full.px-gutter`
        addCopyright(AQ(copyrightElement), 'AsBoxB', 'margin-bottom: -9px;margin-top: 7px;');
    }

    // Process response content markdown elements using RTL algorithm
    AQ('.response-content-markdown').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'noFont',
            processedClass: 'AsOk',
            isContainer: true,
            removeDirAuto: true,
            siteConfig: "grok"
        });
    });

    AQ('.rtl-mask-applied').each(function (each) {
        AQ(this).css('mask-image', 'none');
    });






}


// Main activation function for Grok
export function activateGrok(rtlAlgorithm = 'advanced_full') {
    
    // Initial setup
    setGrok(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setGrok(rtlAlgorithm);
    }, 1000);

 

    // Additional event listener for input event (real-time typing)
    AQ(document).on('input', '[contenteditable="true"]', function() {
        // Find the reference element with specific classes
        const referenceElement = AQ('.flex.grow.gap-1\\.5.max-w-full.pointer-events-none.invisible');
        if (referenceElement.length > 0) {
            const referenceWidth = referenceElement.width() + 20;
            
            // Set width only for parent2 div
            const $parent2 = AQ(this).parent().parent();
            
            if ($parent2.length > 0) {
                $parent2.css('width', referenceWidth + 'px');
            }

            AQ('.ProseMirror').each(function (each) {
                const $element = AQ(this);
                
                // Check if dirAuto is enabled and direction cannot be detected
                let text = $element.text().trim();
                let placeholder = null;
                
                // If no text, check data-placeholder attribute
                if (!text) {
                    placeholder = $element.attr('data-placeholder');
                    if (placeholder) {
                        placeholder = placeholder.trim();
                        console.log('ProseMirror: Found data-placeholder:', placeholder);
                    } else {
                        // Check p elements inside for data-placeholder
                        const $pElements = $element.find('p');
                        for (let i = 0; i < $pElements.length; i++) {
                            const pPlaceholder = AQ($pElements[i]).attr('data-placeholder');
                            if (pPlaceholder) {
                                placeholder = pPlaceholder.trim();
                                console.log('ProseMirror: Found p data-placeholder:', placeholder);
                                break;
                            }
                        }
                    }
                }
                
                if (!text && !placeholder) {
                    // If no text and no placeholder, remove dir and text-align attributes
                    $element.removeAttr('dir');
                    $element.css('text-align', '');
                    console.log('ProseMirror: No text or placeholder found, removed dir and text-align');
                } else if (placeholder && !text) {
                    // If only placeholder exists, decide based on first word
                    const firstWord = placeholder.split(/\s+/)[0];
                    const direction = analyzeTextDirectionFirstWord(firstWord);
                    $element.attr('dir', direction);
                    console.log('ProseMirror: Set dir based on placeholder first word:', firstWord, '->', direction);
                } else if (text) {
                    // If text exists, use setTextDirectionAndFontByRtlAlgorithm
                    setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                        fontClass: 'noFont',
                        processedClass: false,
                        setTextAlign: true,
                        dirAuto: true
                    });
                }

 

                console.log('ProseMirror processed 2');
        });

        console.log('ProseMirror processed');
        }
    });

    // MutationObserver for .rtl-mask-applied elements and mask-image changes
    const maskObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Check for newly added .rtl-mask-applied elements
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const $node = AQ(node);
                        if ($node.hasClass('rtl-mask-applied')) {
                            $node.css('mask-image', 'none');
                        }
                        
                        // Check children for .rtl-mask-applied elements
                        $node.find('.rtl-mask-applied').each(function() {
                            AQ(this).css('mask-image', 'none');
                        });

                    }
                });
            } else if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'class') {
                    // Check for elements that get the rtl-mask-applied class added
                    const $target = AQ(mutation.target);
                    if ($target.hasClass('rtl-mask-applied')) {
                        $target.css('mask-image', 'none');
                    }
                } else if (mutation.attributeName === 'style') {
                    // Check for mask-image changes in style attribute
                    const $target = AQ(mutation.target);
                    if ($target.hasClass('rtl-mask-applied')) {
                        const currentMaskImage = $target.css('mask-image');
                        if (currentMaskImage && currentMaskImage !== 'none') {
                            $target.css('mask-image', 'none');
                        }
                    }
                }
            }
        });
    });
    
    // Start observing
    maskObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
}