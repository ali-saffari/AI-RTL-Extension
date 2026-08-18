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
import { mdiDownload, mdiUpload } from '@mdi/js';
import {
    getExtensionStoreUrl,
    getOfficialStoreLabel,
    getViewInStoreText,
} from '../../utils/storeLinks';
import { isFirefoxRuntime } from '../../utils/isFirefox';
import {
    PIN_OPEN_SITE_STORAGE_KEY,
    PinOpenSiteMode,
    hasTabsPermission,
    normalizePinOpenSiteMode,
    requestTabsPermission,
} from '../../utils/pinOpenSite';
import PinOpenSiteModeSelect from '../../components/PinOpenSiteModeSelect';

interface OtherSettingsTabProps {
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    pinOpenSiteMode: PinOpenSiteMode;
    onPinOpenSiteModeChange: (mode: PinOpenSiteMode) => void;
    isDarkMode: boolean;
    analytics: boolean;
    onAnalyticsChange: (enabled: boolean) => void;
}

const OtherSettingsTab: React.FC<OtherSettingsTabProps> = ({
    supportHide,
    onSupportChange,
    pinOpenSiteMode,
    onPinOpenSiteModeChange,
    isDarkMode,
    analytics,
    onAnalyticsChange
}) => {
    const theme = useTheme();
    const manifest = chrome.runtime.getManifest();
    const author = typeof manifest.author === 'string' ? manifest.author : (manifest.author?.email || '');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    const [pinSitePermissionOpen, setPinSitePermissionOpen] = React.useState(false);

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
        const granted = await requestTabsPermission();
        if (granted) {
            setPinSitePermissionOpen(false);
            onPinOpenSiteModeChange('full');
            return;
        }
        setPinSitePermissionOpen(false);
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
                    mixedTitleDisplayMode: allSettings.mixedTitleDisplayMode,
                    manualRtlSettings: allSettings.manualRtlSettings,
                    manualRtlActiveSites: allSettings.manualRtlActiveSites,
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
                            key !== 'mixedTitleDisplayMode' && 
                            key !== 'manualRtlSettings' && 
                            key !== 'manualRtlActiveSites' && 
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

            setSnackbarMessage('تنظیمات با موفقیت ذخیره شد');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('[OtherSettingsTab] Error exporting settings:', error);
            setSnackbarMessage('خطا در ذخیره تنظیمات');
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
                throw new Error('فرمت فایل نامعتبر است');
            }

            // Confirm import
            const confirmed = window.confirm(
                'آیا مطمئن هستید که می‌خواهید تنظیمات را وارد کنید؟ این کار تنظیمات فعلی را جایگزین می‌کند.'
            );

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
            if (importData.settings.mixedTitleDisplayMode !== undefined) {
                settingsToImport.mixedTitleDisplayMode = importData.settings.mixedTitleDisplayMode;
            }
            if (importData.settings.manualRtlSettings !== undefined) {
                settingsToImport.manualRtlSettings = importData.settings.manualRtlSettings;
            }
            if (importData.settings.manualRtlActiveSites !== undefined) {
                settingsToImport.manualRtlActiveSites = importData.settings.manualRtlActiveSites;
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
                    key !== 'mixedTitleDisplayMode' &&
                    key !== 'manualRtlSettings' && 
                    key !== 'manualRtlActiveSites' && 
                    key !== 'analytics' && 
                    key !== 'previewEnabled' &&
                    typeof importData.settings[key] === 'boolean') {
                    settingsToImport[key] = importData.settings[key];
                }
            });

            await chrome.storage.sync.set(settingsToImport);

            // Reload page to apply settings
            window.location.reload();

            setSnackbarMessage('تنظیمات با موفقیت وارد شد');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('[OtherSettingsTab] Error importing settings:', error);
            setSnackbarMessage('خطا در وارد کردن تنظیمات: ' + (error instanceof Error ? error.message : 'فرمت فایل نامعتبر است'));
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
            {/* تنظیمات عمومی */}
            <Grid item xs={12} sm={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                تنظیمات عمومی
                            </Typography>
                        </Box>

                        <List>
                            <ListItem>
                                <ListItemText 
                                    primary="مخفی کردن متن حمایت"
                                    secondary="این متن نشان‌دهنده فعال بودن افزونه روی سایت است"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={supportHide}
                                        onChange={(e) => onSupportChange(e.target.checked)}
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
                                    primary="نمایش سایت باز در بالای لیست"
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
                                    primary="خروجی گرفتن از تنظیمات"
                                    secondary="ذخیره تمام تنظیمات در یک فایل JSON"
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
                                            borderColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            '&:hover': {
                                                borderColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)',
                                            },
                                        }}
                                    >
                                        خروجی
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="وارد کردن تنظیمات"
                                    secondary="بازیابی تنظیمات از فایل JSON"
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
                                            borderColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            '&:hover': {
                                                borderColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                                backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)',
                                            },
                                        }}
                                    >
                                        وارد کردن
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* اطلاعات افزونه */}
            <Grid item xs={12} sm={6}>
                <Card elevation={2}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                اطلاعات افزونه
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* نسخه */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        نسخه:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {manifest.version}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            {/* شناسه افزونه */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        شناسه افزونه:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        {chrome.runtime.id}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            {/* وب‌سایت */}
                            {manifest.homepage_url && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            وب‌سایت رسمی افزونه:
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {getOfficialStoreLabel()}
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
                                        {getViewInStoreText()}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            {/* ارتباط با سازنده */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        ارتباط با سازنده:
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
                                                ایمیل
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
                                            تلگرام
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
            open={pinSitePermissionOpen}
            onClose={() => setPinSitePermissionOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'iranyekan' }}>
                نیاز به دسترسی تب
            </DialogTitle>
            <DialogContent style={{ direction: 'rtl', textAlign: 'justify' }}>
                <Typography sx={{ fontSize: '0.85rem', fontFamily: 'iranyekan', lineHeight: 1.8 }}>
                    برای اینکه سایتِ در حال مشاهده (در صورت پشتیبانی شدن توسط افزونه) همیشه بالای لیست بیاید، حتی اگر هنوز آن را فعال نکرده باشید، افزونه با کمک «مجوز تب‌ها» باز بودن آن را تشخیص می‌دهد تا بتوانید سریع‌تر فعالش کنید.
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontFamily: 'iranyekan', lineHeight: 1.8, mt: 1.5 }}>
                    این دسترسی صرفاً برای خواندن «نام دامنه» تب فعلی است و افزونه هیچ‌گونه دسترسی به آدرس کامل، محتوای صفحه یا اطلاعات شخصی شما ندارد.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ flexDirection: 'row-reverse', gap: 1, px: 3, pb: 2 }}>
                <Button onClick={() => setPinSitePermissionOpen(false)} sx={{ fontFamily: 'iranyekan' }}>
                    بستن
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        void handleRequestPinSitePermission();
                    }}
                    sx={{ fontFamily: 'iranyekan' }}
                >
                    دریافت مجوز
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
};

export default OtherSettingsTab;

