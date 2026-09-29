import { isFirefoxRuntime } from './isFirefox.js';

export const CHROME_STORE_URL =
    'https://chromewebstore.google.com/detail/ai-rtl-farsi/pjpmebofipgpjaincgoboibbmicccbne';

export const CHROME_STORE_REVIEWS_URL =
    'https://chromewebstore.google.com/detail/ai-rtl-%D9%81%D8%A7%D8%B1%D8%B3%DB%8C-%D8%B1%D8%A7%D8%B3%D8%AA%E2%80%8C%DA%86%DB%8C%D9%86-%D9%88-%D8%A8/pjpmebofipgpjaincgoboibbmicccbne/reviews';

export const FIREFOX_STORE_URL =
    'https://addons.mozilla.org/en-US/firefox/addon/ai-rtl-persian-farsi/';

export const FIREFOX_STORE_REVIEWS_URL =
    'https://addons.mozilla.org/en-US/firefox/addon/ai-rtl-persian-farsi/reviews/';

export const ACTIVATE_PATHS = {
    chrome: '/activate/chrome/',
    firefox: '/activate/firefox/',
};

export const GUIDE_PATHS = {
    chrome: '/guide/chrome/',
    firefox: '/guide/firefox/',
};

export function getActivateGuidePath() {
    return isFirefoxRuntime() ? ACTIVATE_PATHS.firefox : ACTIVATE_PATHS.chrome;
}

export function getInstallGuidePath() {
    return isFirefoxRuntime() ? GUIDE_PATHS.firefox : GUIDE_PATHS.chrome;
}

export function getExtensionStoreUrl() {
    return isFirefoxRuntime() ? FIREFOX_STORE_URL : CHROME_STORE_URL;
}

export function getExtensionReviewsUrl() {
    return isFirefoxRuntime() ? FIREFOX_STORE_REVIEWS_URL : CHROME_STORE_REVIEWS_URL;
}

export function getStorePageLinkText() {
    return isFirefoxRuntime()
        ? 'صفحه افزونه در Firefox Add-ons'
        : 'صفحه افزونه در Chrome Store';
}

export function getRateLinkText() {
    return isFirefoxRuntime()
        ? 'امتیاز دهی در فایرفاکس'
        : 'امتیاز دهی در کروم';
}

export function getOfficialStoreLabel() {
    return isFirefoxRuntime()
        ? 'صفحه رسمی افزونه در فایرفاکس ادآنز:'
        : 'صفحه رسمی افزونه در کروم استور:';
}

export function getViewInStoreText() {
    return isFirefoxRuntime()
        ? 'مشاهده در Firefox Add-ons'
        : 'مشاهده در Chrome Web Store';
}

export const EXTENSION_SHARE_URL = 'https://ai-rtl.ir/?ref=eshare';

export const EXTENSION_SHARE_TEXT =
    'اگه با متن‌های نامرتب فارسی توی چت‌جی‌پی‌تی و بقیه هوش مصنوعی‌ها مشکل دارید، این افزونه با راست‌چین هوشمند و فونت تمیز، همه‌چیز رو در بیش از ۵۰ سایت درست می‌کنه:';

export const EXTENSION_SHARE_LINE = `${EXTENSION_SHARE_TEXT}\n${EXTENSION_SHARE_URL}`;

/**
 * @typedef {{ id: string, label: string, href: string, color: string, action?: 'open' | 'copy-and-open' }} SocialShareTarget
 */

/**
 * @returns {SocialShareTarget[]}
 */
export function getSocialShareTargets() {
    const url = encodeURIComponent(EXTENSION_SHARE_URL);
    const text = encodeURIComponent(EXTENSION_SHARE_TEXT);
    const fullText = encodeURIComponent(EXTENSION_SHARE_LINE);

    return [
        {
            id: 'telegram',
            label: 'تلگرام',
            href: `https://t.me/share/url?url=${url}&text=${text}`,
            color: '#229ED9',
        },
        {
            id: 'whatsapp',
            label: 'واتساپ',
            href: `https://wa.me/?text=${fullText}`,
            color: '#25D366',
        },
        {
            id: 'twitter',
            label: 'ایکس',
            href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            color: '#111111',
        },
        {
            id: 'instagram',
            label: 'اینستاگرام',
            href: 'https://www.instagram.com/',
            color: '#E4405F',
            action: 'copy-and-open',
        },
        {
            id: 'facebook',
            label: 'فیسبوک',
            href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
            color: '#1877F2',
        },
        {
            id: 'linkedin',
            label: 'لینکدین',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            color: '#0A66C2',
        },
        {
            id: 'email',
            label: 'ایمیل',
            href: `mailto:?subject=${encodeURIComponent('AI RTL')}&body=${fullText}`,
            color: '#EA4335',
        },
    ];
}

export function getExtensionShareHref() {
    return getSocialShareTargets().find((target) => target.id === 'telegram')?.href
        || `https://t.me/share/url?url=${encodeURIComponent(EXTENSION_SHARE_URL)}&text=${encodeURIComponent(EXTENSION_SHARE_TEXT)}`;
}

/**
 * @param {{ preferNative?: boolean }} [options]
 */
export async function shareExtension(options = {}) {
    const preferNative = options.preferNative !== false;
    const shareLine = EXTENSION_SHARE_LINE;

    if (preferNative && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            await navigator.share({
                title: 'AI RTL',
                text: EXTENSION_SHARE_TEXT,
                url: EXTENSION_SHARE_URL,
            });
            return 'shared';
        } catch (error) {
            if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
                return 'cancelled';
            }
        }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(shareLine);
            return 'copied';
        } catch {
            // Fall through
        }
    }

    return 'fallback';
}
