/**
 * Recursive walk of message / markdown children (advanced_section).
 * Used by applyRtlToContainer and a few site services that call it directly.
 */

import { detectTextDirection } from '../analyzeDirection.js';
import { isRtlEngineActive, preserveOriginalDir } from '../originalState.js';
import { flipRtlArrowsInTree } from './arrows.js';
import {
    processCodeBlockNode,
    processCodeLikeElement,
    processCodeMirrorBlock
} from './codeBlocks.js';
import { processParagraphWithBreaks, setTextDirectionAndFont, isInlineSpanBdiBreakParagraph } from './applyElementDirection.js';
import { isLockedMarkdownEditor } from './lockedEditor.js';
import { getMixedTitleDisplayMode, isInvalidatedError } from './settings.js';
import {
    CODE_BLOCK_SELECTOR,
    CUSTOM_CODE_BLOCK_SELECTOR,
    isCodeMirrorCodeBlock,
    isCustomCodeBlock,
    isInlineCodeClassElement,
    normalizeTagNameList,
    setDebugAttr
} from './shared.js';
import {
    containsStructuredMarkup,
    isKatexTreeElement,
    isSvgTreeElement,
    skipStructuredMedia
} from './structuredMedia.js';
import {
    applyDirectionMarker,
    applyTextAlignByDirection,
    applyUnicodeBidiByDirection
} from './textStyles.js';

const FORMATTING_TAGS = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'a', 'button'];

function isRadioGroupElement(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    if (el.getAttribute('role') === 'radiogroup') {
        return true;
    }
    const className = typeof el.className === 'string' ? el.className : '';
    return /(^|\s)RadioGroup-/.test(className);
}

function isRadioGroupItemElement(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    return el.getAttribute('data-d-component') === 'radio';
}

function getListLikeItems($element) {
    if (!$element || !$element.length) {
        return AQ();
    }
    const el = $element[0];
    if (el.tagName && (el.tagName.toLowerCase() === 'ol' || el.tagName.toLowerCase() === 'ul')) {
        return $element.children('li');
    }
    if (isRadioGroupElement(el)) {
        const labels = [];
        $element.children('[data-d-component="radio"]').each(function () {
            const label =
                this.querySelector('label') ||
                this.querySelector('[class^="RadioLabel-"]') ||
                this.querySelector('[class*=" RadioLabel-"]');
            labels.push(label || this);
        });
        if (labels.length) {
            return AQ(labels);
        }
        // Fallback: direct labels when ChatGPT omits the radio wrapper.
        return $element.children('label, [class^="RadioLabel-"], [class*=" RadioLabel-"]');
    }
    return AQ();
}

function setListLikeDataDirection($element, listDirection) {
    $element.attr('data-ai-rtl-direction', listDirection);
}

/**
 * Shared ul/ol + radiogroup path: per-item direction, then majority on the group.
 */
