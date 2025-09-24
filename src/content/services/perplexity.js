// perplexity.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced } from '../utils/textDirectionUtils.js';

export function setPerplexity() {
    // Add copyright using utility function
    if (chrome.runtime?.id) {
        let fo2 = `.bottom-safeAreaInsetBottom .pointer-events-auto .grow`
        
        // Remove elements with .bg-subtler class inside fo2
        $('.bottom-safeAreaInsetBottom .pointer-events-auto').find('.bg-subtler').removeClass('bg-subtler');
        
        addCopyright($(fo2), 'AsBoxPerplexity AsBoxPerplexity bg-background dark:bg-backgroundDark', '');
    }


    $("body").each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
            $(this).addClass('FontSetPerplexity');
        }
    });

    // Process group/title elements
    $(".group\\/title").each(function (each) {
        const parentGroup = $(this).closest('.group');
        if (parentGroup.length > 0 && !parentGroup.hasClass("AsRtl")) {
            // Apply RTL to parent group
            parentGroup.addClass('AsRtl');
            const text = parentGroup.text();
            if (text && text.trim()) {
                parentGroup.attr("dir", detectTextDirection(text));
            }
            parentGroup.addClass('FontSet');
            parentGroup.attr("data-perplexity-debug", "group-title");
            
            // Change margin-right to margin-left for internal elements
            parentGroup.find('.md\\:mr-xl').each(function() {
                if (!$(this).hasClass("AsRtl")) {
                    $(this).addClass('AsRtl');
                    $(this).attr("data-perplexity-debug", "margin-change");
                }
                $(this).removeClass('md:mr-xl').addClass('md:ml-xl');
            });
            
            // Change right-0 to left-0 for internal elements
            parentGroup.find('.right-0').each(function() {
                if (!$(this).hasClass("AsRtl")) {
                    $(this).addClass('AsRtl');
                    $(this).attr("data-perplexity-debug", "position-change");
                }
                $(this).removeClass('right-0').addClass('left-0');
            });
        }
    });



    // Process noopener links یا همون کارت سایت ها
    $('a[rel="noopener"]').each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            
            // Get text from .text-foreground or fallback to link text
            const textForegroundElement = $(this).find('.text-foreground').first();
            const textToAnalyze = textForegroundElement.length > 0 
                ? textForegroundElement.text() 
                : $(this).text();
            
            // Apply direction detection and styling
            if (textToAnalyze && textToAnalyze.trim()) {
                const direction = detectTextDirection(textToAnalyze);
                $(this).attr("dir", direction);
                
                // For RTL text, change text-left to text-right in text-foreground
                if (direction === 'rtl' && textForegroundElement.length > 0) {
                    const textLeftElement = textForegroundElement.find('.text-left');
                    if (textLeftElement.length > 0) {
                        textLeftElement.removeClass('text-left').addClass('text-right');
                    }
                }
            }
            
            $(this).addClass('FontSet');
            $(this).attr("data-perplexity-debug", "noopener-link");
        }
    });





    //لیست Related ها 
    $(".group.flex.cursor-pointer.items-center.justify-between.py-sm").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).attr("data-perplexity-debug", "group.flex");
        }
    });

    



    // پیشنهاد های هنگام تایپ
    
    $(".grow.block .w-full").each(function (each) {
        if (!$(this).hasClass("AsRtl")) {
            $(this).addClass('AsRtl');
            const text = $(this).text();
            if (text && text.trim()) {
                $(this).attr("dir", detectTextDirection(text));
            }
            $(this).addClass('FontSet');
            $(this).addClass('FontSetImportant');
            $(this).attr("data-perplexity-debug", "grow.block");
        }
    });




  // Process elements with id starting with markdown-content
  $('.prose.text-pretty').each(function (each) {
    processTextElementsAdvanced($(this), {
        fontClass: 'FontSet',
        processedClass: 'AsOk',
        isContainer: true,
        setTextAlign: true
    });
  });


}



// Main activation function for Perplexity
export function activatePerplexity() {
    console.log("activatePerplexity");
    
    // Initial setup
    setPerplexity();
    
    // SetInterval for continuous processing
    setInterval(() => {
        setPerplexity();
    }, 1000);
    


    setInterval(() => {
        $('[role="textbox"]').each(function (each) {
            $(this).addClass('AsRtl');
            const text = $(this).text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $(this).attr("dir", direction);
                $(this).find('p').attr("dir", direction);
            }
            $(this).addClass('FontSet');
            $(this).attr("data-perplexity-debug", "textbox");
            console.log("Processed textbox element:", $(this)[0]);
        });

      
    }, 500);

}