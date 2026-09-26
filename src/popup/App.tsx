import React from 'react';
import { 
    ThemeProvider, 
    createTheme,
    Paper,
    Box,
    Typography,
    Chip,
    Tabs,
    Tab,
    AppBar,
    IconButton,
    Tooltip,
    SvgIcon
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { mdiWeatherSunny, mdiWeatherNight, mdiBullhorn, mdiStar, mdiHeart, mdiCogOutline, mdiStarOutline, mdiHelpCircleOutline, mdiHeadset, mdiShieldOutline } from '@mdi/js';
import CssBaseline from '@mui/material/CssBaseline';
import ServiceList, { services } from './list';
import QuickSettings from './QuickSettings';
import ManualRtlBanner from './ManualRtlBanner';
import InstallHintBanner from './InstallHintBanner';
import FirefoxHostAccessBanner from './FirefoxHostAccessBanner';
import ChangesList from './ChangesList';
import { ManualRtlSettings } from '../types/manualRtl';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { DEFAULT_FONT_ID, DEFAULT_FONT_SCALE, FONT_SCALE_STORAGE_KEY, SELECTED_FONT_STORAGE_KEY, normalizeFontScale, previewFontScaleOnTabs } from '../utils/fonts';
import {
    getDefaultPinOpenSiteMode,
    normalizePinOpenSiteMode,
    applyPendingFullPinOpenSite,
    PIN_OPEN_SITE_STORAGE_KEY,
    PinOpenSiteMode,
} from '../utils/pinOpenSite';
import {
    getExtensionStoreUrl,
    getRateLinkText,
    getStorePageLinkText,
} from '../utils/storeLinks';
import './App.css';
import manifest from '../../public/manifest.chrome.json';

const firefoxDefaults = isFirefoxRuntime();
const extensionStoreUrl = getExtensionStoreUrl();
const storePageLinkText = getStorePageLinkText();
const rateLinkText = getRateLinkText();
const TELEGRAM_ICON_PATH = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z';

// Create rtl cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const darkTheme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'dark',
        primary: {
            main: '#00e9ff',
            light: '#4dd4ff',
            dark: '#0099cc',
        },
        secondary: {
            main: '#ff6b35',
            light: '#ff8a65',
            dark: '#e64a19',
        },
        background: {
            default: '#1a1a2e',
            paper: '#2f2f41',
        },
    },
    typography: {
        fontFamily: ['"iranyekan"', 'Tahoma', 'Arial'].join(','),
        fontSize: 12,
        h1: { fontFamily: '"iranyekan"', fontWeight: 700 },
        h2: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h3: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h4: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h5: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h6: { fontFamily: '"iranyekan"', fontWeight: 500 },
        body1: { fontFamily: '"iranyekan"', fontWeight: 400 },
        body2: { fontFamily: '"iranyekan"', fontWeight: 400 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {},
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                    fontWeight: 500,
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    direction: 'rtl',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        }

    },
});

const lightTheme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'light',
        primary: {
            main: '#1c39bb',
            light: '#3b82f6',
            dark: '#1e3a8a',
        },
        secondary: {
            main: '#059669',
            light: '#10b981',
            dark: '#047857',
        },
        background: {
            default: '#ffffff',
            paper: '#e0f2fe',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        divider: '#e2e8f0',
    },
    typography: {
        fontFamily: ['"iranyekan"', 'Tahoma', 'Arial'].join(','),
        fontSize: 12,
        h1: { fontFamily: '"iranyekan"', fontWeight: 700 },
        h2: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h3: { fontFamily: '"iranyekan"', fontWeight: 600 },
        h4: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h5: { fontFamily: '"iranyekan"', fontWeight: 500 },
        h6: { fontFamily: '"iranyekan"', fontWeight: 500 },
        body1: { fontFamily: '"iranyekan"', fontWeight: 400 },
        body2: { fontFamily: '"iranyekan"', fontWeight: 400 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {},
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                    fontWeight: 500,
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    direction: 'rtl',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: '"iranyekan"',
                },
            },
        }
    },
});

