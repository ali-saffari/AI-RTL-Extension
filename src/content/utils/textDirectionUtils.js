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
function processTextElements(container, selectors, textExtractor, fontClass = 'FontSet', processedClass = 'AsOk') {
    selectors.forEach(selector => {
        container.children(selector).each(function (each) {
            if (!$(this).hasClass(processedClass)) {
                $(this).addClass(processedClass);
                
                // Special handling for paragraph elements with <br> tags
                if (selector === 'p') {
                    processParagraphWithBreaks(this, fontClass);
                } 
                // Special handling for code elements - use code detection algorithm
                else if (['blockquote', 'pre', 'code'].includes(selector)) {
                    const text = textExtractor(this);
                    const hasLanguageTextClass = $(this).hasClass('language-text') || $(this).find('.language-text').length > 0;
                    const isCodeContent = !hasLanguageTextClass && isCode(text);
                    
                    console.log("processTextElements (Code)", text, isCodeContent, "hasLanguageTextClass:", hasLanguageTextClass);
                    
                    if (isCodeContent) {
                        // If content is detected as code, always force LTR
                        // Remove all dir attributes from child elements
                        // $(this).find('*').removeAttr('dir');
                        
                        $(this).attr("dir", "ltr");
                        if (fontClass) {
                            $(this).addClass(fontClass);
                        }
                        $(this).addClass('AsSetLtr');
                        console.log("processTextElements (LTR Code)", this, "Forced LTR for detected code element");
                    } else {
                        // If not code or has language-text class, use normal direction detection
                        $(this).find('*').removeAttr('dir');
                        setTextDirectionAndFont(this, text, fontClass);
                        console.log("processTextElements (Normal)", this, "Normal direction detection for non-code element");
                    }
                }
                // Special handling for list elements - recursively process their children
                else if (['li', 'ul', 'ol', 'dl', 'dt', 'dd'].includes(selector)) {
                    const text = textExtractor(this);
                    console.log("processTextElements", this)
                    setTextDirectionAndFont(this, text, fontClass);

                    // console.log("processTextElements (List)", this, "Forced LTR for list element");
                    
                    // Recursively process children of list elements
                    const childSelectors = ['p', 'span', 'div', 'strong', 'em', 'b', 'i', 'u', 'mark', 'small'];
                    processTextElements($(this), selectors, textExtractor, fontClass, processedClass);
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
        'strong', 'em', 'b', 'i', 'u', 'mark', 'small',
        // نقل‌قول و کد
        'blockquote', 'pre', 'code',
        // لیست‌ها
        'li', 'ul', 'ol', 'dl', 'dt', 'dd',
        // جداول
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
        // ساختار مقاله
        'article', 'section', 'aside', 'header', 'footer',
        // عناصر متنی خاص
        'cite', 'q', 'abbr', 'dfn', 'sub', 'sup', 'del', 'ins',
        // تصاویر و رسانه
        'figcaption', 'figure',
        // لینک‌ها
        'a'
    ];
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
        processTextElements,
        getArticleTextElements,
        getAttributeTextElements
    };

