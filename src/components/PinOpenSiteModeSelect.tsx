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
    getPinOpenSiteModeOptions,
    PinOpenSiteMode,
} from '../utils/pinOpenSite';

interface PinOpenSiteModeSelectProps {
    value: PinOpenSiteMode;
    onChange: (mode: PinOpenSiteMode) => void;
    isDarkMode: boolean;
}

const PinOpenSiteModeSelect: React.FC<PinOpenSiteModeSelectProps> = ({
    value,
    onChange,
    isDarkMode,
}) => {
    const options = getPinOpenSiteModeOptions();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [infoModeId, setInfoModeId] = React.useState<PinOpenSiteMode | null>(null);
    const accent = isDarkMode ? '#00e9ff' : '#1e40af';
    const muted = isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.55)';
    const fieldBg = isDarkMode ? 'rgba(26, 26, 46, 0.7)' : '#f8fafc';
    const cardBorder = isDarkMode ? 'rgba(0, 233, 255, 0.12)' : 'rgba(30, 64, 175, 0.12)';
    const selectedBg = isDarkMode ? 'rgba(0, 233, 255, 0.1)' : 'rgba(30, 64, 175, 0.08)';
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
            <FormControl size="small" sx={{ minWidth: '7.5rem', width: 'max-content', flexShrink: 0 }}>
                <Select
                    dir="rtl"
                    open={menuOpen}
                    onOpen={() => setMenuOpen(true)}
                    onClose={() => setMenuOpen(false)}
                    className="quick-settings-select"
                    value={options.some((option) => option.id === value) ? value : 'off'}
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
                        minWidth: '7.5rem',
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
                        '& .MuiSelect-select': {
                            whiteSpace: 'nowrap',
                        },
                        '& .MuiSelect-icon': {
                            color: muted,
                        },
                    }}
                    inputProps={{ 'aria-label': 'نمایش سایت باز در بالای لیست' }}
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
                                        aria-label={`توضیح ${mode.title}`}
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
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PinOpenSiteModeSelect;
