/**
 * Text direction utility functions
 * Helper functions for text direction processing across different websites
 */

// Import analysis functions from analyzeDirection.js
import { analyzeTextDirection, detectTextDirection, isRTL, isCode, analyzeTextDirectionFirstWord } from './analyzeDirection.js';

// Debug flag - set to false for release builds
const DEBUG_MODE = false;

// Helper function to set debug attributes only in debug mode
function setDebugAttr($element, attrName, value) {
    if (DEBUG_MODE) {
        $element.attr(attrName, value);
    }
}

// Common formatting tags array - defined once for consistency
const FORMATTING_TAGS = ['strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'var', 'code', 'kbd', 'samp', 'cite', 'q', 'abbr', 'dfn', 'time', 'a', 'button'];

const DEFAULT_MIXED_TITLE_DISPLAY_MODE = 'unified';
let mixedTitleDisplayModeCache = DEFAULT_MIXED_TITLE_DISPLAY_MODE;
let applyAlgorithmToCodeCache = false;
let flipRtlArrowsCache = false;

const ALWAYS_SKIP_ARROW_FLIP_SELECTOR = [
    'textarea', 'input', 'script', 'style', 'svg', 'math',
    '.katex', '.katex-html', '.katex-display', '.ProseMirror'
].join(', ');

const CODE_SKIP_ARROW_FLIP_SELECTOR = [
    'pre', 'code', 'kbd', 'samp',
    '.cm-content', '.cm-editor', '.cm-line', '.md-code-block'
].join(', ');

const UNICODE_ARROW_FLIP_MAP = {
    '→': '←',
    '⇒': '⇐',
    '⟶': '⟵',
    '⟹': '⟸',
    '➡': '⬅',
    '▶': '◀',
    '▷': '◁',
    '►': '◄',
    '▸': '◂',
    '▻': '◅',
    '⇨': '⇦',
    '⇾': '⇽',
    '↦': '↤',
    '↠': '↞',
    '↝': '↜',
    '↣': '↢',
    '⇀': '↼',
    '⇝': '⇜',
    '⇢': '⇠',
    '☞': '☜',
    '☛': '☚',
    '➜': '←',
    '➔': '←',
    '➝': '←',
    '➞': '←'
};
const UNICODE_ARROW_FLIP_RE = new RegExp(`[${Object.keys(UNICODE_ARROW_FLIP_MAP).join('')}]`, 'g');
const FLIPPABLE_ARROW_RE = /==>|-->|=>|->|[→⇒⟶⟹➡▶▷►▸▻⇨⇾↦↠↝↣⇀⇝⇢☞☛➜➔➝➞]/;

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

function isInvalidatedError(error) {
    const message = error?.message || String(error || '');
    return message.includes('Extension context invalidated') || !isExtensionContextValid();
}

function setMixedTitleDisplayMode(mode) {
    mixedTitleDisplayModeCache = mode || DEFAULT_MIXED_TITLE_DISPLAY_MODE;
}

function setApplyAlgorithmToCode(enabled) {
    applyAlgorithmToCodeCache = enabled === true;
    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.toggle('ai-rtl-code-algorithm', applyAlgorithmToCodeCache);
    }
}

function isApplyAlgorithmToCodeEnabled() {
    return applyAlgorithmToCodeCache === true;
}

function setFlipRtlArrows(enabled) {
    flipRtlArrowsCache = enabled === true;
}

function isFlipRtlArrowsEnabled() {
    return flipRtlArrowsCache === true;
}

function unwrapElement(element) {
    if (!element) {
        return null;
    }
    if (element.nodeType === 1) {
        return element;
    }
    if (element[0] && element[0].nodeType === 1) {
        return element[0];
    }
    return null;
}

function flipArrowsInText(text) {
    if (!text || !FLIPPABLE_ARROW_RE.test(text)) {
        return text;
    }
    return text
        .replace(/==>/g, '<==')
        .replace(/-->/g, '<--')
        .replace(/=>/g, '<=')
        .replace(/->/g, '<-')
        .replace(UNICODE_ARROW_FLIP_RE, (ch) => UNICODE_ARROW_FLIP_MAP[ch] || ch);
}

function shouldSkipArrowFlip(parent) {
    if (!parent || typeof parent.closest !== 'function') {
        return true;
    }
    if (parent.closest(ALWAYS_SKIP_ARROW_FLIP_SELECTOR)) {
        return true;
    }
    if (!isApplyAlgorithmToCodeEnabled() && parent.closest(CODE_SKIP_ARROW_FLIP_SELECTOR)) {
        return true;
    }
    return false;
}

