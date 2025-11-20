// claude.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Element Processing Map - آرایه ای از آبجکت ها شامل target و function
const ELEMENT_MAP = [
    {
        target: '.sticky fieldset.flex.flex-col .items-stretch.transition-all',
        function: (element) => {
            if (AQ(element).length > 0) {
                addCopyright(AQ(element).parent(), 'AsBoxClaude', '');
            }
        }
    },
    {
        target: '.ProseMirror , textarea',
        function: (element, rtlAlgorithm) => {
            
            if (AQ(this).data('rtl-listener-added')) {
                return;
            }
            AQ(this).data('rtl-listener-added', true);

            
            if (!AQ(element).hasClass("AsOk")) {
                AQ(element).addClass('AsOk FontClaude');
                
                setTextDirectionAndFontByRtlAlgorithm(element, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: 'AsOk'
                });
                
                AQ(element).on('keyup paste input', function() {
     
                    
                    requestAnimationFrame(() => {
                        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                            fontClass: 'FontSet'
                        });
                    });
                });
            }
        }
    },
    {
        target: '.mb-1.mt-1',
        function: (element, rtlAlgorithm) => {
            const text = AQ(element).find('.break-words').text();
            
            if (isRTL(text) && !AQ(element).hasClass("AsRtlClaudeUser")) {
                AQ(element).addClass('AsRtlClaudeUser');
                AQ(element).addClass('FontSet');
            }
        }
    },
    {
        //پاسخ های کلاود
        target: '.standard-markdown , .progressive-markdown , .font-claude-response',
        function: (element, rtlAlgorithm) => {
            AQ(element).addClass('AsOk FontSet FontClaude');
            
            processTextElementsByRtlAlgorithm(element, rtlAlgorithm, {
                fontClass: 'FontSet FontClaude',
                processedClass: 'AsOkText',
                isContainer: true
            });
        }
    },
    {
        //بخشی که سمت راست باز میشود
        target: '#standard-markdown-artifact , #markdown-artifact',
        function: (element, rtlAlgorithm) => {
            AQ(element).addClass('AsOk FontSet FontClaude');
            
            processTextElementsByRtlAlgorithm(element, rtlAlgorithm, {
                fontClass: 'FontSet FontClaude',
                processedClass: 'AsOkText',
                isContainer: true
            });
        }
    },
    {
        //بخش مقاله وسط متن ها
        target: '.artifact-block-cell .leading-tight',
        function: (element, rtlAlgorithm) => {
  
                
                setTextDirectionAndFontByRtlAlgorithm(element, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: 'AsOk'
                });
            
        }
    }
];




// Claude service functions
export function setItems_Claude(rtlAlgorithm = 'advanced_full') {
    let interval = setInterval(() => {
        set(rtlAlgorithm)
    }, 500)
    set(rtlAlgorithm)
    function set(rtlAlgorithm) {
        // Process all elements using the mapping array
        ELEMENT_MAP.forEach(({ target, function: processFunction }) => {
            AQ(target).each(function() {
                processFunction(this, rtlAlgorithm);
            });
        });
    }
}

// Main activation function for Claude
export function activateClaude(rtlAlgorithm = 'advanced_full') {
    console.log("activateClaude with RTL algorithm:", rtlAlgorithm);
    
    // Initial setup
    setItems_Claude(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setItems_Claude(rtlAlgorithm);
    }, 1000);

    // MutationObserver for content changes with debouncing
    let timeoutId;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log("Claude content changed");
            setItems_Claude(rtlAlgorithm);
        }, 200);
    });

    const targetNode = document.querySelector('main') || document.body;
    const config = {attributes: true, childList: true, subtree: true};
    
    if (targetNode) {
        observer.observe(targetNode, config);
    } else {
        console.log('targetNode not found - observer not started');
    }
}


