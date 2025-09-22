/**
 * Text direction utility functions
 * Helper functions for text direction processing across different websites
 */

// Import analysis functions from analyzeDirection.js
import { analyzeTextDirection, detectTextDirection, isRTL, isCode } from './analyzeDirection.js';


/**
 * Universal function to set text direction and font for any element
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} text - Text content to analyze
 * @param {string} fontClass - Font class to apply (optional)
 */
function setTextDirectionAndFont(element, text, fontClass = 'FontSet') {
    if (!text || !text.trim()) return;
    
    const direction = detectTextDirection(text.trim());

    console.log("setTextDirectionAndFont", element, text, direction)
    $(element).attr("dir", direction);
    if (fontClass) {
        $(element).addClass(fontClass);
    }
}

/**
 * Process paragraph elements that may contain <br> tags
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} fontClass - Font class to apply (optional)
 */
function processParagraphWithBreaks(element, fontClass = 'FontSet') {
    const $element = $(element);
    
    // Check if already processed using data attribute
    if ($element.data('rtl-processed')) {
        return;
    }
    
    // Process each line separated by <br> tags
    const htmlContent = $element.html();
    
    if (htmlContent && htmlContent.includes('<br')) {
        // Split by <br> tags and process each part (including br tags with attributes)
        const parts = htmlContent.split(/<br[^>]*>/i);
        
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
                setTextDirectionAndFont(element, mainText, fontClass);
                $element.data('rtl-processed', true);
            }
        }
    } else {
        // No <br> tags, process normally
        const mainText = $element.text();
        if (mainText && mainText.trim()) {
            setTextDirectionAndFont(element, mainText, fontClass);
            $element.data('rtl-processed', true);
        }
    }
}

/**
 * Universal function to process text elements in a container
 * @param {jQuery} container - Container to search in
 * @param {Array} selectors - Array of CSS selectors
 * @param {Function} textExtractor - Function to extract text from element
 * @param {string} fontClass - Font class to apply (optional)
 * @param {string} processedClass - Class to mark processed elements (optional)
 */
function processTextElementsChatGPT(container, selectors, textExtractor, fontClass = 'FontSet', processedClass = 'AsOk') {

    // Then process other elements as before
    selectors.forEach(selector => {
        container.children(selector).each(function (each) {
            if (!$(this).hasClass(processedClass)) {
                $(this).addClass(processedClass);
                
                // Special handling for paragraph elements with <br> tags
                if (selector === 'p') {
                    processParagraphWithBreaks(this, fontClass);
                } 
                // Special handling for code elements - use code detection algorithm
                else if (['pre', 'code'].includes(selector)) {
                    const text = textExtractor(this);
                    const hasLanguageTextClass = $(this).hasClass('language-text') || $(this).find('.language-text').length > 0;
                    const isCodeContent = !hasLanguageTextClass && isCode(text);
                    
                    
                    if (isCodeContent) {
                        // If content is detected as code, always force LTR
                        // Remove all dir attributes from child elements
                        // $(this).find('*').removeAttr('dir');
                        
                        $(this).attr("dir", "ltr");
                        if (fontClass) {
                            $(this).addClass(fontClass);
                        }
                        $(this).addClass('AsSetLtr');
                    } else {
                        // If not code or has language-text class, use normal direction detection
                        $(this).find('*').removeAttr('dir');
                        setTextDirectionAndFont(this, text, fontClass);
                    }
                }
                // Special handling for list elements - recursively process their children
                else if (['li', 'ul', 'ol', 'dl', 'dt', 'dd' , 'blockquote'].includes(selector)) {
                    const $element = $(this);
                    const hasChildren = $element.children().length > 0;
                    
                    if (hasChildren) {
                        // Check if element contains any formatting tags
                        const formattingTags = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'span'];
                        const hasFormattingTags = formattingTags.some(tag => $element.find(tag).length > 0);
                        
                        if (hasFormattingTags) {
                            // If contains formatting tags, process directly without examining children
                            const text = textExtractor(this);
                            setTextDirectionAndFont(this, text, fontClass);
                        } else {
                            // If has children but no strong tags, process them recursively
                            const text = textExtractor(this);
                            setTextDirectionAndFont(this, text, fontClass);
                            
                            // Recursively process children of list elements
                            const childSelectors = ['p', 'span', 'div', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time'];
                            processTextElementsChatGPT($(this), selectors, textExtractor, fontClass, processedClass);
                        }
                    } else {
                        // If no children, decide based on own content
                        const text = textExtractor(this);
                        setTextDirectionAndFont(this, text, fontClass);
                    }
                } 
                else {
                    const text = textExtractor(this);
                    setTextDirectionAndFont(this, text, fontClass);
                }
            }
        });
    });
}

