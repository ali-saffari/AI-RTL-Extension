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


/**
 * MAIN DECISION FUNCTION - Single source of truth
 * Analyzes sentence and returns direction based on word analysis
 * @param {string} text - Text to analyze
 * @returns {string} - "rtl" or "ltr"
 */
function analyzeTextDirection(text) {
    
    const rtlCharRanges = [
        [0x0590, 0x05FF], // عبری
        [0x0600, 0x06FF], // عربی و فارسی
        [0x0750, 0x077F], // عربی افزوده
        [0x08A0, 0x08FF], // عربی اضافی
        [0xFB50, 0xFDFF], // عربی نمایشی
        [0xFE70, 0xFEFF], // عربی نمایشی
    ];

    function isRTLChar(char) {
        const code = char.charCodeAt(0);
        return rtlCharRanges.some(([start, end]) => code >= start && code <= end);
    }

    // Emoji-aware normalization: remove all emojis before analysis
    function isEmoji(char) {
        const codePoint = char.codePointAt(0);
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

    function removeAllEmojis(input) {
        if (!input) return input;
        let result = '';
        for (let i = 0; i < input.length;) {
            const codePoint = input.codePointAt(i);
            const char = String.fromCodePoint(codePoint);
            const isEmojiComponent = (
                (codePoint >= 0x1F3FB && codePoint <= 0x1F3FF) ||
                (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF) ||
                (codePoint >= 0xFE00 && codePoint <= 0xFE0F) ||
                codePoint === 0x200D ||
                codePoint === 0x20E3 ||
                (codePoint >= 0xE0020 && codePoint <= 0xE007F)
            );
            if (!isEmoji(char) && !isEmojiComponent) {
                result += char;
            }
            i += char.length;
        }
        return result;
    }

    // Remove brackets/parentheses/quotes to avoid direction bias
    function removeBracketsAndQuotes(input) {
        if (!input) return input;
        const charsToRemove = new Set([
            '(', ')', '[', ']', '{', '}', '<', '>',
            '«', '»', '“', '”', '„', '‟', '′', '″',
            '‘', '’', '‹', '›', '"', "'"
        ]);
        let result = '';
        for (let i = 0; i < input.length;) {
            const codePoint = input.codePointAt(i);
            const char = String.fromCodePoint(codePoint);
            if (!charsToRemove.has(char)) {
                result += char;
            }
            i += char.length;
        }
        return result;
    }

    const normalizedText = removeBracketsAndQuotes(removeAllEmojis(text)).trim();
    const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 'ltr';


    // بررسی اولویت‌های خاص برای تشخیص جهت
    
    // اگر شروع و پایان متن با فارسی بود، RTL است
    if (words.length >= 2) {
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        const firstWordIsRTL = [...firstWord].some(isRTLChar);
        const lastWordIsRTL = [...lastWord].some(isRTLChar);
        
        if (firstWordIsRTL && lastWordIsRTL) {
            return 'rtl';
        }
        
        // اگر متن با انگلیسی شروع و با انگلیسی تمام شود
        if (!firstWordIsRTL && !lastWordIsRTL) {
            // برای متن‌های خیلی کوتاه (2-3 کلمه)، همیشه LTR
            if (words.length <= 3) {
                return 'ltr';
            }
        }
    }

    // تابع برای تشخیص کلمات واقعی (غیر از اعداد انگلیسی و علائم)
    function isRealWord(word) {
        // اعداد فارسی (۰-۹)
        const persianNumbers = /^[\u06F0-\u06F9]+$/;
        // کلمات خنثی: فقط اعداد انگلیسی، علائم، یا ترکیبی از آنها
        const neutralPattern = /^[\d\s\-\.\,\!\?\:\;\(\)\[\]\{\}\"\'«»]+$/;
        
        // اگر فقط اعداد فارسی است، آن را کلمه واقعی در نظر بگیر
        if (persianNumbers.test(word)) {
            return true;
        }
        
        return !neutralPattern.test(word) && word.length > 0;
    }

    // فیلتر کردن کلمات واقعی
    const realWords = words.filter(isRealWord);
    
    // اگر کلمه واقعی نداریم، LTR برگردان
    if (realWords.length === 0) return 'ltr';

    // برای متن‌های کوتاه (کمتر از 5 کلمه واقعی)، کل متن را بررسی کن
    if (realWords.length < 5) {
        let rtlWordsCount = 0;
        for (const word of realWords) {
            if ([...word].some(isRTLChar)) rtlWordsCount++;
        }
        return rtlWordsCount > 0 ? 'rtl' : 'ltr';
    }

    // برای متن‌های متوسط (5-10 کلمه واقعی)، 50% اول را بررسی کن
    if (realWords.length <= 10) {
        let checkWordsCount = Math.ceil(realWords.length * 0.5);
        const wordsToCheck = realWords.slice(0, checkWordsCount);
        
        let rtlWordsCount = 0;
        for (const word of wordsToCheck) {
            if ([...word].some(isRTLChar)) rtlWordsCount++;
        }
        
        if (rtlWordsCount > checkWordsCount / 2) return 'rtl';
        if (rtlWordsCount < checkWordsCount / 2) return 'ltr';
        
        // اگر مساوی، کل متن را بررسی کن
        let totalRTLWords = 0;
        for (const word of realWords) {
            if ([...word].some(isRTLChar)) totalRTLWords++;
        }
        return totalRTLWords > realWords.length / 2 ? 'rtl' : 'ltr';
    }

    // برای متن‌های طولانی، ابتدا کل متن را بررسی کن
    let totalRTLWords = 0;
    for (const word of realWords) {
        if ([...word].some(isRTLChar)) totalRTLWords++;
    }

    const firstWord = realWords[0];
    const lastWord = realWords[realWords.length - 1];
    const firstWordIsRTL = [...firstWord].some(isRTLChar);
    const lastWordIsRTL = [...lastWord].some(isRTLChar);
    
    
    // اگر هر دو ابتدا و انتها RTL باشند، RTL
    if (firstWordIsRTL && lastWordIsRTL) return 'rtl';
    // اگر هر دو ابتدا و انتها LTR باشند، LTR
    if (!firstWordIsRTL && !lastWordIsRTL) return 'ltr';

    // اگر ابتدا و انتها متفاوت هستند، بررسی کن که آیا تفاوت زیاد است
    const difference = Math.abs(totalRTLWords - (realWords.length - totalRTLWords));
    const rtlPercentage = (totalRTLWords / realWords.length) * 100;
    
    
    // اگر اکثریت قوی وجود دارد (بیش از 70%)، اولویت با اکثریت
    if (rtlPercentage >= 70 || rtlPercentage <= 30) {
        const result = totalRTLWords > realWords.length / 2 ? 'rtl' : 'ltr';
        
        
        return result;
    }
    
    // اگر تفاوت کم است (کمتر یا مساوی 10)، اولویت با ابتدا و انتها
    if (difference <= 10) {
        // اگر ابتدا RTL است، RTL
        if (firstWordIsRTL) return 'rtl';
        // اگر ابتدا LTR است، LTR
        return 'ltr';
    }

    // اگر تفاوت زیاد است، بر اساس اکثریت تصمیم بگیر
    const result = totalRTLWords > realWords.length / 2 ? 'rtl' : 'ltr';
    
    
    return result;
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

// Export functions for CommonJS
module.exports = {
    analyzeTextDirection,
    detectTextDirection,
    isRTL,
    isCode
};

