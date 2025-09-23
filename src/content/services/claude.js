// claude.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL } from '../utils/analyzeDirection.js';
import { processTextElements, getArticleTextElements, setTextDirectionAndFont } from '../utils/textDirectionUtils.js';

// Element Processing Map - آرایه ای از آبجکت ها شامل target و function
const ELEMENT_MAP = [
    {
        target: '.sticky fieldset.flex.flex-col .items-stretch.transition-all',
        function: (element) => {
            if ($(element).length > 0) {
                addCopyright($(element).parent(), 'AsBoxClaude', '');
            }
        }
    },
    {
        target: '.ProseMirror , textarea',
        function: (element) => {
            if (!$(element).hasClass("AsOk")) {
                $(element).addClass('AsOk FontClaude');
                
                // Use appropriate method based on element type
                const text = $(element).is('textarea') ? $(element).val() : $(element).text();
                setTextDirectionAndFont(element, { fontClass: 'FontSet', text });
                
                $(element).on('keyup paste input', function() {
                    // Use appropriate method based on element type
                    const currentText = $(this).is('textarea') ? $(this).val() : $(this).text();
                    console.log('Prompt textarea text:', currentText);
                    
                    requestAnimationFrame(() => {
                        setTextDirectionAndFont(this, { fontClass: 'FontSet', text: currentText });
                    });
                });
            }
        }
    },
    {
        target: '.mb-1.mt-1',
        function: (element) => {


            const text = $(element).find('.break-words').text();
            
            if (isRTL(text) && !$(element).hasClass("AsRtlClaudeUser")) {
                $(element).addClass('AsRtlClaudeUser');
                $(element).addClass('FontSet');
            }
        }
    },
    {

        //پاسخ های کلاود
        target: '.standard-markdown , .progressive-markdown , .whitespace-normal',
        function: (element) => {
           
                $(element).addClass('AsOk FontSet FontClaude');
                
                processTextElements(
                    $(element), 
                    getArticleTextElements(), 
                    (element) => element.textContent,
                    'FontSet FontClaude',
                    'AsOkText',
                    true
                );
            
        }
    },
    {

        //بخشی که سمت راست باز میشود
        target: '#standard-markdown-artifact , #markdown-artifact',
        function: (element) => {
            // if (!$(element).hasClass("AsOk")) {
                $(element).addClass('AsOk FontSet FontClaude');
                
                processTextElements(
                    $(element), 
                    getArticleTextElements(), 
                    (element) => element.textContent,
                    'FontSet FontClaude',
                    'AsOkText',
                    true
                );
            // }
        }
    },
    {

        //بخش مقاله وسط متن ها
        target: '.artifact-block-cell .leading-tight',
        function: (element) => {
            if (!$(element).hasClass("AsOk")) {
                $(element).addClass('AsOk FontClaude');
                
                const text = $(element).text();
                setTextDirectionAndFont($(element), { fontClass: 'FontSet', text });
                
            }
        }
    }
];




// Claude service functions
export function setItems_Claude() {
    let interval = setInterval(() => {
        set()
    }, 500)
    set()
    function set() {
        // Process all elements using the mapping array
        ELEMENT_MAP.forEach(({ target, function: processFunction }) => {
            $(target).each(function() {
                processFunction(this);
            });
        });
    }
}

// Main activation function for Claude
export function activateClaude() {
    console.log("activateClaude");
    setItems_Claude();
}


