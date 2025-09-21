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
                const text = textExtractor(this);
                setTextDirectionAndFont(this, text, fontClass);
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
        processTextElements,
        getArticleTextElements,
        getAttributeTextElements
    };

