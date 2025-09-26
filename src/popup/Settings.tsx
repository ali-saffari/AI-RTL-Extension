import React from 'react';
import {
    Paper,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Switch
} from '@mui/material';

interface SettingsProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    supportHide,
    onSupportChange
}) => {
    const [selectedValue, setSelectedValue] = React.useState(rtlAlgorithm);
    
    React.useEffect(() => {
        setSelectedValue(rtlAlgorithm);
    }, [rtlAlgorithm]);
    
    return (
        <Box sx={{ p: 0 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: 'white',
                    mb: 1
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
                    p: 2, 
                    borderRadius: 1,
             
                    background: '#1a1a2e'
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
                            bgcolor: selectedValue === 'advanced_section' ? 'rgba(0, 233, 255, 0.1)' : '#1a1a2e',
                            border: selectedValue === 'advanced_section' ? '1px solid rgba(0, 233, 255, 0.3)' : 'none',
                            mb: 2,
                            py: 2,
                            px: 1
                        }}>
                            <FormControlLabel 
                                value="advanced_section" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                                                تحلیل پیشرفته بخش‌ها
                                            </Typography>
                                            <Box component="span" sx={{ 
                                                px: 1, 
                                                py: 0.3, 
                                                bgcolor: 'rgb(33, 46, 65)',
                                                border: '1px solid rgba(0, 233, 255, 0.3)',
                                                color: '#00e9ff', 
                                                borderRadius: 1, 
                                                fontSize: '0.7rem',
                                                fontWeight: 600
                                            }}>
                                                جدید
                                            </Box>
                                    
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 0.5 }}>
                                            هر بخش، جمله، پاراگراف و... به‌طور جداگانه توسط الگوریتم هوشمند بررسی شده و جهت متن تعیین می‌شود. (مناسب متون چندزبانه یا ترکیبی)

                                            <Box component="span" sx={{ 
                                                px: 1, 
                                                py: 0.1, 
                                                mr: 1,
                                                bgcolor: 'rgb(1, 91, 237)',
                                                // border: '1px solid rgba(0, 233, 255, 0.3)',
                                                color: 'text.secondary', 
                                                borderRadius: 1, 
                                                fontSize: '0.7rem',
                                                fontWeight: 600
                                            }}>
                                                پیش‌فرض
                                            </Box>


                                        </Typography>
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
                            bgcolor: selectedValue === 'advanced_full' ? 'rgba(0, 233, 255, 0.1)' : '#1a1a2e',
                            border: selectedValue === 'advanced_full' ? '1px solid rgba(0, 233, 255, 0.3)' : 'none',
                            mb: 2,
                            py: 2,
                            px: 1
                        }}>
                            <FormControlLabel 
                                value="advanced_full" 
                                control={<Radio sx={{ color: 'primary.main' }} />} 
                                label={
                                    <Box  sx={{ 
                                        px: 1
                                    }} >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                                                تحلیل پیشرفته یکپارچه
                                            </Typography>
                                            <Box component="span" sx={{ 
                                                px: 1, 
                                                py: 0.3, 
                                                bgcolor: 'rgb(33, 46, 65)',
                                                border: '1px solid rgba(0, 233, 255, 0.3)',
                                                color: '#00e9ff', 
                                                borderRadius: 1, 
                                                fontSize: '0.7rem',
                                                fontWeight: 600
                                            }}>
                                                جدید
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 400 }}>
                                            کل متن پاسخ به‌عنوان یک ساختار واحد توسط الگوریتم پیشرفته پردازش شده و جهت مناسب انتخاب می‌شود. (ترکیب متعادل دقت و کارایی)
                                        </Typography>
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
                            bgcolor: selectedValue === 'first_word' ? 'rgba(0, 233, 255, 0.1)' : '#1a1a2e',
                            border: selectedValue === 'first_word' ? '1px solid rgba(0, 233, 255, 0.3)' : 'none',
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
                                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.95rem', mb: 1 }}>
                                            تشخیص مبتنی بر واژه آغازین
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 400 }}>
                                            جهت متن تنها با بررسی اولین کلمه مشخص می‌گردد. (مناسب سیستم‌هایی با توان پردازشی محدود — در صورت هنگ و قفل شدن سایت، توصیه می‌شود )
                                        </Typography>
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
                    p: 2, 
                    borderRadius: 1,
                    background: '#1a1a2e',
                    mt: 2
                }}>
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            mb: 0.5
                        }}>
                            تنظیمات متن حمایت
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            نمایش یا عدم نمایش متن حمایت در فوتر
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        bgcolor:  '#1a1a2e',
                        border:  '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ 
                                fontWeight: 500, 
                                fontSize: '0.95rem',
                                color: 'text.primary'
                            }}>
                                پنهان کردن متن حمایت
                            </Typography>
                     
                        </Box>
                        <Switch
                            checked={supportHide}
                            onChange={(e) => onSupportChange(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#00e9ff',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#00e9ff',
                                },
                            }}
                        />
                    </Box>
                </Paper>
                
            </Box>
        </Box>
    );
};

export default Settings;
