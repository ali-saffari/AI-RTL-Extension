/**
 * Text direction detection utilities
 * Single source of truth for all text direction decisions
 */

const RE_CODE_KEYWORD = /\b(?:function|class|import|export|const|let|var|return|async|await|def|public|private|interface|typedef|package|SELECT|INSERT|UPDATE|DELETE)\b/;
const RE_CODE_SYNTAX = /=>|===|!==|&&|\|\||::|<\/?[a-zA-Z]|[{}\[\];]|\$\{/;
const RE_CODE_COMMENT = /(?:^|\n)\s*(?:\/\/|\/\*|#(?:\s|$)|<!--)/;
const RE_CODE_INDENT = /(?:^|\n)[ \t]{2,}\S/;
const CODE_SAMPLE_MAX = 4000;

/**
 * Fast check for programming code vs natural language inside code-like tags.
 */
function isCode(text) {
    if (!text || typeof text !== 'string') return false;

    const prose = stripMarkdown(text);
    const sample = prose.length > CODE_SAMPLE_MAX ? prose.slice(0, CODE_SAMPLE_MAX) : prose;
    const trimmed = sample.trim();
    if (!trimmed) return false;

    let rtlChars = 0;
    let latinChars = 0;
    for (let i = 0; i < trimmed.length; i++) {
        const code = trimmed.charCodeAt(i);
        if (isRTLCharCode(code)) rtlChars++;
        else if (isLatinLetterCode(code)) latinChars++;
    }

    const hasSyntax = RE_CODE_SYNTAX.test(trimmed);
    if (rtlChars > latinChars * 2 && !hasSyntax) return false;

    let hits = 0;
    if (RE_CODE_KEYWORD.test(trimmed)) hits += 2;
    if (hasSyntax) hits += 2;
    if (RE_CODE_COMMENT.test(trimmed)) hits += 1;
    if (RE_CODE_INDENT.test(trimmed)) hits += 1;

    return hits >= 2;
}


const NEUTRAL_TOKEN_PATTERN = /^[\d\s\-–—_*•·‣▪◦○●□■◆◇☆★+#@+=~`|\\\/.,!?:;…]+$/;
const LIST_MARKER_PATTERN = /^[\d\u06F0-\u06F9]+[.\-)]$/;
const SHORT_TECH_ACRONYMS = new Set([
    'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'sql', 'xml', 'json', 'yaml', 'yml',
    'npm', 'git', 'api', 'ui', 'ux', 'db', 'orm', 'cli', 'ide', 'cpu', 'gpu',
    'ram', 'http', 'https', 'url', 'cdn', 'jwt', 'dom', 'node', 'vue', 'php',
    'ios', 'sdk', 'ssh', 'tcp', 'udp', 'ip', 'dns', 'ssl', 'tls', 'aws', 'gcp'
]);

// Char-code lookup for brackets/quotes (BMP). 1 = remove.
const BRACKET_CODE_LOOKUP = new Uint8Array(0x3000);
[
    0x28, 0x29, 0x5B, 0x5D, 0x7B, 0x7D, 0x3C, 0x3E, // ()[]{}<>
    0x22, 0x27, // " '
    0xAB, 0xBB, // « »
    0x201C, 0x201D, 0x201E, 0x201F, // “ ” „ ‟
    0x2032, 0x2033, // ′ ″
    0x2018, 0x2019, // ‘ ’
    0x2039, 0x203A // ‹ ›
].forEach((code) => {
    if (code < BRACKET_CODE_LOOKUP.length) BRACKET_CODE_LOOKUP[code] = 1;
});

// Precompiled technical / markdown patterns
const RE_URL = /^(https?:\/\/|www\.)/i;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PATH_SAFE = /^[\w./\\:@%+=~-]+$/;
const RE_FILE_EXT = /\.([a-zA-Z0-9]{1,5})$/;
const RE_FILE_SAFE = /^[\w.-]+$/;
const RE_VERSION = /^v?\d+(\.\d+){1,3}(-[\w.]+)?$/i;
const RE_FENCE = /```[\s\S]*?```/g;
const RE_INLINE_CODE = /`[^`]+`/g;
const RE_MD_IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const RE_MD_LINK = /\[([^\]]+)\]\([^)]*\)/g;
const RE_MD_HEADING = /^#{1,6}\s+/gm;
const RE_MD_BOLD = /(\*\*|__)(.*?)\1/g;
const RE_MD_ITALIC = /(\*|_)([^*\n]+?)\1/g;
const RE_WHITESPACE = /\s+/;

function isRTLCharCode(code) {
    if (code >= 0x0600 && code <= 0x06FF) return true;
    if (code >= 0x0590 && code <= 0x05FF) return true;
    if (code >= 0x0750 && code <= 0x077F) return true;
    if (code >= 0x08A0 && code <= 0x08FF) return true;
    if (code >= 0xFB50 && code <= 0xFDFF) return true;
    if (code >= 0xFE70 && code <= 0xFEFF) return true;
    return false;
}

function isLatinLetterCode(code) {
    return (code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A);
}

function wordHasRTL(word) {
    for (let i = 0; i < word.length; i++) {
        if (isRTLCharCode(word.charCodeAt(i))) return true;
    }
    return false;
}

function isEmojiCodePoint(codePoint) {
    return (
        (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
        (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
        (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
        (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||
        (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF) ||
        (codePoint >= 0x2600 && codePoint <= 0x26FF) ||
        (codePoint >= 0x2700 && codePoint <= 0x27BF) ||
        (codePoint >= 0x1F3FB && codePoint <= 0x1F3FF) ||
        (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF) ||
        codePoint === 0x200D ||
        (codePoint >= 0xFE00 && codePoint <= 0xFE0F) ||
        codePoint === 0x20E3 ||
        (codePoint >= 0xE0020 && codePoint <= 0xE007F)
    );
}

function hasMarkdownMarkers(input) {
    return (
        input.indexOf('`') !== -1 ||
        input.indexOf('*') !== -1 ||
        input.indexOf('#') !== -1 ||
        input.indexOf('[') !== -1
    );
}

