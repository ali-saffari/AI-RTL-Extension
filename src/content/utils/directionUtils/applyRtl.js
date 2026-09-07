/**
 * Public RTL entry points used by site services:
 * applyRtlToContainer walks a message/prose tree;
 * applyRtlToElement styles a single input/title/node.
 */

import { analyzeTextDirectionFirstWord, detectTextDirection } from '../analyzeDirection.js';
import { isRtlEngineActive } from '../originalState.js';
import { flipRtlArrowsInTree } from './arrows.js';
import {
    getAnalyzableText,
    getIgnoreSelector,
    isolateIgnoredElements,
    setTextDirectionAndFont
} from './applyElementDirection.js';
import { processCodeBlocksInContainer } from './codeBlocks.js';
import { applyRemoveInnerDir } from './innerDir.js';
import {
    mirrorRtlBlockquotesInTree,
    normalizeOnlyCssOption,
    processLockedEditorByCss
} from './lockedEditor.js';
import { processTextElementsAdvanced } from './processAdvanced.js';
import { isInvalidatedError, resolveRtlAlgorithm } from './settings.js';
import { processTablesInContainer } from './tables.js';
import {
    applyDirectionMarker,
    applyTextAlignByDirection,
    applyUnicodeBidiByDirection,
    usesDirectionClasses
} from './textStyles.js';

/**
 * Get common attribute selectors for text content
 * @returns {Array} Array of CSS selectors for elements with text attributes
 */
export function getAttributeTextElements() {
    return [
        "[title]", "[alt]", "[aria-label]"
    ];
}

/**
 * Apply RTL to a large container (markdown, message body, prose).
 * Walks children, tables, code blocks, and nested sections according to the selected mode.
 * RTL blockquotes get left/right padding and border swapped so the quote bar sits on the start side.
 * @param {jQuery|HTMLElement} element - Container to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} [options] - Additional options (optional)
 * @param {string} [options.fontClass='FontSet'] - Font class to apply on processed elements
 * @param {string} [options.processedClass] - Class that marks already-processed nodes. Default `'AsOk'` for advanced_section; used to skip reprocessing and to count processed children
 * @param {boolean} [options.isContainer] - Treat as a nested container. Default `true` for advanced_section. advanced_full: also process inner code blocks on first pass. first_word: also process tables
 * @param {string} [options.codeFontClass] - Font class for code blocks; falls back to fontClass if omitted
 * @param {boolean|'important'|string} [options.setTextAlign] - Set text-align from detected direction. `true` enables it; `'important'` uses !important
 * @param {boolean|'important'|'isolate'|'plaintext'|'embed'|'bidi-override'|'isolate-override'|string} [options.setUnicodeBidi] - unicode-bidi value for RTL items (`true` = isolate). Combine with important, e.g. `'isolate important'`. Removed when RTL is turned off
 * @param {string} [options.siteConfig] - Site key for table-specific tweaks (e.g. `'chatgpt'`, `'grok'`, `'aistudio'`)
 * @param {boolean} [options.processTables] - advanced_full: process tables even when isContainer is false; runs independently of shouldProcess
 * @param {string} [options.ignoreSelector] - CSS selector of elements to ignore when analyzing text; skipped if omitted
 * @param {boolean} [options.removeInnerDir] - If true, before processing save each inner dir to data-ai-rtl-orig-dir and strip it (restored when RTL is turned off). Code/katex/svg are skipped
 * @param {boolean|string|string[]} [options.onlyCss] - Handle with CSS instead of mutating child DOM. `true`: this element only. A selector (e.g. `.tiptap.ProseMirror`) targets matching descendants as locked editors
 * @param {string[]} [options.includeTags] - Add tag names to the default block list (p, h1–h6, blockquote, pre, ul, ol). Extra tags get display:block in onlyCss
 * @param {string[]} [options.excludeTags] - Remove tag names from the default block list (onlyCss) or skip them while walking children
 * @param {string[]} [options.skipTags] - Extra tag names to skip while walking children (advanced_section → processTextElementsAdvanced)
 * @param {string[]} [options.removeSkipTags] - Tag names to remove from the default skip list (advanced_section)
 * @param {boolean} [options.removeDirAuto] - Strip `dir="auto"` from descendants (advanced_section)
 * @param {boolean} [options.applyFontIfRtl] - advanced_full: add fontClass only when detected direction is RTL
 * @param {boolean} [options.endTyping] - advanced_section: process headers only after typing has settled
 * @param {string} [options.rtlClass] - If set (with optional ltrClass), apply this class for RTL instead of setting dir
 * @param {string} [options.ltrClass] - If set (with optional rtlClass), apply this class for LTR instead of setting dir
 */
