import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    SvgIcon,
    Button
} from '@mui/material';
import { mdiCog } from '@mdi/js';
import { ManualRtlSettings } from '../types/manualRtl';
import SiteActivationSection, { ActiveTabInfoSnapshot } from './SiteActivationSection';
import { isFirefoxRuntime } from '../utils/isFirefox';

interface ManualRtlBannerProps {
    isDarkMode: boolean;
    manualRtlSettings: ManualRtlSettings;
    onManualRtlSettingsChange: (settings: ManualRtlSettings) => void;
    manualRtlInfoDismissed: boolean;
    onManualRtlInfoDismissedChange: (dismissed: boolean) => void;
}

const ManualRtlBanner: React.FC<ManualRtlBannerProps> = ({
    isDarkMode,
    manualRtlSettings,
    onManualRtlSettingsChange,
    manualRtlInfoDismissed,
    onManualRtlInfoDismissedChange
}) => {
    const [activeTabInfo, setActiveTabInfo] = React.useState<ActiveTabInfoSnapshot | null>(null);
    const [isValidHttpPage, setIsValidHttpPage] = React.useState<boolean | null>(null);
    const [showInfoText, setShowInfoText] = React.useState<boolean>(false);

    // Show if not dismissed
    React.useEffect(() => {
        if (!manualRtlInfoDismissed) {
            setShowInfoText(true);
        }
    }, [manualRtlInfoDismissed]);

    // Check if current tab is http/https
    React.useEffect(() => {
        const checkTabUrl = async () => {
            try {
                const hasPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
                if (!hasPermission) {
                    setIsValidHttpPage(null);
                    return;
                }

                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs && tabs.length > 0 && tabs[0].url) {
                    const url = tabs[0].url;
                    try {
                        const urlObj = new URL(url);
                        const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
                        setIsValidHttpPage(isValid);
                    } catch {
                        setIsValidHttpPage(false);
                    }
                } else {
                    setIsValidHttpPage(null);
                }
            } catch (error) {
                setIsValidHttpPage(null);
            }
        };

        checkTabUrl();
    }, []);

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
                        return;
                    }
                    if (response?.success) {
                        setActiveTabInfo(response.tabInfo || null);
                    } else {
                        setActiveTabInfo(null);
                    }
                });
            } catch (error) {
                // Silently handle errors
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
        if (activeHostname.length <= 17) return activeHostname;
        return `${activeHostname.slice(0, 17)}...`;
    }, [activeHostname]);
    
    // Firefox: all-sites access, no allowlist UI
    const shouldShowSiteSection = React.useMemo(() => {
        if (isFirefoxRuntime()) return false;
        return manualRtlSettings.manualRtlEnabled && 
               (manualRtlSettings.manualRtlSiteMode === 'allowed_sites' || 
                manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed');
    }, [manualRtlSettings.manualRtlEnabled, manualRtlSettings.manualRtlSiteMode]);

    const statusText = React.useMemo(() => {
        if (!manualRtlSettings.manualRtlEnabled) {
            return 'غیرفعال';
        }
        if (isFirefoxRuntime()) {
            return 'فعال برای همه سایت‌ها';
        }
        switch (manualRtlSettings.manualRtlSiteMode) {
            case 'all':
                return 'فعال برای همه سایت‌ها';
            case 'ai_sites':
                return 'فعال برای سایت‌های هوش مصنوعی';
            case 'allowed_sites':
                // return 'فعال برای سایت‌های مجاز';
                return 'فعال';
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
    }, [manualRtlSettings.manualRtlEnabled, manualRtlSettings.manualRtlSiteMode]);

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
                    pb: shouldShowSiteSection ? 1.5 : 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img
                        src={chrome.runtime.getURL('/images/logo/p logo 100.png')}
                        alt="Manual RTL"
                        style={{
                            width: 20,
                            height: 20
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                        <Typography
                            component="span"
                            sx={{
                                fontSize: '0.55rem',
                                fontWeight: 400,
                                color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                fontFamily: 'iranyekan',
                                opacity: 0.8
                            }}
                        >
                              (همه سایت ها)
                        </Typography>
                    </Box>
                    <Box component="span" sx={{ 
                        px: 1, 
                        py: 0.3, 
                        bgcolor: isDarkMode 
                            ? 'rgba(255, 152, 0, 0.2)' 
                            : 'rgba(255, 152, 0, 0.15)',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 152, 0, 0.4)'}`,
                        color: isDarkMode ? '#ff9800' : '#f57c00', 
                        borderRadius: 1, 
                        fontSize: '0.6rem',
                        fontWeight: 600
                    }}>
                        آزمایشی
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!manualRtlSettings.manualRtlEnabled ? (
                        <a
                            href={chrome.runtime.getURL('options.html#manual-rtl')}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none'
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 400,
                                    color: isDarkMode ? '#f44336' : '#d32f2f',
                                    fontFamily: 'iranyekan',
                                    lineHeight: 1.5,
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                {statusText}
                            </Typography>
                        </a>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                    ? '0.55rem'
                                    : '0.65rem',
                                fontWeight: 400,
                                color: isDarkMode ? '#4caf50' : '#2e7d32',
                                fontFamily: 'iranyekan',
                                lineHeight: manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                    ? 1.3
                                    : 1.5,
                                whiteSpace: manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                    ? 'normal'
                                    : 'nowrap'
                            }}
                        >
                            {statusText}
                        </Typography>
                    )}
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
           
            {shouldShowSiteSection && (
                <>
                    {isValidHttpPage === false ? (
                        <Box
                            sx={{
                                borderTop: isDarkMode
                                    ? '1px solid rgba(0, 233, 255, 0.3)'
                                    : '1px solid rgba(30, 64, 175, 0.2)',
                                pt: 1.5,
                                pb: 1,
                                px: 1.5,
                                textAlign: 'center'
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    color: isDarkMode ? '#f44336' : '#d32f2f',
                                    fontFamily: 'iranyekan'
                                }}
                            >
                                برای این صفحه قابل فعال‌سازی نیست
                            </Typography>
                        </Box>
                    ) : (
                        <SiteActivationSection
                            isDarkMode={isDarkMode}
                            activeHostname={activeHostname}
                            activeTabInfo={activeTabInfo}
                            manualRtlSettings={manualRtlSettings}
                            hasSiteDetails={hasSiteDetails}
                            faviconSrc={faviconSrc}
                            displayHostname={displayHostname}
                        />
                    )}
                </>
            )}
        </Box>
        {showInfoText && (
            <>
                <Box sx={{ 
                    mx: 2, 
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Typography
                        variant="body2"
                        component="div"
                        sx={{
                            fontSize: '0.7rem',
                            fontWeight: 400,
                            fontFamily: 'iranyekan',
                            lineHeight: 1.6,
                            flex: 1,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                        }}
                    >
                        فعال یا غیر فعال بودن <span style={{ fontWeight: 900 }}>راست‌چین دستی</span> هیچ ارتباطی با <span style={{ fontWeight: 900 }}>الگوریتم هوشمند</span> ندارد و دو قابلیت <span style={{ fontWeight: 900 }}>جدا از هم</span> هستند
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => {
                            setShowInfoText(false);
                            onManualRtlInfoDismissedChange(true);
                        }}
                        sx={{
                            fontSize: '0.7rem',
                            fontFamily: 'iranyekan',
                            textTransform: 'none',
                            minWidth: 'auto',
                            whiteSpace: 'nowrap',
                            borderRadius: '6px !important',
                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                            '&:hover': {
                                color: isDarkMode ? '#4dd4ff' : '#3b82f6',
                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)'
                            }
                        }}
                    >
                        متوجه شدم
                    </Button>
                </Box>
                <Box
                    sx={{
                        mx: 2,
                        mt: 1,
                        borderTop: isDarkMode
                            ? '1px solid rgba(0, 233, 255, 0.2)'
                            : '1px solid rgba(30, 64, 175, 0.15)'
                    }}
                />
            </>
        )}
    </>
    );
};

export default ManualRtlBanner;

