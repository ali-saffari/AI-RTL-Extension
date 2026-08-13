import React from 'react';
import {
    Box,
    Typography,
    Switch,
    Button,
    SvgIcon,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import { mdiCog, mdiOpenInNew } from '@mdi/js';
import { ManualRtlSettings } from '../types/manualRtl';

interface QuickSettingsProps {
    rtlAlgorithm: string;
    onRtlAlgorithmChange: (value: string) => void;
    supportHide: boolean;
    onSupportChange: (enabled: boolean) => void;
    isDarkMode: boolean;
    manualRtlSettings: ManualRtlSettings;
    onManualRtlSettingsChange: (settings: ManualRtlSettings) => void;
}

const ALGORITHMS = [
    {
        id: 'advanced_section',
        title: 'تحلیل پیشرفته بخش‌ها',
        hint: 'هر بخش جداگانه بررسی می‌شود',
        badge: 'جدید',
    },
    {
        id: 'advanced_full',
        title: 'تحلیل پیشرفته یکپارچه',
        hint: 'کل متن یکجا پردازش می‌شود',
        badge: 'پیش‌فرض',
    },
    {
        id: 'first_word',
        title: 'تشخیص مبتنی بر واژه آغازین',
        hint: 'سریع؛ مناسب سیستم‌های ضعیف',
        badge: '',
    },
] as const;

const QuickSettings: React.FC<QuickSettingsProps> = ({
    rtlAlgorithm,
    onRtlAlgorithmChange,
    supportHide,
    onSupportChange,
    isDarkMode,
    manualRtlSettings,
    onManualRtlSettingsChange,
}) => {
    const [hasTabsPermission, setHasTabsPermission] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const checkTabsPermission = async () => {
            try {
                const hasPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
                setHasTabsPermission(hasPermission);
            } catch {
                setHasTabsPermission(false);
            }
        };
        checkTabsPermission();
    }, []);

    const selectedAlgo = ALGORITHMS.find((item) => item.id === rtlAlgorithm) ?? ALGORITHMS[1];
    const manualEnabled = manualRtlSettings.manualRtlEnabled !== false;

    const accent = isDarkMode ? '#00e9ff' : '#1e40af';
    const muted = isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.55)';
    const cardBg = isDarkMode ? 'rgba(47, 47, 65, 0.9)' : '#ffffff';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(30, 64, 175, 0.12)';
    const selectedBg = isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.08)';
    const fieldBg = isDarkMode ? 'rgba(26, 26, 46, 0.7)' : '#f8fafc';

    const switchSx = {
        '& .MuiSwitch-switchBase.Mui-checked': {
            color: isDarkMode ? '#00e9ff' : '#1c39bb',
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
        },
    };

    const openOptions = (hash = '') => {
        const page = hash ? `options.html#${hash}` : 'options.html';
        chrome.tabs.create({ url: chrome.runtime.getURL(page) });
    };

    return (
        <Box className="quick-settings" dir="rtl">
            <Box className="quick-settings-header">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    <SvgIcon sx={{ fontSize: '1.1rem', color: accent }}>
                        <path d={mdiCog} />
                    </SvgIcon>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDarkMode ? '#ffffff' : '#1e293b' }}>
                        تنظیمات
                    </Typography>
                </Box>
                <Button
                    variant="text"
                    size="small"
                    onClick={() => openOptions()}
                    endIcon={
                        <SvgIcon sx={{ fontSize: '0.85rem !important' }}>
                            <path d={mdiOpenInNew} />
                        </SvgIcon>
                    }
                    sx={{
                        minWidth: 0,
                        px: 0.75,
                        py: 0.25,
                        color: accent,
                        textTransform: 'none',
                        fontFamily: 'iranyekan',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        flexShrink: 0,
                        '&:hover': {
                            backgroundColor: selectedBg,
                            transform: 'none',
                        },
                    }}
                >
                    تنظیمات پیشرفته
                </Button>
            </Box>

            <Box className="quick-settings-body">
                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                        }}
                    >
                        <Typography className="quick-settings-label">الگوریتم تشخیص</Typography>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => openOptions('algorithm')}
                            sx={{
                                minWidth: 0,
                                px: 0.5,
                                py: 0,
                                color: accent,
                                textTransform: 'none',
                                fontFamily: 'iranyekan',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: 'underline',
                                    transform: 'none',
                                },
                            }}
                        >
                            چطور کار می‌کنه؟
                        </Button>
                    </Box>

                    <FormControl fullWidth size="small">
                        <Select
                            dir="rtl"
                            className="quick-settings-select"
                            value={rtlAlgorithm}
                            renderValue={(value) => ALGORITHMS.find((item) => item.id === value)?.title ?? ''}
                            onChange={(event) => onRtlAlgorithmChange(event.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    className: 'quick-settings-select-menu',
                                    sx: {
                                        mt: 0.5,
                                        backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                        backgroundImage: 'none',
                                    },
                                },
                            }}
                            sx={{
                                fontFamily: 'iranyekan',
                                fontSize: '0.82rem',
                                backgroundColor: fieldBg,
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                borderRadius: '10px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: cardBorder,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(30, 64, 175, 0.4)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: accent,
                                    borderWidth: '1px',
                                },
                                '& .MuiSelect-icon': {
                                    color: muted,
                                },
                            }}
                        >
                            {ALGORITHMS.map((algo) => (
                                <MenuItem
                                    key={algo.id}
                                    value={algo.id}
                                    dir="rtl"
                                    sx={{
                                        fontFamily: 'iranyekan',
                                        fontSize: '0.82rem',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        py: 1,
                                        textAlign: 'right',
                                        direction: 'rtl',
                                    }}
                                >
                                    <span>{algo.title}</span>
                                    {algo.badge ? (
                                        <Box
                                            component="span"
                                            sx={{
                                                px: 0.7,
                                                py: 0.1,
                                                borderRadius: 1,
                                                fontSize: '0.62rem',
                                                fontWeight: 600,
                                                color: accent,
                                                border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                                background: isDarkMode ? 'rgba(0, 233, 255, 0.08)' : 'rgba(30, 64, 175, 0.08)',
                                            }}
                                        >
                                            {algo.badge}
                                        </Box>
                                    ) : null}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 1, lineHeight: 1.55 }}>
                        {selectedAlgo.hint}
                    </Typography>
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography className="quick-settings-label">مخفی کردن متن حمایت</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 0.35, lineHeight: 1.55 }}>
                                نشان‌دهنده فعال بودن افزونه
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: supportHide ? muted : accent,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {supportHide ? 'مخفی شده' : 'در حال نمایش'}
                            </Typography>
                            <Switch
                                size="small"
                                checked={supportHide}
                                onChange={(event) => onSupportChange(event.target.checked)}
                                data-settings-switch="true"
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'مخفی کردن متن حمایت' }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box className="quick-settings-card" sx={{ background: cardBg, borderColor: cardBorder }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                                <Typography className="quick-settings-label">چینش دستی</Typography>
                                <Box
                                    component="span"
                                    sx={{
                                        px: 0.7,
                                        py: 0.1,
                                        borderRadius: 1,
                                        fontSize: '0.62rem',
                                        fontWeight: 600,
                                        color: isDarkMode ? '#ffb74d' : '#ef6c00',
                                        border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.45)' : 'rgba(239, 108, 0, 0.35)'}`,
                                        background: isDarkMode ? 'rgba(255, 152, 0, 0.12)' : 'rgba(255, 152, 0, 0.1)',
                                    }}
                                >
                                    آزمایشی
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, lineHeight: 1.55 }}>
                                راست‌چین یا چپ‌چین کردن متن در هر سایت
                            </Typography>
                        </Box>

                        {hasTabsPermission === true ? (
                            <Switch
                                size="small"
                                checked={manualEnabled}
                                onChange={(event) => {
                                    onManualRtlSettingsChange({
                                        ...manualRtlSettings,
                                        manualRtlEnabled: event.target.checked,
                                    });
                                }}
                                sx={switchSx}
                                inputProps={{ 'aria-label': 'راست‌چین دستی' }}
                            />
                        ) : (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openOptions('manual-rtl')}
                                sx={{
                                    flexShrink: 0,
                                    fontSize: '0.7rem',
                                    fontFamily: 'iranyekan',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    px: 1,
                                    py: 0.25,
                                    minWidth: 0,
                                    borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.5)' : 'rgba(30, 64, 175, 0.5)',
                                    color: accent,
                                    '&:hover': {
                                        borderColor: accent,
                                        backgroundColor: selectedBg,
                                        transform: 'none',
                                    },
                                }}
                            >
                                فعال‌سازی
                            </Button>
                        )}
                    </Box>

                    {hasTabsPermission !== false && (
                        <Typography
                            sx={{
                                mt: 1,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: manualEnabled ? accent : muted,
                            }}
                        >
                            {manualEnabled ? 'فعال' : 'غیرفعال'}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default QuickSettings;
