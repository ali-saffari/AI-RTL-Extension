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
    Switch
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

interface AlgorithmTabProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    isDarkMode: boolean;
    previewEnabled: boolean;
    onPreviewChange: (enabled: boolean) => void;
}

const AlgorithmTab: React.FC<AlgorithmTabProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    isDarkMode,
    previewEnabled,
    onPreviewChange
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
        <Grid container spacing={3}>
            {/* Settings Section */}
            <Grid item xs={12} md={ 6 }>
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
                            
                            <Box sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                minHeight: '300px',
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.95rem',
                                lineHeight: 1.8,
                                color: theme.palette.text.primary,
                                direction: previewEnabled ? 'rtl' : 'ltr',
                                textAlign: previewEnabled ? 'right' : 'left',
                                mb: 2
                            }}>
                                {selectedValue === 'advanced_section' && (
                                    <>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: 'rtl', textAlign: 'right' }}>
                                            Hello world! This is an English sentence that demonstrates how the advanced section algorithm works. When you have multiple paragraphs with different languages, each section is analyzed independently to determine the correct text direction. The system uses sophisticated techniques to identify the dominant language and structure of each بخش separately.
                                        </Typography>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: previewEnabled ? 'ltr' : 'rtl', textAlign: previewEnabled ? 'left' : 'right' }}>
                                            Advanced سیستم پیشرفته از الگوریتم‌های machine learning استفاده می‌کند تا جهت متن را به درستی تشخیص دهد. وقتی شما چندین پاراگراف با زبان‌های مختلف دارید، هر بخش به صورت مستقل بررسی می‌شود تا جهت مناسب متن تعیین شود. با استفاده از تکنیک‌های natural language processing و text analysis، سیستم می‌تواند بهترین جهت را برای هر بخش انتخاب کند.
                                        </Typography>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: 'rtl', textAlign: 'right' }}>
                                            Another English paragraph with multiple sentences. Each section is analyzed separately by the algorithm. This means that if you have a long English paragraph followed by a Persian paragraph, the algorithm will correctly identify the direction for each one independently. The system processes each block of text as a separate unit, ensuring accurate direction detection. This approach works well for mixed content that includes both English and فارسی words.
                                        </Typography>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: previewEnabled ? 'ltr' : 'rtl', textAlign: previewEnabled ? 'left' : 'right' }}>
                                            این یک پاراگراف فارسی است که شامل چند جمله می‌شود. هر بخش به صورت جداگانه بررسی می‌شود. این یعنی اگر شما یک پاراگراف طولانی انگلیسی داشته باشید و بعد یک پاراگراف فارسی، الگوریتم به درستی جهت هر کدام را به صورت مستقل تشخیص می‌دهد. سیستم هر بلوک متن را به عنوان یک واحد جداگانه پردازش می‌کند و با استفاده از algorithm و processing techniques، دقت بالایی در تشخیص جهت ارائه می‌دهد.
                                        </Typography>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: 'rtl', textAlign: 'right' }}>
                                            Mixed content: English and فارسی together in the same paragraph. This is a more complex scenario where the algorithm needs to analyze the content carefully to determine the overall direction of the paragraph based on the dominant language or the structure of the text.
                                        </Typography>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: previewEnabled ? 'ltr' : 'rtl', textAlign: previewEnabled ? 'left' : 'right' }}>
                                            محتوای ترکیبی: انگلیسی و فارسی در یک پاراگراف. این یک سناریوی پیچیده‌تر است که الگوریتم باید محتوا را به دقت بررسی کند تا جهت کلی پاراگراف را بر اساس زبان غالب یا ساختار متن تعیین کند. این روش برای متون چندزبانه بسیار مناسب است.
                                        </Typography>
                                        <Typography paragraph sx={{ fontFamily: previewEnabled ? 'inherit' : 'monospace', direction: previewEnabled ? 'ltr' : 'rtl', textAlign: previewEnabled ? 'left' : 'right' }}>
                                            نتیجه: الگوریتم هر بخش را به صورت مستقل پردازش می‌کند و جهت مناسب را برای هر بخش تعیین می‌نماید. این روش برای متون چندزبانه، مقالات علمی، و محتوای ترکیبی بسیار کارآمد است و دقت بالایی در تشخیص جهت متن ارائه می‌دهد.
                                        </Typography>
                                    </>
                                )}
                                {selectedValue === 'advanced_full' && (
                                    <>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction: previewEnabled ? 'ltr' : 'rtl',
                                            textAlign: previewEnabled ? 'left' : 'right'
                                        }}>
                                            Hello و خوش آمدید به این سیستم پیشرفته. این الگوریتم یکپارچه تمام متن را به عنوان یک واحد واحد پردازش می‌کند و با استفاده از تکنیک‌های machine learning و natural language processing، جهت مناسب را برای کل متن تعیین می‌نماید. این روش برای متون طولانی که شامل محتوای ترکیبی هستند بسیار مناسب است.
                                        </Typography>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction: previewEnabled ? 'ltr' : 'rtl',
                                            textAlign: previewEnabled ? 'left' : 'right'
                                        }}>
                                            الگوریتم با بررسی کل ساختار متن، از جمله کلمه‌های کلیدی مانند algorithm، processing، و detection، بهترین جهت را انتخاب می‌کند. این approach باعث می‌شود که دقت بالایی در تشخیص جهت متن داشته باشیم و برای محتوای پیچیده‌تر مانند مقالات علمی، documentation، و technical content بسیار کارآمد باشد.
                                        </Typography>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction: previewEnabled ? 'ltr' : 'rtl',
                                            textAlign: previewEnabled ? 'left' : 'right'
                                        }}>
                                            سیستم با تحلیل عمیق محتوا و در نظر گیری context و semantic structure، می‌تواند حتی در متون بسیار پیچیده که شامل کلمات انگلیسی و فارسی به صورت مخلوط هستند، بهترین تصمیم را بگیرد. این روش برای محتوای طولانی که نیاز به پردازش یکپارچه دارد، بسیار مناسب است و performance بهتری نسبت به روش‌های دیگر ارائه می‌دهد.
                                        </Typography>
                                    </>
                                )}
                                {selectedValue === 'first_word' && (
                                    <>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction: previewEnabled ? 'ltr' : 'rtl',
                                            textAlign: previewEnabled ? 'left' : 'right'
                                        }}>
                                            اتکا به کلمهٔ اول برای تشخیص راست‌چین بودن قابل‌اعتماد نیست، چون ممکن است آن کلمه نشانهٔ روشن زبانی نداشته باشد و سیستم را دچار اشتباه کند؛ بااین‌حال بسیاری از سایت‌ها به همین رفتار تکیه می‌کنند.
                                        </Typography>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction: previewEnabled ? 'ltr' : 'rtl',
                                            textAlign: previewEnabled ? 'left' : 'right'
                                        }}>
                                            در متن‌های چندزبانه این روش مشکل‌ساز می‌شود، زیرا ممکن است صفحه با یک کلمهٔ انگلیسی شروع شود اما ادامهٔ متن فارسی باشد. با وجود این ضعف، اغلب سایت‌های راست‌چین همین شیوه را به‌کار می‌برند، چون مرورگر به‌صورت پیش‌فرض جهت متن را بر اساس اولین کاراکتر تعیین می‌کند.
                                        </Typography>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction: previewEnabled ? 'ltr' : 'rtl',
                                            textAlign: previewEnabled ? 'left' : 'right'
                                        }}>
                                            همچنین اگر متن با اعداد یا علائم آغاز شود، تشخیص جهت دشوار می‌شود؛ اما باز هم بیشتر سایت‌هایی که از راست‌چین استفاده می‌کنند همین مکانیزم پیش‌فرض مرورگر را به‌عنوان روش اصلی تشخیص جهت متن می‌پذیرند.
                                        </Typography>
                                        <Typography paragraph sx={{ 
                                            fontFamily: previewEnabled ? 'inherit' : 'monospace',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.8,
                                            direction:  'rtl',
                                            textAlign: 'right',
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

