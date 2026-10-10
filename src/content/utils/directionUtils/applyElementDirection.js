/**
 * Set dir/font on a single node, including paragraphs split by <br>.
 * Services call setTextDirectionAndFont / setTextDirectionAndFontOneTime
 * via directionUtils/index. Also used by applyRtlToElement and advanced walk.
 */

import { detectTextDirection } from '../analyzeDirection.js';
import { isRtlEngineActive } from '../originalState.js';
import { flipRtlArrowsInTree } from './arrows.js';
import {
    CUSTOM_CODE_BLOCK_SELECTOR,
    getElementClassName,
    isDebugMode,
    isInlineCodeElement,
    KATEX_SELECTOR,
    unwrapElement
} from './shared.js';
import { containsStructuredMarkup, skipStructuredMedia } from './structuredMedia.js';
import {
    applyDirectionMarker,
    applyTextAlignByDirection,
    applyUnicodeBidiByDirection,
    isTextAlignEnabled,
    isTextAlignImportant,
    parseUnicodeBidiOption,
    textAlignClassFor,
    usesDirectionClasses
} from './textStyles.js';

const loggedIgnoredEls = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

/**
 * True when a paragraph is only line-wrapped with span/bdi (+ br), e.g. ChatGPT steps:
 * <p><span>…</span><br><span>…</span><bdi>۳</bdi></p>
 * In that case set dir on the <p> only; do not rewrite / dir-wrap children.
 */
export function isInlineSpanBdiBreakParagraph(element) {
    const el = unwrapElement(element);
    if (!el || !el.children || !el.children.length) {
        return false;
    }
    let hasBr = false;
    let hasInline = false;
    for (let i = 0; i < el.children.length; i++) {
        const tag = el.children[i].tagName && el.children[i].tagName.toLowerCase();
        if (tag === 'br') {
            hasBr = true;
            continue;
        }
        if (tag === 'span' || tag === 'bdi') {
            hasInline = true;
            continue;
        }
        return false;
    }
    return hasBr && hasInline;
}

export function getIgnoreSelector(options = {}) {
    const value = options.ignoreSelector;
    return typeof value === 'string' && value.length ? value : null;
}

function queryIgnoredElements(root, selector, includeRoot = true) {
    if (!root || root.nodeType !== 1 || !selector) {
        return [];
    }
    try {
        if (!root.firstElementChild) {
            return includeRoot && root.matches(selector) ? [root] : [];
        }
        const found = root.querySelectorAll(selector);
        if (!includeRoot || !root.matches(selector)) {
            return found;
        }
        const matches = [root];
        for (let i = 0; i < found.length; i++) {
            matches.push(found[i]);
        }
        return matches;
    } catch {
        return [];
    }
}

function logIgnoredIfSensed(el, selector) {
    if (!isDebugMode() || !el || !el.isConnected) {
        return;
    }
    if (loggedIgnoredEls && loggedIgnoredEls.has(el)) {
        return;
    }
    loggedIgnoredEls?.add(el);
    console.log('ignoreSelector sensed', {
        element: el,
        selector,
        className: getElementClassName(el)
    });
}

function stripNonAnalyzableContent($tempElement, options = {}) {
    $tempElement.find('script, style, svg, math, canvas, textarea, input').remove();
    $tempElement.find('div.rounded-xl').remove();
    $tempElement.find('pre').remove();
    $tempElement.find('code').each(function() {
        if (!isInlineCodeElement(this)) {
            this.remove();
        }
    });
    $tempElement.find('.cm-content, .cm-editor, .md-code-block').remove();
    $tempElement.find(CUSTOM_CODE_BLOCK_SELECTOR).remove();
    $tempElement.find(KATEX_SELECTOR).remove();
    $tempElement.find('[data-copy="false"]').remove();
    const ignoreSelector = getIgnoreSelector(options);
    const root = $tempElement && $tempElement[0];
    if (ignoreSelector && root) {
        const ignored = queryIgnoredElements(root, ignoreSelector, false);
        for (let i = ignored.length - 1; i >= 0; i--) {
            ignored[i].remove();
        }
    }
}