function processListLikeGroup($element, options = {}) {
    const {
        fontClass,
        processedClass,
        setTextAlign,
        setUnicodeBidi,
        rtlClass,
        ltrClass,
        codeFontClass,
        directionClassOptions
    } = options;

    const $items = getListLikeItems($element);
    if (!$items.length) {
        return false;
    }

    setDebugAttr($element, 'data-debug-mode', 'list-processing');
    setDebugAttr($element, 'data-as-mode', 'list-processing');

    let processedCount = 0;
    let unprocessedCount = 0;

    $items.each(function () {
        const $item = AQ(this);
        if ($item.hasClass(processedClass)) {
            processedCount++;
            return;
        }
        unprocessedCount++;
        setTextDirectionAndFont(this, {
            fontClass,
            setTextAlign,
            setUnicodeBidi,
            rtlClass,
            ltrClass
        });
        $item.find(CODE_BLOCK_SELECTOR).each(function () {
            processCodeBlockNode(AQ(this), { fontClass, setTextAlign, processedClass, codeFontClass });
        });
    });

    const processedItems = $items.filter('[dir]');
    let rtlCount = 0;
    let ltrCount = 0;

    processedItems.each(function () {
        const dir = AQ(this).attr('data-ai-rtl-direction');
        if (dir === 'rtl') {
            rtlCount++;
        } else if (dir === 'ltr') {
            ltrCount++;
        }
    });

    let listDirection;
    let debugReason;
    if (rtlCount > ltrCount) {
        listDirection = 'rtl';
        debugReason = `list-rtl-majority-${rtlCount}-${ltrCount}`;
    } else if (ltrCount > rtlCount) {
        listDirection = 'ltr';
        debugReason = `list-ltr-majority-${ltrCount}-${rtlCount}`;
    } else {
        const prevElementDir = $element.prev().attr('data-ai-rtl-direction') || $element.prev().attr('dir');
        if (prevElementDir && (prevElementDir === 'rtl' || prevElementDir === 'ltr')) {
            listDirection = prevElementDir;
            debugReason = `list-prev-dir-${prevElementDir}`;
        } else {
            const listText = $element.text().trim();
            if (listText) {
                const persianWords = (listText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g) || []).length;
                const englishWords = (listText.match(/[a-zA-Z]+/g) || []).length;

                if (persianWords > englishWords) {
                    listDirection = 'rtl';
                    debugReason = `list-persian-words-${persianWords}-${englishWords}`;
                } else if (englishWords > persianWords) {
                    listDirection = 'ltr';
                    debugReason = `list-english-words-${englishWords}-${persianWords}`;
                } else {
                    listDirection = 'ltr';
                    debugReason = 'list-words-equal-default-ltr';
                }
            } else {
                listDirection = 'ltr';
                debugReason = 'list-default-ltr';
            }
        }
    }

    processedItems.each(function () {
        AQ(this).attr('data-org-dir', AQ(this).attr('data-ai-rtl-direction') || AQ(this).attr('dir'));
        applyDirectionMarker(AQ(this), listDirection, directionClassOptions);
        applyTextAlignByDirection(this, listDirection, setTextAlign);
        applyUnicodeBidiByDirection(this, listDirection, setUnicodeBidi);
    });

    setListLikeDataDirection($element, listDirection);
    applyDirectionMarker($element, listDirection, directionClassOptions);
    setDebugAttr($element, 'data-debug-reason', debugReason);
    setDebugAttr($element, 'data-debug-processed', `${processedCount}-${unprocessedCount}`);
    applyTextAlignByDirection($element, listDirection, setTextAlign);
    applyUnicodeBidiByDirection($element, listDirection, setUnicodeBidi);
    return true;
}

function isInsideIgnored(el, ignoreSelector) {
    if (!ignoreSelector || !el || !el.closest) {
        return false;
    }
    try {
        return Boolean(el.closest(ignoreSelector));
    } catch {
        return false;
    }
}

function matchesWalkSkip(el, walkSkipSelector) {
    if (!walkSkipSelector || !el || typeof el.matches !== 'function') {
        return false;
    }
    try {
        return el.matches(walkSkipSelector) || Boolean(el.closest && el.closest(walkSkipSelector));
    } catch {
        return false;
    }
}

function skipWalkElement($element, processedClass, debugMode) {
    setDebugAttr($element, 'data-debug-mode', debugMode);
    // Same pattern as ms-code-block: mark and leave without RTL walk.
    $element.addClass(processedClass);
    $element.find('*').addClass(processedClass);
}

function onlyCssSkipSelector(onlyCss) {
    if (onlyCss === true) {
        return true;
    }
    if (Array.isArray(onlyCss)) {
        const joined = onlyCss.filter((item) => typeof item === 'string' && item.trim()).join(', ');
        return joined || null;
    }
    if (typeof onlyCss === 'string' && onlyCss.trim()) {
        return onlyCss.trim();
    }
    return null;
}

export function applyRemoveDirAuto(container, enabled = false, ignoreSelector = null, onlyCss = null, skipSelector = null) {
    const onlyCssScope = onlyCssSkipSelector(onlyCss);
    if (onlyCssScope === true) {
        return;
    }
    const $container = AQ(container);

    // ChatGPT unified (advanced_full): keep paragraph dir, and put dir="auto" back if we stripped it earlier.
    if (skipSelector) {
        $container.find(skipSelector).addBack(skipSelector).each(function () {
            if (isInsideIgnored(this, ignoreSelector) || isInsideIgnored(this, onlyCssScope)) {
                return;
            }
            if (!this.classList || !this.classList.contains('removeedDirAuto')) {
                return;
            }
            if (!this.hasAttribute('dir')) {
                this.setAttribute('dir', 'auto');
            }
            this.classList.remove('removeedDirAuto');
        });
    }

    if (!enabled) {
        return;
    }
    $container.find('[dir="auto"]').addBack('[dir="auto"]').each(function () {
        if (isInsideIgnored(this, ignoreSelector) || isInsideIgnored(this, onlyCssScope)) {
            return;
        }
        if (skipSelector) {
            try {
                if (this.matches(skipSelector)) {
                    return;
                }
            } catch {
                return;
            }
        }
        const $el = AQ(this);
        if (!$el.hasClass('removeedDirAuto')) {
            // Stamp original dir so restoreAllOriginals can put dir="auto" back.
            preserveOriginalDir(this);
            $el.removeAttr('dir').addClass('removeedDirAuto');
        }
    });
}

