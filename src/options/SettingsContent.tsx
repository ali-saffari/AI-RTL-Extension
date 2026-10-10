import React from 'react';
import {
    Box,
    Typography,
    useTheme,
    Tabs,
    Tab
} from '@mui/material';
import AlgorithmTab from './tabs/AlgorithmTab';
import ManualRTLTab from './tabs/ManualRTLTab';
import OtherSettingsTab from './tabs/OtherSettingsTab';
import { ManualRtlSettings } from '../types/manualRtl';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { DEFAULT_FONT_ID, DEFAULT_FONT_SCALE, FONT_SCALE_STORAGE_KEY, SELECTED_FONT_STORAGE_KEY, normalizeFontScale, previewFontScaleOnTabs } from '../utils/fonts';
import { applyPendingFullPinOpenSite, getDefaultPinOpenSiteMode, normalizePinOpenSiteMode, PIN_OPEN_SITE_STORAGE_KEY, PinOpenSiteMode } from '../utils/pinOpenSite';
import { useI18n } from '../i18n';

interface SettingsContentProps {
    isDarkMode: boolean;
}

const firefoxDefaults = isFirefoxRuntime();

const SettingsContent: React.FC<SettingsContentProps> = ({ isDarkMode }) => {
    const theme = useTheme();
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    
    // Map hash to tab index
    const hashToTabIndex: { [key: string]: number } = {
        'algorithm': 0,
        'manual-rtl': 1,
        'other-settings': 2
    };
    
    // Map tab index to hash
    const tabIndexToHash: { [key: number]: string } = {
        0: 'algorithm',
        1: 'manual-rtl',
        2: 'other-settings'
    };
    
    // Get initial tab from hash or default to 0
    const getInitialTab = (): number => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.slice(1); // Remove #
            return hashToTabIndex[hash] !== undefined ? hashToTabIndex[hash] : 0;
        }
        return 0;
    };
    
    const [tabValue, setTabValue] = React.useState(getInitialTab);
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('advanced_full');
    const [selectedFont, setSelectedFont] = React.useState(DEFAULT_FONT_ID);
    const [fontScale, setFontScale] = React.useState(DEFAULT_FONT_SCALE);
    const [supportHide, setSupportHide] = React.useState(false);
    const [pinOpenSiteMode, setPinOpenSiteMode] = React.useState<PinOpenSiteMode>(getDefaultPinOpenSiteMode());
    const [analytics, setAnalytics] = React.useState(true);
    const [previewEnabled, setPreviewEnabled] = React.useState(true);
    const [mixedTitleDisplayMode, setMixedTitleDisplayMode] = React.useState('unified');
    const [applyAlgorithmToCode, setApplyAlgorithmToCode] = React.useState(true);
    const [flipRtlArrows, setFlipRtlArrows] = React.useState(true);
    const [fixMixedText, setFixMixedText] = React.useState(false);
    
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

    // Load all settings from storage
    const loadSettings = React.useCallback(() => {
        try {
            chrome.storage.sync.get([
                'rtlAlgorithmMode', 
                'supportHide',
                PIN_OPEN_SITE_STORAGE_KEY, 
                'manualRtlSettings',
                'analytics',
                'previewEnabled',
                'mixedTitleDisplayMode',
                'applyAlgorithmToCode',
                'flipRtlArrows',
                'fixMixedText',
                SELECTED_FONT_STORAGE_KEY,
                FONT_SCALE_STORAGE_KEY
            ], (result) => {
                if (result.rtlAlgorithmMode) {
                    setRtlAlgorithm(result.rtlAlgorithmMode);
                }
                if (result[SELECTED_FONT_STORAGE_KEY]) {
                    setSelectedFont(result[SELECTED_FONT_STORAGE_KEY]);
                }
                if (result[FONT_SCALE_STORAGE_KEY] !== undefined) {
                    setFontScale(normalizeFontScale(result[FONT_SCALE_STORAGE_KEY]));
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
                // Use manualRtlSettings
                const settings = result.manualRtlSettings;
                if (settings) {
                    setManualRtlSettings({
                        manualRtlEnabled: firefoxDefaults ? false : true,
                        manualRtlSiteMode: firefoxDefaults ? 'ai_sites' : 'allowed_sites',
                        menuDisplayMode: 'logo_first',
                        highlightMode: 'on_direction_change',
                        highlightColor: '#ff0000',
                        highlightOpacity: 0.3,
                        logoDisplay: 'always',
                        applyFont: true,
                        ...settings,
                        ...(firefoxDefaults ? { manualRtlSiteMode: 'ai_sites' as const } : {})
                    });
                }
                if (result.analytics !== undefined) {
                    setAnalytics(result.analytics);
                }
                if (result.previewEnabled !== undefined) {
                    setPreviewEnabled(result.previewEnabled);
                } else {
                    setPreviewEnabled(true); // Default to enabled
                }
                if (result.mixedTitleDisplayMode) {
                    setMixedTitleDisplayMode(result.mixedTitleDisplayMode);
                } else {
                    setMixedTitleDisplayMode('unified'); // Default to unified
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
            });
        } catch (error) {
            console.log('Failed to load settings:', error);
        }
    }, []);

    React.useEffect(() => {
        loadSettings();

        // Listen for storage changes to sync with popup
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === 'sync') {
                if (changes.rtlAlgorithmMode) {
                    setRtlAlgorithm(changes.rtlAlgorithmMode.newValue);
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
                if (changes.manualRtlSettings) {
                    const newSettings = changes.manualRtlSettings?.newValue;
                    if (newSettings) {
                        setManualRtlSettings(newSettings);
                    }
                }
                if (changes.analytics) {
                    setAnalytics(changes.analytics.newValue);
                }
                if (changes.previewEnabled) {
                    setPreviewEnabled(changes.previewEnabled.newValue);
                }
                if (changes.mixedTitleDisplayMode) {
                    setMixedTitleDisplayMode(changes.mixedTitleDisplayMode.newValue);
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
    
    // Handle hash change in URL and set initial hash
    React.useEffect(() => {
        // Set initial hash if not present
        if (typeof window !== 'undefined') {
            if (!window.location.hash) {
                window.location.hash = tabIndexToHash[tabValue] || 'algorithm';
            }
        }
        
        const handleHashChange = () => {
            if (typeof window !== 'undefined') {
                const hash = window.location.hash.slice(1);
                if (hashToTabIndex[hash] !== undefined) {
                    setTabValue(hashToTabIndex[hash]);
                }
            }
        };
        
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [tabValue]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        // Update URL hash
        if (typeof window !== 'undefined' && tabIndexToHash[newValue]) {
            window.location.hash = tabIndexToHash[newValue];
        }
    };

    const handleRtlAlgorithmChange = (value: string) => {
        setRtlAlgorithm(value);
        try {
            chrome.storage.sync.set({ rtlAlgorithmMode: value });
        } catch (error) {
            console.log('Failed to save RTL algorithm setting:', error);
        }
    };

    const handleSelectedFontChange = (value: string) => {
        setSelectedFont(value);
        try {
            chrome.storage.sync.set({ [SELECTED_FONT_STORAGE_KEY]: value });
        } catch (error) {
            console.log('Failed to save font setting:', error);
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
            console.log('Failed to save font scale setting:', error);
        }
    };

    const handleSupportChange = (enabled: boolean) => {
        setSupportHide(enabled);
        try {
            chrome.storage.sync.set({ supportHide: enabled });
        } catch (error) {
            console.log('Failed to save support setting:', error);
        }
    };

    const handlePinOpenSiteModeChange = (mode: PinOpenSiteMode) => {
        setPinOpenSiteMode(mode);
        try {
            chrome.storage.sync.set({ [PIN_OPEN_SITE_STORAGE_KEY]: mode });
        } catch (error) {
            console.log('Failed to save pin open site setting:', error);
        }
    };

    const handleManualRtlSettingsChange = (settings: ManualRtlSettings) => {
        setManualRtlSettings(settings);
        try {
            chrome.storage.sync.set({ manualRtlSettings: settings });
        } catch (error) {
            console.log('Failed to save manual RTL settings:', error);
        }
    };

    const handleAnalyticsChange = (enabled: boolean) => {
        setAnalytics(enabled);
        try {
            chrome.storage.sync.set({ analytics: enabled });
        } catch (error) {
            console.log('Failed to save analytics setting:', error);
        }
    };

    const handlePreviewChange = (enabled: boolean) => {
        setPreviewEnabled(enabled);
        try {
            chrome.storage.sync.set({ previewEnabled: enabled });
        } catch (error) {
            console.log('Failed to save preview setting:', error);
        }
    };

    const handleMixedTitleDisplayModeChange = (value: string) => {
        setMixedTitleDisplayMode(value);
        try {
            chrome.storage.sync.set({ mixedTitleDisplayMode: value });
        } catch (error) {
            console.log('Failed to save mixed title display mode setting:', error);
        }
    };

    const handleApplyAlgorithmToCodeChange = (enabled: boolean) => {
        setApplyAlgorithmToCode(enabled);
        try {
            chrome.storage.sync.set({ applyAlgorithmToCode: enabled });
        } catch (error) {
            console.log('Failed to save code algorithm setting:', error);
        }
    };

    const handleFlipRtlArrowsChange = (enabled: boolean) => {
        setFlipRtlArrows(enabled);
        try {
            chrome.storage.sync.set({ flipRtlArrows: enabled });
        } catch (error) {
            console.log('Failed to save flip RTL arrows setting:', error);
        }
    };

    const handleFixMixedTextChange = (enabled: boolean) => {
        setFixMixedText(enabled);
        try {
            chrome.storage.sync.set({ fixMixedText: enabled });
        } catch (error) {
            console.log('Failed to save mixed text setting:', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Tabs */}
            <Box sx={{ 
                // direction: dir,
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3
            }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTabs-flexContainer': {
                            flexDirection: 'row',
                            justifyContent: 'flex-start'
                        },
                        '& .MuiTab-root': {
                            minHeight: 56,
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            textAlign: 'left',
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                                fontWeight: 600
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: theme.palette.primary.main,
                            height: 3,
                            left: 0,
                            right: 'auto'
                        }
                    }}
                >
                    <Tab label={t('options.tabAlgorithm')} />
                    <Tab label={t('options.tabManualRtl')} />
                    <Tab label={t('options.tabGeneral')} />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ 
                minHeight: '500px'
            }}>
                {tabValue === 0 && (
                    <AlgorithmTab
                        rtlAlgorithm={rtlAlgorithm}
                        onRtlAlgorithmChange={handleRtlAlgorithmChange}
                        isDarkMode={isDarkMode}
                        previewEnabled={previewEnabled}
                        onPreviewChange={handlePreviewChange}
                        mixedTitleDisplayMode={mixedTitleDisplayMode}
                        onMixedTitleDisplayModeChange={handleMixedTitleDisplayModeChange}
                        applyAlgorithmToCode={applyAlgorithmToCode}
                        onApplyAlgorithmToCodeChange={handleApplyAlgorithmToCodeChange}
                        flipRtlArrows={flipRtlArrows}
                        onFlipRtlArrowsChange={handleFlipRtlArrowsChange}
                        fixMixedText={fixMixedText}
                        onFixMixedTextChange={handleFixMixedTextChange}
                        selectedFont={selectedFont}
                        onSelectedFontChange={handleSelectedFontChange}
                        fontScale={fontScale}
                        onFontScaleChange={handleFontScaleChange}
                        onFontScaleCommit={handleFontScaleCommit}
                    />
                )}
                {tabValue === 1 && (
                    <ManualRTLTab
                        manualRtlSettings={manualRtlSettings}
                        onManualRtlSettingsChange={handleManualRtlSettingsChange}
                        isDarkMode={isDarkMode}
                    />
                )}
                {tabValue === 2 && (
                    <OtherSettingsTab
                        supportHide={supportHide}
                        onSupportChange={handleSupportChange}
                        pinOpenSiteMode={pinOpenSiteMode}
                        onPinOpenSiteModeChange={handlePinOpenSiteModeChange}
                        isDarkMode={isDarkMode}
                        analytics={analytics}
                        onAnalyticsChange={handleAnalyticsChange}
                    />
                )}
            </Box>
        </Box>
    );
};

export default SettingsContent;
