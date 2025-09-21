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

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 'ltr';

    // بررسی اولویت‌های خاص برای تشخیص جهت
    if (words.length >= 2) {
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        const firstWordIsRTL = [...firstWord].some(isRTLChar);
        const lastWordIsRTL = [...lastWord].some(isRTLChar);
        
        // اگر متن با فارسی شروع و با فارسی تمام شود
        if (firstWordIsRTL && lastWordIsRTL) {
            // برای متن‌های خیلی کوتاه (2-3 کلمه)، همیشه RTL
            if (words.length <= 3) {
                return 'rtl';
            }
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

