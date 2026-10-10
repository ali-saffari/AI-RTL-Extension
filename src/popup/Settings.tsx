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
    TextField,
    Link
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';
import { ManualRtlSettings } from '../types/manualRtl';
import { useI18n } from '../i18n';

interface SettingsProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    isDarkMode: boolean;
    manualRtlSettings?: ManualRtlSettings;
    onManualRtlSettingsChange?: (settings: ManualRtlSettings) => void;
    hideTitle?: boolean;
}

const Settings: React.FC<SettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    supportHide,
    onSupportChange,
    isDarkMode,
    manualRtlSettings = {
        manualRtlEnabled: true,
        manualRtlSiteMode: 'allowed_sites',
        menuDisplayMode: 'logo_first',
        highlightMode: 'on_direction_change',
        highlightColor: '#ff0000',
        highlightOpacity: 0.3,
        logoDisplay: 'always',
        applyFont: true
    },
    onManualRtlSettingsChange,
    hideTitle = false,
}) => {
    const { t } = useI18n();
    const theme = useTheme();
    const [selectedValue, setSelectedValue] = React.useState(rtlAlgorithm);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('');
    const [hasTabsPermission, setHasTabsPermission] = React.useState<boolean | null>(null);
    
    React.useEffect(() => {
        setSelectedValue(rtlAlgorithm);
    }, [rtlAlgorithm]);

    // Check tabs permission
    React.useEffect(() => {
        const checkTabsPermission = async () => {
            try {
                const hasPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
                setHasTabsPermission(hasPermission);
        } catch (error) {
            setHasTabsPermission(false);
        }
        };
        checkTabsPermission();
    }, []);

    const algorithmDescriptions = {
        'advanced_section': {
            title: t('settings.algorithms.advancedSection.title'),
            description: t('settings.algorithms.advancedSection.description'),
            features: [
                t('settings.algorithms.advancedSection.feature1'),
                t('settings.algorithms.advancedSection.feature2'),
                t('settings.algorithms.advancedSection.feature3'),
            ]
        },
        'advanced_full': {
            title: t('settings.algorithms.advancedFull.title'),
            description: t('settings.algorithms.advancedFull.description'),
            features: [
                t('settings.algorithms.advancedFull.feature1'),
                t('settings.algorithms.advancedFull.feature2'),
                t('settings.algorithms.advancedFull.feature3'),
                t('settings.algorithms.advancedFull.feature4'),
                t('settings.algorithms.advancedFull.feature5'),
            ]
        },
        'first_word': {
            title: t('settings.algorithms.firstWord.title'),
            description: t('settings.algorithms.firstWord.description'),
            features: [
                t('settings.algorithms.firstWord.feature1'),
                t('settings.algorithms.firstWord.feature2'),
                t('settings.algorithms.firstWord.feature3'),
                t('settings.algorithms.firstWord.feature4'),
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
            {!hideTitle && (
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
                    {t('settings.title')}
                </Typography>
         
            </Box>
            )}
            
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
                            {t('settings.algorithmTitle')}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            {t('settings.algorithmSubtitle')}
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
                                                    {t('settings.algorithms.advancedSection.title')}
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
                                                    
                                                    {t('settings.newBadge')}
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
                                                    {t('settings.algorithms.advancedFull.title')}
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
                                                    {t('settings.newBadge')}
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
                                                        {t('settings.defaultBadge')}
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
                                                {t('settings.algorithms.firstWord.title')}
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
                    
                    {/* لینک به تنظیمات پیشرفته */}
                    <Box sx={{ 
                        textAlign: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                    }}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                                chrome.tabs.create({ url: chrome.runtime.getURL('options.html#algorithm') });
                            }}
                            sx={{
                                color: theme.palette.primary.main,
                                textTransform: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                fontFamily: 'iranyekan',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            {t('settings.advancedSettings')}
                        </Button>
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
                            {t('settings.manualTitle')}
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row', 
                            gap: 0.5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                        }}>
                            <Box component="span" sx={{ 
                                px: 1, 
                                py: 0.3, 
                                bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 152, 0, 0.2)' 
                                    : 'rgba(255, 152, 0, 0.15)',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 152, 0, 0.4)'}`,
                                color: theme.palette.mode === 'dark' ? '#ff9800' : '#f57c00', 
                                borderRadius: 1, 
                                fontSize: '0.7rem',
                                fontWeight: 600
                            }}>
                                {t('settings.experimental')}
                            </Box>
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
                                {t('settings.new')}
                            </Box>
                        </Box>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            lineHeight: 1.6
                        }}>
                            {t('settings.manualDescription')}
                        </Typography>
                    </Box>

                    {/* فعال/غیرفعال بودن - Toggle ساده */}
                    <Box sx={{ 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        mb: 2
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: hasTabsPermission === false ? 1 : 0
                        }}>
                            <Typography variant="body1" sx={{ 
                                fontWeight: 500, 
                                fontSize: '0.95rem',
                                color: 'text.primary'
                            }}>
                                {t('settings.manualLabel')}
                            </Typography>
                            {hasTabsPermission === true ? (
                                <Switch
                                    checked={manualRtlSettings.manualRtlEnabled !== false}
                                    onChange={(e) => {
                                        onManualRtlSettingsChange?.({
                                            ...manualRtlSettings,
                                            manualRtlEnabled: e.target.checked
                                        });
                                    }}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        },
                                    }}
                                />
                            ) : (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        chrome.tabs.create({ url: chrome.runtime.getURL('options.html#manual-rtl') });
                                    }}
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'iranyekan',
                                        textTransform: 'none',
                                        borderRadius: '6px',
                                        borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.5)' : 'rgba(30, 64, 175, 0.5)',
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        '&:hover': {
                                            borderColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)'
                                        }
                                    }}
                                >
                                    {t('settings.goToSettings')}
                                </Button>
                            )}
                        </Box>
                        {hasTabsPermission === false && (
                            <Typography variant="body2" sx={{ 
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                fontFamily: 'iranyekan',
                                width: '100%',
                                display: 'block'
                            }}>
                                {t('settings.firstTimeNote')}
                            </Typography>
                        )}
                    </Box>

                    {/* لینک به تنظیمات پیشرفته */}
                    <Box sx={{ 
                        textAlign: 'center',
                        mt: 2
                    }}>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.85rem'
                        }}>
                            {t('settings.advancedBefore')}{' '}
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                    chrome.runtime.openOptionsPage();
                                }}
                                sx={{
                                    color: theme.palette.primary.main,
                                    textTransform: 'none',
                                    fontSize: '0.85rem',
                                    minWidth: 'auto',
                                    p: 0,
                                    '&:hover': {
                                        textDecoration: 'underline',
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                {t('settings.optionsPage')}
                            </Button>
                            {' '}{t('settings.advancedAfter')}
                        </Typography>
                    </Box>
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
                            {t('settings.supportTitle')}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                        }}>
                            {t('settings.supportDescription')}
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
                                {t('settings.hideSupport')}
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
                                fontSize: '0.95rem',
                                direction: 'ltr'
                            }}>
                                {algorithmDescriptions[selectedAlgorithm as keyof typeof algorithmDescriptions]?.description}
                            </Typography>
                            
                            <Box sx={{ mb: 2 ,  direction: 'ltr'}}>
                                <Typography variant="h6" sx={{ 
                                    color: theme.palette.primary.main, 
                                    mb: 2,
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}>
                                    {t('settings.featuresTitle')}
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
                        {t('shared.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