export function applyRtlToContainer(element, rtlAlgorithm, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    rtlAlgorithm = resolveRtlAlgorithm(rtlAlgorithm);
    try {
    const $element = AQ(element);
    const el = $element[0];
    const onlyCss = options.onlyCss;

    if (onlyCss === true) {
        processLockedEditorByCss(el, rtlAlgorithm, options);
        return;
    }

    if (processLockedEditorByCss(el, rtlAlgorithm, options)) {
        return;
    }

    const nestedSelector = normalizeOnlyCssOption(onlyCss);
    if (nestedSelector && el && el.querySelectorAll) {
        el.querySelectorAll(nestedSelector).forEach((child) => {
            processLockedEditorByCss(child, rtlAlgorithm, { ...options, onlyCss: true });
        });
    }

    applyRemoveInnerDir($element, options);
    
    // Default options for each algorithm
    const defaultOptions = {
        advanced_section: {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        },
        advanced_full: {
            fontClass: 'FontSet'
        },
        first_word: {
            fontClass: 'FontSet'
        }
    };
    
    /**
     * Helper function to check if processing should be triggered based on text length and processed elements count
     * @param {jQuery} $element - jQuery element to check
     * @param {string} processedClass - Class name to count processed elements
     * @returns {Object} - Object containing shouldProcess boolean and currentTextLength number
     */
    function shouldProcessElement($element, processedClass, processOptions = {}) {
        // Get current text content for length comparison
        const currentText = getAnalyzableText($element, processOptions);
        

        
        const currentTextLength = currentText.length;
        
        // Get stored text length from attribute
        const storedLengthAttr = $element.attr('data-text-length');
        const storedLength = storedLengthAttr ? parseInt(storedLengthAttr, 10) : null;
        
        // Calculate the difference in text length
        const lengthDifference = storedLength !== null ? Math.abs(currentTextLength - storedLength) : 0;
        
        // Count elements with processedClass in this section
        const processedElementsCount = $element.find(`.${processedClass}`).length;
        
        // Only process if text length changed by more than 3 characters, if it's the first time (no attribute), or if fewer than 2 elements are processed
        const shouldProcess = lengthDifference > 3 || storedLength === null || processedElementsCount < 2;
        
        return {
            shouldProcess,
            currentText,
            currentTextLength,
            storedLength,
            lengthDifference,
            processedElementsCount
        };
    }
    
    if (rtlAlgorithm === 'advanced_section') {
        const mergedOptions = { ...defaultOptions.advanced_section, ...options };
        
        const { shouldProcess, currentTextLength, storedLength, lengthDifference, processedElementsCount } = shouldProcessElement($element, mergedOptions.processedClass);
        
        if (shouldProcess) {
            // console.log("applyRtlToContainer advanced_section", currentTextLength, storedLength, lengthDifference);
            processTextElementsAdvanced($element, mergedOptions);

            $element.attr('data-algorithm-rtl', 'advanced_section');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            // Reset skip log flag when processing happens
            $element.removeAttr('data-skip-log-sent');
            flipRtlArrowsInTree($element);
        }

        processTablesInContainer($element, {
            fontClass: mergedOptions.fontClass,
            processedClass: mergedOptions.processedClass,
            siteConfig: mergedOptions.siteConfig,
            setTextAlign: mergedOptions.setTextAlign
        });
        processCodeBlocksInContainer($element, {
            fontClass: mergedOptions.fontClass,
            codeFontClass: mergedOptions.codeFontClass,
            setTextAlign: mergedOptions.setTextAlign,
            processedClass: mergedOptions.processedClass
        }, true);
        flipRtlArrowsInTree($element);
        //  else {
        //     // Log when processing is skipped (only once)
        //     const skipLogSent = $element.attr('data-skip-log-sent');
        //     if (!skipLogSent) {
        //         let reason = 'Unknown';
        //         if (storedLength !== null && lengthDifference <= 3 && processedElementsCount >= 2) {
        //             reason = `Text length changed by ${lengthDifference} characters (threshold: 3), and ${processedElementsCount} elements already processed`;
        //         } else if (storedLength === null) {
        //             reason = 'No stored length (should not happen)';
        //         }
                
        //         console.log('applyRtlToContainer advanced_section: Skipped processing', {
        //             element: $element[0],
        //             currentTextLength,
        //             storedLength,
        //             lengthDifference,
        //             processedElementsCount,
        //             reason
        //         });
                
        //         // Mark that log has been sent
        //         $element.attr('data-skip-log-sent', 'true');
                
        //         // Process headers only when typing ends
        //         processTextElementsAdvanced($element, {
        //             ...mergedOptions,
        //             endTyping: true
        //         });
        //     }
        // }
        
    } else if (rtlAlgorithm === 'advanced_full') {
        const mergedOptions = { ...defaultOptions.advanced_full, ...options };
        
        const ignoreSelector = getIgnoreSelector(mergedOptions);
        const { shouldProcess, currentText, currentTextLength } = shouldProcessElement($element, mergedOptions.processedClass, {
            ignoreSelector
        });
        
        if (shouldProcess) {
            // console.log("applyRtlToContainer advanced_full", currentTextLength, storedLength, lengthDifference);
            setTextDirectionAndFont(element, { ...mergedOptions, ignoreSelector, text: currentText });

            const codeOptions = {
                fontClass: mergedOptions.fontClass,
                codeFontClass: mergedOptions.codeFontClass,
                setTextAlign: mergedOptions.setTextAlign,
                processedClass: mergedOptions.processedClass
            };

            if (mergedOptions.isContainer) {
                processCodeBlocksInContainer($element, codeOptions, true);
            }
            
            $element.attr('data-algorithm-rtl', 'advanced_full');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            flipRtlArrowsInTree($element);
        }

        processCodeBlocksInContainer($element, {
            fontClass: mergedOptions.fontClass,
            codeFontClass: mergedOptions.codeFontClass,
            setTextAlign: mergedOptions.setTextAlign,
            processedClass: mergedOptions.processedClass
        }, false);

        if (mergedOptions.processTables || mergedOptions.isContainer) {
            processTablesInContainer($element, {
                fontClass: mergedOptions.fontClass,
                processedClass: mergedOptions.processedClass,
                siteConfig: mergedOptions.siteConfig,
                setTextAlign: mergedOptions.setTextAlign
            });
        }

        flipRtlArrowsInTree($element);

        if (ignoreSelector) {
            isolateIgnoredElements($element, ignoreSelector);
        }

    } else if (rtlAlgorithm === 'first_word') {
        if (!usesDirectionClasses(options)) {
            $element.attr("dir", "auto");
        }
        
        const fontClass = options.fontClass || defaultOptions.first_word.fontClass;
        if (!$element.hasClass(fontClass)) {
            $element.addClass(fontClass);
        }
        
        // Process tables in container for first_word algorithm (only if isContainer is true)
        if (options.isContainer) {
            const { shouldProcess, currentTextLength } = shouldProcessElement($element, options.processedClass);
            
            if (shouldProcess) {
                // console.log("applyRtlToContainer first_word tables", currentTextLength, storedLength, lengthDifference);
                processTablesInContainer($element, {
                    fontClass,
                    processedClass: options.processedClass,
                    siteConfig: options.siteConfig,
                    setTextAlign: options.setTextAlign
                });
                // Store the new text length
                $element.attr('data-text-length', currentTextLength.toString());
            }
        }
        
        $element.attr('data-algorithm-rtl', 'first_word');
        flipRtlArrowsInTree($element);

        const firstWordIgnoreSelector = getIgnoreSelector(options);
        if (firstWordIgnoreSelector) {
            isolateIgnoredElements($element, firstWordIgnoreSelector);
        }
    }

    applyDirectionMarker($element, $element.attr('data-direction'), options);
    mirrorRtlBlockquotesInTree($element);
    } catch (error) {
        if (isInvalidatedError(error)) {
            return;
        }
        throw error;
    }
}

