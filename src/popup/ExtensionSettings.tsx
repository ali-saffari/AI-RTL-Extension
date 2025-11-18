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

interface ExtensionSettingsProps {
    isDarkMode: boolean;
    onThemeChange?: (isDark: boolean) => void;
}

const ExtensionSettings: React.FC<ExtensionSettingsProps> = ({
    isDarkMode,
    onThemeChange
}) => {
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
            console.log('Failed to load extension settings:', error);
        }
    }, []);

    const handleAutoUpdateChange = (enabled: boolean) => {
        setAutoUpdate(enabled);
        try {
            chrome.storage.sync.set({ autoUpdate: enabled });
        } catch (error) {
            console.log('Failed to save auto update setting:', error);
        }
    };

    const handleNotificationsChange = (enabled: boolean) => {
        setNotifications(enabled);
        try {
            chrome.storage.sync.set({ notifications: enabled });
        } catch (error) {
            console.log('Failed to save notifications setting:', error);
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

    const handleClearCache = () => {
        if (window.confirm('آیا از پاک کردن کش مطمئن هستید؟')) {
            try {
                chrome.storage.local.clear(() => {
                    alert('کش با موفقیت پاک شد.');
                });
            } catch (error) {
                console.log('Failed to clear cache:', error);
            }
        }
    };

    const handleClearData = () => {
        if (window.confirm('آیا از پاک کردن تمام داده‌های ذخیره شده مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
            try {
                chrome.storage.sync.clear(() => {
                    chrome.storage.local.clear(() => {
                        alert('تمام داده‌ها با موفقیت پاک شدند.');
                        window.location.reload();
                    });
                });
            } catch (error) {
                console.log('Failed to clear data:', error);
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
            console.log('Failed to export settings:', error);
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
                            alert('تنظیمات با موفقیت وارد شد. لطفاً صفحه را رفرش کنید.');
                            window.location.reload();
                        });
                    } catch (error) {
                        alert('خطا در وارد کردن تنظیمات. لطفاً فایل معتبری انتخاب کنید.');
                        console.log('Failed to import settings:', error);
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
                    تنظیمات افزونه
                </Typography>
            </Box>

            {/* تنظیمات عمومی */}
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
                        تنظیمات عمومی
                    </Typography>
                </Box>

                <List>
                    <ListItem>
                        <ListItemText 
                            primary="به‌روزرسانی خودکار"
                            secondary="افزونه به‌طور خودکار به‌روزرسانی می‌شود"
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
                            primary="اعلان‌ها"
                            secondary="نمایش اعلان‌های مربوط به افزونه"
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
                            primary="تحلیل و آمار"
                            secondary="ارسال داده‌های ناشناس برای بهبود افزونه"
                        />
                        <ListItemSecondaryAction>
                            <Tooltip title="این داده‌ها به صورت ناشناس و برای بهبود عملکرد افزونه استفاده می‌شوند">
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

            {/* مدیریت داده‌ها */}
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
                        مدیریت داده‌ها
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
                        خروجی گرفتن از تنظیمات
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
                        وارد کردن تنظیمات
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
                        پاک کردن کش
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
                        پاک کردن تمام داده‌ها
                    </Button>
                </Box>
            </Paper>

            {/* اطلاعات افزونه */}
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
                        اطلاعات افزونه
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            نسخه:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {chrome.runtime.getManifest().version}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            شناسه افزونه:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {chrome.runtime.id}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default ExtensionSettings;

