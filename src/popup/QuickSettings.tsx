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
import { mdiInformationOutline, mdiCog, mdiChevronDown, mdiLinkedin, mdiClose, mdiHeartOutline } from '@mdi/js';
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
import SiteSettingsSection from './SiteSettingsSection';
// import InstallHintBanner from './InstallHintBanner'; // kept for restoring algorithm personalization hint
import { useHarnessPluginPresent } from './harnessPluginPresence';
import { normalizeSiteSettings, SITE_SETTINGS_STORAGE_KEY } from '../constants/siteSettings';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n';

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
    activeServiceKey?: string | null;
    focusSiteKey?: string | null;
    focusNonce?: number;
    extensionEnabled?: boolean;
    onEnableExtension?: () => void;
    showAlgorithmHint?: boolean;
    onAlgorithmHintDismiss?: () => void;
}

type TranslateFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

const getAlgorithms = (t: TranslateFn) => [
    {
        id: 'advanced_section',
        title: t('quickSettings.algorithms.advancedSection.title'),
        hint: t('quickSettings.algorithms.advancedSection.hint'),
        badge: t('quickSettings.algorithms.advancedSection.badge'),
        defaultBadge: '',
        description: t('quickSettings.algorithms.advancedSection.description'),
        extra: t('quickSettings.algorithms.advancedSection.extra'),
    },
    {
        id: 'advanced_full',
        title: t('quickSettings.algorithms.advancedFull.title'),
        hint: t('quickSettings.algorithms.advancedFull.hint'),
        badge: t('quickSettings.algorithms.advancedFull.badge'),
        defaultBadge: t('settings.defaultBadge'),
        description: t('quickSettings.algorithms.advancedFull.description'),
        extra: '',
    },
    {
        id: 'first_word',
        title: t('quickSettings.algorithms.firstWord.title'),
        hint: t('quickSettings.algorithms.firstWord.hint'),
        badge: '',
        defaultBadge: '',
        description: t('quickSettings.algorithms.firstWord.description'),
        extra: '',
    },
];

const getTitleModes = (t: TranslateFn) => [
    {
        id: 'unified',
        title: t('quickSettings.titleModes.unified.title'),
        descriptionTitle: t('quickSettings.titleModes.unified.descriptionTitle'),
        hint: t('quickSettings.titleModes.unified.hint'),
    },
    {
        id: 'individual',
        title: t('quickSettings.titleModes.individual.title'),
        descriptionTitle: t('quickSettings.titleModes.individual.descriptionTitle'),
        hint: t('quickSettings.titleModes.individual.hint'),
    },
];

