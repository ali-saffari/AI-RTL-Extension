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

interface TextSelectorSettings {
    enabled: 'enabled' | 'allowed_sites' | 'disabled';
    highlightMode: 'disabled' | 'on_selection' | 'on_direction_change';
    highlightColor: string;
    highlightOpacity: number;
    logoDisplay: 'always' | 'on_hover' | 'disabled';
}

interface SettingsContentProps {
    isDarkMode: boolean;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ isDarkMode }) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = React.useState(0);
    const [rtlAlgorithm, setRtlAlgorithm] = React.useState('advanced_full');
    const [supportHide, setSupportHide] = React.useState(false);
    const [analytics, setAnalytics] = React.useState(true);
    const [previewEnabled, setPreviewEnabled] = React.useState(true);
    
    const [textSelectorSettings, setTextSelectorSettings] = React.useState<TextSelectorSettings>({
        enabled: 'enabled',
        highlightMode: 'on_selection',
        highlightColor: '#ff0000',
        highlightOpacity: 0.1,
        logoDisplay: 'always'
    });

    // Load all settings from storage
    const loadSettings = React.useCallback(() => {
        try {
            chrome.storage.sync.get([
                'rtlAlgorithmMode', 
                'supportHide', 
                'textSelectorSettings',
                'analytics',
                'previewEnabled'
            ], (result) => {
                if (result.rtlAlgorithmMode) {
                    setRtlAlgorithm(result.rtlAlgorithmMode);
                }
                if (result.supportHide !== undefined) {
                    setSupportHide(result.supportHide);
                }
                if (result.textSelectorSettings) {
                    setTextSelectorSettings(result.textSelectorSettings);
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
                if (changes.textSelectorSettings) {
                    setTextSelectorSettings(changes.textSelectorSettings.newValue);
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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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

    const handleTextSelectorSettingsChange = (settings: TextSelectorSettings) => {
        setTextSelectorSettings(settings);
        try {
            chrome.storage.sync.set({ textSelectorSettings: settings });
        } catch (error) {
            console.log('Failed to save text selector settings:', error);
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
                    <Tab label="سایر تنظیمات" />
                    
                   
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
                        textSelectorSettings={textSelectorSettings}
                        onTextSelectorSettingsChange={handleTextSelectorSettingsChange}
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
