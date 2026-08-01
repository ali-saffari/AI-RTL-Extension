import React from 'react';
import { 
    ThemeProvider, 
    createTheme,
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Chip,
    SvgIcon
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import CssBaseline from '@mui/material/CssBaseline';
import { mdiWeatherSunny, mdiWeatherNight } from '@mdi/js';
import SettingsContent from './SettingsContent';
import manifest from '../../public/manifest.chrome.json';

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
        fontSize: 14,
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
            default: '#f5f7fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        divider: '#e2e8f0',
    },
    typography: {
        fontFamily: ['"iranyekan"', 'Tahoma', 'Arial'].join(','),
        fontSize: 14,
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
});

function OptionsApp() {
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    // Load theme preference from storage
    React.useEffect(() => {
        try {
            chrome.storage.sync.get(['isDarkMode'], (result) => {
                if (result.isDarkMode !== undefined) {
                    setIsDarkMode(result.isDarkMode);
                }
            });
        } catch (error) {
            console.log('Failed to load theme preference:', error);
        }
    }, []);

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

    const currentTheme = isDarkMode ? darkTheme : lightTheme;

    // Update body data-theme attribute for CSS
    React.useEffect(() => {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={currentTheme}>
                <CssBaseline />
                <Box 
                    sx={{ 
                        minHeight: '100vh',
                        backgroundColor: currentTheme.palette.background.default,
                    }}
                >
                    {/* Header */}
                    <AppBar 
                        position="sticky"
                        elevation={0}
                        sx={{
                            backgroundColor: isDarkMode 
                                ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                                : '#0067A5',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                                <Box>
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            color: '#ffffff',
                                            mb: 0.5
                                        }}
                                    >
                                        تنظیمات افزونه
                                    </Typography>
                                    <Chip 
                                        label={`نسخه ${manifest.version}`} 
                                        size="small" 
                                        sx={{ 
                                            fontSize: '0.7rem',
                                            height: 20,
                                            backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                                            color: isDarkMode ? '#00e9ff' : '#ffffff',
                                            border: isDarkMode ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
                                            fontWeight: 500
                                        }} 
                                    />
                                </Box>
                            </Box>
                            
                            <IconButton 
                                onClick={handleThemeToggle}
                                sx={{ 
                                    color: isDarkMode ? '#FFD700' : '#FF8F00',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 143, 0, 0.1)',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <SvgIcon sx={{ fontSize: '1.5rem' }}>
                                    <path d={isDarkMode ? mdiWeatherSunny : mdiWeatherNight} />
                                </SvgIcon>
                            </IconButton>
                        </Toolbar>
                    </AppBar>

                    {/* Main Content */}
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                        <SettingsContent isDarkMode={isDarkMode} />
                    </Container>
                </Box>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default OptionsApp;
