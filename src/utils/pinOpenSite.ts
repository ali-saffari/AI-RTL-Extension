import { isFirefoxRuntime } from './isFirefox';

export const PIN_OPEN_SITE_STORAGE_KEY = 'pinOpenSiteInList';

export type PinOpenSiteMode = 'off' | 'limited' | 'full';

export const PIN_OPEN_SITE_MODE_OPTIONS: Array<{
    id: PinOpenSiteMode;
    title: string;
    description: string;
    extra?: string;
}> = [
    {
        id: 'off',
        title: 'غیرفعال',
        description: '',
    },
    {
        id: 'limited',
        title: 'کمترین دسترسی',
        description: 'استفاده از حداقل دسترسی و مجوزها: در این حالت، افزونه فقط با مجوزهای موجود تلاش می‌کند تشخیص دهد کدام سایت باز است.',
        extra: 'نحوه عملکرد: افزونه نمی‌تواند باز بودن سایت‌های بدون مجوز را تشخیص دهد. برای اینکه سایتی شناسایی شود و به بالای لیست بیاید، لازم است حداقل یک بار افزونه را برای آن فعال کنید.',
    },
    {
        id: 'full',
        title: 'فعال',
        description: 'شناسایی خودکار تمام سایت‌ها: با دسترسی به مجوز تب‌ها، افزونه حتی باز بودن سایت‌های غیرفعال را هم متوجه می‌شود و آن‌ها را به بالای لیست می‌آورد تا فعال‌سازی‌شان سریع‌تر انجام شود.',
        extra: 'حریم خصوصی: فقط «نام دامنه» تب فعلی خوانده می‌شود؛ افزونه هیچ دسترسی به آدرس کامل، محتوای صفحه یا اطلاعات شخصی ندارد.',
    },
];

export function getDefaultPinOpenSiteMode(): PinOpenSiteMode {
    return isFirefoxRuntime() ? 'full' : 'off';
}

export function getPinOpenSiteModeOptions() {
    if (isFirefoxRuntime()) {
        return PIN_OPEN_SITE_MODE_OPTIONS.filter((option) => option.id !== 'limited');
    }
    return PIN_OPEN_SITE_MODE_OPTIONS;
}

export function normalizePinOpenSiteMode(value: unknown): PinOpenSiteMode {
    if (value === 'off' || value === 'limited' || value === 'full') {
        if (value === 'limited' && isFirefoxRuntime()) {
            return 'full';
        }
        return value;
    }
    if (value === true) {
        return 'full';
    }
    if (value === false) {
        return 'off';
    }
    return getDefaultPinOpenSiteMode();
}

export function isPinOpenSiteEnabled(mode: PinOpenSiteMode) {
    return mode !== 'off';
}

export async function hasTabsPermission() {
    if (isFirefoxRuntime()) {
        return true;
    }

    try {
        return await chrome.permissions.contains({ permissions: ['tabs'] });
    } catch {
        return false;
    }
}

export async function requestTabsPermission() {
    if (isFirefoxRuntime()) {
        return true;
    }

    try {
        return await chrome.permissions.request({ permissions: ['tabs'] });
    } catch {
        return false;
    }
}