export function processTextElementsAdvanced(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    try {
    let {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        isContainer = false,
        skipTags = [],
        removeSkipTags = [],
        includeTags = [],
        excludeTags = [],
        setTextAlign = false,
        setUnicodeBidi = false,
        removeDirAuto = false,
        endTyping = false,
        codeFontClass,
        rtlClass = false,
        ltrClass = false
    } = options;
    const ignoreSelector = typeof options.ignoreSelector === 'string' && options.ignoreSelector.length
        ? options.ignoreSelector
        : null;
    // Walk-only skip (e.g. ChatGPT tables/code): mark like ms-code-block, no getAnalyzableText ignore.
    // اسکیپ فقط در پیمایش advanced (مثل ms-code-block)؛ بدون ignoreSelector سنگین برای تحلیل متن.
    const walkSkipSelector = typeof options.walkSkipSelector === 'string' && options.walkSkipSelector.length
        ? options.walkSkipSelector
        : null;
    const directionClassOptions = { rtlClass, ltrClass };
    // console.log(`processTextElemntsAdvanced  ` , container[0] , {
    //     setTextAlign,
    //     isContainer
    // });


   let mainContainer = false;
    // If this is a container, process tables first
    if (isContainer) {
        // processTablesInContainer(container, {
        //     fontClass,
        //     processedClass,
        //     siteConfig: options.siteConfig
        // });

        mainContainer = container
        // برای همه المان‌هایی که allSkipTags هستن فونت ست کن (به جز تگ‌های کد)
        const allTagsSetFont = [...FORMATTING_TAGS, ...skipTags].filter(tag => 
            !['code', 'pre'].includes(tag)
        );
        container.find(allTagsSetFont.join(',')).each(function() {
            if (isInsideIgnored(this, ignoreSelector) || matchesWalkSkip(this, walkSkipSelector)) {
                return;
            }
            const $element = AQ(this);
            if (!$element.hasClass(fontClass)) {
                $element.addClass(fontClass);
            }
        });


   
    }


    applyRemoveDirAuto(container, removeDirAuto, ignoreSelector, options.onlyCss);


    const extraBlockTags = normalizeTagNameList(includeTags);
    const removedBlockTags = normalizeTagNameList(excludeTags);

    // Combine FORMATTING_TAGS with skipTags, then remove specified tags
    const allSkipTags = [...FORMATTING_TAGS, ...skipTags, ...removedBlockTags].filter(tag =>
        !removeSkipTags.includes(tag) && !extraBlockTags.includes(tag)
    );

    // Get only direct children of the container
    const allElements = container.children();
    
    allElements.each(function() {
        const $element = AQ(this);
        
        // Skip if already processed
        if ($element.hasClass(processedClass)) {
            return;
        }

        if (isInsideIgnored(this, ignoreSelector)) {
            setDebugAttr($element, 'data-debug-mode', 'ignore-selector-skipped');
            return;
        }

        // ChatGPT-style walk skip: same as ms-code-block (mark + return, no text analysis ignore).
        if (matchesWalkSkip(this, walkSkipSelector)) {
            skipWalkElement($element, processedClass, 'walk-skip-selector-skipped');
            return;
        }
        
        // Mark as processed
       
        
        // Get element tag name
        const tagName = this.tagName.toLowerCase();
        
    
        
        // Process header elements normally
        if ( ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {


            // If not processed, process normally
            // 

            const textToUse = $element.text();


         

            
            const direction = detectTextDirection(textToUse);

            // console.log('textToUse', textToUse , 'direction', direction);

             $element.attr('data-ai-rtl-direction', direction);
            applyDirectionMarker($element, direction, directionClassOptions);
            if (fontClass) {
                $element.addClass(fontClass);
            }
            
            applyTextAlignByDirection($element, direction, setTextAlign);
            applyUnicodeBidiByDirection($element, direction, setUnicodeBidi);



        
        
            // // let dir = setTextDirectionAndFont(this, { fontClass, setTextAlign });

            AQ(this).attr('data-org-dir', direction);

            // If this is a main container, check all similar header tags and set direction based on majority

            
            // if (!endTyping) {
            //     return;
            // }
            // $element.addClass(processedClass);

            // Check mixedTitleDisplayMode setting
            // Default to 'unified' if not set
            const mixedTitleMode = getMixedTitleDisplayMode();
            if (mixedTitleMode === 'unified' && mainContainer) {
                    const allHeaders = mainContainer.find(tagName);
                    let rtlCount = 0;
                    let ltrCount = 0;
                    
                    // Count directions of all headers
                    allHeaders.each(function() {
                        const headerDir = AQ(this).attr('data-org-dir');
                        if (headerDir === 'rtl') {
                            rtlCount++;
                        } else if (headerDir === 'ltr') {
                            ltrCount++;
                        }
                    });
                    
                    // Determine majority direction
                    let majorityDir;
                    if (rtlCount >= ltrCount) {
                        majorityDir = 'rtl';
                    } else if (ltrCount > rtlCount) {
                        majorityDir = 'ltr';
                    } 
                    
                    // Apply majority direction to all headers if we have a majority
                    if (majorityDir) {
                        mainContainer.find(tagName).each(function() {
                            AQ(this).attr('data-ai-rtl-direction', majorityDir);
                            applyDirectionMarker(AQ(this), majorityDir, directionClassOptions);
                
                            applyTextAlignByDirection(this, majorityDir, setTextAlign);
                            applyUnicodeBidiByDirection(this, majorityDir, setUnicodeBidi);
                        });
                    }
                }
                // In individual mode, each header keeps its own direction (already set above)

            setDebugAttr($element, 'data-debug-mode', 'header-processed');
            return;
        }
        
        // Skip ms-code-block elements completely (for AI Studio code sections)
        if (tagName === 'ms-code-block') {
            // console.log("processTextElementsAdvanced: ms-code-block skipped", $element);
            skipWalkElement($element, processedClass, 'ms-code-block-skipped');
            return;
        }
        
        // Skip formatting tags completely

   
        if (allSkipTags.includes(tagName)) {
            setDebugAttr($element, 'data-debug-mode', 'formatting-tag-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip table elements and elements with table roles (they are handled by processTablesInContainer)
        const tableRoles = ['table', 'row', 'cell', 'columnheader', 'rowheader'];
        const elementRole = $element.attr('role');
        
        // Check if it's a table HTML tag
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(tagName)) {
            setDebugAttr($element, 'data-debug-mode', 'table-element-skipped');
            return;
        }
        
        // Check if it has table role attribute
        if (elementRole && tableRoles.includes(elementRole)) {
            setDebugAttr($element, 'data-debug-mode', 'table-role-skipped');
            return;
        }
        
        // Handle li elements that are inside ol or ul
        if (tagName === 'li' && ($element.parent().is('ol') || $element.parent().is('ul'))) {
            // Check if li contains pre or code elements
            const hasPreOrCode = $element.find(`pre, code, .cm-content, .cm-editor, ${CUSTOM_CODE_BLOCK_SELECTOR}`).length > 0;
            
            if (hasPreOrCode) {
                processCodeLikeElement($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            } else {
                // If li doesn't contain pre or code, skip processing
                setDebugAttr($element, 'data-debug-mode', 'li-inside-list-skipped');
                // Don't mark as processed, just skip processing
            }
            return;
        }

        // Radio items are processed by the parent radiogroup (same as li under ul/ol).
        if (isRadioGroupItemElement(this) && isRadioGroupElement(this.parentElement)) {
            setDebugAttr($element, 'data-debug-mode', 'radio-inside-group-skipped');
            return;
        }
        
        // Skip div elements with rounded-xl class (for Copilot code sections),
        // unless they wrap a code editor that should follow the code setting
        if (tagName === 'div' && $element.hasClass('rounded-xl')) {
            const $innerCode = $element.find(CODE_BLOCK_SELECTOR);
            if ($innerCode.length) {
                $innerCode.each(function() {
                    const $inner = AQ(this);
                    if (isCodeMirrorCodeBlock($inner)) {
                        processCodeMirrorBlock($inner, this, { fontClass, setTextAlign, processedClass, codeFontClass });
                    } else {
                        processCodeLikeElement($inner, this, { fontClass, setTextAlign, processedClass, codeFontClass });
                    }
                });
                $element.addClass(processedClass);
                $element.find('*').addClass(processedClass);
                return;
            }
            setDebugAttr($element, 'data-debug-mode', 'div-rounded-xl-skipped');
            $element.find('*').addClass(processedClass);
            return;
        }
        

        if (tagName === 'button') {
            setDebugAttr($element, 'data-debug-mode', 'div-rounded-xl-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }

        if (isLockedMarkdownEditor(this, options.onlyCss)) {
            setDebugAttr($element, 'data-debug-mode', 'locked-markdown-editor-skipped');
            return;
        }
        


        // DeepSeek tables: the custom bar reads scrollLeft and writes `left`.
        // dir=rtl on .ds-scroll-area flips that origin, so the thumb no longer tracks.
        // Keep the scroller LTR. processTablesInContainer sets dir on the table.
        if (tagName === 'div' && $element.hasClass('ds-scroll-area')) {
            const $directTable = $element.children('table');
            if ($directTable.length) {
                setDebugAttr($element, 'data-debug-mode', 'div-ds-scroll-area-table-ltr');
                $element.attr('dir', 'ltr');
                $element.removeAttr('data-ai-rtl-direction');
                const legacyDirection = $element.attr('data-direction');
                if (legacyDirection === 'rtl' || legacyDirection === 'ltr') {
                    $element.removeAttr('data-direction');
                }
                if (fontClass) {
                    $element.addClass(fontClass);
                }
                $element.addClass('AsOk2');
                const $gutters = $element.children('.ds-scroll-area__gutters');
                $gutters.addClass(processedClass);
                $gutters.find('*').addClass(processedClass);
                $element.addClass(processedClass);
                return;
            }

            setDebugAttr($element, 'data-debug-mode', 'div-ds-scroll-area-processed');
            const text = $element.text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $element.attr('data-ai-rtl-direction', direction);
                applyDirectionMarker($element, direction, directionClassOptions);
                if (fontClass) {
                    $element.addClass(fontClass);
                }
                $element.addClass('AsOk2');
            }
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            $element.addClass(processedClass);
            return;
        }
        
        // CodeMirror / markdown code editors (ChatGPT cm-content, DeepSeek md-code-block, ...)
        if (tagName === 'div' && isCodeMirrorCodeBlock($element)) {
            processCodeMirrorBlock($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        // Custom code boxes that don't use pre/code (data-language, data-streamdown="code-block")
        // ChatGPT inline code is a hashed InlineCode-* class, not a <code> tag.
        if (isCustomCodeBlock($element) || isInlineCodeClassElement($element)) {
            processCodeLikeElement($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        // Skip KaTeX / MathML / SVG (Mermaid charts) — do not rewrite their HTML
        if (isKatexTreeElement(this) || isSvgTreeElement(this)) {
            setDebugAttr($element, 'data-debug-mode', 'structured-media-skipped');
            $element.attr("dir", "ltr");
            $element.find('*').addClass(processedClass);
            $element.addClass(processedClass);
            return;
        }

        
        // Skip table elements - they are processed by processTablesInContainer
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(tagName)) {
            $element.attr('data-debug-mode', 'table-element-skipped');
            // Mark all children as processed without processing them
            return;
        }
        
        // Special handling for code elements - use code detection algorithm
        if (['pre', 'code'].includes(tagName)) {
            processCodeLikeElement($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        
        // Special handling for paragraph or span elements with line breaks
         if (tagName === 'p' || tagName === 'span' || tagName === 'text') {
            if (containsStructuredMarkup(this)) {
                setDebugAttr($element, 'data-debug-mode', 'paragraph-with-structured-media');
                setTextDirectionAndFont(this, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass });
                skipStructuredMedia($element, processedClass);
                $element.addClass(processedClass);
                return;
            }

            // ChatGPT step lists: only span/bdi + br → dir on the paragraph, leave children alone.
            if (tagName === 'p' && isInlineSpanBdiBreakParagraph(this)) {
                setDebugAttr($element, 'data-debug-mode', 'paragraph-span-bdi-breaks');
                setTextDirectionAndFont(this, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass });
                $element.addClass(processedClass);
                return;
            }

            // Check if element only contains line break elements or whitespace
            const children = $element.children();
            const textContent = $element.text().trim();
            const htmlContent = $element.html();
            
            // Check if element only contains br elements
            const onlyBrElements = children.length > 0 && children.filter(function() {
                const tag = this.tagName.toLowerCase();
                return tag === 'br';
            }).length === children.length;
            
            // Check if element contains only whitespace characters (including \n, \r, spaces, tabs)
            const onlyWhitespace = textContent === '' || /^[\s\n\r\t]+$/.test(textContent);
            
            // Nested HTML (KaTeX, pretty-printed spans) often has \n that are not visual breaks.
            // Only treat newlines as line breaks when there are no nested elements, or when <br> exists.
            const hasBrTags = /<br\b/i.test(htmlContent);
            const containsLineBreaks = hasBrTags || (children.length === 0 && /[\n\r]/.test(htmlContent));

  
            if (onlyBrElements || onlyWhitespace || containsLineBreaks) {
                $element.addClass(processedClass);
            processParagraphWithBreaks(this, fontClass, setTextAlign, setUnicodeBidi, directionClassOptions);

                return;
            } 
        }
        // For all other elements, check if they have children (excluding formatting tags)
       
            // Count children excluding formatting tags
            const nonFormattingChildren = $element.children().filter(function() {
                return !allSkipTags.includes(this.tagName.toLowerCase());
            });
            const hasChildren = nonFormattingChildren.length > 0;
            
            if (hasChildren) {
                // حالت 1: المان فرزند غیرفرمت‌بندی دارد
                // بررسی اینکه آیا همه فرزندان فرمت‌بندی هستند یا نه
                const allChildren = $element.children();
                const formattingChildren = allChildren.filter(function() {
                    return allSkipTags.includes(this.tagName.toLowerCase());
                });
                
                if (formattingChildren.length === allChildren.length) {
                    // حالت 2: همه فرزندان allSkipTags هستند
                        setDebugAttr($element, 'data-debug-mode', 'all-formatting-tags');
                
                        setTextDirectionAndFont(this, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass });
                     $element.addClass(processedClass);
                } else if (formattingChildren.length > 0) {
                    // حالت 3: فقط بعضی از فرزندان allSkipTags هستند
                    setDebugAttr($element, 'data-debug-mode', 'mixed-children');
                   
                        setTextDirectionAndFont(this, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass });
                

                    $element.addClass(processedClass);


                } else {
                    // حالت 4: هیچ فرزندی allSkipTags نیست
                    // ul/ol و radiogroupهای ChatGPT مثل لیست پردازش می‌شوند.
                    const isListLike =
                        tagName === 'ol' ||
                        tagName === 'ul' ||
                        isRadioGroupElement(this);

                    if (
                        isListLike &&
                        processListLikeGroup($element, {
                            fontClass,
                            processedClass,
                            setTextAlign,
                            setUnicodeBidi,
                            rtlClass,
                            ltrClass,
                            codeFontClass,
                            directionClassOptions
                        })
                    ) {
                        // Handled as list-like group.
                    } else {
                        // برای سایر المان‌ها، پردازش بازگشتی انجام بده
                        processTextElementsAdvanced($element, {
                            fontClass,
                            processedClass,
                            isContainer: false,
                            skipTags,
                            removeSkipTags,
                            includeTags,
                            excludeTags,
                            setTextAlign,
                            setUnicodeBidi,
                            rtlClass,
                            ltrClass,
                            ignoreSelector,
                            onlyCss: options.onlyCss
                        });

                        // برای خود المان هم تصمیم بگیر
                        // Avoid clobbering ChatGPT radiogroup layout data-direction="col|row".
                        if (!isRadioGroupElement(this)) {
                            setTextDirectionAndFont(this, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass, ignoreSelector });
                        }

                        setDebugAttr($element, 'data-debug-mode', 'no-formatting-children');
                    }
                }
            } else {
                // حالت 5: المان فرزند ندارد
                setDebugAttr($element, 'data-debug-mode', 'no-children');
                
                // اگر المان مادرش در حالت list-processing باشه، پردازش نکن
                if ($element.parent().attr('data-as-mode') === 'list-processing') {
                    setDebugAttr($element, 'data-debug-mode', 'no-children-skipped-list-parent');
                    return;
                }
                // console.log("setTextDirectionAndFont no-children", $element , setTextAlign);
                
             $element.addClass(processedClass);
                 setTextDirectionAndFont($element, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass });
                
            }
        
    });
    flipRtlArrowsInTree(container);
    } catch (error) {
        if (isInvalidatedError(error)) {
            return;
        }
        throw error;
    }
}
