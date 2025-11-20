import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    SvgIcon,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { mdiCog, mdiWeb } from '@mdi/js';

interface TextSelectorSettings {
    enabled: 'enabled' | 'allowed_sites' | 'disabled';
    highlightMode: 'disabled' | 'on_selection' | 'on_direction_change';
    highlightColor: string;
    highlightOpacity: number;
    logoDisplay: 'always' | 'on_hover' | 'disabled';
    manualRtlEnabled?: boolean;
    manualRtlSiteMode?: 'all' | 'ai_sites' | 'allowed_sites' | 'ai_and_allowed';
    menuDisplayMode?: 'logo_first' | 'menu_direct';
}

interface ManualRtlBannerProps {
    isDarkMode: boolean;
    manualRtlSettings: TextSelectorSettings;
    onManualRtlSettingsChange: (settings: TextSelectorSettings) => void;
}

interface ActiveTabInfoSnapshot {
    tabId: number | null;
    hostname: string;
    favicon: string;
    hasHostname?: boolean;
    activatedAt?: number;
    lastUpdatedAt?: number;
}

const ManualRtlBanner: React.FC<ManualRtlBannerProps> = ({
    isDarkMode,
    manualRtlSettings,
    onManualRtlSettingsChange
}) => {
    const [activeTabInfo, setActiveTabInfo] = React.useState<ActiveTabInfoSnapshot | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const handleActiveTabUpdate = (message: any) => {
            if (!isMounted || !message) return;
            if (message.action === 'activeTabInfoUpdated') {
                setActiveTabInfo(message.payload || null);
            }
        };

        const fetchActiveTabInfo = () => {
            try {
                chrome.runtime.sendMessage({ action: 'getActiveTabInfo' }, (response) => {
                    if (!isMounted) return;
                    if (chrome.runtime.lastError) {
                        console.log('[ManualRtlBanner] getActiveTabInfo error:', chrome.runtime.lastError.message);
                        return;
                    }
                    if (response?.success) {
                        setActiveTabInfo(response.tabInfo || null);
                    } else {
                        setActiveTabInfo(null);
                    }
                });
            } catch (error) {
                if (isMounted) {
                    console.log('[ManualRtlBanner] getActiveTabInfo exception:', (error as Error)?.message);
                }
            }
        };

        fetchActiveTabInfo();
        chrome.runtime.onMessage.addListener(handleActiveTabUpdate);

        return () => {
            isMounted = false;
            chrome.runtime.onMessage.removeListener(handleActiveTabUpdate);
        };
    }, []);

    const activeHostname = activeTabInfo?.hostname?.trim() || '';
    const hasSiteDetails = Boolean(activeHostname && activeTabInfo?.favicon);
    const faviconSrc = hasSiteDetails ? (activeTabInfo?.favicon || '') : '';
    const shouldShowCheckbox = Boolean(activeHostname);
    const displayHostname = React.useMemo(() => {
        if (!activeHostname) return '';
        if (activeHostname.length <= 20) return activeHostname;
        return `${activeHostname.slice(0, 20)}...`;
    }, [activeHostname]);

    const statusText = React.useMemo(() => {
        if (manualRtlSettings.enabled === 'disabled') {
            return 'غیرفعال';
        }
        if (manualRtlSettings.enabled === 'enabled') {
            switch (manualRtlSettings.manualRtlSiteMode) {
                case 'all':
                    return 'فعال برای همه سایت‌ها';
                case 'ai_sites':
                    return 'فعال برای سایت‌های هوش مصنوعی';
                case 'allowed_sites':
                    return 'فعال برای سایت‌های مجاز';
                case 'ai_and_allowed':
                    return (
                        <>
                            فعال برای هوش مصنوعی‌ها<br />
                            و سایت‌های مجاز
                        </>
                    );
                default:
                    return 'فعال';
            }
        }
        if (manualRtlSettings.enabled === 'allowed_sites') {
            return 'فعال برای سایت‌های مجاز';
        }
        return 'غیرفعال';
    }, [manualRtlSettings.enabled, manualRtlSettings.manualRtlSiteMode]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        onManualRtlSettingsChange({
            ...manualRtlSettings,
            enabled: isChecked ? 'enabled' : 'disabled',
            manualRtlEnabled: isChecked
        });
    };

    return (
        <>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 1.2,
                borderRadius: 1,
                background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                border: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.3)'
                    : '1px solid rgba(30, 64, 175, 0.2)',
                mx: 2
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img
                        src={chrome.runtime.getURL('/images/p logo 100.png')}
                        alt="Manual RTL"
                        style={{
                            width: 20,
                            height: 20
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: '0.7rem',
                            fontWeight: 400,
                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                            fontFamily: 'iranyekan'
                        }}
                    >
                        راست چین دستی
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: manualRtlSettings.enabled === 'enabled' && manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                ? '0.55rem'
                                : '0.65rem',
                            fontWeight: 400,
                            color: manualRtlSettings.enabled === 'disabled'
                                ? (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
                                : (isDarkMode ? '#4caf50' : '#2e7d32'),
                            fontFamily: 'iranyekan',
                            lineHeight: manualRtlSettings.enabled === 'enabled' && manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                ? 1.3
                                : 1.5,
                            whiteSpace: manualRtlSettings.enabled === 'enabled' && manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                ? 'normal'
                                : 'nowrap'
                        }}
                    >
                        {statusText}
                    </Typography>
                    <a
                        href={chrome.runtime.getURL('options.html#manual-rtl')}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                p: 0.5,
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                '&:hover': {
                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)'
                                }
                            }}
                        >
                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                <path d={mdiCog} />
                            </SvgIcon>
                        </IconButton>
                    </a>
                </Box>
            </Box>

           
            <Box
                sx={{
                    borderTop: isDarkMode
                        ? '1px solid rgba(0, 233, 255, 0.3)'
                        : '1px solid rgba(30, 64, 175, 0.2)'
                }}
            >
                {activeHostname ? (
                    <FormControlLabel
                        sx={{
                            pt: 1.5,
                            pb: 0,
                            m: 0,
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            justifyContent: 'space-between'
                        }}
                        control={
                            <Checkbox
                                checked={manualRtlSettings.manualRtlEnabled !== false && manualRtlSettings.enabled !== 'disabled'}
                                onChange={handleCheckboxChange}
                                sx={{
                                    p: 0,
                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    '&.Mui-checked': {
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb'
                                    }
                                }}
                            />
                        }
                        label={
                            <Typography
                                variant="body2"
                                component="div"
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    color: isDarkMode ? '#ffffff' : '#1e293b',
                                    fontFamily: 'iranyekan',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 0.5
                                }}
                            >
                                <span>برای</span>
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.4,
                                        px: 0.8,
                                        py: 0.2,
                                        borderRadius: 1,
                                        backgroundColor: isDarkMode
                                            ? 'rgba(0, 233, 255, 0.08)'
                                            : 'rgba(30, 64, 175, 0.08)'
                                    }}
                                >
                                    {hasSiteDetails ? (
                                        <img
                                            src={faviconSrc}
                                            alt={activeHostname}
                                            style={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: 3,
                                                border: isDarkMode
                                                    ? '1px solid rgba(255, 255, 255, 0.2)'
                                                    : '1px solid rgba(30, 64, 175, 0.2)'
                                            }}
                                        />
                                    ) : (
                                        <SvgIcon
                                            sx={{
                                                fontSize: '0.85rem',
                                                color: isDarkMode ? '#00e9ff' : '#1c39bb'
                                            }}
                                        >
                                            <path d={mdiWeb} />
                                        </SvgIcon>
                                    )}
                                    <span style={{ fontWeight: 600 }} title={activeHostname}>{displayHostname}</span>
                                </Box>
                                <span>راست چین دستی فعال شود؟</span>
                            </Typography>
                        }
                        labelPlacement="start"
                    />
                ) : activeTabInfo?.tabId != null ? (
                    <Box
                        sx={{
                            pt: 1.6,
                            pb: 0.2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.3,
                            textAlign: 'center'
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                fontFamily: 'iranyekan'
                            }}
                        >
                            صفحه رو رفرش کنید
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: 400,
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                                fontFamily: 'iranyekan',
                                opacity: 0.8
                            }}
                        >
                            اگر بعد از رفرش باز هم این پیام رو دیدید، یعنی روی این سایت امکان فعال‌سازی وجود ندارد
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            pt: 1.2,
                            pb: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                fontFamily: 'iranyekan'
                            }}
                        >
                            سایتی پیدا نشد
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
        <Box
            sx={{
                mx: 2,
                mt: 1,
                px: 1,
                py: 0.8,
                textAlign: 'center'
            }}
        >
            <Typography
                variant="body2"
                component="div"
                sx={{
                    fontSize: '0.65rem',
                    fontWeight: 400,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    fontFamily: 'iranyekan',
                    lineHeight: 1.5
                }}
            >
                فعال یا غیر فعال بودن <span style={{ fontWeight: 900 }}>راست‌چین دستی</span> هیچ ارتباطی با <span style={{ fontWeight: 900 }}>الگوریتم هوشمند</span> نداره و دو قابلیت <span style={{ fontWeight: 900 }}>جدا از هم</span> هستند
            </Typography>
        </Box>
    </>
    );
};

export default ManualRtlBanner;

