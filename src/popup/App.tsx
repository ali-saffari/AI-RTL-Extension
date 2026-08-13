import React from 'react';
import { 
    ThemeProvider, 
    createTheme,
    Paper,
    Box,
    Typography,
    Chip,
    Avatar,
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
import { mdiWeatherSunny, mdiWeatherNight, mdiBullhorn, mdiStar, mdiHeart } from '@mdi/js';
import CssBaseline from '@mui/material/CssBaseline';
import ServiceList, { services } from './list';
import QuickSettings from './QuickSettings';
import ManualRtlBanner from './ManualRtlBanner';
import ChangesList from './ChangesList';
import { ManualRtlSettings } from '../types/manualRtl';
import { isFirefoxRuntime } from '../utils/isFirefox';
import {
    getExtensionStoreUrl,
    getRateLinkText,
    getStorePageLinkText,
} from '../utils/storeLinks';
import './App.css';
import manifest from '../../public/manifest.chrome.json';

const firefoxDefaults = isFirefoxRuntime();
const extensionStoreUrl = getExtensionStoreUrl();
const storePageLinkText = getStorePageLinkText();
const rateLinkText = getRateLinkText();

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
        h1: { fontFamily: '"iranyekan"', fontWeight: 700 },
        h2: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h3: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h4: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h5: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h6: { fontFamily: '"iranyekan"', fontWeight: 500 },
        body1: { fontFamily: '"iranyekan"', fontWeight: 400 },
        body2: { fontFamily: '"iranyekan"', fontWeight: 400 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {},
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
        h1: { fontFamily: '"iranyekan"', fontWeight: 700 },
        h2: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h3: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h4: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h5: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h6: { fontFamily: '"iranyekan"', fontWeight: 500 },
        body1: { fontFamily: '"iranyekan"', fontWeight: 400 },
        body2: { fontFamily: '"iranyekan"', fontWeight: 400 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {},
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

function App() {
    const [tabValue, setTabValue] = React.useState(0);
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('advanced_full');
    const [supportHide, setSupportHide] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [manualRtlSettings, setManualRtlSettings] = React.useState<ManualRtlSettings>({
        manualRtlEnabled: firefoxDefaults ? false : true,
        manualRtlSiteMode: firefoxDefaults ? 'all' : 'allowed_sites',
        menuDisplayMode: 'logo_first',
        highlightMode: 'on_direction_change',
        highlightColor: '#ff0000',
        highlightOpacity: 0.3,
        logoDisplay: 'always',
        applyFont: true
    });
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [manualRtlInfoDismissed, setManualRtlInfoDismissed] = React.useState<boolean>(false);
    const mainScrollRef = React.useRef<HTMLDivElement>(null);

    // Load settings from storage on component mount
    const loadSettings = React.useCallback(() => {
        try {
            chrome.storage.sync.get(['rtlAlgorithmMode', 'supportHide', 'isDarkMode', 'manualRtlSettings', 'manualRtlInfoDismissed', ...services.map(s => s.key)], (result) => {
                if (result.rtlAlgorithmMode) {
                    setRtlAlgorithm(result.rtlAlgorithmMode);
                }
                if (result.supportHide !== undefined) {
                    setSupportHide(result.supportHide);
                }
                if (result.isDarkMode !== undefined) {
                    setIsDarkMode(result.isDarkMode);
                }
                // Use manualRtlSettings
                const settings = result.manualRtlSettings;
                if (settings) {
                    setManualRtlSettings({
                        ...manualRtlSettings,
                        ...settings,
                        ...(firefoxDefaults ? { manualRtlSiteMode: 'all' as const } : {})
                    });
                }
                // Load manualRtlInfoDismissed
                if (result.manualRtlInfoDismissed === true) {
                    setManualRtlInfoDismissed(true);
                }
                setIsLoading(false);
            });
        } catch (error) {
            // Extension context invalidated or other error - use default values
            setIsLoading(false);
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
                if (changes.manualRtlSettings) {
                    const newSettings = changes.manualRtlSettings?.newValue;
                    if (newSettings) {
                        setManualRtlSettings({
                            ...manualRtlSettings,
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
            // Silently handle save errors
        }
    };

    // Save support setting to storage when changed
    const handleSupportChange = (enabled: boolean) => {
        setSupportHide(enabled);
        try {
            chrome.storage.sync.set({ supportHide: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    // Save manual RTL settings to storage when changed
    const handleManualRtlSettingsChange = async (settings: ManualRtlSettings) => {
        setManualRtlSettings(settings);
        try {
            chrome.storage.sync.set({ manualRtlSettings: settings });
            // Manual RTL will be activated automatically via storage change listener in content scripts
        } catch (error) {
            // Silently handle save errors
        }
    };

    // Toggle theme and save to storage
    const handleThemeToggle = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        try {
            chrome.storage.sync.set({ isDarkMode: newTheme });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const getSectionOffset = (element: HTMLElement, container: HTMLElement) => {
        return element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    };

    // اسکرول دستی - فعال کردن تب بر اساس موقعیت اسکرول
    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        const container = mainScrollRef.current;
        if (!container) {
            return;
        }

        let scrollTimeout: number;
        
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = container.scrollTop;
                
                // محاسبه موقعیت هر بخش
                const sitesSection = document.getElementById('sites-section');
                const notesSection = document.getElementById('notes-section');
                const reportSection = document.getElementById('report-section');
                
                if (sitesSection && notesSection && reportSection) {
                    const notesTop = getSectionOffset(notesSection, container);
                    const reportTop = getSectionOffset(reportSection, container);
                    
                    // تعیین تب فعال بر اساس موقعیت اسکرول
                    if (scrollTop < reportTop - 60) {
                        if (tabValue !== 0) setTabValue(0);
                    } else if (scrollTop < notesTop - 60) {
                        if (tabValue !== 1) setTabValue(1);
                    } else {
                        if (tabValue !== 2) setTabValue(2);
                    }
                }
            }, 100);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [tabValue, isLoading]);

    // کلیک روی تب - اسکرول به بخش مربوطه
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        
        const sectionIds = ['sites-section', 'report-section', 'notes-section'];
        const sectionId = sectionIds[newValue];
        
        if (sectionId) {
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                const container = mainScrollRef.current;
                if (element && container) {
                    const headerOffset = 60;
                    const offsetPosition = getSectionOffset(element, container) - headerOffset;
                    
                    container.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 100);
        }
    };

    const currentTheme = isDarkMode ? darkTheme : lightTheme;

    // Update body data-theme attribute for CSS
    React.useEffect(() => {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Handle manualRtlInfoDismissed change
    const handleManualRtlInfoDismissedChange = React.useCallback((dismissed: boolean) => {
        setManualRtlInfoDismissed(dismissed);
        try {
            chrome.storage.sync.set({ manualRtlInfoDismissed: dismissed });
        } catch (error) {
            // Silently handle save errors
        }
    }, []);

    // Show loading screen while data is being loaded
    if (isLoading) {
        return (
            <CacheProvider value={cacheRtl}>
                <ThemeProvider theme={currentTheme}>
                    <CssBaseline />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            width: '100%'
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: 'iranyekan',
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                            }}
                        >
                            در حال بارگذاری...
                        </Typography>
                    </Box>
                </ThemeProvider>
            </CacheProvider>
        );
    }

    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={currentTheme}>
                <CssBaseline />
                <div className="App" dir="rtl" >
                <Paper 
                    className="popup-header"
                    elevation={0} 
                    sx={{ 
                        px: 1.75,
                        py: 1.1,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            src="/images/myLogo.png"
                            alt="RTL Extension Logo"
                            sx={{ 
                                width: 44, 
                                height: 44, 
                                ml: 0.5,
                                borderRadius: 1.5,
                                boxShadow: '0 2px 8px rgba(0, 233, 255, 0.2)'
                            }}
                        />
                        
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                                variant="h6" 
                                component="h1" 
                                sx={{ 
                                    fontWeight: 600, 
                                    fontSize: '0.9rem',
                                    lineHeight: 1.2,
                                    color: '#ffffff',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                AI RTL (Persian/Farsi)
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
                        
                        <Tooltip
                            title={isDarkMode ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
                            placement="bottom-end"
                            disableInteractive
                            PopperProps={{
                                modifiers: [
                                    {
                                        name: 'preventOverflow',
                                        options: {
                                            altAxis: true,
                                            padding: 8,
                                        },
                                    },
                                ],
                            }}
                        >
                            <IconButton 
                                onClick={handleThemeToggle}
                                sx={{ 
                                    color: isDarkMode ? '#FFD700' : '#FF8F00',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 143, 0, 0.1)',
                                    },
                                    transition: 'background-color 0.3s ease'
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

                <div className="popup-columns">
                <div className="popup-main" ref={mainScrollRef}>
                <div className="popup-main-inner">
                <Box sx={{ textAlign: 'center', py: 3, px: 2, background: isDarkMode 
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
                        این افزونه ساخته شده تا استفاده از هوش مصنوعی برای فارسی زبانان شیرین تر و لذت بخش تر باشد. امیدوارم از استفاده از این اکستشن لذت ببرید ❤️ و اگر دوست داشتید حمایت کنید
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ 
                    backgroundColor: isDarkMode ? '#1a1a2e' : '#e0f2fe',
                    borderRadius: isDarkMode ? 0 : 1
                }}>
                    <AppBar 
                        position="sticky"
                        sx={{
                            backgroundColor: isDarkMode ? '#1a1a2e' : '#0067A5',
                            color: '#ffffff'
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            textColor={isDarkMode ? 'primary' : 'inherit'}
                            style={{ 
                                direction: 'rtl',
                                boxShadow: 'none'
                            }}
                            sx={!isDarkMode ? {
                                '& .MuiTab-root': {
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    opacity: 1,
                                    '&.Mui-selected': {
                                        color: '#ffffff',
                                        opacity: 1,
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#ffffff',
                                },
                            } : undefined}
                        >
                            <Tab label="سایت‌ها" />
                            <Tab label="گزارش مشکل" />
                            <Tab label="درباره افزونه" />
                        </Tabs>
                    </AppBar>
                    
                    <div id="sites-section" style={{ paddingTop: '20px', background: isDarkMode ? 'transparent' : '#e0f2fe' }}>
                        {manualRtlSettings.manualRtlEnabled && (
                            <ManualRtlBanner
                                isDarkMode={isDarkMode}
                                manualRtlSettings={manualRtlSettings}
                                onManualRtlSettingsChange={handleManualRtlSettingsChange}
                                manualRtlInfoDismissed={manualRtlInfoDismissed}
                                onManualRtlInfoDismissedChange={handleManualRtlInfoDismissedChange}
                            />
                        )}
                        
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 1.2, 
                                mt: manualRtlSettings.manualRtlEnabled ? 4.5 : 1.2,
                                textAlign: 'center',
                                fontFamily: 'iranyekan',
                                fontWeight: 600,
                                color: isDarkMode ? '#ffffff' : '#1e293b'
                            }}
                        >
                              سایت هایی که
                               راست چین هوشمند پشتیبانی میشود
                            </Typography>
                            <div className="listSite">
                            <Box sx={{ p: 2 }}>
                                <ServiceList />
                                </Box>
                            </div>
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
                                        اگر با مشکلی مواجه شدید، لطفاً از طریق <a href="https://ai-rtl.ir/report/?source=extension-popup-telegram-help" target="_blank" rel="noopener noreferrer" style={{ color: isDarkMode ? '#00e9ff' : '#1e40af', textDecoration: 'underline' }}>تلگرام</a> گزارش دهید تا سریع‌تر حل شود.
                                        <br /><br />
                                        همچنین پیشنهادات و ایده‌های شما برای بهبود افزونه بسیار ارزشمند است و از ارسال آن‌ها استقبال می‌کنیم.
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                            <a href="https://ai-rtl.ir/report/?source=extension-popup-telegram-contact" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
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
                        
                        <div id="notes-section" style={{ paddingBottom: '20px' }}>
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
                                        این افزونه‌ی AI RTL (Persian/Farsi) بیش از ۲ سال است که در کنار شماست و امروز با افتخار میزبان بیش از ۲۰ هزار کاربر فعال است.
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
                                        <a href={extensionStoreUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
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
                                                {storePageLinkText}
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
                                        <a href="https://donate.sudoshz.ir/u/ai-rtl" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
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
                </div>
                <aside className="popup-side-menu" dir="rtl" aria-label="تنظیمات افزونه">
                    <QuickSettings
                        rtlAlgorithm={rtlAlgorithm}
                        onRtlAlgorithmChange={handleRtlAlgorithmChange}
                        supportHide={supportHide}
                        onSupportChange={handleSupportChange}
                        isDarkMode={isDarkMode}
                        manualRtlSettings={manualRtlSettings}
                        onManualRtlSettingsChange={handleManualRtlSettingsChange}
                    />
                </aside>
                </div>

            {/* فوتر ساده */}
            <div className="sticky-footer">
                <div className="sticky-footer-content">
                    <div className="footer-links">
                        <a 
                            href="https://ai-rtl.ir/report/?source=extension-popup-footer-report" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            گزارش مشکل
                        </a>
                        
                        <span className="footer-separator">|</span>
                        
                        <a 
                            href={extensionStoreUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            {rateLinkText}
                        </a>
                        
                        <span className="footer-separator">|</span>
                        
                        <a 
                            href="https://donate.sudoshz.ir/u/ai-rtl" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            حمایت مالی
                        </a>
                    </div>
                </div>
            </div>
            </div>
        </ThemeProvider>
        </CacheProvider>
    );
}

export default App;