import React from 'react';
import {
    Box,
    Typography,
    Switch,
    Button,
    SvgIcon,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { mdiCog, mdiOpenInNew, mdiClose, mdiInformationOutline } from '@mdi/js';
import { ManualRtlSettings } from '../types/manualRtl';
import {
    DEFAULT_FONT_ID,
    NONE_FONT_ID,
    NONE_FONT_TITLE,
    RtlFont,
    getFontFamilyCssValue,
    getSelectableFonts,
    injectPreviewFontFaces,
    loadFontsConfig,
} from '../utils/fonts';

interface QuickSettingsProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    selectedFont: string;
    onSelectedFontChange: (value: string) => void;
    mixedTitleDisplayMode: string;
    onMixedTitleDisplayModeChange: (value: string) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    isDarkMode: boolean;
    manualRtlSettings: ManualRtlSettings;
    onManualRtlSettingsChange: (settings: ManualRtlSettings) => void;
    onClose?: () => void;
}

const ALGORITHMS = [
    {
        id: 'advanced_section',
        title: 'تحلیل پیشرفته بخش‌ها',
        hint: 'هر بخش، جمله و پاراگراف جداگانه بررسی می‌شود. برای متن‌های ترکیبی فارسی و انگلیسی دقت بالاتری دارد.',
        badge: 'جدید',
        description: 'هر بخش، جمله و پاراگراف جداگانه توسط الگوریتم هوشمند بررسی شده و جهت همان قسمت تعیین می‌شود. این روش برای متون چندزبانه یا ترکیبی بسیار مناسب است و دقت بالایی در تشخیص جهت متن ارائه می‌دهد.',
        extra: 'در این حالت تنظیمات عنوان هم فعال می‌شود: می‌توانید مشخص کنید عنوان چت‌های چندزبانه جداگانه بررسی شود یا همه در یک سمت قرار بگیرند.',
    },
    {
        id: 'advanced_full',
        title: 'تحلیل پیشرفته یکپارچه',
        hint: 'کل متن یکجا پردازش می‌شود. ترکیب متعادلی از دقت و سرعت دارد و برای بیشتر گفتگوها مناسب است.',
        badge: 'پیش‌فرض',
        description: 'کل متن پاسخ به‌عنوان یک ساختار واحد پردازش می‌شود و جهت مناسب برای کل پیام انتخاب می‌شود. این روش ترکیب متعادلی از دقت و کارایی ارائه می‌دهد و گزینه پیش‌فرض افزونه است.',
        extra: '',
    },
    {
        id: 'first_word',
        title: 'تشخیص مبتنی بر واژه آغازین',
        hint: 'فقط اولین کلمه متن بررسی می‌شود. سریع است و برای سیستم‌های ضعیف یا وقتی سایت هنگ می‌کند مناسب‌تر است.',
        badge: '',
        description: 'جهت متن تنها با بررسی اولین کلمه مشخص می‌شود. این روش برای سیستم‌هایی با توان پردازشی محدود مناسب است و در صورت هنگ و قفل شدن سایت توصیه می‌شود.',
        extra: '',
    },
] as const;

const TITLE_MODES = [
    {
        id: 'unified',
        title: 'قرار دادن عنوان‌ها در یک سمت',
        hint: 'همه عنوان‌ها بر اساس جهت اکثریت تنظیم می‌شوند',
    },
    {
        id: 'individual',
        title: 'تنظیم هر عنوان جداگانه',
        hint: 'هر عنوان بر اساس زبان خودش پردازش می‌شود',
    },
] as const;

