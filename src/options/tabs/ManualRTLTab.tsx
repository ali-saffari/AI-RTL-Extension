import React from 'react';
import {
    Paper,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Divider,
    useTheme,
    Card,
    CardContent,
    Grid,
    Switch,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SvgIcon,
    IconButton
} from '@mui/material';
import { mdiChevronDown, mdiDelete, mdiWeb } from '@mdi/js';
import { ManualRtlSettings, ManualRtlActiveSite } from '../../types/manualRtl';
import { isFirefoxRuntime } from '../../utils/isFirefox';
import { ManualRTLGuide } from './ManualRTLGuide';
import { useI18n } from '../../i18n';

interface ManualRTLTabProps {
    manualRtlSettings: ManualRtlSettings;
    onManualRtlSettingsChange: (settings: ManualRtlSettings) => void;
    isDarkMode: boolean;
}

// کامپوننت منو
interface MenuPreviewProps {
    menuDisplayMode?: 'logo_first' | 'menu_direct';
    isExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ menuDisplayMode = 'logo_first', isExpanded: externalIsExpanded, onExpandedChange }) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [internalIsExpanded, setInternalIsExpanded] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    
    // استفاده از external state اگر ارائه شده باشد، در غیر این صورت از internal state
    const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
    const setIsExpanded = onExpandedChange || setInternalIsExpanded;

    // در حالت logo_first: اگر expanded نباشد minimized است
    // در حالت menu_direct همیشه expanded باشد (منو همیشه باز)
    const isMinimized = menuDisplayMode === 'logo_first' && !isExpanded;

    // Handle click outside - فقط برای حالت logo_first (که در آینده ممکن است نیاز باشد)
    // در حالت menu_direct منو همیشه باز می‌ماند
    React.useEffect(() => {
        if (menuDisplayMode === 'logo_first' && isExpanded) {
            const handleClickOutside = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    setIsExpanded(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [menuDisplayMode, isExpanded]);

    const handleLogoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // فقط در حالت logo_first می‌توان منو را باز/بسته کرد
        if (menuDisplayMode === 'logo_first') {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '10px',
                fontFamily: 'iranyekan, "IRANYekan", Tahoma, Arial, sans-serif',
                overflow: 'hidden',
                minWidth: isMinimized ? 'auto' : '130px',
                width: isMinimized ? '30px' : 'auto',
                zIndex: 1000
            }}
        >
            {/* Header با لوگو */}
            <div
                onClick={handleLogoClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMinimized ? 'center' : 'space-between',
                    padding: isMinimized ? '6px' : '6px 10px',
                    backgroundColor: '#f9fafb',
                    borderBottom: isMinimized ? 'none' : '1px solid #e5e7eb',
                    cursor: menuDisplayMode === 'menu_direct' ? 'pointer' : 'default',
                    height: isMinimized ? '28px' : 'auto',
                    width: isMinimized ? '28px' : '100%',
                    borderRadius: isMinimized ? '6px' : '6px 6px 0 0'
                }}
            >
                <img
                    src={chrome.runtime?.getURL ? chrome.runtime.getURL('images/logo/ai-rtl-logo.png') : '/images/logo/ai-rtl-logo.png'}
                    alt="RTL Extension"
                    style={{
                        width: isMinimized ? '20px' : '18px',
                        height: isMinimized ? '20px' : '18px',
                        objectFit: 'contain'
                    }}
                />
                {!isMinimized && (
                    <span
                        style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            cursor: 'pointer'
                        }}
                    >
                        ⚙️
                    </span>
                )}
            </div>
            
            {/* Menu Body - وقتی menu_direct است یا وقتی logo_first و expanded است */}
            {((menuDisplayMode === 'menu_direct') || (menuDisplayMode === 'logo_first' && isExpanded)) && (
                <div
                    style={{
                        padding: '2px 0',
                        maxHeight: '500px',
                        overflow: 'hidden'
                    }}
                >
                    <button
                        type="button"
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            width: '100%',
                            textAlign: contentAlign,
                            fontSize: '12px',
                            fontFamily: 'iranyekan, "IRANYekan", Tahoma, Arial, sans-serif',
                            color: '#374151',
                            display: 'block',
                            lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {t('manualRtlTab.rtl')}
                    </button>
                    <div
                        style={{
                            height: '1px',
                            backgroundColor: '#e5e7eb',
                            margin: '1px 0'
                        }}
                    />
                    <button
                        type="button"
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            width: '100%',
                            textAlign: contentAlign,
                            fontSize: '12px',
                            fontFamily: 'iranyekan, "IRANYekan", Tahoma, Arial, sans-serif',
                            color: '#374151',
                            display: 'block',
                            lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {t('manualRtlTab.ltr')}
                    </button>
                    <div
                        style={{
                            height: '1px',
                            backgroundColor: '#e5e7eb',
                            margin: '1px 0'
                        }}
                    />
          
                </div>
            )}
        </div>
    );
};

