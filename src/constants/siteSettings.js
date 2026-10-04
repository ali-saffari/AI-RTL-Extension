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
        description: 'اگر افزونه کروم انتخاب باشد و پلاگین هارنس وصل باشد، خاموش و روشن این سایت در افزونه و پلاگین با هم عوض می‌شود.',
        fields: [
            {
                key: 'engine',
                label: 'اعمال راست‌چین با',
                type: 'choice',
                defaultValue: 'chrome',
                options: [
                    { value: 'chrome', label: 'افزونه کروم' },
                    { value: 'dsh', label: 'پلاگین هارنس' },
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