function stripMarkdown(input) {
    if (!input || !hasMarkdownMarkers(input)) return input;
    RE_FENCE.lastIndex = 0;
    RE_INLINE_CODE.lastIndex = 0;
    RE_MD_IMAGE.lastIndex = 0;
    RE_MD_LINK.lastIndex = 0;
    RE_MD_HEADING.lastIndex = 0;
    RE_MD_BOLD.lastIndex = 0;
    RE_MD_ITALIC.lastIndex = 0;
    return input
        .replace(RE_FENCE, ' ')
        .replace(RE_INLINE_CODE, ' ')
        .replace(RE_MD_IMAGE, ' ')
        .replace(RE_MD_LINK, '$1')
        .replace(RE_MD_HEADING, '')
        .replace(RE_MD_BOLD, '$2')
        .replace(RE_MD_ITALIC, '$2');
}

/**
 * Fast script probe:
 *  1 = only RTL letters (safe rtl)
 * -1 = no RTL letters (safe ltr)
 *  0 = mixed / needs full tokenization
 */
function quickScriptProbe(text) {
    let hasRTL = false;
    let hasLatin = false;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (isRTLCharCode(code)) {
            hasRTL = true;
            if (hasLatin) return 0;
        } else if (isLatinLetterCode(code)) {
            hasLatin = true;
            if (hasRTL) return 0;
        }
    }
    if (hasRTL) return 1;
    return -1;
}

/**
 * Single-pass removal of brackets/quotes and emojis.
 * Skips allocation when nothing needs removing.
 */
function sanitizeBracketsAndEmojis(input) {
    if (!input) return input;

    let needsWork = false;
    for (let i = 0; i < input.length;) {
        const code = input.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            needsWork = true;
            break;
        }
        if (
            (code < BRACKET_CODE_LOOKUP.length && BRACKET_CODE_LOOKUP[code]) ||
            isEmojiCodePoint(code)
        ) {
            needsWork = true;
            break;
        }
        i++;
    }
    if (!needsWork) return input;

    let result = '';
    for (let i = 0; i < input.length;) {
        const codePoint = input.codePointAt(i);
        const charLen = codePoint > 0xFFFF ? 2 : 1;
        if (codePoint < BRACKET_CODE_LOOKUP.length && BRACKET_CODE_LOOKUP[codePoint]) {
            i += charLen;
            continue;
        }
        if (isEmojiCodePoint(codePoint)) {
            i += charLen;
            continue;
        }
        result += charLen === 2 ? input[i] + input[i + 1] : input[i];
        i += charLen;
    }
    return result;
}

