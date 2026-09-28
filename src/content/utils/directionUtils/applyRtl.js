/**
 * Public RTL entry points used by site services:
 * applyRtlToContainer walks a message/prose tree;
 * applyRtlToElement styles a single input/title/node.
 */

import { analyzeTextDirectionFirstWord } from '../analyzeDirection.js';
import { isRtlEngineActive, preserveOriginalDir } from '../originalState.js';
import { flipRtlArrowsInTree, restoreFlippedArrowsInPage } from './arrows.js';
import { isolateMixedPhrasesInTree, MIXED_LTR_ATTR, restoreMixedPhrasesInPage } from './mixedPhrases.js';
import {
    getAnalyzableText,
    getIgnoreSelector,
    isolateIgnoredElements,
    setTextDirectionAndFont
} from './applyElementDirection.js';
import { processCodeBlocksInContainer, resetCodeMirrorDirectionStyles } from './codeBlocks.js';
import {
    mirrorRtlBlockquotesInTree,
    normalizeOnlyCssOption,
    processLockedEditorByCss,
    resetLockedEditorCaches
} from './lockedEditor.js';
import { applyRemoveDirAuto, processTextElementsAdvanced } from './processAdvanced.js';
import { isInvalidatedError, resolveRtlAlgorithm } from './settings.js';
import { CUSTOM_CODE_BLOCK_SELECTOR, KATEX_SELECTOR, clearDebugSkipReason, logDebugProcess, logDebugSkipOnce, unwrapElement } from './shared.js';
import { processTablesInContainer } from './tables.js';
import {
    applyDirectionMarker,
    applyTextAlignByDirection,
    applyUnicodeBidiByDirection,
    usesDirectionClasses
} from './textStyles.js';

const INNER_DIR_SKIP_SELECTOR = [
    'pre', 'code', 'textarea', 'input', 'script', 'style', 'svg', 'math',
    '.cm-content', '.cm-editor', '.cm-line', '.md-code-block',
    CUSTOM_CODE_BLOCK_SELECTOR,
    KATEX_SELECTOR
].join(', ');

function isRemoveInnerDirEnabled(options = {}) {
    return options.removeInnerDir === true;
}

function shouldSkipInnerDirStrip(el) {
    if (!el || typeof el.closest !== 'function') {
        return true;
    }
    return el.matches(INNER_DIR_SKIP_SELECTOR) || Boolean(el.closest(INNER_DIR_SKIP_SELECTOR));
}

function stripInnerDirAttributes($element) {
    const root = unwrapElement($element);
    if (!root || !root.querySelectorAll) {
        return;
    }
    const nodes = root.querySelectorAll('[dir]');
    for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (
            shouldSkipInnerDirStrip(el)
            || el.hasAttribute('data-ai-rtl-orig-dir')
            || el.hasAttribute(MIXED_LTR_ATTR)
        ) {
            continue;
        }
        preserveOriginalDir(el);
        el.removeAttribute('dir');
    }
}

function applyRemoveInnerDir($element, options = {}) {
    if (!isRemoveInnerDirEnabled(options)) {
        return;
    }
    stripInnerDirAttributes($element);
}