export function getAnalyzableText($element, options = {}) {
    const root = unwrapElement($element);

    if (options.debug) {
        console.log('getAnalyzableText', { $element, root });
    }

    if (!root) {
        return '';
    }
    if (root.nodeType === 3) {
        return (root.nodeValue || '').trim();
    }

    const $tempElement = AQ(root).clone();
    stripNonAnalyzableContent($tempElement, options);
    return $tempElement.text().trim();
}

export function isolateIgnoredElements($element, selector) {
    const root = unwrapElement($element);
    const ignored = queryIgnoredElements(root, selector, true);
    for (let i = 0; i < ignored.length; i++) {
        const el = ignored[i];
        logIgnoredIfSensed(el, selector);
        if (!el.hasAttribute('dir')) {
            el.setAttribute('dir', 'auto');
        }
    }
}

export function setTextDirectionAndFontOneTime(element, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const {
        processedClass = 'AsSet',
        fontClass = 'FontSet',
        text: providedText = null,
        setTextAlign = false,
        setUnicodeBidi = false
    } = options;

    const $element = AQ(element);

    if ($element.hasClass(processedClass)) {
        return;
    }

    $element.addClass(processedClass);

    setTextDirectionAndFont(element, {
        fontClass,
        text: providedText,
        setTextAlign,
        setUnicodeBidi
    });
}

export function setTextDirectionAndFont(element, options = {}) {
    if (!isRtlEngineActive()) {
        return 'auto';
    }
    const {
        fontClass = 'FontSet',
        text: providedText = null,
        setTextAlign = false,
        setUnicodeBidi = false,
        applyFontIfRtl = false,
        debug = false
    } = options;
    const ignoreSelector = getIgnoreSelector(options);

    let textToUse;
    if (providedText) {
        textToUse = providedText;
    } else {
        textToUse = getAnalyzableText(AQ(element), { ignoreSelector , debug });

        if(debug) {
            console.log('sss', {textToUse , element: AQ(element)});

        }
        if (!textToUse || !textToUse.trim()) {
            textToUse = AQ(element).val();
            if (textToUse) {
                textToUse = textToUse.trim();
            }
        }
    }



    if (!textToUse || !textToUse.trim()) return 'auto';

    const direction = detectTextDirection(textToUse);

    const finalDirection = direction || 'auto';

    if (isDebugMode() && ignoreSelector) {
        console.log('ignoreSelector analyzed text', {
            element: unwrapElement(element),
            selector: ignoreSelector,
            text: textToUse,
            direction: finalDirection
        });
    }

        AQ(element).attr('data-ai-rtl-direction', finalDirection)
        const legacyDirection = AQ(element).attr('data-direction');
        if (legacyDirection === 'rtl' || legacyDirection === 'ltr') {
            AQ(element).removeAttr('data-direction');
        }

    applyDirectionMarker(AQ(element), finalDirection, options);
    if (fontClass) {
        if (!applyFontIfRtl || finalDirection === 'rtl') {
            AQ(element).addClass(fontClass);
        } else {
            AQ(element).removeClass(fontClass);
        }
    }

    if (finalDirection !== 'auto') {
        applyTextAlignByDirection(element, finalDirection, setTextAlign);
        applyUnicodeBidiByDirection(element, finalDirection, setUnicodeBidi);
    }

    if (finalDirection === 'rtl') {
        flipRtlArrowsInTree(element);
    }

    return finalDirection;
}

