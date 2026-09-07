/**
 * Recursive walk of message / markdown children (advanced_section).
 * Used by applyRtlToContainer and a few site services that call it directly.
 */

import { detectTextDirection } from '../analyzeDirection.js';
import { isRtlEngineActive } from '../originalState.js';
import { flipRtlArrowsInTree } from './arrows.js';
import {
    processCodeBlockNode,
    processCodeLikeElement,
    processCodeMirrorBlock
} from './codeBlocks.js';
import {
    CODE_BLOCK_SELECTOR,
    CUSTOM_CODE_BLOCK_SELECTOR,
    isCodeMirrorCodeBlock,
    isCustomCodeBlock
} from './codeSelectors.js';
import { processParagraphWithBreaks, setTextDirectionAndFont } from './applyElementDirection.js';
import { isLockedMarkdownEditor } from './lockedEditor.js';
import { getMixedTitleDisplayMode, isInvalidatedError } from './settings.js';
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

const DEBUG_MODE = false;

function setDebugAttr($element, attrName, value) {
    if (DEBUG_MODE) {
        $element.attr(attrName, value);
    }
}

const FORMATTING_TAGS = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'a', 'button'];

function normalizeTagNameList(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .map((tag) => String(tag || '').trim().toLowerCase())
        .filter(Boolean);
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
            const $element = AQ(this);
            if (!$element.hasClass(fontClass)) {
                $element.addClass(fontClass);
            }
        });


   
    }


    if (removeDirAuto) {
        container.find('*[dir="auto"]').each(function() {
            if (!AQ(this).hasClass("removeedDirAuto")) {
                AQ(this).removeAttr('dir').addClass("removeedDirAuto");
            }
        });
    }


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

             $element.attr('data-direction', direction);
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
                            AQ(this).attr('data-direction', majorityDir);
                            applyDirectionMarker(AQ(this), majorityDir, directionClassOptions);
                
                            applyTextAlignByDirection(this, majorityDir, setTextAlign);
                            applyUnicodeBidiByDirection(this, majorityDir, setUnicodeBidi);
                        });
                        
                        console.log(`Header ${tagName} direction set to ${majorityDir} (RTL: ${rtlCount}, LTR: ${ltrCount}) - Unified mode`);
                    }
                }
                // In individual mode, each header keeps its own direction (already set above)

            setDebugAttr($element, 'data-debug-mode', 'header-processed');
            return;
        }
        
        // Skip ms-code-block elements completely (for AI Studio code sections)
        if (tagName === 'ms-code-block') {
            // console.log("processTextElementsAdvanced: ms-code-block skipped", $element);
            setDebugAttr($element, 'data-debug-mode', 'ms-code-block-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
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
        


        // Special handling for div elements with ds-scroll-area class
        if (tagName === 'div' && $element.hasClass('ds-scroll-area')) {
            setDebugAttr($element, 'data-debug-mode', 'div-ds-scroll-area-processed');
            const text = $element.text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $element.attr('data-direction', direction);
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
        if (isCustomCodeBlock($element)) {
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
               
                    
                    // اگر المان ol یا ul هست، جدا تصمیم بگیر
                    if (tagName === 'ol' || tagName === 'ul') {
                        setDebugAttr($element, 'data-debug-mode', 'list-processing');
                        setDebugAttr($element, 'data-as-mode', 'list-processing');
                        
                        // آیتم‌های داخل لیست رو مستقل بررسی کن
                        const listItems = $element.children('li');
                        let processedCount = 0;
                        let unprocessedCount = 0;
                        
                        listItems.each(function() {
                            const $li = AQ(this);
                            if ($li.hasClass(processedClass)) {
                                processedCount++;
                            } else {
                                unprocessedCount++;
                                
                                // بررسی اولین چیلد - اگر strong بود، از محتوای strong استفاده کن
                                // const firstChild = $li.children().first();
                                // let textForDirection = null;
                                
                                // if (firstChild.length && firstChild.is('strong')) {
                                //     textForDirection = firstChild.text().trim();
                                //     $li.attr('data-debug-mode', 'li-first-child-strong');
                                // }
                                setTextDirectionAndFont(this, { 
                                    fontClass, 
                                    setTextAlign,
                                    setUnicodeBidi,
                                    rtlClass,
                                    ltrClass
                                    // text: textForDirection 
                                });
                                
                                // آیتم‌های پردازش نشده رو با setTextDirectionAndFont پردازش کن
                            

                                $li.find(CODE_BLOCK_SELECTOR).each(function() {
                                    processCodeBlockNode(AQ(this), { fontClass, setTextAlign, processedClass, codeFontClass });
                                })

                            }
                        });
                        
                        // بر اساس جهت آیتم‌های لیست، جهت اصل لیست رو تعیین کن
                        const processedItems = $element.find('li[dir]');
                        let rtlCount = 0;
                        let ltrCount = 0;
                        
                        processedItems.each(function() {
                            const dir = AQ(this).attr('data-direction');
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
                            // اگر تعداد مساوی باشه، به المنت قبل نگاه کن
                            const prevElementDir = $element.prev().attr('data-direction') || $element.prev().attr('dir');
                            if (prevElementDir && (prevElementDir === 'rtl' || prevElementDir === 'ltr')) {
                                listDirection = prevElementDir;
                                debugReason = `list-prev-dir-${prevElementDir}`;
                            } else {
                                // اگر المنت قبلی وجود نداشت، تعداد کلمات فارسی و انگلیسی رو بشمار
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
                        
              
                        // جهت آیتم‌ها رو به جهت لیست تغییر بده
                        processedItems.each(function() {

                            AQ(this).attr('data-org-dir',  AQ(this).attr('data-direction') || AQ(this).attr('dir'));

                            // AQ(this).attr('data-dir', listDirection);
                           
                            applyDirectionMarker(AQ(this), listDirection, directionClassOptions);
                            
                            applyTextAlignByDirection(this, listDirection, setTextAlign);
                            applyUnicodeBidiByDirection(this, listDirection, setUnicodeBidi);
                           
                        });
                        
                        $element.attr('data-direction', listDirection);
                        applyDirectionMarker($element, listDirection, directionClassOptions);
                        setDebugAttr($element, 'data-debug-reason', debugReason);
                        setDebugAttr($element, 'data-debug-processed', `${processedCount}-${unprocessedCount}`);
                        
                        applyTextAlignByDirection($element, listDirection, setTextAlign);
                        applyUnicodeBidiByDirection($element, listDirection, setUnicodeBidi);
                        
                    } else {
                        // برای سایر المان‌ها، پردازش بازگشتی انجام بده
                        processTextElementsAdvanced($element, {
                            fontClass,
                            processedClass,
                            isContainer: false,
                            skipTags,
                            removeSkipTags,
                            setTextAlign,
                            setUnicodeBidi,
                            rtlClass,
                            ltrClass
                        });

                        // برای خود المان هم تصمیم بگیر
                    
                            setTextDirectionAndFont(this, { fontClass, setTextAlign, setUnicodeBidi, rtlClass, ltrClass });
                        

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
