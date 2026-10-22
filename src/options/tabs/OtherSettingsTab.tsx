import React from 'react';
import {
    Box,
    Typography,
    Switch,
    useTheme,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    SvgIcon,
    Grid,
    Button,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { mdiDownload, mdiUpload, mdiUpdate, mdiRestore } from '@mdi/js';
import { openUpdateModal } from '../../utils/openUpdateModal';
import {
    getExtensionStoreUrl,
    getOfficialStoreLabel,
    getViewInStoreText,
    shouldShowExtensionId,
} from '../../utils/storeLinks';
import { isFirefoxRuntime } from '../../utils/isFirefox';
import {
    PIN_OPEN_SITE_STORAGE_KEY,
    PinOpenSiteMode,
    hasTabsPermission,
    normalizePinOpenSiteMode,
    rememberFullPinOpenSiteIntent,
    clearFullPinOpenSiteIntent,
    requestTabsPermission,
} from '../../utils/pinOpenSite';
import PinOpenSiteModeSelect from '../../components/PinOpenSiteModeSelect';
import { normalizeSiteSettings, SITE_SETTINGS_STORAGE_KEY } from '../../constants/siteSettings';
import { useI18n } from '../../i18n';

interface OtherSettingsTabProps {
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    markdownDebug: boolean;
    onMarkdownDebugChange: (enabled: boolean) => void;
    pinOpenSiteMode: PinOpenSiteMode;
    onPinOpenSiteModeChange: (mode: PinOpenSiteMode) => void;
    isDarkMode: boolean;
    analytics: boolean;
    onAnalyticsChange: (enabled: boolean) => void;
}

const OtherSettingsTab: React.FC<OtherSettingsTabProps> = ({
    supportHide,
    onSupportChange,
    markdownDebug,
    onMarkdownDebugChange,
    pinOpenSiteMode,
    onPinOpenSiteModeChange,
    isDarkMode,
    analytics,
    onAnalyticsChange
}) => {
    const theme = useTheme();
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const manifest = chrome.runtime.getManifest();
    const author = typeof manifest.author === 'string' ? manifest.author : (manifest.author?.email || '');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    const [pinSitePermissionOpen, setPinSitePermissionOpen] = React.useState(false);
    const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false);
    const [resetting, setResetting] = React.useState(false);

    const handlePinOpenSiteModeSelect = async (mode: PinOpenSiteMode) => {
        if (mode !== 'full' || isFirefoxRuntime()) {
            onPinOpenSiteModeChange(mode);
            return;
        }

        const alreadyGranted = await hasTabsPermission();
        if (alreadyGranted) {
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
            setPinSitePermissionOpen(false);
            void clearFullPinOpenSiteIntent();
            return;
        }
        setPinSitePermissionOpen(false);
        onPinOpenSiteModeChange(previousMode);
        void clearFullPinOpenSiteIntent();
    };

    // Export settings
    const handleExportSettings = async () => {
        try {
            const allSettings = await chrome.storage.sync.get(null);
            
            // Create export object with only relevant settings
            const exportData = {
                version: manifest.version,
                exportDate: new Date().toISOString(),
                settings: {
                    rtlAlgorithmMode: allSettings.rtlAlgorithmMode,
                    selectedFont: allSettings.selectedFont,
                    fontScale: allSettings.fontScale,
                    supportHide: allSettings.supportHide,
                    [PIN_OPEN_SITE_STORAGE_KEY]: allSettings[PIN_OPEN_SITE_STORAGE_KEY],
                    applyAlgorithmToCode: allSettings.applyAlgorithmToCode,
                    flipRtlArrows: allSettings.flipRtlArrows,
                    fixMixedText: allSettings.fixMixedText,
                    mixedTitleDisplayMode: allSettings.mixedTitleDisplayMode,
                    manualRtlSettings: allSettings.manualRtlSettings,
                    manualRtlActiveSites: allSettings.manualRtlActiveSites,
                    [SITE_SETTINGS_STORAGE_KEY]: allSettings[SITE_SETTINGS_STORAGE_KEY],
                    analytics: allSettings.analytics,
                    previewEnabled: allSettings.previewEnabled,
                    // Export all service flags
                    ...Object.keys(allSettings).reduce((acc, key) => {
                        // Include service flags (check if it's a boolean service flag)
                        if (key !== 'rtlAlgorithmMode' && 
                            key !== 'selectedFont' &&
                            key !== 'fontScale' &&
                            key !== 'supportHide' &&
                            key !== PIN_OPEN_SITE_STORAGE_KEY &&
                            key !== 'applyAlgorithmToCode' &&
                            key !== 'flipRtlArrows' &&
                            key !== 'fixMixedText' &&
                            key !== 'mixedTitleDisplayMode' && 
                            key !== 'manualRtlSettings' && 
                            key !== 'manualRtlActiveSites' && 
                            key !== SITE_SETTINGS_STORAGE_KEY &&
                            key !== 'analytics' && 
                            key !== 'previewEnabled' &&
                            typeof allSettings[key] === 'boolean') {
                            acc[key] = allSettings[key];
                        }
                        return acc;
                    }, {} as { [key: string]: any })
                }
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chatgpt-rtl-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSnackbarMessage(t('otherSettings.saved'));
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('[OtherSettingsTab] Error exporting settings:', error);
            setSnackbarMessage(t('otherSettings.saveError'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleResetSettings = async () => {
        setResetting(true);
        try {
            const response = await chrome.runtime.sendMessage({ action: 'resetToFreshInstall' });
            if (!response?.success) {
                throw new Error(response?.error || 'reset failed');
            }
            setResetConfirmOpen(false);
            setSnackbarMessage(t('otherSettings.resetDone'));
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            window.setTimeout(() => {
                window.location.reload();
            }, 400);
        } catch (error) {
            console.error('[OtherSettingsTab] Error resetting settings:', error);
            setResetting(false);
            setSnackbarMessage(t('otherSettings.resetError'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Import settings
    const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            // Validate import data
            if (!importData.settings) {
                throw new Error(t('otherSettings.invalidFile'));
            }

            // Confirm import
            const confirmed = window.confirm(t('otherSettings.confirmImport'));

            if (!confirmed) {
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            // Import settings
            const settingsToImport: { [key: string]: any } = {};
            
            if (importData.settings.rtlAlgorithmMode !== undefined) {
                settingsToImport.rtlAlgorithmMode = importData.settings.rtlAlgorithmMode;
            }
            if (importData.settings.selectedFont !== undefined) {
                settingsToImport.selectedFont = importData.settings.selectedFont;
            }
            if (importData.settings.fontScale !== undefined) {
                settingsToImport.fontScale = importData.settings.fontScale;
            }
            if (importData.settings.supportHide !== undefined) {
                settingsToImport.supportHide = importData.settings.supportHide;
            }
            if (importData.settings[PIN_OPEN_SITE_STORAGE_KEY] !== undefined) {
                settingsToImport[PIN_OPEN_SITE_STORAGE_KEY] = normalizePinOpenSiteMode(
                    importData.settings[PIN_OPEN_SITE_STORAGE_KEY]
                );
            }
            if (importData.settings.applyAlgorithmToCode !== undefined) {
                settingsToImport.applyAlgorithmToCode = importData.settings.applyAlgorithmToCode === true;
            }
            if (importData.settings.flipRtlArrows !== undefined) {
                settingsToImport.flipRtlArrows = importData.settings.flipRtlArrows === true;
            }
            if (importData.settings.fixMixedText !== undefined) {
                settingsToImport.fixMixedText = importData.settings.fixMixedText === true;
            }
            if (importData.settings.mixedTitleDisplayMode !== undefined) {
                settingsToImport.mixedTitleDisplayMode = importData.settings.mixedTitleDisplayMode;
            }
            if (importData.settings.manualRtlSettings !== undefined) {
                settingsToImport.manualRtlSettings = importData.settings.manualRtlSettings;
            }
            if (importData.settings.manualRtlActiveSites !== undefined) {
                settingsToImport.manualRtlActiveSites = importData.settings.manualRtlActiveSites;
            }
            if (importData.settings[SITE_SETTINGS_STORAGE_KEY] !== undefined) {
                settingsToImport[SITE_SETTINGS_STORAGE_KEY] = normalizeSiteSettings(
                    importData.settings[SITE_SETTINGS_STORAGE_KEY]
                );
            }
            if (importData.settings.analytics !== undefined) {
                settingsToImport.analytics = importData.settings.analytics;
            }
            if (importData.settings.previewEnabled !== undefined) {
                settingsToImport.previewEnabled = importData.settings.previewEnabled;
            }

            // Import service flags
            Object.keys(importData.settings).forEach(key => {
                if (key !== 'rtlAlgorithmMode' && 
                    key !== 'selectedFont' &&
                    key !== 'fontScale' &&
                    key !== 'supportHide' && 
                    key !== PIN_OPEN_SITE_STORAGE_KEY &&
                    key !== 'applyAlgorithmToCode' &&
                    key !== 'flipRtlArrows' &&
                    key !== 'fixMixedText' &&
                    key !== 'mixedTitleDisplayMode' &&
                    key !== 'manualRtlSettings' && 
                    key !== 'manualRtlActiveSites' && 
                    key !== SITE_SETTINGS_STORAGE_KEY &&
                    key !== 'analytics' && 
                    key !== 'previewEnabled' &&
                    typeof importData.settings[key] === 'boolean') {
                    settingsToImport[key] = importData.settings[key];
                }
            });

            await chrome.storage.sync.set(settingsToImport);

            // Reload page to apply settings
            window.location.reload();

            setSnackbarMessage(t('otherSettings.imported'));
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('[OtherSettingsTab] Error importing settings:', error);
            setSnackbarMessage(t('otherSettings.importError', { error: error instanceof Error ? error.message : t('otherSettings.invalidFile') }));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
        <Grid container spacing={3}>
            {/* General settings */}
            <Grid item xs={12} sm={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                {t('otherSettings.generalTitle')}
                            </Typography>
                        </Box>

                        <List>
                            <ListItem>
                                <ListItemText 
                                    primary={t('otherSettings.hideSupport')}
                                    secondary={t('otherSettings.hideSupportHint')}
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={supportHide}
                                        onChange={(e) => onSupportChange(e.target.checked)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: isDarkMode ? '#00e9ff' : '#387af2',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: isDarkMode ? '#00e9ff' : '#387af2',
                                            },
                                        }}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    py: 1.5,
                                }}
                            >
                                <ListItemText 
                                    primary={t('otherSettings.pinOpenSite')}
                                    sx={{ flex: 1, minWidth: 0, my: 0 }}
                                />
                                <PinOpenSiteModeSelect
                                    value={pinOpenSiteMode}
                                    onChange={(mode) => {
                                        void handlePinOpenSiteModeSelect(mode);
                                    }}
                                    isDarkMode={isDarkMode}
                                />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText 
                                    primary={t('otherSettings.export')}
                                    secondary={t('otherSettings.exportHint')}
                                />
                                <ListItemSecondaryAction>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={
                                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                                <path d={mdiDownload} />
                                            </SvgIcon>
                                        }
                                        onClick={handleExportSettings}
                                        sx={{
                                            fontFamily: 'iranyekan',
                                            borderColor: isDarkMode ? '#00e9ff' : '#387af2',
                                            color: isDarkMode ? '#00e9ff' : '#387af2',
                                            '&:hover': {
                                                borderColor: isDarkMode ? '#00e9ff' : '#387af2',
                                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.1)',
                                            },
                                        }}
                                    >
                                        {t('otherSettings.exportButton')}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary={t('otherSettings.import')}
                                    secondary={t('otherSettings.importHint')}
                                />
                                <ListItemSecondaryAction>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        style={{ display: 'none' }}
                                        onChange={handleImportSettings}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={
                                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                                <path d={mdiUpload} />
                                            </SvgIcon>
                                        }
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{
                                            fontFamily: 'iranyekan',
                                            borderColor: isDarkMode ? '#00e9ff' : '#387af2',
                                            color: isDarkMode ? '#00e9ff' : '#387af2',
                                            '&:hover': {
                                                borderColor: isDarkMode ? '#00e9ff' : '#387af2',
                                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.1)',
                                            },
                                        }}
                                    >
                                        {t('otherSettings.importButton')}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('otherSettings.reset')}
                                    secondary={t('otherSettings.resetHint')}
                                />
                                <ListItemSecondaryAction>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        startIcon={
                                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                                <path d={mdiRestore} />
                                            </SvgIcon>
                                        }
                                        onClick={() => setResetConfirmOpen(true)}
                                        sx={{
                                            fontFamily: 'iranyekan',
                                        }}
                                    >
                                        {t('otherSettings.resetButton')}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText 
                                    primary={t('otherSettings.updates')}
                                    secondary={t('otherSettings.updatesHint')}
                                />
                                <ListItemSecondaryAction>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={
                                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                                <path d={mdiUpdate} />
                                            </SvgIcon>
                                        }
                                        onClick={openUpdateModal}
                                        sx={{
                                            fontFamily: 'iranyekan',
                                            borderColor: isDarkMode ? '#00e9ff' : '#387af2',
                                            color: isDarkMode ? '#00e9ff' : '#387af2',
                                            '&:hover': {
                                                borderColor: isDarkMode ? '#00e9ff' : '#387af2',
                                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.1)',
                                            },
                                        }}
                                    >
                                        {t('otherSettings.showUpdates')}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary={t('otherSettings.markdownDebug')}
                                    secondary={t('otherSettings.markdownDebugHint')}
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={markdownDebug}
                                        onChange={(e) => onMarkdownDebugChange(e.target.checked)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: isDarkMode ? '#00e9ff' : '#387af2',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: isDarkMode ? '#00e9ff' : '#387af2',
                                            },
                                        }}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* Extension info */}
            <Grid item xs={12} sm={6}>
                <Card elevation={2}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                {t('otherSettings.infoTitle')}
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* نسخه */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(56, 122, 242, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {t('otherSettings.version')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {manifest.version}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            {shouldShowExtensionId() ? (
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(56, 122, 242, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {t('otherSettings.extensionId')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        {chrome.runtime.id}
                                    </Typography>
                                </Box>
                            </Grid>
                            ) : null}
                            
                            {/* وب‌سایت */}
                            {manifest.homepage_url && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(56, 122, 242, 0.05)' }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {t('otherSettings.website')}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            component="a"
                                            href={manifest.homepage_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.75rem',
                                                color: theme.palette.primary.main,
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            {manifest.homepage_url}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                            
                            {/* صفحه رسمی افزونه در استور */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(56, 122, 242, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {isFirefoxRuntime() ? t('share.officialFirefox') : t('share.officialChrome')}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        component="a"
                                        href={getExtensionStoreUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ 
                                            fontWeight: 500, 
                                            fontSize: '0.75rem',
                                            color: theme.palette.primary.main,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        {isFirefoxRuntime() ? t('share.viewFirefox') : t('share.viewChrome')}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            {/* ارتباط با سازنده */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(56, 122, 242, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {t('otherSettings.contact')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        {author && (
                                            <Typography 
                                                variant="body2" 
                                                component="a"
                                                href={`mailto:${author}`}
                                                sx={{ 
                                                    fontWeight: 500, 
                                                    fontSize: '0.75rem',
                                                    color: theme.palette.primary.main,
                                                    textDecoration: 'none',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                {t('otherSettings.email')}
                                            </Typography>
                                        )}
                                        <Typography 
                                            variant="body2" 
                                            component="a"
                                            href="https://t.me/ai_rtl_support"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ 
                                                fontWeight: 500, 
                                                fontSize: '0.75rem',
                                                color: theme.palette.primary.main,
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            {t('otherSettings.telegram')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert 
                onClose={() => setSnackbarOpen(false)} 
                severity={snackbarSeverity}
                sx={{ fontFamily: 'iranyekan' }}
            >
                {snackbarMessage}
            </Alert>
        </Snackbar>
        <Dialog
            open={resetConfirmOpen}
            onClose={() => {
                if (!resetting) {
                    setResetConfirmOpen(false);
                }
            }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle style={{ direction: dir, textAlign: contentAlign, fontFamily: 'iranyekan' }}>
                {t('otherSettings.resetConfirmTitle')}
            </DialogTitle>
            <DialogContent style={{ direction: dir, textAlign: 'justify' }}>
                <Typography sx={{ fontSize: '0.85rem', fontFamily: 'iranyekan', lineHeight: 1.8 }}>
                    {t('otherSettings.resetConfirmBody')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
                <Button
                    onClick={() => setResetConfirmOpen(false)}
                    disabled={resetting}
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    {t('otherSettings.close')}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={resetting}
                    onClick={() => {
                        void handleResetSettings();
                    }}
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    {t('otherSettings.resetButton')}
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog
            open={pinSitePermissionOpen}
            onClose={() => setPinSitePermissionOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle style={{ direction: dir, textAlign: contentAlign, fontFamily: 'iranyekan' }}>
                {t('otherSettings.tabPermissionTitle')}
            </DialogTitle>
            <DialogContent style={{ direction: dir, textAlign: 'justify' }}>
                <Typography sx={{ fontSize: '0.85rem', fontFamily: 'iranyekan', lineHeight: 1.8 }}>
                    {t('otherSettings.tabPermissionBody')}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontFamily: 'iranyekan', lineHeight: 1.8, mt: 1.5 }}>
                    {t('otherSettings.tabPermissionPrivacy')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
                <Button onClick={() => setPinSitePermissionOpen(false)} sx={{ fontFamily: 'iranyekan' }}>
                    {t('otherSettings.close')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        void handleRequestPinSitePermission();
                    }}
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    {t('otherSettings.grantPermission')}
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
};

export default OtherSettingsTab;

