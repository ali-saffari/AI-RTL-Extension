import { isFirefoxRuntime } from './isFirefox.js';
import { siteUrl } from './siteUrl.js';

/** Official Chrome Web Store extension ID — hide this ID in UI. */
export const CHROME_PRODUCTION_EXTENSION_ID = 'pjpmebofipgpjaincgoboibbmicccbne';

export function shouldShowExtensionId(extensionId = chrome.runtime.id) {
    return extensionId !== CHROME_PRODUCTION_EXTENSION_ID;
}

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

/**
 * @param {{ chrome?: string, firefox?: string }} [labels]
 */
export function getStorePageLinkText(labels = {}) {
    return isFirefoxRuntime()
        ? (labels.firefox || 'صفحه افزونه در Firefox Add-ons')
        : (labels.chrome || 'صفحه افزونه در Chrome Store');
}

/**
 * @param {{ chrome?: string, firefox?: string }} [labels]
 */
export function getRateLinkText(labels = {}) {
    return isFirefoxRuntime()
        ? (labels.firefox || 'امتیاز دهی در فایرفاکس')
        : (labels.chrome || 'امتیاز دهی در کروم');
}

/**
 * @param {{ chrome?: string, firefox?: string }} [labels]
 */
export function getOfficialStoreLabel(labels = {}) {
    return isFirefoxRuntime()
        ? (labels.firefox || 'صفحه رسمی افزونه در فایرفاکس ادآنز:')
        : (labels.chrome || 'صفحه رسمی افزونه در کروم استور:');
}

/**
 * @param {{ chrome?: string, firefox?: string }} [labels]
 */
export function getViewInStoreText(labels = {}) {
    return isFirefoxRuntime()
        ? (labels.firefox || 'مشاهده در Firefox Add-ons')
        : (labels.chrome || 'مشاهده در Chrome Web Store');
}

export function extensionShareUrl(locale) {
    return siteUrl('/?ref=eshare', locale);
}

export const EXTENSION_SHARE_URL = extensionShareUrl('fa');

export const EXTENSION_SHARE_TEXT =
    'اگه با متن‌های نامرتب فارسی توی چت‌جی‌پی‌تی و بقیه هوش مصنوعی‌ها مشکل دارید، این افزونه با راست‌چین هوشمند و فونت تمیز، همه‌چیز رو در بیش از ۵۰ سایت درست می‌کنه:';

export function getExtensionShareText(shareText) {
    return typeof shareText === 'string' && shareText ? shareText : EXTENSION_SHARE_TEXT;
}

export function getExtensionShareLine(shareText, locale) {
    return `${getExtensionShareText(shareText)}\n${extensionShareUrl(locale)}`;
}

export const EXTENSION_SHARE_LINE = `${EXTENSION_SHARE_TEXT}\n${EXTENSION_SHARE_URL}`;

/**
 * @typedef {{ id: string, label: string, href: string, color: string, action?: 'open' | 'copy-and-open' }} SocialShareTarget
 */

/**
 * @param {Partial<Record<'telegram'|'whatsapp'|'twitter'|'instagram'|'facebook'|'linkedin'|'email', string>>} [labels]
 * @param {string} [shareText]
 * @returns {SocialShareTarget[]}
 */
export function getSocialShareTargets(labels = {}, shareText, locale) {
    const textValue = getExtensionShareText(shareText);
    const shareLine = getExtensionShareLine(shareText, locale);
    const url = encodeURIComponent(extensionShareUrl(locale));
    const text = encodeURIComponent(textValue);
    const fullText = encodeURIComponent(shareLine);

    return [
        {
            id: 'telegram',
            label: labels.telegram || 'تلگرام',
            href: `https://t.me/share/url?url=${url}&text=${text}`,
            color: '#229ED9',
        },
        {
            id: 'whatsapp',
            label: labels.whatsapp || 'واتساپ',
            href: `https://wa.me/?text=${fullText}`,
            color: '#25D366',
        },
        {
            id: 'twitter',
            label: labels.twitter || 'ایکس',
            href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            color: '#111111',
        },
        {
            id: 'instagram',
            label: labels.instagram || 'اینستاگرام',
            href: 'https://www.instagram.com/',
            color: '#E4405F',
            action: 'copy-and-open',
        },
        {
            id: 'facebook',
            label: labels.facebook || 'فیسبوک',
            href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
            color: '#1877F2',
        },
        {
            id: 'linkedin',
            label: labels.linkedin || 'لینکدین',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            color: '#0A66C2',
        },
        {
            id: 'email',
            label: labels.email || 'ایمیل',
            href: `mailto:?subject=${encodeURIComponent('AI RTL')}&body=${fullText}`,
            color: '#EA4335',
        },
    ];
}

/**
 * @param {string} [shareText]
 */
export function getExtensionShareHref(shareText, locale) {
    const textValue = getExtensionShareText(shareText);
    return getSocialShareTargets({}, textValue, locale).find((target) => target.id === 'telegram')?.href
        || `https://t.me/share/url?url=${encodeURIComponent(extensionShareUrl(locale))}&text=${encodeURIComponent(textValue)}`;
}

/**
 * @param {{ preferNative?: boolean, shareText?: string, locale?: string }} [options]
 */
export async function shareExtension(options = {}) {
    const preferNative = options.preferNative !== false;
    const textValue = getExtensionShareText(options.shareText);
    const shareLine = getExtensionShareLine(options.shareText, options.locale);

    if (preferNative && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            await navigator.share({
                title: 'AI RTL',
                text: textValue,
                url: extensionShareUrl(options.locale),
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
