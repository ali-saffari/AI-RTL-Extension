import React from 'react';
import {
    Box,
    Card,
    CardContent,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
    useTheme
} from '@mui/material';
import {
    DEFAULT_FONT_ID,
    NONE_FONT_ID,
    NONE_FONT_TITLE,
    RtlFont,
    getFontFamilyCssValue,
    getSelectableFonts,
    injectPreviewFontFaces,
    loadFontsConfig,
} from '../../utils/fonts';

interface FontSettingCardProps {
    selectedFont: string;
    onSelectedFontChange: (value: string) => void;
    isDarkMode: boolean;
}

const FontSettingCard: React.FC<FontSettingCardProps> = ({
    selectedFont,
    onSelectedFontChange,
    isDarkMode
}) => {
    const theme = useTheme();
    const [fonts, setFonts] = React.useState<RtlFont[]>([]);
    const previewStyleId = 'ai-rtl-options-font-preview';

    React.useEffect(() => {
        let cancelled = false;
        loadFontsConfig()
            .then((config) => {
                if (cancelled) {
                    return;
                }
                const selectable = getSelectableFonts(config);
                setFonts(selectable);
                injectPreviewFontFaces(previewStyleId, selectable);
            })
            .catch((error) => {
                console.log('Failed to load fonts config:', error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (event: SelectChangeEvent<string>) => {
        onSelectedFontChange(event.target.value);
    };

    const selectedOption = fonts.find((font) => font.id === selectedFont);
    const selectedFontFamily = selectedFont === NONE_FONT_ID
        ? 'inherit'
        : selectedOption
            ? getFontFamilyCssValue(selectedOption)
            : 'iranyekan, sans-serif';

    return (
        <Card elevation={2}>
            <CardContent>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: 'primary.main'
                    }}>
                        فونت
                    </Typography>
                </Box>

                <FormControl fullWidth size="small">
                    <Select
                        dir="rtl"
                        value={selectedFont}
                        onChange={handleChange}
                        renderValue={(value) => {
                            if (value === NONE_FONT_ID) {
                                return NONE_FONT_TITLE;
                            }
                            const font = fonts.find((item) => item.id === value);
                            return font?.title || value;
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    mt: 0.5,
                                    maxHeight: 360,
                                    backgroundColor: theme.palette.background.paper,
                                    backgroundImage: 'none',
                                },
                            },
                        }}
                        sx={{
                            fontFamily: selectedFont === NONE_FONT_ID ? 'iranyekan' : selectedFontFamily,
                            fontSize: '0.9rem',
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                            borderRadius: '10px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(30, 64, 175, 0.4)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '1px',
                            },
                        }}
                    >
                        <MenuItem
                            value={NONE_FONT_ID}
                            dir="rtl"
                            sx={{
                                fontFamily: 'iranyekan',
                                fontSize: '0.9rem',
                                py: 1.1,
                                textAlign: 'right',
                                direction: 'rtl',
                            }}
                        >
                            {NONE_FONT_TITLE}
                        </MenuItem>
                        {selectedFont !== NONE_FONT_ID && !fonts.some((font) => font.id === selectedFont) && (
                            <MenuItem value={selectedFont} sx={{ display: 'none' }}>
                                {selectedFont}
                            </MenuItem>
                        )}
                        {fonts.map((font) => (
                            <MenuItem
                                key={font.id}
                                value={font.id}
                                dir="rtl"
                                sx={{
                                    fontFamily: getFontFamilyCssValue(font),
                                    fontSize: '0.95rem',
                                    py: 1.1,
                                    textAlign: 'right',
                                    direction: 'rtl',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                }}
                            >
                                <span>{font.title}</span>
                                {font.id === DEFAULT_FONT_ID && (
                                    <Box
                                        component="span"
                                        sx={{
                                            flexShrink: 0,
                                            px: 0.7,
                                            py: 0.1,
                                            borderRadius: 1,
                                            fontSize: '0.62rem',
                                            fontWeight: 600,
                                            fontFamily: 'iranyekan',
                                            color: theme.palette.primary.main,
                                            border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                            background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(30, 64, 175, 0.08)',
                                        }}
                                    >
                                        پیش‌فرض
                                    </Box>
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </CardContent>
        </Card>
    );
};

export default FontSettingCard;
