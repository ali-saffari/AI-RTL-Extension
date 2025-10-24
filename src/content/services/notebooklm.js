// NotebookLM service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Helper function to detect text direction based on algorithm
function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    let direction;
    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        direction = detectTextDirection(text);
    } else if (rtlAlgorithm === 'first_word') {
        direction = analyzeTextDirectionFirstWord(text);
    } else {
        direction = detectTextDirection(text); // fallback
    }
    
    return direction;
}

export function setNotebooklm(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright($('.omnibar-container').parent() , 'AsBoxB' );
    }

    // Process textarea elements with RTL algorithm
    $('body textarea , body input[type="text"], body input[type="search"]').each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
        // Add event listener for real-time direction detection
        $(this).on('keyup paste input', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // Process input elements with RTL algorithm
    $('.projects-header , .mat-title-large , .mat-body-medium , [class*="project-button-"]').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
    
    });
    

    $('.mat-button-toggle-label-content , .mat-mdc-button , .extendable-label , .create-new-label , .project-table-title , .mat-mdc-cell , .mat-headline-medium  , .mat-label-small ,.mat-label-large ,.title-and-promo , .panel-header-content ,.panel-content-title ').each(function (each) {

            if (!$(this).hasClass("FontSet")) {
                $(this).addClass('FontSet');
            }
    
    });
    $('.panel-header-content .mat-title-small ,.footer , .selected-num ,.notebook-title ,.dropzone__description ,.loading-message').each(function (each) {

        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }

    });

    
    $('[class*="mat-"]:not([class*="mat-icon"]):not([class*="mat-fab"]):not([class*="mat-mini-fab"]):not([class*="mat-raised-button"]):not([class*="mat-flat-button"]):not([class*="mat-stroked-button"])').each(function (each) {



        if (!$(this).hasClass("AsOkFontSet")) {
            $(this).addClass('AsOkFontSet');
            const text = $(this).val() || $(this).text();
            const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);

            if (direction === 'rtl') {
                $(this).addClass('FontSet');
            }
          
        }

    });

    
    $('.message-text-content , .summary-content').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });




 
    // Process notebook content elements using RTL algorithm
    // $('.notebook-content, .notebook-text, .document-content, .source-content, .summary-content, .generated-content').each(function (each) {
    //     processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsOk',
    //         isContainer: true,
    //         setTextAlign: true
    //     });
    // });
}

// Main activation function for NotebookLM
export function activateNotebooklm(rtlAlgorithm = 'advanced_full') {
    console.log('NotebookLM RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setNotebooklm(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setNotebooklm(rtlAlgorithm);
    }, 500);
}
