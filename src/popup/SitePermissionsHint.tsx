import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    SvgIcon,
    Typography,
} from '@mui/material';
import { mdiChevronLeft, mdiInformationOutline } from '@mdi/js';
import { useI18n } from '../i18n';

interface SitePermissionsHintProps {
    visible: boolean;
    isDarkMode: boolean;
}

const STORAGE_KEY = 'sitePermissionsHintDismissed';

const SitePermissionsHint: React.FC<SitePermissionsHintProps> = ({
    visible,
    isDarkMode,
}) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [modalOpen, setModalOpen] = React.useState(false);
    const [dismissed, setDismissed] = React.useState(false);
    const [storageReady, setStorageReady] = React.useState(false);
    const accent = isDarkMode ? '#00e9ff' : '#1e40af';
    const muted = isDarkMode ? 'rgba(255, 255, 255, 0.78)' : 'rgba(30, 41, 59, 0.82)';
    const shown = visible && storageReady && !dismissed;

    React.useEffect(() => {
        try {
            chrome.storage.sync.get([STORAGE_KEY], (result) => {
                setDismissed(result[STORAGE_KEY] === true);
                setStorageReady(true);
            });
        } catch {
            setStorageReady(true);
        }
    }, []);

    const handleDontShowAgain = () => {
        setDismissed(true);
        setModalOpen(false);
        try {
            chrome.storage.sync.set({ [STORAGE_KEY]: true });
        } catch {
            // Silently handle save errors
        }
    };

    React.useEffect(() => {
        const inner = document.querySelector('.popup-main-inner');
        if (!inner) {
            return;
        }
        inner.classList.toggle('has-site-permissions-hint', shown);
        return () => {
            inner.classList.remove('has-site-permissions-hint');
        };
    }, [shown]);

    return (
        <>
            <Box
                className="site-permissions-hint"
                sx={{
                    position: 'fixed',
                    left: 0,
                    bottom: 0,
                    width: 378,
                    zIndex: 12,
                    pointerEvents: shown ? 'auto' : 'none',
                    transform: shown ? 'translateY(0)' : 'translateY(110%)',
                    opacity: shown ? 1 : 0,
                    transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease',
                }}
            >
                <Box
                    component="button"
                    type="button"
                    dir={dir}
                    className="site-permissions-hint-button"
               
                    onClick={() => setModalOpen(true)}
                    aria-label={t('sitePermissions.button')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        m: 0,
                        px: 1.5,
                        py: 1.15,
                        border: 0,
                        cursor: 'pointer',
                        font: 'inherit',
                        color: 'inherit',
                        backgroundColor: isDarkMode ? '#1a1a2e' : '#eef3ff',
                        borderTop: isDarkMode
                            ? '1px solid rgba(0, 233, 255, 0.4)'
                            : '1px solid rgba(30, 64, 175, 0.28)',
                        boxShadow: 'none',
                        transition: 'background-color 0.28s ease',
                        '&:hover': {
                            backgroundColor: isDarkMode ? '#22223a' : '#bae6fd',
                        },
                    }}
                >
                    <SvgIcon sx={{ fontSize: '1.15rem', color: accent, flexShrink: 0 }}>
                        <path d={mdiInformationOutline} />
                    </SvgIcon>
                    <Typography
                        style={{ direction: dir, textAlign: contentAlign }}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            fontFamily: 'iranyekan',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            lineHeight: 1.6,
                            color: isDarkMode ? '#ffffff' : '#1e293b',
                        }}
                    >
                        {t('sitePermissions.title')}
                    </Typography>
                    <SvgIcon sx={{ fontSize: '1.05rem', color: accent, flexShrink: 0 }}>
                        <path d={mdiChevronLeft} />
                    </SvgIcon>
                </Box>
            </Box>

            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    zIndex: 1600,
                    '& .MuiDialog-paper': {
                        padding: '8px',
                        direction: dir,
                    },
                }}
            >
                <DialogTitle
                    style={{
                        direction: dir,
                        textAlign: contentAlign,
                        fontFamily: 'iranyekan',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        padding: '16px 16px 8px 16px',
                    }}
                    sx={{
                        color: accent,
                    }}
                >
                    {t('sitePermissions.title')}
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: dir === 'rtl' ? 'justify' : 'left', padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.88rem',
                            fontFamily: 'iranyekan',
                            fontWeight: 500,
                            lineHeight: 2,
                            mb: 1.5,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.96)' : '#0f172a',
                        }}
                    >
                        {t('sitePermissions.body')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.9rem',
                            fontFamily: 'iranyekan',
                            fontWeight: 700,
                            lineHeight: 1.9,
                            mb: 1,
                            color: isDarkMode ? '#7df4ff' : '#005589',
                        }}
                    >
                        {t('sitePermissions.question')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.88rem',
                            fontFamily: 'iranyekan',
                            fontWeight: 500,
                            lineHeight: 2,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.96)' : '#0f172a',
                        }}
                    >
                        {t('sitePermissions.answer')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={handleDontShowAgain}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('sitePermissions.dontShow')}
                    </Button>
                    <Button
                        onClick={() => setModalOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('sitePermissions.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SitePermissionsHint;
