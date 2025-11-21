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

interface SettingsContentProps {
    isDarkMode: boolean;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ isDarkMode }) => {
    const theme = useTheme();
    
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
    const [supportHide, setSupportHide] = React.useState(false);
    const [analytics, setAnalytics] = React.useState(true);
    const [previewEnabled, setPreviewEnabled] = React.useState(true);
    
    const [manualRtlSettings, setManualRtlSettings] = React.useState<ManualRtlSettings>({
        manualRtlEnabled: true,
        manualRtlSiteMode: 'allowed_sites',
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
                'manualRtlSettings',
                'analytics',
                'previewEnabled'
            ], (result) => {
                if (result.rtlAlgorithmMode) {
                    setRtlAlgorithm(result.rtlAlgorithmMode);
                }
                if (result.supportHide !== undefined) {
                    setSupportHide(result.supportHide);
                }
                // Use manualRtlSettings
                const settings = result.manualRtlSettings;
                if (settings) {
                    setManualRtlSettings({
                        manualRtlEnabled: true,
                        manualRtlSiteMode: 'allowed_sites',
                        menuDisplayMode: 'logo_first',
                        highlightMode: 'on_direction_change',
                        highlightColor: '#ff0000',
                        highlightOpacity: 0.3,
                        logoDisplay: 'always',
                        applyFont: true,
                        ...settings
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
                if (changes.supportHide) {
                    setSupportHide(changes.supportHide.newValue);
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

    const handleSupportChange = (enabled: boolean) => {
        setSupportHide(enabled);
        try {
            chrome.storage.sync.set({ supportHide: enabled });
        } catch (error) {
            console.log('Failed to save support setting:', error);
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

    return (
        <Box sx={{ width: '100%' }}>
            {/* Tabs */}
            <Box sx={{ 
                // direction: 'rtl',
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
                    <Tab label="الگوریتم" />
                    <Tab label="راستچین دستی" />
                    <Tab label="تنظیمات عمومی" />
                    
                   
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
