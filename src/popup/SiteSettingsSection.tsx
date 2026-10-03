import React from 'react';
import { Box, SvgIcon, Switch, Typography } from '@mui/material';
import { mdiWrench } from '@mdi/js';
import {
    SITE_SETTINGS_REGISTRY,
    SITE_SETTINGS_STORAGE_KEY,
    normalizeSiteSettings,
} from '../constants/siteSettings';

interface SiteField {
    key: string;
    label: string;
    type: string;
    defaultValue: string;
    onValue?: string;
    offValue?: string;
}

interface SiteEntry {
    serviceKey: string;
    title: string;
    icon?: string;
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
    const [settings, setSettings] = React.useState<SiteSettingsMap>(
        () => normalizeSiteSettings(undefined) as SiteSettingsMap
    );
    const [highlightedKey, setHighlightedKey] = React.useState<string | null>(null);
    const entry = registry.find((item) => item.serviceKey === activeServiceKey) || null;

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
    const siteValues = settings[entry.serviceKey] || {};
    const switchFields = entry.fields.filter((field) => field.type === 'switch' && field.onValue && field.offValue);

    if (!switchFields.length) {
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
                        تنظیمات مخصوص
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
                                borderRadius: '6px',
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
            <Box
                className="quick-settings-card"
                sx={{ background: cardBg, borderColor: cardBorder, gap: 0, p: 0 }}
            >
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
                            borderTop: index > 0 ? `1px solid ${cardBorder}` : 'none',
                        }}
                    >
                        <Typography className="quick-settings-label">{field.label}</Typography>
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
                            inputProps={{ 'aria-label': `${field.label} ${entry.title}` }}
                        />
                    </Box>
                );
            })}
            </Box>
        </Box>
    );
};

export default SiteSettingsSection;
