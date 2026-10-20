import React from 'react';
import { Box, FormControl, MenuItem, Select, Slider, SvgIcon, Switch, Typography } from '@mui/material';
import { mdiWrench } from '@mdi/js';
import {
    SITE_SETTINGS_REGISTRY,
    SITE_SETTINGS_STORAGE_KEY,
    normalizeSiteSettings,
} from '../constants/siteSettings';
import {
    isOpenWebuiDefaultAddress,
    isProtectedOpenWebuiPattern,
    parseOpenWebuiAddress,
    parseOpenWebuiAddressList,
    serializeOpenWebuiAddresses,
} from '../constants/openWebuiAddresses';
import { useHarnessPluginPresent } from './harnessPluginPresence';
import { useI18n } from '../i18n';
import { siteUrl } from '../utils/siteUrl';
import ExperimentalBadge from '../components/ExperimentalBadge';

interface SiteChoice {
    value: string;
    label?: string;
    labelKey?: string;
    icon?: string;
}

interface SiteField {
    key: string;
    label: string;
    type: string;
    defaultValue: string;
    recommendedValue?: string;
    onValue?: string;
    offValue?: string;
    min?: number;
    max?: number;
    step?: number;
    showWhen?: { key: string; value: string };
    showWhenAny?: { key: string; value: string }[];
    experimental?: boolean;
    options?: SiteChoice[];
}

interface SiteEntry {
    serviceKey: string;
    title: string;
    icon?: string;
    description?: string;
    missingPluginNote?: string;
    fields: SiteField[];
}

type SiteSettingsMap = Record<string, Record<string, string>>;

interface SiteSettingsSectionProps {
    isDarkMode: boolean;
    activeServiceKey?: string | null;
    focusSiteKey?: string | null;
    focusNonce?: number;
}

const registry = SITE_SETTINGS_REGISTRY as SiteEntry[];

