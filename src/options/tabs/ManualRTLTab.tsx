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
    Switch
} from '@mui/material';

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

interface ManualRTLTabProps {
    textSelectorSettings: TextSelectorSettings;
    onTextSelectorSettingsChange: (settings: TextSelectorSettings) => void;
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
    textSelectorSettings,
    onTextSelectorSettingsChange,
    isDarkMode
}) => {
    const theme = useTheme();
    const [menuExpanded, setMenuExpanded] = React.useState(textSelectorSettings.menuDisplayMode === 'menu_direct');
    
    // وقتی menuDisplayMode تغییر می‌کند، state را به‌روزرسانی کن
    React.useEffect(() => {
        setMenuExpanded(textSelectorSettings.menuDisplayMode === 'menu_direct');
    }, [textSelectorSettings.menuDisplayMode]);
    
    // تعیین اینکه آیا باید highlight نمایش داده شود یا نه
    const shouldShowHighlight = textSelectorSettings.highlightMode === 'disabled' 
        ? false 
        : textSelectorSettings.highlightMode === 'on_selection' 
        ? true 
        : textSelectorSettings.highlightMode === 'on_direction_change'
        ? (textSelectorSettings.menuDisplayMode === 'menu_direct' || menuExpanded)
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
        <Grid container spacing={3}>
            {/* Settings Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
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
                                fontSize: '0.85rem'
                            }}>
                                تنظیمات مربوط به قابلیت تغییر چینش متن به صورت دستی
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
                                        color: 'text.secondary',
                                        fontSize: '0.8rem'
                                    }}>
                                        {textSelectorSettings.manualRtlEnabled ? 'فعال' : 'غیرفعال'}
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={textSelectorSettings.manualRtlEnabled ?? false}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
                                        manualRtlEnabled: e.target.checked
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

                        {/* روی چه سایت‌هایی فعال باشه */}
                        <Box sx={{ mb: 3, opacity: textSelectorSettings.manualRtlEnabled ? 1 : 0.5 }}>
                            <FormControl fullWidth sx={{ mb: 2 }} disabled={!textSelectorSettings.manualRtlEnabled}>
                                <InputLabel id="site-mode-label"> سایت‌های فعال </InputLabel>
                                <Select
                                    labelId="site-mode-label"
                                    value={textSelectorSettings.manualRtlSiteMode ?? 'all'}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
                                        manualRtlSiteMode: e.target.value as 'all' | 'ai_sites' | 'allowed_sites' | 'ai_and_allowed'
                                    })}
                                    label="سایت‌های فعال"
                                >
                                    <MenuItem value="all">همه</MenuItem>
                                    <MenuItem value="ai_sites">فقط لیست سایت‌های هوش مصنوعی افزونه</MenuItem>
                                    <MenuItem value="allowed_sites">فقط سایت‌های که تعریف شده در لیست مجاز </MenuItem>
                                    <MenuItem value="ai_and_allowed">سایت‌های مجاز و هوش مصنوعی‌های افزونه</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* نحوه نمایش منوی تغییر جهت */}
                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="menu-display-mode-label">نحوه نمایش منوی تغییر جهت</InputLabel>
                                <Select
                                    labelId="menu-display-mode-label"
                                    value={textSelectorSettings.menuDisplayMode ?? 'logo_first'}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
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
                                    value={textSelectorSettings.highlightMode}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
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
                                            mb: shouldShowHighlight && textSelectorSettings.menuDisplayMode === 'menu_direct' ? 5 : 2,
                                            borderRadius: 0.5,
                                            backgroundColor: shouldShowHighlight
                                                ? `rgba(${parseInt(textSelectorSettings.highlightColor.slice(1, 3), 16)}, ${parseInt(textSelectorSettings.highlightColor.slice(3, 5), 16)}, ${parseInt(textSelectorSettings.highlightColor.slice(5, 7), 16)}, ${textSelectorSettings.highlightOpacity * 0.2})`
                                                : 'transparent',
                                            outline: shouldShowHighlight
                                                ? `3px solid rgba(${parseInt(textSelectorSettings.highlightColor.slice(1, 3), 16)}, ${parseInt(textSelectorSettings.highlightColor.slice(3, 5), 16)}, ${parseInt(textSelectorSettings.highlightColor.slice(5, 7), 16)}, ${textSelectorSettings.highlightOpacity})`
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
                                            {textSelectorSettings.highlightMode === 'disabled' ? (
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
                                                            menuDisplayMode={textSelectorSettings.menuDisplayMode} 
                                                            isExpanded={menuExpanded}
                                                            onExpandedChange={setMenuExpanded}
                                                        />
                                                    </Box>
                                                    {' '}و بقیه متن به صورت عادی است. در حالت غیرفعال هیچ highlight نمایش داده نمی‌شود.
                                                </>
                                            ) : textSelectorSettings.highlightMode === 'on_selection' ? (
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
                                                            menuDisplayMode={textSelectorSettings.menuDisplayMode} 
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
                                                            menuDisplayMode={textSelectorSettings.menuDisplayMode} 
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
                        {textSelectorSettings.highlightMode !== 'disabled' && (
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
                                            onTextSelectorSettingsChange({
                                                ...textSelectorSettings,
                                                highlightColor: color
                                            });
                                        }}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: color,
                                            cursor: 'pointer',
                                            border: textSelectorSettings.highlightColor === color ? `3px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.2)'
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* شدت رنگ */}
                            <Box sx={{ px: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                    شدت رنگ: {Math.round(textSelectorSettings.highlightOpacity * 100)}%
                                </Typography>
                                <Slider
                                    value={textSelectorSettings.highlightOpacity}
                                    onChange={(_, value) => {
                                        onTextSelectorSettingsChange({
                                            ...textSelectorSettings,
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

                        {/* نمایش لوگو */}
                        <Box sx={{ mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="logo-display-label">نمایش لوگو روی قسمت های فعال شده</InputLabel>
                                <Select
                                    labelId="logo-display-label"
                                    value={textSelectorSettings.logoDisplay}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
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
                    </CardContent>
                </Card>
            </Grid>

            {/* Template Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                تمونه استفاده
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
    );
};

export default ManualRTLTab;