/**
 * Detect text direction based on RTL algorithm
 * @param {string} text - Text to analyze
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @returns {string} - Detected direction ('rtl' or 'ltr')
 */
export function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    if (rtlAlgorithm === 'first_word') {
        return analyzeTextDirectionFirstWord(text);
    } else {
        // For 'advanced_section' and 'advanced_full', use detectTextDirection
        return detectTextDirection(text);
    }
}

/**
 * Apply RTL to a single element (textarea, input, title, simple text node).
 * Sets dir and font on that element only; does not walk nested blocks.
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} options - Additional options (optional)
 * @param {string} [options.rtlClass] - If set, apply this class for RTL instead of setting dir
 * @param {string} [options.ltrClass] - If set, apply this class for LTR instead of setting dir
 * @param {string} [options.ignoreSelector] - CSS selector of elements to ignore; skipped if omitted
 * @param {boolean} [options.removeInnerDir] - If true, before processing save each inner dir to data-ai-rtl-orig-dir and strip it (restored when RTL is turned off). Code/katex/svg are skipped
 * @param {boolean|'important'|'isolate'|'plaintext'|'embed'|'bidi-override'|'isolate-override'|string} [options.setUnicodeBidi] - unicode-bidi value for RTL items (`true` = isolate). Combine with important, e.g. `'isolate important'`. Removed when RTL is turned off.
 */
