import { browserExtensionName } from '../utils/isFirefox.js';

export const SITE_SETTINGS_STORAGE_KEY = 'siteSettings';

export const YOUTUBE_FONT_SCOPE_AI = 'ai';
export const YOUTUBE_FONT_SCOPE_SITE = 'site';

/**
 * Sites that have their own block above quick settings.
 * Add a field here and the popup card plus the list wrench follow.
 */
export const SITE_SETTINGS_REGISTRY = [
    {
        serviceKey: 'youtube',
        title: 'YouTube',
        icon: '/images/sites/youtube.png',
        fields: [
            {
                key: 'fontScope',
                label: 'اعمال فونت روی کل سایت',
                type: 'switch',
                defaultValue: YOUTUBE_FONT_SCOPE_AI,
                onValue: YOUTUBE_FONT_SCOPE_SITE,
                offValue: YOUTUBE_FONT_SCOPE_AI,
            },
        ],
    },
    {
        serviceKey: 'harness',
        title: 'DeepSeek Harness',
        icon: '/images/sites/harness.png',
        description: 'افزونهٔ کروم AI RTL و پلاگین هارنس AI RTL به‌طور هم‌زمان فعال هستند. لطفاً یکی را برای استفاده انتخاب کنید.',
        missingPluginNote: 'برای هارنس پلاگین داریم و در نسخه دسکتاپ می‌توانید از آن استفاده کنید.',
        fields: [
            {
                key: 'engine',
                label: 'اعمال راست‌چین با',
                type: 'choice',
                defaultValue: 'chrome',
                options: [
                    { value: 'chrome', label: browserExtensionName(), icon: '/images/logo/ai-rtl-logo.png' },
                    { value: 'dsh', label: 'پلاگین هارنس', icon: '/images/logo/dsh-extension.png' },
                ],
            },
        ],
    },
];

export function serviceHasSiteSettings(serviceKey) {
    return SITE_SETTINGS_REGISTRY.some((entry) => entry.serviceKey === serviceKey);
}

export function defaultSiteSettings() {
    const settings = {};
    SITE_SETTINGS_REGISTRY.forEach((entry) => {
        const site = {};
        entry.fields.forEach((field) => {
            site[field.key] = field.defaultValue;
        });
        settings[entry.serviceKey] = site;
    });
    return settings;
}

/**
 * @param {unknown} stored
 * @returns {Record<string, Record<string, string>>}
 */
export function normalizeSiteSettings(stored) {
    const defaults = defaultSiteSettings();
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
        return defaults;
    }

    const next = {};
    SITE_SETTINGS_REGISTRY.forEach((entry) => {
        const raw = stored[entry.serviceKey];
        const site = { ...defaults[entry.serviceKey] };
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            entry.fields.forEach((field) => {
                const value = raw[field.key];
                if (field.type === 'select' || field.type === 'choice') {
                    const allowed = (field.options || []).map((option) => option.value);
                    if (allowed.indexOf(value) !== -1) {
                        site[field.key] = value;
                    }
                    return;
                }
                if (field.type === 'switch') {
                    if (value === field.onValue || value === true) {
                        site[field.key] = field.onValue;
                    } else if (value === field.offValue || value === false) {
                        site[field.key] = field.offValue;
                    }
                }
            });
        }
        next[entry.serviceKey] = site;
    });
    return next;
}

export function getYoutubeFontScope(stored) {
    return normalizeSiteSettings(stored).youtube.fontScope;
}
