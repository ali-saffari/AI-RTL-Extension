// gemini.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

export function setGemini(rtlAlgorithm = 'advanced_full') {
    if (!isExtensionContextValid()) {
        return;
    }

    let fo2 = `.hallucination-disclaimer`
    
    // Add copyright using utility function
    addCopyright(AQ(fo2), 'AsBoxGemini AsBoxB' , 'margin-top: 1px; margin-top: -6px; margin-bottom: 4px; font-size: 13px;');

    // Process markdown panels with RTL algorithm
    // AQ('.markdown-main-panel , .ProseMirror , .research-step-description').each(function (each) {
    //     processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsOk',
    //         isContainer: true,
    //         setTextAlign: true
    //     });
    // });

    try {
        AQ('.markdown-main-panel ,.immersive-editor').each(function (each) {
            processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk',
                isContainer: true,
                setTextAlign: true
            });
        });


        // Process Gemini UI elements
        AQ('.gds-label-l , .gds-body-l , .gds-body-m و .gds-title-m , .research-step-title , .gds-body-m , .mat-button-toggle-label-content , .title-text ,.mdc-button__label ,.gds-body-s , .gds-label-m , .gds-label-s , .gds-label-xs , .gds-label-xxs , .gds-label-m-alt , .gds-body-m-alt , .gds-body-s-alt , .gds-body-xs-alt').each(function (each) {
            if (!AQ(this).hasClass("FontSet")) {
                AQ(this).addClass('FontSet');
            }
        });
    } catch (error) {
        if (!isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated')) {
            return;
        }
        throw error;
    }
}



// Main activation function for Gemini
export function activateGemini(rtlAlgorithm = 'advanced_full') {
    console.log("activateGemini with RTL algorithm:", rtlAlgorithm);
    // Initial setup
    setGemini(rtlAlgorithm);
  


    let oldText = '';
    const stopGeminiTimers = () => {
        clearInterval(fontInterval);
        clearInterval(geminiInterval);
    };

    const fontInterval = setInterval(() => {
        try {
            if (!isExtensionContextValid()) {
                stopGeminiTimers();
                return;
            }

            AQ('.bot-name-ugc-label ').each(function (each) {
                // console.log("gds-label-l", this)
                if (!AQ(this).hasClass("FontSet")) {
                    AQ(this).addClass('FontSet');
                }
            });

            AQ('.ql-editor').each(function (each) {
                // console.log("gds-label-l", this)
                if (!AQ(this).hasClass("FontSet")) {
                    AQ(this).addClass('FontSet');
                }
            });

            AQ('.ql-editor p').each(function (each) {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: false,
                    setTextAlign: true
                });
            });
        } catch (error) {
            if (!isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated')) {
                stopGeminiTimers();
                return;
            }
            throw error;
        }
    }, 100);

    const geminiInterval = setInterval(() => {
        try {
            if (!isExtensionContextValid()) {
                stopGeminiTimers();
                return;
            }
            setGemini(rtlAlgorithm);
        } catch (error) {
            if (!isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated')) {
                stopGeminiTimers();
                return;
            }
            throw error;
        }
    }, 1000);
}