// gemini.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, getAnalyzableText } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';
import { AI_RTL_ICON_SELECTOR, ensureAiRtlPageFontStyle } from '../utils/pageFontStyle.js';

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

export function setGemini(rtlAlgorithm = 'advanced_full') {

    ensureAiRtlPageFontStyle('"Google Sans Flex", "Google Sans", "Helvetica Neue", sans-serif');
    AQ(AI_RTL_ICON_SELECTOR).removeClass('FontSet');

    // Copyright
    if (chrome.runtime?.id) {
        addCopyright(
            AQ('.hallucination-disclaimer'),
            'AsBoxGemini AsBoxB',
            'margin-top: 1px; margin-top: -6px; margin-bottom: 4px; font-size: 13px;'
        );
    
    }


        // Follow-up
        AQ('.follow-up-text, .follow-up-container.hide-from-message-actions').each(function () {
            const $el = AQ(this);
            let $targets = $el.is('.follow-up-text') ? $el : $el.find('.follow-up-text');
            if (!$targets.length) {
                $targets = $el.is('button, p, span, .follow-up-text')
                    ? $el
                    : $el.find('button, p, span, .follow-up-text');
            }

            $targets.each(function () {
                const $target = AQ(this);
                if (!$target.text().trim()) {
                    return;
                }

                const intended = $target.attr('data-direction');
                const dir = $target.attr('dir');
                if (intended && dir !== intended) {
                    $target.removeAttr('data-text-length');
                    $target.removeClass('AsOk');
                    $target.find('.AsOk').removeClass('AsOk');
                }

                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: false,
                    setTextAlign: true
                });
            });
        });

        // Sidebar conversation titles
        AQ('[storagekey="chats"] gem-nav-list-item').each(function () {
            // const $el = AQ(this);
            // $el.attr('dir','rtl');



            // const textToUse = getAnalyzableText(AQ(this), {
            //     ignoreSelector: AI_RTL_ICON_SELECTOR
            // });
     
            // const direction = detectTextDirection(textToUse);

            // const finalDirection = direction || 'auto';
        
            // console.log('textToUse', textToUse, finalDirection);


            applyRtlToElement(this, rtlAlgorithm, {
                // fontClass: 'FontSetGPT',
                processedClass: 'AsOk',
                setTextAlign: true
            });
            // if (!$el.text().trim()) {
            //     return;
            // }

            // const intended = $el.attr('data-direction');
            // const dir = $el.attr('dir');
            // if (intended && dir !== intended) {
            //     $el.removeAttr('data-text-length');
            //     $el.removeClass('AsOk');
            //     $el.find('.AsOk').removeClass('AsOk');
            // }

            // applyRtlToElement(this, rtlAlgorithm, {
            //     fontClass: 'FontSet',
            //     processedClass: 'AsOk',
            //     setTextAlign: true
            // });
        });

        // Input
        AQ('.ql-editor, .ql-editor p').each(function () {
            const $el = AQ(this);
            if ($el.is('.ql-editor') && !$el.hasClass('FontSet')) {
                $el.addClass('FontSet');
            }

            if ($el.is('.ql-editor p')) {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: false,
                    setTextAlign: true
                });
            } else if ($el.is('.ql-editor')) {
                $el.find('p').each(function () {
                    applyRtlToElement(this, rtlAlgorithm, {
                        fontClass: 'FontSet',
                        processedClass: false,
                        setTextAlign: true
                    });
                });
            }
        });

        // Font
        AQ('.bot-name-ugc-label, .gds-label-l, .gds-body-l, .gds-body-m, .gds-title-m, .research-step-title, .mat-button-toggle-label-content, .title-text, .mdc-button__label, .gds-body-s, .gds-label-m, .gds-label-s, .gds-label-xs, .gds-label-xxs, .gds-label-m-alt, .gds-body-m-alt, .gds-body-s-alt, .gds-body-xs-alt, .ql-editor, gem-nav-list-item').each(function () {
            if (!AQ(this).hasClass('FontSet')) {
                AQ(this).addClass('FontSet');
            }
        });

        processGeminiMarkdown(rtlAlgorithm);
 
}

function processGeminiMarkdown(rtlAlgorithm) {
    AQ('.markdown-main-panel, .immersive-editor, .research-step-description').each(function () {
        const $el = AQ(this);
        const intended = $el.attr('data-direction');
        const dir = $el.attr('dir');
        if (intended && dir !== intended) {
            $el.removeAttr('data-text-length');
            $el.removeClass('AsOk');
            $el.find('.AsOk').removeClass('AsOk');
        }

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            codeFontClass: false,
            processedClass: 'AsOkaaaaaaaaaaaaaaaaa',
            isContainer: true,
            setTextAlign: true
        });

        if (rtlAlgorithm === 'advanced_full') {
            $el.children('p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote').each(function () {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: false,
                    setTextAlign: true
                });
            });
        }
    });
}

export function activateGemini(rtlAlgorithm = 'advanced_full') {
    console.log('activateGemini with RTL algorithm:', rtlAlgorithm);
    setGemini(rtlAlgorithm);

    let fontInterval;
    let geminiInterval;
    const stopGeminiTimers = () => {
        clearInterval(fontInterval);
        clearInterval(geminiInterval);
    };

    // Input + font
    fontInterval = setInterval(() => {
        if (!isExtensionContextValid() || !isRtlEngineActive()) {
            stopGeminiTimers();
            return;
        }

        try {
            AQ('.bot-name-ugc-label, .ql-editor').each(function () {
                if (!AQ(this).hasClass('FontSet')) {
                    AQ(this).addClass('FontSet');
                }
            });

            AQ('.ql-editor p').each(function () {
                applyRtlToElement(this, rtlAlgorithm, {
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

    // Full refresh
    geminiInterval = setInterval(() => {
        if (!isExtensionContextValid() || !isRtlEngineActive()) {
            stopGeminiTimers();
            return;
        }

        try {
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