function isAllCapsWord(word, len) {
    if (len < 2 || len > 5) return false;
    for (let i = 0; i < len; i++) {
        const c = word.charCodeAt(i);
        if (c < 0x41 || c > 0x5A) return false;
    }
    return true;
}

function isTechnicalNeutral(word) {
    if (!word) return false;

    const len = word.length;

    if (isAllCapsWord(word, len)) return true;

    if (len <= 5 && SHORT_TECH_ACRONYMS.has(word.toLowerCase())) return true;

    const c0 = word.charCodeAt(0);
    if (len > 4 && (c0 === 0x68 || c0 === 0x48 || c0 === 0x77 || c0 === 0x57)) {
        if (RE_URL.test(word)) return true;
    }
    if (word.indexOf('@') !== -1 && RE_EMAIL.test(word)) return true;

    const slash = word.indexOf('/') !== -1 || word.indexOf('\\') !== -1;
    if (slash || ((c0 === 0x2E) && (word.charCodeAt(1) === 0x2F || word.charCodeAt(1) === 0x5C || word.charCodeAt(1) === 0x2E))) {
        if (RE_PATH_SAFE.test(word)) return true;
    }

    if (word.indexOf('.') !== -1) {
        if (RE_FILE_EXT.test(word) && RE_FILE_SAFE.test(word)) return true;
        if (RE_VERSION.test(word)) return true;
    }

    return false;
}

function isLeadingNeutralCharCode(code) {
    // ASCII fast set: - _ * # + = ~ ` | \ / . , ! ? : ;
    if (
        code === 0x2D || code === 0x5F || code === 0x2A || code === 0x23 ||
        code === 0x2B || code === 0x3D || code === 0x7E || code === 0x60 ||
        code === 0x7C || code === 0x5C || code === 0x2F || code === 0x2E ||
        code === 0x2C || code === 0x21 || code === 0x3F || code === 0x3A ||
        code === 0x3B || code === 0x40
    ) return true;
    // common unicode bullets/dashes
    return (
        code === 0x2013 || code === 0x2014 || code === 0x2022 ||
        code === 0x00B7 || code === 0x2023 || code === 0x25AA ||
        code === 0x25E6 || code === 0x25CB || code === 0x25CF ||
        code === 0x25A1 || code === 0x25A0 || code === 0x25C6 ||
        code === 0x25C7 || code === 0x2606 || code === 0x2605 ||
        code === 0x2026
    );
}

function cleanWordToken(word) {
    if (!word) return word;
    let start = 0;
    let end = word.length;
    while (start < end && isLeadingNeutralCharCode(word.charCodeAt(start))) start++;
    while (end > start) {
        const c = word.charCodeAt(end - 1);
        // trailing , : ; ! ? …
        if (c === 0x2C || c === 0x3A || c === 0x3B || c === 0x21 || c === 0x3F || c === 0x2026) {
            end--;
            continue;
        }
        break;
    }
    if (start === 0 && end === word.length) return word;
    if (start >= end) return '';
    return word.slice(start, end);
}

/**
 * Normalize and tokenize text into direction-significant words
 * @returns {{ words: string[], rtlFlags: boolean[] }}
 */
function tokenizeForDirection(text) {
    if (!text || typeof text !== 'string') return { words: [], rtlFlags: [] };

    const normalizedText = sanitizeBracketsAndEmojis(stripMarkdown(text)).trim();
    if (!normalizedText) return { words: [], rtlFlags: [] };

    const rawWords = normalizedText.split(RE_WHITESPACE);
    const words = [];
    const rtlFlags = [];
    for (let i = 0; i < rawWords.length; i++) {
        const cleaned = cleanWordToken(rawWords[i]);
        if (!cleaned) continue;

        const hasRTL = wordHasRTL(cleaned);
        if (hasRTL) {
            words.push(cleaned);
            rtlFlags.push(true);
            continue;
        }

        if (
            NEUTRAL_TOKEN_PATTERN.test(cleaned) ||
            LIST_MARKER_PATTERN.test(cleaned) ||
            isTechnicalNeutral(cleaned)
        ) {
            continue;
        }

        words.push(cleaned);
        rtlFlags.push(false);
    }
    return { words, rtlFlags };
}

