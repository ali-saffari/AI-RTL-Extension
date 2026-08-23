// claude.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, applyRtlToContainer, applyRtlToElement, detectDirectionByAlgorithm } from '../utils/textDirectionUtils.js';

// Claude service functions
export function setItems_Claude(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo = '.sticky fieldset.flex.flex-col .items-stretch.transition-all';
        if (AQ(fo).length > 0) {
            addCopyright(AQ(fo).parent(), 'AsBoxClaude AsBoxB', '');
        }
    }

    AQ('.ProseMirror , textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        if (!AQ(this).hasClass("AsOk")) {
            AQ(this).addClass('AsOk FontClaude');
            
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk'
            });
            
            AQ(this).on('keyup paste input', function() {
                requestAnimationFrame(() => {
                    applyRtlToElement(this, rtlAlgorithm, {
                        fontClass: 'FontSet'
                    });
                });
            });
        }
    });


    



    AQ('ul.flex.flex-col li > div').each(function (each) {

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);


        const text = AQ(this).find('.whitespace-nowrap').text();
        
        const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);
        
        if (direction === 'rtl' && !AQ(this).hasClass("AsRtlClaudeList")) {
            AQ(this).addClass('AsRtlClaudeList');
            // AQ(this).addClass('FontSet');

            // AQ(this).find('.break-words').addClass('AsRtl');
        }
    });

    AQ('[data-row-key^="chat:"] .flex-1').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });



    



    AQ('.mb-1 .group').each(function (each) {

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);


        const text = AQ(this).find('.break-words').text();
        
        const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);
        
        if (direction === 'rtl' && !AQ(this).hasClass("AsRtlClaudeUser")) {
            AQ(this).addClass('AsRtlClaudeUser');
            AQ(this).addClass('FontSet');

            AQ(this).find('.break-words').addClass('AsRtl');
        }
    });


    AQ(' .contents .truncate').each(function (each) {
        // AQ(this).addClass('AsOk FontSet FontClaude');
        
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText',
            isContainer: false
        });
    });

    AQ('[data-ask-user-input-banner="true"] , [data-testid="ask-user-answers-card"] ').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });



    AQ(' .contents .font-base-bold , [data-orientation="horizontal"] button').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });


    
    

    // پاسخ های کلاود
    AQ('.standard-markdown , .progressive-markdown , .font-claude-response').each(function (each) {
        // AQ(this).addClass('AsOk FontSet FontClaude');
        
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // بخشی که سمت راست باز میشود
    AQ('#standard-markdown-artifact , #markdown-artifact').each(function (each) {

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);


        AQ(this).addClass('AsOk FontSet FontClaude');
        
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText',
            isContainer: true
        });
    });

    // پیام‌های کاربر
    AQ('[data-testid="user-message"]').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    // بخش مقاله وسط متن ها
    AQ('.artifact-block-cell .leading-tight , .whitespace-pre-wrap.rounded-lg , .group\\/thumbnail p ').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
    });

    AQ('text').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet FontClaude',
            processedClass: 'AsOkText'
        });
    });

    applyClaudeFontWeights();
}

const CLAUDE_FONT_WEIGHT_STYLE_ID = 'ai-rtl-claude-font-weights';
const CLAUDE_FONT_WEIGHT_CSS = `
* {
    --cds-font-weight-regular: 350 !important;
    --cds-font-weight-medium: 500 !important;
    --cds-font-weight-semibold: 680 !important;
    --cds-font-weight-bold: 700 !important;
}
`;

function applyClaudeFontWeights() {
    let style = document.getElementById(CLAUDE_FONT_WEIGHT_STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = CLAUDE_FONT_WEIGHT_STYLE_ID;
        style.textContent = CLAUDE_FONT_WEIGHT_CSS;
    }
    const parent = document.head || document.documentElement;
    if (style.parentNode !== parent || parent.lastElementChild !== style) {
        parent.appendChild(style);
    }
}

export function activateClaude(rtlAlgorithm = 'advanced_full') {
    console.log("activateClaude with RTL algorithm:", rtlAlgorithm);

    applyClaudeFontWeights();
    setItems_Claude(rtlAlgorithm);

    // SetInterval for periodic updates
    setInterval(() => {
        setItems_Claude(rtlAlgorithm);
    }, 1000);
}


