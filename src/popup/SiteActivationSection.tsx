import React from 'react';
import {
    Box,
    Typography,
    SvgIcon,
    Checkbox,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import { mdiWeb } from '@mdi/js';
import { ManualRtlSettings, ManualRtlActiveSite } from '../types/manualRtl';
import { hasHostPermission } from '../utils/hasHostPermission';
import { sendRuntimeMessage } from '../utils/chromeMessaging.js';
import { useI18n } from '../i18n';

interface ActiveTabInfoSnapshot {
    tabId: number | null;
    hostname: string;
    favicon: string;
    hasHostname?: boolean;
    activatedAt?: number;
    lastUpdatedAt?: number;
}

interface SiteActivationSectionProps {
    isDarkMode: boolean;
    activeHostname: string;
    activeTabInfo: ActiveTabInfoSnapshot | null;
    manualRtlSettings: ManualRtlSettings;
    hasSiteDetails: boolean;
    faviconSrc: string;
    displayHostname: string;
}

const SiteActivationSection: React.FC<SiteActivationSectionProps> = ({
    isDarkMode,
    activeHostname,
    activeTabInfo,
    manualRtlSettings,
    hasSiteDetails,
    faviconSrc,
    displayHostname
}) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [activeSites, setActiveSites] = React.useState<ManualRtlActiveSite[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [permissionModalOpen, setPermissionModalOpen] = React.useState(false);
    const [hasPermission, setHasPermission] = React.useState(false);
    const [isUnsupportedSite, setIsUnsupportedSite] = React.useState(false);
    
    // Get browser language and determine "Allow" button text
    const getAllowButtonText = React.useMemo(() => {
        const browserLang = navigator.language || navigator.languages?.[0] || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase();
        if (langCode === 'fa') {
            return t('shared.allowFa');
        }
        if (langCode === 'ar') {
            return t('shared.allowAr');
        }
        return t('shared.allowEn');
    }, [t]);
    
    // Function to check permission (can be called from anywhere)
    const checkPermission = React.useCallback(async () => {
        if (!activeHostname) {
            setHasPermission(false);
            return;
        }

        try {
            const origins = [`*://${activeHostname}/*`];
            const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
            const hasOrigin = await hasHostPermission(origins);
            setHasPermission(hasScripting && hasOrigin);
        } catch (error) {
            setHasPermission(false);
        }
    }, [activeHostname]);

    // Load active sites list and check permissions
    React.useEffect(() => {
        const loadActiveSites = () => {
            chrome.storage.sync.get(['manualRtlActiveSites'], (result) => {
                const sites = result.manualRtlActiveSites || [];
                setActiveSites(sites);
                setIsLoading(false);
            });
        };

        loadActiveSites();


        // Check if site is unsupported (e.g., extensions gallery)
        const checkUnsupportedSite = () => {
            if (!activeHostname) {
                setIsUnsupportedSite(false);
                return;
            }
            chrome.storage.local.get(['manualRtlUnsupportedSites'], (result) => {
                const unsupportedSites = result.manualRtlUnsupportedSites || [];
                setIsUnsupportedSite(unsupportedSites.includes(activeHostname));
            });
        };

        checkPermission();
        checkUnsupportedSite();

        // Listen for storage changes
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.manualRtlActiveSites) {
                const sites = changes.manualRtlActiveSites.newValue || [];
                setActiveSites(sites);
            }
            if (changes.manualRtlUnsupportedSites && activeHostname) {
                const unsupportedSites = changes.manualRtlUnsupportedSites.newValue || [];
                setIsUnsupportedSite(unsupportedSites.includes(activeHostname));
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [activeHostname, checkPermission]);

    // Check if current site is in active list and has permission
    const isSiteActive = React.useMemo(() => {
        if (!activeHostname) return false;
        const isInList = activeSites.some(site => site.hostname === activeHostname);
        // Site is active if it's in the list AND has permission
        return isInList && hasPermission;
    }, [activeHostname, activeSites, hasPermission]);

    // Toggle site in active list
    const handleToggleSite = async () => {
        if (!activeHostname) return;

        const isCurrentlyActive = isSiteActive;
        const enable = !isCurrentlyActive;

        if (enable) {
            // Check if permission already exists first
            try {
                const origins = [`*://${activeHostname}/*`];
                const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
                const hasOrigin = await hasHostPermission(origins);
                const currentHasPermission = hasScripting && hasOrigin;
                
                if (!currentHasPermission) {
                    // Permission doesn't exist, show modal to request it
                    setPermissionModalOpen(true);
                    return;
                }
                
                // Permission exists, proceed with adding site
                chrome.storage.sync.get(['manualRtlActiveSites'], async (result) => {
                    try {
                        const currentSites = result.manualRtlActiveSites || [];
                        
                        const siteExists = currentSites.some((site: ManualRtlActiveSite) => site.hostname === activeHostname);
                        if (siteExists) {
                            // Site already in list and has permission, just update state
                            setActiveSites(currentSites);
                            await checkPermission();
                            return;
                        }
                        
                        // Add site to list
                        const newSite: ManualRtlActiveSite = {
                            hostname: activeHostname,
                            favicon: faviconSrc || undefined,
                            addedAt: Date.now()
                        };
                        const updatedSites = [...currentSites, newSite];
                        
                        await chrome.storage.sync.set({ 
                            manualRtlActiveSites: updatedSites
                        });
                        
                        setActiveSites(updatedSites);
                        await checkPermission();
                    } catch (error) {
                        // Silently handle errors
                    }
                });
            } catch (error) {
                // On error, show modal as fallback
                setPermissionModalOpen(true);
            }
        } else {
            // Remove site directly from popup (no permission needed, no background call)
            try {
                chrome.storage.sync.get(['manualRtlActiveSites'], async (result) => {
                    const currentSites = result.manualRtlActiveSites || [];
                    
                    // Remove site from list
                    const updatedSites = currentSites.filter((site: ManualRtlActiveSite) => site.hostname !== activeHostname);
                    
                    await chrome.storage.sync.set({ 
                        manualRtlActiveSites: updatedSites
                    });
                    
                    // Update local state
                    setActiveSites(updatedSites);
                });
            } catch (error) {
                // Silently handle errors
            }
        }
    };


    return (
        <>
        <Box
            sx={{
                borderTop: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.3)'
                    : '1px solid rgba(56, 122, 242, 0.2)'
            }}
        >
            {activeHostname ? (
                <>
                    {isUnsupportedSite ? (
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
                                {t('siteActivation.unsupported')}
                            </Typography>
                        </Box>
                    ) : (
                        <FormControlLabel
                            sx={{
                                pt: 1.5,
                                pb: 0,
                                m: 0,
                                display: 'flex',
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                                '& .MuiFormControlLabel-label': {
                                    userSelect: 'none'
                                }
                            }}
                            control={
                                <Checkbox
                                    checked={isSiteActive}
                                    onChange={handleToggleSite}
                                    disabled={isLoading}
                                    sx={{
                                        p: 0,
                                        color: isDarkMode ? '#00e9ff' : '#387af2',
                                        '&.Mui-checked': {
                                            color: isDarkMode ? '#00e9ff' : '#387af2'
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
                                    <span>{t('siteActivation.forPrefix')}</span>
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
                                                : 'rgba(56, 122, 242, 0.08)'
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
                                                        : '1px solid rgba(56, 122, 242, 0.2)'
                                                }}
                                            />
                                        ) : (
                                            <SvgIcon
                                                sx={{
                                                    fontSize: '0.85rem',
                                                    color: isDarkMode ? '#00e9ff' : '#387af2'
                                                }}
                                            >
                                                <path d={mdiWeb} />
                                            </SvgIcon>
                                        )}
                                        <span style={{ fontWeight: 600 }} title={activeHostname}>{displayHostname}</span>
                                    </Box>
                                    <span>{t('siteActivation.activateSuffix')}</span>
                                </Typography>
                            }
                            labelPlacement="start"
                        />
                    )}
                
                </>
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
                        {t('siteActivation.refresh')}
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
                        {t('siteActivation.refreshHint')}
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
                        {t('siteActivation.noSite')}
                    </Typography>
                </Box>
            )}
        </Box>
        
        {/* Permission Required Modal */}
        <Dialog 
            open={permissionModalOpen} 
            onClose={() => setPermissionModalOpen(false)}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    padding: '8px'
                }
            }}
        >
            <DialogTitle style={{ direction: dir, textAlign: contentAlign, fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                {t('siteActivation.needPermission')}
            </DialogTitle>
            <DialogContent style={{ direction: dir, textAlign: dir === 'rtl' ? 'justify' : 'left', padding: '8px 16px' }}>
                <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: dir === 'rtl' ? 'justify' : 'left', lineHeight: 1.8 }}
                >
                    {t('siteActivation.permissionIntro', { site: displayHostname || activeHostname })}
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: dir === 'rtl' ? 'justify' : 'left', lineHeight: 1.8 }}
                >
                    {t('siteActivation.permissionSteps', { allow: getAllowButtonText })}
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: dir === 'rtl' ? 'justify' : 'left', lineHeight: 1.8 }}
                >
                    {t('siteActivation.permissionPurpose')}
                </Typography>
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                <Button 
                    onClick={() => setPermissionModalOpen(false)}
                    variant="text"
                    color="primary"
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    {t('siteActivation.close')}
                </Button>
                <Button 
                    onClick={async () => {
                        try {
                            if (!activeHostname) {
                                setPermissionModalOpen(false);
                                return;
                            }
                            
                            // Request permission through background script
                            try {
                                const response = await sendRuntimeMessage({
                                    action: 'toggleManualRtlSite',
                                    hostname: activeHostname,
                                    favicon: faviconSrc || undefined
                                });
                                
                                if (!response || !response.success) {
                                    setPermissionModalOpen(false);
                                    return;
                                }
                                
                                // Update state regardless of whether site was already in list
                                chrome.storage.sync.get(['manualRtlActiveSites'], async (result) => {
                                    const currentSites = result.manualRtlActiveSites || [];
                                    setActiveSites(currentSites);
                                    await checkPermission();
                                });
                                
                                setPermissionModalOpen(false);
                            } catch (error) {
                                // Silently handle connection errors
                                setPermissionModalOpen(false);
                            }
                        } catch (error) {
                            setPermissionModalOpen(false);
                        }
                    }}
                    variant="contained"
                    color="primary"
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    {t('siteActivation.grantPermission')}
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
};

export default SiteActivationSection;
export type { ActiveTabInfoSnapshot };

