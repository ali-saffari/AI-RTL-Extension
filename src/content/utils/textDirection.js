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

    // محاسبه تعداد کلمه‌ای که بررسی می‌کنیم (30% کلمات، حداقل 5 و حداکثر 10)
    let checkWordsCount = Math.ceil(words.length * 0.3);
    checkWordsCount = Math.min(Math.max(checkWordsCount, 5), 10);
    if (words.length < checkWordsCount) checkWordsCount = words.length;

    const wordsToCheck = words.slice(0, checkWordsCount);

    let rtlWordsCount = 0;
    for (const word of wordsToCheck) {
        if ([...word].some(isRTLChar)) rtlWordsCount++;
    }

    if (rtlWordsCount > checkWordsCount / 2) return 'rtl';
    if (rtlWordsCount < checkWordsCount / 2) return 'ltr';

    // اگر مساوی یا نامشخص، کل متن را بررسی کن
    let totalRTLWords = 0;
    for (const word of words) {
        if ([...word].some(isRTLChar)) totalRTLWords++;
    }

    if (totalRTLWords > words.length / 2) return 'rtl';
    else return 'ltr';
}


/**
 * Detects text direction (RTL/LTR) based on character analysis
 * Used in: chatgpt.js
 * @param {string} text - Text to analyze
 * @returns {string} - "rtl" if text is RTL, "ltr" if text is LTR
 */
export function detectTextDirection(text) {
    return analyzeTextDirection(text);
}

/**
 * Simple RTL detection wrapper
 * Used in: freegpt.js
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text is RTL
 */
export function isRTL(text) {
    return analyzeTextDirection(text) === "rtl";
}

