/**
 * Text direction utility functions
 * Helper functions for text direction processing across different websites
 */

// Import analysis functions from analyzeDirection.js
import { analyzeTextDirection, detectTextDirection, isRTL, isCode } from './analyzeDirection.js';

// Common formatting tags array - defined once for consistency
const FORMATTING_TAGS = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'a', 'button'];


/**
 * One-time function to set text direction and font for any element
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {Object} options - Options object
 * @param {string} options.processedClass - Class to mark processed elements (default: 'AsSet')
 * @param {string} options.fontClass - Font class to apply (optional)
 * @param {string} options.text - Text content to analyze (optional)
 * @param {boolean} options.setTextAlign - Whether to set text alignment (optional)
 */
function setTextDirectionAndFontOneTime(element, options = {}) {
    const {
        processedClass = 'AsSet',
        fontClass = 'FontSet',
        text: providedText = null,
        setTextAlign = false
    } = options;
    
    const $element = $(element);
    
    // Check if already processed
    if ($element.hasClass(processedClass)) {
        return;
    }
    
    // Mark as processed
    $element.addClass(processedClass);
    
    // Delegate processing to setTextDirectionAndFont
    setTextDirectionAndFont(element, {
        fontClass,
        text: providedText,
        setTextAlign
    });
}

/**
 * Universal function to set text direction and font for any element
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {Object} options - Options object
 * @param {string} options.fontClass - Font class to apply (optional)
 * @param {string} options.text - Text content to analyze (optional)
 */
function setTextDirectionAndFont(element, options = {}) {
    const {
        fontClass = 'FontSet',
        text: providedText = null,
        setTextAlign = false
    } = options;
    
    // اگر متن پاس شده، از اون استفاده کن، وگرنه textWithoutLinks محاسبه کن
    let textToUse;
    if (providedText) {
        textToUse = providedText;
    } else {
        // متن رو بدون محتوای تگ a برای تشخیص جهت استفاده کن
        const $tempElement = $(element).clone();
        $tempElement.find('a').remove();
        $tempElement.find('div.rounded-xl').remove();
        $tempElement.find('pre, code').remove();
        $tempElement.find('button').remove();
        $tempElement.find('[data-copy="false"]').remove();
        textToUse = $tempElement.text().trim();
    }
    
    if (!textToUse || !textToUse.trim()) return;
    
    const direction = detectTextDirection(textToUse);


        $(element).attr('data-text', textToUse)
        $(element).attr('data-direction', direction)

    $(element).attr("dir", direction);
    if (fontClass) {
        $(element).addClass(fontClass);
    }
    
    // Set text alignment if setTextAlign is enabled
    if (setTextAlign) {
        if (direction === 'rtl') {
            $(element).css('text-align', 'right');
        } else {
            $(element).css('text-align', 'left');
        }
    }
}

/**
 * Process paragraph elements that may contain <br> tags
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} fontClass - Font class to apply (optional)
 */
