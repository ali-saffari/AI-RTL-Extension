// perplexity.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

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

    // Process group/title elements
    AQ(".group\\/title").each(function (each) {
        const parentGroup = AQ(this).closest('.group');
        if (parentGroup.length > 0 && !parentGroup.hasClass("AsRtl")) {
            // Apply RTL to parent group using RTL algorithm
            parentGroup.addClass('AsRtl');
            setTextDirectionAndFontByRtlAlgorithm(parentGroup[0], rtlAlgorithm, {
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

    // Process noopener links (site cards)
    AQ('a[rel="noopener"]').each(function (each) {
        if (!AQ(this).hasClass("AsRtl")) {
            AQ(this).addClass('AsRtl');
            
            // Apply RTL algorithm
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
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

    // Process Related list items
    AQ(".group.flex.cursor-pointer.items-center.justify-between.py-sm").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
    });

    // Process typing suggestions
    AQ(".grow.block .w-full").each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet FontSetImportant',
            processedClass: 'AsRtl'
        });
    });

    // Process markdown content elements
    AQ('.prose.text-pretty').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}



// Main activation function for Perplexity
export function activatePerplexity(rtlAlgorithm = 'advanced_full') {
    console.log('Perplexity RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setPerplexity(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setPerplexity(rtlAlgorithm);
    }, 500);

    // Additional processing for specific elements
    setInterval(() => {
        AQ('[role="textbox"]').each(function (each) {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
        });

        AQ(".will-change-auto").each(function (each) {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet FontSetImportant',
                    processedClass: 'AsRtl'
                });
        });
    }, 300);
}