const ManualRTLTab: React.FC<ManualRTLTabProps> = ({
    manualRtlSettings,
    onManualRtlSettingsChange,
    isDarkMode
}) => {
    const theme = useTheme();
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [menuExpanded, setMenuExpanded] = React.useState(manualRtlSettings.menuDisplayMode === 'menu_direct');
    const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);
    const [activeSites, setActiveSites] = React.useState<ManualRtlActiveSite[]>([]);
    const [showAdvancedSettings, setShowAdvancedSettings] = React.useState(false);
    const [hasTabsPermission, setHasTabsPermission] = React.useState(false);
    
    // وقتی menuDisplayMode تغییر می‌کند، state را به‌روزرسانی کن
    React.useEffect(() => {
        setMenuExpanded(manualRtlSettings.menuDisplayMode === 'menu_direct');
    }, [manualRtlSettings.menuDisplayMode]);

    // Check permission status
    React.useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await checkTabsPermission();
            setHasTabsPermission(hasPermission);
        };
        checkPermission();
    }, []);

    // Load active sites list
    React.useEffect(() => {
        const loadActiveSites = () => {
            chrome.storage.sync.get(['manualRtlActiveSites'], (result) => {
                const sites = result.manualRtlActiveSites || [];
                setActiveSites(sites);
            });
        };

        loadActiveSites();

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
    }, []);

    // Remove site from active list
    const handleRemoveSite = async (hostname: string) => {
        try {
            const updatedSites = activeSites.filter(site => site.hostname !== hostname);
            await chrome.storage.sync.set({ manualRtlActiveSites: updatedSites });
            
            setActiveSites(updatedSites);
        } catch (error) {
            console.error('[ManualRTLTab] Error removing site:', error);
        }
    };

    // Clear all sites
    const handleClearAllSites = async () => {
        try {
            const emptySites: ManualRtlActiveSite[] = [];
            await chrome.storage.sync.set({ manualRtlActiveSites: emptySites });
            
            setActiveSites(emptySites);
        } catch (error) {
            console.error('[ManualRTLTab] Error clearing sites:', error);
        }
    };
    
    // بررسی پرمیشن tabs
    const checkTabsPermission = async (): Promise<boolean> => {
        try {
            const hasPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
            return hasPermission;
        } catch (error) {
            console.error('Error checking tabs permission:', error);
            return false;
        }
    };
    
    // درخواست پرمیشن tabs
    const requestTabsPermission = async (): Promise<boolean> => {
        try {
            const granted = await chrome.permissions.request({ permissions: ['tabs'] });
            return granted;
        } catch (error) {
            console.error('Error requesting tabs permission:', error);
            return false;
        }
    };
    
    // Handle enable/disable
    const handleManualRtlEnabledChange = async (enabled: boolean) => {
        if (enabled) {
            // قبل از فعال کردن، پرمیشن tabs را بررسی کن
            const hasPermission = await checkTabsPermission();
            if (!hasPermission) {
                // اگر پرمیشن نداشت، دیالوگ را نمایش بده
                setPermissionDialogOpen(true);
                return;
            }
        }
        
        // اگر پرمیشن داشت یا در حال غیرفعال کردن است، تنظیمات را تغییر بده
        onManualRtlSettingsChange({
            ...manualRtlSettings,
            manualRtlEnabled: enabled,
        });
    };
    
    // مدیریت درخواست پرمیشن از دیالوگ
    const handleRequestPermission = async () => {
        const granted = await requestTabsPermission();
        if (granted) {
            setHasTabsPermission(true);
            setPermissionDialogOpen(false);
            // Enable manual RTL now
            onManualRtlSettingsChange({
                ...manualRtlSettings,
                manualRtlEnabled: true,
            });
        } else {
            // اگر کاربر پرمیشن را رد کرد، دیالوگ را ببند
            setPermissionDialogOpen(false);
        }
    };
    
    // تنظیمات پیش‌فرض برای راست‌چین دستی
    const getDefaultManualRTLSettings = (): Partial<ManualRtlSettings> => {
        return {
            manualRtlEnabled: true,
            manualRtlSiteMode: 'allowed_sites',
            menuDisplayMode: 'logo_first',
            highlightMode: 'on_direction_change',
            highlightColor: '#ff0000',
            highlightOpacity: 0.3,
            logoDisplay: 'always',
            applyFont: true
        };
    };
    
    const handleResetToDefault = () => {
        const defaultSettings = getDefaultManualRTLSettings();
        onManualRtlSettingsChange({
            ...manualRtlSettings,
            ...defaultSettings
        });
    };
    
    // تعیین اینکه آیا باید highlight نمایش داده شود یا نه
    const shouldShowHighlight = manualRtlSettings.highlightMode === 'disabled' 
        ? false 
        : manualRtlSettings.highlightMode === 'on_selection' 
        ? true 
        : manualRtlSettings.highlightMode === 'on_direction_change'
        ? (manualRtlSettings.menuDisplayMode === 'menu_direct' || menuExpanded)
        : false;


    return (
        <>
        <Grid container spacing={3}>
            {/* Settings Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                {t('manualRtlTab.title')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                lineHeight: 1.6
                            }}>
                                {t('manualRtlTab.description')}
                            </Typography>
                        </Box>

                        {/* Enable/disable status */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ 
                                        fontWeight: 500, 
                                        fontSize: '0.95rem',
                                        color: 'text.primary',
                                        mb: 0.5
                                    }}>
                                        {t('manualRtlTab.status')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: manualRtlSettings.manualRtlEnabled ? 'text.secondary' : (theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f'),
                                        fontSize: '0.8rem'
                                    }}>
                                        {manualRtlSettings.manualRtlEnabled ? t('manualRtlTab.active') : t('manualRtlTab.inactive')}
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={manualRtlSettings.manualRtlEnabled ?? false}
                                    onChange={(e) => handleManualRtlEnabledChange(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* توضیح درباره ارتباط با الگوریتم هوشمند */}
                        <Box
                            sx={{
                                mb: 3,
                                px: 2,
                                py: 1.5,
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.05)' 
                                    : 'rgba(30, 64, 175, 0.05)',
                                border: `1px solid ${theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.2)' 
                                    : 'rgba(30, 64, 175, 0.15)'}`
                            }}
                        >
                            <Typography
                                variant="body2"
                                component="div"
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 400,
                                    color: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.7)' 
                                        : 'rgba(0, 0, 0, 0.7)',
                                    fontFamily: 'iranyekan',
                                    lineHeight: 1.6
                                }}
                            >
                                {t('manualRtlTab.info')}
                            </Typography>
                        </Box>

                        {/* دکمه تنظیمات پیشرفته - فقط وقتی فعال است */}
                        {manualRtlSettings.manualRtlEnabled && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="text"
                                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        color: 'primary.main',
                                        fontWeight: 500,
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            backgroundColor: theme.palette.mode === 'dark' 
                                                ? 'rgba(0, 233, 255, 0.1)' 
                                                : 'rgba(30, 64, 175, 0.1)'
                                        }
                                    }}
                                >
                                    {showAdvancedSettings ? t('manualRtlTab.hideAdvanced') : t('manualRtlTab.showAdvanced')}
                                </Button>
                            </Box>
                        )}

                        {/* همه تنظیمات دیگر - فقط وقتی فعال است و تنظیمات پیشرفته باز است */}
                        {manualRtlSettings.manualRtlEnabled && showAdvancedSettings && (
                            <>
                                {/* ب - روی چه سایت‌هایی فعال باشه - موقتاً پنهان شده - به هیچ عنوان پاک نشود */}
                                {/* <Box sx={{ mb: 3, display: 'none' }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="site-mode-label"> {t('manualRtlTab.sitesLabel')} </InputLabel>
                                        <Select
                                            labelId="site-mode-label"
                                            value={manualRtlSettings.manualRtlSiteMode ?? 'allowed_sites'}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                manualRtlSiteMode: e.target.value as 'all' | 'ai_sites' | 'allowed_sites' | 'ai_and_allowed'
                                            })}
                                            label={t('manualRtlTab.sitesLabel')}
                                            disabled
                                        >
                                            <MenuItem value="all">{t('manualRtlTab.sitesAll')}</MenuItem>
                                            <MenuItem value="ai_sites">{t('manualRtlTab.sitesAi')}</MenuItem>
                                            <MenuItem value="allowed_sites">{t('manualRtlTab.sitesAllowed')}</MenuItem>
                                            <MenuItem value="ai_and_allowed">{t('manualRtlTab.sitesAiAndAllowed')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Divider sx={{ my: 2 }} /> */}

                                <Divider sx={{ my: 2 }} />

                                {/* {t('manualRtlTab.menuLabel')} */}
                                <Box sx={{ mb: 3 }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="menu-display-mode-label">{t('manualRtlTab.menuLabel')}</InputLabel>
                                        <Select
                                            labelId="menu-display-mode-label"
                                            value={manualRtlSettings.menuDisplayMode ?? 'logo_first'}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                menuDisplayMode: e.target.value as 'logo_first' | 'menu_direct'
                                            })}
                                            label={t('manualRtlTab.menuLabel')}
                                        >
                                            <MenuItem value="logo_first">{t('manualRtlTab.menuLogoFirst')}</MenuItem>
                                            <MenuItem value="menu_direct">{t('manualRtlTab.menuDirect')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* {t('manualRtlTab.highlightLabel')} */}
                                <Box sx={{ mb: 3 }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="highlight-mode-label">{t('manualRtlTab.highlightLabel')}</InputLabel>
                                        <Select
                                            labelId="highlight-mode-label"
                                            value={manualRtlSettings.highlightMode}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                highlightMode: e.target.value as 'disabled' | 'on_selection' | 'on_direction_change'
                                            })}
                                            label={t('manualRtlTab.highlightLabel')}
                                        >
                                            <MenuItem value="disabled">{t('manualRtlTab.highlightOff')}</MenuItem>
                                            <MenuItem value="on_selection">{t('manualRtlTab.highlightOnSelection')}</MenuItem>
                                            <MenuItem value="on_direction_change">{t('manualRtlTab.highlightOnMenu')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    {/* پیش‌نمایش نحوه نمایش */}
                                    <Box sx={{ 
                                        mt: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                                    }}>
                                        <Typography variant="body2" sx={{ 
                                            mb: 3.5,
                                            color: 'text.secondary',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {t('manualRtlTab.previewLabel')}
                                        </Typography>
                                   
                                            <Box
                                                sx={{
                                                    px: 1.5,
                                                    py: 1,
                                                    my: 2,
                                                    mb: shouldShowHighlight && manualRtlSettings.menuDisplayMode === 'menu_direct' ? 5 : 2,
                                                    borderRadius: 0.5,
                                                    backgroundColor: shouldShowHighlight
                                                        ? `rgba(${parseInt(manualRtlSettings.highlightColor.slice(1, 3), 16)}, ${parseInt(manualRtlSettings.highlightColor.slice(3, 5), 16)}, ${parseInt(manualRtlSettings.highlightColor.slice(5, 7), 16)}, ${manualRtlSettings.highlightOpacity * 0.2})`
                                                        : 'transparent',
                                                    outline: shouldShowHighlight
                                                        ? `3px solid rgba(${parseInt(manualRtlSettings.highlightColor.slice(1, 3), 16)}, ${parseInt(manualRtlSettings.highlightColor.slice(3, 5), 16)}, ${parseInt(manualRtlSettings.highlightColor.slice(5, 7), 16)}, ${manualRtlSettings.highlightOpacity})`
                                                        : 'none',
                                                    outlineOffset: '0',
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    position: 'relative'
                                                }}
                                            >
                                                <Typography 
                                                    variant="body2" 
                                                    component="div"
                                                    sx={{ 
                                                        fontSize: '0.9rem',
                                                    
                                                        lineHeight: 1.8,
                                                        color: 'text.primary',
                                                        userSelect: 'none'
                                                    }}
                                                >
                                                    {manualRtlSettings.highlightMode === 'disabled' ? (
                                                        <>
                                                            {t('manualRtlTab.previewSample')}{' '}
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    backgroundColor: theme.palette.mode === 'dark' ? '#093dab' : '#3367d1',
                                                                    color: '#ffffff',
                                                                    px: 0.5,
                                                                    py: 0.25,
                                                                    borderRadius: 0.25,
                                                                    display: 'inline-block',
                                                                    userSelect: 'none',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                {t('manualRtlTab.previewSelected')}
                                                                <MenuPreview 
                                                                    menuDisplayMode={manualRtlSettings.menuDisplayMode} 
                                                                    isExpanded={menuExpanded}
                                                                    onExpandedChange={setMenuExpanded}
                                                                />
                                                            </Box>
                                                            {' '}{t('manualRtlTab.previewRestOff')}
                                                        </>
                                                    ) : manualRtlSettings.highlightMode === 'on_selection' ? (
                                                        <>
                                                            {t('manualRtlTab.previewSample')}{' '}
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    backgroundColor: theme.palette.mode === 'dark' ? '#093dab' : '#3367d1',
                                                                    color: '#ffffff',
                                                                    px: 0.5,
                                                                    py: 0.25,
                                                                    borderRadius: 0.25,
                                                                    display: 'inline-block',
                                                                    userSelect: 'none',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                {t('manualRtlTab.previewSelected')}
                                                                <MenuPreview 
                                                                    menuDisplayMode={manualRtlSettings.menuDisplayMode} 
                                                                    isExpanded={menuExpanded}
                                                                    onExpandedChange={setMenuExpanded}
                                                                />
                                                            </Box>
                                                            {' '}{t('manualRtlTab.previewRestSelection')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {t('manualRtlTab.previewSample')}{' '}
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    backgroundColor: theme.palette.mode === 'dark' ? '#093dab' : '#3367d1',
                                                                    color: '#ffffff',
                                                                    px: 0.5,
                                                                    py: 0.25,
                                                                    borderRadius: 0.25,
                                                                    display: 'inline-block',
                                                                    userSelect: 'none',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                {t('manualRtlTab.previewSelected')}
                                                                <MenuPreview 
                                                                    menuDisplayMode={manualRtlSettings.menuDisplayMode} 
                                                                    isExpanded={menuExpanded}
                                                                    onExpandedChange={setMenuExpanded}
                                                                />
                                                            </Box>
                                                            {' '}{t('manualRtlTab.previewRestMenu')}{' '}
                                                            <br />
                                                            {t('manualRtlTab.previewMenuDirect')}
                                                        </>
                                                    )}
                                                </Typography>
                                            </Box>
                                    </Box>
                                </Box>

                                {/* Highlight color - when not disabled */}
                                {manualRtlSettings.highlightMode !== 'disabled' && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ 
                                        fontWeight: 500, 
                                        mb: 1.5,
                                        color: 'text.primary'
                                    }}>
                                        {t('manualRtlTab.colorLabel')}
                                    </Typography>
                                    
                                    {/* انتخاب رنگ */}
                                    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map((color) => (
                                            <Box
                                                key={color}
                                                onClick={() => {
                                                    onManualRtlSettingsChange({
                                                        ...manualRtlSettings,
                                                        highlightColor: color
                                                    });
                                                }}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 1,
                                                    bgcolor: color,
                                                    cursor: 'pointer',
                                                    border: manualRtlSettings.highlightColor === color ? `3px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.2)'
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    {/* شدت رنگ */}
                                    <Box sx={{ px: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                            {t('manualRtlTab.opacity', { percent: Math.round(manualRtlSettings.highlightOpacity * 100) })}
                                        </Typography>
                                        <Slider
                                            value={manualRtlSettings.highlightOpacity}
                                            onChange={(_, value) => {
                                                onManualRtlSettingsChange({
                                                    ...manualRtlSettings,
                                                    highlightOpacity: value as number
                                                });
                                            }}
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            sx={{
                                                '& .MuiSlider-thumb': {
                                                    color: theme.palette.primary.main
                                                },
                                                '& .MuiSlider-track': {
                                                    color: theme.palette.primary.main
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                                )}

                                <Divider sx={{ my: 2 }} />

                                {/* {t('manualRtlTab.applyFont')} */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                                    }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem',
                                                color: 'text.primary',
                                                mb: 0.5
                                            }}>
                                                {t('manualRtlTab.applyFont')}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.8rem'
                                            }}>
                                                {t('manualRtlTab.applyFontHint')}
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={manualRtlSettings.applyFont !== false}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                applyFont: e.target.checked
                                            })}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* نمایش لوگو */}
                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="logo-display-label">{t('manualRtlTab.logoLabel')}</InputLabel>
                                        <Select
                                            labelId="logo-display-label"
                                            value={manualRtlSettings.logoDisplay}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                logoDisplay: e.target.value as 'always' | 'on_hover' | 'disabled'
                                            })}
                                            label={t('manualRtlTab.logoLabel')}
                                        >
                                            <MenuItem value="always">{t('manualRtlTab.logoAlways')}</MenuItem>
                                            <MenuItem value="on_hover">{t('manualRtlTab.logoHover')}</MenuItem>
                                            <MenuItem value="disabled">{t('manualRtlTab.logoOff')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Reset to defaults */}
                                <Box sx={{ mb: 2 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={handleResetToDefault}
                                        sx={{
                                            py: 1.5,
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                            color: 'text.primary',
                                            fontWeight: 500,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                backgroundColor: theme.palette.mode === 'dark' 
                                                    ? 'rgba(0, 233, 255, 0.1)' 
                                                    : 'rgba(30, 64, 175, 0.1)'
                                            }
                                        }}
                                    >
                                        {t('manualRtlTab.reset')}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Active sites list */}
                {manualRtlSettings.manualRtlEnabled && !isFirefoxRuntime() && (
                    <Card elevation={2} sx={{ mt: 3 }}>
                        <CardContent>
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600, 
                                    color: 'primary.main',
                                    mb: 0.5
                                }}>
                                    {t('manualRtlTab.sitesTitle')}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.85rem'
                                }}>
                                    {t('manualRtlTab.sitesHint')}
                                </Typography>
                            </Box>
                            
                            {activeSites.length === 0 ? (
                                <Box sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.05)' 
                                        : 'rgba(0, 0, 0, 0.03)',
                                    border: `1px solid ${theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.1)'}`
                                }}>
                                    <Typography variant="body2" sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.9rem',
                                        fontFamily: 'iranyekan'
                                    }}>
                                        {t('manualRtlTab.sitesEmpty')}
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        {activeSites.map((site, index) => (
                                            <Box
                                                key={site.hostname}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    mb: 1,
                                                    borderRadius: 1,
                                                    bgcolor: theme.palette.mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.05)' 
                                                        : 'rgba(0, 0, 0, 0.03)',
                                                    border: `1px solid ${theme.palette.mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.1)' 
                                                        : 'rgba(0, 0, 0, 0.1)'}`
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                    {site.favicon ? (
                                                        <img
                                                            src={site.favicon}
                                                            alt={site.hostname}
                                                            style={{
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: 3,
                                                                border: theme.palette.mode === 'dark'
                                                                    ? '1px solid rgba(255, 255, 255, 0.2)'
                                                                    : '1px solid rgba(0, 0, 0, 0.2)'
                                                            }}
                                                        />
                                                    ) : (
                                                        <SvgIcon sx={{ fontSize: '1.2rem', color: isDarkMode ? '#00e9ff' : '#1c39bb' }}>
                                                            <path d={mdiWeb} />
                                                        </SvgIcon>
                                                    )}
                                                    <Typography variant="body2" sx={{ 
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        color: 'text.primary',
                                                        fontFamily: 'iranyekan',
                                                        flex: 1
                                                    }}>
                                                        {site.hostname}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveSite(site.hostname)}
                                                    sx={{
                                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                                        '&:hover': {
                                                            color: '#f44336',
                                                            backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <SvgIcon sx={{ fontSize: '1rem' }}>
                                                        <path d={mdiDelete} />
                                                    </SvgIcon>
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleClearAllSites}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                                color: 'text.primary',
                                                fontWeight: 500,
                                                fontFamily: 'iranyekan',
                                                fontSize: '0.8rem',
                                                '&:hover': {
                                                    borderColor: '#f44336',
                                                    backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                                    color: '#f44336'
                                                }
                                            }}
                                        >
                                            {t('manualRtlTab.clearAll')}
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Grid>

            {/* Template Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                {t('manualRtlTab.guideTitle')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                            }}>
                                {t('manualRtlTab.guideSubtitle')}
                            </Typography>
                        </Box>
                        
                        <Box sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            minHeight: '300px',
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: theme.palette.text.primary
                        }}>
                            <ManualRTLGuide 
                                image1Url={chrome.runtime?.getURL ? chrome.runtime.getURL('images/gif/ChatGPT RTL 1.gif') : '/images/gif/ChatGPT RTL 1.gif'}
                                image2Url={chrome.runtime?.getURL ? chrome.runtime.getURL('images/gif/ChatGPT RTL 2.gif') : '/images/gif/ChatGPT RTL 2.gif'}
                                image3Url={chrome.runtime?.getURL ? chrome.runtime.getURL('images/gif/ChatGPT RTL 3.gif') : '/images/gif/ChatGPT RTL 3.gif'}
                            />
                        </Box>

                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)' }}>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 1.5
                            }}>
                                {t('manualRtlTab.tipsTitle')}
                            </Typography>
                            <Box component="ul" sx={{ 
                                pl: 2, 
                                m: 0,
                                '& li': {
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontSize: '0.85rem',
                                    lineHeight: 1.8
                                }
                            }}>
                                <li>{t('manualRtlTab.tip1')}</li>
                                <li>{t('manualRtlTab.tip2')}</li>
                                <li>{t('manualRtlTab.tip3')}</li>
                                <li>{t('manualRtlTab.tip4')}</li>
                                <li>{t('manualRtlTab.tip5')}</li>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        
        {/* دیالوگ درخواست پرمیشن tabs */}
        <Dialog
            open={permissionDialogOpen}
            onClose={() => setPermissionDialogOpen(false)}
            aria-labelledby="permission-dialog-title"
            aria-describedby="permission-dialog-description"
            PaperProps={{
                sx: {
                    fontFamily: 'iranyekan',
                }
            }}
        >
            <DialogTitle id="permission-dialog-title" sx={{ fontFamily: 'iranyekan' }}>
                {t('manualRtlTab.permission.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="permission-dialog-description" sx={{ fontFamily: 'iranyekan' }}>
                    {t('manualRtlTab.permission.body')}
                    <br /><br />
                    {t('manualRtlTab.permission.limited')}
                </DialogContentText>
                
                <Box sx={{ mt: 2 }}>
                    <Accordion sx={{ fontFamily: 'iranyekan' }}>
                        <AccordionSummary
                            expandIcon={
                                <SvgIcon sx={{ fontSize: '1.2rem', color: isDarkMode ? '#00e9ff' : '#1c39bb' }}>
                                    <path d={mdiChevronDown} />
                                </SvgIcon>
                            }
                            sx={{
                                fontFamily: 'iranyekan',
                                '& .MuiAccordionSummary-content': {
                                    my: 1
                                }
                            }}
                        >
                            <Typography sx={{ fontFamily: 'iranyekan', fontWeight: 500, fontSize: '0.9rem' }}>
                                {t('manualRtlTab.permission.more')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ fontFamily: 'iranyekan', pt: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 2, fontSize: '0.85rem', lineHeight: 1.8 }}>
                                {t('manualRtlTab.permission.intro')}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                {t('manualRtlTab.permission.domainTitle')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                {t('manualRtlTab.permission.faviconTitle')}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 2, fontSize: '0.85rem', lineHeight: 1.8 }}>
                                {t('manualRtlTab.permission.noSensitive')}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#4caf50' : '#2e7d32' }}>
                                {t('manualRtlTab.permission.receivesTitle')}
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    <strong>{t('manualRtlTab.permission.domainTitle')}</strong><br />
                                    {t('manualRtlTab.permission.domainDetail')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    <strong>{t('manualRtlTab.permission.faviconTitle')}</strong><br />
                                    {t('manualRtlTab.permission.faviconDetail')}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#f44336' : '#d32f2f' }}>
                                {t('manualRtlTab.permission.deniesTitle')}
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.deny1')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.deny2')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.deny3')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.deny4')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.deny5')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.deny6')}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                {t('manualRtlTab.permission.usageTitle')}
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.usage1')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.usage2')}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                {t('manualRtlTab.permission.whyTitle')}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 2, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                {t('manualRtlTab.permission.whyBody')}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                {t('manualRtlTab.permission.exampleTitle')}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                {t('manualRtlTab.permission.exampleIntro')}
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.example1')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.example2')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.example3')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • {t('manualRtlTab.permission.example4')}
                                </Typography>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </DialogContent>
            <DialogActions sx={{ fontFamily: 'iranyekan', direction: dir }}>
                <Button onClick={() => setPermissionDialogOpen(false)} sx={{ fontFamily: 'iranyekan' }}>
                    {t('manualRtlTab.permission.cancel')}
                </Button>
                <Button 
                    onClick={handleRequestPermission} 
                    variant="contained"
                    sx={{ 
                        fontFamily: 'iranyekan',
                        backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                        '&:hover': {
                            backgroundColor: isDarkMode ? '#00b8d4' : '#1e40af'
                        }
                    }}
                >
                    {t('manualRtlTab.permission.grant')}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default ManualRTLTab;