function App() {
    const [tabValue, setTabValue] = React.useState(0);
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('advanced_full');
    const [selectedFont, setSelectedFont] = React.useState(DEFAULT_FONT_ID);
    const [fontScale, setFontScale] = React.useState(DEFAULT_FONT_SCALE);
    const [mixedTitleDisplayMode, setMixedTitleDisplayMode] = React.useState('unified');
    const [applyAlgorithmToCode, setApplyAlgorithmToCode] = React.useState(true);
    const [flipRtlArrows, setFlipRtlArrows] = React.useState(true);
    const [fixMixedText, setFixMixedText] = React.useState(false);
    const [supportHide, setSupportHide] = React.useState(false);
    const [pinOpenSiteMode, setPinOpenSiteMode] = React.useState<PinOpenSiteMode>(getDefaultPinOpenSiteMode());
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [manualRtlSettings, setManualRtlSettings] = React.useState<ManualRtlSettings>({
        manualRtlEnabled: firefoxDefaults ? false : true,
        manualRtlSiteMode: firefoxDefaults ? 'ai_sites' : 'allowed_sites',
        menuDisplayMode: 'logo_first',
        highlightMode: 'on_direction_change',
        highlightColor: '#ff0000',
        highlightOpacity: 0.3,
        logoDisplay: 'always',
        applyFont: true
    });
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [manualRtlInfoDismissed, setManualRtlInfoDismissed] = React.useState<boolean>(false);
    const [activationHintDismissed, setActivationHintDismissed] = React.useState<boolean>(true);
    const [troubleshootingHintDismissed, setTroubleshootingHintDismissed] = React.useState<boolean>(true);
    const [algorithmHintDismissed, setAlgorithmHintDismissed] = React.useState<boolean>(true);
    const [notebookNeedsReenable, setNotebookNeedsReenable] = React.useState<boolean>(false);
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [settingsHintActive, setSettingsHintActive] = React.useState(false);
    const settingsHintTimer = React.useRef<number | null>(null);
    const [sideMenuHovered, setSideMenuHovered] = React.useState(false);
    const [hoverExpandLocked, setHoverExpandLocked] = React.useState(false);
    const skipSettingsAnimation = React.useRef(true);
    const mainScrollRef = React.useRef<HTMLDivElement>(null);
    const POPUP_MAIN_WIDTH = 378;
    const SIDE_COLLAPSED_WIDTH = 44;
    const SIDE_SETTINGS_WIDTH = 378;

    // Load settings from storage on component mount
    const loadSettings = React.useCallback(() => {
        try {
            chrome.storage.sync.get(['rtlAlgorithmMode', 'mixedTitleDisplayMode', 'applyAlgorithmToCode', 'flipRtlArrows', 'fixMixedText', 'supportHide', PIN_OPEN_SITE_STORAGE_KEY, 'isDarkMode', 'manualRtlSettings', 'manualRtlInfoDismissed', 'activationHintDismissed', 'troubleshootingHintDismissed', 'algorithmHintDismissed', 'notebookNeedsReenable', 'popupSettingsOpen', SELECTED_FONT_STORAGE_KEY, FONT_SCALE_STORAGE_KEY, ...services.map(s => s.key)], (result) => {
                if (result.rtlAlgorithmMode) {
                    setRtlAlgorithm(result.rtlAlgorithmMode);
                }
                if (result[SELECTED_FONT_STORAGE_KEY]) {
                    setSelectedFont(result[SELECTED_FONT_STORAGE_KEY]);
                }
                if (result[FONT_SCALE_STORAGE_KEY] !== undefined) {
                    setFontScale(normalizeFontScale(result[FONT_SCALE_STORAGE_KEY]));
                }
                if (result.mixedTitleDisplayMode) {
                    setMixedTitleDisplayMode(result.mixedTitleDisplayMode);
                }
                if (result.applyAlgorithmToCode !== undefined) {
                    setApplyAlgorithmToCode(result.applyAlgorithmToCode === true);
                }
                if (result.flipRtlArrows !== undefined) {
                    setFlipRtlArrows(result.flipRtlArrows === true);
                }
                if (result.fixMixedText !== undefined) {
                    setFixMixedText(result.fixMixedText === true);
                }
                if (result.supportHide !== undefined) {
                    setSupportHide(result.supportHide);
                }
                if (result[PIN_OPEN_SITE_STORAGE_KEY] !== undefined) {
                    setPinOpenSiteMode(normalizePinOpenSiteMode(result[PIN_OPEN_SITE_STORAGE_KEY]));
                }
                void applyPendingFullPinOpenSite().then((applied) => {
                    if (applied) {
                        setPinOpenSiteMode('full');
                    }
                });
                if (result.isDarkMode !== undefined) {
                    setIsDarkMode(result.isDarkMode);
                }
                if (result.popupSettingsOpen === true) {
                    setSettingsOpen(true);
                }
                // Use manualRtlSettings
                const settings = result.manualRtlSettings;
                if (settings) {
                    setManualRtlSettings({
                        ...manualRtlSettings,
                        ...settings,
                        ...(firefoxDefaults ? { manualRtlSiteMode: 'ai_sites' as const } : {})
                    });
                }
                // Load manualRtlInfoDismissed
                if (result.manualRtlInfoDismissed === true) {
                    setManualRtlInfoDismissed(true);
                }
                if (result.activationHintDismissed === false) {
                    setActivationHintDismissed(false);
                } else {
                    setActivationHintDismissed(true);
                }
                setNotebookNeedsReenable(result.notebookNeedsReenable === true);
                setTroubleshootingHintDismissed(result.troubleshootingHintDismissed === true);
                const currentAlgorithm = result.rtlAlgorithmMode || 'advanced_full';
                if (currentAlgorithm !== 'advanced_full') {
                    setAlgorithmHintDismissed(true);
                    try {
                        chrome.storage.sync.set({ algorithmHintDismissed: true });
                    } catch (error) {
                        // Silently handle save errors
                    }
                } else {
                    setAlgorithmHintDismissed(result.algorithmHintDismissed === true);
                }
                setIsLoading(false);
            });
        } catch (error) {
            // Extension context invalidated or other error - use default values
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadSettings();

        // Listen for storage changes to sync with options page
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === 'sync') {
                if (changes.rtlAlgorithmMode) {
                    setRtlAlgorithm(changes.rtlAlgorithmMode.newValue);
                    if (changes.rtlAlgorithmMode.newValue && changes.rtlAlgorithmMode.newValue !== 'advanced_full') {
                        setAlgorithmHintDismissed(true);
                        try {
                            chrome.storage.sync.set({ algorithmHintDismissed: true });
                        } catch (error) {
                            // Silently handle save errors
                        }
                    }
                }
                if (changes[SELECTED_FONT_STORAGE_KEY]) {
                    setSelectedFont(changes[SELECTED_FONT_STORAGE_KEY].newValue || DEFAULT_FONT_ID);
                }
                if (changes[FONT_SCALE_STORAGE_KEY]) {
                    setFontScale(normalizeFontScale(changes[FONT_SCALE_STORAGE_KEY].newValue));
                }
                if (changes.supportHide) {
                    setSupportHide(changes.supportHide.newValue);
                }
                if (changes[PIN_OPEN_SITE_STORAGE_KEY]) {
                    setPinOpenSiteMode(normalizePinOpenSiteMode(changes[PIN_OPEN_SITE_STORAGE_KEY].newValue));
                }
                if (changes.isDarkMode) {
                    setIsDarkMode(changes.isDarkMode.newValue);
                }
                if (changes.manualRtlSettings) {
                    const newSettings = changes.manualRtlSettings?.newValue;
                    if (newSettings) {
                        setManualRtlSettings({
                            ...manualRtlSettings,
                            ...newSettings
                        });
                    }
                }
                if (changes.popupSettingsOpen) {
                    setSettingsOpen(changes.popupSettingsOpen.newValue === true);
                }
                if (changes.activationHintDismissed) {
                    setActivationHintDismissed(changes.activationHintDismissed.newValue !== false);
                }
                if (changes.notebookNeedsReenable) {
                    setNotebookNeedsReenable(changes.notebookNeedsReenable.newValue === true);
                }
                if (changes.troubleshootingHintDismissed) {
                    setTroubleshootingHintDismissed(changes.troubleshootingHintDismissed.newValue === true);
                }
                if (changes.algorithmHintDismissed) {
                    setAlgorithmHintDismissed(changes.algorithmHintDismissed.newValue === true);
                }
                if (changes.mixedTitleDisplayMode) {
                    setMixedTitleDisplayMode(changes.mixedTitleDisplayMode.newValue || 'unified');
                }
                if (changes.applyAlgorithmToCode) {
                    setApplyAlgorithmToCode(changes.applyAlgorithmToCode.newValue === true);
                }
                if (changes.flipRtlArrows) {
                    setFlipRtlArrows(changes.flipRtlArrows.newValue === true);
                }
                if (changes.fixMixedText) {
                    setFixMixedText(changes.fixMixedText.newValue === true);
                }
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [loadSettings]);

    // Save RTL algorithm setting to storage when changed
    const handleRtlAlgorithmChange = (value: string) => {
        setRtlAlgorithm(value);
        try {
            const storageUpdate: { rtlAlgorithmMode: string; algorithmHintDismissed?: boolean } = { rtlAlgorithmMode: value };
            if (value !== 'advanced_full') {
                setAlgorithmHintDismissed(true);
                storageUpdate.algorithmHintDismissed = true;
            }
            chrome.storage.sync.set(storageUpdate);
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleMixedTitleDisplayModeChange = (value: string) => {
        setMixedTitleDisplayMode(value);
        try {
            chrome.storage.sync.set({ mixedTitleDisplayMode: value });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleApplyAlgorithmToCodeChange = (enabled: boolean) => {
        setApplyAlgorithmToCode(enabled);
        try {
            chrome.storage.sync.set({ applyAlgorithmToCode: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleFlipRtlArrowsChange = (enabled: boolean) => {
        setFlipRtlArrows(enabled);
        try {
            chrome.storage.sync.set({ flipRtlArrows: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleFixMixedTextChange = (enabled: boolean) => {
        setFixMixedText(enabled);
        try {
            chrome.storage.sync.set({ fixMixedText: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleSelectedFontChange = (value: string) => {
        setSelectedFont(value);
        try {
            chrome.storage.sync.set({ [SELECTED_FONT_STORAGE_KEY]: value });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleFontScaleChange = (value: number) => {
        const nextScale = normalizeFontScale(value);
        setFontScale(nextScale);
        previewFontScaleOnTabs(nextScale);
    };

    const handleFontScaleCommit = (value: number) => {
        const nextScale = normalizeFontScale(value);
        setFontScale(nextScale);
        try {
            chrome.storage.sync.set({ [FONT_SCALE_STORAGE_KEY]: nextScale }, () => {
                void chrome.runtime.lastError;
            });
        } catch (error) {
            // Silently handle save errors
        }
    };

    // Save support setting to storage when changed
    const handleSupportChange = (enabled: boolean) => {
        setSupportHide(enabled);
        try {
            chrome.storage.sync.set({ supportHide: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handlePinOpenSiteModeChange = (mode: PinOpenSiteMode) => {
        setPinOpenSiteMode(mode);
        try {
            chrome.storage.sync.set({ [PIN_OPEN_SITE_STORAGE_KEY]: mode });
        } catch (error) {
            // Silently handle save errors
        }
    };

    // Save manual RTL settings to storage when changed
    const handleManualRtlSettingsChange = async (settings: ManualRtlSettings) => {
        setManualRtlSettings(settings);
        try {
            chrome.storage.sync.set({ manualRtlSettings: settings });
            // Manual RTL will be activated automatically via storage change listener in content scripts
        } catch (error) {
            // Silently handle save errors
        }
    };

    // Toggle theme and save to storage
    const handleDarkModeChange = (enabled: boolean) => {
        setIsDarkMode(enabled);
        try {
            chrome.storage.sync.set({ isDarkMode: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleThemeToggle = () => {
        handleDarkModeChange(!isDarkMode);
    };

    const handleHighlightSettingsButton = React.useCallback(() => {
        setSettingsHintActive(true);
        if (settingsHintTimer.current) {
            window.clearTimeout(settingsHintTimer.current);
        }
        settingsHintTimer.current = window.setTimeout(() => {
            setSettingsHintActive(false);
            settingsHintTimer.current = null;
        }, 2800);
    }, []);

    React.useEffect(() => {
        return () => {
            if (settingsHintTimer.current) {
                window.clearTimeout(settingsHintTimer.current);
            }
        };
    }, []);

    const handleSettingsOpenChange = React.useCallback((open: boolean) => {
        setSideMenuHovered(false);
        setSettingsOpen(open);
        try {
            chrome.storage.sync.set({ popupSettingsOpen: open });
        } catch (error) {
            // Silently handle save errors
        }
    }, []);

    const unlockHoverExpand = React.useCallback(() => {
        setHoverExpandLocked(false);
        if (document.querySelector('.popup-side-menu')?.matches(':hover')) {
            setSideMenuHovered(true);
        }
    }, []);

    const isTabScrolling = React.useRef(false);

    const getSectionOffset = (element: HTMLElement, container: HTMLElement) => {
        return element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    };

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        const container = mainScrollRef.current;
        if (!container) {
            return;
        }

        let scrollTimeout: number;

        const handleScroll = () => {
            if (isTabScrolling.current) {
                return;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = window.setTimeout(() => {
                if (isTabScrolling.current) {
                    return;
                }

                const scrollTop = container.scrollTop;
                const notesSection = document.getElementById('notes-section');
                const reportSection = document.getElementById('report-section');

                if (notesSection && reportSection) {
                    const notesTop = getSectionOffset(notesSection, container);
                    const reportTop = getSectionOffset(reportSection, container);

                    if (scrollTop < reportTop - 60) {
                        if (tabValue !== 0) setTabValue(0);
                    } else if (scrollTop < notesTop - 60) {
                        if (tabValue !== 1) setTabValue(1);
                    } else if (tabValue !== 2) {
                        setTabValue(2);
                    }
                }
            }, 100);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [tabValue, isLoading]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        isTabScrolling.current = true;

        const sectionIds = ['sites-section', 'report-section', 'notes-section'];
        const sectionId = sectionIds[newValue];
        const element = document.getElementById(sectionId);
        const container = mainScrollRef.current;

        if (element && container) {
            const offsetPosition = Math.max(0, getSectionOffset(element, container) - 56 + 4);
            container.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        window.setTimeout(() => {
            isTabScrolling.current = false;
        }, 450);
    };

    const currentTheme = isDarkMode ? darkTheme : lightTheme;

    // Update body data-theme attribute for CSS
    React.useEffect(() => {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        document.documentElement.classList.toggle(
            'popup-side-expanded',
            !hoverExpandLocked && sideMenuHovered
        );
    }, [hoverExpandLocked, sideMenuHovered, isLoading]);

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        const root = document.documentElement;
        const body = document.body;
        root.classList.toggle('popup-settings-open', settingsOpen);

        const settingsTo = settingsOpen ? SIDE_SETTINGS_WIDTH : 0;
        const popupTo = POPUP_MAIN_WIDTH + SIDE_COLLAPSED_WIDTH + settingsTo;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const applyWidth = (popupWidth: number, sideWidth: number) => {
            const popupPx = `${popupWidth}px`;
            const sidePx = `${sideWidth}px`;
            root.style.width = popupPx;
            body.style.width = popupPx;
            root.style.setProperty('--settings-width', sidePx);
        };

        if (skipSettingsAnimation.current || reducedMotion) {
            skipSettingsAnimation.current = false;
            applyWidth(popupTo, settingsTo);
            setHoverExpandLocked(false);
            return;
        }

        const popupFrom = parseFloat(getComputedStyle(root).width) || (POPUP_MAIN_WIDTH + SIDE_COLLAPSED_WIDTH);
        const sideParsed = parseFloat(getComputedStyle(root).getPropertyValue('--settings-width'));
        const sideFrom = Number.isFinite(sideParsed) ? sideParsed : 0;

        if (Math.abs(popupFrom - popupTo) < 0.5 && Math.abs(sideFrom - settingsTo) < 0.5) {
            applyWidth(popupTo, settingsTo);
            setHoverExpandLocked(false);
            return;
        }

        setSideMenuHovered(false);
        setHoverExpandLocked(true);

        const involvesSettings = settingsOpen || popupFrom >= 700 || popupTo >= 700;
        const duration = involvesSettings ? 380 : 200;
        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - (1 - progress) ** 3;
            applyWidth(
                popupFrom + (popupTo - popupFrom) * eased,
                sideFrom + (settingsTo - sideFrom) * eased
            );
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            } else {
                unlockHoverExpand();
            }
        };

        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [settingsOpen, isLoading, unlockHoverExpand]);

    // Handle manualRtlInfoDismissed change
    const handleManualRtlInfoDismissedChange = React.useCallback((dismissed: boolean) => {
        setManualRtlInfoDismissed(dismissed);
        try {
            chrome.storage.sync.set({ manualRtlInfoDismissed: dismissed });
        } catch (error) {
            // Silently handle save errors
        }
    }, []);

    const handleActivationHintDismiss = React.useCallback(() => {
        setActivationHintDismissed(true);
        setTroubleshootingHintDismissed(true);
        try {
            chrome.storage.sync.set({
                activationHintDismissed: true,
                troubleshootingHintDismissed: true
            });
        } catch (error) {
            // Silently handle save errors
        }
    }, []);

    const handleTroubleshootingHintDismiss = React.useCallback(() => {
        setTroubleshootingHintDismissed(true);
        try {
            chrome.storage.sync.set({ troubleshootingHintDismissed: true });
        } catch (error) {
            // Silently handle save errors
        }
    }, []);

    const handleAlgorithmHintDismiss = React.useCallback(() => {
        setAlgorithmHintDismissed(true);
        try {
            chrome.storage.sync.set({ algorithmHintDismissed: true });
        } catch (error) {
            // Silently handle save errors
        }
    }, []);

    // Show loading screen while data is being loaded
    if (isLoading) {
        return (
            <CacheProvider value={cacheRtl}>
                <ThemeProvider theme={currentTheme}>
                    <CssBaseline />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            width: '100%'
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: 'iranyekan',
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                            }}
                        >
                            در حال بارگذاری...
                        </Typography>
                    </Box>
                </ThemeProvider>
            </CacheProvider>
        );
    }

    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={currentTheme}>
                <CssBaseline />
                <div className="App" dir="rtl" >
                <Paper 
                    className="popup-header"
                    elevation={0} 
                    sx={{ 
                        px: 1.75,
                        py: 1.1,
                        borderRadius: 0,
                        background: isDarkMode 
                            ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.05) 0%, rgba(0, 233, 255, 0.02) 100%)'
                            : '#0067A5',
                        borderBottom: isDarkMode 
                            ? '1px solid rgba(0, 234, 255, 0.47)'
                            : '1px solid rgb(0, 234, 255)',
                    }} 
                    dir="ltr"
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                ml: 0.5,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                position: 'relative',
                                flexShrink: 0,
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                transition: 'box-shadow 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0, 233, 255, 0.2)',
                                },
                                '& img': {
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    transition: 'opacity 0.2s ease',
                                },
                                '& .popup-logo-v2': {
                                    opacity: 0,
                                },
                                '&:hover .popup-logo-v1': {
                                    opacity: 0,
                                },
                                '&:hover .popup-logo-v2': {
                                    opacity: 1,
                                },
                            }}
                        >
                            <img
                                className="popup-logo-v2"
                                src="/images/logo/ai-rtl-logo-2.png"
                                alt=""
                            />
                            <img
                                className="popup-logo-v1"
                                src="/images/logo/ai-rtl-logo.png"
                                alt="RTL Extension Logo"
                            />
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                                variant="h6" 
                                component="h1" 
                                sx={{ 
                                    fontWeight: 600, 
                                    fontSize: '0.9rem',
                                    lineHeight: 1.2,
                                    color: '#ffffff',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                AI RTL (Persian/Farsi)
                            </Typography>
                            <Chip 
                                label={`نسخه ${manifest.version}`} 
                                size="small" 
                                sx={{ 
                                    fontSize: '0.65rem',
                                    height: 20,
                                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                                    color: isDarkMode ? '#00e9ff' : '#ffffff',
                                    border: isDarkMode ? '1px solid rgba(0, 233, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
                                    fontWeight: 500
                                }} 
                            />
                        </Box>
                        
                        <Tooltip
                            title={isDarkMode ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
                            placement="bottom-end"
                            disableInteractive
                            PopperProps={{
                                modifiers: [
                                    {
                                        name: 'preventOverflow',
                                        options: {
                                            altAxis: true,
                                            padding: 8,
                                        },
                                    },
                                ],
                            }}
                        >
                            <IconButton 
                                onClick={handleThemeToggle}
                                sx={{ 
                                    color: isDarkMode ? '#FFD700' : '#FF8F00',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 143, 0, 0.1)',
                                    },
                                    transition: 'background-color 0.3s ease'
                                }}
                            >
                                <SvgIcon sx={{ 
                                    fontSize: '1.2rem',
                                    color: isDarkMode ? '#FFD700' : '#FF8F00'
                                }}>
                                    <path d={isDarkMode ? mdiWeatherSunny : mdiWeatherNight} />
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>

                <div className="popup-columns">
                <div className="popup-main" ref={mainScrollRef}>
                <div className="popup-main-inner">
                <FirefoxHostAccessBanner isDarkMode={isDarkMode} />
                <Box sx={{ textAlign: 'center', py: 3, px: 2, background: isDarkMode 
                            ? 'transparent'
                            : '#dae8f1' }}>
                    {!notebookNeedsReenable && (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontSize: '0.8rem',
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 1)',
                            lineHeight: 1.4,
                            fontWeight: 400,
                            mb: 0.75
                        }}
                    >
                        این افزونه ساخته شده تا استفاده از هوش مصنوعی برای فارسی زبانان شیرین تر و لذت بخش تر باشد.
                    </Typography>
                    )}
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontSize: '0.8rem',
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 1)',
                            lineHeight: 1.4,
                            fontWeight: 400
                        }}
                    >
                        امیدوارم از استفاده از این اکستشن لذت ببرید ❤️ و اگر دوست داشتید{' '}
                        <a
                            href="https://ai-rtl.ir/supporters/?source=extension-popup-intro-supporters"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: isDarkMode ? '#00e9ff' : '#1e40af',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            حمایت
                        </a>
                        {' '}کنید
                    </Typography>
                </Box>

                {notebookNeedsReenable && (
                    <Box sx={{
                        background: isDarkMode ? 'transparent' : '#dae8f1',
                        pb: 1.5
                    }}>
                        <InstallHintBanner
                            variant="notebook"
                            isDarkMode={isDarkMode}
                        />
                    </Box>
                )}

                {!notebookNeedsReenable && !activationHintDismissed && (
                    <Box sx={{
                        background: isDarkMode ? 'transparent' : '#dae8f1',
                        pb: 1.5
                    }}>
                        <InstallHintBanner
                            variant="install"
                            isDarkMode={isDarkMode}
                            onDismiss={handleActivationHintDismiss}
                        />
                    </Box>
                )}

                {!notebookNeedsReenable && activationHintDismissed && !troubleshootingHintDismissed && (
                    <Box sx={{
                        background: isDarkMode ? 'transparent' : '#dae8f1',
                        pb: 1.5
                    }}>
                        <InstallHintBanner
                            variant="troubleshooting"
                            isDarkMode={isDarkMode}
                            onDismiss={handleTroubleshootingHintDismiss}
                        />
                    </Box>
                )}

                {!algorithmHintDismissed && rtlAlgorithm === 'advanced_full' && (
                    <Box sx={{
                        background: isDarkMode ? 'transparent' : '#dae8f1',
                        pb: 1.5
                    }}>
                        <InstallHintBanner
                            variant="algorithm"
                            isDarkMode={isDarkMode}
                            onDismiss={handleAlgorithmHintDismiss}
                            onOpenSettings={handleHighlightSettingsButton}
                        />
                    </Box>
                )}

                <Paper elevation={0} sx={{ 
                    backgroundColor: isDarkMode ? '#1a1a2e' : '#e0f2fe',
                    borderRadius: isDarkMode ? 0 : 1
                }}>
                    <AppBar 
                        position="sticky"
                        sx={{
                            top: 0,
                            backgroundColor: isDarkMode ? '#1a1a2e' : '#0067A5',
                            color: '#ffffff',
                            zIndex: 4,
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            textColor={isDarkMode ? 'primary' : 'inherit'}
                            variant="fullWidth"
                            style={{ 
                                direction: 'rtl',
                                boxShadow: 'none'
                            }}
                            sx={{
                                '& .MuiTab-root': {
                                    whiteSpace: 'nowrap',
                                    minWidth: 0,
                                    minHeight: 48,
                                    px: 0.5,
                                    fontSize: '0.78rem',
                                    ...(!isDarkMode ? {
                                        color: 'rgba(255, 255, 255, 0.75)',
                                        opacity: 1,
                                        '&.Mui-selected': {
                                            color: '#ffffff',
                                            opacity: 1,
                                        },
                                    } : {}),
                                },
                                ...(!isDarkMode ? {
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#ffffff',
                                    },
                                } : {}),
                            }}
                        >
                            <Tab label="سایت‌ها" />
                            <Tab label="گزارش مشکل" />
                            <Tab label="درباره افزونه" />
                        </Tabs>
                    </AppBar>
                    
                    <div id="sites-section" style={{ paddingTop: '20px', background: isDarkMode ? 'transparent' : '#e0f2fe' }}>
                        {manualRtlSettings.manualRtlEnabled && (
                            <ManualRtlBanner
                                isDarkMode={isDarkMode}
                                manualRtlSettings={manualRtlSettings}
                                onManualRtlSettingsChange={handleManualRtlSettingsChange}
                                manualRtlInfoDismissed={manualRtlInfoDismissed}
                                onManualRtlInfoDismissedChange={handleManualRtlInfoDismissedChange}
                            />
                        )}
                        
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 1.2, 
                                mt: manualRtlSettings.manualRtlEnabled ? 4.5 : 1.2,
                                textAlign: 'center',
                                fontFamily: 'iranyekan',
                                fontWeight: 600,
                                color: isDarkMode ? '#ffffff' : '#1e293b'
                            }}
                        >
                              سایت هایی که
                               راست چین هوشمند پشتیبانی میشود
                            </Typography>
                            <div className="listSite">
                                <ServiceList pinOpenSiteMode={pinOpenSiteMode} />
                            </div>
                        </div>
                        
                        <div id="report-section">
                            <Box sx={{ 
                                textAlign: 'center', 
                                mt: 2, 
                                p: 2, 
                                background: isDarkMode 
                                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                                borderRadius: 0, 
                                mb: 3,
                                borderTop: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af',
                                borderBottom: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af'
                            }}>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600,
                                    color: isDarkMode ? '#ffffff' : '#1e293b'
                                }}>
                                    گزارش مشکل و پشتیبانی
                                </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ 
                                        mb: 2, 
                                        fontWeight: 600, 
                                        color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1
                                    }}>
                                        <SvgIcon sx={{ 
                                            fontSize: '1.5rem',
                                            color: isDarkMode ? '#FF9800' : '#F57C00'
                                        }}>
                                            <path d={mdiBullhorn} />
                                        </SvgIcon>
                                        نکته مهم درباره عملکرد افزونه
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify', 
                                        fontWeight: 500 
                                    }}>
                                        دنیای هوش مصنوعی به‌سرعت در حال پیشرفت است و وب‌سایت‌های مرتبط نیز به‌طور مداوم به‌روزرسانی می‌شوند؛ از تغییر در ساختار HTML و کدهای CSS و JavaScript گرفته تا بهبودهای امنیتی، عملکردی و اضافه‌شدن قابلیت‌های جدید. به همین دلیل ممکن است عملکرد افزونه در برخی موارد دچار اختلال موقت شود.
                                        <br /><br />
                                        <strong style={{ color: isDarkMode ? '#00e9ff' : '#2563eb' }}>راه‌حل چیست؟</strong>
                                        <br />
                                        اگر افزونه روی سایتی کار نمی‌کند، این کاملاً طبیعی است! 
                                        اگر با مشکلی مواجه شدید، لطفاً از طریق <a href="https://t.me/ai_rtl_support" target="_blank" rel="noopener noreferrer" style={{ color: isDarkMode ? '#00e9ff' : '#1e40af', textDecoration: 'underline' }}>تلگرام</a> گزارش دهید تا سریع‌تر حل شود.
                                        <br /><br />
                                        همچنین پیشنهادات و ایده‌های شما برای بهبود افزونه بسیار ارزشمند است و از ارسال آن‌ها استقبال می‌کنیم.
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                            <a href="https://t.me/ai_rtl_support" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Typography variant="body2" sx={{ 
                                                    color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                                    '&:hover': { textDecoration: 'underline' }, 
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    تلگرام
                                                </Typography>
                                            </a>
                                            <Typography variant="body2" sx={{ 
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)', 
                                                fontSize: '0.8rem' 
                                            }}>
                                                - برای تماس سریع
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 3 }}>
                                        <ChangesList />
                                    </Box>
                                </Box>
                            </Box>
                        </div>
                        
                        <div id="notes-section" style={{ paddingBottom: '20px' }}>
                            <Box sx={{ 
                                textAlign: 'center', 
                                mt: 2, 
                                p: 2, 
                                background: isDarkMode 
                                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                                borderRadius: 0, 
                                mb: 3,
                                borderTop: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af',
                                borderBottom: isDarkMode ? '1px solid #00e9ff' : '1px solid #1e40af'
                            }}>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600,
                                    color: isDarkMode ? '#ffffff' : '#1e293b'
                                }}>
                                    درباره افزونه
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify' 
                                    }}>
                                        این افزونه‌ی AI RTL (Persian/Farsi) بیش از ۲ سال است که در کنار شماست و امروز با افتخار میزبان بیش از ۲۰ هزار کاربر فعال است.
در ابتدا صرفاً برای ChatGPT اصلی طراحی شد، اما به لطف استقبال گسترده و درخواست‌های مکرر کاربران، به‌مرور برای سایر وب‌سایت‌های هوش مصنوعی نیز توسعه پیدا کرده است.
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify' 
                                    }}>
                                        هدف اصلی این پروژه از ابتدا ساده بوده: فراهم کردن تجربه‌ای روان و کاربردی برای فارسی‌زبانان در دنیای هوش مصنوعی.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <a href={extensionStoreUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ 
                                                color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                                '&:hover': { textDecoration: 'underline' }, 
                                                fontWeight: 600,
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.5
                                            }}>
                                                <SvgIcon sx={{ 
                                                    fontSize: '1rem',
                                                    color: isDarkMode ? '#FFD700' : '#FF8F00'
                                                }}>
                                                    <path d={mdiStar} />
                                                </SvgIcon>
                                                {storePageLinkText}
                                            </Typography>
                                        </a>
                                    </Box>
                                    <Typography variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', 
                                        lineHeight: 1.8, 
                                        textAlign: 'justify' 
                                    }}>
                                        این افزونه با عشق و انرژی شخصی ساخته شده و همچنان رایگان در اختیار شما قرار دارد. حمایت شما، چه با ثبت نظر و امتیاز و چه با معرفی افزونه به دوستان و دیگران، انگیزه‌ی ادامه‌ی مسیر و توسعه‌ی قابلیت‌های جدید را برای من فراهم می‌کند. اگر مایل بودید می‌توانید با یک دونیت کوچک نیز از پروژه حمایت کنید.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <a href="https://donate.sudoshz.ir/u/ai-rtl" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <Typography variant="body2" sx={{ 
                                                color: isDarkMode ? '#00e9ff' : '#1e40af', 
                                                '&:hover': { textDecoration: 'underline' }, 
                                                fontWeight: 600,
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.5
                                            }}>
                                                <SvgIcon sx={{ 
                                                    fontSize: '1rem',
                                                    color: isDarkMode ? '#E91E63' : '#C2185B'
                                                }}>
                                                    <path d={mdiHeart} />
                                                </SvgIcon>
                                                حمایت مالی (دونیت)
                                            </Typography>
                                        </a>
                                    </Box>
                                </Box>
                            </Box>
                        </div>
                </Paper>
                </div>
                </div>
                <div className="popup-settings-panel">
                    <QuickSettings
                        rtlAlgorithm={rtlAlgorithm}
                        onRtlAlgorithmChange={handleRtlAlgorithmChange}
                        selectedFont={selectedFont}
                        onSelectedFontChange={handleSelectedFontChange}
                        fontScale={fontScale}
                        onFontScaleChange={handleFontScaleChange}
                        onFontScaleCommit={handleFontScaleCommit}
                        mixedTitleDisplayMode={mixedTitleDisplayMode}
                        onMixedTitleDisplayModeChange={handleMixedTitleDisplayModeChange}
                        applyAlgorithmToCode={applyAlgorithmToCode}
                        onApplyAlgorithmToCodeChange={handleApplyAlgorithmToCodeChange}
                        flipRtlArrows={flipRtlArrows}
                        onFlipRtlArrowsChange={handleFlipRtlArrowsChange}
                        fixMixedText={fixMixedText}
                        onFixMixedTextChange={handleFixMixedTextChange}
                        supportHide={supportHide}
                        onSupportChange={handleSupportChange}
                        pinOpenSiteMode={pinOpenSiteMode}
                        onPinOpenSiteModeChange={handlePinOpenSiteModeChange}
                        isDarkMode={isDarkMode}
                        onDarkModeChange={handleDarkModeChange}
                        manualRtlSettings={manualRtlSettings}
                        onManualRtlSettingsChange={handleManualRtlSettingsChange}
                        onClose={() => handleSettingsOpenChange(false)}
                    />
                </div>
                <div className="popup-side-slot">
                <aside
                    className={`popup-side-menu${settingsHintActive ? ' popup-side-menu-hint' : ''}`}
                    dir="rtl"
                    aria-label="تنظیمات افزونه"
                    onMouseEnter={() => {
                        if (!hoverExpandLocked) {
                            setSideMenuHovered(true);
                        }
                    }}
                    onMouseLeave={() => setSideMenuHovered(false)}
                >
                    <div className="popup-settings-toggle-wrap">
                        <div className="popup-side-item-group">
                        <button
                            type="button"
                            className={`popup-side-item popup-side-item-settings${settingsHintActive ? ' popup-side-item-hint' : ''}`}
                            onClick={() => handleSettingsOpenChange(!settingsOpen)}
                            aria-label="تنظیمات"
                            aria-expanded={settingsOpen}
                        >
                            <span className="popup-side-item-icon">
                                <SvgIcon>
                                    <path d={mdiCogOutline} />
                                </SvgIcon>
                            </span>
                            <span className="popup-side-item-label">تنظیمات</span>
                        </button>
                        <a
                            href="https://ai-rtl.ir/report/?source=extension-popup-side-faq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-faq"
                            aria-label="مشکلات متداول"
                        >
                            <span className="popup-side-item-icon">
                                <SvgIcon>
                                    <path d={mdiHelpCircleOutline} />
                                </SvgIcon>
                            </span>
                            <span className="popup-side-item-label">مشکلات متداول</span>
                        </a>


                        <a
                            href="https://t.me/AI_RTL_ir"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-channel"
                            aria-label="کانال AI RTL"
                        >
                            <span className="popup-side-item-icon">
                                <SvgIcon viewBox="0 0 24 24">
                                    <path d={TELEGRAM_ICON_PATH} />
                                </SvgIcon>
                            </span>
                            <span className="popup-side-item-label">کانال تلگرام AI RTL</span>
                        </a>
                        <a
                            href="https://ai-rtl.ir/?source=extension-popup-side-site"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-site"
                            aria-label="سایت AI RTL"
                        >
                            <span className="popup-side-item-icon">
                                <img src="/images/logo/ai-rtl-logo.png" alt="" />
                            </span>
                            <span className="popup-side-item-label">سایت AI RTL</span>
                        </a>
                        <a
                            href="https://ai-rtl.ir/support/?source=extension-popup-side-support"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-support"
                            aria-label="پشتیبانی"
                        >
                            <span className="popup-side-item-icon">
                                <SvgIcon>
                                    <path d={mdiHeadset} />
                                </SvgIcon>
                            </span>
                            <span className="popup-side-item-label">پشتیبانی</span>
                        </a>
               
                        </div>
                        <div className="popup-side-item-group">
                        <a
                            href="https://ai-rtl.ir/privacy-policy/?source=extension-popup-side-privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-privacy"
                            aria-label="حریم خصوصی"
                        >
                            <span className="popup-side-item-icon">
                                <SvgIcon>
                                    <path d={mdiShieldOutline} />
                                </SvgIcon>
                            </span>
                            <span className="popup-side-item-label">حریم خصوصی</span>
                        </a>
                        <a
                            href={extensionStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-rate"
                            aria-label={rateLinkText}
                        >
                            <span className="popup-side-item-icon">
                                <SvgIcon>
                                    <path d={mdiStarOutline} />
                                </SvgIcon>
                            </span>
                            <span className="popup-side-item-label">{rateLinkText}</span>
                        </a>
                        <a
                            href="https://donate.sudoshz.ir/u/ai-rtl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-side-item popup-side-item-donate"
                            aria-label="حمایت مالی"
                        >
                            <span className="popup-side-item-icon">
                                <img src="/images/sponsor/yavar.png" alt="یاور" />
                            </span>
                            <span className="popup-side-item-label">دونیت</span>
                        </a>
                        </div>
                    </div>
                </aside>
                </div>
                </div>
            </div>
        </ThemeProvider>
        </CacheProvider>
    );
}

export default App;