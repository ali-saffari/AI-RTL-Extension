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
    SvgIcon
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

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
    const [analyticsDisableDialogOpen, setAnalyticsDisableDialogOpen] = React.useState(false);
    
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

    const handleAnalyticsChange = (checked: boolean) => {
        if (!checked && analyticsEnabled) {
            // اگر می‌خواهد غیرفعال کند، Dialog را نمایش بده
            setAnalyticsDisableDialogOpen(true);
        } else {
            // اگر می‌خواهد فعال کند، مستقیماً فعال کن
            onAnalyticsChange(checked);
        }
    };

    const handleConfirmDisableAnalytics = () => {
        onAnalyticsChange(false);
        setAnalyticsDisableDialogOpen(false);
    };

    const handleCancelDisableAnalytics = () => {
        setAnalyticsDisableDialogOpen(false);
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
                            تحلیل استفاده (Analytics)
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            برای بهبود عملکرد افزونه، داده‌های استفاده به‌صورت کاملاً ناشناس جمع‌آوری می‌شوند.
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            mt: 1
                        }}>
                            این داده‌ها شامل هیچ‌گونه اطلاعات شخصی یا محتوای حساس نیستند و تنها برای درک بهتر نحوه استفاده کاربران از افزونه و ارتقای تجربه کاربری به کار می‌روند.
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
                                فعال‌سازی Analytics
                            </Typography>
                        </Box>
                        <Switch
                            checked={analyticsEnabled}
                            onChange={(e) => handleAnalyticsChange(e.target.checked)}
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
                    
                    <Box sx={{ 
                        mt: 2, 
                        textAlign: 'center'
                    }}>
                        <Typography 
                            variant="body2" 
                            component="a"
                            href="https://chatgpt-rtl.ir/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();
                                chrome.tabs.create({ url: 'https://chatgpt-rtl.ir/privacy-policy' });
                            }}
                            sx={{ 
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            برای اطلاعات بیشتر، حریم خصوصی را بخوانید
                        </Typography>
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

            {/* Dialog for Analytics Disable Confirmation */}
            <Dialog 
                open={analyticsDisableDialogOpen} 
                onClose={handleCancelDisableAnalytics}
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
                    fontSize: '1.1rem',
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    py: 2,
                    mb: 2
                }}>
                    مطمئن هستید که Analytics را غیرفعال کنید؟
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" sx={{ 
                        color: theme.palette.text.primary, 
                        mb: 2,
                        lineHeight: 1.8,
                        fontSize: '0.95rem',
                        textAlign: 'justify'
                    }}>
                        با غیرفعال کردن Analytics، شما از کمک به بهبود افزونه و ارائه تجربه بهتر برای همه کاربران صرف‌نظر می‌کنید.
                    </Typography>
                    <Box sx={{ 
                        bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 193, 7, 0.1)' 
                            : 'rgba(255, 193, 7, 0.1)',
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
                        borderRadius: 2,
                        p: 2,
                        mb: 2
                    }}>
                        <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.9rem',
                            lineHeight: 1.7
                        }}>
                            <strong>توجه:</strong> داده‌های Analytics به صورت کاملاً ناشناس و غیرشخصی جمع‌آوری می‌شوند. این روش مورد تایید گوگل است و هیچ اطلاعات حساسی شامل نمی‌شود. با فعال نگه داشتن Analytics، به ما کمک می‌کنید تا افزونه را بهتر و سریع‌تر بهبود دهیم.
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        mb: 2
                    }}>
                        در صورت غیرفعال کردن، تمام داده‌های ذخیره شده در مرورگر شما پاک خواهند شد.
                    </Typography>
                    <Box sx={{ 
                        mt: 2,
                        textAlign: 'center',
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                    }}>
                        <Typography 
                            variant="body2" 
                            component="a"
                            href="https://chatgpt-rtl.ir/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();
                                chrome.tabs.create({ url: 'https://chatgpt-rtl.ir/privacy-policy' });
                            }}
                            sx={{ 
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 500,
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            برای دریافت اطلاعات بیشتر، می‌توانید حریم خصوصی را مطالعه کنید. در آنجا دقیق و واضح توضیح داده شده است.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    justifyContent: 'space-between', 
                    pt: 2,
                    px: 3,
                    pb: 3,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    gap: 2
                }}>
                    <Button 
                        onClick={handleCancelDisableAnalytics}
                        variant="outlined"
                        sx={{
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                            }
                        }}
                    >
                        لغو
                    </Button>
                    <Button 
                        onClick={handleConfirmDisableAnalytics}
                        variant="contained"
                        sx={{
                            backgroundColor: theme.palette.error.main,
                            color: '#ffffff',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                backgroundColor: theme.palette.error.dark
                            }
                        }}
                    >
                        غیرفعال کردن
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