const SiteSettingsSection: React.FC<SiteSettingsSectionProps> = ({
    isDarkMode,
    activeServiceKey = null,
    focusSiteKey = null,
    focusNonce = 0,
}) => {
    const { t, dir, locale } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [settings, setSettings] = React.useState<SiteSettingsMap>(
        () => normalizeSiteSettings(undefined) as SiteSettingsMap
    );
    const [rangeDraft, setRangeDraft] = React.useState<Record<string, string>>({});
    const [highlightedKey, setHighlightedKey] = React.useState<string | null>(null);
    const [urlDraft, setUrlDraft] = React.useState('');
    const [urlError, setUrlError] = React.useState('');
    const entry = registry.find((item) => item.serviceKey === activeServiceKey) || null;
    const harnessPluginPresent = useHarnessPluginPresent(entry?.serviceKey === 'harness');

    React.useEffect(() => {
        let cancelled = false;
        try {
            chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (result) => {
                if (cancelled) {
                    return;
                }
                setSettings(normalizeSiteSettings(result[SITE_SETTINGS_STORAGE_KEY]) as SiteSettingsMap);
            });
        } catch (error) {
            setSettings(normalizeSiteSettings(undefined) as SiteSettingsMap);
        }

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName !== 'sync' || !changes[SITE_SETTINGS_STORAGE_KEY]) {
                return;
            }
            setSettings(normalizeSiteSettings(changes[SITE_SETTINGS_STORAGE_KEY].newValue) as SiteSettingsMap);
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            cancelled = true;
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    React.useEffect(() => {
        if (!focusSiteKey || focusSiteKey !== activeServiceKey) {
            return;
        }
        setHighlightedKey(focusSiteKey);
        const reveal = () => {
            const node = document.getElementById(`site-settings-${focusSiteKey}`);
            const container = node?.closest('.quick-settings-body-scroll');
            if (!node || !(container instanceof HTMLElement)) {
                return;
            }
            const nodeRect = node.getBoundingClientRect();
            const box = container.getBoundingClientRect();
            if (box.height < 40 || box.width < 40) {
                return;
            }
            const hidden = nodeRect.top < box.top + 4 || nodeRect.bottom > box.bottom - 4;
            if (!hidden) {
                return;
            }
            const top = nodeRect.top - box.top + container.scrollTop - 8;
            container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        };
        reveal();
        const revealTimer = window.setTimeout(reveal, 420);
        const highlightTimer = window.setTimeout(() => {
            setHighlightedKey((current) => (current === focusSiteKey ? null : current));
        }, 2200);
        return () => {
            window.clearTimeout(revealTimer);
            window.clearTimeout(highlightTimer);
        };
    }, [activeServiceKey, focusSiteKey, focusNonce]);

    React.useEffect(() => {
        setUrlDraft('');
        setUrlError('');
    }, [entry?.serviceKey]);

    if (!entry) {
        return null;
    }

    const accent = isDarkMode ? '#00e9ff' : '#387af2';
    const cardBg = isDarkMode ? 'rgba(47, 47, 65, 0.9)' : '#ffffff';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(56, 122, 242, 0.22)';
    const titleColor = isDarkMode ? '#ffffff' : '#1e293b';
    const mutedColor = isDarkMode ? '#94a3b8' : '#64748b';
    const fieldBg = isDarkMode ? 'rgba(26, 26, 46, 0.7)' : '#f8fafc';
    const siteValues = settings[entry.serviceKey] || {};
    const algorithmSelectSx = {
        width: '100%',
        fontFamily: 'iranyekan',
        fontSize: '0.68rem',
        backgroundColor: fieldBg,
        color: titleColor,
        borderRadius: '8px',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: cardBorder,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(56, 122, 242, 0.4)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: accent,
            borderWidth: '1px',
        },
        '& .MuiSelect-select': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            py: 0.35,
        },
        '& .MuiSelect-icon': {
            color: mutedColor,
        },
    };
    const switchFields = entry.fields.filter((field) => field.type === 'switch' && field.onValue && field.offValue);
    const choiceFields = entry.fields.filter((field) => field.type === 'choice' && field.options && field.options.length > 0);
    const selectFields = entry.fields.filter((field) => field.type === 'select' && field.options && field.options.length > 0);
    const rangeFields = entry.fields.filter((field) => field.type === 'range');
    const pluginMissing = entry.serviceKey === 'harness' && harnessPluginPresent === false;
    const waitingForPlugin = entry.serviceKey === 'harness' && harnessPluginPresent === null;
    const fieldIsVisible = (field: SiteField) => {
        if (field.showWhenAny && field.showWhenAny.length) {
            return field.showWhenAny.some((rule) => siteValues[rule.key] === rule.value);
        }
        if (!field.showWhen) {
            return true;
        }
        const current = siteValues[field.showWhen.key];
        return current === field.showWhen.value;
    };
    const visibleOrderedFields = pluginMissing || waitingForPlugin
        ? []
        : entry.fields.filter((field) => {
            if (!fieldIsVisible(field)) {
                return false;
            }
            if (field.type === 'switch') {
                return Boolean(field.onValue && field.offValue);
            }
            if (field.type === 'choice' || field.type === 'select') {
                return Boolean(field.options && field.options.length > 0);
            }
            if (field.type === 'range') {
                return Number.isFinite(field.min) && Number.isFinite(field.max);
            }
            if (field.type === 'urls') {
                return true;
            }
            return false;
        });
    const resolveFieldLabel = (field: SiteField) => {
        if (entry.serviceKey === 'youtube' && field.key === 'fontScope') {
            return t('quickSettings.youtubeFontScope');
        }
        if (entry.serviceKey === 'youtube' && field.key === 'captionsRtl') {
            return t('quickSettings.youtubeCaptionsRtl');
        }
        if (entry.serviceKey === 'youtube' && field.key === 'metadataRtl') {
            return t('quickSettings.youtubeMetadataRtl');
        }
        if (entry.serviceKey === 'youtube' && field.key === 'captionFontScale') {
            return t('quickSettings.youtubeCaptionFontSize');
        }
        if (entry.serviceKey === 'notion' && field.key === 'siteFont') {
            return t('quickSettings.notionSiteFont');
        }
        if (entry.serviceKey === 'notion' && field.key === 'tablesRtl') {
            return t('quickSettings.notionTablesRtl');
        }
        if (entry.serviceKey === 'harness' && field.key === 'engine') {
            return t('quickSettings.harnessEngineLabel');
        }
        if (field.key === 'rtlAlgorithm') {
            return t('quickSettings.siteAlgorithmLabel');
        }
        if (field.key === 'titleMode') {
            return t('quickSettings.titleModeLabel');
        }
        if (entry.serviceKey === 'openwebui' && field.key === 'customUrls') {
            return t('quickSettings.openwebuiCustomUrls');
        }
        return field.label;
    };
    const resolveOptionLabel = (option: SiteChoice) => {
        if (option.labelKey === 'advancedSection') {
            return t('quickSettings.algorithms.advancedSection.title');
        }
        if (option.labelKey === 'advancedFull') {
            return t('quickSettings.algorithms.advancedFull.title');
        }
        if (option.labelKey === 'firstWord') {
            return t('quickSettings.algorithms.firstWord.title');
        }
        if (option.labelKey === 'unified') {
            return t('quickSettings.titleModes.unified.title');
        }
        if (option.labelKey === 'individual') {
            return t('quickSettings.titleModes.individual.title');
        }
        if (entry.serviceKey === 'harness' && option.value === 'dsh') {
            return t('quickSettings.harnessPlugin');
        }
        return option.label || option.value;
    };
    const resolveAlgorithmMeta = (option: SiteChoice) => {
        if (option.labelKey === 'advancedSection') {
            return {
                title: t('quickSettings.algorithms.advancedSection.title'),
                hint: t('quickSettings.algorithms.advancedSection.hint'),
                badge: t('quickSettings.algorithms.advancedSection.badge'),
            };
        }
        if (option.labelKey === 'advancedFull') {
            return {
                title: t('quickSettings.algorithms.advancedFull.title'),
                hint: t('quickSettings.algorithms.advancedFull.hint'),
                badge: t('quickSettings.algorithms.advancedFull.badge'),
            };
        }
        if (option.labelKey === 'firstWord') {
            return {
                title: t('quickSettings.algorithms.firstWord.title'),
                hint: t('quickSettings.algorithms.firstWord.hint'),
                badge: '',
            };
        }
        return {
            title: resolveOptionLabel(option),
            hint: '',
            badge: '',
        };
    };
    const badgeSx = {
        flexShrink: 0,
        px: 0.7,
        py: 0.1,
        borderRadius: 1,
        fontSize: '0.62rem',
        fontWeight: 600,
        color: accent,
        border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(56, 122, 242, 0.3)'}`,
        background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(56, 122, 242, 0.08)',
        whiteSpace: 'nowrap',
    };
    const recommendedBadgeSx = {
        ...badgeSx,
        color: isDarkMode ? '#4ade80' : '#15803d',
        border: `1px solid ${isDarkMode ? 'rgba(74, 222, 128, 0.35)' : 'rgba(21, 128, 61, 0.28)'}`,
        background: isDarkMode ? 'rgba(74, 222, 128, 0.12)' : 'rgba(34, 197, 94, 0.12)',
    };

    const hasUrlField = entry.fields.some((field) => field.type === 'urls');
    if (!switchFields.length && !choiceFields.length && !selectFields.length && !rangeFields.length && !hasUrlField) {
        return null;
    }

    const updateField = (fieldKey: string, value: string) => {
        setSettings((current) => {
            const base = current || (normalizeSiteSettings(undefined) as SiteSettingsMap);
            const next: SiteSettingsMap = {
                ...base,
                [entry.serviceKey]: {
                    ...base[entry.serviceKey],
                    [fieldKey]: value,
                },
            };
            try {
                chrome.storage.sync.set({ [SITE_SETTINGS_STORAGE_KEY]: next }, () => {
                    void chrome.runtime.lastError;
                });
            } catch (error) {
                // Extension context can disappear while the popup is closing.
            }
            return next;
        });
    };
    const previewRange = (fieldKey: string, value: string) => {
        if (fieldKey !== 'captionFontScale') {
            return;
        }
        try {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                void chrome.runtime.lastError;
                const tabId = tabs && tabs[0] && tabs[0].id;
                if (!tabId) {
                    return;
                }
                chrome.tabs.sendMessage(tabId, {
                    action: 'previewYoutubeCaptionFontScale',
                    scale: Number(value),
                }, () => {
                    void chrome.runtime.lastError;
                });
            });
        } catch (error) {
            // tabs API may be unavailable
        }
    };

    return (
        <Box
            id={`site-settings-${entry.serviceKey}`}
            className={highlightedKey === entry.serviceKey ? 'site-settings-card-focus' : undefined}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.35, borderRadius: '12px' }}
        >
            <Box className="quick-settings-section-bar" sx={{ minWidth: 0, justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
                    <SvgIcon sx={{ fontSize: '1.05rem', color: accent }}>
                        <path d={mdiWrench} />
                    </SvgIcon>
                    <Typography className="quick-settings-label quick-settings-heading" sx={{ color: titleColor }}>
                        {t('quickSettings.siteSpecific')}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.55,
                        minWidth: 0,
                        px: 0.7,
                        py: 0.25,
                        borderRadius: '8px',
                        border: isDarkMode
                            ? '1px solid rgba(0, 233, 255, 0.28)'
                            : '1px solid rgba(56, 122, 242, 0.22)',
                        background: 'transparent',
                    }}
                >
                    {entry.icon ? (
                        <Box
                            component="img"
                            src={chrome.runtime.getURL(entry.icon)}
                            alt=""
                            sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                            }}
                        />
                    ) : null}
                    <Typography
                        sx={{
                            fontWeight: 500,
                            fontSize: '0.68rem',
                            color: titleColor,
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            fontFamily: 'iranyekan',
                        }}
                    >
                        {entry.title}
                    </Typography>
                </Box>
            </Box>
            {waitingForPlugin ? null : (
            <Box
                className="quick-settings-card"
                sx={{ background: cardBg, borderColor: cardBorder, gap: 0, p: 0 }}
            >
            {pluginMissing ? (
                entry.serviceKey === 'harness' ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 1.25,
                        }}
                    >
                        <Box
                            component="img"
                            src={chrome.runtime.getURL('/images/logo/dsh-extension.png')}
                            alt=""
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '6px',
                                objectFit: 'cover',
                                flexShrink: 0,
                            }}
                        />
                        <Typography
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                lineHeight: 1.8,
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.92)' : '#1e293b',
                            }}
                        >
                            {t('quickSettings.harnessMissingPlugin')}{' '}
                            <Box
                                component="a"
                                href={siteUrl('/deepseek-harness/', locale)}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: accent,
                                    fontWeight: 600,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px',
                                    '&:hover': {
                                        color: isDarkMode ? '#4dd4ff' : '#3b82f6',
                                    },
                                }}
                            >
                                {t('quickSettings.harnessMissingPluginCta')}
                            </Box>
                        </Typography>
                    </Box>
                ) : (
                    <Typography
                        sx={{
                            px: 1.5,
                            py: 1.25,
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            lineHeight: 1.8,
                            color: mutedColor,
                        }}
                    >
                        {entry.missingPluginNote}
                    </Typography>
                )
            ) : null}
            {visibleOrderedFields.map((field, index) => {
                const value = siteValues[field.key] || field.defaultValue;
                const borderTop = index > 0 ? `1px solid ${cardBorder}` : 'none';

                if (field.type === 'urls') {
                    const addresses = parseOpenWebuiAddressList(value);
                    const addCustomUrl = async () => {
                        const parsed = parseOpenWebuiAddress(urlDraft);
                        if (!parsed) {
                            setUrlError(t('quickSettings.openwebuiCustomUrlsInvalid'));
                            return;
                        }
                        if (isOpenWebuiDefaultAddress(parsed)) {
                            setUrlError(t('quickSettings.openwebuiCustomUrlsDefault'));
                            return;
                        }
                        if (addresses.some((item) => item.id === parsed.id)) {
                            setUrlError(t('quickSettings.openwebuiCustomUrlsExists'));
                            return;
                        }
                        if (addresses.length >= 20) {
                            setUrlError(t('quickSettings.openwebuiCustomUrlsLimit'));
                            return;
                        }
                        try {
                            const granted = await chrome.permissions.request({
                                permissions: ['scripting'],
                                origins: [parsed.pattern],
                            });
                            if (!granted) {
                                setUrlError(t('quickSettings.openwebuiCustomUrlsDenied'));
                                return;
                            }
                        } catch (error) {
                            setUrlError(t('quickSettings.openwebuiCustomUrlsDenied'));
                            return;
                        }
                        updateField(field.key, serializeOpenWebuiAddresses([...addresses, parsed]));
                        setUrlDraft('');
                        setUrlError('');
                    };
                    const removeCustomUrl = (id: string) => {
                        const removed = addresses.find((item) => item.id === id);
                        const next = addresses.filter((item) => item.id !== id);
                        updateField(field.key, serializeOpenWebuiAddresses(next));
                        if (
                            removed
                            && !isProtectedOpenWebuiPattern(removed.pattern)
                            && !next.some((item) => item.pattern === removed.pattern)
                        ) {
                            chrome.permissions.remove({ origins: [removed.pattern] }).catch(() => undefined);
                        }
                    };
                    return (
                        <Box
                            key={field.key}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.75,
                                px: 1.5,
                                py: 1.25,
                                borderTop,
                            }}
                        >
                            <Typography className="quick-settings-label">{resolveFieldLabel(field)}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', lineHeight: 1.7, color: mutedColor }}>
                                {t('quickSettings.openwebuiCustomUrlsHint')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                                <Box
                                    component="input"
                                    value={urlDraft}
                                    dir="ltr"
                                    placeholder={t('quickSettings.openwebuiCustomUrlsPlaceholder')}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setUrlDraft(event.target.value);
                                        if (urlError) {
                                            setUrlError('');
                                        }
                                    }}
                                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            void addCustomUrl();
                                        }
                                    }}
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        height: 32,
                                        px: 1,
                                        borderRadius: '8px',
                                        border: `1px solid ${cardBorder}`,
                                        background: fieldBg,
                                        color: titleColor,
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.72rem',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: accent,
                                        },
                                    }}
                                />
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => {
                                        void addCustomUrl();
                                    }}
                                    sx={{
                                        flexShrink: 0,
                                        height: 32,
                                        px: 1.1,
                                        border: 0,
                                        borderRadius: '8px',
                                        background: accent,
                                        color: isDarkMode ? '#041018' : '#ffffff',
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {t('quickSettings.openwebuiCustomUrlsAdd')}
                                </Box>
                            </Box>
                            {urlError ? (
                                <Typography sx={{ fontSize: '0.68rem', lineHeight: 1.6, color: '#ef4444' }}>
                                    {urlError}
                                </Typography>
                            ) : null}
                            {addresses.map((address) => (
                                <Box
                                    key={address.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.6,
                                        minWidth: 0,
                                    }}
                                >
                                    <Typography
                                        dir="ltr"
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            fontSize: '0.7rem',
                                            lineHeight: 1.5,
                                            color: titleColor,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {address.id}
                                    </Typography>
                                    <Box
                                        component="button"
                                        type="button"
                                        aria-label={t('quickSettings.openwebuiCustomUrlsRemove', { url: address.id })}
                                        onClick={() => removeCustomUrl(address.id)}
                                        sx={{
                                            flexShrink: 0,
                                            border: 0,
                                            background: 'transparent',
                                            color: mutedColor,
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.68rem',
                                            cursor: 'pointer',
                                            p: 0,
                                        }}
                                    >
                                        {t('quickSettings.openwebuiCustomUrlsRemoveLabel')}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    );
                }

                if (field.type === 'choice') {
                    return (
                        <Box
                            key={field.key}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.75,
                                px: 1.5,
                                py: 1.25,
                                borderTop,
                            }}
                        >
                            <Typography className="quick-settings-label">{resolveFieldLabel(field)}</Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    p: '3px',
                                    borderRadius: '10px',
                                    background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(28,57,187,0.08)',
                                }}
                            >
                                {(field.options || []).map((option) => {
                                    const selected = value === option.value;
                                    return (
                                        <Box
                                            key={option.value}
                                            component="button"
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => updateField(field.key, option.value)}
                                            sx={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.5,
                                                border: 0,
                                                borderRadius: '8px',
                                                py: 0.75,
                                                px: 0.5,
                                                font: 'inherit',
                                                fontWeight: 700,
                                                fontSize: '0.72rem',
                                                lineHeight: 1.4,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                background: selected ? accent : 'transparent',
                                                color: selected ? (isDarkMode ? '#041018' : '#ffffff') : titleColor,
                                            }}
                                        >
                                            {option.icon ? (
                                                <Box
                                                    component="img"
                                                    src={chrome.runtime.getURL(option.icon)}
                                                    alt=""
                                                    sx={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }}
                                                />
                                            ) : null}
                                            {resolveOptionLabel(option)}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                }

                if (field.type === 'select') {
                    const isAlgorithmField = field.key === 'rtlAlgorithm';
                    return (
                        <Box
                            key={field.key}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                px: 1.5,
                                py: 1.25,
                                borderTop,
                            }}
                        >
                            <Typography className="quick-settings-label" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {resolveFieldLabel(field)}
                            </Typography>
                            <FormControl size="small" sx={{ width: 168, flex: '0 0 168px', minWidth: 0 }}>
                                <Select
                                    dir={dir}
                                    className="quick-settings-select"
                                    value={value}
                                    onChange={(event) => updateField(field.key, String(event.target.value))}
                                    renderValue={(selected) => {
                                        const option = (field.options || []).find((item) => item.value === selected);
                                        return option ? resolveOptionLabel(option) : '';
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            className: isAlgorithmField
                                                ? 'quick-settings-select-menu quick-settings-algo-menu'
                                                : 'quick-settings-select-menu',
                                            sx: {
                                                mt: 0.5,
                                                backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                                backgroundImage: 'none',
                                                ...(isAlgorithmField
                                                    ? { width: 330, maxWidth: 330, boxSizing: 'border-box' }
                                                    : {}),
                                            },
                                        },
                                    }}
                                    sx={algorithmSelectSx}
                                    inputProps={{ 'aria-label': resolveFieldLabel(field) }}
                                >
                                    {(field.options || []).map((option) => {
                                        if (!isAlgorithmField) {
                                            return (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                    dir={dir}
                                                    sx={{
                                                        fontFamily: 'iranyekan',
                                                        fontSize: '0.78rem',
                                                        py: 0.75,
                                                        whiteSpace: 'nowrap',
                                                        textAlign: contentAlign,
                                                        direction: dir,
                                                    }}
                                                >
                                                    {resolveOptionLabel(option)}
                                                </MenuItem>
                                            );
                                        }

                                        const meta = resolveAlgorithmMeta(option);
                                        const isRecommended = Boolean(
                                            field.recommendedValue && option.value === field.recommendedValue
                                        );
                                        return (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                                dir={dir}
                                                className="quick-settings-algo-item"
                                                sx={{
                                                    fontFamily: 'iranyekan',
                                                    fontSize: '0.82rem',
                                                    alignItems: 'flex-start',
                                                    py: 1.1,
                                                    whiteSpace: 'normal',
                                                    textAlign: contentAlign,
                                                    direction: dir,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, width: '100%', minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                        <span>{meta.title}</span>
                                                        {(meta.badge || isRecommended) ? (
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: contentAlign === 'right' ? 'flex-end' : 'flex-start',
                                                                    gap: 0.4,
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {isRecommended ? (
                                                                    <Box component="span" sx={recommendedBadgeSx}>
                                                                        {t('quickSettings.siteRecommendedBadge', { name: entry.title })}
                                                                    </Box>
                                                                ) : null}
                                                                {meta.badge ? (
                                                                    <Box component="span" sx={badgeSx}>
                                                                        {meta.badge}
                                                                    </Box>
                                                                ) : null}
                                                            </Box>
                                                        ) : null}
                                                    </Box>
                                                    {meta.hint ? (
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '0.68rem',
                                                                color: mutedColor,
                                                                lineHeight: 1.5,
                                                                whiteSpace: 'normal',
                                                                overflowWrap: 'break-word',
                                                                wordBreak: 'break-word',
                                                                fontFamily: 'iranyekan',
                                                            }}
                                                        >
                                                            {meta.hint}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Box>
                    );
                }

                if (field.type === 'range') {
                    const numeric = Number(rangeDraft[field.key] ?? value);
                    const fallback = Number(field.defaultValue);
                    const scale = Number.isFinite(numeric)
                        ? numeric
                        : (Number.isFinite(fallback) ? fallback : 100);
                    const defaultScale = Number.isFinite(fallback) ? fallback : 100;
                    const scaleLabel = scale === defaultScale ? t('shared.default') : `${scale}٪`;
                    return (
                        <Box
                            key={field.key}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                px: 1.5,
                                py: 1.25,
                                borderTop,
                            }}
                        >
                            <Typography className="quick-settings-label">{resolveFieldLabel(field)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                                <Typography sx={{ fontSize: '0.62rem', color: mutedColor, flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {scaleLabel}
                                </Typography>
                                <Slider
                                    size="small"
                                    value={scale}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step || 5}
                                    marks={[{ value: defaultScale }]}
                                    onChange={(_, next) => {
                                        const nextValue = String(next);
                                        setRangeDraft((current) => ({ ...current, [field.key]: nextValue }));
                                        previewRange(field.key, nextValue);
                                    }}
                                    onChangeCommitted={(_, next) => {
                                        const nextValue = String(next);
                                        setRangeDraft((current) => {
                                            const rest = { ...current };
                                            delete rest[field.key];
                                            return rest;
                                        });
                                        updateField(field.key, nextValue);
                                    }}
                                    sx={{
                                        width: 168,
                                        flex: '0 0 168px',
                                        m: 0,
                                        py: 0.5,
                                        color: accent,
                                        '& .MuiSlider-rail': { opacity: 0.35 },
                                        '& .MuiSlider-mark': { backgroundColor: accent, height: 6, width: 2 },
                                        '& .MuiSlider-thumb': { width: 12, height: 12 },
                                    }}
                                    aria-label={resolveFieldLabel(field)}
                                />
                            </Box>
                        </Box>
                    );
                }

                const checked = value === field.onValue;
                return (
                    <Box
                        key={field.key}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1.5,
                            py: 1.25,
                            borderTop,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                            <Typography className="quick-settings-label">{resolveFieldLabel(field)}</Typography>
                            {field.experimental ? <ExperimentalBadge isDarkMode={isDarkMode} /> : null}
                        </Box>
                        <Switch
                            size="small"
                            checked={checked}
                            onChange={(event) => {
                                updateField(field.key, event.target.checked ? field.onValue! : field.offValue!);
                            }}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: isDarkMode ? '#00e9ff' : '#387af2',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: isDarkMode ? '#00e9ff' : '#387af2',
                                },
                            }}
                            inputProps={{ 'aria-label': `${resolveFieldLabel(field)} ${entry.title}` }}
                        />
                    </Box>
                );
            })}
            {!pluginMissing && entry.description ? (
                <Typography
                    sx={{
                        px: 1.5,
                        pb: 1.25,
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        lineHeight: 1.7,
                        color: mutedColor,
                    }}
                >
                    {entry.description}
                </Typography>
            ) : null}
            </Box>
            )}
        </Box>
    );
};

export default SiteSettingsSection;