/**
 * Claude-specific function to process text elements with smart direction detection
 * @param {jQuery} container - Container to search in
 * @param {Array} selectors - Array of CSS selectors
 * @param {Function} textExtractor - Function to extract text from element
 * @param {string} fontClass - Font class to apply (optional)
 * @param {string} processedClass - Class to mark processed elements (optional)
 */
function processTextElements(container, selectors, textExtractor, fontClass = 'FontSet', processedClass = 'AsOk') {

    // Then process other elements as before
    selectors.forEach(selector => {
        container.children(selector).each(function (each) {
            if (!$(this).hasClass(processedClass)) {
                $(this).addClass(processedClass);
                
                // Special handling for paragraph elements with <br> tags
                if (selector === 'p') {
                    processParagraphWithBreaks(this, fontClass);
                } 
                // Special handling for code elements - use code detection algorithm
                else if ([ 'pre', 'code'].includes(selector)) {
                    const text = textExtractor(this);
                    const hasLanguageTextClass = $(this).hasClass('language-text') || $(this).find('.language-text').length > 0;
                    const isCodeContent = !hasLanguageTextClass && isCode(text);
                    
                    console.log("processTextElements (Code)", text, isCodeContent, "hasLanguageTextClass:", hasLanguageTextClass);
                    
                    if (isCodeContent) {
                        // If content is detected as code, always force LTR
                        $(this).attr("dir", "ltr");
                        if (fontClass) {
                            $(this).addClass(fontClass);
                        }
                        $(this).addClass('AsSetLtr');
                        $(this).addClass('FontSetCode');
                        
                        console.log("processTextElements (LTR Code)", this, "Forced LTR for detected code element");
                    } else {
                        // If not code or has language-text class, use normal direction detection
                        $(this).find('*').removeAttr('dir');
                        setTextDirectionAndFont(this, text, fontClass);
                        console.log("processTextElements (Normal)", this, "Normal direction detection for non-code element");
                    }
                }
                // Special handling for list elements - check if has children first
                else if (['li', 'ul', 'ol', 'dl', 'dt', 'dd' , 'div' , 'p'].includes(selector)) {
                    const $element = $(this);
                    const hasChildren = $element.children().length > 0;
                    
                    if (hasChildren) {
                        // Check if element contains any formatting tags
                        const formattingTags = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'span'];
                        const hasFormattingTags = formattingTags.some(tag => $element.find(tag).length > 0);
                        
                        if (hasFormattingTags) {
                            // If contains formatting tags, process directly without examining children
                            const text = textExtractor(this);
                            setTextDirectionAndFont(this, text, fontClass);
                            console.log("processTextElements (With formatting tags)", this, "Processed directly");
                        } else {
                            // If has children but no strong tags, process them recursively
                            processTextElements($element, selectors, textExtractor, fontClass, processedClass);
                            
                            // Then count RTL vs LTR children to decide parent direction
                            const children = $element.find('*[dir]');
                            let rtlCount = 0;
                            let ltrCount = 0;
                            
                            children.each(function() {
                                const dir = $(this).attr('dir');
                                if (dir === 'rtl') {
                                    rtlCount++;
                                } else if (dir === 'ltr') {
                                    ltrCount++;
                                }
                            });
                            
                            // Decide parent direction based on children majority
                            const parentDirection = rtlCount > ltrCount ? 'rtl' : 'ltr';
                            $element.attr('dir', parentDirection);
                            
                            if (fontClass) {
                                $element.addClass(fontClass);
                            }
                            
                            // Check if children are li elements
                            const hasLiChildren = $element.children('li').length > 0;
                            
                            if (hasLiChildren) {
                                // If children are li elements, set the final direction to the li elements
                                $element.children('li').attr('dir', parentDirection);
                                console.log("processTextElements (Parent with LI children)", this, `RTL: ${rtlCount}, LTR: ${ltrCount}, LI children direction: ${parentDirection}`);
                            } else {
                                console.log("processTextElements (List/Div with children)", this, `RTL: ${rtlCount}, LTR: ${ltrCount}, Parent: ${parentDirection}`);
                            }
                        }
                    } else {
                        // If no children, decide based on own content
                        const text = textExtractor(this);
                        setTextDirectionAndFont(this, text, fontClass);
                        console.log("processTextElements (List/Div without children)", this, "Based on own content");
                    }
                } 
                else {
                    const text = textExtractor(this);
                    console.log("processTextElements", this , text)
                    setTextDirectionAndFont(this, text, fontClass);
                }
            }
        });
    });
}

