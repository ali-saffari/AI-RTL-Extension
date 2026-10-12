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
import { sendRuntimeMessage } from '../utils/chromeMessaging.js';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { useI18n } from '../i18n';

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
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
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
            void sendRuntimeMessage({ action: 'getActiveTabInfo' }).then((response) => {
                if (!isMounted) {
                    return;
                }
                if (response?.success) {
                    setActiveTabInfo(response.tabInfo || null);
                } else {
                    setActiveTabInfo(null);
                }
            });
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
    
    // Firefox: supported AI sites only, no allowlist UI
    const shouldShowSiteSection = React.useMemo(() => {
        if (isFirefoxRuntime()) return false;
        return manualRtlSettings.manualRtlEnabled && 
               (manualRtlSettings.manualRtlSiteMode === 'allowed_sites' || 
                manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed');
    }, [manualRtlSettings.manualRtlEnabled, manualRtlSettings.manualRtlSiteMode]);

    const statusText = React.useMemo(() => {
        if (!manualRtlSettings.manualRtlEnabled) {
            return t('manualRtl.inactive');
        }
        if (isFirefoxRuntime()) {
            return t('manualRtl.activeForAi');
        }
        switch (manualRtlSettings.manualRtlSiteMode) {
            case 'all':
                return t('manualRtl.activeForAll');
            case 'ai_sites':
                return t('manualRtl.activeForAi');
            case 'allowed_sites':
                return t('manualRtl.active');
            case 'ai_and_allowed':
                return (
                    <>
                        {t('manualRtl.activeAiLine')}<br />
                        {t('manualRtl.activeAllowedLine')}
                    </>
                );
            default:
                return t('manualRtl.active');
        }
    }, [manualRtlSettings.manualRtlEnabled, manualRtlSettings.manualRtlSiteMode, t]);

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
                    : 'linear-gradient(135deg, rgba(56, 122, 242, 0.08) 0%, rgba(56, 122, 242, 0.03) 100%)',
                border: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.3)'
                    : '1px solid rgba(56, 122, 242, 0.2)',
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
                                color: isDarkMode ? '#00e9ff' : '#387af2',
                                fontFamily: 'iranyekan'
                            }}
                        >
                            {t('manualRtl.title')}
                        </Typography>
                    </Box>
                    <Box component="span" sx={{ 
                        px: 0.5, 
                        py: 0,
                        lineHeight: 1.45,
                        bgcolor: isDarkMode 
                            ? 'rgba(255, 152, 0, 0.2)' 
                            : 'rgba(255, 152, 0, 0.15)',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 152, 0, 0.4)'}`,
                        color: isDarkMode ? '#ff9800' : '#f57c00', 
                        borderRadius: '3px', 
                        fontSize: '0.5rem',
                        fontWeight: 500
                    }}>
                        {t('manualRtl.experimental')}
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
                                    color: isDarkMode ? '#00e9ff' : '#387af2',
                                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.1)'
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
                                    : '1px solid rgba(56, 122, 242, 0.2)',
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
                                {t('manualRtl.notActivable')}
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
                        {(() => {
                            const boldTerms = [
                                t('manualRtl.infoManual'),
                                t('manualRtl.infoAlgorithm'),
                                t('manualRtl.infoSeparate'),
                            ];
                            const pattern = new RegExp(`(${boldTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
                            return t('manualRtl.info').split(pattern).map((part, index) => (
                                boldTerms.includes(part)
                                    ? <span key={`info-${index}`} style={{ fontWeight: 900 }}>{part}</span>
                                    : <React.Fragment key={`info-${index}`}>{part}</React.Fragment>
                            ));
                        })()}
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
                            color: isDarkMode ? '#00e9ff' : '#387af2',
                            '&:hover': {
                                color: isDarkMode ? '#4dd4ff' : '#3b82f6',
                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.1)'
                            }
                        }}
                    >
                        {t('manualRtl.understood')}
                    </Button>
                </Box>
                <Box
                    sx={{
                        mx: 2,
                        mt: 1,
                        borderTop: isDarkMode
                            ? '1px solid rgba(0, 233, 255, 0.2)'
                            : '1px solid rgba(56, 122, 242, 0.15)'
                    }}
                />
            </>
        )}
    </>
    );
};

export default ManualRtlBanner;

