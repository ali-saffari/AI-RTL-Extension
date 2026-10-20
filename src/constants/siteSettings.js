import { browserExtensionName } from '../utils/isFirefox.js';
import { parseOpenWebuiAddressList, serializeOpenWebuiAddresses } from './openWebuiAddresses.js';

export const SITE_SETTINGS_STORAGE_KEY = 'siteSettings';

export const YOUTUBE_FONT_SCOPE_AI = 'ai';
export const YOUTUBE_FONT_SCOPE_SITE = 'site';

export const YOUTUBE_CAPTIONS_RTL_ON = 'on';
export const YOUTUBE_CAPTIONS_RTL_OFF = 'off';

export const NOTION_SETTING_ON = 'on';
export const NOTION_SETTING_OFF = 'off';

// User-facing slider default is 100%. Internally that maps to 60% of YouTube's size.
export const YOUTUBE_CAPTION_FONT_SCALE_DEFAULT = 100;
export const YOUTUBE_CAPTION_FONT_SCALE_BASE = 70;
export const YOUTUBE_CAPTION_FONT_SCALE_MIN = 70;
export const YOUTUBE_CAPTION_FONT_SCALE_MAX = 160;
export const YOUTUBE_CAPTION_FONT_SCALE_STEP = 5;

export const RTL_ALGORITHM_SECTION = 'advanced_section';
export const RTL_ALGORITHM_FULL = 'advanced_full';
export const RTL_ALGORITHM_FIRST_WORD = 'first_word';

export const TITLE_MODE_UNIFIED = 'unified';
export const TITLE_MODE_INDIVIDUAL = 'individual';

export const SITE_RTL_ALGORITHM_OPTIONS = [
    { value: RTL_ALGORITHM_SECTION, labelKey: 'advancedSection' },
    { value: RTL_ALGORITHM_FULL, labelKey: 'advancedFull' },
    { value: RTL_ALGORITHM_FIRST_WORD, labelKey: 'firstWord' },
];

export const SITE_TITLE_MODE_OPTIONS = [
    { value: TITLE_MODE_UNIFIED, labelKey: 'unified' },
    { value: TITLE_MODE_INDIVIDUAL, labelKey: 'individual' },
];

/**
 * @param {string} [recommended=RTL_ALGORITHM_SECTION]
 */
function createSiteRtlAlgorithmField(recommended = RTL_ALGORITHM_SECTION) {
    return {
        key: 'rtlAlgorithm',
        label: 'الگوریتم تشخیص',
        type: 'select',
        defaultValue: recommended,
        recommendedValue: recommended,
        options: SITE_RTL_ALGORITHM_OPTIONS,
    };
}

const SITE_TITLE_MODE_FIELD = {
    key: 'titleMode',
    label: 'نحوه نمایش عنوان‌ها',
    type: 'select',
    defaultValue: TITLE_MODE_UNIFIED,
    showWhen: { key: 'rtlAlgorithm', value: RTL_ALGORITHM_SECTION },
    options: SITE_TITLE_MODE_OPTIONS,
};

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
            {
                key: 'captionsRtl',
                label: 'راست‌چین کردن زیرنویس',
                type: 'switch',
                defaultValue: YOUTUBE_CAPTIONS_RTL_OFF,
                onValue: YOUTUBE_CAPTIONS_RTL_ON,
                offValue: YOUTUBE_CAPTIONS_RTL_OFF,
            },
            {
                key: 'captionFontScale',
                label: 'اندازه فونت زیرنویس',
                type: 'range',
                defaultValue: String(YOUTUBE_CAPTION_FONT_SCALE_DEFAULT),
                min: YOUTUBE_CAPTION_FONT_SCALE_MIN,
                max: YOUTUBE_CAPTION_FONT_SCALE_MAX,
                step: YOUTUBE_CAPTION_FONT_SCALE_STEP,
                showWhenAny: [
                    { key: 'captionsRtl', value: YOUTUBE_CAPTIONS_RTL_ON },
                    { key: 'fontScope', value: YOUTUBE_FONT_SCOPE_SITE },
                ],
            },
        ],
    },
    {
        serviceKey: 'harness',
        title: 'DeepSeek Harness',
        icon: '/images/sites/harness.png',
        description: 'افزونهٔ کروم AI RTL و پلاگین هارنس AI RTL به‌طور هم‌زمان فعال هستند. لطفاً یکی را برای استفاده انتخاب کنید.',
        missingPluginNote: 'پلاگین نسخه دسکتاپ منتشر شد',
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
    {
        serviceKey: 'chatGpt',
        title: 'ChatGPT',
        icon: '/images/sites/openAi-icon.png',
        fields: [createSiteRtlAlgorithmField(RTL_ALGORITHM_SECTION), SITE_TITLE_MODE_FIELD],
    },
    {
        serviceKey: 'zai',
        title: 'Z.ai',
        icon: '/images/sites/z.ai.png',
        fields: [createSiteRtlAlgorithmField(RTL_ALGORITHM_SECTION), SITE_TITLE_MODE_FIELD],
    },
    {
        serviceKey: 'notion',
        title: 'Notion',
        icon: '/images/sites/notion.png',
        fields: [
            {
                key: 'siteFont',
                label: 'اعمال فونت روی کل سایت',
                type: 'switch',
                defaultValue: NOTION_SETTING_ON,
                onValue: NOTION_SETTING_ON,
                offValue: NOTION_SETTING_OFF,
            },
            {
                key: 'tablesRtl',
                label: 'اعمال راست‌چین روی جداول',
                type: 'switch',
                experimental: true,
                defaultValue: NOTION_SETTING_ON,
                onValue: NOTION_SETTING_ON,
                offValue: NOTION_SETTING_OFF,
            },
        ],
    },
    {
        serviceKey: 'openwebui',
        title: 'Open WebUI',
        icon: '/images/sites/openwebui.png',
        fields: [
            {
                key: 'customUrls',
                label: 'آدرس سفارشی',
                type: 'urls',
                defaultValue: '',
            },
        ],
    },
];

