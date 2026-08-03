/**
 * Text direction detection utilities
 * Single source of truth for all text direction decisions
 */

/**
 * Code detection algorithm
 * Detects if text is programming code or not
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text is programming code
 */
function isCode(text) {
    if (!text || typeof text !== 'string') return false;
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) return false;
    
    // Common programming keywords and patterns
    const codePatterns = {
        // Keywords
        keywords: /\b(function|class|import|export|const|let|var|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|require|from|as|default|public|private|protected|static|abstract|final|synchronized|volatile|transient|native|strictfp|package|import|public|private|protected|static|void|int|long|short|byte|char|boolean|float|double|string|array|list|map|set|object|null|undefined|true|false|and|or|not|in|is|as|with|lambda|def|lambda|yield|async|await|promise|resolve|reject|then|catch|finally|generator|iterator|decorator|annotation|override|virtual|abstract|sealed|readonly|mutable|immutable|final|static|volatile|transient|synchronized|native|strictfp|package|import|public|private|protected|static|void|int|long|short|byte|char|boolean|float|double|string|array|list|map|set|object|null|undefined|true|false|and|or|not|in|is|as|with|lambda|def|lambda|yield|async|await|promise|resolve|reject|then|catch|finally|generator|iterator|decorator|annotation|override|virtual|abstract|sealed|readonly|mutable|immutable)\b/gi,
        
        // Operators and symbols
        operators: /[+\-*/%=<>!&|^~?:;.,()[\]{}]/g,
        
        // String patterns
        strings: /["'`].*?["'`]/g,
        
        // Comments
        comments: /(\/\/.*|\/\*[\s\S]*?\*\/|#.*|<!--[\s\S]*?-->)/g,
        
        // Numbers and hex
        numbers: /\b\d+(\.\d+)?([eE][+-]?\d+)?\b|\b0x[0-9a-fA-F]+\b|\b0b[01]+\b/g,
        
        // Function calls
        functionCalls: /\w+\s*\(/g,
        
        // Variable assignments
        assignments: /\w+\s*[=+\-*/%]=?\s*/g,
        
        // Arrow functions
        arrowFunctions: /=>/g,
        
        // Template literals
        templateLiterals: /`[^`]*`/g,
        
        // Regular expressions
        regex: /\/[^\/\n]+\/[gimuy]*/g,
        
        // HTML tags
        htmlTags: /<\/?[a-zA-Z][^>]*>/g,
        
        // CSS selectors
        cssSelectors: /[.#][\w-]+\s*\{/g,
        
        // SQL keywords
        sqlKeywords: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|UNION|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|IF|EXISTS|IN|BETWEEN|LIKE|IS|NULL|NOT|AND|OR|AS|ASC|DESC|LIMIT|OFFSET|TOP|FETCH|NEXT|ROWS|ONLY|WITH|RECURSIVE|WINDOW|PARTITION|OVER|ROW_NUMBER|RANK|DENSE_RANK|LEAD|LAG|FIRST_VALUE|LAST_VALUE|NTILE|PERCENT_RANK|CUME_DIST|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|PERCENT_RANK|CUME_DIST)\b/gi,
        
        // File extensions
        fileExtensions: /\.(js|ts|jsx|tsx|py|java|cpp|c|h|hpp|cs|php|rb|go|rs|swift|kt|scala|clj|hs|ml|fs|vb|dart|r|m|mm|pl|sh|bash|zsh|fish|ps1|bat|cmd|sql|html|css|scss|sass|less|xml|json|yaml|yml|toml|ini|cfg|conf|log|md|txt|rtf|doc|docx|pdf|ppt|pptx|xls|xlsx|csv|tsv|xml|html|htm|php|asp|jsp|aspx|erb|haml|slim|jade|pug|ejs|hbs|handlebars|mustache|twig|smarty|liquid|jinja2|django|flask|fastapi|express|koa|hapi|sails|meteor|next|nuxt|gatsby|vue|react|angular|svelte|ember|backbone|knockout|mootools|prototype|jquery|lodash|underscore|moment|dayjs|date-fns|axios|fetch|request|superagent|got|node-fetch|ws|socket\.io|redis|mongodb|mongoose|sequelize|typeorm|prisma|knex|bookshelf|waterline|sails|loopback|strapi|ghost|wordpress|drupal|joomla|magento|shopify|woocommerce|prestashop|opencart|oscommerce|zencart|bigcommerce|squarespace|wix|weebly|webflow|framer|figma|sketch|adobe|photoshop|illustrator|indesign|after-effects|premiere|final-cut|davinci|resolve|blender|maya|3ds-max|cinema-4d|houdini|nuke|fusion|hitfilm|lightworks|kdenlive|openshot|shotcut|vlc|ffmpeg|imagemagick|gimp|inkscape|krita|myPaint|paint\.net|paint-3d|canva|picmonkey|fotor|beFunky|pixlr|photopea|remove\.bg|tinypng|squoosh|imageoptim|jpegmini|pngquant|optipng|advpng|pngcrush|pngout|pngnq|pngnq-s9|pngnq-s8|pngnq-s7|pngnq-s6|pngnq-s5|pngnq-s4|pngnq-s3|pngnq-s2|pngnq-s1|pngnq-s0|pngnq-s9|pngnq-s8|pngnq-s7|pngnq-s6|pngnq-s5|pngnq-s4|pngnq-s3|pngnq-s2|pngnq-s1|pngnq-s0)\b/gi
    };
    
    // Calculate scores for different patterns
    let score = 0;
    let totalLength = trimmedText.length;
    
    // Check for keywords (high weight)
    const keywordMatches = trimmedText.match(codePatterns.keywords);
    if (keywordMatches) {
        score += keywordMatches.length * 3;
    }
    
    // Check for operators (medium weight)
    const operatorMatches = trimmedText.match(codePatterns.operators);
    if (operatorMatches) {
        score += operatorMatches.length * 2;
    }
    
    // Check for strings (medium weight)
    const stringMatches = trimmedText.match(codePatterns.strings);
    if (stringMatches) {
        score += stringMatches.length * 2;
    }
    
    // Check for comments (high weight)
    const commentMatches = trimmedText.match(codePatterns.comments);
    if (commentMatches) {
        score += commentMatches.length * 3;
    }
    
    // Check for numbers (low weight)
    const numberMatches = trimmedText.match(codePatterns.numbers);
    if (numberMatches) {
        score += numberMatches.length * 1;
    }
    
    // Check for function calls (high weight)
    const functionCallMatches = trimmedText.match(codePatterns.functionCalls);
    if (functionCallMatches) {
        score += functionCallMatches.length * 3;
    }
    
    // Check for assignments (high weight)
    const assignmentMatches = trimmedText.match(codePatterns.assignments);
    if (assignmentMatches) {
        score += assignmentMatches.length * 3;
    }
    
    // Check for arrow functions (high weight)
    const arrowFunctionMatches = trimmedText.match(codePatterns.arrowFunctions);
    if (arrowFunctionMatches) {
        score += arrowFunctionMatches.length * 3;
    }
    
    // Check for template literals (high weight)
    const templateLiteralMatches = trimmedText.match(codePatterns.templateLiterals);
    if (templateLiteralMatches) {
        score += templateLiteralMatches.length * 3;
    }
    
    // Check for regular expressions (high weight)
    const regexMatches = trimmedText.match(codePatterns.regex);
    if (regexMatches) {
        score += regexMatches.length * 3;
    }
    
    // Check for HTML tags (high weight)
    const htmlTagMatches = trimmedText.match(codePatterns.htmlTags);
    if (htmlTagMatches) {
        score += htmlTagMatches.length * 3;
    }
    
    // Check for CSS selectors (high weight)
    const cssSelectorMatches = trimmedText.match(codePatterns.cssSelectors);
    if (cssSelectorMatches) {
        score += cssSelectorMatches.length * 3;
    }
    
    // Check for SQL keywords (high weight)
    const sqlKeywordMatches = trimmedText.match(codePatterns.sqlKeywords);
    if (sqlKeywordMatches) {
        score += sqlKeywordMatches.length * 3;
    }
    
    // Check for file extensions (high weight)
    const fileExtensionMatches = trimmedText.match(codePatterns.fileExtensions);
    if (fileExtensionMatches) {
        score += fileExtensionMatches.length * 3;
    }
    
    // Additional heuristics
    const lines = trimmedText.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Check for indentation patterns (common in code)
    let indentedLines = 0;
    for (const line of nonEmptyLines) {
        if (line.match(/^\s+/)) {
            indentedLines++;
        }
    }
    
    // If more than 50% of lines are indented, likely code
    if (nonEmptyLines.length > 0 && indentedLines / nonEmptyLines.length > 0.5) {
        score += 5;
    }
    
    // Check for common code structures
    const hasBrackets = /[{}]/.test(trimmedText);
    const hasParentheses = /[()]/.test(trimmedText);
    const hasSemicolons = /;/.test(trimmedText);
    const hasColons = /:/.test(trimmedText);
    
    if (hasBrackets) score += 2;
    if (hasParentheses) score += 1;
    if (hasSemicolons) score += 2;
    if (hasColons) score += 1;
    
    // Check for common code patterns
    const hasFunctionDeclaration = /function\s+\w+\s*\(/.test(trimmedText);
    const hasClassDeclaration = /class\s+\w+/.test(trimmedText);
    const hasImportStatement = /import\s+/.test(trimmedText);
    const hasExportStatement = /export\s+/.test(trimmedText);
    const hasVariableDeclaration = /(const|let|var)\s+\w+/.test(trimmedText);
    const hasIfStatement = /if\s*\(/.test(trimmedText);
    const hasForLoop = /for\s*\(/.test(trimmedText);
    const hasWhileLoop = /while\s*\(/.test(trimmedText);
    
    if (hasFunctionDeclaration) score += 5;
    if (hasClassDeclaration) score += 5;
    if (hasImportStatement) score += 5;
    if (hasExportStatement) score += 5;
    if (hasVariableDeclaration) score += 3;
    if (hasIfStatement) score += 3;
    if (hasForLoop) score += 3;
    if (hasWhileLoop) score += 3;
    
    // Calculate final score as percentage
    const maxPossibleScore = totalLength * 0.1; // Maximum possible score based on text length
    const scorePercentage = (score / Math.max(maxPossibleScore, 1)) * 100;
    
    // Threshold for code detection (adjustable)
    const threshold = 15; // 15% threshold
    
    return scorePercentage >= threshold;
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
    if (probe === -1) {
        // May still include only digits/symbols/latin — ltr
        // But markdown-only latin is ltr anyway.
        // Exception: texts with only neutrals/latin → ltr (matches previous behavior)
        return 'ltr';
    }

    const { words, rtlFlags } = tokenizeForDirection(text);
    const wordCount = words.length;
    if (wordCount === 0) return 'ltr';

    if (wordCount >= 2) {
        const firstWordIsRTL = rtlFlags[0];
        const lastWordIsRTL = rtlFlags[wordCount - 1];

        if (firstWordIsRTL && lastWordIsRTL) {
            return 'rtl';
        }

        if (!firstWordIsRTL && !lastWordIsRTL && wordCount <= 3) {
            let hasAnyRTLWord = false;
            for (let i = 0; i < wordCount; i++) {
                if (rtlFlags[i]) {
                    hasAnyRTLWord = true;
                    break;
                }
            }
            if (!hasAnyRTLWord) return 'ltr';
        }
    }

    if (wordCount < 5) {
        let rtlWordsCount = 0;
        let ltrWordsCount = 0;
        for (let i = 0; i < wordCount; i++) {
            if (rtlFlags[i]) rtlWordsCount++;
            else ltrWordsCount++;
        }
        if (rtlWordsCount === 0) return 'ltr';
        if (rtlFlags[0]) return 'rtl';
        if (ltrWordsCount === 0) return 'rtl';
        return rtlWordsCount >= ltrWordsCount ? 'rtl' : 'ltr';
    }

    if (wordCount <= 10) {
        const checkWordsCount = (wordCount + 1) >> 1; // ceil(n/2)
        let rtlWordsCount = 0;
        for (let i = 0; i < checkWordsCount; i++) {
            if (rtlFlags[i]) rtlWordsCount++;
        }

        if (rtlWordsCount > checkWordsCount / 2) return 'rtl';
        if (rtlWordsCount < checkWordsCount / 2) return 'ltr';

        let totalRTLWords = 0;
        for (let i = 0; i < wordCount; i++) {
            if (rtlFlags[i]) totalRTLWords++;
        }
        return totalRTLWords > wordCount / 2 ? 'rtl' : 'ltr';
    }

    let totalRTLWords = 0;
    for (let i = 0; i < wordCount; i++) {
        if (rtlFlags[i]) totalRTLWords++;
    }

    const firstWordIsRTL = rtlFlags[0];
    const lastWordIsRTL = rtlFlags[wordCount - 1];

    if (firstWordIsRTL && lastWordIsRTL) return 'rtl';
    if (!firstWordIsRTL && !lastWordIsRTL) return 'ltr';

    const ltrWords = wordCount - totalRTLWords;
    const difference = totalRTLWords > ltrWords ? totalRTLWords - ltrWords : ltrWords - totalRTLWords;
    const rtlPercentage = (totalRTLWords / wordCount) * 100;

    if (rtlPercentage >= 70 || rtlPercentage <= 30) {
        return totalRTLWords > wordCount / 2 ? 'rtl' : 'ltr';
    }

    if (difference <= 10) {
        return firstWordIsRTL ? 'rtl' : 'ltr';
    }

    return totalRTLWords > wordCount / 2 ? 'rtl' : 'ltr';
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

