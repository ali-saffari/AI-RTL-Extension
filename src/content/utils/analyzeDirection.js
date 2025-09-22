/**
 * Text direction detection utilities
 * Single source of truth for all text direction decisions
 */


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

    console.log('Normalized text:', normalizedText);

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

    // برای متن‌های کوتاه (کمتر از 5 کلمه)، کل متن را بررسی کن
    if (words.length < 5) {
        let rtlWordsCount = 0;
        for (const word of words) {
            if ([...word].some(isRTLChar)) rtlWordsCount++;
        }
        return rtlWordsCount > 0 ? 'rtl' : 'ltr';
    }

    // برای متن‌های متوسط (5-10 کلمه)، 50% اول را بررسی کن
    if (words.length <= 10) {
        let checkWordsCount = Math.ceil(words.length * 0.5);
        const wordsToCheck = words.slice(0, checkWordsCount);
        
        let rtlWordsCount = 0;
        for (const word of wordsToCheck) {
            if ([...word].some(isRTLChar)) rtlWordsCount++;
        }
        
        if (rtlWordsCount > checkWordsCount / 2) return 'rtl';
        if (rtlWordsCount < checkWordsCount / 2) return 'ltr';
        
        // اگر مساوی، کل متن را بررسی کن
        let totalRTLWords = 0;
        for (const word of words) {
            if ([...word].some(isRTLChar)) totalRTLWords++;
        }
        return totalRTLWords > words.length / 2 ? 'rtl' : 'ltr';
    }

    // برای متن‌های طولانی، ابتدا کل متن را بررسی کن
    let totalRTLWords = 0;
    for (const word of words) {
        if ([...word].some(isRTLChar)) totalRTLWords++;
    }

    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    const firstWordIsRTL = [...firstWord].some(isRTLChar);
    const lastWordIsRTL = [...lastWord].some(isRTLChar);
    
    // اگر هر دو ابتدا و انتها RTL باشند، RTL
    if (firstWordIsRTL && lastWordIsRTL) return 'rtl';
    // اگر هر دو ابتدا و انتها LTR باشند، LTR
    if (!firstWordIsRTL && !lastWordIsRTL) return 'ltr';

    // اگر ابتدا و انتها متفاوت هستند، بررسی کن که آیا تفاوت زیاد است
    const difference = Math.abs(totalRTLWords - (words.length - totalRTLWords));
    
    // اگر تفاوت کم است (کمتر یا مساوی 10)، اولویت با ابتدا و انتها
    if (difference <= 10) {
        // اگر ابتدا RTL است، RTL
        if (firstWordIsRTL) return 'rtl';
        // اگر ابتدا LTR است، LTR
        return 'ltr';
    }

    // اگر تفاوت زیاد است، بر اساس اکثریت تصمیم بگیر
    return totalRTLWords > words.length / 2 ? 'rtl' : 'ltr';
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
 * Used in: freegpt.js
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
    isRTL
};

