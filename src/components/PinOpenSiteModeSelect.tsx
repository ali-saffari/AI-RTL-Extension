import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    SelectChangeEvent,
    SvgIcon,
    Typography,
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';
import {
    PinOpenSiteMode,
} from '../utils/pinOpenSite';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n';

interface PinOpenSiteModeSelectProps {
    value: PinOpenSiteMode;
    onChange: (mode: PinOpenSiteMode) => void;
    isDarkMode: boolean;
    disabled?: boolean;
    controlWidth?: string;
}

type ModeOption = {
    id: PinOpenSiteMode;
    title: string;
    description: string;
    extra?: string;
};

function getModeOptions(t: (key: MessageKey, vars?: Record<string, string | number>) => string): ModeOption[] {
    const all: ModeOption[] = [
        {
            id: 'full',
            title: t('pinOpenSite.full.title'),
            description: t('pinOpenSite.full.description'),
            extra: t('pinOpenSite.full.extra'),
        },
        {
            id: 'limited',
            title: t('pinOpenSite.limited.title'),
            description: t('pinOpenSite.limited.description'),
            extra: t('pinOpenSite.limited.extra'),
        },
        {
            id: 'off',
            title: t('pinOpenSite.off.title'),
            description: '',
        },
    ];
    if (isFirefoxRuntime()) {
        return all.filter((option) => option.id !== 'limited');
    }
    return all;
}

const PinOpenSiteModeSelect: React.FC<PinOpenSiteModeSelectProps> = ({
    value,
    onChange,
    isDarkMode,
    disabled = false,
    controlWidth,
}) => {
    const { t } = useI18n();
    const options = React.useMemo(() => getModeOptions(t), [t]);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [infoModeId, setInfoModeId] = React.useState<PinOpenSiteMode | null>(null);
    const accent = isDarkMode ? '#00e9ff' : '#387af2';
    const muted = isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.55)';
    const fieldBg = isDarkMode ? 'rgba(26, 26, 46, 0.7)' : '#f8fafc';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(56, 122, 242, 0.12)';
    const selectedBg = isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(56, 122, 242, 0.08)';
    const infoMode = options.find((option) => option.id === infoModeId) ?? null;

    const handleChange = (event: SelectChangeEvent<PinOpenSiteMode>) => {
        onChange(event.target.value as PinOpenSiteMode);
    };

    const openInfo = (modeId: PinOpenSiteMode, event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuOpen(false);
        window.setTimeout(() => setInfoModeId(modeId), 0);
    };

    const renderInfoText = (text: string) => {
        const index = text.indexOf(':');
        if (index <= 0) {
            return text;
        }
        return (
            <>
                <Box component="span" sx={{ fontWeight: 600 }}>
                    {text.slice(0, index + 1)}
                </Box>
                {text.slice(index + 1)}
            </>
        );
    };

    return (
        <>
            <FormControl size="small" disabled={disabled} sx={{ minWidth: controlWidth ?? '7.5rem', width: controlWidth ?? 'max-content', maxWidth: controlWidth, flexShrink: 0 }}>
                <Select
                    dir="rtl"
                    open={disabled ? false : menuOpen}
                    onOpen={() => {
                        if (!disabled) {
                            setMenuOpen(true);
                        }
                    }}
                    onClose={() => setMenuOpen(false)}
                    className="quick-settings-select"
                    value={options.some((option) => option.id === value) ? value : 'off'}
                    disabled={disabled}
                    renderValue={(selected) =>
                        options.find((item) => item.id === selected)?.title
                        ?? options[0]?.title
                        ?? ''
                    }
                    onChange={handleChange}
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
                        width: '100%',
                        minWidth: controlWidth ?? '7.5rem',
                        fontFamily: 'iranyekan',
                        fontSize: '0.82rem',
                        backgroundColor: fieldBg,
                        color: isDarkMode ? '#ffffff' : '#1e293b',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: cardBorder,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(0, 233, 255, 0.4)' : 'rgba(56, 122, 242, 0.4)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: accent,
                            borderWidth: '1px',
                        },
                        '& .MuiSelect-select': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        },
                        '& .MuiSelect-icon': {
                            color: muted,
                        },
                    }}
                    inputProps={{ 'aria-label': t('pinOpenSite.label') }}
                >
                    {options.map((mode) => (
                        <MenuItem
                            key={mode.id}
                            value={mode.id}
                            dir="rtl"
                            sx={{
                                fontFamily: 'iranyekan',
                                fontSize: '0.82rem',
                                textAlign: 'right',
                                direction: 'rtl',
                                width: '100%',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 0.75,
                                    width: '100%',
                                }}
                            >
                                <span>{mode.title}</span>
                                {mode.description ? (
                                    <IconButton
                                        size="small"
                                        aria-label={t('pinOpenSite.infoAria', { title: mode.title })}
                                        onClick={(event) => openInfo(mode.id, event)}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }}
                                        sx={{
                                            p: 0.2,
                                            color: accent,
                                            '&:hover': {
                                                backgroundColor: selectedBg,
                                            },
                                        }}
                                    >
                                        <SvgIcon sx={{ fontSize: '1rem' }}>
                                            <path d={mdiInformationOutline} />
                                        </SvgIcon>
                                    </IconButton>
                                ) : null}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Dialog
                open={Boolean(infoMode)}
                onClose={() => setInfoModeId(null)}
                maxWidth="xs"
                fullWidth
                sx={{
                    zIndex: 1600,
                    '& .MuiDialog-paper': {
                        padding: '8px',
                        direction: 'rtl',
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: 'rtl',
                        textAlign: 'right',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                    }}
                >
                    {infoMode?.title}
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'right', padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8,
                        }}
                    >
                        {infoMode ? renderInfoText(infoMode.description) : null}
                    </Typography>
                    {infoMode?.extra ? (
                        <Typography
                            sx={{
                                fontSize: '0.8rem',
                                fontFamily: 'iranyekan',
                                lineHeight: 1.8,
                                mt: 1.25,
                                color: muted,
                            }}
                        >
                            {renderInfoText(infoMode.extra)}
                        </Typography>
                    ) : null}
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setInfoModeId(null)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('pinOpenSite.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PinOpenSiteModeSelect;