const getThemeModes = (t: TranslateFn) => [
    { id: 'dark', title: t('quickSettings.themeDark') },
    { id: 'light', title: t('quickSettings.themeLight') },
];

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
    activeServiceKey = null,
    focusSiteKey = null,
    focusNonce = 0,
    extensionEnabled = true,
    onEnableExtension,
    showAlgorithmHint: _showAlgorithmHint = false,
    onAlgorithmHintDismiss: _onAlgorithmHintDismiss,
}) => {
    void _showAlgorithmHint;
    void _onAlgorithmHintDismiss;
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const ALGORITHMS = getAlgorithms(t);
    const TITLE_MODES = getTitleModes(t);
    const THEME_MODES = getThemeModes(t);
    const [hasTabsPermission, setHasTabsPermission] = React.useState<boolean | null>(null);
    const [algoInfoOpen, setAlgoInfoOpen] = React.useState(false);
    const [titleInfoOpen, setTitleInfoOpen] = React.useState(false);
    const [codeInfoOpen, setCodeInfoOpen] = React.useState(false);
    // const [mixedInfoOpen, setMixedInfoOpen] = React.useState(false);
    const [fonts, setFonts] = React.useState<RtlFont[]>([]);
    const [pinSitePermissionOpen, setPinSitePermissionOpen] = React.useState(false);
    const [sponsorNoteExpanded, setSponsorNoteExpanded] = React.useState(false);
    const [harnessEngine, setHarnessEngine] = React.useState('chrome');
    const harnessPluginPresent = useHarnessPluginPresent(activeServiceKey === 'harness');

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
        const applyEngine = (stored: unknown) => {
            const engine = (normalizeSiteSettings(stored) as { harness?: { engine?: string } }).harness?.engine;
            setHarnessEngine(engine === 'dsh' ? 'dsh' : 'chrome');
        };

        try {
            chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (result) => {
                applyEngine(result?.[SITE_SETTINGS_STORAGE_KEY]);
            });
        } catch {
            applyEngine(undefined);
        }

        const handleEngineChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName !== 'sync' || !changes[SITE_SETTINGS_STORAGE_KEY]) {
                return;
            }
            applyEngine(changes[SITE_SETTINGS_STORAGE_KEY].newValue);
        };

        try {
            chrome.storage.onChanged.addListener(handleEngineChange);
        } catch {
            // Storage events are unavailable outside the extension runtime.
        }

        return () => {
            try {
                chrome.storage.onChanged.removeListener(handleEngineChange);
            } catch {
                // Ignore cleanup when storage is unavailable.
            }
        };
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

    const selectedFontOption = fonts.find((font) => font.id === selectedFont);
    const selectedFontFamily = selectedFont === NONE_FONT_ID
        ? 'iranyekan'
        : selectedFontOption
            ? getFontFamilyCssValue(selectedFontOption)
            : 'iranyekan, sans-serif';
    const manualEnabled = manualRtlSettings.manualRtlEnabled !== false;

    const accent = isDarkMode ? '#00e9ff' : '#387af2';
    const muted = isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.55)';
    const cardBg = isDarkMode ? 'rgba(47, 47, 65, 0.9)' : '#ffffff';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(56, 122, 242, 0.22)';
    const selectedBg = isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.08)';
    const fieldBg = isDarkMode ? 'rgba(26, 26, 46, 0.7)' : '#f8fafc';
    const inlineSelectSx = {
        width: '100%',
        fontFamily: 'iranyekan',
        fontSize: '0.68rem',
        backgroundColor: fieldBg,
        color: isDarkMode ? '#ffffff' : '#1e293b',
        borderRadius: '8px',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: cardBorder,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(56, 122, 242, 0.4)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: accent,
            borderWidth: '1px',
        },
        '& .MuiSelect-select': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            py: 0.35,
        },
        '& .MuiSelect-icon': {
            color: muted,
        },
    };

    const switchSx = {
        '& .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled)': {
            color: isDarkMode ? '#00e9ff' : '#387af2',
        },
        '& .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled) + .MuiSwitch-track': {
            backgroundColor: isDarkMode ? '#00e9ff' : '#387af2',
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
    const extensionOff = !extensionEnabled;
    const harnessQuickLocked = !extensionOff && activeServiceKey === 'harness' && harnessEngine === 'dsh' && harnessPluginPresent !== false;
    const controlsDisabled = extensionOff || harnessQuickLocked;

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
            {onClose ? (
                <Box className="quick-settings-header" dir={dir} style={{ direction: dir, textAlign: contentAlign }}>
                    <Typography
                        className="quick-settings-label"
                        sx={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
                    >
                        {t('quickSettings.title')}
                    </Typography>
                    <Button
                        variant="text"
                        size="small"
                        onClick={onClose}
                        startIcon={
                            <SvgIcon sx={{ fontSize: '1rem !important' }}>
                                <path d={mdiClose} />
                            </SvgIcon>
                        }
                        sx={{
                            minWidth: 0,
                            px: 0.75,
                            py: 0.25,
                            color: isDarkMode ? '#ffffff' : '#1e293b',
                            textTransform: 'none',
                            fontFamily: 'iranyekan',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(56, 122, 242, 0.08)',
                                transform: 'none',
                            },
                        }}
                    >
                        {t('shared.close')}
                    </Button>
                </Box>
            ) : null}
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
                        <Box
                            className="popup-disabled-overlay-card"
                            sx={{
                                backgroundColor: isDarkMode ? 'rgba(26, 26, 46, 0.72)' : 'rgba(255, 255, 255, 0.72)',
                                borderTop: isDarkMode
                                    ? '2px solid rgba(255, 138, 138, 0.75)'
                                    : '2px solid rgba(239, 83, 80, 0.75)',
                                borderBottom: isDarkMode
                                    ? '2px solid rgba(255, 138, 138, 0.75)'
                                    : '2px solid rgba(239, 83, 80, 0.75)',
                                borderLeft: 'none',
                                borderRight: 'none',
                                borderRadius: 0,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'iranyekan',
                                    fontWeight: 300,
                                    fontSize: '0.8rem',
                                    lineHeight: 1.5,
                                    color: isDarkMode ? '#ff8a8a' : '#ef5350',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {t('quickSettings.extensionOff')}
                            </Typography>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => onEnableExtension?.()}
                                sx={{
                                    flexShrink: 0,
                                    px: 1,
                                    py: 0.25,
                                    minWidth: 0,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontFamily: 'iranyekan',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    boxShadow: 'none',
                                    border: 'none',
                                    color: isDarkMode ? '#00e9ff' : '#387af2',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        border: 'none',
                                        backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(56, 122, 242, 0.06)',
                                        boxShadow: 'none',
                                        transform: 'none',
                                    },
                                }}
                            >
                                {t('quickSettings.enable')}
                            </Button>
                        </Box>
                    </Box>
                ) : null}
                <Box
                    className={`quick-settings-body-scroll${extensionOff ? ' is-disabled' : ''}`}
                >
                <Box className="popup-sponsors popup-sponsors--scroll" aria-label={t('quickSettings.sponsorsAria')}>
                    <div className="popup-sponsors-top quick-settings-section-bar">
                        <span className="popup-sponsors-caption-wrap">
                            <SvgIcon sx={{ fontSize: '1.05rem' }}>
                                <path d={mdiHeartOutline} />
                            </SvgIcon>
                            <Typography className="popup-sponsors-caption quick-settings-label quick-settings-heading" component="span">
                                {t('quickSettings.sponsorsCaption')}
                            </Typography>
                        </span>
                        <a
                            className="popup-sponsors-cta"
                            href="https://t.me/ai_rtl_support"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('quickSettings.sponsorsCta')}
                        </a>
                    </div>
                    <div className="popup-sponsors-slots">
                        <a
                            className="popup-sponsors-box popup-sponsors-box--half popup-sponsors-box--filled"
                            href="https://paasta.cloud"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('quickSettings.sponsorLogoAlt')}
                        >
                            <span className="popup-sponsors-paasta" dir="ltr">
                                <img src="/images/logo/paasta-type.svg" alt="" />
                                <img src="/images/logo/paasta-logo.png" alt={t('quickSettings.sponsorLogoAlt')} />
                            </span>
                        </a>
                        <a
                            className="popup-sponsors-box popup-sponsors-box--half"
                            href="https://t.me/ai_rtl_support"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('quickSettings.sponsorLogoPlaceholder')}
                        </a>
                    </div>
                    <div className={`popup-sponsors-note${sponsorNoteExpanded ? ' is-expanded' : ''}`}>
                        <button
                            type="button"
                            className="popup-sponsors-note-line"
                            aria-expanded={sponsorNoteExpanded}
                            aria-label={sponsorNoteExpanded ? t('quickSettings.sponsorNoteCollapse') : t('quickSettings.sponsorNoteExpand')}
                            onClick={() => setSponsorNoteExpanded((open) => !open)}
                        >
                            <span className="popup-sponsors-note-text">
                                {t('quickSettings.sponsorNote')}
                            </span>
                            <SvgIcon className="popup-sponsors-note-toggle" sx={{ fontSize: '1.05rem' }}>
                                <path d={mdiChevronDown} />
                            </SvgIcon>
                        </button>
                        {sponsorNoteExpanded ? (
                            <span className="popup-sponsors-note-social">
                                    <span>{t('quickSettings.sponsorSignoff')}</span>
                                    <a
                                        href="https://www.linkedin.com/in/ali-saffari-83a369174/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t('quickSettings.sponsorLinkedin')}
                                    >
                                        <SvgIcon sx={{ fontSize: '1rem' }}>
                                            <path d={mdiLinkedin} />
                                        </SvgIcon>
                                    </a>
                            </span>
                        ) : null}
                    </div>
                </Box>
                <Box
                    aria-hidden
                    sx={{
                        width: 'calc(100% + 16px)',
                        mx: '-8px',
                        height: '1px',
                        flexShrink: 0,
                        backgroundColor: isDarkMode
                            ? 'rgba(0, 233, 255, 0.45)'
                            : 'rgba(56, 122, 242, 0.4)',
                    }}
                />
                {/* Algorithm personalization hint hidden for now — do not remove algorithmHintDismissed storage.
                {showAlgorithmHint ? (
                    <InstallHintBanner
                        variant="algorithm"
                        isDarkMode={isDarkMode}
                        embedded
                        onDismiss={onAlgorithmHintDismiss}
                        onOpenSettings={() => {
                            document
                                .getElementById('quick-settings-algorithm')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                    />
                ) : null}
                */}
                <SiteSettingsSection
                    isDarkMode={isDarkMode}
                    activeServiceKey={activeServiceKey}
                    focusSiteKey={focusSiteKey}
                    focusNonce={focusNonce}
                />
                <Box className={`quick-settings-lock${harnessQuickLocked ? ' is-locked' : ''}`}>
                {harnessQuickLocked ? (
                    <Box className="quick-settings-lock-layer" role="status">
                        <Typography className="quick-settings-lock-card" component="p">
                            {t('quickSettings.useHarnessPlugin')}
                        </Typography>
                    </Box>
                ) : null}
                <Box className="quick-settings-section-bar" sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0, minWidth: 0 }}>
                        <SvgIcon sx={{ fontSize: '1.05rem', color: accent }}>
                            <path d={mdiCog} />
                        </SvgIcon>
                        <Typography
                            className="quick-settings-label quick-settings-heading"
                            sx={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
                        >
                            {t('quickSettings.quickTitle')}
                        </Typography>
                    </Box>
                    <Button
                        variant="text"
                        size="small"
                        disabled={controlsDisabled}
                        onClick={() => openOptions()}
                        sx={{
                            minWidth: 0,
                            px: 0.5,
                            py: 0,
                            color: accent,
                            textTransform: 'none',
                            fontFamily: 'iranyekan',
                            fontSize: '0.64rem',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline',
                                transform: 'none',
                            },
                        }}
                    >
                        {t('quickSettings.advancedSettings')}
                    </Button>
                </Box>
                <Box
                    id="quick-settings-algorithm"
                    className="quick-settings-card"
                    sx={{ background: cardBg, borderColor: cardBorder }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0, flexShrink: 0 }}>
                            <Typography className="quick-settings-label" sx={{ whiteSpace: 'nowrap' }}>
                                {t('quickSettings.algorithmLabel')}
                            </Typography>
                            <IconButton
                                size="small"
                                disabled={controlsDisabled}
                                aria-label={t('quickSettings.algoInfoAria')}
                                onClick={() => setAlgoInfoOpen(true)}
                                sx={{
                                    p: 0.2,
                                    flexShrink: 0,
                                    color: accent,
                                    '&:hover': {
                                        backgroundColor: selectedBg,
                                    },
                                }}
                            >
                                <SvgIcon sx={{ fontSize: '0.95rem' }}>
                                    <path d={mdiInformationOutline} />
                                </SvgIcon>
                            </IconButton>
                        </Box>
                        <FormControl size="small" disabled={controlsDisabled} sx={{ width: 168, flex: '0 0 168px', minWidth: 0 }}>
                            <Select
                                dir={dir}
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
                                sx={inlineSelectSx}
                                inputProps={{ 'aria-label': t('quickSettings.algorithmAria') }}
                            >
                                {ALGORITHMS.map((algo) => (
                                    <MenuItem
                                        key={algo.id}
                                        value={algo.id}
                                        dir={dir}
                                        className="quick-settings-algo-item"
                                        sx={{
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.82rem',
                                            alignItems: 'flex-start',
                                            py: 1.1,
                                            whiteSpace: 'normal',
                                            textAlign: contentAlign,
                                            direction: dir,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, width: '100%', minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <span>{algo.title}</span>
                                                {(algo.badge || algo.defaultBadge) ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
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
                                                                    border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(56, 122, 242, 0.3)'}`,
                                                                    background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(56, 122, 242, 0.08)',
                                                                }}
                                                            >
                                                                {algo.badge}
                                                            </Box>
                                                        ) : null}
                                                        {algo.defaultBadge ? (
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
                                                                    border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(56, 122, 242, 0.3)'}`,
                                                                    background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(56, 122, 242, 0.08)',
                                                                }}
                                                            >
                                                                {algo.defaultBadge}
                                                            </Box>
                                                        ) : null}
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
                    </Box>

                    {rtlAlgorithm === 'advanced_section' && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                minWidth: 0,
                                mt: 1,
                                pt: 1,
                                borderTop: `1px solid ${cardBorder}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0, flexShrink: 0 }}>
                                <Typography className="quick-settings-label" sx={{ whiteSpace: 'nowrap' }}>
                                    {t('quickSettings.titleModeLabel')}
                                </Typography>
                                <IconButton
                                    size="small"
                                    disabled={controlsDisabled}
                                    aria-label={t('quickSettings.titleInfoAria')}
                                    onClick={() => setTitleInfoOpen(true)}
                                    sx={{
                                        p: 0.2,
                                        flexShrink: 0,
                                        color: accent,
                                        '&:hover': {
                                            backgroundColor: selectedBg,
                                        },
                                    }}
                                >
                                    <SvgIcon sx={{ fontSize: '0.95rem' }}>
                                        <path d={mdiInformationOutline} />
                                    </SvgIcon>
                                </IconButton>
                            </Box>
                            <FormControl size="small" disabled={controlsDisabled} sx={{ width: 168, flex: '0 0 168px', minWidth: 0 }}>
                                <Select
                                    dir={dir}
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
                                    sx={inlineSelectSx}
                                    inputProps={{ 'aria-label': t('quickSettings.titleModeAria') }}
                                >
                                    {TITLE_MODES.map((mode) => (
                                        <MenuItem
                                            key={mode.id}
                                            value={mode.id}
                                            dir={dir}
                                            sx={{
                                                fontFamily: 'iranyekan',
                                                fontSize: '0.78rem',
                                                py: 0.75,
                                                whiteSpace: 'nowrap',
                                                textAlign: contentAlign,
                                                direction: dir,
                                            }}
                                        >
                                            {mode.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${cardBorder}` }}>
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
                                    {t('quickSettings.flipArrows')}
                                </Typography>
                                <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                            </Box>
                            <Switch
                                size="small"
                                checked={flipRtlArrows}
                                disabled={controlsDisabled}
                                onChange={(event) => onFlipRtlArrowsChange(event.target.checked)}
                                sx={switchSx}
                                inputProps={{ 'aria-label': t('quickSettings.flipArrowsAria') }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${cardBorder}` }}>
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
                                    {t('quickSettings.applyToCode')}{' '}
                                    <Box component="span" sx={{ fontSize: '0.88em', fontWeight: 500, opacity: 0.72 }}>
                                        (Markdown)
                                    </Box>
                                </Typography>
                                <IconButton
                                    size="small"
                                    disabled={controlsDisabled}
                                    aria-label={t('quickSettings.applyToCodeInfoAria')}
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
                                inputProps={{ 'aria-label': t('quickSettings.applyToCodeAria') }}
                            />
                        </Box>
                    </Box>

                    {/* اصلاح متن‌های ترکیبی — موقتاً پنهان
                    <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${cardBorder}` }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            <Typography className="quick-settings-label">
                                {t('quickSettings.font')}
                            </Typography>
                        </Box>
                    <FormControl size="small" disabled={controlsDisabled} sx={{ width: 136, flex: '0 0 136px', minWidth: 0 }}>
                        <Select
                            dir={dir}
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
                                ...inlineSelectSx,
                                fontFamily: selectedFontFamily,
                            }}
                            inputProps={{ 'aria-label': t('quickSettings.fontAria') }}
                        >
                            <MenuItem
                                value={NONE_FONT_ID}
                                dir={dir}
                                sx={{
                                    fontFamily: 'iranyekan',
                                    fontSize: '0.82rem',
                                    py: 1,
                                    textAlign: contentAlign,
                                    direction: dir,
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
                                    dir={dir}
                                    sx={{
                                        fontFamily: getFontFamilyCssValue(font),
                                        fontSize: '0.9rem',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        py: 1,
                                        textAlign: contentAlign,
                                        direction: dir,
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
                                                border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(56, 122, 242, 0.3)'}`,
                                                background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(56, 122, 242, 0.08)',
                                            }}
                                        >
                                            {t('shared.default')}
                                        </Box>
                                    ) : null}
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
                            minWidth: 0,
                            mt: 1,
                            pt: 1,
                            borderTop: `1px solid ${cardBorder}`,
                        }}
                    >
                        <Typography className="quick-settings-label">{t('quickSettings.fontSize')}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                            <Typography sx={{ fontSize: '0.62rem', color: muted, flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {formatFontScaleLabel(fontScale)}
                            </Typography>
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
                                width: 168,
                                flex: '0 0 168px',
                                m: 0,
                                py: 0.5,
                                px: 0,
                                boxSizing: 'border-box',
                                color: controlsDisabled ? disabledControlColor : accent,
                                '& .MuiSlider-rail': {
                                    opacity: 0.35,
                                },
                                '& .MuiSlider-mark': {
                                    backgroundColor: controlsDisabled ? disabledControlColor : accent,
                                    height: 6,
                                    width: 2,
                                },
                                '& .MuiSlider-thumb': {
                                    width: 12,
                                    height: 12,
                                },
                                '&.Mui-disabled': {
                                    color: disabledControlColor,
                                    opacity: 0.55,
                                },
                            }}
                            aria-label={t('quickSettings.fontSizeAria')}
                        />
                        </Box>
                    </Box>
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder, gap: 0, p: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1,
                            py: 0.85,
                        }}
                    >
                        <Typography className="quick-settings-label">{t('quickSettings.theme')}</Typography>
                        <FormControl size="small" disabled={controlsDisabled} sx={{ width: '6.5rem', minWidth: '6.5rem', maxWidth: '6.5rem', flexShrink: 0 }}>
                            <Select
                                dir={dir}
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
                                    width: '100%',
                                    minWidth: '6.5rem',
                                    fontFamily: 'iranyekan',
                                    fontSize: '0.68rem',
                                    backgroundColor: fieldBg,
                                    color: isDarkMode ? '#ffffff' : '#1e293b',
                                    borderRadius: '10px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: cardBorder,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(56, 122, 242, 0.4)',
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
                                inputProps={{ 'aria-label': t('quickSettings.themeAria') }}
                            >
                                {THEME_MODES.map((mode) => (
                                    <MenuItem
                                        key={mode.id}
                                        value={mode.id}
                                        dir={dir}
                                        sx={{
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.82rem',
                                            textAlign: contentAlign,
                                            direction: dir,
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
                            px: 1,
                            py: 0.85,
                            borderTop: `1px solid ${cardBorder}`,
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography className="quick-settings-label">{t('quickSettings.pinOpenSite')}</Typography>
                        </Box>
                        <PinOpenSiteModeSelect
                            value={pinOpenSiteMode}
                            onChange={(mode) => {
                                void handlePinOpenSiteModeSelect(mode);
                            }}
                            isDarkMode={isDarkMode}
                            disabled={controlsDisabled}
                            controlWidth="6.5rem"
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
                                <Typography className="quick-settings-label">{t('quickSettings.manualTitle')}</Typography>
                                <ExperimentalBadge isDarkMode={isDarkMode} disabled={controlsDisabled} />
                            </Box>
                            <Typography sx={{ fontSize: '0.62rem', color: muted, lineHeight: 1.45 }}>
                                {t('quickSettings.manualHint')}
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
                                inputProps={{ 'aria-label': t('quickSettings.manualAria') }}
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
                                    borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.5)' : 'rgba(56, 122, 242, 0.5)',
                                    color: accent,
                                    '&:hover': {
                                        borderColor: accent,
                                        backgroundColor: selectedBg,
                                        transform: 'none',
                                    },
                                }}
                            >
                                {t('quickSettings.activate')}
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
                            <Typography className="quick-settings-label">{t('quickSettings.hideSupport')}</Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: muted, mt: 0.2, lineHeight: 1.45 }}>
                                {t('quickSettings.hideSupportHint')}
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
                                {supportHide ? t('quickSettings.hidden') : t('quickSettings.visible')}
                            </Typography>
                            <Switch
                                size="small"
                                checked={supportHide}
                                disabled={controlsDisabled}
                                onChange={(event) => onSupportChange(event.target.checked)}
                                data-settings-switch="true"
                                sx={switchSx}
                                inputProps={{ 'aria-label': t('quickSettings.hideSupportAria') }}
                            />
                        </Box>
                    </Box>
                </Box>
                </Box>
                </Box>
            </Box>
            <Dialog
                open={algoInfoOpen}
                onClose={() => setAlgoInfoOpen(false)}
                maxWidth="xs"
                fullWidth
                sx={{
                    zIndex: 1500,
                    '& .MuiDialog-paper': {
                        padding: '8px',
                        direction: dir,
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: dir,
                        textAlign: contentAlign,
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                    }}
                >
                    {t('quickSettings.algoInfoTitle')}
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: contentAlign, padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                        }}
                    >
                        {t('quickSettings.algoInfoBody')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => {
                            setAlgoInfoOpen(false);
                            openOptions('algorithm');
                        }}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('quickSettings.testAlgorithmPage')}
                    </Button>
                    <Button
                        onClick={() => setAlgoInfoOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('shared.close')}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={titleInfoOpen}
                onClose={() => setTitleInfoOpen(false)}
                maxWidth="xs"
                fullWidth
                sx={{
                    zIndex: 1500,
                    '& .MuiDialog-paper': {
                        padding: '8px',
                        direction: dir,
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: dir,
                        textAlign: contentAlign,
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                    }}
                >
                    {t('quickSettings.titleModeLabel')}
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: contentAlign, padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                            mb: 1.5,
                            color: muted,
                        }}
                    >
                        {t('quickSettings.titleInfoIntro')}
                    </Typography>
                    {TITLE_MODES.map((mode) => (
                        <Box key={mode.id} sx={{ '& + &': { mt: 1.5 } }}>
                            <Typography
                                sx={{
                                    fontSize: '0.85rem',
                                    fontFamily: 'iranyekan',
                                    fontWeight: 700,
                                    lineHeight: 1.8,
                                }}
                            >
                                {mode.descriptionTitle}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.8rem',
                                    fontFamily: 'iranyekan',
                                    lineHeight: 1.8,
                                    color: muted,
                                }}
                            >
                                {mode.hint}
                            </Typography>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px' }}>
                    <Button
                        onClick={() => setTitleInfoOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('shared.close')}
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
                        direction: dir,
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: dir,
                        textAlign: contentAlign,
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                    }}
                >
                    اصلاح متن‌های ترکیبی
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: contentAlign, padding: '8px 16px' }}>
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
                        {t('shared.close')}
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
                        direction: dir,
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: dir,
                        textAlign: contentAlign,
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                    }}
                >
                    {t('quickSettings.applyToCodeTitle')}
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: contentAlign, padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                        }}
                    >
                        {t('quickSettings.applyToCodeBody')}
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
                        {t('quickSettings.applyToCodeNote')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setCodeInfoOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('shared.close')}
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
                <DialogTitle style={{ direction: dir, textAlign: contentAlign, fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                    {t('quickSettings.tabPermissionTitle')}
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: dir === 'rtl' ? 'justify' : 'left', padding: '8px 16px' }}>
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: dir === 'rtl' ? 'justify' : 'left', lineHeight: 1.8 }}
                    >
                        {t('quickSettings.tabPermissionBody')}
                    </Typography>
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: dir === 'rtl' ? 'justify' : 'left', lineHeight: 1.8 }}
                    >
                        {t('quickSettings.tabPermissionPrivacy')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setPinSitePermissionOpen(false)}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan' }}
                    >
                        {t('shared.close')}
                    </Button>
                    <Button
                        onClick={() => {
                            void handleRequestPinSitePermission();
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan' }}
                    >
                        {t('shared.grantPermission')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuickSettings;
