import { isFirefoxRuntime } from './isFirefox';

export const PIN_OPEN_SITE_STORAGE_KEY = 'pinOpenSiteInList';
export const PIN_OPEN_SITE_PENDING_FULL_KEY = 'pinOpenSitePendingFull';

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
        title: 'نیمه فعال',
        description: 'استفاده از حداقل دسترسی و مجوزها: در این حالت، افزونه فقط با مجوزهای موجود تلاش می‌کند تشخیص دهد کدام سایت باز است.',
        extra: 'نحوه عملکرد: افزونه نمی‌تواند باز بودن سایت‌های بدون مجوز را تشخیص دهد. برای اینکه سایتی شناسایی شود و به بالای لیست بیاید، لازم است حداقل یک بار افزونه را برای آن فعال کنید.',
    },
    {
        id: 'full',
        title: 'فعال',
        description: 'برای اینکه سایتِ در حال مشاهده (در صورت پشتیبانی شدن توسط افزونه) همیشه بالای لیست بیاید، حتی اگر هنوز آن را فعال نکرده باشید، افزونه با کمک «مجوز تب‌ها» باز بودن آن را تشخیص می‌دهد تا بتوانید سریع‌تر فعالش کنید.',
        extra: 'این دسترسی صرفاً برای خواندن «نام دامنه» تب فعلی است و افزونه هیچ‌گونه دسترسی به آدرس کامل، محتوای صفحه یا اطلاعات شخصی شما ندارد.',
    },
];

export function getDefaultPinOpenSiteMode(): PinOpenSiteMode {
    return isFirefoxRuntime() ? 'full' : 'limited';
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

/**
 * Persist "full" before chrome.permissions.request().
 * The extension popup closes when Chrome shows the permission prompt, so the
 * click-handler never gets to save the setting after a successful grant.
 */
export function rememberFullPinOpenSiteIntent() {
    try {
        void chrome.storage.sync.set({ [PIN_OPEN_SITE_STORAGE_KEY]: 'full' });
        void chrome.storage.local.set({ [PIN_OPEN_SITE_PENDING_FULL_KEY]: true });
    } catch {
        // ignore
    }
}

export async function clearFullPinOpenSiteIntent() {
    try {
        await chrome.storage.local.remove(PIN_OPEN_SITE_PENDING_FULL_KEY);
    } catch {
        // ignore
    }
}

export async function applyPendingFullPinOpenSite(): Promise<boolean> {
    if (isFirefoxRuntime()) {
        return false;
    }

    try {
        const [hasTabs, local] = await Promise.all([
            hasTabsPermission(),
            chrome.storage.local.get(PIN_OPEN_SITE_PENDING_FULL_KEY),
        ]);
        if (!hasTabs || local[PIN_OPEN_SITE_PENDING_FULL_KEY] !== true) {
            return false;
        }

        await chrome.storage.sync.set({ [PIN_OPEN_SITE_STORAGE_KEY]: 'full' });
        await clearFullPinOpenSiteIntent();
        return true;
    } catch {
        return false;
    }
}
