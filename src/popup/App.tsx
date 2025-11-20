import React from 'react';
import { 
    ThemeProvider, 
    createTheme,
    Paper,
    Box,
    Typography,
    Chip,
    Avatar,
    Container,
    Tabs,
    Tab,
    AppBar,
    IconButton,
    Tooltip,
    SvgIcon
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { mdiWeatherSunny, mdiWeatherNight, mdiBullhorn, mdiFileDocumentEdit, mdiMessageText, mdiStar, mdiHeart, mdiCog } from '@mdi/js';
// Using Material-UI built-in icons instead of icons-material package
import CssBaseline from '@mui/material/CssBaseline';
import ServiceList, { services } from './list';
import Settings from './Settings';
import ChangesList from './ChangesList';
import './App.css';
import manifest from '../../public/manifest.json';

// Create rtl cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const darkTheme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'dark',
        primary: {
            main: '#00e9ff',
            light: '#4dd4ff',
            dark: '#0099cc',
        },
        secondary: {
            main: '#ff6b35',
            light: '#ff8a65',
            dark: '#e64a19',
        },
        background: {
            default: '#1a1a2e',
            paper: '#2f2f41',
        },
    },
    typography: {
        fontFamily: ['"iranyekan"', 'Tahoma', 'Arial'].join(','),
        fontSize: 12,
        h1: {
            fontFamily: '"iranyekan"',
            fontWeight: 700,
        },
        h2: {
            fontFamily: '"iranyekan"',
            fontWeight: 600,
        },
        h3: {
            fontFamily: '"iranyekan"',
            fontWeight: 600,
        },
        h4: {
            fontFamily: '"iranyekan"',
            fontWeight: 500,
        },
        h5: {
            fontFamily: '"iranyekan"',
            fontWeight: 500,
        },
        h6: {
            fontFamily: '"iranyekan"',
            fontWeight: 500,
        },
        body1: {
            fontFamily: '"iranyekan"',
            fontWeight: 400,
        },
        body2: {
            fontFamily: '"iranyekan"',
            fontWeight: 400,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '@global': {
                    '@keyframes gradientShift': {
                        '0%, 100%': {
                            backgroundPosition: '0% 50%',
                        },
                        '50%': {
                            backgroundPosition: '100% 50%',
                        },
                    },
                    '@keyframes pulse': {
                        '0%, 100%': {
                            transform: 'scale(1)',
                            opacity: 0.8,
                        },
                        '50%': {
                            transform: 'scale(1.2)',
                            opacity: 1,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                    fontWeight: 500,
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    direction: 'rtl',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        }

    },
});

const lightTheme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'light',
        primary: {
            main: '#1c39bb',
            light: '#3b82f6',
            dark: '#1e3a8a',
        },
        secondary: {
            main: '#059669',
            light: '#10b981',
            dark: '#047857',
        },
        background: {
            default: '#ffffff',
            paper: '#e0f2fe',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        divider: '#e2e8f0',
    },
    typography: {
        fontFamily: ['"iranyekan"', 'Tahoma', 'Arial'].join(','),
        fontSize: 12,
        h1: {
            fontFamily: '"iranyekan"',
            fontWeight: 700,
        },
        h2: {
            fontFamily: '"iranyekan"',
            fontWeight: 600,
        },
        h3: {
            fontFamily: '"iranyekan"',
            fontWeight: 600,
        },
        h4: {
            fontFamily: '"iranyekan"',
            fontWeight: 500,
        },
        h5: {
            fontFamily: '"iranyekan"',
            fontWeight: 500,
        },
        h6: {
            fontFamily: '"iranyekan"',
            fontWeight: 500,
        },
        body1: {
            fontFamily: '"iranyekan"',
            fontWeight: 400,
        },
        body2: {
            fontFamily: '"iranyekan"',
            fontWeight: 400,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '@global': {
                    '@keyframes gradientShift': {
                        '0%, 100%': {
                            backgroundPosition: '0% 50%',
                        },
                        '50%': {
                            backgroundPosition: '100% 50%',
                        },
                    },
                    '@keyframes pulse': {
                        '0%, 100%': {
                            transform: 'scale(1)',
                            opacity: 0.8,
                        },
                        '50%': {
                            transform: 'scale(1.2)',
                            opacity: 1,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                    fontWeight: 500,
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    direction: 'rtl',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        }
       
    },
});

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

function App() {
    const [tabValue, setTabValue] = React.useState(0);
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('advanced_full');
    const [supportHide, setSupportHide] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [manualRtlSettings, setManualRtlSettings] = React.useState<TextSelectorSettings>({
        enabled: 'enabled',
        highlightMode: 'on_selection',
        highlightColor: '#ff0000',
        highlightOpacity: 0.1,
        logoDisplay: 'always',
        manualRtlEnabled: false,
        manualRtlSiteMode: 'all',
        menuDisplayMode: 'logo_first'
    });
 

    // Load settings from storage on component mount
    const loadSettings = React.useCallback(() => {
        try {
            chrome.storage.sync.get(['rtlAlgorithmMode', 'supportHide', 'isDarkMode', 'manualRtlSettings', 'textSelectorSettings'], (result) => {
                if (result.rtlAlgorithmMode) {
                    setRtlAlgorithm(result.rtlAlgorithmMode);
                }
                if (result.supportHide !== undefined) {
                    setSupportHide(result.supportHide);
                }
                if (result.isDarkMode !== undefined) {
                    setIsDarkMode(result.isDarkMode);
                }
                // Support both old and new key names for migration
                const settings = result.manualRtlSettings || result.textSelectorSettings;
                if (settings) {
                    setManualRtlSettings({
                        enabled: 'enabled',
                        highlightMode: 'on_selection',
                        highlightColor: '#ff0000',
                        highlightOpacity: 0.1,
                        logoDisplay: 'always',
                        manualRtlEnabled: false,
                        manualRtlSiteMode: 'all',
                        menuDisplayMode: 'logo_first',
                        ...settings
                    });
                }
            });
        } catch (error) {
            // Extension context invalidated or other error - use default values
            console.log('Chrome storage access failed, using default values:', error);
        }
    }, []);

    React.useEffect(() => {
        loadSettings();

        // Listen for storage changes to sync with options page
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === 'sync') {
                if (changes.rtlAlgorithmMode) {
                    setRtlAlgorithm(changes.rtlAlgorithmMode.newValue);
                }
                if (changes.supportHide) {
                    setSupportHide(changes.supportHide.newValue);
                }
                if (changes.isDarkMode) {
                    setIsDarkMode(changes.isDarkMode.newValue);
                }
                if (changes.manualRtlSettings || changes.textSelectorSettings) {
                    const newSettings = (changes.manualRtlSettings || changes.textSelectorSettings)?.newValue;
                    if (newSettings) {
                        setManualRtlSettings({
                            enabled: 'enabled',
                            highlightMode: 'on_selection',
                            highlightColor: '#ff0000',
                            highlightOpacity: 0.1,
                            logoDisplay: 'always',
                            manualRtlEnabled: false,
                            manualRtlSiteMode: 'all',
                            menuDisplayMode: 'logo_first',
                            ...newSettings
                        });
                    }
                }
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [loadSettings]);

    // Save RTL algorithm setting to storage when changed
    const handleRtlAlgorithmChange = (value: string) => {
        setRtlAlgorithm(value);
        try {
            chrome.storage.sync.set({ rtlAlgorithmMode: value });
        } catch (error) {
            console.log('Failed to save RTL algorithm setting:', error);
        }
    };

    // Save support setting to storage when changed
    const handleSupportChange = (enabled: boolean) => {
        setSupportHide(enabled);
        try {
            chrome.storage.sync.set({ supportHide: enabled });
        } catch (error) {
            console.log('Failed to save support setting:', error);
        }
    };

    // Save manual RTL settings to storage when changed
    const handleManualRtlSettingsChange = (settings: TextSelectorSettings) => {
        setManualRtlSettings(settings);
        try {
            chrome.storage.sync.set({ manualRtlSettings: settings });
        } catch (error) {
            console.log('Failed to save manual RTL settings:', error);
        }
    };

    // Toggle theme and save to storage
    const handleThemeToggle = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        try {
            chrome.storage.sync.set({ isDarkMode: newTheme });
        } catch (error) {
            console.log('Failed to save theme setting:', error);
        }
    };

    // سیستم اسکرول تب‌ها - ساده و کارآمد
    const TAB_HEADER_HEIGHT = 80; // افزایش ارتفاع برای اطمینان
    
    // اسکرول دستی - فعال کردن تب بر اساس موقعیت اسکرول
    React.useEffect(() => {
        let scrollTimeout: number;
        
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // محاسبه موقعیت هر بخش
                const sitesSection = document.getElementById('sites-section');
                const settingsSection = document.getElementById('settings-section');
                const notesSection = document.getElementById('notes-section');
                const reportSection = document.getElementById('report-section');
                
                if (sitesSection && settingsSection && notesSection && reportSection) {
                    const sitesTop = sitesSection.offsetTop;
                    const settingsTop = settingsSection.offsetTop;
                    const notesTop = notesSection.offsetTop;
                    const reportTop = reportSection.offsetTop;
                    
                    // تعیین تب فعال بر اساس موقعیت اسکرول
                    if (scrollTop < settingsTop - 60) {
                        if (tabValue !== 0) setTabValue(0);
                    } else if (scrollTop < reportTop - 60) {
                        if (tabValue !== 1) setTabValue(1);
                    } else if (scrollTop < notesTop - 60) {
                        if (tabValue !== 2) setTabValue(2);
                    } else {
                        if (tabValue !== 3) setTabValue(3);
                    }
                }
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [tabValue]);

    // کلیک روی تب - اسکرول به بخش مربوطه
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        
        // اسکرول به بخش مورد نظر با افست
        setTimeout(() => {
            console.log('Tab changed to:', newValue);
            
            if (newValue === 0) {
                const element = document.getElementById('sites-section');
                console.log('Sites section element:', element);
                if (element) {
                    const headerOffset = 60;
                    const elementPosition = element.getBoundingClientRect().top;
                    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const offsetPosition = elementPosition + currentScrollTop - headerOffset;
                    
                    console.log('Element position:', elementPosition);
                    console.log('Current scroll top:', currentScrollTop);
                    console.log('Offset position:', offsetPosition);
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                    console.log('Scrolled to sites section');
                } else {
                    console.log('Sites section not found!');
                }
            } else if (newValue === 1) {
                const element = document.getElementById('settings-section');
                console.log('Settings section element:', element);
                if (element) {
                    const headerOffset = 60;
                    const elementPosition = element.getBoundingClientRect().top;
                    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const offsetPosition = elementPosition + currentScrollTop - headerOffset;
                    
                    console.log('Element position:', elementPosition);
                    console.log('Current scroll top:', currentScrollTop);
                    console.log('Offset position:', offsetPosition);
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                    console.log('Scrolled to settings section');
                } else {
                    console.log('Settings section not found!');
                }
            } else if (newValue === 2) {
                const element = document.getElementById('report-section');
                console.log('Report section element:', element);
                if (element) {
                    const headerOffset = 60;
                    const elementPosition = element.getBoundingClientRect().top;
                    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const offsetPosition = elementPosition + currentScrollTop - headerOffset;
                    
                    console.log('Element position:', elementPosition);
                    console.log('Current scroll top:', currentScrollTop);
                    console.log('Offset position:', offsetPosition);
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                    console.log('Scrolled to report section');
                } else {
                    console.log('Report section not found!');
                }
            } else if (newValue === 3) {
                const element = document.getElementById('notes-section');
                console.log('Notes section element:', element);
                if (element) {
                    const headerOffset = 60;
                    const elementPosition = element.getBoundingClientRect().top;
                    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const offsetPosition = elementPosition + currentScrollTop - headerOffset;
                    
                    console.log('Element position:', elementPosition);
                    console.log('Current scroll top:', currentScrollTop);
                    console.log('Offset position:', offsetPosition);
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                    console.log('Scrolled to notes section');
                } else {
                    console.log('Notes section not found!');
                }
            }
        }, 100);
    };

    const currentTheme = isDarkMode ? darkTheme : lightTheme;

    // Update body data-theme attribute for CSS
    React.useEffect(() => {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={currentTheme}>
                <CssBaseline />
                <div className="App" dir="rtl" >
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2,
                        borderRadius: 0,
                        background: isDarkMode 
                            ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.05) 0%, rgba(0, 233, 255, 0.02) 100%)'
                            : '#0067A5',
                        borderBottom: isDarkMode 
                            ? '1px solid rgba(0, 234, 255, 0.47)'
                            : '1px solid rgb(0, 234, 255)',
               
                    
                    }} 
                    dir="ltr"
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 60 }}>
                        <Avatar
                            src="/images/myLogo.png"
                            alt="RTL Extension Logo"
                            sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: 1.5,
                                boxShadow: '0 2px 8px rgba(0, 233, 255, 0.2)'
                            }}
                        />
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                                variant="h6" 
                                component="h1" 
                                sx={{ 
                                    mb: 0.5, 
                                    fontWeight: 600, 
                                    fontSize: '0.95rem',
                                    lineHeight: 1.2,
                                    color: '#ffffff'
                                }}
                            >
                                ChatGPT RTL (Persian/Farsi)
                            </Typography>
                            
                            <Chip 
                                label={`نسخه ${manifest.version}`} 
                                size="small" 
                                sx={{ 
                                    fontSize: '0.65rem',
                                    height: 20,
                                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                                    color: isDarkMode ? '#00e9ff' : '#ffffff',
                                    border: isDarkMode ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
                                    fontWeight: 500
                                }} 
                            />
                        </Box>
                        
                        <Tooltip title={isDarkMode ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}>
                            <IconButton 
                                onClick={handleThemeToggle}
                                sx={{ 
                                    color: isDarkMode ? '#FFD700' : '#FF8F00',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 143, 0, 0.1)',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <SvgIcon sx={{ 
                                    fontSize: '1.2rem',
                                    color: isDarkMode ? '#FFD700' : '#FF8F00'
                                }}>
                                    <path d={isDarkMode ? mdiWeatherSunny : mdiWeatherNight} />
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>



                <Box sx={{ textAlign: 'center', py: 3, px: 2 ,    background: isDarkMode 
                            ? 'transparent'
                            : '#b3d1e4' }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontSize: '0.8rem',
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 1)',
                            lineHeight: 1.4,
                         
                            fontWeight: 400
                        }}
                    >
                        این افزونه ساخته شده تا استفاده از هوش مصنوعی برای فارسی زبانان شیرین تر و لذت بخش تر باشد.
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ 
                    backgroundColor: isDarkMode ? '#1a1a2e' : '#e0f2fe',
                    // border: isDarkMode ? 'none' : '1px solid #e2e8f0',
                    borderRadius: isDarkMode ? 0 : 1
                }}>
                    <AppBar 
                        position="sticky"
                        sx={{
                            backgroundColor: isDarkMode ? '#1a1a2e' : '#0067A5',
                            color: isDarkMode ? '#ffffff' : '#ffffff',
                            // borderBottom: isDarkMode ? '1px solid rgba(0, 233, 255, 0.2)' : '1px solid #e2e8f0'
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            style={{ 
                                direction: 'rtl',
                                boxShadow: 'none'
                        
                            }}
                        >
                            <Tab label="سایت‌ها" />
                            <Tab label="تنظیمات" />
                            <Tab label="گزارش مشکل" />
                            <Tab label="درباره افزونه" />
                        </Tabs>
                    </AppBar>
                    
               
                        <div id="sites-section" style={{ paddingTop: '20px', background: isDarkMode ? 'transparent' : '#e0f2fe' }}>
                        {/* Manual RTL Banner */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            gap: 1,
                            mb: 2,
                            mt: 2.5,
                            p: 1.5,
                            borderRadius: 1,
                            background: isDarkMode 
                                ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                            border: isDarkMode 
                                ? '1px solid rgba(0, 233, 255, 0.3)' 
                                : '1px solid rgba(30, 64, 175, 0.2)',
                            mx: 2
                        }}>
                            {/* Right side - Logo and text */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, direction: 'rtl' }}>
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
                            
                            {/* Left side - Settings icon and status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, direction: 'ltr' }}>
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
                                    {(() => {
                                        if (manualRtlSettings.enabled === 'disabled') {
                                            return 'غیرفعال';
                                        }
                                        if (manualRtlSettings.enabled === 'enabled') {
                                            if (manualRtlSettings.manualRtlSiteMode === 'all') {
                                                return 'فعال برای همه سایت‌ها';
                                            }
                                            if (manualRtlSettings.manualRtlSiteMode === 'ai_sites') {
                                                return 'فعال برای سایت‌های هوش مصنوعی';
                                            }
                                            if (manualRtlSettings.manualRtlSiteMode === 'allowed_sites') {
                                                return 'فعال برای سایت‌های مجاز';
                                            }
                                            if (manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed') {
                                                return (
                                                    <>
                                                        فعال برای هوش مصنوعی‌ها<br />
                                                        و سایت‌های مجاز
                                                    </>
                                                );
                                            }
                                            return 'فعال';
                                        }
                                        if (manualRtlSettings.enabled === 'allowed_sites') {
                                            return 'فعال برای سایت‌های مجاز';
                                        }
                                        return 'غیرفعال';
                                    })()}
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
                        
                       
                        
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 2.2, 
                                mt: 2.5,
                                textAlign: 'center', 
                                direction: 'rtl', 
                                fontFamily: 'iranyekan',
                                fontWeight: 600,
                                color: isDarkMode ? '#ffffff' : '#1e293b'
                            }}
                        >
                              هوش مصنوعی‌هایی که پشتیبانی میشود
                            </Typography>
                            <div className="listSite">
                            <Box sx={{ p: 2 }}>
                                <ServiceList />
                                </Box>
                            </div>
                        </div>
                        
                        <div id="settings-section">
                            <Settings
                                rtlAlgorithm={rtlAlgorithm}
                                onRtlAlgorithmChange={handleRtlAlgorithmChange}
                                supportHide={supportHide}
                                onSupportChange={handleSupportChange}
                                isDarkMode={isDarkMode}
                                manualRtlSettings={manualRtlSettings}
                                onManualRtlSettingsChange={handleManualRtlSettingsChange}
                            />
                            
                        </div>

                        
                        <div id="report-section">
                               <Box sx={{ 
                                textAlign: 'center', 
                                mt: 2, 
                                p: 2, 
                                background: isDarkMode 
                                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                                borderRadius: 0, 
                                mb: 3,
                                borderTop: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af',
                                borderBottom: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af'
                            }}>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600,
                                    color: isDarkMode ? '#ffffff' : '#1e293b'
                                }}>
                                    گزارش مشکل و پشتیبانی
                                </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ 
                                        mb: 2, 
                                        fontWeight: 600, 
                                        color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1
                                    }}>
                                        <SvgIcon sx={{ 
                                            fontSize: '1.5rem',
                                            color: isDarkMode ? '#FF9800' : '#F57C00'
                                        }}>
                                            <path d={mdiBullhorn} />
                                        </SvgIcon>
                                        نکته مهم درباره عملکرد افزونه
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify', 
                                        fontWeight: 500 
                                    }}>
                                        دنیای هوش مصنوعی به‌سرعت در حال پیشرفت است و وب‌سایت‌های مرتبط نیز به‌طور مداوم به‌روزرسانی می‌شوند؛ از تغییر در ساختار HTML و کدهای CSS و JavaScript گرفته تا بهبودهای امنیتی، عملکردی و اضافه‌شدن قابلیت‌های جدید. به همین دلیل ممکن است عملکرد افزونه در برخی موارد دچار اختلال موقت شود.
                                        <br /><br />
                                        <strong style={{ color: isDarkMode ? '#00e9ff' : '#2563eb' }}>راه‌حل چیست؟</strong>
                                        <br />
                                        اگر افزونه روی سایتی کار نمی‌کند، این کاملاً طبیعی است! 
                                        اگر با مشکلی مواجه شدید، لطفاً از طریق <a href="https://chatgpt-rtl.ir/report/?source=extension-popup-telegram-help" target="_blank" rel="noopener noreferrer" style={{ color: isDarkMode ? '#00e9ff' : '#1e40af', textDecoration: 'underline' }}>تلگرام</a> گزارش دهید تا سریع‌تر حل شود.
                                        <br /><br />
                                        همچنین پیشنهادات و ایده‌های شما برای بهبود افزونه بسیار ارزشمند است و از ارسال آن‌ها استقبال می‌کنیم.
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                            <a href="https://chatgpt-rtl.ir/report/?source=extension-popup-telegram-contact" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Typography variant="body2" sx={{ 
                                                    color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                                    '&:hover': { textDecoration: 'underline' }, 
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    تلگرام
                                                </Typography>
                                            </a>
                                            <Typography variant="body2" sx={{ 
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)', 
                                                fontSize: '0.8rem' 
                                            }}>
                                                - برای تماس سریع
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 3 }}>
                                        <ChangesList />
                                    </Box>
                                </Box>
                            </Box>
                        </div>
                        
                        <div id="notes-section" style={{ paddingBottom: '85px' }}>
                            <Box sx={{ 
                                textAlign: 'center', 
                                mt: 2, 
                                p: 2, 
                                background: isDarkMode 
                                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                                borderRadius: 0, 
                                mb: 3,
                                borderTop: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af',
                                borderBottom: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af'
                            }}>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600,
                                    color: isDarkMode ? '#ffffff' : '#1e293b'
                                }}>
                                    درباره افزونه
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify' 
                                    }}>
                                        این افزونه‌ی ChatGPT RTL (Persian/Farsi) بیش از ۲ سال است که در کنار شماست و امروز با افتخار میزبان بیش از ۱۷ هزار کاربر فعال است.
در ابتدا صرفاً برای ChatGPT اصلی طراحی شد، اما به لطف استقبال گسترده و درخواست‌های مکرر کاربران، به‌مرور برای سایر وب‌سایت‌های هوش مصنوعی نیز توسعه پیدا کرده است.
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify' 
                                    }}>
                                        هدف اصلی این پروژه از ابتدا ساده بوده: فراهم کردن تجربه‌ای روان و کاربردی برای فارسی‌زبانان در دنیای هوش مصنوعی.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <a href="https://chromewebstore.google.com/detail/pjpmebofipgpjaincgoboibbmicccbne" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ 
                                                color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                                '&:hover': { textDecoration: 'underline' }, 
                                                fontWeight: 600,
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.5
                                            }}>
                                                <SvgIcon sx={{ 
                                                    fontSize: '1rem',
                                                    color: isDarkMode ? '#FFD700' : '#FF8F00'
                                                }}>
                                                    <path d={mdiStar} />
                                                </SvgIcon>
                                                صفحه افزونه در Chrome Store
                                            </Typography>
                                        </a>
                                    </Box>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify' 
                                    }}>
                                        این افزونه با عشق و انرژی شخصی ساخته شده و همچنان رایگان در اختیار شما قرار دارد. حمایت شما، چه با ثبت نظر و امتیاز و چه با معرفی افزونه به دوستان و دیگران، انگیزه‌ی ادامه‌ی مسیر و توسعه‌ی قابلیت‌های جدید را برای من فراهم می‌کند. اگر مایل بودید می‌توانید با یک دونیت کوچک نیز از پروژه حمایت کنید.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <a href="https://chatgpt-rtl.ir/supporters/?source=extension-popup-donito-about" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ 
                                                color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                                '&:hover': { textDecoration: 'underline' }, 
                                                fontWeight: 600,
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.5
                                            }}>
                                                <SvgIcon sx={{ 
                                                    fontSize: '1rem',
                                                    color: isDarkMode ? '#E91E63' : '#C2185B'
                                                }}>
                                                    <path d={mdiHeart} />
                                                </SvgIcon>
                                                حمایت مالی (دونیت)
                                            </Typography>
                                        </a>
                                    </Box>
                                </Box>
                                
                            </Box>
                        </div>
                   
                </Paper>

            </div>

            {/* فوتر ساده */}
            <div className="sticky-footer">
                <div className="sticky-footer-content">
                    <div className="footer-links">
                        <a 
                            href="https://chatgpt-rtl.ir/report/?source=extension-popup-footer-report" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            گزارش مشکل
                        </a>
                        
                        <span className="footer-separator">|</span>
                        
                        <a 
                            href="https://chromewebstore.google.com/detail/pjpmebofipgpjaincgoboibbmicccbne" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            امتیازدهی در Chrome Store
                        </a>
                        
                        <span className="footer-separator">|</span>
                        
                        <a 
                            href="https://chatgpt-rtl.ir/supporters/?source=extension-popup-donito-footer" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            حمایت مالی
                        </a>
                    </div>
                </div>
            </div>
        </ThemeProvider>
        </CacheProvider>
    );
}

export default App;