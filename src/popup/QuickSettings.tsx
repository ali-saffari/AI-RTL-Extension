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
    Slider,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { mdiCog, mdiOpenInNew, mdiClose, mdiInformationOutline } from '@mdi/js';
import { ManualRtlSettings } from '../types/manualRtl';
import ExperimentalBadge from '../components/ExperimentalBadge';
import { isFirefoxRuntime } from '../utils/isFirefox';
import {
    PinOpenSiteMode,
    hasTabsPermission as checkTabsPermission,
    rememberFullPinOpenSiteIntent,
    clearFullPinOpenSiteIntent,
    requestTabsPermission,
} from '../utils/pinOpenSite';
import PinOpenSiteModeSelect from '../components/PinOpenSiteModeSelect';
import {
    DEFAULT_FONT_ID,
    DEFAULT_FONT_SCALE,
    FONT_SCALE_STEP,
    MAX_FONT_SCALE,
    MIN_FONT_SCALE,
    NONE_FONT_ID,
    NONE_FONT_TITLE,
    RtlFont,
    formatFontScaleLabel,
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
    fontScale: number;
    onFontScaleChange: (value: number) => void;
    onFontScaleCommit: (value: number) => void;
    mixedTitleDisplayMode: string;
    onMixedTitleDisplayModeChange: (value: string) => void;
    applyAlgorithmToCode: boolean;
    onApplyAlgorithmToCodeChange: (enabled: boolean) => void;
    flipRtlArrows: boolean;
    onFlipRtlArrowsChange: (enabled: boolean) => void;
    fixMixedText: boolean;
    onFixMixedTextChange: (enabled: boolean) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    pinOpenSiteMode: PinOpenSiteMode;
    onPinOpenSiteModeChange: (mode: PinOpenSiteMode) => void;
    isDarkMode: boolean;
    onDarkModeChange: (enabled: boolean) => void;
    manualRtlSettings: ManualRtlSettings;
    onManualRtlSettingsChange: (settings: ManualRtlSettings) => void;
    onClose?: () => void;
    extensionEnabled?: boolean;
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

const THEME_MODES = [
    { id: 'dark', title: 'تاریک' },
    { id: 'light', title: 'روشن' },
] as const;

const QuickSettings: React.FC<QuickSettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    selectedFont,
    onSelectedFontChange,
    fontScale,
    onFontScaleChange,
    onFontScaleCommit,
    mixedTitleDisplayMode,
    onMixedTitleDisplayModeChange,
    applyAlgorithmToCode,
    onApplyAlgorithmToCodeChange,
    flipRtlArrows,
    onFlipRtlArrowsChange,
    supportHide,
    onSupportChange,
    pinOpenSiteMode,
    onPinOpenSiteModeChange,
    isDarkMode,
    onDarkModeChange,
    manualRtlSettings,
    onManualRtlSettingsChange,
    onClose,
    extensionEnabled = true,
}) => {
    const [hasTabsPermission, setHasTabsPermission] = React.useState<boolean | null>(null);
    const [infoAlgoId, setInfoAlgoId] = React.useState<string | null>(null);
    const [codeInfoOpen, setCodeInfoOpen] = React.useState(false);
    // const [mixedInfoOpen, setMixedInfoOpen] = React.useState(false);
    const [fonts, setFonts] = React.useState<RtlFont[]>([]);
    const [pinSitePermissionOpen, setPinSitePermissionOpen] = React.useState(false);

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
        '& .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled)': {
            color: isDarkMode ? '#00e9ff' : '#1c39bb',
        },
        '& .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled) + .MuiSwitch-track': {
            backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
        },
        '& .MuiSwitch-switchBase.Mui-disabled': {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        },
        '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
            opacity: 1,
        },
        '& .Mui-disabled': {
            opacity: 0.5,
        },
    };

    const disabledControlColor = isDarkMode ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.26)';
    const controlsDisabled = !extensionEnabled;

    const openOptions = (hash = '') => {
        const page = hash ? `options.html#${hash}` : 'options.html';
        chrome.tabs.create({ url: chrome.runtime.getURL(page) });
    };

    const handlePinOpenSiteModeSelect = async (mode: PinOpenSiteMode) => {
        if (mode !== 'full' || isFirefoxRuntime() || hasTabsPermission === true) {
            onPinOpenSiteModeChange(mode);
            return;
        }

        const alreadyGranted = await checkTabsPermission();
        if (alreadyGranted) {
            setHasTabsPermission(true);
            onPinOpenSiteModeChange('full');
            return;
        }

        setPinSitePermissionOpen(true);
    };

    const handleRequestPinSitePermission = async () => {
        const previousMode = pinOpenSiteMode;
        rememberFullPinOpenSiteIntent();
        onPinOpenSiteModeChange('full');
        const granted = await requestTabsPermission();
        if (granted) {
            setHasTabsPermission(true);
            setPinSitePermissionOpen(false);
            void clearFullPinOpenSiteIntent();
            return;
        }
        setPinSitePermissionOpen(false);
        onPinOpenSiteModeChange(previousMode);
        void clearFullPinOpenSiteIntent();
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
                {!extensionEnabled ? (
                    <Box
                        className="popup-disabled-overlay"
                        role="status"
                        aria-live="polite"
                        sx={{
                            backgroundColor: isDarkMode ? 'rgba(10, 14, 28, 0.38)' : 'rgba(226, 232, 240, 0.42)',
                        }}
                    >
                        <Typography
                            className="popup-disabled-overlay-label"
                            sx={{
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                backgroundColor: isDarkMode ? 'rgba(26, 26, 46, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                                border: isDarkMode
                                    ? '1px solid rgba(0, 233, 255, 0.28)'
                                    : '1px solid rgba(30, 64, 175, 0.2)',
                                boxShadow: isDarkMode
                                    ? '0 8px 24px rgba(0, 0, 0, 0.28)'
                                    : '0 8px 24px rgba(15, 23, 42, 0.1)',
                            }}
                        >
                            افزونه غیر فعال است
                        </Typography>
                    </Box>
                ) : null}
                <Box className="quick-settings-body-scroll">
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

                    <FormControl fullWidth size="small" disabled={controlsDisabled}>
                        <Select
                            dir="rtl"
                            className="quick-settings-select"
                            value={rtlAlgorithm}
                            disabled={controlsDisabled}
                            renderValue={(value) => ALGORITHMS.find((item) => item.id === value)?.title ?? ''}
                            onChange={(event) => onRtlAlgorithmChange(event.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    className: 'quick-settings-select-menu quick-settings-algo-menu',
                                    sx: {
                                        mt: 0.5,
                                        backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                        backgroundImage: 'none',
                                        width: 330,
                                        maxWidth: 330,
                                        boxSizing: 'border-box',
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
                                    className="quick-settings-algo-item"
                                    sx={{
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.82rem',
                                        alignItems: 'flex-start',
                                        py: 1.1,
                                        whiteSpace: 'normal',
                                        textAlign: 'right',
                                        direction: 'rtl',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, width: '100%', minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
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
                                        </Box>
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontSize: '0.68rem',
                                                color: muted,
                                                lineHeight: 1.5,
                                                whiteSpace: 'normal',
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-word',
                                                fontFamily: 'iranyekan',
                                            }}
                                        >
                                            {algo.hint}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography sx={{ fontSize: '0.72rem', color: muted, lineHeight: 1.55, mt: 1 }}>
                        {selectedAlgo.hint}
                        <IconButton
                            size="small"
                            aria-label={`توضیحات ${selectedAlgo.title}`}
                            onClick={() => setInfoAlgoId(selectedAlgo.id)}
                            sx={{
                                p: 0.2,
                                ml: 0.15,
                                mb: '1px',
                                verticalAlign: 'middle',
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
                    </Typography>

                    {rtlAlgorithm === 'advanced_section' && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${cardBorder}` }}>
                            <Typography className="quick-settings-label" sx={{ mb: 1 }}>
                                نحوه نمایش عنوان‌ها
                            </Typography>
                            <FormControl fullWidth size="small" disabled={controlsDisabled}>
                                <Select
                                    dir="rtl"
                                    className="quick-settings-select"
                                    value={mixedTitleDisplayMode}
                                    disabled={controlsDisabled}
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

                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${cardBorder}` }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography className="quick-settings-label">
                                    برعکس کردن فلش‌ها در متن راست‌چین
                                </Typography>
                                <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                            </Box>
                            <Switch
                                size="small"
                                checked={flipRtlArrows}
                                disabled={controlsDisabled}
                                onChange={(event) => onFlipRtlArrowsChange(event.target.checked)}
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'برعکس کردن فلش‌ها در متن راست‌چین' }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${cardBorder}` }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                <Typography className="quick-settings-label">
                                    اعمال روی باکس کدها{' '}
                                    <Box component="span" sx={{ fontSize: '0.88em', fontWeight: 500, opacity: 0.72 }}>
                                        (Markdown)
                                    </Box>
                                </Typography>
                                <IconButton
                                    size="small"
                                    aria-label="توضیحات اعمال روی باکس کدها"
                                    onClick={() => setCodeInfoOpen(true)}
                                    sx={{
                                        p: 0.2,
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
                                <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                            </Box>
                            <Switch
                                size="small"
                                checked={applyAlgorithmToCode}
                                disabled={controlsDisabled}
                                onChange={(event) => onApplyAlgorithmToCodeChange(event.target.checked)}
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'اعمال روی باکس کدها (Markdown)' }}
                            />
                        </Box>
                    </Box>

                    {/* اصلاح متن‌های ترکیبی — موقتاً پنهان
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${cardBorder}` }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                <Typography className="quick-settings-label">
                                    اصلاح متن‌های ترکیبی
                                </Typography>
                                <IconButton
                                    size="small"
                                    aria-label="توضیحات اصلاح متن‌های ترکیبی"
                                    onClick={() => setMixedInfoOpen(true)}
                                    sx={{
                                        p: 0.2,
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
                                <ExperimentalBadge isDarkMode={isDarkMode} />
                            </Box>
                            <Switch
                                size="small"
                                checked={fixMixedText}
                                disabled
                                onChange={(event) => onFixMixedTextChange(event.target.checked)}
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'اصلاح متن‌های ترکیبی' }}
                            />
                        </Box>
                    </Box>
                    */}
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                        <Typography className="quick-settings-label">
                            فونت
                        </Typography>
                        <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                    </Box>
                    <FormControl fullWidth size="small" disabled={controlsDisabled}>
                        <Select
                            dir="rtl"
                            className="quick-settings-select"
                            value={selectedFont}
                            disabled={controlsDisabled}
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
                    <Box sx={{ mt: 1.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography className="quick-settings-label">اندازه فونت</Typography>
                                <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: muted }}>
                                {formatFontScaleLabel(fontScale)}
                            </Typography>
                        </Box>
                        <Slider
                            size="small"
                            value={fontScale}
                            min={MIN_FONT_SCALE}
                            max={MAX_FONT_SCALE}
                            step={FONT_SCALE_STEP}
                            marks={[{ value: DEFAULT_FONT_SCALE }]}
                            disabled={controlsDisabled}
                            onChange={(_, value) => onFontScaleChange(value as number)}
                            onChangeCommitted={(_, value) => onFontScaleCommit(value as number)}
                            sx={{
                                mt: 0.5,
                                color: controlsDisabled ? disabledControlColor : accent,
                                '& .MuiSlider-rail': {
                                    opacity: 0.35
                                },
                                '& .MuiSlider-mark': {
                                    backgroundColor: controlsDisabled ? disabledControlColor : accent,
                                    height: 8,
                                    width: 2
                                },
                                '&.Mui-disabled': {
                                    color: disabledControlColor,
                                    opacity: 0.55,
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder, gap: 0, p: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1.5,
                            py: 1.25,
                        }}
                    >
                        <Typography className="quick-settings-label">تم منو اکستشن</Typography>
                        <FormControl size="small" disabled={controlsDisabled} sx={{ minWidth: '7.5rem', width: 'max-content', flexShrink: 0 }}>
                            <Select
                                dir="rtl"
                                className="quick-settings-select"
                                value={isDarkMode ? 'dark' : 'light'}
                                disabled={controlsDisabled}
                                renderValue={(value) => THEME_MODES.find((item) => item.id === value)?.title ?? ''}
                                onChange={(event) => onDarkModeChange(event.target.value === 'dark')}
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
                                    minWidth: '7.5rem',
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
                                    '& .MuiSelect-select': {
                                        whiteSpace: 'nowrap',
                                    },
                                    '& .MuiSelect-icon': {
                                        color: muted,
                                    },
                                }}
                                inputProps={{ 'aria-label': 'تم منو اکستشن' }}
                            >
                                {THEME_MODES.map((mode) => (
                                    <MenuItem
                                        key={mode.id}
                                        value={mode.id}
                                        dir="rtl"
                                        sx={{
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.82rem',
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            width: '100%',
                                        }}
                                    >
                                        {mode.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1.5,
                            py: 1.25,
                            borderTop: `1px solid ${cardBorder}`,
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography className="quick-settings-label">نمایش سایت باز در بالای لیست</Typography>
                        </Box>
                        <PinOpenSiteModeSelect
                            value={pinOpenSiteMode}
                            onChange={(mode) => {
                                void handlePinOpenSiteModeSelect(mode);
                            }}
                            isDarkMode={isDarkMode}
                            disabled={controlsDisabled}
                        />
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
                                <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, lineHeight: 1.55 }}>
                                راست‌چین یا چپ‌چین کردن متن در هر سایت
                            </Typography>
                        </Box>

                        {hasTabsPermission === true ? (
                            <Switch
                                size="small"
                                checked={manualEnabled}
                                disabled={controlsDisabled}
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
                                disabled={controlsDisabled}
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
                                    color: controlsDisabled
                                        ? muted
                                        : (supportHide ? muted : accent),
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {supportHide ? 'مخفی شده' : 'در حال نمایش'}
                            </Typography>
                            <Switch
                                size="small"
                                checked={supportHide}
                                disabled={controlsDisabled}
                                onChange={(event) => onSupportChange(event.target.checked)}
                                data-settings-switch="true"
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'مخفی کردن متن حمایت' }}
                            />
                        </Box>
                    </Box>
                </Box>
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
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
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
                    <Button
                        onClick={() => setInfoAlgoId(null)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>
            {/* دیالوگ توضیح اصلاح متن‌های ترکیبی — موقتاً پنهان
            <Dialog
                open={mixedInfoOpen}
                onClose={() => setMixedInfoOpen(false)}
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
                    اصلاح متن‌های ترکیبی
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'right', padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                        }}
                    >
                        گاهی وسط جملهٔ فارسی، چند کلمهٔ انگلیسی پشت‌سرهم می‌آید و جایشان عوض می‌شود. اگر این گزینه را روشن کنید، همان انگلیسی درست و به ترتیب خوانده می‌شود. پیش‌فرض خاموش است.
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                            mt: 1,
                            color: muted,
                        }}
                    >
                        مثال: «Plus ChatGPT» می‌شود «ChatGPT Plus». در جملهٔ «برای اتصال از USB، HDMI استفاده کنید» هم جای USB و HDMI عوض نمی‌شود.
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setMixedInfoOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>
            */}
            <Dialog
                open={codeInfoOpen}
                onClose={() => setCodeInfoOpen(false)}
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
                    اعمال روی باکس کدها (Markdown)
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'right', padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                        }}
                    >
                        وقتی این گزینه روشن باشد، الگوریتم فقط روی باکس‌هایی اعمال می‌شود که محتوای فارسی دارند. متن فارسی در این باکس‌ها راست‌چین می‌شود تا خواندنش راحت‌تر باشد.
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                            mt: 1,
                            color: muted,
                        }}
                    >
                        روی خودِ کدهای برنامه‌نویسی تغییری اعمال نمی‌شود و جهت آن‌ها چپ‌چین باقی می‌ماند.
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setCodeInfoOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={pinSitePermissionOpen}
                onClose={() => setPinSitePermissionOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                    نیاز به دسترسی تب
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                    >
                        برای اینکه سایتِ در حال مشاهده (در صورت پشتیبانی شدن توسط افزونه) همیشه بالای لیست بیاید، حتی اگر هنوز آن را فعال نکرده باشید، افزونه با کمک «مجوز تب‌ها» باز بودن آن را تشخیص می‌دهد تا بتوانید سریع‌تر فعالش کنید.
                    </Typography>
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                    >
                        این دسترسی صرفاً برای خواندن «نام دامنه» تب فعلی است و افزونه هیچ‌گونه دسترسی به آدرس کامل، محتوای صفحه یا اطلاعات شخصی شما ندارد.
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setPinSitePermissionOpen(false)}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan' }}
                    >
                        بستن
                    </Button>
                    <Button
                        onClick={() => {
                            void handleRequestPinSitePermission();
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan' }}
                    >
                        دریافت مجوز
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuickSettings;
