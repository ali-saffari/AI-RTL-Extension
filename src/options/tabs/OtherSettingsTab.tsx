import React from 'react';
import {
    Paper,
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
    Tooltip,
    IconButton,
    SvgIcon,
    Grid
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

interface OtherSettingsTabProps {
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    isDarkMode: boolean;
    analytics: boolean;
    onAnalyticsChange: (enabled: boolean) => void;
}

const OtherSettingsTab: React.FC<OtherSettingsTabProps> = ({
    supportHide,
    onSupportChange,
    isDarkMode,
    analytics,
    onAnalyticsChange
}) => {
    const theme = useTheme();
    const manifest = chrome.runtime.getManifest();
    const author = typeof manifest.author === 'string' ? manifest.author : (manifest.author?.email || '');

    return (
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
                            
                            {/* صفحه رسمی افزونه در کروم استور */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        صفحه رسمی افزونه در کروم استور:
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        component="a"
                                        href="https://chromewebstore.google.com/detail/chatgpt-rtl-%D9%81%D8%A7%D8%B1%D8%B3%DB%8C-%D8%B1%D8%A7%D8%B3%D8%AA%E2%80%8C%DA%86%DB%8C/pjpmebofipgpjaincgoboibbmicccbne"
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
                                        مشاهده در Chrome Web Store
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
                                            href="https://t.me/mrmaterial"
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
    );
};

export default OtherSettingsTab;