function processParagraphWithBreaks(element, fontClass = 'FontSet' , setTextAlign) {
    const $element = $(element);
    
    // Check if already processed using data attribute
    if ($element.data('rtl-processed')) {
        return;
    }
    
    // Process each line separated by <br> tags or line break characters
    const htmlContent = $element.html();
    
    // Check for <br> tags or line break characters
    const hasLineBreaks = htmlContent && (
        htmlContent.includes('<br') || 
        /[\n\r]/.test(htmlContent)
    );
    
    if (hasLineBreaks) {
        // Split by <br> tags and line break characters, then process each part
        let parts = htmlContent.split(/<br[^>]*>/i);
        
        // If no <br> tags but has other line break characters, split by them
        if (parts.length === 1) {
            parts = htmlContent.split(/[\n\r]/);
        }
        


        // If we have multiple parts with different directions, we need to restructure
        if (parts.length > 1) {
            const directions = [];
            const texts = [];
            
            parts.forEach((part, index) => {
                if (part.trim()) {
                    const tempDiv = $('<div>').html(part);
                    const cleanText = tempDiv.text().trim();
                    
                    if (cleanText) {
                        const direction = detectTextDirection(cleanText);
                        directions.push(direction);
                        texts.push(cleanText);
                    }
                }
            });
            
            // Check if we have mixed directions
            const uniqueDirections = [...new Set(directions)];
            
            if (uniqueDirections.length > 1) {
                // Create separate elements for each part with different directions
                let newHtml = '';
                parts.forEach((part, index) => {
                    if (part.trim()) {
                        const tempDiv = $('<div>').html(part);
                        const cleanText = tempDiv.text().trim();
                        
                        if (cleanText) {
                            const direction = detectTextDirection(cleanText);
                            const divClass = fontClass ? ` class="${fontClass}"` : '';
                            newHtml += `<div${divClass} dir="${direction}" data-rtl-processed="true">${part}</div>`;
                        }
                    }
                });
                
                // Replace the content
                $element.html(newHtml);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
            } else {
                // All parts have the same direction, apply to the main element
                $element.attr("dir", directions[0]);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
            }
        } else {
            // Single part, process normally
            const mainText = $element.text();
            if (mainText && mainText.trim()) {
                setTextDirectionAndFont(element, { fontClass, setTextAlign });
                $element.data('rtl-processed', true);
            }
        }
    } else {
        // No <br> tags, process normally
        const mainText = $element.text();
        if (mainText && mainText.trim()) {
            setTextDirectionAndFont(element, { fontClass, text: mainText, setTextAlign });
            $element.data('rtl-processed', true);
        }
    }
}




/**
 * Process tables in container with unified direction decision
 * @param {jQuery} container - Container to search in
 * @param {string} fontClass - Font class to apply (optional)
 * @param {string} processedClass - Class to mark processed elements (optional)
 */
export function processTablesInContainer(container, fontClass = 'FontSet', processedClass = 'AsOk') {
    // Find all table elements in the container
    container.find('table').each(function() {
        const $table = $(this);

        $table.attr('data-debug-mode-2', 'table-element');


        
        // Check if all table items are already processed
        const allTableItems = $table.find('th, td, caption, tr');
        const unprocessedItems = allTableItems.filter(function() {
            return !$(this).hasClass(processedClass);
        });
        
        // If there are unprocessed items, skip this table for now
        if (unprocessedItems.length === 0) {
            return;
        }
        
        // If no unprocessed items, continue processing
        
        // Collect all text content from the entire table

        console.log("processTablesInContainer", $table)


        let allTableText = '';
        const tableElements = $table.find('th, td, caption').add($table.find('tr').not(':has(th, td)'));
        
        tableElements.each(function() {
            const text = $(this).text();
            if (text && text.trim()) {
                allTableText += ' ' + text.trim();
            }
        });
        
        // Make unified direction decision for entire table
        if (allTableText.trim()) {
            const tableDirection = detectTextDirection(allTableText.trim());
            
            // Apply direction to table and all its elements
            $table.attr('dir', tableDirection);
            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').attr('dir', tableDirection);
            
            // Set text alignment for all cells based on table direction
            if (tableDirection === 'rtl') {
                $table.find('th, td').css('text-align', 'right');
            } else {
                $table.find('th, td').css('text-align', 'left');
            }
            
            // Apply font class to all table elements
            if (fontClass) {
                $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').addClass(fontClass);
            }
            
            // Mark all table elements as processed
            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').addClass(processedClass);
            
            console.log(`Table processed with direction: ${tableDirection}, Text: ${allTableText.substring(0, 100)}...`);
        }
    });
    
    // Also process ARIA table roles
    container.find('[role="table"]').each(function() {
        const $table = $(this);
        
        // Check if all ARIA table items are already processed
        const allAriaTableItems = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"], [role="row"]');
        const unprocessedAriaItems = allAriaTableItems.filter(function() {
            return !$(this).hasClass(processedClass);
        });
        
        // If there are unprocessed items, skip this table for now
        if (unprocessedAriaItems.length === 0) {
            return;
        }
        
        console.log("processTablesInContainer", $table)


        // If no unprocessed items, continue processing
        
        // Collect all text content from the entire table
        let allTableText = '';
        const tableElements = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]');
        
        tableElements.each(function() {
            const text = $(this).text();
            if (text && text.trim()) {
                allTableText += ' ' + text.trim();
            }
        });
        
        // Make unified direction decision for entire table
        if (allTableText.trim()) {
            const tableDirection = detectTextDirection(allTableText.trim());
            
            // Apply direction to table and all its elements
            $table.attr('dir', tableDirection);
            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').attr('dir', tableDirection);
            
            // Set text alignment for all cells based on table direction
            if (tableDirection === 'rtl') {
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').css('text-align', 'right');
            } else {
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').css('text-align', 'left');
            }
            
            // Apply font class to all table elements
            if (fontClass) {
                $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').addClass(fontClass);
            }
            
            // Mark all table elements as processed
            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').addClass(processedClass);
            
            console.log(`ARIA Table processed with direction: ${tableDirection}, Text: ${allTableText.substring(0, 100)}...`);
        }
    });
}

