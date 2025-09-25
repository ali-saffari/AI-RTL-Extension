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
    AppBar
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import ServiceList, { services } from './list';
import Settings from './Settings';
import './App.css';

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
            paper: '#1a1a2e',
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
        },
        MuiList: {
            styleOverrides: {
                root: {
                    direction: 'ltr',
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    direction: 'ltr',
                },
            },
        },
    },
});

function App() {
    const [tabValue, setTabValue] = React.useState(0);
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('auto');

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
                const reportSection = document.getElementById('report-section');
                
                if (sitesSection && settingsSection && reportSection) {
                    const sitesTop = sitesSection.offsetTop;
                    const settingsTop = settingsSection.offsetTop;
                    const reportTop = reportSection.offsetTop;
                    
                    // تعیین تب فعال بر اساس موقعیت اسکرول
                    if (scrollTop < settingsTop - 60) {
                        if (tabValue !== 0) setTabValue(0);
                    } else if (scrollTop < reportTop - 60) {
                        if (tabValue !== 1) setTabValue(1);
                    } else {
                        if (tabValue !== 2) setTabValue(2);
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
            }
        }, 100);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className="App" dir="rtl">
                <Paper elevation={2} sx={{ p: 2, m: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src="/images/myLogo.png"
                            alt="RTL Extension Logo"
                            sx={{ width: 50, height: 50, borderRadius: 1 }}
                        />
                        
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="h1" sx={{ mb: 0.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                ChatGPT RTL (Persian/Farsi)
                            </Typography>
                            
                            <Chip label="نسخه 2.90.10" size="small" sx={{ fontSize: '0.6rem' }} />
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{ textAlign: 'center', mb: 2, px: 2 }}>
                    <Typography variant="body2">
                        این افزونه ساخته شده تا استفاده از هوش مصنوعی برای فارسی زبانان شیرین تر و لذت بخش تر باشد.
                    </Typography>
                </Box>

                <Paper>
                    <AppBar position="sticky">
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{ direction: 'rtl' }}
                        >
                            <Tab label="سایت‌ها" />
                            <Tab label="تنظیمات" />
                            <Tab label="گزارش مشکل" />
                        </Tabs>
                    </AppBar>
                    
                    <Box sx={{ p: 2 }}>
                        <div id="sites-section" style={{ marginBottom: '40px' }}>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 2.2, 
                                mt: 2.5,
                                textAlign: 'center', 
                                direction: 'rtl', 
                                fontFamily: 'iranyekan',
                                fontWeight: 600
                            }}
                        >
                              هوش مصنوعی‌هایی که پشتیبانی میشود
                            </Typography>
                            <div className="listSite">
                                <ServiceList />
                            </div>
                        </div>
                        
                        <div id="settings-section">
                            <Settings
                                rtlAlgorithm={rtlAlgorithm}
                                onRtlAlgorithmChange={setRtlAlgorithm}
                            />
                        </div>
                        
                        <div id="report-section">
                            <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    گزارش مشکل
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                        تماس با توسعه‌دهنده
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                        برای گزارش مشکلات یا پیشنهادات، با من در تماس باشید
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <a href="https://alisaffari.ir/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                                                وب‌سایت شخصی
                                            </Typography>
                                        </a>
                                    </Box>
                                </Paper>
                                
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                        صفحه افزونه
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                        برای ثبت نظر و امتیازدهی به افزونه
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <a href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                                                Chrome Web Store
                                            </Typography>
                                        </a>
                                    </Box>
                                </Paper>
                                
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                        حمایت مالی
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                        اگر افزونه برایتان مفید بوده، از من حمایت کنید
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <a href="https://zarinp.al/719522" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                                                دونیت (ZarinPal)
                                            </Typography>
                                        </a>
                                    </Box>
                                </Paper>
                            </Box>
                        </div>
                    </Box>
                </Paper>

                <div className="appinfo">
                    <div className="appinfo-note">
                        <span>یاداشت برنامه نویس</span>
                        <p>
                            در ابتدا این افزونه صرفا برای ChatGPT اصلی ساخته شده بود...
                            ولی با توجه به استقبال فراوان و درخواست کاربران برای سایت های دیگر نیز فعال شد.
                        </p>
                        <p>
                            باید توجه داشت که این افزونه روی قالب اصلی سایت ها تغیر اعمال میکند و در صورتی که این
                            سایت ها برای آپدیت، ساختار قالب را تغیر دهند ممکن است این افزونه از کار بیوفتد یا بخشی از آن
                            کار نکند.
                            در صورت مشاهده به من خبر دهید تا با نسخه جدید سازگار کنم!
                        </p>
                    </div>

                    <div className="appinfo-link">
                        <a href="https://alisaffari.ir/" target="_blank" rel="noopener noreferrer">
                            ارتباط با من
                        </a>
                    </div>

                    <div className="appinfo-note">
                        <p>
                            اگر دوست داشتید برای افزونه نظر ثبت کنید تا این افزونه بیشتر دیده بشه و من بیشتر انرژی بگیرم 😀
                        </p>
                    </div>

                    <div className="appinfo-link">
                        <a 
                            href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            صفحه افزونه
                        </a>
                    </div>

                    <div className="appinfo-note">
                        <p>
                            افزونه‌ی ChatGPT RTL (Persian/Farsi) با عشق برای فارسی‌زبان‌ها ساخته شده و رایگانه. اگه برات مفید بوده و دوست داری توسعه‌ش ادامه پیدا کنه، می‌تونی با یه دونیت کوچیک ازم حمایت کنی.
                            <br />
                            ✔️ حمایت‌ها صرف به‌روزرسانی، اضافه کردن امکانات جدید و بهتر شدن افزونه می‌شن.
                        </p>
                    </div>

                    <div className="appinfo-link">
                        <a href="https://zarinp.al/719522" target="_blank" rel="noopener noreferrer">
                            حمایت مالی (دونیت)
                        </a>
                    </div>
                </div>
            </div>

            {/* فوتر ساده */}
            <div className="sticky-footer">
                <div className="sticky-footer-content">
                    <div className="footer-links">
                        <a 
                            href="https://alisaffari.ir/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            ارتباط با من
                        </a>
                        
                        <span className="footer-separator">|</span>
                        
                        <a 
                            href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            امتیازدهی در Chrome Store
                        </a>
                        
                        <span className="footer-separator">|</span>
                        
                        <a 
                            href="https://zarinp.al/719522" 
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
    );
}

export default App;