/**
 * Get common text elements for articles
 * @returns {Array} Array of CSS selectors for article text elements
 */
function getArticleTextElements() {
    return [
        // عناصر اصلی متن
        'p', 'span', 'div',
        // عناوین
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // فرمت‌بندی متن
        'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'span',
        // نقل‌قول و کد
        'blockquote', 'pre', 'code',
        // لیست‌ها
        'li', 'ul', 'ol', 'dl', 'dt', 'dd',
        // جداول - بهبود یافته برای پوشش کامل
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
        // ساختار مقاله
        'article', 'section', 'aside', 'header', 'footer',
        // عناصر متنی خاص
        'cite', 'q', 'abbr', 'dfn', 'sub', 'sup', 'del', 'ins',
        // تصاویر و رسانه
        'figcaption', 'figure',
        // لینک‌ها
        'a',
        // عناصر اضافی برای جدول‌ها
        '[role="table"]', '[role="row"]', '[role="cell"]', '[role="columnheader"]', '[role="rowheader"]'
    ];
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
        
        // Check if all table items are already processed
        const allTableItems = $table.find('th, td, caption, tr');
        const unprocessedItems = allTableItems.filter(function() {
            return !$(this).hasClass(processedClass);
        });
        
        // If there are unprocessed items, skip this table for now
        if (unprocessedItems.length > 0) {
            console.log(`Table skipped - ${unprocessedItems.length} items not processed yet`);
            return;
        }
        
        // Collect all text content from the entire table
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
        if (unprocessedAriaItems.length > 0) {
            console.log(`ARIA Table skipped - ${unprocessedAriaItems.length} items not processed yet`);
            return;
        }
        
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
function processTextElementsAdvanced(container, fontClass = 'FontSet', processedClass = 'AsOk', isContainer = false) {
    console.log(`processTextElementsAdvanced called, isContainer: ${isContainer}`);

    // If this is a container, process tables first
    if (isContainer) {
        processTablesInContainer(container, fontClass, processedClass);
    }

    // Get all elements in the container, including deeply nested ones
    const allElements = container.find('*').addBack();
    
    allElements.each(function() {
        const $element = $(this);
        
        // Skip if already processed
        if ($element.hasClass(processedClass)) {
            return;
        }
        
        // Mark as processed
        $element.addClass(processedClass);
        
        // Get element tag name
        const tagName = this.tagName.toLowerCase();
        
        // Skip ms-code-block elements completely (for AI Studio code sections)
        // console.log("processTextElementsAdvanced", tagName , $element)
        if (tagName === 'ms-code-block') {
            console.log("ms-code-block return")
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip formatting tags completely
        const formattingTags = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time' , 'ms-cmark-node'];
        if (formattingTags.includes(tagName)) {
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip div elements with rounded-xl class (for Copilot code sections)
        if (tagName === 'div' && $element.hasClass('rounded-xl')) {
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Skip table elements - they are processed by processTablesInContainer
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(tagName)) {
            // Mark all children as processed without processing them
            $element.find('*').addClass(processedClass);
            return;
        }
        
        // Special handling for code elements - use code detection algorithm
        if (['pre', 'code'].includes(tagName)) {
            const text = $element.text();
            const hasLanguageTextClass = $element.hasClass('language-text') || $element.find('.language-text').length > 0;
            const isCodeContent = !hasLanguageTextClass && isCode(text);
            
            if (isCodeContent) {
                // If content is detected as code, always force LTR
                $element.attr("dir", "ltr");
                if (fontClass) {
                    $element.addClass(fontClass);
                }
                $element.addClass('AsSetLtr');
                $element.addClass('FontSetCode');
            } else {
                // If not code or has language-text class, use normal direction detection
                $element.find('*').removeAttr('dir');
                setTextDirectionAndFont(this, text, fontClass);
            }
        }
        // For all other elements, check if they have children
        else {
            const hasChildren = $element.children().length > 0;
            
            if (hasChildren) {
                // Check if element contains any formatting tags
                const formattingTags = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time'];
                const hasFormattingTags = formattingTags.some(tag => $element.find(tag).length > 0);
                
                
                if (hasFormattingTags) {
                    // If contains formatting tags, process directly without examining children
                    const text = $element.text();
                    if (text && text.trim()) {
                        setTextDirectionAndFont(this, text, fontClass);
                    }
                } else {
                    // If has other types of children, process them recursively
                    processTextElementsAdvanced($element, fontClass, processedClass);
                    
                    // Smart direction decision based on children and element type
                    const children = $element.find('*[dir]');
                    let rtlCount = 0;
                    let ltrCount = 0;
                    let textContent = '';
                    
                    children.each(function() {
                        const dir = $(this).attr('dir');
                        if (dir === 'rtl') {
                            rtlCount++;
                        } else if (dir === 'ltr') {
                            ltrCount++;
                        }
                    });
                    
                    // For li elements, also consider direct text content
                    if (tagName === 'li') {
                        const directText = $element.clone().children().remove().end().text().trim();
                        if (directText) {
                            const directDirection = detectTextDirection(directText);
                            if (directDirection === 'rtl') {
                                rtlCount++;
                            } else {
                                ltrCount++;
                            }
                        }
                    }
                    
                    // Decide parent direction based on children majority and element type
                    let parentDirection;
                    if (rtlCount > ltrCount) {
                        parentDirection = 'rtl';
                    } else if (ltrCount > rtlCount) {
                        parentDirection = 'ltr';
                    } else {
                        // If equal counts, check element's own text content
                        const elementText = $element.text().trim();
                        if (elementText) {
                            parentDirection = detectTextDirection(elementText);
                        } else {
                            parentDirection = 'ltr'; // Default fallback
                        }
                    }
                    $element.attr('dir', parentDirection);
                    
                    if (fontClass) {
                        $element.addClass(fontClass);
                    }
                }
            } else {
                // If no children, decide based on own text content
                const text = $element.text();
                if (text && text.trim()) {
                    setTextDirectionAndFont(this, text, fontClass);
                }
            }
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


export {
        analyzeTextDirection,
        detectTextDirection,
        isRTL,
        isCode,
        setTextDirectionAndFont,
        processParagraphWithBreaks,
        processTextElementsChatGPT,
        processTextElements,
        processTextElementsAdvanced,
        getArticleTextElements,
        getAttributeTextElements
    };