/**
 * Advanced recursive text processing function that examines all elements
 * @param {jQuery} container - Container to search in
 * @param {string} fontClass - Font class to apply (optional)
 * @param {string} processedClass - Class to mark processed elements (optional)
 * @param {boolean} isContainer - Whether this is a container element (optional)
 */
function processTextElementsAdvanced(container, options = {}) {
    let {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        isContainer = false,
        skipTags = [],
        removeSkipTags = [],
        containerDir: initialContainerDir = false,
        setTextAlign = false
    } = options;
    
    let containerDir = initialContainerDir;
    // console.log(`processTextElementsAdvanced  ` , container[0] , {
    //     setTextAlign,
    //     isContainer
    // });

    // If this is a container, process tables first
    if (isContainer) {
        processTablesInContainer(container, fontClass, processedClass);
        
        var $tempElement = $(container).clone();
        $tempElement.find('a').remove();
        $tempElement.find('div.rounded-xl').remove();
        $tempElement.find('pre, code').remove();
        
        const cloneText = $tempElement.text().trim();
        containerDir = detectTextDirection(cloneText);

        // برای همه المان‌هایی که allSkipTags هستن فونت ست کن (به جز تگ‌های کد)
        const allTagsSetFont = [...FORMATTING_TAGS, ...skipTags].filter(tag => 
            !['code', 'pre'].includes(tag)
        );
        container.find(allTagsSetFont.join(',')).each(function() {
            const $element = $(this);
            if (!$element.hasClass(fontClass)) {
                $element.addClass(fontClass);
            }
        });
    }

    // Combine FORMATTING_TAGS with skipTags, then remove specified tags
    const allSkipTags = [...FORMATTING_TAGS, ...skipTags].filter(tag => 
        !removeSkipTags.includes(tag)
    );

    // Get only direct children of the container
    const allElements = container.children();
    
    allElements.each(function() {
        const $element = $(this);
        
        // Skip if already processed
        if ($element.hasClass(processedClass)) {
            return;
        }
        
        // Mark as processed
       
        
        // Get element tag name
        const tagName = this.tagName.toLowerCase();
        
        // اگر containerDir داریم و المان تگ عنوان هست، از containerDir استفاده کن
        if (containerDir && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            $element.attr('dir', containerDir);
            if (fontClass) {
                $element.addClass(fontClass);
            }
            $element.addClass(processedClass);
            $element.attr('data-debug-mode', 'header-using-container-dir');
            
            // Set text alignment for headers if setTextAlign is enabled
            if (setTextAlign) {
                if (containerDir === 'rtl') {
                    $element.css('text-align', 'right');
                } else {
                    $element.css('text-align', 'left');
                }
            }
            return;
        }
        
        // Skip ms-code-block elements completely (for AI Studio code sections)
        if (tagName === 'ms-code-block') {
            console.log("processTextElementsAdvanced: ms-code-block skipped", $element);
            $element.attr('data-debug-mode', 'ms-code-block-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip formatting tags completely

   
        if (allSkipTags.includes(tagName)) {
            $element.attr('data-debug-mode', 'formatting-tag-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip table elements and elements with table roles (they are handled by processTablesInContainer)
        const tableRoles = ['table', 'row', 'cell', 'columnheader', 'rowheader'];
        const elementRole = $element.attr('role');
        
        // Check if it's a table HTML tag
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(tagName)) {
            $element.attr('data-debug-mode', 'table-element-skipped');
            return;
        }
        
        // Check if it has table role attribute
        if (elementRole && tableRoles.includes(elementRole)) {
            $element.attr('data-debug-mode', 'table-role-skipped');
            return;
        }
        
        // Handle li elements that are inside ol or ul
        if (tagName === 'li' && ($element.parent().is('ol') || $element.parent().is('ul'))) {
            // Check if li contains pre or code elements
            const hasPreOrCode = $element.find('pre, code').length > 0;
            
            if (hasPreOrCode) {
                // If li contains pre or code, process with code logic
                const text = $element.text();
                const hasLanguageTextClass = $element.hasClass('language-text') || $element.find('.language-text').length > 0;
                const isCodeContent = !hasLanguageTextClass && isCode(text);
                
                $element.addClass(processedClass);

                if (isCodeContent) {
                    $element.attr('data-debug-mode', 'li-code-element-ltr');
                    // If content is detected as code, always force LTR
                    $element.attr("dir", "ltr");
                    $element.addClass('AsSetLtr');
                    $element.addClass('FontSetCode');
                } else {
                    $element.attr('data-debug-mode', 'li-code-element-normal');
                    // If not code or has language-text class, use normal direction detection
                    $element.find('*').removeAttr('dir');
                    setTextDirectionAndFont(this, { fontClass, setTextAlign });
                }
            } else {
                // If li doesn't contain pre or code, skip processing
                $element.attr('data-debug-mode', 'li-inside-list-skipped');
                // Don't mark as processed, just skip processing
            }
            return;
        }
        
        // Skip div elements with rounded-xl class (for Copilot code sections)
        if (tagName === 'div' && $element.hasClass('rounded-xl')) {
            $element.attr('data-debug-mode', 'div-rounded-xl-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        

        if (tagName === 'button') {
            $element.attr('data-debug-mode', 'div-rounded-xl-skipped');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        


        // Special handling for div elements with ds-scroll-area class
        if (tagName === 'div' && $element.hasClass('ds-scroll-area')) {
            $element.attr('data-debug-mode', 'div-ds-scroll-area-processed');
            const text = $element.text();
            if (text && text.trim()) {
                const direction = detectTextDirection(text);
                $element.attr('dir', direction);
                if (fontClass) {
                    $element.addClass(fontClass);
                }
                $element.addClass('AsOk2');
            }
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Special handling for div elements with md-code-block class (code content)
        if (tagName === 'div' && $element.hasClass('md-code-block')) {
            $element.attr('data-debug-mode', 'div-md-code-block-ltr');
            // Force LTR for code blocks
            $element.attr("dir", "ltr");
            // if (fontClass) {
            //     $element.addClass(fontClass);
            // }
            $element.addClass('AsSetLtr');
            $element.addClass('FontSetCode');
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
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
            const text = $element.text();
            const hasLanguageTextClass = $element.hasClass('language-text') || $element.find('.language-text').length > 0;
            const isCodeContent = !hasLanguageTextClass && isCode(text);
            
            $element.addClass(processedClass);

            if (isCodeContent) {
                $element.attr('data-debug-mode', 'code-element-ltr');
                // If content is detected as code, always force LTR
                $element.attr("dir", "ltr");
                // if (fontClass) {
                //     $element.addClass(fontClass);
                // }
                $element.addClass('AsSetLtr');
                $element.addClass('FontSetCode');
                $element.addClass(processedClass);
            } else {
                $element.attr('data-debug-mode', 'code-element-normal');
                // If not code or has language-text class, use normal direction detection
                $element.find('*').removeAttr('dir');
                $element.addClass(processedClass);
                 setTextDirectionAndFont(this, { fontClass, setTextAlign });
            }

            return;
        }

        
        // Special handling for paragraph or span elements with line breaks
         if (tagName === 'p' || tagName === 'span' ) {
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
            
            // Check if element contains line break characters
            const containsLineBreaks = /[\n\r]/.test(htmlContent);
            

  
            if (onlyBrElements || onlyWhitespace || containsLineBreaks) {
                $element.addClass(processedClass);
                processParagraphWithBreaks(this, fontClass, setTextAlign);

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
                    $element.attr('data-debug-mode', 'all-formatting-tags');
                
                        setTextDirectionAndFont(this, { fontClass, setTextAlign });
                     $element.addClass(processedClass);
                } else if (formattingChildren.length > 0) {
                    // حالت 3: فقط بعضی از فرزندان allSkipTags هستند
                    $element.attr('data-debug-mode', 'mixed-children');
                   
                        setTextDirectionAndFont(this, { fontClass, setTextAlign });
                

                    $element.addClass(processedClass);


                } else {
                    // حالت 4: هیچ فرزندی allSkipTags نیست
               
                    
                    // اگر المان ol یا ul هست، جدا تصمیم بگیر
                    if (tagName === 'ol' || tagName === 'ul') {
                        $element.attr('data-debug-mode', 'list-processing');
                        $element.attr('data-as-mode', 'list-processing');
                        
                        // آیتم‌های داخل لیست رو مستقل بررسی کن
                        const listItems = $element.children('li');
                        let processedCount = 0;
                        let unprocessedCount = 0;
                        
                        listItems.each(function() {
                            const $li = $(this);
                            if ($li.hasClass(processedClass)) {
                                processedCount++;
                            } else {
                                unprocessedCount++;
                                // آیتم‌های پردازش نشده رو با setTextDirectionAndFont پردازش کن
                     
                                    setTextDirectionAndFont(this, { fontClass, setTextAlign });
                                


                                $li.find('pre, code').each(function() {

                                    const text = $(this).text();
                                    const hasLanguageTextClass = $(this).hasClass('language-text') || $(this).find('.language-text').length > 0;
                                    const isCodeContent = !hasLanguageTextClass && isCode(text);
                                    
                                    $(this).addClass(processedClass);
                        
                                    if (isCodeContent) {
                                        $(this).attr('data-debug-mode', 'code-element-ltr');
                                        // If content is detected as code, always force LTR
                                        $(this).attr("dir", "ltr");
                                        // if (fontClass) {
                                        //     $element.addClass(fontClass);
                                        // }
                                        $(this).addClass('AsSetLtr');
                                        $(this).addClass('FontSetCode');
                                        $(this).addClass(processedClass);
                                    } else {
                                        $(this).attr('data-debug-mode', 'code-element-normal');
                                        // If not code or has language-text class, use normal direction detection
                                        $(this).find('*').removeAttr('dir');
                                        $(this).addClass(processedClass);
                                                            setTextDirectionAndFont(this, { fontClass, setTextAlign });
                                    }

                                })

                          

                            }
                        });
                        
                        // بر اساس جهت آیتم‌های لیست، جهت اصل لیست رو تعیین کن
                        const processedItems = $element.find('li[dir]');
                        let rtlCount = 0;
                        let ltrCount = 0;
                        
                        processedItems.each(function() {
                            const dir = $(this).attr('dir');
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
                            // اگر تعداد مساوی باشه، بر اساس متن کل لیست تصمیم بگیر
                            const listText = $element.text().trim();
                            if (listText) {
                                listDirection = detectTextDirection(listText);
                                debugReason = `list-text-${listDirection}`;
                            } else {
                                listDirection = 'ltr';
                                debugReason = 'list-default-ltr';
                            }
                        }
                        
              
                        // جهت آیتم‌ها رو به جهت لیست تغییر بده
                        processedItems.each(function() {

                            $(this).attr('data-org-dir',  $(this).attr('dir'));

                            $(this).attr('data-dir', listDirection);
                           
                            $(this).attr('dir', listDirection);
                            
                            // Set text alignment for list items if setTextAlign is enabled
                            if (setTextAlign) {
                                if (listDirection === 'rtl') {
                                    $(this).css('text-align', 'right');
                                } else {
                                    $(this).css('text-align', 'left');
                                }
                            }
                           
                        });
                        
                        $element.attr('dir', listDirection);
                        $element.attr('data-debug-reason', debugReason);
                        $element.attr('data-debug-processed', `${processedCount}-${unprocessedCount}`);
                        
                        // Set text alignment for the list itself if setTextAlign is enabled
                        if (setTextAlign) {
                            if (listDirection === 'rtl') {
                                $element.css('text-align', 'right');
                            } else {
                                $element.css('text-align', 'left');
                            }
                        }
                        
                    } else {
                        // برای سایر المان‌ها، پردازش بازگشتی انجام بده
                        processTextElementsAdvanced($element, {
                            fontClass,
                            processedClass,
                            isContainer: false,
                            skipTags,
                            removeSkipTags,
                            setTextAlign,
                            containerDir
                        });

                        // برای خود المان هم تصمیم بگیر
                    
                            setTextDirectionAndFont(this, { fontClass, setTextAlign });
                        

                        $element.attr('data-debug-mode', 'no-formatting-children');
                    }
                }
            } else {
                // حالت 5: المان فرزند ندارد
                $element.attr('data-debug-mode', 'no-children');
                
                // اگر المان مادرش در حالت list-processing باشه، پردازش نکن
                if ($element.parent().attr('data-as-mode') === 'list-processing') {
                    $element.attr('data-debug-mode', 'no-children-skipped-list-parent');
                    return;
                }
                console.log("setTextDirectionAndFont no-children", $element , setTextAlign);
                
             $element.addClass(processedClass);
                 setTextDirectionAndFont($element, { fontClass, setTextAlign });
                
            }
        
    });
}



/**
 * Get common attribute selectors for text content
 * @returns {Array} Array of CSS selectors for elements with text attributes
 */
function getAttributeTextElements() {
    return [
        "[title]", "[alt]", "[aria-label]"
    ];
}

/**
 * Process text elements based on RTL algorithm
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} options - Additional options (optional)
 */
function processTextElementsByRtlAlgorithm(element, rtlAlgorithm, options = {}) {
    const $element = $(element);
    
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
    
    if (rtlAlgorithm === 'advanced_section') {
        const mergedOptions = { ...defaultOptions.advanced_section, ...options };
        processTextElementsAdvanced($element, mergedOptions);
        
    } else if (rtlAlgorithm === 'advanced_full') {
        const mergedOptions = { ...defaultOptions.advanced_full, ...options };
        setTextDirectionAndFont(element, mergedOptions);

    } else if (rtlAlgorithm === 'first_word') {
        $element.attr("dir", "auto");
        
        const fontClass = options.fontClass || defaultOptions.first_word.fontClass;
        if (!$element.hasClass(fontClass)) {
            $element.addClass(fontClass);
        }
    }
}

export {
        analyzeTextDirection,
        detectTextDirection,
        isRTL,
        isCode,
        setTextDirectionAndFontOneTime,
        setTextDirectionAndFont,
        processParagraphWithBreaks,
        processTextElementsAdvanced,
        getAttributeTextElements,
        processTextElementsByRtlAlgorithm
    };

