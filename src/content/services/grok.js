// grok.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function setGrok(rtlAlgorithm = 'advanced_section') {
    if (chrome.runtime?.id) {
        // Add copyright if needed
        let copyrightElement = `.relative.w-full.px-gutter`
        addCopyright($(copyrightElement), 'AsBoxB', 'margin-bottom: -9px;margin-top: 7px;');
    }

    // Process response content markdown elements using RTL algorithm
    $('.response-content-markdown').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'noFont',
            processedClass: 'AsOk',
            isContainer: true,
            removeDirAuto: true,
            siteConfig: "grok"
        });
    });

    $('.rtl-mask-applied').each(function (each) {
        $(this).css('mask-image', 'none');
    });

    // // Find and log elements with contenteditable="true"
    // $('[contenteditable="true"]').each(function() {
    //     console.log('Found contenteditable element:', this);
    // });






    $('.ProseMirror').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'noFont',
            processedClass: false,
            setTextAlign: true
        });
});

     



}


// Main activation function for Grok
export function activateGrok(rtlAlgorithm = 'advanced_section') {
    
    // Initial setup
    setGrok(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setGrok(rtlAlgorithm);
    }, 1000);

    // Event listeners for contenteditable elements
    $(document).on('input keyup', '[contenteditable="true"]', function() {
        console.log('Content changed in contenteditable element (event):', this);
        
        // Find the reference element with specific classes
        const referenceElement = $('.flex.grow.gap-1\\.5.max-w-full.pointer-events-none.invisible');
        if (referenceElement.length > 0) {
            const referenceWidth = referenceElement.width() + 20;
            console.log('Reference element width:', referenceWidth);
            
            // Set width only for parent2 div
            const $parent2 = $(this).parent().parent();
            
            if ($parent2.length > 0) {
                $parent2.css('width', referenceWidth + 'px');
                console.log('Set parent2 div width to:', referenceWidth + 'px');
            }
        }
    });

    // Additional event listener for input event (real-time typing)
    $(document).on('input', '[contenteditable="true"]', function() {
        // Find the reference element with specific classes
        const referenceElement = $('.flex.grow.gap-1\\.5.max-w-full.pointer-events-none.invisible');
        if (referenceElement.length > 0) {
            const referenceWidth = referenceElement.width() + 20;
            
            // Set width only for parent2 div
            const $parent2 = $(this).parent().parent();
            
            if ($parent2.length > 0) {
                $parent2.css('width', referenceWidth + 'px');
            }
        }
    });

    // MutationObserver for .rtl-mask-applied elements and mask-image changes
    const maskObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Check for newly added .rtl-mask-applied elements
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const $node = $(node);
                        if ($node.hasClass('rtl-mask-applied')) {
                            $node.css('mask-image', 'none');
                        }
                        
                        // Check children for .rtl-mask-applied elements
                        $node.find('.rtl-mask-applied').each(function() {
                            $(this).css('mask-image', 'none');
                        });

                    }
                });
            } else if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'class') {
                    // Check for elements that get the rtl-mask-applied class added
                    const $target = $(mutation.target);
                    if ($target.hasClass('rtl-mask-applied')) {
                        $target.css('mask-image', 'none');
                    }
                } else if (mutation.attributeName === 'style') {
                    // Check for mask-image changes in style attribute
                    const $target = $(mutation.target);
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