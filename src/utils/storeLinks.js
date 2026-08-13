import { isFirefoxRuntime } from './isFirefox.js';

export const CHROME_STORE_URL =
    'https://chromewebstore.google.com/detail/ai-rtl-farsi/pjpmebofipgpjaincgoboibbmicccbne';

export const FIREFOX_STORE_URL =
    'https://addons.mozilla.org/en-US/firefox/addon/ai-rtl-persian-farsi/';

export function getExtensionStoreUrl() {
    return isFirefoxRuntime() ? FIREFOX_STORE_URL : CHROME_STORE_URL;
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