// Minimum consecutive RTL words to treat as a real passage (not a short term).
const RTL_PASSAGE_MIN = 4;

/**
 * Single pass over rtlFlags: totals, longest RTL run, trailing LTR closer.
 * @param {boolean[]} rtlFlags
 */
function scanDirectionStats(rtlFlags) {
    const n = rtlFlags.length;
    let totalRTL = 0;
    let longestRtlRun = 0;
    let run = 0;
    let trailingLtrCount = 0;

    for (let i = 0; i < n; i++) {
        if (rtlFlags[i]) {
            totalRTL++;
            run++;
            if (run > longestRtlRun) longestRtlRun = run;
            trailingLtrCount = 0;
        } else {
            run = 0;
            trailingLtrCount++;
        }
    }

    return {
        firstRTL: rtlFlags[0],
        lastRTL: rtlFlags[n - 1],
        totalRTL,
        longestRtlRun,
        trailingLtrCount
    };
}

/**
 * LTR-framed text (starts and ends LTR): RTL only when a real RTL passage
 * is the body and the trailing LTR is just a short closer ("world"),
 * not an English continuation ("for you to read...").
 */
function isRtlPassageInLtrFrame(totalRTL, totalLTR, longestRtlRun, trailingLtrCount) {
    if (longestRtlRun < RTL_PASSAGE_MIN) return false;
    if (longestRtlRun > (trailingLtrCount << 1)) return true;
    return totalRTL > totalLTR;
}

/**
 * MAIN DECISION FUNCTION - Single source of truth
 * @param {string} text
 * @returns {string} - "rtl" or "ltr"
 */
function analyzeTextDirection(text) {
    if (!text || typeof text !== 'string') return 'ltr';

    // Fast path for pure RTL or pure non-RTL texts (no mixed Latin+RTL)
    const probe = quickScriptProbe(text);
    if (probe === 1) return 'rtl';
    if (probe === -1) return 'ltr';

    const { rtlFlags } = tokenizeForDirection(text);
    const wordCount = rtlFlags.length;
    if (wordCount === 0) return 'ltr';

    const { firstRTL, lastRTL, totalRTL, longestRtlRun, trailingLtrCount } =
        scanDirectionStats(rtlFlags);

    if (wordCount >= 2) {
        if (firstRTL && lastRTL) return 'rtl';

        if (!firstRTL && !lastRTL) {
            return isRtlPassageInLtrFrame(
                totalRTL,
                wordCount - totalRTL,
                longestRtlRun,
                trailingLtrCount
            ) ? 'rtl' : 'ltr';
        }
    }

    if (wordCount < 5) {
        if (totalRTL === 0) return 'ltr';
        if (firstRTL) return 'rtl';
        if (totalRTL === wordCount) return 'rtl';
        return totalRTL >= (wordCount - totalRTL) ? 'rtl' : 'ltr';
    }

    if (wordCount <= 10) {
        const checkWordsCount = (wordCount + 1) >> 1; // ceil(n/2)
        let rtlWordsCount = 0;
        for (let i = 0; i < checkWordsCount; i++) {
            if (rtlFlags[i]) rtlWordsCount++;
        }

        if (rtlWordsCount > checkWordsCount / 2) return 'rtl';
        if (rtlWordsCount < checkWordsCount / 2) return 'ltr';
        return totalRTL > wordCount / 2 ? 'rtl' : 'ltr';
    }

    const ltrWords = wordCount - totalRTL;
    const rtlPercentage = (totalRTL / wordCount) * 100;

    if (rtlPercentage >= 70 || rtlPercentage <= 30) {
        return totalRTL > wordCount / 2 ? 'rtl' : 'ltr';
    }

    // English-first mixed text that is still Persian-majority and ends RTL
    if (lastRTL && totalRTL > wordCount / 2) return 'rtl';

    const difference = totalRTL > ltrWords ? totalRTL - ltrWords : ltrWords - totalRTL;
    if (difference <= 10) return firstRTL ? 'rtl' : 'ltr';

    return totalRTL > wordCount / 2 ? 'rtl' : 'ltr';
}