export function resetRtlDomCaches() {
    resetLockedEditorCaches();
    restoreFlippedArrowsInPage();
    restoreMixedPhrasesInPage();
    resetCodeMirrorDirectionStyles();
}

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
 * @param {string|false} [options.codeFontClass] - Font class for code blocks; falls back to fontClass if omitted. `false` skips applying a font class on code
 * @param {boolean|'important'|string} [options.setTextAlign] - Set text-align from detected direction. `true` enables it; `'important'` uses !important
 * @param {boolean|'important'|'isolate'|'plaintext'|'embed'|'bidi-override'|'isolate-override'|string} [options.setUnicodeBidi] - unicode-bidi value for RTL items (`true` = isolate). Combine with important, e.g. `'isolate important'`. Removed when RTL is turned off
 * @param {string} [options.siteConfig] - Site key for table-specific tweaks (e.g. `'chatgpt'`, `'grok'`, `'aistudio'`)
 * @param {boolean} [options.processTables] - advanced_full: process tables even when isContainer is false; runs independently of shouldProcess. `false` skips tables in every algorithm
 * @param {string} [options.ignoreSelector] - CSS selector of elements to ignore when analyzing text; skipped if omitted
 * @param {string} [options.walkSkipSelector] - Skip only in processTextElementsAdvanced (mark+return like ms-code-block); does not strip text for analysis
 * @param {boolean} [options.removeInnerDir] - If true, before processing save each inner dir to data-ai-rtl-orig-dir and strip it (restored when RTL is turned off). Code/katex/svg are skipped
 * @param {boolean|string|string[]} [options.onlyCss] - Handle with CSS instead of mutating child DOM. `true`: this element only. A selector (e.g. `.tiptap.ProseMirror`) targets matching descendants as locked editors
 * @param {string[]} [options.includeTags] - Add tag names to the default block list (p, h1–h6, blockquote, pre, ul, ol). Extra tags get display:block in onlyCss
 * @param {string[]} [options.excludeTags] - Remove tag names from the default block list (onlyCss) or skip them while walking children
 * @param {string[]} [options.skipTags] - Extra tag names to skip while walking children (advanced_section → processTextElementsAdvanced)
 * @param {string[]} [options.removeSkipTags] - Tag names to remove from the default skip list (advanced_section)
 * @param {boolean} [options.removeDirAuto] - Strip `dir="auto"` from the element and descendants (advanced_section and advanced_full)
 * @param {boolean} [options.removeTableDirAuto] - Strip `dir="auto"` from tables (HTML and role=table) and all their contents on every pass, including already-processed tables
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
    applyRemoveDirAuto(
        $element,
        options.removeDirAuto === true,
        getIgnoreSelector(options),
        options.onlyCss,
        options.removeDirAutoSkipSelector
    );
    
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
    function shouldProcessElement($element, _processedClass, processOptions = {}) {
        // Get current text content for length comparison
        const currentText = getAnalyzableText($element, processOptions);
        
        const currentTextLength = currentText.length;
        
        // Get stored text length from attribute
        const storedLengthAttr = $element.attr('data-text-length');
        const storedLength = storedLengthAttr ? parseInt(storedLengthAttr, 10) : null;
        
        // Calculate the difference in text length
        const lengthDifference = storedLength !== null ? Math.abs(currentTextLength - storedLength) : 0;

        // Removed: processedClass child-count gate for containers.
        // Previously we also reprocessed when fewer than 2 descendants had processedClass
        // (`processedElementsCount < 2`), which forced endless passes on short messages.
        // حذف شد: شرط تعداد فرزندان دارای processedClass برای کانتینرها.
        // قبلاً اگر کمتر از ۲ فرزند کلاس پردازش داشتند دوباره پردازش می‌شد
        // (`processedElementsCount < 2`) و روی پیام‌های کوتاه باعث پردازش تکراری می‌شد.
        // const processedElementsCount = _processedClass
        //     ? $element.find(`.${_processedClass}`).length
        //     : 0;
        // if (processedElementsCount < 2) { ... force shouldProcess ... }

        const reasons = [];
        if (storedLength === null) {
            reasons.push('no-stored-length');
        }
        if (lengthDifference > 3) {
            reasons.push(`length-delta>${3} (${lengthDifference})`);
        }

        // Containers: decide only by text length (first visit or delta > 3).
        // کانتینرها: فقط بر اساس طول متن تصمیم گرفته می‌شود (اولین بار یا اختلاف بیشتر از ۳).
        const shouldProcess = reasons.length > 0;
        const skipReason = shouldProcess
            ? null
            : `stable-length (delta=${lengthDifference}<=3) | storedLength=${storedLength}`;
        
        return {
            shouldProcess,
            currentText,
            currentTextLength,
            storedLength,
            lengthDifference,
            reason: shouldProcess ? (reasons.join(' | ') || 'none') : skipReason
        };
    }
    
    if (rtlAlgorithm === 'advanced_section') {
        const mergedOptions = { ...defaultOptions.advanced_section, ...options };
        
        const { shouldProcess, currentTextLength, storedLength, lengthDifference, reason } = shouldProcessElement($element, mergedOptions.processedClass);
        
        if (shouldProcess) {
            // console.log("applyRtlToContainer advanced_section", currentTextLength, storedLength, lengthDifference);
            logDebugProcess('process', $element, {
                algorithm: 'advanced_section',
                reason,
                currentTextLength,
                storedLength,
                lengthDifference,
                processedClass: mergedOptions.processedClass
            });
            clearDebugSkipReason($element);
            processTextElementsAdvanced($element, mergedOptions);

            $element.attr('data-algorithm-rtl', 'advanced_section');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            // Reset skip log flag when processing happens
            $element.removeAttr('data-skip-log-sent');

            flipRtlArrowsInTree($element);
        } else {
            logDebugSkipOnce($element, {
                algorithm: 'advanced_section',
                reason,
                currentTextLength,
                storedLength,
                lengthDifference,
                processedClass: mergedOptions.processedClass
            });
        }

        if (mergedOptions.processTables !== false) {
            processTablesInContainer($element, {
                fontClass: mergedOptions.fontClass,
                processedClass: mergedOptions.processedClass,
                siteConfig: mergedOptions.siteConfig,
                setTextAlign: mergedOptions.setTextAlign,
                removeDirAuto: mergedOptions.removeTableDirAuto === true
            });
        }
        // Independent of shouldProcess — code blocks have their own skip marker.
        processCodeBlocksInContainer($element, {
            fontClass: mergedOptions.fontClass,
            codeFontClass: mergedOptions.codeFontClass,
            setTextAlign: mergedOptions.setTextAlign,
            processedClass: mergedOptions.processedClass,
            forceCodeLtr: mergedOptions.forceCodeLtr === true
        }, true);
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
        const { shouldProcess, currentText, currentTextLength, storedLength, lengthDifference, reason } = shouldProcessElement($element, mergedOptions.processedClass, {
            ignoreSelector
        });
        
        if (shouldProcess) {
            // console.log("applyRtlToContainer advanced_full", currentTextLength, storedLength, lengthDifference);
            logDebugProcess('process', $element, {
                algorithm: 'advanced_full',
                reason,
                currentTextLength,
                storedLength,
                lengthDifference,
                processedClass: mergedOptions.processedClass,
                isContainer: Boolean(mergedOptions.isContainer)
            });
            clearDebugSkipReason($element);
            setTextDirectionAndFont(element, { ...mergedOptions, ignoreSelector, text: currentText });

            $element.attr('data-algorithm-rtl', 'advanced_full');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            flipRtlArrowsInTree($element);
        } else {
            logDebugSkipOnce($element, {
                algorithm: 'advanced_full',
                reason,
                currentTextLength,
                storedLength,
                lengthDifference,
                processedClass: mergedOptions.processedClass,
                isContainer: Boolean(mergedOptions.isContainer)
            });
        }

        // Independent of shouldProcess — code blocks have their own skip marker.
        const codeOptions = {
            fontClass: mergedOptions.fontClass,
            codeFontClass: mergedOptions.codeFontClass,
            setTextAlign: mergedOptions.setTextAlign,
            processedClass: mergedOptions.processedClass,
            forceCodeLtr: mergedOptions.forceCodeLtr === true
        };
        if (mergedOptions.isContainer) {
            processCodeBlocksInContainer($element, codeOptions, true);
        } else {
            processCodeBlocksInContainer($element, codeOptions, false);
        }

        if (mergedOptions.processTables !== false && (mergedOptions.processTables || mergedOptions.isContainer)) {
            processTablesInContainer($element, {
                fontClass: mergedOptions.fontClass,
                processedClass: mergedOptions.processedClass,
                siteConfig: mergedOptions.siteConfig,
                setTextAlign: mergedOptions.setTextAlign,
                removeDirAuto: mergedOptions.removeTableDirAuto === true
            });
        }

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
            const { shouldProcess, currentTextLength, storedLength, lengthDifference, reason } = shouldProcessElement($element, options.processedClass);
            
            if (shouldProcess) {
                // console.log("applyRtlToContainer first_word tables", currentTextLength, storedLength, lengthDifference);
                logDebugProcess('process', $element, {
                    algorithm: 'first_word',
                    reason,
                    currentTextLength,
                    processedClass: options.processedClass
                });
                clearDebugSkipReason($element);
                if (options.processTables !== false) {
                    processTablesInContainer($element, {
                        fontClass,
                        processedClass: options.processedClass,
                        siteConfig: options.siteConfig,
                        setTextAlign: options.setTextAlign,
                        removeDirAuto: options.removeTableDirAuto === true
                    });
                }
                // Store the new text length
                $element.attr('data-text-length', currentTextLength.toString());
            } else {
                logDebugSkipOnce($element, {
                    algorithm: 'first_word',
                    reason,
                    currentTextLength,
                    storedLength,
                    lengthDifference,
                    processedClass: options.processedClass
                });
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
    isolateMixedPhrasesInTree($element);
    } catch (error) {
        if (isInvalidatedError(error)) {
            return;
        }
        throw error;
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
 * @param {boolean} [options.removeDirAuto] - Strip `dir="auto"` from the element and descendants
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

    applyRemoveDirAuto($element, options.removeDirAuto === true, null, options.onlyCss, options.removeDirAutoSkipSelector);
    
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
    isolateMixedPhrasesInTree($element);
}
