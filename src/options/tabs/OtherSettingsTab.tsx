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

    return (
        <Grid container spacing={3}>
            {/* تنظیمات عمومی */}
            <Grid item xs={12}>
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
                                        onChange={(e) => onAnalyticsChange(e.target.checked)}
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
                                    primary="مخفی کردن متن حمایت"
                                    secondary="مخفی کردن متن نشان‌دهنده فعال بودن افزونه"
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
            <Grid item xs={12}>
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
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        نسخه:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {chrome.runtime.getManifest().version}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.05)' : 'rgba(30, 64, 175, 0.05)' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        شناسه افزونه:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        {chrome.runtime.id}
                                    </Typography>
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

