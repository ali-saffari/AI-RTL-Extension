import React from 'react';
import {
    Paper,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    useTheme,
    SvgIcon,
    CircularProgress,
    Alert
} from '@mui/material';
import { mdiInformationOutline, mdiTestTube } from '@mdi/js';

interface SettingsProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    analyticsEnabled: boolean;
    onAnalyticsChange: (enabled: boolean) => void;
    isDarkMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    supportHide,
    onSupportChange,
    analyticsEnabled,
    onAnalyticsChange,
    isDarkMode
}) => {
    const theme = useTheme();
    const [selectedValue, setSelectedValue] = React.useState(rtlAlgorithm);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('');
    const [testLoading, setTestLoading] = React.useState(false);
    const [testResult, setTestResult] = React.useState<{success: boolean, message: string} | null>(null);
    
    React.useEffect(() => {
        setSelectedValue(rtlAlgorithm);
    }, [rtlAlgorithm]);

    const algorithmDescriptions = {
        'advanced_section': {
            title: 'تحلیل پیشرفته بخش‌ها',
            description: 'هر بخش، جمله، پاراگراف و... به‌طور جداگانه توسط الگوریتم هوشمند بررسی شده و جهت متن تعیین می‌شود. این روش برای متون چندزبانه یا ترکیبی بسیار مناسب است و دقت بالایی در تشخیص جهت متن ارائه می‌دهد.',
            features: [
                'تحلیل جداگانه هر بخش',
                'مناسب برای متون چندزبانه',
                'دقت بالا در تشخیص'
            ]
        },
        'advanced_full': {
            title: 'تحلیل پیشرفته یکپارچه',
            description: 'کل متن پاسخ به‌عنوان یک ساختار واحد توسط الگوریتم پیشرفته پردازش شده و جهت مناسب انتخاب می‌شود. این روش ترکیب متعادلی از دقت و کارایی ارائه می‌دهد.',
            features: [
                'پردازش یکپارچه متن',
                'ترکیب دقت و کارایی',
                'مناسب برای متون طولانی',
                'الگوریتم جدید',
                'پیش‌فرض سیستم'
            ]
        },
        'first_word': {
            title: 'تشخیص مبتنی بر واژه آغازین',
            description: 'جهت متن تنها با بررسی اولین کلمه مشخص می‌گردد. این روش برای سیستم‌هایی با توان پردازشی محدود مناسب است و در صورت هنگ و قفل شدن سایت توصیه می‌شود.',
            features: [
                'سرعت بالا',
                'مصرف کم منابع',
                'مناسب سیستم‌های ضعیف',
                'راه‌حل مشکل هنگ'
            ]
        }
    };

    const handleInfoClick = (algorithm: string) => {
        setSelectedAlgorithm(algorithm);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedAlgorithm('');
    };

    // تابع برای تشخیص نام و نسخه مرورگر
    const getBrowserInfo = () => {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR') && !userAgent.includes('Brave')) {
            browserName = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Edg')) {
            browserName = 'Edge';
            const match = userAgent.match(/Edg\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('OPR')) {
            browserName = 'Opera';
            const match = userAgent.match(/OPR\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Brave')) {
            browserName = 'Brave';
            const match = userAgent.match(/Chrome\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = 'Safari';
            const match = userAgent.match(/Version\/(\d+)/);
            if (match) browserVersion = match[1];
        }
        
        return { name: browserName, version: browserVersion };
    };

    // تابع تست ارسال analytics (ارسال داده‌های واقعی)
    const handleTestAnalytics = async () => {
        setTestLoading(true);
        setTestResult(null);

        try {
            // دریافت userId از storage
            const settings = await chrome.storage.sync.get(['userId']);
            let userId = settings.userId;
            
            // اگر userId وجود نداشت، یک userId بساز
            if (!userId) {
                const timestamp = Date.now().toString(36);
                const randomPart = Math.random().toString(36).substring(2, 15);
                const extensionId = chrome.runtime.id || 'rtl-ext';
                userId = `${extensionId}-${timestamp}-${randomPart}`;
                // ذخیره userId
                await chrome.storage.sync.set({ userId: userId });
            }

            // دریافت داده‌های واقعی usageStats از storage
            const result = await chrome.storage.local.get(['usageStats']);
            const usageStats = result.usageStats || {};
            
            // بررسی اینکه آیا داده‌ای برای ارسال وجود دارد
            const statsKeys = Object.keys(usageStats);
            if (statsKeys.length === 0) {
                setTestResult({
                    success: false,
                    message: '⚠️ هیچ داده‌ای برای ارسال وجود ندارد. ابتدا از سایت‌های پشتیبانی شده استفاده کنید.'
                });
                setTestLoading(false);
                return;
            }

            // تبدیل usageStats به فرمت مناسب برای ارسال (همانند background script)
            const aggregatedData = Object.values(usageStats).map((stat: any) => ({
                serviceName: stat.serviceName,
                hostname: stat.hostname,
                totalDurationMs: stat.totalDurationMs,
                totalDurationMinutes: Math.round(stat.totalDurationMs / 60000),
                totalDurationHours: Math.round(stat.totalDurationMs / 3600000 * 100) / 100,
                sessionCount: stat.sessionCount,
                lastUsed: stat.lastUsed,
                firstUsed: stat.firstUsed
            }));

            // دریافت اطلاعات مرورگر
            const browserInfo = getBrowserInfo();
            
            // ساخت payload با داده‌های واقعی
            const payload = {
                userId: userId,
                timestamp: Date.now(),
                browser: {
                    name: browserInfo.name,
                    version: browserInfo.version
                },
                usage: aggregatedData
            };

            // ارسال درخواست
            const response = await fetch('https://api.chatgpt-rtl.ir/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const resultData = await response.json();

            if (response.ok && resultData.success) {
                // پاک کردن داده‌های ارسال شده (همانند background script)
                await chrome.storage.local.set({ usageStats: {} });
                setTestResult({
                    success: true,
                    message: `✅ ارسال موفق! ${aggregatedData.length} سرویس با موفقیت ارسال شد.`
                });
            } else {
                setTestResult({
                    success: false,
                    message: `❌ خطا: ${resultData.error || 'خطای نامشخص'}`
                });
            }
        } catch (error: any) {
            setTestResult({
                success: false,
                message: `❌ خطا: ${error.message || 'خطا در ارسال درخواست'}`
            });
        } finally {
            setTestLoading(false);
        }
    };
    
    return (
        <Box sx={{ p: 0 }}>
            <Box sx={{ 
                textAlign: 'center', 
                mt: 2, 
                p: 2, 
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
                borderRadius: 0, 
                mb: 3,
                borderTop: `1px solid ${theme.palette.primary.main}`,
                borderBottom: `1px solid ${theme.palette.primary.main}`
            }}>
                <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                }}>
                    تنظیمات افزونه
                </Typography>
         
            </Box>
            
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%',
            
            }}>
                {/* الگوریتم تشخیص RTL */}
                <Paper elevation={0} sx={{ 
                    m: 2, 
                    p: 2, 
                    borderRadius: 1,
                    background: isDarkMode ? '#2f2f41' : '#ffffff'
                }}>
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            mb: 0.5
                        }}>
                            الگوریتم تشخیص RTL
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            نحوه تشخیص راست به چپ
                        </Typography>
                    </Box>
                    
                            <RadioGroup
                                value={selectedValue}
                                onChange={(e) => {
                                    setSelectedValue(e.target.value);
                                    onRtlAlgorithmChange(e.target.value);
                                }}
                                sx={{ 
                                    direction: 'rtl',
                                    '& .MuiFormControlLabel-root': {
                                        marginLeft: 0,
                                        marginRight: 0,
                                        paddingLeft: 0,
                                        paddingRight: 0
                                    }
                                }}
                            >
                        <Paper elevation={1} sx={{ 
                            borderRadius: 3,
                            bgcolor: selectedValue === 'advanced_section' 
                                ? theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.1)' 
                                    : 'rgba(30, 64, 175, 0.2)'
                                : theme.palette.background.paper,
                            border: selectedValue === 'advanced_section' 
                                ? `${theme.palette.mode === 'dark' ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(30, 64, 175, 1)'}` 
                                : 'none',
                            mb: 2,
                            py: 2,
                            px: 1,
                            position: 'relative'
                        }}>
                            <FormControlLabel 
                                value="advanced_section" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{  mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" sx={{ 
                                                    fontWeight: 500, 
                                                    fontSize: '0.95rem',
                                                    color: theme.palette.text.primary
                                                }}>
                                                    تحلیل پیشرفته بخش‌ها
                                                </Typography>
                                                <IconButton 
                                                    onClick={() => handleInfoClick('advanced_section')}
                                                    size="small"
                                                    sx={{ 
                                                        color: theme.palette.text.primary,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.1)' 
                                                                : 'rgba(0, 0, 0, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <SvgIcon sx={{ 
                                                        fontSize: '1.25rem',
                                                        color: isDarkMode ? '#ffffff' : '#000000'
                                                    }}>
                                                        <path d={mdiInformationOutline} />
                                                    </SvgIcon>
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: '50%', 
                                                left: 15,
                                                transform: 'translateY(-50%)',
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                alignItems: 'flex-end', 
                                                gap: 0.5 
                                            }}>
                                                <Box component="span" sx={{ 
                                                    px: 1, 
                                                    py: 0.3, 
                                                    bgcolor: theme.palette.mode === 'dark' 
                                                        ? 'rgb(33, 46, 65)' 
                                                        : 'rgba(30, 64, 175, 0.1)',
                                                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                                    color: theme.palette.primary.main, 
                                                    borderRadius: 1, 
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    
                                                    جدید
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                }
                                sx={{ 
                                    direction: 'rtl', 
                                    marginLeft: 0,
                                    marginRight: 0,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    width: '100%'
                                }}
                            />
                        </Paper>
                        <Paper elevation={1} sx={{ 
                            borderRadius: 3,
                            bgcolor: selectedValue === 'advanced_full' 
                                ? theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.1)' 
                                    : 'rgba(30, 64, 175, 0.2)'
                                : theme.palette.background.paper,
                            border: selectedValue === 'advanced_full' 
                            ? `${theme.palette.mode === 'dark' ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(30, 64, 175, 1)'}` 
                                : 'none',
                            mb: 2,
                            py: 2,
                            px: 1,
                            position: 'relative'
                        }}>
                            <FormControlLabel 
                                value="advanced_full" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{ mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" sx={{ 
                                                    fontWeight: 500, 
                                                    fontSize: '0.95rem',
                                                    color: theme.palette.text.primary
                                                }}>
                                                    تحلیل پیشرفته یکپارچه
                                                </Typography>
                                                <IconButton 
                                                    onClick={() => handleInfoClick('advanced_full')}
                                                    size="small"
                                                    sx={{ 
                                                        color: theme.palette.text.primary,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.1)' 
                                                                : 'rgba(0, 0, 0, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <SvgIcon sx={{ 
                                                        fontSize: '1.25rem',
                                                        color: isDarkMode ? '#ffffff' : '#000000'
                                                    }}>
                                                        <path d={mdiInformationOutline} />
                                                    </SvgIcon>
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: '50%', 
                                                left: 15,
                                                transform: 'translateY(-50%)',
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                alignItems: 'flex-start', 
                                                gap: 0.5 
                                            }}>
                                                <Box component="span" sx={{ 
                                                    px: 1, 
                                                    py: 0.3, 
                                                    bgcolor: theme.palette.mode === 'dark' 
                                                        ? 'rgb(33, 46, 65)' 
                                                        : 'rgba(30, 64, 175, 0.1)',
                                                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                                    color: theme.palette.primary.main, 
                                                    borderRadius: 1, 
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    جدید
                                                </Box>
                                                {selectedValue !== 'advanced_full' && (
                                                    <Box component="span" sx={{ 
                                                        px: 0.5, 
                                                        py: 0.05, 
                                                        bgcolor: theme.palette.mode === 'dark' 
                                                            ? 'rgb(1, 91, 237)' 
                                                            : 'rgba(30, 64, 175, 0.2)',
                                                        color: theme.palette.text.secondary, 
                                                        borderRadius: 0.5, 
                                                        fontSize: '0.6rem',
                                                        fontWeight: 600
                                                    }}>
                                                        پیش‌فرض
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                }
                                sx={{ 
                                    direction: 'rtl', 
                                    marginLeft: 0,
                                    marginRight: 0,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    width: '100%'
                                }}
                            />
                        </Paper>
                        <Paper elevation={1} sx={{ 
                            borderRadius: 3,
                            bgcolor: selectedValue === 'first_word' 
                                ? theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.1)' 
                                    : 'rgba(30, 64, 175, 0.2)'
                                : theme.palette.background.paper,
                            border: selectedValue === 'first_word' 
                            ? `${theme.palette.mode === 'dark' ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(30, 64, 175, 1)'}` 
                                : 'none',
                            mb: 2,
                            py: 2,
                            px: 1
                        }}>
                            <FormControlLabel 
                                value="first_word" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body1" sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem',
                                                color: theme.palette.text.primary
                                            }}>
                                                تشخیص مبتنی بر واژه آغازین
                                            </Typography>
                                            <IconButton 
                                                onClick={() => handleInfoClick('first_word')}
                                                size="small"
                                                sx={{ 
                                                    color: theme.palette.text.primary,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255, 255, 255, 0.1)' 
                                                            : 'rgba(0, 0, 0, 0.1)'
                                                    }
                                                }}
                                            >
                                                <SvgIcon sx={{ 
                                                    fontSize: '1.25rem',
                                                    color: theme.palette.text.primary
                                                }}>
                                                    <path d={mdiInformationOutline} />
                                                </SvgIcon>
                                            </IconButton>
                                        </Box>
                                    </Box>
                                }
                                sx={{ 
                                    direction: 'rtl',
                                    marginLeft: 0,
                                    marginRight: 0,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    width: '100%'
                                }}
                            />
                        </Paper>
                    </RadioGroup>
                </Paper>

                {/* تنظیمات متن حمایت */}
                <Paper elevation={0} sx={{ 
                    m: 2, 
                    p: 2, 
                    borderRadius: 1,
                    background: isDarkMode ? '#2f2f41' : '#ffffff'
                }}>
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            mb: 0.5
                        }}>
                            تنظیمات نمایش متن حمایت
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            .این متن نشان‌دهنده فعال بودن افزونه روی سایت است. اگر نمایش آن باعث اذیت شدن شما می‌شود، می‌توانید آن را غیرفعال کنید
                        </Typography>
                    </Box>
                    
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
                                color: 'text.primary'
                            }}>
                                مخفی کردن متن حمایت
                            </Typography>
                     
                        </Box>
                        <Switch
                            checked={supportHide}
                            onChange={(e) => onSupportChange(e.target.checked)}
                            data-settings-switch="true"
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
                </Paper>

                {/* تنظیمات Analytics */}
                <Paper elevation={0} sx={{ 
                    m: 2, 
                    p: 2, 
                    borderRadius: 1,
                    background: isDarkMode ? '#2f2f41' : '#ffffff'
                }}>
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            mb: 0.5
                        }}>
                            تنظیمات Analytics
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            برای بهبود افزونه، اطلاعات استفاده از سایت‌های پشتیبانی شده به صورت ناشناس جمع‌آوری می‌شود. شما می‌توانید این قابلیت را غیرفعال کنید.
                        </Typography>
                    </Box>
                    
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
                                color: 'text.primary'
                            }}>
                                ارسال داده‌های استفاده به صورت ناشناس
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                mt: 0.5
                            }}>
                                داده‌های جمع‌آوری شده فقط شامل نام سایت و تعداد استفاده است
                            </Typography>
                        </Box>
                        <Switch
                            checked={analyticsEnabled}
                            onChange={(e) => onAnalyticsChange(e.target.checked)}
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
                    
                    {/* دکمه تست */}
                    <Box sx={{ 
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handleTestAnalytics}
                            disabled={testLoading || !analyticsEnabled}
                            startIcon={
                                testLoading ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <SvgIcon sx={{ fontSize: '1.1rem' }}>
                                        <path d={mdiTestTube} />
                                    </SvgIcon>
                                )
                            }
                            sx={{
                                borderColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: isDarkMode ? '#4dd4ff' : '#3b82f6',
                                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)'
                                },
                                '&:disabled': {
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                                }
                            }}
                        >
                            {testLoading ? 'در حال ارسال...' : 'تست ارسال Analytics'}
                        </Button>
                        
                        {testResult && (
                            <Alert 
                                severity={testResult.success ? 'success' : 'error'}
                                sx={{
                                    mt: 1,
                                    fontSize: '0.85rem',
                                    direction: 'rtl'
                                }}
                                onClose={() => setTestResult(null)}
                            >
                                {testResult.message}
                            </Alert>
                        )}
                    </Box>
                </Paper>
                
            </Box>

            {/* Modal for Algorithm Descriptions */}
            <Dialog 
                open={modalOpen} 
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                        direction: 'rtl'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center', 
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    py: 1.5,
                    mb: 2
                }}>
                    {selectedAlgorithm && algorithmDescriptions[selectedAlgorithm as keyof typeof algorithmDescriptions]?.title}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedAlgorithm && (
                        <>
                            <Typography variant="body1" sx={{ 
                                color: theme.palette.text.primary, 
                                mb: 3,
                                lineHeight: 1.6,
                                fontSize: '0.95rem'
                            }}>
                                {algorithmDescriptions[selectedAlgorithm as keyof typeof algorithmDescriptions]?.description}
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                    color: theme.palette.primary.main, 
                                    mb: 2,
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}>
                                    ویژگی‌ها:
                                </Typography>
                                <Box component="ul" sx={{ 
                                    pl: 2, 
                                    m: 0,
                                    '& li': {
                                        color: 'text.secondary',
                                        mb: 1,
                                        fontSize: '0.9rem'
                                    }
                                }}>
                                    {algorithmDescriptions[selectedAlgorithm as keyof typeof algorithmDescriptions]?.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </Box>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ 
                    justifyContent: 'center', 
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                    <Button 
                        onClick={handleCloseModal}
                        variant="contained"
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
                            fontWeight: 600,
                            px: 4,
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.8)' 
                                    : 'rgba(30, 64, 175, 0.8)'
                            }
                        }}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
