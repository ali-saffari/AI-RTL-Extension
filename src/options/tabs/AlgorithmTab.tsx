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
    Grid,
    Switch,
    Container
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

interface AlgorithmTabProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    isDarkMode: boolean;
    previewEnabled: boolean;
    onPreviewChange: (enabled: boolean) => void;
    mixedTitleDisplayMode?: string;
    onMixedTitleDisplayModeChange?: (value: string) => void;
}

const AlgorithmTab: React.FC<AlgorithmTabProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    isDarkMode,
    previewEnabled,
    onPreviewChange,
    mixedTitleDisplayMode = 'unified',
    onMixedTitleDisplayModeChange
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

    const previewFont = previewEnabled ? 'inherit' : 'monospace';
    const getPreviewDir = (isRtl: boolean) => {
        if (!previewEnabled) return 'ltr' as const;
        return isRtl ? 'rtl' as const : 'ltr' as const;
    };
    const getTitleDir = (isRtl: boolean) => {
        if (!previewEnabled) return 'ltr' as const;
        if (mixedTitleDisplayMode === 'unified') return 'rtl' as const;
        return isRtl ? 'rtl' as const : 'ltr' as const;
    };
    const dirStyle = (dir: 'rtl' | 'ltr') => ({
        direction: dir,
        textAlign: dir === 'rtl' ? 'right' as const : 'left' as const
    });
    const titleSx = {
        fontWeight: 600,
        mb: 1,
        color: theme.palette.text.primary,
        fontFamily: previewFont,
        fontSize: '1.5rem'
    };

    return (
        <Grid container spacing={3}>
            {/* Settings Section - سمت چپ */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 1 } }}>
                <Container maxWidth={false} sx={{ p: 0 }}>
                    <Grid container spacing={3}>
                        {/* الگوریتم تشخیص RTL */}
                        <Grid item xs={12}>
                            <Card elevation={2}>
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
                                            نحوه پردازش عنوان‌ها در چت هایی که چند زبانه هستند
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

                        {/* نحوه نمایش عنوان‌های ترکیبی */}
                        <Grid item xs={12}>
                            <Card elevation={2}>
                                <CardContent dir="rtl" sx={{ position: 'relative' }}>
                                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: 600, 
                                            color: 'primary.main',
                                            mb: 0.5
                                        }}>
                                            نحوه نمایش عنوان‌ها
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.8rem'
                                        }}>
                                            نحوه پردازش عنوان‌ها در چت هایی که چند زبانه هستند
                                        </Typography>
                                    </Box>
                                    
                                    <RadioGroup
                                        value={mixedTitleDisplayMode}
                                        onChange={(e) => {
                                            if (selectedValue === 'advanced_section' && onMixedTitleDisplayModeChange) {
                                                onMixedTitleDisplayModeChange(e.target.value);
                                            }
                                        }}
                                        sx={{ 
                                            '& .MuiFormControlLabel-root': {
                                                marginLeft: 0,
                                                marginRight: 0,
                                                paddingLeft: 0,
                                                paddingRight: 0,
                                                justifyContent: 'flex-start'
                                            }
                                        }}
                                    >
                                        {['unified', 'individual'].map((mode) => {
                                            const isSelected = mixedTitleDisplayMode === mode;
                                            const title = mode === 'individual' 
                                                ? 'تنظیم هر عنوان جداگانه' 
                                                : 'قرار دادن عنوان‌ها در یک سمت';
                                            const description = mode === 'individual'
                                                ? 'هر عنوان بر اساس زبان خودش پردازش می‌شود'
                                                : 'همه عنوان‌ها بر اساس جهت اکثریت تنظیم می‌شوند';
                                            
                                            return (
                                                <Paper 
                                                    key={mode}
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
                                                        opacity: selectedValue === 'advanced_section' ? 1 : 0.5,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <FormControlLabel 
                                                        labelPlacement="end"
                                                        value={mode}
                                                        control={<Radio sx={{ color: 'primary.main' }} disabled={selectedValue !== 'advanced_section'} />}
                                                        label={
                                                            <Box sx={{ 
                                                                px: 1, 
                                                                width: '100%',
                                                                flex: 1
                                                            }}>
                                                                <Typography variant="body1" sx={{ 
                                                                    fontWeight: 500,
                                                                    fontSize: '0.95rem',
                                                                    color: theme.palette.text.primary,
                                                                    width: '100%'
                                                                }}>
                                                                    {title}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ 
                                                                    color: 'text.secondary',
                                                                    fontSize: '0.8rem',
                                                                    mt: 0.5,
                                                                    width: '100%'
                                                                }}>
                                                                    {description}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        sx={{ 
                                                            marginLeft: 0,
                                                            marginRight: 0,
                                                            paddingLeft: 0,
                                                            paddingRight: 0,
                                                            width: '100%',
                                                            justifyContent: 'flex-start'
                                                        }}
                                                    />
                                                </Paper>
                                            );
                                        })}
                                    </RadioGroup>
                                    
                                    {/* Overlay when advanced_section is not selected */}
                                    {selectedValue !== 'advanced_section' && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 1,
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#fff',
                                                    fontWeight: 500,
                                                    textAlign: 'center',
                                                    px: 2
                                                }}
                                            >
                                                این تنظیمات فقط برای الگوریتم{' '}
                                                <Box component="span" sx={{ 
                                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                    fontWeight: 600
                                                }}>
                                                   تحلیل پیشرفته بخش‌ها
                                                </Box>
                                                {' '}فعال است
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Grid>

            {/* Preview Section - سمت راست */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 2 } }}>
                <Card elevation={2}>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
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
                                {selectedValue === 'advanced_section' && 'مثال: متن چندزبانه'}
                                {selectedValue === 'advanced_full' && 'مثال: متن یکپارچه'}
                                {selectedValue === 'first_word' && 'مثال: تشخیص سریع'}
                            </Typography>
                        </Box>
                        
                        <Box
                            dir="ltr"
                            style={{ direction: 'ltr', textAlign: 'left' }}
                            sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            minHeight: '300px',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: theme.palette.text.primary,
                            mb: 2
                        }}>
                            {selectedValue === 'advanced_section' && (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            پاراگراف فارسی
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ fontFamily: previewFont }}>
                                            این یک پاراگراف فارسی است که شامل چند جمله می‌شود. هر بخش به صورت جداگانه بررسی می‌شود. این یعنی اگر شما یک پاراگراف طولانی انگلیسی داشته باشید و بعد یک پاراگراف فارسی، الگوریتم به درستی جهت هر کدام را به صورت مستقل تشخیص می‌دهد. سیستم هر بلوک متن را به عنوان یک واحد جداگانه پردازش می‌کند و با استفاده از algorithm و processing techniques، دقت بالایی در تشخیص جهت ارائه می‌دهد.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(false)} style={dirStyle(getTitleDir(false))} sx={titleSx}>
                                            English Paragraph
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={{ fontFamily: previewFont }}>
                                            Hello world! This is an English sentence that demonstrates how the advanced section algorithm works. When you have multiple paragraphs with different languages, each section is analyzed independently to determine the correct text direction. The system uses sophisticated techniques to identify the dominant language and structure of each بخش separately.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            پاراگراف ترکیبی (انگلیسی-فارسی)
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ fontFamily: previewFont }}>
                                            Advanced سیستم پیشرفته از الگوریتم‌های machine learning استفاده می‌کند تا جهت متن را به درستی تشخیص دهد. وقتی شما چندین پاراگراف با زبان‌های مختلف دارید، هر بخش به صورت مستقل بررسی می‌شود تا جهت مناسب متن تعیین شود. با استفاده از تکنیک‌های natural language processing و text analysis، سیستم می‌تواند بهترین جهت را برای هر بخش انتخاب کند.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(false)} style={dirStyle(getTitleDir(false))} sx={titleSx}>
                                            Long English Paragraph
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={{ fontFamily: previewFont }}>
                                            Another English paragraph with multiple sentences. Each section is analyzed separately by the algorithm. This means that if you have a long English paragraph followed by a Persian paragraph, the algorithm will correctly identify the direction for each one independently. The system processes each block of text as a separate unit, ensuring accurate direction detection. This approach works well for mixed content that includes both English and فارسی words.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(false)} style={dirStyle(getTitleDir(false))} sx={titleSx}>
                                            Mixed Content (English-Farsi)
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={{ fontFamily: previewFont }}>
                                            Mixed content: English and فارسی together in the same paragraph. This is a more complex scenario where the algorithm needs to analyze the content carefully to determine the overall direction of the paragraph based on the dominant language or the structure of the text.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            محتوای ترکیبی (فارسی-انگلیسی)
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ fontFamily: previewFont }}>
                                            محتوای ترکیبی: انگلیسی و فارسی در یک پاراگراف. این یک سناریوی پیچیده‌تر است که الگوریتم باید محتوا را به دقت بررسی کند تا جهت کلی پاراگراف را بر اساس زبان غالب یا ساختار متن تعیین کند. این روش برای متون چندزبانه بسیار مناسب است.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            نتیجه
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ fontFamily: previewFont }}>
                                            نتیجه: الگوریتم هر بخش را به صورت مستقل پردازش می‌کند و جهت مناسب را برای هر بخش تعیین می‌نماید. این روش برای متون چندزبانه، مقالات علمی، و محتوای ترکیبی بسیار کارآمد است و دقت بالایی در تشخیص جهت متن ارائه می‌دهد.
                                        </Typography>
                                    </Box>
                                </>
                            )}
                            {selectedValue === 'advanced_full' && (
                                <>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8
                                    }}>
                                        Hello و خوش آمدید به این سیستم پیشرفته. این الگوریتم یکپارچه تمام متن را به عنوان یک واحد واحد پردازش می‌کند و با استفاده از تکنیک‌های machine learning و natural language processing، جهت مناسب را برای کل متن تعیین می‌نماید. این روش برای متون طولانی که شامل محتوای ترکیبی هستند بسیار مناسب است.
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8
                                    }}>
                                        الگوریتم با بررسی کل ساختار متن، از جمله کلمه‌های کلیدی مانند algorithm، processing، و detection، بهترین جهت را انتخاب می‌کند. این approach باعث می‌شود که دقت بالایی در تشخیص جهت متن داشته باشیم و برای محتوای پیچیده‌تر مانند مقالات علمی، documentation، و technical content بسیار کارآمد باشد.
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8
                                    }}>
                                        سیستم با تحلیل عمیق محتوا و در نظر گیری context و semantic structure، می‌تواند حتی در متون بسیار پیچیده که شامل کلمات انگلیسی و فارسی به صورت مخلوط هستند، بهترین تصمیم را بگیرد. این روش برای محتوای طولانی که نیاز به پردازش یکپارچه دارد، بسیار مناسب است و performance بهتری نسبت به روش‌های دیگر ارائه می‌دهد.
                                    </Typography>
                                </>
                            )}
                            {selectedValue === 'first_word' && (
                                <>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8
                                    }}>
                                        اتکا به کلمهٔ اول برای تشخیص راست‌چین بودن قابل‌اعتماد نیست، چون ممکن است آن کلمه نشانهٔ روشن زبانی نداشته باشد و سیستم را دچار اشتباه کند؛ بااین‌حال بسیاری از سایت‌ها به همین رفتار تکیه می‌کنند.
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8
                                    }}>
                                        در متن‌های چندزبانه این روش مشکل‌ساز می‌شود، زیرا ممکن است صفحه با یک کلمهٔ انگلیسی شروع شود اما ادامهٔ متن فارسی باشد. با وجود این ضعف، اغلب سایت‌های راست‌چین همین شیوه را به‌کار می‌برند، چون مرورگر به‌صورت پیش‌فرض جهت متن را بر اساس اولین کاراکتر تعیین می‌کند.
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8
                                    }}>
                                        همچنین اگر متن با اعداد یا علائم آغاز شود، تشخیص جهت دشوار می‌شود؛ اما باز هم بیشتر سایت‌هایی که از راست‌چین استفاده می‌کنند همین مکانیزم پیش‌فرض مرورگر را به‌عنوان روش اصلی تشخیص جهت متن می‌پذیرند.
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={{ 
                                        fontFamily: previewFont,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8,
                                        color: previewEnabled ? 'rgba(220, 38, 38, 0.75)' : 'inherit'
                                    }}>
                                        Example این متن با انگلیسی شروع شده و مرورگر به‌صورت پیش‌فرض آن را به‌عنوان متن چپ‌چین تشخیص می‌دهد، حتی اگر ادامهٔ متن فارسی باشد. این همان رفتاری است که در بسیاری از سایت‌های راست‌چین مشاهده می‌شود و دلیل استفاده از این روش ساده است.
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: 1,
                            pt: 1,
                            borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          
                        }}>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem',

                            }}>
                                {previewEnabled ? 'الگوریتم فعال' : 'الگوریتم غیرفعال'}
                            </Typography>
                            <Switch
                                checked={previewEnabled}
                                onChange={(e) => onPreviewChange(e.target.checked)}
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
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    flexDirection: 'row-reverse'
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

