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
    const [activeSites, setActiveSites] = React.useState<ManualRtlActiveSite[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [permissionModalOpen, setPermissionModalOpen] = React.useState(false);
    const [hasPermission, setHasPermission] = React.useState(false);

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

        // Check permission for current site
        const checkPermission = async () => {
            if (!activeHostname) {
                setHasPermission(false);
                return;
            }

            try {
                const origins = [`*://${activeHostname}/*`];
                const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
                const hasOrigin = await chrome.permissions.contains({ origins: origins });
                setHasPermission(hasScripting && hasOrigin);
            } catch (error) {
                console.error('[SiteActivationSection] Error checking permission:', error);
                setHasPermission(false);
            }
        };

        checkPermission();

        // Listen for storage changes
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.manualRtlActiveSites) {
                const sites = changes.manualRtlActiveSites.newValue || [];
                setActiveSites(sites);
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [activeHostname]);

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
                const hasOrigin = await chrome.permissions.contains({ origins: origins });
                const currentHasPermission = hasScripting && hasOrigin;
                
                if (!currentHasPermission) {
                    // Permission doesn't exist, show modal to request it
                    setPermissionModalOpen(true);
                    return;
                }
                
                // Permission exists, proceed with adding site
                chrome.storage.sync.get(['manualRtlActiveSites', 'manualRtlSettings'], async (result) => {
                    try {
                        const manualRtlSettings = result.manualRtlSettings || {};
                        const currentSites = manualRtlSettings.activeSites || result.manualRtlActiveSites || [];
                        
                        const siteExists = currentSites.some((site: ManualRtlActiveSite) => site.hostname === activeHostname);
                        if (siteExists) {
                            // Site already in list and has permission, just update state
                            setActiveSites(currentSites);
                            setHasPermission(true);
                            return;
                        }
                        
                        // Add site to list
                        const newSite: ManualRtlActiveSite = {
                            hostname: activeHostname,
                            favicon: faviconSrc || undefined,
                            addedAt: Date.now()
                        };
                        const updatedSites = [...currentSites, newSite];
                        
                        const updatedSettings = {
                            ...manualRtlSettings,
                            activeSites: updatedSites
                        };
                        
                        await chrome.storage.sync.set({ 
                            manualRtlActiveSites: updatedSites,
                            manualRtlSettings: updatedSettings
                        });
                        
                        setActiveSites(updatedSites);
                        setHasPermission(true);
                    } catch (error) {
                        console.error('[SiteActivationSection] Error adding site:', error);
                    }
                });
            } catch (error) {
                console.error('[SiteActivationSection] Error checking permission:', error);
                // On error, show modal as fallback
                setPermissionModalOpen(true);
            }
        } else {
            // Remove site directly from popup (no permission needed, no background call)
            try {
                chrome.storage.sync.get(['manualRtlActiveSites', 'manualRtlSettings'], async (result) => {
                    const manualRtlSettings = result.manualRtlSettings || {};
                    const currentSites = manualRtlSettings.activeSites || result.manualRtlActiveSites || [];
                    
                    // Remove site from list
                    const updatedSites = currentSites.filter((site: ManualRtlActiveSite) => site.hostname !== activeHostname);
                    
                    // Update both manualRtlActiveSites and manualRtlSettings.activeSites
                    const updatedSettings = {
                        ...manualRtlSettings,
                        activeSites: updatedSites
                    };
                    
                    await chrome.storage.sync.set({ 
                        manualRtlActiveSites: updatedSites,
                        manualRtlSettings: updatedSettings
                    });
                    
                    // Update local state
                    setActiveSites(updatedSites);
                });
            } catch (error) {
                console.error('[SiteActivationSection] Error removing site:', error);
            }
        }
    };


    return (
        <>
        <Box
            sx={{
                borderTop: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.3)'
                    : '1px solid rgba(30, 64, 175, 0.2)'
            }}
        >
            {activeHostname ? (
                <>
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
            <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                نیاز به مجوز
            </DialogTitle>
            <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
                <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                >
                    برای فعال کردن راست‌چین دستی روی <strong>{displayHostname || activeHostname}</strong>، نیاز به مجوز دسترسی به این سایت دارید.
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                >
                    افزونه برای اعمال راست‌چین دستی روی این سایت به مجوز Scripting نیاز دارد. این مجوز فقط برای اعمال تغییرات روی صفحه استفاده می‌شود و هیچ داده‌ای جمع‌آوری نمی‌شود.
                </Typography>
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                <Button 
                    onClick={async () => {
                        try {
                            if (!activeHostname) {
                                setPermissionModalOpen(false);
                                return;
                            }
                            
                            console.log('[SiteActivationSection] Requesting permission for:', activeHostname);
                            
                            // Request permission directly in popup (user gesture context)
                            const origins = [`*://${activeHostname}/*`];
                            const permissions = ['scripting'];
                            
                            try {
                                const granted = await chrome.permissions.request({ permissions, origins });
                                console.log('[SiteActivationSection] Permission request result:', granted);
                                
                                if (!granted) {
                                    console.log('[SiteActivationSection] Permission denied by user');
                                    setPermissionModalOpen(false);
                                    return;
                                }
                                
                                // Permission granted, add site to list
                                chrome.storage.sync.get(['manualRtlActiveSites', 'manualRtlSettings'], async (result) => {
                                    try {
                                        const manualRtlSettings = result.manualRtlSettings || {};
                                        const currentSites = manualRtlSettings.activeSites || result.manualRtlActiveSites || [];
                                        
                                        const siteExists = currentSites.some((site: ManualRtlActiveSite) => site.hostname === activeHostname);
                                        if (siteExists) {
                                            // Site already in list, just update state
                                            console.log('[SiteActivationSection] Site already in list');
                                            setActiveSites(currentSites);
                                            setHasPermission(true);
                                            setPermissionModalOpen(false);
                                            return;
                                        }
                                        
                                        // Add site to list
                                        const newSite: ManualRtlActiveSite = {
                                            hostname: activeHostname,
                                            favicon: faviconSrc || undefined,
                                            addedAt: Date.now()
                                        };
                                        const updatedSites = [...currentSites, newSite];
                                        
                                        const updatedSettings = {
                                            ...manualRtlSettings,
                                            activeSites: updatedSites
                                        };
                                        
                                        await chrome.storage.sync.set({ 
                                            manualRtlActiveSites: updatedSites,
                                            manualRtlSettings: updatedSettings
                                        });
                                        
                                        console.log('[SiteActivationSection] Site added to list');
                                        setActiveSites(updatedSites);
                                        setHasPermission(true);
                                        setPermissionModalOpen(false);
                                    } catch (error) {
                                        console.error('[SiteActivationSection] Error adding site:', error);
                                        setPermissionModalOpen(false);
                                    }
                                });
                            } catch (error) {
                                console.error('[SiteActivationSection] Error requesting permission:', error);
                                setPermissionModalOpen(false);
                            }
                        } catch (error) {
                            console.error('[SiteActivationSection] Error in permission request:', error);
                            setPermissionModalOpen(false);
                        }
                    }}
                    variant="contained"
                    color="primary"
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    دریافت مجوز
                </Button>
                <Button 
                    onClick={() => setPermissionModalOpen(false)}
                    variant="text"
                    color="primary"
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    بستن
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
};

export default SiteActivationSection;
export type { ActiveTabInfoSnapshot };