export function applyRtlToElement(element, rtlAlgorithm, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    rtlAlgorithm = resolveRtlAlgorithm(rtlAlgorithm);
    const $element = AQ(element);

    if (processLockedEditorByCss($element[0], rtlAlgorithm, options)) {
        return;
    }
    
    // Default options for each algorithm
    const defaultOptions = {
        fontClass: 'FontSet'
    };
    
    const processedClass = options.processedClass || false;
    const rtlClass = options.rtlClass || false;
    const ltrClass = options.ltrClass || false;
    const storedAlgorithm = $element.attr('data-algorithm-rtl');
    if (storedAlgorithm !== rtlAlgorithm) {
        if (processedClass) {
            $element.removeClass(processedClass);
        }
        if (rtlClass) {
            $element.removeClass(rtlClass);
        }
        if (ltrClass) {
            $element.removeClass(ltrClass);
        }
    }

    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        // Check processedClass only if it's not false
        if (!processedClass || !$element.hasClass(processedClass)) {
            const ignoreSelector = getIgnoreSelector(options);
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                ignoreSelector
            };
            const direction = setTextDirectionAndFont(element, mergedOptions);
            
            // Add processedClass only if it's not false
            if (processedClass) {
                $element.addClass(processedClass);
            }

            if (direction === 'rtl') {
                flipRtlArrowsInTree($element);
            }
        }

    } else if (rtlAlgorithm === 'first_word') {
        // Check processedClass only if it's not false
        if (!processedClass || !$element.hasClass(processedClass)) {
            if (!usesDirectionClasses(options)) {
                $element.attr("dir", "auto");
            }
            const fontClass = options.fontClass || defaultOptions.fontClass;
            $element.addClass(fontClass);
            
            // Add processedClass only if it's not false
            if (processedClass) {
                $element.addClass(processedClass);
            }
            
            // Get text content once for both textAlign and direction-class operations
            if (options.setTextAlign || rtlClass || ltrClass) {
                let text = $element.text();
                if (!text || !text.trim()) {
                    text = $element.val();
                    if (text) {
                        text = text.trim();
                    }
                }
                
                if (text && text.trim()) {
                    const direction = analyzeTextDirectionFirstWord(text);
                    $element.attr('data-direction', direction);
                    
                    applyTextAlignByDirection($element, direction, options.setTextAlign);
                    applyUnicodeBidiByDirection($element, direction, options.setUnicodeBidi);
                    applyDirectionMarker($element, direction, options);
                }
            }

            flipRtlArrowsInTree($element);
        }

        

    }

    $element.attr('data-algorithm-rtl', rtlAlgorithm);

    applyRemoveInnerDir($element, options);
    const ignoreSelector = getIgnoreSelector(options);
    if (ignoreSelector) {
        isolateIgnoredElements($element, ignoreSelector);
    }
}