export function serviceHasSiteSettings(serviceKey) {
    return SITE_SETTINGS_REGISTRY.some((entry) => entry.serviceKey === serviceKey);
}

export function serviceHasSiteRtlAlgorithm(serviceKey) {
    const entry = SITE_SETTINGS_REGISTRY.find((item) => item.serviceKey === serviceKey);
    return Boolean(entry?.fields?.some((field) => field.key === 'rtlAlgorithm'));
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
                    return;
                }
                if (field.type === 'range') {
                    const numeric = Number(value);
                    const min = Number(field.min);
                    const max = Number(field.max);
                    const step = Number(field.step) || 1;
                    if (!Number.isFinite(numeric)) {
                        return;
                    }
                    const clamped = Math.min(max, Math.max(min, numeric));
                    const snapped = Math.round(clamped / step) * step;
                    site[field.key] = String(snapped);
                    return;
                }
                if (field.type === 'urls') {
                    const source = typeof value === 'string' || Array.isArray(value) ? value : '';
                    site[field.key] = serializeOpenWebuiAddresses(parseOpenWebuiAddressList(source));
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

export function getYoutubeCaptionsRtl(stored) {
    return normalizeSiteSettings(stored).youtube.captionsRtl === YOUTUBE_CAPTIONS_RTL_ON;
}

export function getYoutubeCaptionFontScale(stored) {
    const raw = Number(normalizeSiteSettings(stored).youtube.captionFontScale);
    if (!Number.isFinite(raw)) {
        return YOUTUBE_CAPTION_FONT_SCALE_DEFAULT;
    }
    return Math.min(
        YOUTUBE_CAPTION_FONT_SCALE_MAX,
        Math.max(YOUTUBE_CAPTION_FONT_SCALE_MIN, raw)
    );
}

/** User 100% → actual 60% of YouTube caption size. */
export function getYoutubeCaptionFontScaleFactor(stored) {
    return (getYoutubeCaptionFontScale(stored) / 100)
        * (YOUTUBE_CAPTION_FONT_SCALE_BASE / 100);
}

/** Captions get extension styling when RTL captions or whole-site font is on. */
export function isYoutubeCaptionEffectActive(stored) {
    const youtube = normalizeSiteSettings(stored).youtube;
    return youtube.captionsRtl === YOUTUBE_CAPTIONS_RTL_ON
        || youtube.fontScope === YOUTUBE_FONT_SCOPE_SITE;
}

export function isNotionSiteFontOn(stored) {
    return normalizeSiteSettings(stored).notion?.siteFont === NOTION_SETTING_ON;
}

export function isNotionTablesRtlOn(stored) {
    return normalizeSiteSettings(stored).notion?.tablesRtl === NOTION_SETTING_ON;
}

/**
 * Site-specific RTL algorithm when registered; otherwise the global fallback.
 * @param {unknown} stored
 * @param {string|null|undefined} serviceKey
 * @param {string} [fallback='advanced_full']
 * @returns {string}
 */
export function getSiteRtlAlgorithm(stored, serviceKey, fallback = RTL_ALGORITHM_FULL) {
    if (!serviceKey || !serviceHasSiteRtlAlgorithm(serviceKey)) {
        return fallback;
    }
    const value = normalizeSiteSettings(stored)?.[serviceKey]?.rtlAlgorithm;
    const allowed = SITE_RTL_ALGORITHM_OPTIONS.map((option) => option.value);
    if (allowed.indexOf(value) !== -1) {
        return value;
    }
    return RTL_ALGORITHM_SECTION;
}

/**
 * Site title mode when that site uses section analysis; otherwise the global fallback.
 * @param {unknown} stored
 * @param {string|null|undefined} serviceKey
 * @param {string} [fallback='unified']
 * @returns {string}
 */
export function getSiteTitleMode(stored, serviceKey, fallback = TITLE_MODE_UNIFIED) {
    if (!serviceKey || !serviceHasSiteRtlAlgorithm(serviceKey)) {
        return fallback;
    }
    const site = normalizeSiteSettings(stored)?.[serviceKey];
    if (!site || site.rtlAlgorithm !== RTL_ALGORITHM_SECTION) {
        return fallback;
    }
    const allowed = SITE_TITLE_MODE_OPTIONS.map((option) => option.value);
    if (allowed.indexOf(site.titleMode) !== -1) {
        return site.titleMode;
    }
    return TITLE_MODE_UNIFIED;
}