/**
 * Detects text direction (RTL/LTR) based on character analysis
 * Used in: chatgpt.js
 * @param {string} text - Text to analyze
 * @returns {string} - "rtl" if text is RTL, "ltr" if text is LTR
 */
function detectTextDirection(text) {
    return analyzeTextDirection(text);
}

/**
 * Simple RTL detection wrapper
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text is RTL
 */
function isRTL(text) {
    return analyzeTextDirection(text) === "rtl";
}

/**
 * Analyze text direction for first_word algorithm
 * Uses the same tokenization so leading neutrals / tech tokens are skipped
 * @param {string} text - Text to analyze
 * @returns {string} - Detected direction ('rtl' or 'ltr')
 */
function analyzeTextDirectionFirstWord(text) {
    const { words } = tokenizeForDirection(text);
    if (words.length === 0) return 'ltr';

    const firstSignificantWord = words[0];

    for (let i = 0; i < firstSignificantWord.length; i++) {
        const char = firstSignificantWord[i];
        if (isRTLCharacter(char)) return 'rtl';
        if (isLTRCharacter(char)) return 'ltr';
    }

    return analyzeFirstWordDirection(firstSignificantWord);
}

/**
 * Check if a character is RTL
 * @param {string} char - Character to check
 * @returns {boolean} - True if character is RTL
 */
function isRTLCharacter(char) {
    const code = char.charCodeAt(0);
    
    // Arabic
    if (code >= 0x0600 && code <= 0x06FF) return true;
    // Arabic Supplement
    if (code >= 0x0750 && code <= 0x077F) return true;
    // Arabic Extended-A
    if (code >= 0x08A0 && code <= 0x08FF) return true;
    // Arabic Presentation Forms-A
    if (code >= 0xFB50 && code <= 0xFDFF) return true;
    // Arabic Presentation Forms-B
    if (code >= 0xFE70 && code <= 0xFEFF) return true;
    // Hebrew
    if (code >= 0x0590 && code <= 0x05FF) return true;
    // Hebrew Supplement
    if (code >= 0xFB1D && code <= 0xFB4F) return true;
    
    return false;
}

/**
 * Check if a character is LTR
 * @param {string} char - Character to check
 * @returns {boolean} - True if character is LTR
 */
function isLTRCharacter(char) {
    const code = char.charCodeAt(0);
    
    // Basic Latin
    if (code >= 0x0041 && code <= 0x005A) return true; // A-Z
    if (code >= 0x0061 && code <= 0x007A) return true; // a-z
    // Latin-1 Supplement
    if (code >= 0x00C0 && code <= 0x00FF) return true;
    // Latin Extended-A
    if (code >= 0x0100 && code <= 0x017F) return true;
    // Latin Extended-B
    if (code >= 0x0180 && code <= 0x024F) return true;
    
    return false;
}

/**
 * Analyze the direction of the first word
 * @param {string} word - Word to analyze
 * @returns {string} - Detected direction ('rtl' or 'ltr')
 */
function analyzeFirstWordDirection(word) {
    if (!word) return 'ltr';
    
    let rtlCount = 0;
    let ltrCount = 0;
    
    for (const char of word) {
        if (isRTLCharacter(char)) {
            rtlCount++;
        } else if (isLTRCharacter(char)) {
            ltrCount++;
        }
    }
    
    // If more RTL characters, return RTL
    if (rtlCount > ltrCount) return 'rtl';
    
    // If more LTR characters, return LTR
    if (ltrCount > rtlCount) return 'ltr';
    
    // If equal or no significant characters, default to LTR
    return 'ltr';
}

// Export functions for CommonJS
module.exports = {
    analyzeTextDirection,
    detectTextDirection,
    isRTL,
    isCode,
    analyzeTextDirectionFirstWord
};

