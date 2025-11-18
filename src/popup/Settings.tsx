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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Slider,
    Divider,
    TextField
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

interface TextSelectorSettings {
    enabled: 'enabled' | 'allowed_sites' | 'disabled';
    highlightMode: 'disabled' | 'on_selection' | 'on_direction_change';
    highlightColor: string;
    highlightOpacity: number;
    logoDisplay: 'always' | 'on_hover' | 'disabled';
}

interface SettingsProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    isDarkMode: boolean;
    textSelectorSettings?: TextSelectorSettings;
    onTextSelectorSettingsChange?: (settings: TextSelectorSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    supportHide,
    onSupportChange,
    isDarkMode,
    textSelectorSettings = {
        enabled: 'enabled',
        highlightMode: 'on_selection',
        highlightColor: '#ff0000',
        highlightOpacity: 0.1,
        logoDisplay: 'always'
    },
    onTextSelectorSettingsChange
}) => {
    const theme = useTheme();
    const [selectedValue, setSelectedValue] = React.useState(rtlAlgorithm);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('');
    
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
                }} style={{ direction: 'ltr' }}>
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
                        }} >
                            <FormControlLabel 
                                labelPlacement="start"
                                value="advanced_section" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{  mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 1 }}>
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
                                                right: 15,
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
                        }} >
                            <FormControlLabel 
                                labelPlacement="start"
                                value="advanced_full" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{ mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 1 }}>
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
                                                right: 15,
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
                        }} >
                            <FormControlLabel 
                                labelPlacement="start"
                                value="first_word" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 1, mb: 0.5 }}>
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

                {/* تنظیمات چینش دستی */}
                <Paper elevation={0} sx={{ 
                    m: 2, 
                    p: 2, 
                    borderRadius: 1,
                    background: isDarkMode ? '#2f2f41' : '#ffffff'
                }} dir="rtl">
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            mb: 0.5
                        }}>
                            تنظیمات چینش دستی
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            تنظیمات مربوط به قابلیت تغییر چینش متن به صورت دستی
                        </Typography>
                    </Box>

             

                    {/* فعال/غیرفعال بودن */}
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="enabled-label">وضعیت فعال‌سازی</InputLabel>
                            <Select
                                labelId="enabled-label"
                                value={textSelectorSettings.enabled}
                                onChange={(e) => onTextSelectorSettingsChange?.({
                                    ...textSelectorSettings,
                                    enabled: e.target.value as 'enabled' | 'allowed_sites' | 'disabled'
                                })}
                                label="وضعیت فعال‌سازی"
                           
                            >
                                <MenuItem value="enabled">فعال</MenuItem>
                                <MenuItem value="allowed_sites">فقط سایت‌های مجاز</MenuItem>
                                <MenuItem value="disabled">غیرفعال</MenuItem>
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
                                onChange={(e) => onTextSelectorSettingsChange?.({
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
                    </Box>

                    {/* رنگ محل انتخاب شده */}
                    <Box sx={{ mb: 3, opacity: textSelectorSettings.highlightMode === 'disabled' ? 0.5 : 1 }}>
                        <Typography variant="body1" sx={{ 
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
                                        if (textSelectorSettings.highlightMode !== 'disabled') {
                                            onTextSelectorSettingsChange?.({
                                                ...textSelectorSettings,
                                                highlightColor: color
                                            });
                                        }
                                    }}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: color,
                                        cursor: textSelectorSettings.highlightMode === 'disabled' ? 'not-allowed' : 'pointer',
                                        border: textSelectorSettings.highlightColor === color ? `3px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.2)',
                                        opacity: textSelectorSettings.highlightMode === 'disabled' ? 0.5 : 1
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
                                    if (textSelectorSettings.highlightMode !== 'disabled') {
                                        onTextSelectorSettingsChange?.({
                                            ...textSelectorSettings,
                                            highlightOpacity: value as number
                                        });
                                    }
                                }}
                                min={0}
                                max={1}
                                step={0.1}
                                disabled={textSelectorSettings.highlightMode === 'disabled'}
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

                    <Divider sx={{ my: 2 }} />

                    {/* نمایش لوگو */}
                    <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="logo-display-label">نمایش لوگو در کنار متن تغییر کرده</InputLabel>
                            <Select
                                labelId="logo-display-label"
                                value={textSelectorSettings.logoDisplay}
                                onChange={(e) => onTextSelectorSettingsChange?.({
                                    ...textSelectorSettings,
                                    logoDisplay: e.target.value as 'always' | 'on_hover' | 'disabled'
                                })}
                                label="نمایش لوگو در کنار متن تغییر کرده"
                            >
                                <MenuItem value="always">همیشه نمایش بده</MenuItem>
                                <MenuItem value="on_hover">زمان hover شدن موس</MenuItem>
                                <MenuItem value="disabled">غیرفعال</MenuItem>
                            </Select>
                        </FormControl>
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
