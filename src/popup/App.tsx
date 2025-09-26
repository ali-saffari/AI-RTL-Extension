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
import ChangesList from './ChangesList';
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
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('advanced_section');
    const [supportHide, setSupportHide] = React.useState(false);

    // Load settings from storage on component mount
    React.useEffect(() => {
        chrome.storage.sync.get(['rtlAlgorithm', 'supportHide'], (result) => {
            if (result.rtlAlgorithm) {
                setRtlAlgorithm(result.rtlAlgorithm);
            }
            if (result.supportHide !== undefined) {
                setSupportHide(result.supportHide);
            }
        });
    }, []);

    // Save RTL algorithm setting to storage when changed
    const handleRtlAlgorithmChange = (value: string) => {
        setRtlAlgorithm(value);
        chrome.storage.sync.set({ rtlAlgorithm: value });
    };

    // Save support setting to storage when changed
    const handleSupportChange = (enabled: boolean) => {
        setSupportHide(enabled);
        chrome.storage.sync.set({ supportHide: enabled });
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

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className="App" dir="rtl" style={{ paddingBottom: '60px' }}>
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
                            <Tab label="درباره افزونه" />
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
                                onRtlAlgorithmChange={handleRtlAlgorithmChange}
                                supportHide={supportHide}
                                onSupportChange={handleSupportChange}
                            />
                        </div>
                        
                        <div id="report-section">
                            <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    گزارش مشکل و پشتیبانی
                                </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#00e9ff', textAlign: 'center' }}>
                                        📢 نکته مهم درباره عملکرد افزونه
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8, textAlign: 'justify', fontWeight: 500 }}>
                                        دنیای هوش مصنوعی به‌سرعت در حال پیشرفت است و وب‌سایت‌های مرتبط نیز به‌طور مداوم به‌روزرسانی می‌شوند؛ از تغییر در ساختار HTML و کدهای CSS و JavaScript گرفته تا بهبودهای امنیتی، عملکردی و اضافه‌شدن قابلیت‌های جدید. به همین دلیل ممکن است عملکرد افزونه در برخی موارد دچار اختلال موقت شود.
                                        <br /><br />
                                        <strong style={{ color: '#00e9ff' }}>راه‌حل چیست؟</strong>
                                        <br />
                                        اگر افزونه روی سایتی کار نمی‌کند، این کاملاً طبیعی است! 
                                        اگر با مشکلی مواجه شدید، لطفاً از طریق لینک‌های زیر گزارش دهید تا سریع‌تر حل شود.
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                            <a href="https://chromewebstore.google.com/detail/pjpmebofipgpjaincgoboibbmicccbne/support" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Typography variant="body2" sx={{ color: '#00e9ff', '&:hover': { textDecoration: 'underline' }, fontWeight: 600 }}>
                                                    📝 ارسال گزارش
                                                </Typography>
                                            </a>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                                                - برای گزارش مشکل یا پیشنهاد
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                            <a href="https://alisaffari.ir/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Typography variant="body2" sx={{ color: '#00e9ff', '&:hover': { textDecoration: 'underline' }, fontWeight: 600 }}>
                                                    💬 تماس مستقیم
                                                </Typography>
                                            </a>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                                                - برای تماس شخصی با توسعه‌دهنده
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 3 }}>
                                        <ChangesList />
                                    </Box>
                                </Box>
                            </Box>
                        </div>
                        
                        <div id="notes-section">
                            <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    درباره افزونه
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8, textAlign: 'justify' }}>
                                        این افزونه‌ی ChatGPT RTL (Persian/Farsi) بیش از ۲ سال است که در کنار شماست و امروز با افتخار میزبان بیش از ۱۷ هزار کاربر فعال است.
در ابتدا صرفاً برای ChatGPT اصلی طراحی شد، اما به لطف استقبال گسترده و درخواست‌های مکرر کاربران، به‌مرور برای سایر وب‌سایت‌های هوش مصنوعی نیز توسعه پیدا کرده است.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8, textAlign: 'justify' }}>
                                        هدف اصلی این پروژه از ابتدا ساده بوده: فراهم کردن تجربه‌ای روان و کاربردی برای فارسی‌زبانان در دنیای هوش مصنوعی.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <a href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ 
                                                color: '#00e9ff', 
                                                '&:hover': { textDecoration: 'underline' }, 
                                                fontWeight: 600,
                                                textAlign: 'center'
                                            }}>
                                                🌟 صفحه افزونه در Chrome Store
                                            </Typography>
                                        </a>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8, textAlign: 'justify' }}>
                                        این افزونه با عشق و انرژی شخصی ساخته شده و همچنان رایگان در اختیار شما قرار دارد. حمایت شما، چه با ثبت نظر و امتیاز و چه با معرفی افزونه به دوستان و دیگران، انگیزه‌ی ادامه‌ی مسیر و توسعه‌ی قابلیت‌های جدید را برای من فراهم می‌کند. اگر مایل بودید می‌توانید با یک دونیت کوچک نیز از پروژه حمایت کنید.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <a href="https://donito.me/chatgpt_rtl" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ 
                                                color: '#00e9ff', 
                                                '&:hover': { textDecoration: 'underline' }, 
                                                fontWeight: 600,
                                                textAlign: 'center'
                                            }}>
                                                💝 حمایت مالی (دونیت)
                                            </Typography>
                                        </a>
                                    </Box>
                                </Box>
                                
                            </Box>
                        </div>
                    </Box>
                </Paper>

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
                            href="https://donito.me/chatgpt_rtl" 
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