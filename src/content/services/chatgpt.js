// ChatGPT service functions
import { isRTL, detectTextDirection } from '../utils/analyzeDirection.js';
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processParagraphWithBreaks } from '../utils/textDirectionUtils.js';

export function initializeChatGptElements() {
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
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSet' });
        }
    })

    $('.text-message .markdown').each(function (each) {

            
            processTextElementsAdvanced($(this), {
                fontClass: 'FontSetImportantGPT',
                processedClass: 'AsOkText',
                isContainer: true,
            });
            
        
        
    })

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
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSetImportantGPT', text });
            $(this).addClass('flex-row-reverse');
        }
    })

    $("#prompt-textarea").each(function (each) {
        if (!$(this).hasClass("AsOk")) {
            $(this).addClass('AsOk');
            const text = $(this).text();
            setTextDirectionAndFont(this, { fontClass: 'FontSetImportantGPT', text });
            
            // Add event listener for direction detection (removed 'input' to avoid React conflicts)
            $(this).on('keyup paste', function() {
                const currentText = $(this).text();
                console.log('Prompt textarea text:', currentText);
                
                // Use requestAnimationFrame to avoid React conflicts
                requestAnimationFrame(() => {
                    setTextDirectionAndFont(this, { fontClass: 'FontSetImportantGPT', text: currentText });
                });
            });
        }
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
    // Wait for React to fully load before initializing
    setTimeout(() => {
        initializeChatGptElements();
        initializeChatGptHistory();
    }, 1000);

    // SetInterval for periodic updates
    setInterval(() => {
        initializeChatGptElements();
        initializeChatGptHistory();
    }, 1000);

    // MutationObserver for content changes with debouncing
    let timeoutId;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log("تغیر");
            initializeChatGptElements();
        }, 200);
    });

    const observerB = new MutationObserver((mutations) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log("تغیر B");
            initializeChatGptHistory();
        }, 300);
    });

    const targetNode = document.querySelector('main.relative.h-full.w-full');
    const config = {attributes: true, childList: true, subtree: true};
    
    if (targetNode) {
        observer.observe(targetNode, config);
    } else {
        console.log('targetNode not found - observer not started');
    }

    const targetNodeB = document.querySelector('.bg-token-sidebar-surface-primary');
    const configB = {attributes: true, childList: true, subtree: true};
    
    if (targetNodeB) {
        observerB.observe(targetNodeB, configB);
    } else {
        console.log('targetNodeB not found - observerB not started');
    }
}