export function processParagraphWithBreaks(element, fontClass = 'FontSet' , setTextAlign, setUnicodeBidi = false, directionClassOptions = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const $element = AQ(element);
    const el = unwrapElement($element);

    if ($element.data('rtl-processed')) {
        return;
    }

    if (containsStructuredMarkup(el)) {
        setTextDirectionAndFont(element, { fontClass, setTextAlign, setUnicodeBidi, ...directionClassOptions });
        skipStructuredMedia($element);
        $element.data('rtl-processed', true);
        return;
    }

    // ChatGPT-style lines: <p><span>…</span><br><span>…</span><bdi>…</bdi></p>
    // Keep children intact; set direction only on the paragraph.
    if (isInlineSpanBdiBreakParagraph(el)) {
        setTextDirectionAndFont(element, { fontClass, setTextAlign, setUnicodeBidi, ...directionClassOptions });
        $element.data('rtl-processed', true);
        return;
    }

    const htmlContent = $element.html();
    const hasNestedElements = Boolean(el && el.children && el.children.length > 0);
    const hasBrTags = Boolean(htmlContent && /<br\b/i.test(htmlContent));
    const hasTextNodeLineBreaks = Boolean(htmlContent && !hasNestedElements && /[\n\r]/.test(htmlContent));

    if (hasBrTags || hasTextNodeLineBreaks) {
        let parts = hasBrTags ? htmlContent.split(/<br[^>]*>/i) : htmlContent.split(/[\n\r]/);



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

            const uniqueDirections = [...new Set(directions)];

            if (uniqueDirections.length > 1) {
                const wrapperTag = el && el.tagName && el.tagName.toLowerCase() === 'p' ? 'span' : 'div';
                let newHtml = '';
                parts.forEach((part, index) => {
                    if (part.trim()) {
                        const tempDiv = AQ('<div>').html(part);
                        const cleanText = tempDiv.text().trim();

                        if (cleanText) {
                            const direction = detectTextDirection(cleanText);
                            const dirClasses = [fontClass];
                            if (direction === 'rtl' && directionClassOptions.rtlClass) {
                                dirClasses.push(directionClassOptions.rtlClass);
                            } else if (direction === 'ltr' && directionClassOptions.ltrClass) {
                                dirClasses.push(directionClassOptions.ltrClass);
                            }
                            const alignClass = textAlignClassFor(setTextAlign, direction);
                            if (alignClass) {
                                dirClasses.push(alignClass);
                            }
                            const divClass = dirClasses.filter(Boolean).length ? ` class="${dirClasses.filter(Boolean).join(' ')}"` : '';
                            const dirAttr = usesDirectionClasses(directionClassOptions) ? '' : ` dir="${direction}"`;
                            const bidiParsed = parseUnicodeBidiOption(setUnicodeBidi);
                            const bidiStyle = bidiParsed.enabled && direction === 'rtl'
                                ? `unicode-bidi:${bidiParsed.value}${bidiParsed.important ? ' !important' : ''}`
                                : '';
                            const align = isTextAlignEnabled(setTextAlign) && setTextAlign !== 'class'
                                ? `text-align:${direction === 'rtl' ? 'right' : 'left'}${isTextAlignImportant(setTextAlign) ? ' !important' : ''}`
                                : '';
                            const styleAttr = [wrapperTag === 'span' ? 'display:block' : '', bidiStyle, align].filter(Boolean).join(';');
                            const wrapperStyle = styleAttr ? ` style="${styleAttr}"` : '';
                            newHtml += `<${wrapperTag}${divClass}${dirAttr} data-rtl-processed="true"${wrapperStyle}>${part}</${wrapperTag}>`;
                        }
                    }
                });

                $element.html(newHtml);
                $element.addClass(fontClass);
                $element.data('rtl-processed', true);
            } else {
                $element.attr('data-ai-rtl-direction', directions[0]);
                applyDirectionMarker($element, directions[0], directionClassOptions);
                $element.addClass(fontClass);
                applyTextAlignByDirection($element, directions[0], setTextAlign);
                applyUnicodeBidiByDirection($element, directions[0], setUnicodeBidi);
                $element.data('rtl-processed', true);
            }
        } else {
            const mainText = $element.text();
            if (mainText && mainText.trim()) {
                setTextDirectionAndFont(element, { fontClass, setTextAlign, setUnicodeBidi, ...directionClassOptions });
                $element.data('rtl-processed', true);
            }
        }
    } else {
        const mainText = $element.text();
        if (mainText && mainText.trim()) {
            setTextDirectionAndFont(element, { fontClass, text: mainText, setTextAlign, setUnicodeBidi, ...directionClassOptions });
            $element.data('rtl-processed', true);
        }
    }
}
