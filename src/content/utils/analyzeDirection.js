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

    function isEmoji(char) {
        const code = char.charCodeAt(0);
        return (
            (code >= 0x1F600 && code <= 0x1F64F) || // Emoticons
            (code >= 0x1F300 && code <= 0x1F5FF) || // Misc Symbols and Pictographs
            (code >= 0x1F680 && code <= 0x1F6FF) || // Transport and Map
            (code >= 0x1F1E0 && code <= 0x1F1FF) || // Regional indicator symbols
            (code >= 0x2600 && code <= 0x26FF) ||   // Misc symbols
            (code >= 0x2700 && code <= 0x27BF) ||   // Dingbats
            (code >= 0xFE00 && code <= 0xFE0F) ||   // Variation Selectors
            (code >= 0x1F900 && code <= 0x1F9FF) || // Supplemental Symbols and Pictographs
            (code >= 0x1FA70 && code <= 0x1FAFF)    // Symbols and Pictographs Extended-A
        );
    }

    function isPunctuation(char) {
        const code = char.charCodeAt(0);
        return (
            (code >= 0x0020 && code <= 0x002F) ||   // Basic punctuation
            (code >= 0x003A && code <= 0x0040) ||   // More punctuation
            (code >= 0x005B && code <= 0x0060) ||   // Brackets and more
            (code >= 0x007B && code <= 0x007E) ||   // Braces and tilde
            (code >= 0x2000 && code <= 0x206F) ||   // General punctuation
            (code >= 0x2E00 && code <= 0x2E7F) ||   // Supplemental punctuation
            (code >= 0x3000 && code <= 0x303F) ||   // CJK symbols and punctuation
            (code >= 0xFE50 && code <= 0xFE6F) ||   // Small form variants
            (code >= 0xFF00 && code <= 0xFFEF)      // Halfwidth and fullwidth forms
        );
    }

    // حذف ایموجی‌ها و علائم نگارشی از ابتدای متن برای تحلیل بهتر
    let cleanText = text.trim();
    while (cleanText.length > 0 && (isEmoji(cleanText[0]) || isPunctuation(cleanText[0]))) {
        cleanText = cleanText.slice(1).trim();
    }
    
    // اگر متن خالی شد، متن اصلی را بررسی کن
    if (cleanText.length === 0) {
        cleanText = text.trim();
    }

    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
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

    // بررسی خاص برای متن‌هایی که با فارسی شروع می‌شوند
    if (words.length > 0) {
        const firstWord = words[0];
        const firstWordIsRTL = [...firstWord].some(isRTLChar);
        
        // اگر اولین کلمه فارسی است، احتمالاً کل متن RTL است
        if (firstWordIsRTL) {
            // بررسی چند کلمه اول
            let rtlWordsInFirstThree = 0;
            const wordsToCheck = words.slice(0, Math.min(3, words.length));
            for (const word of wordsToCheck) {
                if ([...word].some(isRTLChar)) rtlWordsInFirstThree++;
            }
            
            // اگر حداقل یکی از کلمات اول فارسی است، RTL
            if (rtlWordsInFirstThree > 0) {
                return 'rtl';
            }
        }
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

