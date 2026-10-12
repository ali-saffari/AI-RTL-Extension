import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    useTheme,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    SvgIcon,
    Tooltip
} from '@mui/material';
import { mdiInformationOutline, mdiRefresh, mdiDelete, mdiDownload, mdiUpload } from '@mdi/js';
import { shouldShowExtensionId } from '../utils/storeLinks';
import { useI18n } from '../i18n';

interface ExtensionSettingsProps {
    isDarkMode: boolean;
}

const ExtensionSettings: React.FC<ExtensionSettingsProps> = ({
    isDarkMode
}) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const theme = useTheme();
    const [autoUpdate, setAutoUpdate] = React.useState(true);
    const [notifications, setNotifications] = React.useState(true);
    const [analytics, setAnalytics] = React.useState(true);

    // Load settings from storage
    React.useEffect(() => {
        try {
            chrome.storage.sync.get(['autoUpdate', 'notifications', 'analytics'], (result) => {
                if (result.autoUpdate !== undefined) {
                    setAutoUpdate(result.autoUpdate);
                }
                if (result.notifications !== undefined) {
                    setNotifications(result.notifications);
                }
                if (result.analytics !== undefined) {
                    setAnalytics(result.analytics);
                }
            });
        } catch (error) {
            // Silently handle load errors
        }
    }, []);

    const handleAutoUpdateChange = (enabled: boolean) => {
        setAutoUpdate(enabled);
        try {
            chrome.storage.sync.set({ autoUpdate: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleNotificationsChange = (enabled: boolean) => {
        setNotifications(enabled);
        try {
            chrome.storage.sync.set({ notifications: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleAnalyticsChange = (enabled: boolean) => {
        setAnalytics(enabled);
        try {
            chrome.storage.sync.set({ analytics: enabled });
        } catch (error) {
            // Silently handle save errors
        }
    };

    const handleClearCache = () => {
        if (window.confirm(t('extensionSettings.confirmClearCache'))) {
            try {
                chrome.storage.local.clear(() => {
                    alert(t('extensionSettings.cacheCleared'));
                });
            } catch (error) {
                // Silently handle clear errors
            }
        }
    };

    const handleClearData = () => {
        if (window.confirm(t('extensionSettings.confirmClearData'))) {
            try {
                chrome.storage.sync.clear(() => {
                    chrome.storage.local.clear(() => {
                        alert(t('extensionSettings.dataCleared'));
                        window.location.reload();
                    });
                });
            } catch (error) {
                // Silently handle clear errors
            }
        }
    };

    const handleExportSettings = () => {
        try {
            chrome.storage.sync.get(null, (items) => {
                const dataStr = JSON.stringify(items, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `chatgpt-rtl-settings-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
            });
        } catch (error) {
            // Silently handle export errors
        }
    };

    const handleImportSettings = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const settings = JSON.parse(event.target?.result as string);
                        chrome.storage.sync.set(settings, () => {
                            alert(t('extensionSettings.importSuccess'));
                            window.location.reload();
                        });
                    } catch (error) {
                        alert(t('extensionSettings.importError'));
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    return (
        <Box sx={{ p: 0 }}>
            <Box sx={{ 
                textAlign: 'center', 
                mt: 2, 
                p: 2, 
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
                borderRadius: 0, 
                mb: 3,
                borderTop: `1px solid ${theme.palette.primary.main}`,
                borderBottom: `1px solid ${theme.palette.primary.main}`
            }}>
                <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                }}>
                    {t('extensionSettings.title')}
                </Typography>
            </Box>

            {/* General settings */}
            <Paper elevation={0} sx={{ 
                m: 2, 
                p: 2, 
                borderRadius: 1,
                background: isDarkMode ? '#2f2f41' : '#ffffff'
            }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        mb: 0.5
                    }}>
                        {t('extensionSettings.generalTitle')}
                    </Typography>
                </Box>

                <List>
                    <ListItem>
                        <ListItemText 
                            primary={t('extensionSettings.autoUpdate')}
                            secondary={t('extensionSettings.autoUpdateHint')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={autoUpdate}
                                onChange={(e) => handleAutoUpdateChange(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    },
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>

                    <Divider />

                    <ListItem>
                        <ListItemText 
                            primary={t('extensionSettings.notifications')}
                            secondary={t('extensionSettings.notificationsHint')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={notifications}
                                onChange={(e) => handleNotificationsChange(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    },
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>

                    <Divider />

                    <ListItem>
                        <ListItemText 
                            primary={t('extensionSettings.analytics')}
                            secondary={t('extensionSettings.analyticsHint')}
                        />
                        <ListItemSecondaryAction>
                            <Tooltip title={t('extensionSettings.analyticsTooltip')}>
                                <IconButton edge="end" size="small" sx={{ mr: 1 }}>
                                    <SvgIcon sx={{ fontSize: '1rem' }}>
                                        <path d={mdiInformationOutline} />
                                    </SvgIcon>
                                </IconButton>
                            </Tooltip>
                            <Switch
                                checked={analytics}
                                onChange={(e) => handleAnalyticsChange(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    },
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>

            {/* Data management */}
            <Paper elevation={0} sx={{ 
                m: 2, 
                p: 2, 
                borderRadius: 1,
                background: isDarkMode ? '#2f2f41' : '#ffffff'
            }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        mb: 0.5
                    }}>
                        {t('extensionSettings.dataTitle')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={
                            <SvgIcon>
                                <path d={mdiDownload} />
                            </SvgIcon>
                        }
                        onClick={handleExportSettings}
                        fullWidth
                        sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.1)' 
                                    : 'rgba(30, 64, 175, 0.1)'
                            }
                        }}
                    >
                        {t('extensionSettings.export')}
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={
                            <SvgIcon>
                                <path d={mdiUpload} />
                            </SvgIcon>
                        }
                        onClick={handleImportSettings}
                        fullWidth
                        sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 233, 255, 0.1)' 
                                    : 'rgba(30, 64, 175, 0.1)'
                            }
                        }}
                    >
                        {t('extensionSettings.import')}
                    </Button>

                    <Divider />

                    <Button
                        variant="outlined"
                        startIcon={
                            <SvgIcon>
                                <path d={mdiRefresh} />
                            </SvgIcon>
                        }
                        onClick={handleClearCache}
                        fullWidth
                        sx={{
                            borderColor: theme.palette.warning?.main || '#ff9800',
                            color: theme.palette.warning?.main || '#ff9800',
                            '&:hover': {
                                borderColor: theme.palette.warning?.dark || '#f57c00',
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 152, 0, 0.1)' 
                                    : 'rgba(255, 152, 0, 0.1)'
                            }
                        }}
                    >
                        {t('extensionSettings.clearCache')}
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={
                            <SvgIcon>
                                <path d={mdiDelete} />
                            </SvgIcon>
                        }
                        onClick={handleClearData}
                        fullWidth
                        sx={{
                            borderColor: theme.palette.error?.main || '#f44336',
                            color: theme.palette.error?.main || '#f44336',
                            '&:hover': {
                                borderColor: theme.palette.error?.dark || '#d32f2f',
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(244, 67, 54, 0.1)' 
                                    : 'rgba(244, 67, 54, 0.1)'
                            }
                        }}
                    >
                        {t('extensionSettings.clearAll')}
                    </Button>
                </Box>
            </Paper>

            {/* Extension info */}
            <Paper elevation={0} sx={{ 
                m: 2, 
                p: 2, 
                borderRadius: 1,
                background: isDarkMode ? '#2f2f41' : '#ffffff'
            }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        mb: 0.5
                    }}>
                        {t('extensionSettings.infoTitle')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t('extensionSettings.version')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {chrome.runtime.getManifest().version}
                        </Typography>
                    </Box>
                    {shouldShowExtensionId() ? (
                        <>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {t('extensionSettings.extensionId')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {chrome.runtime.id}
                                </Typography>
                            </Box>
                        </>
                    ) : null}
                </Box>
            </Paper>
        </Box>
    );
};

export default ExtensionSettings;