function isTextNodeInRtlContext(textNode) {
    let current = textNode.parentElement;
    while (current) {
        const dir = current.getAttribute('dir');
        if (dir === 'rtl') {
            return true;
        }
        if (dir === 'ltr') {
            return false;
        }
        if (dir === 'auto') {
            try {
                return getComputedStyle(current).direction === 'rtl';
            } catch {
                return false;
            }
        }
        current = current.parentElement;
    }

    const parent = textNode.parentElement;
    if (!parent) {
        return false;
    }
    try {
        return getComputedStyle(parent).direction === 'rtl';
    } catch {
        return false;
    }
}

function flipRtlArrowsInTree(element) {
    if (!isFlipRtlArrowsEnabled()) {
        return;
    }

    const root = unwrapElement(element);
    if (!root || typeof document === 'undefined' || !document.createTreeWalker) {
        return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const text = node.nodeValue;
            if (!text || !FLIPPABLE_ARROW_RE.test(text)) {
                return NodeFilter.FILTER_REJECT;
            }

            const parent = node.parentElement;
            if (!parent) {
                return NodeFilter.FILTER_REJECT;
            }
            if (shouldSkipArrowFlip(parent)) {
                return NodeFilter.FILTER_REJECT;
            }
            if (!isTextNodeInRtlContext(node)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {
        const next = flipArrowsInText(node.nodeValue);
        if (next !== node.nodeValue) {
            node.nodeValue = next;
        }
    }
}

function applyForcedCodeLtr($element) {
    $element.attr('dir', 'ltr');
    $element.css('text-align', 'left');
    $element.addClass('AsSetLtr');
    $element.removeClass('FontSet FontSetCode FontSetGPT FontSetCodeBlocksGPT');
}

const CM_DIR_STYLE_ID = 'ai-rtl-cm-code-direction';

function ensureCodeMirrorDirectionStyles() {
    if (typeof document === 'undefined' || document.getElementById(CM_DIR_STYLE_ID)) {
        return;
    }
    const style = document.createElement('style');
    style.id = CM_DIR_STYLE_ID;
    style.textContent = `
        .cm-content[dir="rtl"], .cm-line[dir="rtl"] {
            direction: rtl !important;
            unicode-bidi: isolate;
        }
        .cm-content[dir="ltr"], .cm-line[dir="ltr"] {
            direction: ltr !important;
            unicode-bidi: isolate;
        }
        .cm-content[dir="rtl"], .cm-line[dir="rtl"] { text-align: right !important; }
        .cm-content[dir="ltr"], .cm-line[dir="ltr"] { text-align: left !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
}

function isCodeElementContent($element) {
    const text = $element.text();
    const hasLanguageTextClass = $element.hasClass('language-text') || $element.find('.language-text').length > 0;
    return !hasLanguageTextClass && isCode(text);
}

function processCodeLikeElement($element, element, options = {}) {
    const { fontClass, setTextAlign, processedClass, codeFontClass } = options;
    if (processedClass) {
        $element.addClass(processedClass);
    }

    const text = $element.text();
    const isCodeContent = isCodeElementContent($element);
    const appliedFontClass = isCodeContent ? (codeFontClass || fontClass) : fontClass;

    if (isCodeContent && !isApplyAlgorithmToCodeEnabled()) {
        setDebugAttr($element, 'data-debug-mode', 'code-element-ltr');
        applyForcedCodeLtr($element);
        return;
    }

    setDebugAttr($element, 'data-debug-mode', isCodeContent ? 'code-element-algorithm' : 'code-element-normal');
    $element.find('*').removeAttr('dir');
    setTextDirectionAndFont(element, {
        fontClass: appliedFontClass,
        setTextAlign: isCodeContent || setTextAlign,
        text,
        applyFontIfRtl: isCodeContent
    });
}

function isCodeMirrorCodeBlock($element) {
    return $element.hasClass('cm-content') || $element.hasClass('cm-editor') || $element.hasClass('md-code-block');
}

function getCodeMirrorTargets($element, $content) {
    let $targets = $content.add($content.children('.cm-line'));
    if ($element[0] !== $content[0]) {
        $targets = $targets.add($element);
    }
    return $targets;
}

function applyCodeBlockDirection($targets, direction, fontClass) {
    $targets.each(function() {
        const $el = AQ(this);
        if (direction === 'rtl') {
            $el.attr('dir', 'rtl');
            $el.attr('data-direction', 'rtl');
            $el.css('text-align', 'right');
            $el.removeClass('AsSetLtr');
            if (fontClass) {
                $el.addClass(fontClass);
            }
            return;
        }
        applyForcedCodeLtr($el);
        if (fontClass) {
            $el.removeClass(fontClass);
        }
    });
}

function processCodeMirrorBlock($element, element, options = {}) {
    const { fontClass, processedClass, codeFontClass } = options;
    const blockFontClass = codeFontClass || fontClass;
    const $content = $element.hasClass('cm-content')
        ? $element
        : ($element.find('.cm-content').first().length ? $element.find('.cm-content').first() : $element);

    ensureCodeMirrorDirectionStyles();

    if (processedClass) {
        $element.addClass(processedClass);
        $element.find('*').addClass(processedClass);
    }

    const $targets = getCodeMirrorTargets($element, $content);

    if (!isApplyAlgorithmToCodeEnabled()) {
        setDebugAttr($element, 'data-debug-mode', 'cm-code-block-ltr');
        applyCodeBlockDirection($targets, 'ltr', blockFontClass);
        return;
    }

    const blockText = $content.text();
    const direction = detectTextDirection(blockText) === 'rtl' ? 'rtl' : 'ltr';
    setDebugAttr($element, 'data-debug-mode', 'cm-code-block-unified');
    applyCodeBlockDirection($targets, direction, blockFontClass);
    if (direction === 'rtl') {
        flipRtlArrowsInTree($content);
    }
}

function processCodeMirrorBlocks(container, options = {}) {
    const $root = container ? AQ(container) : AQ(document);
    $root.find('.cm-content, .md-code-block').add($root.filter('.cm-content, .md-code-block')).each(function() {
        processCodeMirrorBlock(AQ(this), this, options);
    });
}


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
    
    const $element = AQ(element);
    
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
        setTextAlign = false,
        applyFontIfRtl = false
    } = options;
    
    // اگر متن پاس شده، از اون استفاده کن، وگرنه textWithoutLinks محاسبه کن
    let textToUse;
    if (providedText) {
        textToUse = providedText;
    } else {
        // متن رو بدون محتوای تگ a برای تشخیص جهت استفاده کن
        const $tempElement = AQ(element).clone();
        $tempElement.find('a').remove();
        $tempElement.find('div.rounded-xl').remove();
        $tempElement.find('pre, code').remove();
        $tempElement.find('.cm-content, .cm-editor, .md-code-block').remove();
        $tempElement.find('button').remove();
        $tempElement.find('[data-copy="false"]').remove();
        textToUse = $tempElement.text().trim();
        
        // اگر text() خالی بود، val() رو چک کن (برای input/textarea)
        if (!textToUse || !textToUse.trim()) {
            textToUse = AQ(element).val();
            if (textToUse) {
                textToUse = textToUse.trim();
            }
        }
    }
    
    if (!textToUse || !textToUse.trim()) return 'auto';
    
    const direction = detectTextDirection(textToUse);
    
    // If detectTextDirection returns empty or null, use 'auto'
    const finalDirection = direction || 'auto';

        // AQ(element).attr('data-text', textToUse)
        AQ(element).attr('data-direction', finalDirection)

    AQ(element).attr("dir", finalDirection);
    if (fontClass) {
        if (!applyFontIfRtl || finalDirection === 'rtl') {
            AQ(element).addClass(fontClass);
        } else {
            AQ(element).removeClass(fontClass);
        }
    }
    
    // Set text alignment if setTextAlign is enabled
    if (setTextAlign && finalDirection !== 'auto') {
        if (finalDirection === 'rtl') {
            AQ(element).css('text-align', 'right');
        } else {
            AQ(element).css('text-align', 'left');
        }
    }

    if (finalDirection === 'rtl') {
        flipRtlArrowsInTree(element);
    }
    
    return finalDirection;
}

/**
 * Process paragraph elements that may contain <br> tags
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} fontClass - Font class to apply (optional)
 */
function processParagraphWithBreaks(element, fontClass = 'FontSet' , setTextAlign) {
    const $element = AQ(element);
    
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
                    const tempDiv = AQ('<div>').html(part);
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
                        const tempDiv = AQ('<div>').html(part);
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
 * @param {Object} options - Options object
 * @param {string} options.fontClass - Font class to apply (optional, default: 'FontSet')
 * @param {string} options.processedClass - Class to mark processed elements (optional, default: 'AsOk')
 * @param {string} options.siteConfig - Site configuration for specific optimizations (optional)
 */
export function processTablesInContainer(container, options = {}) {
    const {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        siteConfig = null
    } = options;
    // Find all table elements in the container

 

    container.find('table').each(function() {
        const $table = AQ(this);




        console.log('siteConfig', siteConfig);
        setDebugAttr($table, 'data-debug-mode-site', siteConfig);
        setDebugAttr($table, 'data-debug-mode-2', 'table-element');

        // $table.addClass('red');
        
        // Check if all table items are already processed
        const allTableItems = $table.find('th, td, caption, tr');
        const unprocessedItems = allTableItems.filter(function() {
            return !AQ(this).hasClass(processedClass);
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
            const text = AQ(this).text();
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
            
            // If site is ChatGPT and table is RTL, add AsJustRtl class and set direction manually
            if (siteConfig === 'chatgpt' && tableDirection === 'rtl') {
                $table[0].style.setProperty('direction', 'rtl', 'important');
                $table.find('th, td, caption').each(function() {
                    this.style.setProperty('direction', 'rtl', 'important');
                });
            }
            
            // If tbody is RTL, search for mask-image in parent elements (for Grok)
            if (tableDirection === 'rtl' && siteConfig === 'grok') {
                const $tbody = $table.find('tbody');
                if ($tbody.length > 0) {
                    // Search for mask-image in parent elements
                    let $current = $table;
                    while ($current.length > 0 && $current[0] !== document.body && $current[0] !== container[0]) {
                        const maskImage = $current.css('mask-image');
                        if (maskImage && maskImage !== 'none') {
                            console.log('Checking element for mask-image:', $current[0], 'current mask-image:', maskImage);
                        
                 
                            // Add class to mark that mask-image has been applied
                            $current.addClass('rtl-mask-applied');
                            
                            console.log('Applied mask-image to element:', $current[0]);
                        }
                        
                        // Search for .absolute.top-1.right-1 elements in current parent
                        const $absoluteElements = $current.find('.absolute.top-1.right-1');
                        if ($absoluteElements.length > 0) {
                            console.log('Found .absolute.top-1.right-1 elements:', $absoluteElements.length, 'in parent:', $current[0]);
                            // Change right-1 to left for RTL optimization
                            $absoluteElements.each(function() {
                                AQ(this).removeClass('right-1').addClass('left-1');
                                console.log('Changed right-1 to left-1 for element:', this);
                            });
                        }
                        
                        $current = $current.parent();
                    }
                }
            }
            
            // Set text alignment for all cells based on table direction
            if (tableDirection === 'rtl') {
                $table.find('th, td').css('text-align', 'right');
                $table.find('.text-left').removeClass('text-left');
                $table.removeClass('text-left');
            } else {
                $table.find('th, td').css('text-align', 'left');
            }
            
            



            // Apply font class to all table elements
            if (fontClass) {
                $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').addClass(fontClass);
            }
            
            // Mark all table elements as processed
            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').addClass(processedClass);
            
            // console.log(`Table processed with direction: ${tableDirection}, Text: ${allTableText.substring(0, 100)}...`);
        }
    });
    
    // Also process ARIA table roles
    container.find('[role="table"]').each(function() {
        const $table = AQ(this);
        
        // Check if all ARIA table items are already processed
        const allAriaTableItems = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"], [role="row"]');
        const unprocessedAriaItems = allAriaTableItems.filter(function() {
            return !AQ(this).hasClass(processedClass);
        });
        
        // If there are unprocessed items, skip this table for now
        if (unprocessedAriaItems.length === 0) {
            return;
        }
        
        // console.log("processTablesInContainer", $table)


        // If no unprocessed items, continue processing
        
        // Collect all text content from the entire table
        let allTableText = '';
        const tableElements = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]');
        
        tableElements.each(function() {
            const text = AQ(this).text();
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
            
            // If site is ChatGPT and table is RTL, add AsJustRtl class and set direction manually
            if (siteConfig === 'chatgpt' && tableDirection === 'rtl') {
                $table.addClass('AsJustRtl');
                $table[0].style.setProperty('direction', 'rtl', 'important');
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').each(function() {
                    this.style.setProperty('direction', 'rtl', 'important');
                });
            }
            
            // Set text alignment for all cells based on table direction
            if (tableDirection === 'rtl') {
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').css('text-align', 'right');


                $table.find('.text-left').removeClass('text-left');
                $table.removeClass('text-left');

            } else {
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').css('text-align', 'left');
            }
            
            // Apply font class to all table elements
            if (fontClass) {
                $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').addClass(fontClass);
            }
            
            // Mark all table elements as processed
            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').addClass(processedClass);
            
            // console.log(`ARIA Table processed with direction: ${tableDirection}, Text: ${allTableText.substring(0, 100)}...`);
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
    try {
    let {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        isContainer = false,
        skipTags = [],
        removeSkipTags = [],
        setTextAlign = false,
        removeDirAuto = false,
        endTyping = false,
        codeFontClass
    } = options;
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


    // Combine FORMATTING_TAGS with skipTags, then remove specified tags
    const allSkipTags = [...FORMATTING_TAGS, ...skipTags].filter(tag => 
        !removeSkipTags.includes(tag)
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

            console.log('textToUse', textToUse , 'direction', direction);

             $element.attr("dir", direction);
            if (fontClass) {
                $element.addClass(fontClass);
            }
            
            // Set text alignment if setTextAlign is enabled
            if (setTextAlign) {
                if (direction === 'rtl') {
                    $element.css('text-align', 'right');
                } else {
                    $element.css('text-align', 'left');
                }
            }



        
        
            // // let dir = setTextDirectionAndFont(this, { fontClass, setTextAlign });

            AQ(this).attr('data-org-dir', direction);

            // If this is a main container, check all similar header tags and set direction based on majority

            
            // if (!endTyping) {
            //     return;
            // }
            // $element.addClass(processedClass);

            // Check mixedTitleDisplayMode setting
            // Default to 'unified' if not set
            const mixedTitleMode = mixedTitleDisplayModeCache;
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
                            AQ(this).attr('dir', majorityDir);
                
                            if (setTextAlign) {
                                if (majorityDir === 'rtl') {
                                    AQ(this).css('text-align', 'right');
                                } else {
                                    AQ(this).css('text-align', 'left');
                                }
                            }
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
            const hasPreOrCode = $element.find('pre, code, .cm-content, .cm-editor').length > 0;
            
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
            const $innerCode = $element.find('.cm-content, .cm-editor, .md-code-block, pre, code');
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

        if (this.matches && this.matches('.ProseMirror.markdown[contenteditable]')) {
            setDebugAttr($element, 'data-debug-mode', 'locked-markdown-editor-skipped');
            return;
        }
        


        // Special handling for div elements with ds-scroll-area class
        if (tagName === 'div' && $element.hasClass('ds-scroll-area')) {
            setDebugAttr($element, 'data-debug-mode', 'div-ds-scroll-area-processed');
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
            $element.addClass(processedClass);
            return;
        }
        
        // CodeMirror / markdown code editors (ChatGPT cm-content, DeepSeek md-code-block, ...)
        if (tagName === 'div' && isCodeMirrorCodeBlock($element)) {
            processCodeMirrorBlock($element, this, { fontClass, setTextAlign, processedClass, codeFontClass });
            return;
        }

        // Skip elements with classes starting with katex- (KaTeX math elements)
        const hasKatexClass = $element.attr('class') && 
            $element.attr('class').split(' ').some(className => 
                className.trim().startsWith('katex-')
            );
        
        if (hasKatexClass) {
            setDebugAttr($element, 'data-debug-mode', 'katex-element-skipped');
            // Mark all children as processed without processing them
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
                        setDebugAttr($element, 'data-debug-mode', 'all-formatting-tags');
                
                        setTextDirectionAndFont(this, { fontClass, setTextAlign });
                     $element.addClass(processedClass);
                } else if (formattingChildren.length > 0) {
                    // حالت 3: فقط بعضی از فرزندان allSkipTags هستند
                    setDebugAttr($element, 'data-debug-mode', 'mixed-children');
                   
                        setTextDirectionAndFont(this, { fontClass, setTextAlign });
                

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
                                    // text: textForDirection 
                                });
                                
                                // آیتم‌های پردازش نشده رو با setTextDirectionAndFont پردازش کن
                            

                                $li.find('pre, code, .cm-content').each(function() {
                                    const $inner = AQ(this);
                                    if ($inner.hasClass('cm-content')) {
                                        processCodeMirrorBlock($inner, this, { fontClass, setTextAlign, processedClass, codeFontClass });
                                    } else {
                                        processCodeLikeElement($inner, this, { fontClass, setTextAlign, processedClass, codeFontClass });
                                    }
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
                            const prevElementDir = $element.prev().attr('dir');
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

                            AQ(this).attr('data-org-dir',  AQ(this).attr('dir'));

                            // AQ(this).attr('data-dir', listDirection);
                           
                            AQ(this).attr('dir', listDirection);
                            
                            // Set text alignment for list items if setTextAlign is enabled
                            if (setTextAlign) {
                                if (listDirection === 'rtl') {
                                    AQ(this).css('text-align', 'right');
                                } else {
                                    AQ(this).css('text-align', 'left');
                                }
                            }
                           
                        });
                        
                        $element.attr('dir', listDirection);
                        setDebugAttr($element, 'data-debug-reason', debugReason);
                        setDebugAttr($element, 'data-debug-processed', `${processedCount}-${unprocessedCount}`);
                        
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
                            setTextAlign
                        });

                        // برای خود المان هم تصمیم بگیر
                    
                            setTextDirectionAndFont(this, { fontClass, setTextAlign });
                        

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
                 setTextDirectionAndFont($element, { fontClass, setTextAlign });
                
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
 * Locked ProseMirror editors revert DOM edits on children.
 * Style them from a stylesheet keyed by an id on the editor root.
 */
const LOCKED_EDITOR_STYLE_ID = 'ai-rtl-locked-editor-css';
const LOCKED_EDITOR_BLOCK_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol'];
const LOCKED_EDITOR_HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const lockedEditorCssById = new Map();
let lockedEditorSeq = 0;

function isLockedMarkdownEditor(element) {
    const el = element && element.jquery ? element[0] : element;
    return Boolean(el && el.nodeType === Node.ELEMENT_NODE && el.matches && el.matches('.ProseMirror.markdown[contenteditable]'));
}

function getLockedEditorId(element) {
    let editorId = element.getAttribute('data-ai-rtl-editor');
    if (!editorId) {
        lockedEditorSeq += 1;
        editorId = `e${lockedEditorSeq}`;
        element.setAttribute('data-ai-rtl-editor', editorId);
    }
    return editorId;
}

function flushLockedEditorStyles() {
    let styleEl = document.getElementById(LOCKED_EDITOR_STYLE_ID);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = LOCKED_EDITOR_STYLE_ID;
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = Array.from(lockedEditorCssById.values()).join('\n');
}

function lockedEditorDirRule(selector, direction, setTextAlign) {
    const align = direction === 'rtl' ? 'right' : 'left';
    let rule = `${selector}{direction:${direction}!important;unicode-bidi:isolate;`;
    if (setTextAlign) {
        rule += `text-align:${align}!important;`;
    }
    if (selector.includes('>pre:') && direction !== 'rtl') {
        rule += 'font-family:revert!important;';
    }
    return `${rule}}`;
}

function majorityDirection(directions) {
    let rtlCount = 0;
    let ltrCount = 0;
    directions.forEach((direction) => {
        if (direction === 'rtl') {
            rtlCount += 1;
        } else if (direction === 'ltr') {
            ltrCount += 1;
        }
    });
    if (rtlCount === 0 && ltrCount === 0) {
        return 'ltr';
    }
    return rtlCount >= ltrCount ? 'rtl' : 'ltr';
}

/**
 * advanced_section for editors whose child DOM cannot be mutated.
 * Assigns an id on the root, then targets p:nth-of-type, h3:nth-of-type, ...
 */
function processLockedEditorByCss(element, rtlAlgorithm, options = {}) {
    const el = element && element.jquery ? element[0] : element;
    if (!isLockedMarkdownEditor(el) || rtlAlgorithm !== 'advanced_section') {
        return false;
    }

    const fontClass = options.fontClass || 'FontSet';
    const setTextAlign = options.setTextAlign === true;
    const $element = AQ(el);

    $element.addClass(`AsSetAlgorithm ${fontClass}`);
    el.removeAttribute('dir');
    el.removeAttribute('data-direction');
    el.style.removeProperty('text-align');

    const editorId = getLockedEditorId(el);
    let contentSig = '';
    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        const text = (child.textContent || '').trim();
        contentSig += `${child.tagName}:${text.length}:${text.slice(0, 12)}:${text.slice(-12)}|`;
    }
    if (el.getAttribute('data-ai-rtl-sig') === contentSig && lockedEditorCssById.has(editorId)) {
        return true;
    }
    el.setAttribute('data-ai-rtl-sig', contentSig);

    const rootSelector = `[data-ai-rtl-editor="${editorId}"]`;
    const typeCount = {};
    const headingDirs = {};
    const blockRules = [];

    Array.from(el.children).forEach((child) => {
        const tagName = child.tagName.toLowerCase();
        if (!LOCKED_EDITOR_BLOCK_TAGS.includes(tagName)) {
            return;
        }

        typeCount[tagName] = (typeCount[tagName] || 0) + 1;
        const nth = typeCount[tagName];
        const selector = `${rootSelector}>${tagName}:nth-of-type(${nth})`;

        if (tagName === 'pre' && !isApplyAlgorithmToCodeEnabled()) {
            blockRules.push({ selector, direction: 'ltr' });
            return;
        }

        if (tagName === 'ul' || tagName === 'ol') {
            const itemDirs = [];
            Array.from(child.children).forEach((item, itemIndex) => {
                if (item.tagName.toLowerCase() !== 'li') {
                    return;
                }
                const itemDirection = detectDirectionByAlgorithm(item.textContent || '', rtlAlgorithm);
                itemDirs.push(itemDirection);
                blockRules.push({
                    selector: `${selector}>li:nth-of-type(${itemIndex + 1})`,
                    direction: itemDirection
                });
            });
            blockRules.push({ selector, direction: majorityDirection(itemDirs) });
            return;
        }

        const direction = detectDirectionByAlgorithm(child.textContent || '', rtlAlgorithm);
        if (LOCKED_EDITOR_HEADING_TAGS.includes(tagName)) {
            if (!headingDirs[tagName]) {
                headingDirs[tagName] = [];
            }
            headingDirs[tagName].push({ selector, direction });
            return;
        }

        blockRules.push({ selector, direction });
    });

    const applyRules = (headingMode) => {
        const rules = blockRules.slice();
        Object.keys(headingDirs).forEach((tagName) => {
            const headings = headingDirs[tagName];
            const unifiedDirection = majorityDirection(headings.map((item) => item.direction));
            headings.forEach((item) => {
                rules.push({
                    selector: item.selector,
                    direction: headingMode === 'unified' ? unifiedDirection : item.direction
                });
            });
        });

        const css = rules.map((item) => {
            const alignForRule = setTextAlign || item.selector.includes('>pre:');
            return lockedEditorDirRule(item.selector, item.direction, alignForRule);
        }).join('');
        if (lockedEditorCssById.get(editorId) !== css) {
            lockedEditorCssById.set(editorId, css);
            flushLockedEditorStyles();
        }

        $element.attr('data-algorithm-rtl', 'advanced_section');
    };

    applyRules(mixedTitleDisplayModeCache || DEFAULT_MIXED_TITLE_DISPLAY_MODE);
    return true;
}

/**
 * Process text elements based on RTL algorithm
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} options - Additional options (optional)
 */
function processTextElementsByRtlAlgorithm(element, rtlAlgorithm, options = {}) {
    try {
    const $element = AQ(element);

    if (isLockedMarkdownEditor($element[0]) && rtlAlgorithm !== 'advanced_section') {
        const editorId = $element[0].getAttribute('data-ai-rtl-editor');
        if (editorId && lockedEditorCssById.has(editorId)) {
            lockedEditorCssById.delete(editorId);
            flushLockedEditorStyles();
        }
    }
    
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
    function shouldProcessElement($element, processedClass) {
        // Get current text content for length comparison
        const $tempElement = $element.clone();
        $tempElement.find('a').remove();
        $tempElement.find('div.rounded-xl').remove();
        $tempElement.find('pre, code').remove();
        $tempElement.find('.cm-content, .cm-editor, .md-code-block').remove();
        $tempElement.find('button').remove();
        $tempElement.find('[data-copy="false"]').remove();
        const currentText = $tempElement.text().trim();
        
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
            currentTextLength,
            storedLength,
            lengthDifference,
            processedElementsCount
        };
    }
    
    if (rtlAlgorithm === 'advanced_section') {
        const mergedOptions = { ...defaultOptions.advanced_section, ...options };

        if (processLockedEditorByCss($element[0], rtlAlgorithm, mergedOptions)) {
            return;
        }
        
        const { shouldProcess, currentTextLength, storedLength, lengthDifference, processedElementsCount } = shouldProcessElement($element, mergedOptions.processedClass);
        
        if (shouldProcess) {
            // console.log("processTextElementsByRtlAlgorithm advanced_section", currentTextLength, storedLength, lengthDifference);
            processTextElementsAdvanced($element, mergedOptions);

            processTablesInContainer($element, {
                fontClass: mergedOptions.fontClass,
                processedClass: mergedOptions.processedClass,
                siteConfig: mergedOptions.siteConfig
            });

            $element.attr('data-algorithm-rtl', 'advanced_section');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            // Reset skip log flag when processing happens
            $element.removeAttr('data-skip-log-sent');
            flipRtlArrowsInTree($element);
        }
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
                
        //         console.log('processTextElementsByRtlAlgorithm advanced_section: Skipped processing', {
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
        
        const { shouldProcess, currentTextLength } = shouldProcessElement($element, mergedOptions.processedClass);
        
        if (shouldProcess) {
            // console.log("processTextElementsByRtlAlgorithm advanced_full", currentTextLength, storedLength, lengthDifference);
            setTextDirectionAndFont(element, mergedOptions);
            
            // Process tables in container for advanced_full algorithm (only if isContainer is true)
            if (mergedOptions.isContainer) {
                processTablesInContainer($element, {
                    fontClass: mergedOptions.fontClass,
                    processedClass: mergedOptions.processedClass,
                    siteConfig: mergedOptions.siteConfig
                });

                $element.find('code, pre, .cm-content, .md-code-block').each(function() {
                    const $codeElement = AQ(this);
                    if ($codeElement.hasClass('cm-content') || $codeElement.hasClass('md-code-block')) {
                        processCodeMirrorBlock($codeElement, this, {
                            fontClass: mergedOptions.fontClass,
                            codeFontClass: mergedOptions.codeFontClass,
                            setTextAlign: mergedOptions.setTextAlign,
                            processedClass: mergedOptions.processedClass
                        });
                    } else {
                        processCodeLikeElement($codeElement, this, {
                            fontClass: mergedOptions.fontClass,
                            codeFontClass: mergedOptions.codeFontClass,
                            setTextAlign: mergedOptions.setTextAlign,
                            processedClass: mergedOptions.processedClass
                        });
                    }
                });
            }
            
            $element.attr('data-algorithm-rtl', 'advanced_full');
            // Store the new text length
            $element.attr('data-text-length', currentTextLength.toString());
            flipRtlArrowsInTree($element);
        }

    } else if (rtlAlgorithm === 'first_word') {
        $element.attr("dir", "auto");
        
        const fontClass = options.fontClass || defaultOptions.first_word.fontClass;
        if (!$element.hasClass(fontClass)) {
            $element.addClass(fontClass);
        }
        
        // Process tables in container for first_word algorithm (only if isContainer is true)
        if (options.isContainer) {
            const { shouldProcess, currentTextLength } = shouldProcessElement($element, options.processedClass);
            
            if (shouldProcess) {
                // console.log("processTextElementsByRtlAlgorithm first_word tables", currentTextLength, storedLength, lengthDifference);
                processTablesInContainer($element, {
                    fontClass,
                    processedClass: options.processedClass,
                    siteConfig: options.siteConfig
                });
                // Store the new text length
                $element.attr('data-text-length', currentTextLength.toString());
            }
        }
        
        $element.attr('data-algorithm-rtl', 'first_word');
        flipRtlArrowsInTree($element);
    }
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
function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    if (rtlAlgorithm === 'first_word') {
        return analyzeTextDirectionFirstWord(text);
    } else {
        // For 'advanced_section' and 'advanced_full', use detectTextDirection
        return detectTextDirection(text);
    }
}

/**
 * Set text direction and font based on RTL algorithm
 * @param {jQuery|HTMLElement} element - Element to process
 * @param {string} rtlAlgorithm - Algorithm type: 'advanced_section', 'advanced_full', or 'first_word'
 * @param {Object} options - Additional options (optional)
 * @param {string} options.rtlClass - Class to add when direction is RTL (optional, defaults to null)
 */
function setTextDirectionAndFontByRtlAlgorithm(element, rtlAlgorithm, options = {}) {
    const $element = AQ(element);
    
    // Default options for each algorithm
    const defaultOptions = {
        fontClass: 'FontSet'
    };
    
    const processedClass = options.processedClass || false;
    const rtlClass = options.rtlClass || false;

    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        // Check processedClass only if it's not false
        if (!processedClass || !$element.hasClass(processedClass)) {
            const mergedOptions = { ...defaultOptions, ...options };
            const direction = setTextDirectionAndFont(element, mergedOptions);
            
            // Add processedClass only if it's not false
            if (processedClass) {
                $element.addClass(processedClass);
            }
            
            // Add RTL-specific class if direction is RTL
            if (rtlClass && direction === 'rtl') {
                $element.addClass(rtlClass);
            }

            if (direction === 'rtl') {
                flipRtlArrowsInTree($element);
            }
        }

    } else if (rtlAlgorithm === 'first_word') {
        // Check processedClass only if it's not false
        if (!processedClass || !$element.hasClass(processedClass)) {
            $element.attr("dir", "auto");
            const fontClass = options.fontClass || defaultOptions.fontClass;
            $element.addClass(fontClass);
            
            // Add processedClass only if it's not false
            if (processedClass) {
                $element.addClass(processedClass);
            }
            
            // Get text content once for both textAlign and rtlClass operations
            if (options.setTextAlign || rtlClass) {
                let text = $element.text();
                if (!text || !text.trim()) {
                    text = $element.val();
                    if (text) {
                        text = text.trim();
                    }
                }
                
                if (text && text.trim()) {
                    const direction = analyzeTextDirectionFirstWord(text);
                    
                    // Set text alignment if setTextAlign is enabled
                    if (options.setTextAlign) {
                        if (direction === 'rtl') {
                            $element.css('text-align', 'right');
                        } else {
                            $element.css('text-align', 'left');
                        }
                    }
                    
                    // Add RTL-specific class if direction is RTL
                    if (rtlClass && direction === 'rtl') {
                        $element.addClass(rtlClass);
                    }
                }
            }

            flipRtlArrowsInTree($element);
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
        processTextElementsByRtlAlgorithm,
        setTextDirectionAndFontByRtlAlgorithm,
        detectDirectionByAlgorithm,
        setMixedTitleDisplayMode,
        setApplyAlgorithmToCode,
        setFlipRtlArrows,
        processCodeMirrorBlocks,
        isLockedMarkdownEditor,
        processLockedEditorByCss
    };

