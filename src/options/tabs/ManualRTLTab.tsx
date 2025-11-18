import React from 'react';
import {
    Paper,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Divider,
    useTheme,
    Card,
    CardContent,
    Grid
} from '@mui/material';

interface TextSelectorSettings {
    enabled: 'enabled' | 'allowed_sites' | 'disabled';
    highlightMode: 'disabled' | 'on_selection' | 'on_direction_change';
    highlightColor: string;
    highlightOpacity: number;
    logoDisplay: 'always' | 'on_hover' | 'disabled';
}

interface ManualRTLTabProps {
    textSelectorSettings: TextSelectorSettings;
    onTextSelectorSettingsChange: (settings: TextSelectorSettings) => void;
    isDarkMode: boolean;
}

const ManualRTLTab: React.FC<ManualRTLTabProps> = ({
    textSelectorSettings,
    onTextSelectorSettingsChange,
    isDarkMode
}) => {
    const theme = useTheme();

    // Template example
    const templateExample = `مثال استفاده از قابلیت راستچین دستی:

1. متن مورد نظر را انتخاب کنید
2. منوی تنظیم جهت ظاهر می‌شود
3. جهت مورد نظر را انتخاب کنید
4. متن به صورت خودکار تغییر جهت می‌دهد

این قابلیت برای مواقعی که الگوریتم 
خودکار به درستی کار نمی‌کند، بسیار 
مفید است.`;

    return (
        <Grid container spacing={3}>
            {/* Settings Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                تنظیمات چینش دستی
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                            }}>
                                تنظیمات مربوط به قابلیت تغییر چینش متن به صورت دستی
                            </Typography>
                        </Box>

                        {/* فعال/غیرفعال بودن */}
                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="enabled-label">وضعیت فعال‌سازی</InputLabel>
                                <Select
                                    labelId="enabled-label"
                                    value={textSelectorSettings.enabled}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
                                        enabled: e.target.value as 'enabled' | 'allowed_sites' | 'disabled'
                                    })}
                                    label="وضعیت فعال‌سازی"
                                >
                                    <MenuItem value="enabled">فعال</MenuItem>
                                    <MenuItem value="allowed_sites">فقط سایت‌های مجاز</MenuItem>
                                    <MenuItem value="disabled">غیرفعال</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* نحوه نمایش محل تغییر */}
                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="highlight-mode-label">نحوه نمایش محل تغییر</InputLabel>
                                <Select
                                    labelId="highlight-mode-label"
                                    value={textSelectorSettings.highlightMode}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
                                        highlightMode: e.target.value as 'disabled' | 'on_selection' | 'on_direction_change'
                                    })}
                                    label="نحوه نمایش محل تغییر"
                                >
                                    <MenuItem value="disabled">غیرفعال</MenuItem>
                                    <MenuItem value="on_selection">زمان انتخاب متن</MenuItem>
                                    <MenuItem value="on_direction_change">زمان باز شدن منو تنظیم جهت</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* رنگ محل انتخاب شده */}
                        <Box sx={{ mb: 3, opacity: textSelectorSettings.highlightMode === 'disabled' ? 0.5 : 1 }}>
                            <Typography variant="body2" sx={{ 
                                fontWeight: 500, 
                                mb: 1.5,
                                color: 'text.primary'
                            }}>
                                رنگ محل انتخاب شده
                            </Typography>
                            
                            {/* انتخاب رنگ */}
                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map((color) => (
                                    <Box
                                        key={color}
                                        onClick={() => {
                                            if (textSelectorSettings.highlightMode !== 'disabled') {
                                                onTextSelectorSettingsChange({
                                                    ...textSelectorSettings,
                                                    highlightColor: color
                                                });
                                            }
                                        }}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: color,
                                            cursor: textSelectorSettings.highlightMode === 'disabled' ? 'not-allowed' : 'pointer',
                                            border: textSelectorSettings.highlightColor === color ? `3px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.2)',
                                            opacity: textSelectorSettings.highlightMode === 'disabled' ? 0.5 : 1
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* شدت رنگ */}
                            <Box sx={{ px: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                    شدت رنگ: {Math.round(textSelectorSettings.highlightOpacity * 100)}%
                                </Typography>
                                <Slider
                                    value={textSelectorSettings.highlightOpacity}
                                    onChange={(_, value) => {
                                        if (textSelectorSettings.highlightMode !== 'disabled') {
                                            onTextSelectorSettingsChange({
                                                ...textSelectorSettings,
                                                highlightOpacity: value as number
                                            });
                                        }
                                    }}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    disabled={textSelectorSettings.highlightMode === 'disabled'}
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            color: theme.palette.primary.main
                                        },
                                        '& .MuiSlider-track': {
                                            color: theme.palette.primary.main
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* نمایش لوگو */}
                        <Box sx={{ mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="logo-display-label">نمایش لوگو در کنار متن تغییر کرده</InputLabel>
                                <Select
                                    labelId="logo-display-label"
                                    value={textSelectorSettings.logoDisplay}
                                    onChange={(e) => onTextSelectorSettingsChange({
                                        ...textSelectorSettings,
                                        logoDisplay: e.target.value as 'always' | 'on_hover' | 'disabled'
                                    })}
                                    label="نمایش لوگو در کنار متن تغییر کرده"
                                >
                                    <MenuItem value="always">همیشه نمایش بده</MenuItem>
                                    <MenuItem value="on_hover">زمان hover شدن موس</MenuItem>
                                    <MenuItem value="disabled">غیرفعال</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Template Section */}
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main',
                                mb: 0.5
                            }}>
                                تمونه استفاده
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                            }}>
                                راهنمای استفاده از قابلیت راستچین دستی
                            </Typography>
                        </Box>
                        
                        <Box sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            minHeight: '300px',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: theme.palette.text.primary
                        }}>
                            {templateExample}
                        </Box>

                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)' }}>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 1
                            }}>
                                نکته مهم:
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem',
                                lineHeight: 1.6
                            }}>
                                این قابلیت به شما امکان تغییر دستی جهت متن را می‌دهد. 
                                برای استفاده، کافی است متن مورد نظر را انتخاب کرده و 
                                از منوی ظاهر شده جهت مناسب را انتخاب کنید.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ManualRTLTab;

