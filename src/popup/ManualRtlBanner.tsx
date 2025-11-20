import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    SvgIcon,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { mdiCog } from '@mdi/js';

interface TextSelectorSettings {
    enabled: 'enabled' | 'allowed_sites' | 'disabled';
    highlightMode: 'disabled' | 'on_selection' | 'on_direction_change';
    highlightColor: string;
    highlightOpacity: number;
    logoDisplay: 'always' | 'on_hover' | 'disabled';
    manualRtlEnabled?: boolean;
    manualRtlSiteMode?: 'all' | 'ai_sites' | 'allowed_sites' | 'ai_and_allowed';
    menuDisplayMode?: 'logo_first' | 'menu_direct';
}

interface ManualRtlBannerProps {
    isDarkMode: boolean;
    manualRtlSettings: TextSelectorSettings;
    onManualRtlSettingsChange: (settings: TextSelectorSettings) => void;
}

const ManualRtlBanner: React.FC<ManualRtlBannerProps> = ({
    isDarkMode,
    manualRtlSettings,
    onManualRtlSettingsChange
}) => {
    const statusText = React.useMemo(() => {
        if (manualRtlSettings.enabled === 'disabled') {
            return 'غیرفعال';
        }
        if (manualRtlSettings.enabled === 'enabled') {
            switch (manualRtlSettings.manualRtlSiteMode) {
                case 'all':
                    return 'فعال برای همه سایت‌ها';
                case 'ai_sites':
                    return 'فعال برای سایت‌های هوش مصنوعی';
                case 'allowed_sites':
                    return 'فعال برای سایت‌های مجاز';
                case 'ai_and_allowed':
                    return (
                        <>
                            فعال برای هوش مصنوعی‌ها<br />
                            و سایت‌های مجاز
                        </>
                    );
                default:
                    return 'فعال';
            }
        }
        if (manualRtlSettings.enabled === 'allowed_sites') {
            return 'فعال برای سایت‌های مجاز';
        }
        return 'غیرفعال';
    }, [manualRtlSettings.enabled, manualRtlSettings.manualRtlSiteMode]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        onManualRtlSettingsChange({
            ...manualRtlSettings,
            enabled: isChecked ? 'enabled' : 'disabled',
            manualRtlEnabled: isChecked
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 1.2,
                borderRadius: 1,
                background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.1) 0%, rgba(0, 233, 255, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.03) 100%)',
                border: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.3)'
                    : '1px solid rgba(30, 64, 175, 0.2)',
                mx: 2
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img
                        src={chrome.runtime.getURL('/images/p logo 100.png')}
                        alt="Manual RTL"
                        style={{
                            width: 20,
                            height: 20
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: '0.7rem',
                            fontWeight: 400,
                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                            fontFamily: 'iranyekan'
                        }}
                    >
                        راست چین دستی
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: manualRtlSettings.enabled === 'enabled' && manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                ? '0.55rem'
                                : '0.65rem',
                            fontWeight: 400,
                            color: manualRtlSettings.enabled === 'disabled'
                                ? (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
                                : (isDarkMode ? '#4caf50' : '#2e7d32'),
                            fontFamily: 'iranyekan',
                            lineHeight: manualRtlSettings.enabled === 'enabled' && manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                ? 1.3
                                : 1.5,
                            whiteSpace: manualRtlSettings.enabled === 'enabled' && manualRtlSettings.manualRtlSiteMode === 'ai_and_allowed'
                                ? 'normal'
                                : 'nowrap'
                        }}
                    >
                        {statusText}
                    </Typography>
                    <a
                        href={chrome.runtime.getURL('options.html#manual-rtl')}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                p: 0.5,
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                '&:hover': {
                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.1)'
                                }
                            }}
                        >
                            <SvgIcon sx={{ fontSize: '1rem' }}>
                                <path d={mdiCog} />
                            </SvgIcon>
                        </IconButton>
                    </a>
                </Box>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    height: 1,
                    backgroundColor: isDarkMode ? 'rgba(0, 233, 255, 0.2)' : 'rgba(30, 64, 175, 0.2)'
                }}
            />

            <Box
                sx={{
                    borderTop: isDarkMode
                        ? '1px solid rgba(0, 233, 255, 0.3)'
                        : '1px solid rgba(30, 64, 175, 0.2)'
                }}
            >
                <FormControlLabel
                    sx={{
                        pt: 1,
                        pb: 0.5,
                        m: 0,
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between'
                    }}
                    control={
                        <Checkbox
                            checked={manualRtlSettings.manualRtlEnabled !== false && manualRtlSettings.enabled !== 'disabled'}
                            onChange={handleCheckboxChange}
                            sx={{
                                p: 0,
                                color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                '&.Mui-checked': {
                                    color: isDarkMode ? '#00e9ff' : '#1c39bb'
                                }
                            }}
                        />
                    }
                    label={
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                color: isDarkMode ? '#ffffff' : '#1e293b',
                                fontFamily: 'iranyekan'
                            }}
                        >
                            برای این سایت فعال شود ؟
                        </Typography>
                    }
                    labelPlacement="start"
                />
            </Box>
        </Box>
    );
};

export default ManualRtlBanner;

