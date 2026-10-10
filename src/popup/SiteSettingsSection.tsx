import React from 'react';
import { Box, SvgIcon, Switch, Typography } from '@mui/material';
import { mdiWrench } from '@mdi/js';
import {
    SITE_SETTINGS_REGISTRY,
    SITE_SETTINGS_STORAGE_KEY,
    normalizeSiteSettings,
} from '../constants/siteSettings';
import { useHarnessPluginPresent } from './harnessPluginPresence';
import { useI18n } from '../i18n';

interface SiteChoice {
    value: string;
    label: string;
    icon?: string;
}

interface SiteField {
    key: string;
    label: string;
    type: string;
    defaultValue: string;
    onValue?: string;
    offValue?: string;
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
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [settings, setSettings] = React.useState<SiteSettingsMap>(
        () => normalizeSiteSettings(undefined) as SiteSettingsMap
    );
    const [highlightedKey, setHighlightedKey] = React.useState<string | null>(null);
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
        const node = document.getElementById(`site-settings-${focusSiteKey}`);
        const scroll = () => {
            node?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        };
        scroll();
        const scrollTimer = window.setTimeout(scroll, 420);
        const highlightTimer = window.setTimeout(() => {
            setHighlightedKey((current) => (current === focusSiteKey ? null : current));
        }, 2200);
        return () => {
            window.clearTimeout(scrollTimer);
            window.clearTimeout(highlightTimer);
        };
    }, [activeServiceKey, focusSiteKey, focusNonce]);

    if (!entry) {
        return null;
    }

    const accent = isDarkMode ? '#00e9ff' : '#1c39bb';
    const cardBg = isDarkMode ? 'rgba(47, 47, 65, 0.9)' : '#ffffff';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(30, 64, 175, 0.12)';
    const titleColor = isDarkMode ? '#ffffff' : '#1e293b';
    const mutedColor = isDarkMode ? '#94a3b8' : '#64748b';
    const siteValues = settings[entry.serviceKey] || {};
    const switchFields = entry.fields.filter((field) => field.type === 'switch' && field.onValue && field.offValue);
    const choiceFields = entry.fields.filter((field) => field.type === 'choice' && field.options && field.options.length > 0);
    const pluginMissing = entry.serviceKey === 'harness' && harnessPluginPresent === false;
    const waitingForPlugin = entry.serviceKey === 'harness' && harnessPluginPresent === null;
    const visibleChoiceFields = pluginMissing || waitingForPlugin ? [] : choiceFields;
    const resolveFieldLabel = (field: SiteField) => {
        if (entry.serviceKey === 'youtube' && field.key === 'fontScope') {
            return t('quickSettings.youtubeFontScope');
        }
        if (entry.serviceKey === 'harness' && field.key === 'engine') {
            return t('quickSettings.harnessEngineLabel');
        }
        return field.label;
    };
    const resolveOptionLabel = (option: SiteChoice) => {
        if (entry.serviceKey !== 'harness') {
            return option.label;
        }
        if (option.value === 'dsh') {
            return t('quickSettings.harnessPlugin');
        }
        return option.label;
    };

    if (!switchFields.length && !choiceFields.length) {
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
                chrome.storage.sync.set({ [SITE_SETTINGS_STORAGE_KEY]: next });
            } catch (error) {
                // Extension context can disappear while the popup is closing.
            }
            return next;
        });
    };

    return (
        <Box
            id={`site-settings-${entry.serviceKey}`}
            className={highlightedKey === entry.serviceKey ? 'site-settings-card-focus' : undefined}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, borderRadius: '12px' }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.25, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
                    <SvgIcon sx={{ fontSize: '1.05rem', color: accent }}>
                        <path d={mdiWrench} />
                    </SvgIcon>
                    <Typography className="quick-settings-label" sx={{ color: titleColor }}>
                        {t('quickSettings.siteSpecific')}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    {entry.icon ? (
                        <Box
                            component="img"
                            src={chrome.runtime.getURL(entry.icon)}
                            alt=""
                            sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                            }}
                        />
                    ) : null}
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: titleColor,
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
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
                    {entry.serviceKey === 'harness' ? t('quickSettings.harnessMissingPlugin') : entry.missingPluginNote}
                </Typography>
            ) : null}
            {visibleChoiceFields.map((field, index) => {
                const value = siteValues[field.key] || field.defaultValue;
                return (
                    <Box
                        key={field.key}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                            px: 1.5,
                            py: 1.25,
                            borderTop: index > 0 ? `1px solid ${cardBorder}` : 'none',
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
            })}
            {switchFields.map((field, index) => {
                const value = siteValues[field.key] || field.defaultValue;
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
                            borderTop: index > 0 || visibleChoiceFields.length > 0 ? `1px solid ${cardBorder}` : 'none',
                        }}
                    >
                        <Typography className="quick-settings-label">{resolveFieldLabel(field)}</Typography>
                        <Switch
                            size="small"
                            checked={checked}
                            onChange={(event) => {
                                updateField(field.key, event.target.checked ? field.onValue! : field.offValue!);
                            }}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
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
