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
import FontSettingCard from './FontSettingCard';
import ExperimentalBadge from '../../components/ExperimentalBadge';
import {
    NONE_FONT_ID,
    RtlFont,
    getFontFamilyCssValue,
    getSelectableFonts,
    loadFontsConfig,
} from '../../utils/fonts';
import { useI18n } from '../../i18n';

interface AlgorithmTabProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    isDarkMode: boolean;
    previewEnabled: boolean;
    onPreviewChange: (enabled: boolean) => void;
    mixedTitleDisplayMode?: string;
    onMixedTitleDisplayModeChange?: (value: string) => void;
    applyAlgorithmToCode?: boolean;
    onApplyAlgorithmToCodeChange?: (enabled: boolean) => void;
    flipRtlArrows?: boolean;
    onFlipRtlArrowsChange?: (enabled: boolean) => void;
    fixMixedText?: boolean;
    onFixMixedTextChange?: (enabled: boolean) => void;
    selectedFont: string;
    onSelectedFontChange: (value: string) => void;
    fontScale: number;
    onFontScaleChange: (value: number) => void;
    onFontScaleCommit: (value: number) => void;
}

const AlgorithmTab: React.FC<AlgorithmTabProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    isDarkMode,
    previewEnabled,
    onPreviewChange,
    mixedTitleDisplayMode = 'unified',
    onMixedTitleDisplayModeChange,
    applyAlgorithmToCode = true,
    onApplyAlgorithmToCodeChange,
    flipRtlArrows = true,
    onFlipRtlArrowsChange,
    fixMixedText = false,
    onFixMixedTextChange,
    selectedFont,
    onSelectedFontChange,
    fontScale,
    onFontScaleChange,
    onFontScaleCommit
}) => {
    const theme = useTheme();
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [selectedValue, setSelectedValue] = React.useState(rtlAlgorithm);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('');
    const [codeModalOpen, setCodeModalOpen] = React.useState(false);
    const [mixedModalOpen, setMixedModalOpen] = React.useState(false);
    const [fonts, setFonts] = React.useState<RtlFont[]>([]);
    
    React.useEffect(() => {
        setSelectedValue(rtlAlgorithm);
    }, [rtlAlgorithm]);

    React.useEffect(() => {
        let cancelled = false;
        loadFontsConfig()
            .then((config) => {
                if (!cancelled) {
                    setFonts(getSelectableFonts(config));
                }
            })
            .catch((error) => {
                console.log('Failed to load fonts config:', error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const algorithmDescriptions = {
        'advanced_section': {
            title: t('algorithm.algorithms.advancedSection.title'),
            description: t('algorithm.algorithms.advancedSection.description'),
            features: [
                t('algorithm.algorithms.advancedSection.feature1'),
                t('algorithm.algorithms.advancedSection.feature2'),
                t('algorithm.algorithms.advancedSection.feature3'),
            ]
        },
        'advanced_full': {
            title: t('algorithm.algorithms.advancedFull.title'),
            description: t('algorithm.algorithms.advancedFull.description'),
            features: [
                t('algorithm.algorithms.advancedFull.feature1'),
                t('algorithm.algorithms.advancedFull.feature2'),
                t('algorithm.algorithms.advancedFull.feature3'),
                t('algorithm.algorithms.advancedFull.feature4'),
                t('algorithm.algorithms.advancedFull.feature5'),
            ]
        },
        'first_word': {
            title: t('algorithm.algorithms.firstWord.title'),
            description: t('algorithm.algorithms.firstWord.description'),
            features: [
                t('algorithm.algorithms.firstWord.feature1'),
                t('algorithm.algorithms.firstWord.feature2'),
                t('algorithm.algorithms.firstWord.feature3'),
                t('algorithm.algorithms.firstWord.feature4'),
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

    const selectedFontOption = fonts.find((font) => font.id === selectedFont);
    const selectedFontFamily = selectedFont === NONE_FONT_ID
        ? 'inherit'
        : selectedFontOption
            ? getFontFamilyCssValue(selectedFontOption)
            : 'iranyekan, sans-serif';
    const previewFont = previewEnabled ? selectedFontFamily : 'monospace';
    const previewScale = fontScale / 100;
    const previewBodyFontSize = `${0.95 * previewScale}rem`;
    const previewTitleFontSize = `${1.5 * previewScale}rem`;
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
        fontSize: previewTitleFontSize
    };
    const previewBodySx = {
        fontFamily: previewFont,
        fontSize: previewBodyFontSize,
        lineHeight: 1.8
    };
    const flipPreviewArrows = (text: string, isRtl: boolean) => {
        if (!previewEnabled || !flipRtlArrows || !isRtl) {
            return text;
        }
        return text
            .replace(/==>/g, '<==')
            .replace(/([-–—−]{1,})>/g, '<$1')
            .replace(/=>/g, '<=')
            .replace(/->/g, '<-')
            .replace(/→/g, '←')
            .replace(/⇒/g, '⇐');
    };
    const markdownPreviewDir = previewEnabled && applyAlgorithmToCode ? 'rtl' as const : 'ltr' as const;
    const previewPanelBorder = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
    const previewCodeBg = theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.32)' : 'rgba(15, 23, 42, 0.05)';
    const previewCodeHeaderSx = {
        px: 1.5,
        py: 0.7,
        fontSize: `${0.72 * previewScale}rem`,
        fontFamily: previewFont,
        color: 'text.secondary',
        borderBottom: `1px solid ${previewPanelBorder}`,
        direction: 'ltr' as const,
        textAlign: 'left' as const
    };
    const previewCodeBodySx = {
        px: 1.5,
        py: 1.25,
        m: 0,
        whiteSpace: 'pre-wrap' as const,
        lineHeight: 1.7,
        fontSize: previewBodyFontSize
    };

    return (
        <Grid container spacing={3}>
            {/* Settings Section - سمت چپ */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 1 } }}>
                <Container maxWidth={false} sx={{ p: 0 }}>
                    <Grid container spacing={3}>
                        {/* فونت */}
                        <Grid item xs={12} sx={{ order: 3 }}>
                            <FontSettingCard
                                selectedFont={selectedFont}
                                onSelectedFontChange={onSelectedFontChange}
                                fontScale={fontScale}
                                onFontScaleChange={onFontScaleChange}
                                onFontScaleCommit={onFontScaleCommit}
                                isDarkMode={isDarkMode}
                            />
                        </Grid>

                        {/* {t('algorithm.title')} */}
                        <Grid item xs={12} sx={{ order: 1 }}>
                            <Card elevation={2}>
                                <CardContent style={{ direction: 'ltr' }}>
                                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: 600, 
                                            color: 'primary.main',
                                            mb: 0.5
                                        }}>
                                            {t('algorithm.title')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.8rem'
                                        }}>
                                            {t('algorithm.subtitle')}
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
                                                                                {t('algorithm.defaultBadge')}
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

                        {/* {t('algorithm.flipLabel')} */}
                        <Grid item xs={12} sx={{ order: 4 }}>
                            <Card elevation={2}>
                                <CardContent dir={dir}>
                                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 0.5 }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 600, 
                                                color: 'primary.main'
                                            }}>
                                                {t('algorithm.flipTitle')}
                                            </Typography>
                                            <ExperimentalBadge isDarkMode={isDarkMode} />
                                        </Box>
                                        <Typography variant="body2" sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.8rem'
                                        }}>
                                            {t('algorithm.flipHint')}
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
                                        <Box sx={{ flex: 1, pr: 2 }}>
                                            <Typography variant="body1" sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem',
                                                color: theme.palette.text.primary
                                            }}>
                                                {t('algorithm.flipLabel')}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.78rem',
                                                mt: 0.5,
                                                lineHeight: 1.6
                                            }}>
                                                {t('algorithm.flipExample')}
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={flipRtlArrows}
                                            onChange={(e) => onFlipRtlArrowsChange?.(e.target.checked)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                            }}
                                            inputProps={{ 'aria-label': t('algorithm.flipAria') }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* {t('algorithm.codeDialogTitle')} */}
                        <Grid item xs={12} sx={{ order: 5 }}>
                            <Card elevation={2}>
                                <CardContent dir={dir}>
                                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 600, 
                                                color: 'primary.main'
                                            }}>
                                                {t('algorithm.codeTitle')}{' '}
                                                <Box component="span" sx={{ fontSize: '0.88em', fontWeight: 500, opacity: 0.72 }}>
                                                    {t('algorithm.codeMarkdown')}
                                                </Box>
                                            </Typography>
                                            <IconButton
                                                onClick={() => setCodeModalOpen(true)}
                                                size="small"
                                                aria-label={t('algorithm.codeInfoAria')}
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
                                            <ExperimentalBadge isDarkMode={isDarkMode} />
                                        </Box>
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
                                        <Box sx={{ flex: 1, pr: 2 }}>
                                            <Typography variant="body1" sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem',
                                                color: theme.palette.text.primary
                                            }}>
                                                {t('algorithm.codeTitle')}{' '}
                                                <Box component="span" sx={{ fontSize: '0.88em', fontWeight: 500, opacity: 0.72 }}>
                                                    {t('algorithm.codeMarkdown')}
                                                </Box>
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.78rem',
                                                mt: 0.5,
                                                lineHeight: 1.6
                                            }}>
                                                {t('algorithm.codeHint')}
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={applyAlgorithmToCode}
                                            onChange={(e) => onApplyAlgorithmToCodeChange?.(e.target.checked)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                            }}
                                            inputProps={{ 'aria-label': t('algorithm.codeAria') }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sx={{ order: 6 }}>
                            <Card elevation={2}>
                                <CardContent dir={dir}>
                                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 600, 
                                                color: 'primary.main'
                                            }}>
                                                {t('algorithm.mixedTitle')}
                                            </Typography>
                                            <IconButton
                                                onClick={() => setMixedModalOpen(true)}
                                                size="small"
                                                aria-label={t('algorithm.mixedInfoAria')}
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
                                            <ExperimentalBadge isDarkMode={isDarkMode} />
                                        </Box>
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
                                        <Box sx={{ flex: 1, pr: 2 }}>
                                            <Typography variant="body1" sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem',
                                                color: theme.palette.text.primary
                                            }}>
                                                {t('algorithm.mixedTitle')}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.78rem',
                                                mt: 0.5,
                                                lineHeight: 1.6
                                            }}>
                                                {t('algorithm.mixedHint')}
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={fixMixedText}
                                            onChange={(e) => onFixMixedTextChange?.(e.target.checked)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                },
                                            }}
                                            inputProps={{ 'aria-label': t('algorithm.mixedAria') }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Title display mode */}
                        <Grid item xs={12} sx={{ order: 2 }}>
                            <Card elevation={2}>
                                <CardContent dir={dir} sx={{ position: 'relative' }}>
                                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: 600, 
                                            color: 'primary.main',
                                            mb: 0.5
                                        }}>
                                            {t('algorithm.titlesTitle')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.8rem'
                                        }}>
                                            {t('algorithm.titlesSubtitle')}
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
                                                ? t('algorithm.titlesIndividual')
                                                : t('algorithm.titlesUnified');
                                            const description = mode === 'individual'
                                                ? t('algorithm.titlesIndividualHint')
                                                : t('algorithm.titlesUnifiedHint');
                                            
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
                                                {t('algorithm.titlesLockedBefore')}{' '}
                                                <Box component="span" sx={{ 
                                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                    fontWeight: 600
                                                }}>
                                                   {t('algorithm.titlesLockedName')}
                                                </Box>
                                                {' '}{t('algorithm.titlesLockedAfter')}
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
                                {t('algorithm.previewTitle')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                            }}>
                                {selectedValue === 'advanced_section' && t('algorithm.previewSection')}
                                {selectedValue === 'advanced_full' && t('algorithm.previewFull')}
                                {selectedValue === 'first_word' && t('algorithm.previewFirst')}
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
                            fontFamily: previewFont,
                            fontSize: previewBodyFontSize,
                            lineHeight: 1.8,
                            color: theme.palette.text.primary,
                            mb: 2,
                            '& .MuiTypography-root': {
                                fontFamily: previewFont,
                            }
                        }}>
                            {selectedValue === 'advanced_section' && (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            {t('algorithm.preview.faTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                            {t('algorithm.preview.faBody')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(false)} style={dirStyle(getTitleDir(false))} sx={titleSx}>
                                            {t('algorithm.preview.enTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={previewBodySx}>
                                            {t('algorithm.preview.enBody')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            {t('algorithm.preview.mixedTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                            {t('algorithm.preview.mixedBody')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(false)} style={dirStyle(getTitleDir(false))} sx={titleSx}>
                                            {t('algorithm.preview.longEnTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={previewBodySx}>
                                            {t('algorithm.preview.longEnBody')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(false)} style={dirStyle(getTitleDir(false))} sx={titleSx}>
                                            {t('algorithm.preview.mixedEnTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={previewBodySx}>
                                            {t('algorithm.preview.mixedEnBody')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            {t('algorithm.preview.mixedFaTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                            {t('algorithm.preview.mixedFaBody')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                            {t('algorithm.preview.resultTitle')}
                                        </Typography>
                                        <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                            {t('algorithm.preview.resultBody')}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                            {selectedValue === 'advanced_full' && (
                                <>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                        {t('algorithm.preview.full1')}
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                        {t('algorithm.preview.full2')}
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                        {t('algorithm.preview.full3')}
                                    </Typography>
                                </>
                            )}
                            {selectedValue === 'first_word' && (
                                <>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                        {t('algorithm.preview.first1')}
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                        {t('algorithm.preview.first2')}
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                        {t('algorithm.preview.first3')}
                                    </Typography>
                                    <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={{
                                        ...previewBodySx,
                                        color: previewEnabled ? 'rgba(220, 38, 38, 0.75)' : 'inherit'
                                    }}>
                                        {t('algorithm.preview.first4')}
                                    </Typography>
                                </>
                            )}

                            <Box sx={{
                                mt: 2.5,
                                pt: 2,
                                borderTop: `1px dashed ${previewPanelBorder}`
                            }}>
                                <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                    {t('algorithm.preview.arrowsTitle')}
                                </Typography>
                                <Typography paragraph dir={getPreviewDir(true)} style={dirStyle(getPreviewDir(true))} sx={previewBodySx}>
                                    {flipPreviewArrows(t('algorithm.preview.arrowsBody'), true)}
                                </Typography>
                                <Typography paragraph dir={getPreviewDir(false)} style={dirStyle(getPreviewDir(false))} sx={previewBodySx}>
                                    {t('algorithm.preview.arrowsEn')}
                                </Typography>

                                <Typography variant="h3" dir={getTitleDir(true)} style={dirStyle(getTitleDir(true))} sx={titleSx}>
                                    {t('algorithm.preview.markdownTitle')}
                                </Typography>
                                <Box sx={{
                                    mb: 1.5,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    border: `1px solid ${previewPanelBorder}`,
                                    bgcolor: previewCodeBg
                                }}>
                                    <Box sx={previewCodeHeaderSx}>markdown</Box>
                                    <Box
                                        dir={markdownPreviewDir}
                                        style={dirStyle(markdownPreviewDir)}
                                        sx={{
                                            ...previewCodeBodySx,
                                            fontFamily: previewFont
                                        }}
                                    >
                                        {flipPreviewArrows(t('algorithm.preview.markdownBody'), markdownPreviewDir === 'rtl')}
                                    </Box>
                                </Box>
                                <Box sx={{
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    border: `1px solid ${previewPanelBorder}`,
                                    bgcolor: previewCodeBg
                                }}>
                                    <Box sx={previewCodeHeaderSx}>javascript</Box>
                                    <Box
                                        dir="ltr"
                                        style={dirStyle('ltr')}
                                        sx={{
                                            ...previewCodeBodySx,
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
                                        }}
                                    >
                                        {`function run() {\n  setup -> start();\n  return true;\n}`}
                                    </Box>
                                </Box>
                            </Box>
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
                                {previewEnabled ? t('algorithm.previewOn') : t('algorithm.previewOff')}
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

            <Dialog
                open={mixedModalOpen}
                onClose={() => setMixedModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                        direction: dir
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
                    {t('algorithm.mixedTitle')}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" sx={{
                        color: theme.palette.text.primary,
                        mb: 3,
                        lineHeight: 1.8,
                        fontSize: '0.95rem'
                    }}>
                        {t('algorithm.mixedBody')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                            color: theme.palette.primary.main,
                            mb: 2,
                            fontSize: '1rem',
                            fontWeight: 600
                        }}>
                            {t('algorithm.mixedExampleTitle')}
                        </Typography>
                        <Box component="ul" sx={{
                            pl: 2,
                            m: 0,
                            '& li': {
                                color: 'text.secondary',
                                mb: 1.25,
                                fontSize: '0.9rem',
                                lineHeight: 1.8
                            }
                        }}>
                            <li>{t('algorithm.mixedExample1')}</li>
                            <li>{t('algorithm.mixedExample2')}</li>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    justifyContent: 'center',
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                    <Button
                        onClick={() => setMixedModalOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{
                            minWidth: 120,
                            fontFamily: 'iranyekan'
                        }}
                    >
                        {t('algorithm.understood')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={codeModalOpen}
                onClose={() => setCodeModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                        direction: dir
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
                    {t('algorithm.codeDialogTitle')}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" sx={{
                        color: theme.palette.text.primary,
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                    }}>
                        {t('algorithm.codeDialogBody')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                            color: theme.palette.primary.main,
                            mb: 2,
                            fontSize: '1rem',
                            fontWeight: 600
                        }}>
                            {t('algorithm.featuresTitle')}
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
                            <li>{t('algorithm.codeFeature1')}</li>
                            <li>{t('algorithm.codeFeature2')}</li>
                            <li>{t('algorithm.codeFeature3')}</li>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    justifyContent: 'center',
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                    <Button
                        onClick={() => setCodeModalOpen(false)}
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
                        {t('algorithm.close')}
                    </Button>
                </DialogActions>
            </Dialog>

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
                                    {t('algorithm.featuresTitle')}
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
                        {t('algorithm.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default AlgorithmTab;

