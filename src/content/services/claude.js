// claude.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL } from '../utils/analyzeDirection.js';
import { processTextElements, getArticleTextElements, setTextDirectionAndFont } from '../utils/textDirectionUtils.js';

// Claude service functions
export function setItems_Claude() {
    let interval = setInterval(() => {
        set()
    }, 500)

    function set() {
        // Add copyright using utility function
        const $targetElement = $('.sticky fieldset.flex.flex-col .items-stretch.transition-all');
        if ($targetElement.length > 0) {
            addCopyright($targetElement.parent(), 'AsBoxClaude', '');
        }

        
        $(".ProseMirror").each(function (each) {
            if (!$(this).hasClass("AsOk")) {
                $(this).addClass('AsOk');
                $(this).addClass('FontClaude')

                
                const text = $(this).text();
                setTextDirectionAndFont(this, text, 'FontSet');
                
                // Add event listener for direction detection (removed 'input' to avoid React conflicts)
                $(this).on('keyup paste', function() {
                    const currentText = $(this).text();
                    console.log('Prompt textarea text:', currentText);
                    
                    // Use requestAnimationFrame to avoid React conflicts
                    requestAnimationFrame(() => {
                        setTextDirectionAndFont(this, currentText, 'FontSet');
                    });
                });
            }
        })

        

        // Process user messages for RTL detection
        $(".flex.flex-1.overflow-y-scroll.overflow-x-hidden.relative .flex-1.flex.flex-col  .mb-1.mt-1 ").each(function (each) {
            const text = $(this).find(".font-user-message  p.break-words").text()
            if (isRTL(text)) {
                if (!$(this).hasClass("AsRtlClaudeUser")) {
                    $(this).addClass('AsRtlClaudeUser');
                }
            }
        });

        $('.standard-markdown').each(function (each) {
            if (!$(this).hasClass("AsOk")) {
                $(this).addClass('AsOk');
                $(this).addClass('FontSet');
                $(this).addClass('FontClaude')
                
                


                processTextElements(
                    $(this), 
                    getArticleTextElements(), 
                    (element) => element.textContent,
                    'FontSet FontClaude',
                    'AsOkText'
                );
            }
             
        })

     
    }
}

// Main activation function for Claude
export function activateClaude() {
    console.log("activateClaude");
    setItems_Claude();
    let interval = setInterval(() => {
        setItems_Claude();
    }, 1000);
}