const QuickSettings: React.FC<QuickSettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    selectedFont,
    onSelectedFontChange,
    mixedTitleDisplayMode,
    onMixedTitleDisplayModeChange,
    supportHide,
    onSupportChange,
    isDarkMode,
    manualRtlSettings,
    onManualRtlSettingsChange,
    onClose,
}) => {
    const [hasTabsPermission, setHasTabsPermission] = React.useState<boolean | null>(null);
    const [infoAlgoId, setInfoAlgoId] = React.useState<string | null>(null);
    const [fonts, setFonts] = React.useState<RtlFont[]>([]);

    React.useEffect(() => {
        const checkTabsPermission = async () => {
            try {
                const hasPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
                setHasTabsPermission(hasPermission);
            } catch {
                setHasTabsPermission(false);
            }
        };
        checkTabsPermission();
    }, []);

    React.useEffect(() => {
        let cancelled = false;
        loadFontsConfig()
            .then((config) => {
                if (cancelled) {
                    return;
                }
                const selectable = getSelectableFonts(config);
                setFonts(selectable);
                injectPreviewFontFaces('ai-rtl-popup-font-preview', selectable);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    const selectedAlgo = ALGORITHMS.find((item) => item.id === rtlAlgorithm) ?? ALGORITHMS[1];
    const selectedTitleMode = TITLE_MODES.find((item) => item.id === mixedTitleDisplayMode) ?? TITLE_MODES[0];
    const selectedFontOption = fonts.find((font) => font.id === selectedFont);
    const selectedFontFamily = selectedFont === NONE_FONT_ID
        ? 'iranyekan'
        : selectedFontOption
            ? getFontFamilyCssValue(selectedFontOption)
            : 'iranyekan, sans-serif';
    const infoAlgo = ALGORITHMS.find((item) => item.id === infoAlgoId) ?? null;
    const manualEnabled = manualRtlSettings.manualRtlEnabled !== false;

    const accent = isDarkMode ? '#00e9ff' : '#1e40af';
    const muted = isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.55)';
    const cardBg = isDarkMode ? 'rgba(47, 47, 65, 0.9)' : '#ffffff';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(30, 64, 175, 0.12)';
    const selectedBg = isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.08)';
    const fieldBg = isDarkMode ? 'rgba(26, 26, 46, 0.7)' : '#f8fafc';

    const switchSx = {
        '& .MuiSwitch-switchBase.Mui-checked': {
            color: isDarkMode ? '#00e9ff' : '#1c39bb',
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
        },
    };

    const openOptions = (hash = '') => {
        const page = hash ? `options.html#${hash}` : 'options.html';
        chrome.tabs.create({ url: chrome.runtime.getURL(page) });
    };

    return (
        <Box className="quick-settings" dir="rtl">
            <Box className="quick-settings-header">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    <Box
                        component={onClose ? 'button' : 'div'}
                        type={onClose ? 'button' : undefined}
                        onClick={onClose}
                        aria-label={onClose ? 'بستن تنظیمات' : undefined}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            minWidth: 0,
                            p: 0,
                            m: 0,
                            border: 0,
                            background: 'none',
                            cursor: onClose ? 'pointer' : 'default',
                            color: 'inherit',
                            font: 'inherit',
                            textAlign: 'right',
                            '&:hover .quick-settings-title': onClose
                                ? { color: accent }
                                : undefined,
                        }}
                    >
                        <SvgIcon sx={{ fontSize: '1.1rem', color: accent }}>
                            <path d={mdiCog} />
                        </SvgIcon>
                        <Typography
                            className="quick-settings-title"
                            sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDarkMode ? '#ffffff' : '#1e293b' }}
                        >
                            تنظیمات
                        </Typography>
                    </Box>
                    {onClose ? (
                        <Tooltip title="بستن تنظیمات">
                            <IconButton
                                size="small"
                                onClick={onClose}
                                aria-label="بستن تنظیمات"
                                sx={{
                                    p: 0.5,
                                    color: muted,
                                    '&:hover': {
                                        backgroundColor: selectedBg,
                                        color: accent,
                                    },
                                }}
                            >
                                <SvgIcon sx={{ fontSize: '1.05rem' }}>
                                    <path d={mdiClose} />
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    ) : null}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => openOptions()}
                        endIcon={
                            <SvgIcon sx={{ fontSize: '0.85rem !important' }}>
                                <path d={mdiOpenInNew} />
                            </SvgIcon>
                        }
                        sx={{
                            minWidth: 0,
                            px: 0.75,
                            py: 0.25,
                            color: accent,
                            textTransform: 'none',
                            fontFamily: 'iranyekan',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0,
                            '&:hover': {
                                backgroundColor: selectedBg,
                                transform: 'none',
                            },
                        }}
                    >
                        تنظیمات پیشرفته
                    </Button>
                </Box>
            </Box>

            <Box className="quick-settings-body">
                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                        }}
                    >
                        <Typography className="quick-settings-label">الگوریتم تشخیص</Typography>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => openOptions('algorithm')}
                            endIcon={
                                <SvgIcon sx={{ fontSize: '0.8rem !important' }}>
                                    <path d={mdiOpenInNew} />
                                </SvgIcon>
                            }
                            sx={{
                                minWidth: 0,
                                px: 0.5,
                                py: 0,
                                color: accent,
                                textTransform: 'none',
                                fontFamily: 'iranyekan',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: 'underline',
                                    transform: 'none',
                                },
                            }}
                        >
                            صفحه تست الگوریتم
                        </Button>
                    </Box>

                    <FormControl fullWidth size="small">
                        <Select
                            dir="rtl"
                            className="quick-settings-select"
                            value={rtlAlgorithm}
                            renderValue={(value) => ALGORITHMS.find((item) => item.id === value)?.title ?? ''}
                            onChange={(event) => onRtlAlgorithmChange(event.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    className: 'quick-settings-select-menu',
                                    sx: {
                                        mt: 0.5,
                                        backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                        backgroundImage: 'none',
                                    },
                                },
                            }}
                            sx={{
                                fontFamily: 'iranyekan',
                                fontSize: '0.82rem',
                                backgroundColor: fieldBg,
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                borderRadius: '10px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: cardBorder,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(30, 64, 175, 0.4)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: accent,
                                    borderWidth: '1px',
                                },
                                '& .MuiSelect-icon': {
                                    color: muted,
                                },
                            }}
                        >
                            {ALGORITHMS.map((algo) => (
                                <MenuItem
                                    key={algo.id}
                                    value={algo.id}
                                    dir="rtl"
                                    sx={{
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.82rem',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        py: 1,
                                        textAlign: 'right',
                                        direction: 'rtl',
                                    }}
                                >
                                    <span>{algo.title}</span>
                                    {algo.badge ? (
                                        <Box
                                            component="span"
                                            sx={{
                                                flexShrink: 0,
                                                px: 0.7,
                                                py: 0.1,
                                                borderRadius: 1,
                                                fontSize: '0.62rem',
                                                fontWeight: 600,
                                                color: accent,
                                                border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                                background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(30, 64, 175, 0.08)',
                                            }}
                                        >
                                            {algo.badge}
                                        </Box>
                                    ) : null}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.4, mt: 1 }}>
                        <IconButton
                            size="small"
                            aria-label={`توضیحات ${selectedAlgo.title}`}
                            onClick={() => setInfoAlgoId(selectedAlgo.id)}
                            sx={{
                                p: 0.2,
                                mt: '-1px',
                                flexShrink: 0,
                                color: accent,
                                '&:hover': {
                                    backgroundColor: selectedBg,
                                },
                            }}
                        >
                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                <path d={mdiInformationOutline} />
                            </SvgIcon>
                        </IconButton>
                        <Typography sx={{ fontSize: '0.72rem', color: muted, lineHeight: 1.55, flex: 1 }}>
                            {selectedAlgo.hint}
                        </Typography>
                    </Box>

                    {rtlAlgorithm === 'advanced_section' && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${cardBorder}` }}>
                            <Typography className="quick-settings-label" sx={{ mb: 1 }}>
                                نحوه نمایش عنوان‌ها
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    dir="rtl"
                                    className="quick-settings-select"
                                    value={mixedTitleDisplayMode}
                                    renderValue={(value) => TITLE_MODES.find((item) => item.id === value)?.title ?? ''}
                                    onChange={(event) => onMixedTitleDisplayModeChange(event.target.value)}
                                    MenuProps={{
                                        PaperProps: {
                                            className: 'quick-settings-select-menu',
                                            sx: {
                                                mt: 0.5,
                                                backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                                backgroundImage: 'none',
                                            },
                                        },
                                    }}
                                    sx={{
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.82rem',
                                        backgroundColor: fieldBg,
                                        color: isDarkMode ? '#ffffff' : '#1e293b',
                                        borderRadius: '10px',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: cardBorder,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(30, 64, 175, 0.4)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: accent,
                                            borderWidth: '1px',
                                        },
                                        '& .MuiSelect-icon': {
                                            color: muted,
                                        },
                                    }}
                                >
                                    {TITLE_MODES.map((mode) => (
                                        <MenuItem
                                            key={mode.id}
                                            value={mode.id}
                                            dir="rtl"
                                            sx={{
                                                fontFamily: 'iranyekan',
                                                fontSize: '0.82rem',
                                                py: 1,
                                                textAlign: 'right',
                                                direction: 'rtl',
                                            }}
                                        >
                                            {mode.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 1, lineHeight: 1.55 }}>
                                {selectedTitleMode.hint}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Typography className="quick-settings-label" sx={{ mb: 1 }}>
                        فونت
                    </Typography>
                    <FormControl fullWidth size="small">
                        <Select
                            dir="rtl"
                            className="quick-settings-select"
                            value={selectedFont}
                            renderValue={(value) => {
                                if (value === NONE_FONT_ID) {
                                    return NONE_FONT_TITLE;
                                }
                                return fonts.find((item) => item.id === value)?.title || value;
                            }}
                            onChange={(event) => onSelectedFontChange(event.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    className: 'quick-settings-select-menu',
                                    sx: {
                                        mt: 0.5,
                                        maxHeight: 280,
                                        backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                        backgroundImage: 'none',
                                    },
                                },
                            }}
                            sx={{
                                fontFamily: selectedFontFamily,
                                fontSize: '0.82rem',
                                backgroundColor: fieldBg,
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                borderRadius: '10px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: cardBorder,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(30, 64, 175, 0.4)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: accent,
                                    borderWidth: '1px',
                                },
                                '& .MuiSelect-icon': {
                                    color: muted,
                                },
                            }}
                        >
                            <MenuItem
                                value={NONE_FONT_ID}
                                dir="rtl"
                                sx={{
                                    fontFamily: 'iranyekan',
                                    fontSize: '0.82rem',
                                    py: 1,
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
                                        fontSize: '0.9rem',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        py: 1,
                                        textAlign: 'right',
                                        direction: 'rtl',
                                    }}
                                >
                                    <span>{font.title}</span>
                                    {font.id === DEFAULT_FONT_ID ? (
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
                                                color: accent,
                                                border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                                background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(30, 64, 175, 0.08)',
                                            }}
                                        >
                                            پیش‌فرض
                                        </Box>
                                    ) : null}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography className="quick-settings-label">مخفی کردن متن حمایت</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 0.35, lineHeight: 1.55 }}>
                                نشان‌دهنده فعال بودن افزونه
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: supportHide ? muted : accent,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {supportHide ? 'مخفی شده' : 'در حال نمایش'}
                            </Typography>
                            <Switch
                                size="small"
                                checked={supportHide}
                                onChange={(event) => onSupportChange(event.target.checked)}
                                data-settings-switch="true"
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'مخفی کردن متن حمایت' }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                                <Typography className="quick-settings-label">چینش دستی</Typography>
                                <Box
                                    component="span"
                                    sx={{
                                        px: 0.7,
                                        py: 0.1,
                                        borderRadius: 1,
                                        fontSize: '0.62rem',
                                        fontWeight: 600,
                                        color: isDarkMode ? '#ffb74d' : '#ef6c00',
                                        border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.45)' : 'rgba(239, 108, 0, 0.35)'}`,
                                        background: isDarkMode ? 'rgba(255, 152, 0, 0.12)' : 'rgba(255, 152, 0, 0.1)',
                                    }}
                                >
                                    آزمایشی
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, lineHeight: 1.55 }}>
                                راست‌چین یا چپ‌چین کردن متن در هر سایت
                            </Typography>
                        </Box>

                        {hasTabsPermission === true ? (
                            <Switch
                                size="small"
                                checked={manualEnabled}
                                onChange={(event) => {
                                    onManualRtlSettingsChange({
                                        ...manualRtlSettings,
                                        manualRtlEnabled: event.target.checked,
                                    });
                                }}
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'راست‌چین دستی' }}
                            />
                        ) : (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openOptions('manual-rtl')}
                                sx={{
                                    flexShrink: 0,
                                    fontSize: '0.7rem',
                                    fontFamily: 'iranyekan',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    px: 1,
                                    py: 0.25,
                                    minWidth: 0,
                                    borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.5)' : 'rgba(30, 64, 175, 0.5)',
                                    color: accent,
                                    '&:hover': {
                                        borderColor: accent,
                                        backgroundColor: selectedBg,
                                        transform: 'none',
                                    },
                                }}
                            >
                                فعال‌سازی
                            </Button>
                        )}
                    </Box>

                    {hasTabsPermission !== false && (
                        <Typography
                            sx={{
                                mt: 1,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: manualEnabled ? accent : muted,
                            }}
                        >
                            {manualEnabled ? 'فعال' : 'غیرفعال'}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Dialog
                open={Boolean(infoAlgo)}
                onClose={() => setInfoAlgoId(null)}
                maxWidth="xs"
                fullWidth
                sx={{
                    zIndex: 1500,
                    '& .MuiDialog-paper': {
                        padding: '8px',
                        direction: 'rtl',
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: 'rtl',
                        textAlign: 'right',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                    }}
                >
                    {infoAlgo?.title}
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'right', padding: '8px 16px' }}>
                    {infoAlgo ? (
                        <>
                            <Typography
                                sx={{
                                    fontSize: '0.85rem',
                                    fontFamily: 'iranyekan',
                                    lineHeight: 1.8,
                                }}
                            >
                                {infoAlgo.description}
                            </Typography>
                            {infoAlgo.extra ? (
                                <Typography
                                    sx={{
                                        fontSize: '0.8rem',
                                        fontFamily: 'iranyekan',
                                        lineHeight: 1.8,
                                        mt: 1,
                                        color: muted,
                                    }}
                                >
                                    {infoAlgo.extra}
                                </Typography>
                            ) : null}
                        </>
                    ) : null}
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px', flexDirection: 'row-reverse' }}>
                    <Button
                        onClick={() => setInfoAlgoId(null)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        بستن
                    </Button>
                    <Button
                        onClick={() => {
                            setInfoAlgoId(null);
                            openOptions('algorithm');
                        }}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        صفحه تست الگوریتم
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuickSettings;
