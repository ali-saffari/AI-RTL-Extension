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
                    src={chrome.runtime?.getURL ? chrome.runtime.getURL('images/myLogo.png') : '/images/myLogo.png'}
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
                            textAlign: 'right',
                            fontSize: '12px',
                            fontFamily: 'iranyekan, "IRANYekan", Tahoma, Arial, sans-serif',
                            color: '#374151',
                            display: 'block',
                            lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        راست چین
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
                            textAlign: 'right',
                            fontSize: '12px',
                            fontFamily: 'iranyekan, "IRANYekan", Tahoma, Arial, sans-serif',
                            color: '#374151',
                            display: 'block',
                            lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        چپ چین
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
    const [menuExpanded, setMenuExpanded] = React.useState(manualRtlSettings.menuDisplayMode === 'menu_direct');
    const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);
    const [activeSites, setActiveSites] = React.useState<ManualRtlActiveSite[]>([]);
    const [showAdvancedSettings, setShowAdvancedSettings] = React.useState(false);
    
    // وقتی menuDisplayMode تغییر می‌کند، state را به‌روزرسانی کن
    React.useEffect(() => {
        setMenuExpanded(manualRtlSettings.menuDisplayMode === 'menu_direct');
    }, [manualRtlSettings.menuDisplayMode]);

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
            
            // Also update manualRtlSettings.activeSites
            const updatedSettings = {
                ...manualRtlSettings,
                activeSites: updatedSites
            };
            await chrome.storage.sync.set({ manualRtlSettings: updatedSettings });
            onManualRtlSettingsChange(updatedSettings);
            
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
            
            // Also update manualRtlSettings.activeSites
            const updatedSettings = {
                ...manualRtlSettings,
                activeSites: emptySites
            };
            await chrome.storage.sync.set({ manualRtlSettings: updatedSettings });
            onManualRtlSettingsChange(updatedSettings);
            
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
    
    // مدیریت تغییر وضعیت فعال/غیرفعال
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
            setPermissionDialogOpen(false);
            // حالا می‌توانیم راست چین دستی را فعال کنیم
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

    // Template example
    const templateExample = `مثال استفاده از قابلیت راستچین دستی:

1. متن مورد نظر را انتخاب کنید
2. منوی تنظیم جهت ظاهر می‌شود
3. جهت مورد نظر را انتخاب کنید
4. متن به صورت خودکار تغییر جهت می‌دهد

این قابلیت برای مواقعی که الگوریتم 
خودکار به درستی کار نمی‌کند، بسیار 
مفید است.`;

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
                                تنظیمات چینش دستی
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                lineHeight: 1.6
                            }}>
                                این قابلیت به شما امکان می‌دهد تا به صورت دستی متن‌های مورد نظر خود را در هر سایتی راست چین یا چپ چین کنید.
                            </Typography>
                        </Box>

                        {/* وضعیت فعال/غیرفعال */}
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
                                        وضعیت
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: manualRtlSettings.manualRtlEnabled ? 'text.secondary' : (theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f'),
                                        fontSize: '0.8rem'
                                    }}>
                                        {manualRtlSettings.manualRtlEnabled ? 'فعال' : 'غیرفعال'}
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
                                فعال یا غیر فعال بودن <span style={{ fontWeight: 900 }}>راست‌چین دستی</span> هیچ ارتباطی با <span style={{ fontWeight: 900 }}>الگوریتم هوشمند</span> ندارد و دو قابلیت <span style={{ fontWeight: 900 }}>جدا از هم</span> هستند
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
                                    {showAdvancedSettings ? 'مخفی کردن تنظیمات پیشرفته' : 'تنظیمات پیشرفته'}
                                </Button>
                            </Box>
                        )}

                        {/* همه تنظیمات دیگر - فقط وقتی فعال است و تنظیمات پیشرفته باز است */}
                        {manualRtlSettings.manualRtlEnabled && showAdvancedSettings && (
                            <>
                                {/* ب - روی چه سایت‌هایی فعال باشه - موقتاً پنهان شده - به هیچ عنوان پاک نشود */}
                                {/* <Box sx={{ mb: 3, display: 'none' }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="site-mode-label"> سایت‌های فعال </InputLabel>
                                        <Select
                                            labelId="site-mode-label"
                                            value={manualRtlSettings.manualRtlSiteMode ?? 'allowed_sites'}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                manualRtlSiteMode: e.target.value as 'all' | 'ai_sites' | 'allowed_sites' | 'ai_and_allowed'
                                            })}
                                            label="سایت‌های فعال"
                                            disabled
                                        >
                                            <MenuItem value="all">همه</MenuItem>
                                            <MenuItem value="ai_sites">فقط لیست سایت‌های هوش مصنوعی افزونه</MenuItem>
                                            <MenuItem value="allowed_sites">فقط سایت‌های که تعریف شده در لیست مجاز </MenuItem>
                                            <MenuItem value="ai_and_allowed">سایت‌های مجاز و هوش مصنوعی‌های افزونه</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Divider sx={{ my: 2 }} /> */}

                                <Divider sx={{ my: 2 }} />

                                {/* نحوه نمایش منوی تغییر جهت */}
                                <Box sx={{ mb: 3 }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="menu-display-mode-label">نحوه نمایش منوی تغییر جهت</InputLabel>
                                        <Select
                                            labelId="menu-display-mode-label"
                                            value={manualRtlSettings.menuDisplayMode ?? 'logo_first'}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                menuDisplayMode: e.target.value as 'logo_first' | 'menu_direct'
                                            })}
                                            label="نحوه نمایش منوی تغییر جهت"
                                        >
                                            <MenuItem value="logo_first">ابتدا لوگو نمایش داده شود (دو مرحله‌ای)</MenuItem>
                                            <MenuItem value="menu_direct">مستقیم منو نمایش داده شود (تک مرحله‌ای)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* نحوه نمایش محل تغییر */}
                                <Box sx={{ mb: 3 }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="highlight-mode-label">نحوه نمایش محل تغییر</InputLabel>
                                        <Select
                                            labelId="highlight-mode-label"
                                            value={manualRtlSettings.highlightMode}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                highlightMode: e.target.value as 'disabled' | 'on_selection' | 'on_direction_change'
                                            })}
                                            label="نحوه نمایش محل تغییر"
                                        >
                                            <MenuItem value="disabled">غیرفعال</MenuItem>
                                            <MenuItem value="on_selection">زمان انتخاب متن</MenuItem>
                                            <MenuItem value="on_direction_change">زمان باز شدن منو تنظیم جهت</MenuItem>
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
                                            پیش‌نمایش:
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
                                                            این یک متن نمونه است که برای نمایش پیش‌نمایش استفاده می‌شود.{' '}
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
                                                                این قسمت از متن به صورت انتخاب شده نمایش داده می‌شود
                                                                <MenuPreview 
                                                                    menuDisplayMode={manualRtlSettings.menuDisplayMode} 
                                                                    isExpanded={menuExpanded}
                                                                    onExpandedChange={setMenuExpanded}
                                                                />
                                                            </Box>
                                                            {' '}و بقیه متن به صورت عادی است. در حالت غیرفعال هیچ highlight نمایش داده نمی‌شود.
                                                        </>
                                                    ) : manualRtlSettings.highlightMode === 'on_selection' ? (
                                                        <>
                                                            این یک متن نمونه است که برای نمایش پیش‌نمایش استفاده می‌شود.{' '}
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
                                                                این قسمت از متن به صورت انتخاب شده نمایش داده می‌شود
                                                                <MenuPreview 
                                                                    menuDisplayMode={manualRtlSettings.menuDisplayMode} 
                                                                    isExpanded={menuExpanded}
                                                                    onExpandedChange={setMenuExpanded}
                                                                />
                                                            </Box>
                                                            {' '}و بقیه متن به صورت عادی است. در این حالت highlight در زمان انتخاب متن نمایش داده می‌شود و تفاوتی نمی‌کند.
                                                        </>
                                                    ) : (
                                                        <>
                                                            این یک متن نمونه است که برای نمایش پیش‌نمایش استفاده می‌شود.{' '}
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
                                                                این قسمت از متن به صورت انتخاب شده نمایش داده می‌شود
                                                                <MenuPreview 
                                                                    menuDisplayMode={manualRtlSettings.menuDisplayMode} 
                                                                    isExpanded={menuExpanded}
                                                                    onExpandedChange={setMenuExpanded}
                                                                />
                                                            </Box>
                                                            {' '}و بقیه متن به صورت عادی است. در این حالت highlight فقط زمانی نمایش داده می‌شود که منو باز باشد.{' '}
                                                            <br />
                                                            اگر حالت نمایش منو "مستقیم منو" باشد، highlight همیشه نمایش داده می‌شود. اگر حالت نمایش منو "ابتدا لوگو" باشد، highlight فقط بعد از کلیک روی لوگو و باز شدن منو نمایش داده می‌شود.
                                                        </>
                                                    )}
                                                </Typography>
                                            </Box>
                                    </Box>
                                </Box>

                                {/* رنگ محل انتخاب شده - فقط وقتی disabled نیست */}
                                {manualRtlSettings.highlightMode !== 'disabled' && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ 
                                        fontWeight: 500, 
                                        mb: 1.5,
                                        color: 'text.primary'
                                    }}>
                                        رنگ محل انتخاب شده
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
                                            شدت رنگ: {Math.round(manualRtlSettings.highlightOpacity * 100)}%
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

                                {/* اعمال فونت */}
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
                                                اعمال فونت
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.8rem'
                                            }}>
                                                اعمال فونت ایران یکان روی متن‌های تغییر جهت داده شده
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
                                        <InputLabel id="logo-display-label">نمایش لوگو روی قسمت های فعال شده</InputLabel>
                                        <Select
                                            labelId="logo-display-label"
                                            value={manualRtlSettings.logoDisplay}
                                            onChange={(e) => onManualRtlSettingsChange({
                                                ...manualRtlSettings,
                                                logoDisplay: e.target.value as 'always' | 'on_hover' | 'disabled'
                                            })}
                                            label="نمایش لوگو روی قسمت های فعال شده"
                                        >
                                            <MenuItem value="always">همیشه نمایش بده</MenuItem>
                                            <MenuItem value="on_hover">زمان hover شدن موس</MenuItem>
                                            <MenuItem value="disabled">غیرفعال</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* دکمه بازنشانی به تنظیمات پیش‌فرض */}
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
                                        بازنشانی به تنظیمات پیش‌فرض
                                    </Button>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* لیست سایت‌های فعال - زیر تنظیمات چینش دستی */}
                {manualRtlSettings.manualRtlEnabled && (
                    <Card elevation={2} sx={{ mt: 3 }}>
                        <CardContent>
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600, 
                                    color: 'primary.main',
                                    mb: 0.5
                                }}>
                                    لیست سایت‌های فعال
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.85rem'
                                }}>
                                    سایت‌هایی که راست‌چین دستی برای آن‌ها فعال شده است
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
                                        لیست خالی است
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
                                            پاک کردن همه
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
                                راهنمای استفاده
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                            }}>
                                راهنمای استفاده از قابلیت راستچین دستی
                            </Typography>
                        </Box>
                        
                        <Box sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            minHeight: '300px',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: theme.palette.text.primary
                        }}>
                            {templateExample}
                        </Box>

                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)' }}>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 1
                            }}>
                                نکته مهم:
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem',
                                lineHeight: 1.6
                            }}>
                                این قابلیت به شما امکان تغییر دستی جهت متن را می‌دهد. 
                                برای استفاده، کافی است متن مورد نظر را انتخاب کرده و 
                                از منوی ظاهر شده جهت مناسب را انتخاب کنید.
                            </Typography>
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
                درخواست دسترسی
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="permission-dialog-description" sx={{ fontFamily: 'iranyekan' }}>
                    افزونه برای تشخیص تب فعلی و اعمال راست‌چین روی سایت‌ مشخص شده به پرمیشن Tabs نیاز دارد.
                    <br /><br />
                    افزونه فقط دامنه و آیکن تب فعلی را دریافت می‌کند. هیچ URL کامل، محتوای صفحه یا داده شخصی خوانده نمی‌شود.
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
                                اطلاعات بیشتر
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ fontFamily: 'iranyekan', pt: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 2, fontSize: '0.85rem', lineHeight: 1.8 }}>
                                پرمیشن Tabs به افزونه اجازه می‌دهد تب فعلی را شناسایی کرده و قابلیت «راست‌چین دستی» را تنها روی همان صفحه فعال کند. این دسترسی بسیار محدود است و افزونه فقط دو مورد را دریافت می‌کند:
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                ۱) دامنه سایت (Domain / Origin)
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                ۲) آیکن سایت (Favicon)
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 2, fontSize: '0.85rem', lineHeight: 1.8 }}>
                                هیچ URL کامل، مسیر صفحه، محتوای سایت، فرم‌ها یا داده حساس دریافت نمی‌شود.
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#4caf50' : '#2e7d32' }}>
                                مواردی که افزونه دریافت می‌کند
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    <strong>دامنه سایت (Domain / Origin)</strong><br />
                                    برای اینکه افزونه بداند کدام سرویس یا سایت باز است و آیا در لیست پشتیبانی قرار دارد.
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    <strong>آیکن سایت (Favicon)</strong><br />
                                    تنها برای نمایش بهتر و شناسایی سریع سایت در رابط کاربری افزونه.
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#f44336' : '#d32f2f' }}>
                                مواردی که افزونه به آنها دسترسی ندارد
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • مسیر کامل URL (مثل /page?id=55)
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • محتوای صفحه، پیام‌ها یا متن تایپ‌شده
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • کوکی‌ها یا sessionها
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • رمزعبورها یا اطلاعات ورود
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • تاریخچه مرورگر
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • اطلاعات شخصی یا قابل‌شناسایی
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                نحوه استفاده از داده‌ها
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • همه پردازش‌ها به‌صورت محلی (Local) روی دستگاه شما انجام می‌شود.
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • افزونه تنها هنگام فعال‌سازی راست‌چین یا باز کردن پنل، دامنه و آیکن تب فعلی را می‌خواند.
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                چرا این دسترسی لازم است؟
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 2, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                Chrome برای اینکه افزونه بتواند سایت فعلی را تشخیص داده و فقط روی همان تب تغییرات ایجاد کند، استفاده از پرمیشن Tabs را ضروری می‌داند. بدون آن، افزونه نمی‌تواند بفهمد کاربر در کدام سایت است و امکان فعال‌سازی کنترل‌شده راست‌چین وجود نخواهد داشت.
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                مثال کاربردی
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 1, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                وقتی وارد example.com می‌شوید و «راست‌چین دستی» را فعال می‌کنید:
                            </Typography>
                            
                            <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • افزونه فقط دامنه (example.com) و آیکن سایت را دریافت می‌کند.
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • بررسی می‌کند که آیا این سایت در لیست پشتیبانی است.
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • اگر بله، راست‌چین فقط روی همان تب اعمال می‌شود.
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'iranyekan', mb: 0.5, fontSize: '0.8rem', lineHeight: 1.8 }}>
                                    • هیچ بخش دیگری از صفحه، فرم‌ها یا داده‌های کاربری خوانده نمی‌شود.
                                </Typography>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </DialogContent>
            <DialogActions sx={{ fontFamily: 'iranyekan', direction: 'rtl' }}>
                <Button onClick={() => setPermissionDialogOpen(false)} sx={{ fontFamily: 'iranyekan' }}>
                    انصراف
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
                    اعطای دسترسی
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default ManualRTLTab;

