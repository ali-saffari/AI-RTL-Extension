import React from 'react';
import {
    Paper,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    IconButton,
    useTheme,
    SvgIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

interface AlgorithmTabProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    isDarkMode: boolean;
}

const AlgorithmTab: React.FC<AlgorithmTabProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    isDarkMode
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

    // Preview examples for each algorithm
    const previewExamples = {
        'advanced_section': {
            title: 'مثال: متن چندزبانه',
            example: 'Hello world\n\nسلام دنیا\n\nThis is a test\n\nاین یک تست است'
        },
        'advanced_full': {
            title: 'مثال: متن یکپارچه',
            example: 'این یک متن نمونه است که به صورت یکپارچه پردازش می‌شود و جهت مناسب برای کل متن تعیین می‌گردد.'
        },
        'first_word': {
            title: 'مثال: تشخیص سریع',
            example: 'سلام این یک متن فارسی است که با بررسی اولین کلمه جهت آن مشخص می‌شود.'
        }
    };

    return (
        <Grid container spacing={3}>
            {/* Settings Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent style={{ direction: 'ltr' }}>
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
                            {['advanced_section', 'advanced_full', 'first_word'].map((algorithm) => {
                                const isSelected = selectedValue === algorithm;
                                const desc = algorithmDescriptions[algorithm as keyof typeof algorithmDescriptions];
                                return (
                                    <Paper 
                                        key={algorithm}
                                        elevation={1} 
                                        sx={{ 
                                            borderRadius: 3,
                                            bgcolor: isSelected
                                                ? theme.palette.mode === 'dark' 
                                                    ? 'rgba(0, 233, 255, 0.1)' 
                                                    : 'rgba(30, 64, 175, 0.2)'
                                                : theme.palette.background.paper,
                                            border: isSelected
                                                ? `${theme.palette.mode === 'dark' ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(30, 64, 175, 1)'}` 
                                                : 'none',
                                            mb: 2,
                                            py: 2,
                                            px: 1,
                                            position: 'relative'
                                        }}
                                    >
                                        <FormControlLabel 
                                            labelPlacement="start"
                                            value={algorithm}
                                            control={<Radio sx={{ color: 'primary.main' }} />}
                                            label={
                                                <Box sx={{ px: 1 }}>
                                                    <Box sx={{ mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="body1" sx={{ 
                                                                fontWeight: 500,
                                                                fontSize: '0.95rem',
                                                                color: theme.palette.text.primary
                                                            }}>
                                                                {desc.title}
                                                            </Typography>
                                                            <IconButton 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleInfoClick(algorithm);
                                                                }}
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
                                                        {algorithm === 'advanced_full' && (
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
                                                            </Box>
                                                        )}
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
                                );
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>
            </Grid>

            {/* Preview Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                پیش نمایش
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                            }}>
                                {previewExamples[selectedValue as keyof typeof previewExamples]?.title}
                            </Typography>
                        </Box>
                        
                        <Box sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            minHeight: '300px',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: theme.palette.text.primary
                        }}>
                            {previewExamples[selectedValue as keyof typeof previewExamples]?.example}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

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
                        borderRadius: 2
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
        </Grid>
    );
};

export default AlgorithmTab;

