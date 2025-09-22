/**
 * Text direction utility functions
 * Helper functions for text direction processing across different websites
 */

// Import analysis functions from analyzeDirection.js
const { analyzeTextDirection, detectTextDirection, isRTL } = require('./analyzeDirection.js');

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
    console.log('Processing paragraph:', $element[0]);
    
    // Check if already processed using data attribute
    if ($element.data('rtl-processed')) {
        console.log('Already processed, skipping');
        return;
    }
    
    // Process each line separated by <br> tags
    const htmlContent = $element.html();
    console.log('HTML content:', htmlContent);
    
    if (htmlContent && htmlContent.includes('<br')) {
        console.log('Found <br> tags, processing...');
        
        // Split by <br> tags and process each part (including br tags with attributes)
        const parts = htmlContent.split(/<br[^>]*>/i);
        console.log('Split parts:', parts);
        
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
                        console.log(`Paragraph part ${index + 1}:`, cleanText, 'Direction:', direction);
                    }
                }
            });
            
            console.log('All directions:', directions);
            
            // Check if we have mixed directions
            const uniqueDirections = [...new Set(directions)];
            console.log('Unique directions:', uniqueDirections);
            
            if (uniqueDirections.length > 1) {
                console.log('Mixed directions detected, restructuring...');
                
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
                
                console.log('New HTML:', newHtml);
                
                // Replace the content
                $element.html(newHtml);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
                
                console.log('Paragraph restructured successfully');
            } else {
                // All parts have the same direction, apply to the main element
                console.log('Same direction for all parts:', directions[0]);
                $element.attr("dir", directions[0]);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
            }
        } else {
            // Single part, process normally
            console.log('Single part, processing normally');
            const mainText = $element.text();
            if (mainText && mainText.trim()) {
                setTextDirectionAndFont(element, mainText, fontClass);
                $element.data('rtl-processed', true);
            }
        }
    } else {
        // No <br> tags, process normally
        console.log('No <br> tags, processing normally');
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
        container.find(selector).each(function (each) {
            if (!$(this).hasClass(processedClass)) {
                $(this).addClass(processedClass);
                
                // Special handling for paragraph elements with <br> tags
                if (selector === 'p') {

                    console.log("processParagraphWithBreaks", this)
                    processParagraphWithBreaks(this, fontClass);
                } else {
                    const text = textExtractor(this);
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


    module.exports = {
        analyzeTextDirection,
        detectTextDirection,
        isRTL,
        setTextDirectionAndFont,
        processParagraphWithBreaks,
        processTextElements,
        getArticleTextElements,
        getAttributeTextElements
    };

