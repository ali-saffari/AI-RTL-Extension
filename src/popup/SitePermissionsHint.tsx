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

interface SitePermissionsHintProps {
    visible: boolean;
    isDarkMode: boolean;
}

const STORAGE_KEY = 'sitePermissionsHintDismissed';

const SitePermissionsHint: React.FC<SitePermissionsHintProps> = ({
    visible,
    isDarkMode,
}) => {
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
                    dir="rtl"
                    className="site-permissions-hint-button"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    onClick={() => setModalOpen(true)}
                    aria-label="چرا بعضی از سایت‌ها فعال و بعضی غیرفعال هستند؟"
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
                        backgroundColor: isDarkMode
                            ? 'rgba(26, 26, 46, 0.42)'
                            : 'rgba(224, 242, 254, 0.42)',
                        borderTop: isDarkMode
                            ? '1px solid rgba(0, 233, 255, 0.4)'
                            : '1px solid rgba(30, 64, 175, 0.28)',
                        boxShadow: 'none',
                        transition: 'background-color 0.28s ease',
                        '&:hover': {
                            backgroundColor: isDarkMode ? '#1a1a2e' : '#e0f2fe',
                        },
                    }}
                >
                    <SvgIcon sx={{ fontSize: '1.15rem', color: accent, flexShrink: 0 }}>
                        <path d={mdiInformationOutline} />
                    </SvgIcon>
                    <Typography
                        style={{ direction: 'rtl', textAlign: 'right' }}
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
                        چرا بعضی از سایت‌ها فعال و بعضی غیرفعال هستند؟
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
                    چرا بعضی از سایت‌ها فعال و بعضی غیرفعال هستند؟
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.82rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.9,
                            mb: 1.5,
                            color: muted,
                        }}
                    >
                        این افزونه در ابتدا فقط برای چت‌جی‌پی‌تی (ChatGPT) طراحی شده بود، اما به‌مرور زمان و بنا بر درخواست شما، وب‌سایت‌های دیگر یکی‌یکی به آن اضافه شدند. اوایل با اضافه شدن هر سایت جدید، مجوز پایه افزونه تغییر می‌کرد و مرورگر هم با هر تغییر دسترسی، افزونه را برای همه کاربران خودبه‌خود غیرفعال می‌کرد. برای جلوگیری از این مشکل و قطع نشدن دسترسی شما، تصمیم گرفتیم سایت‌های جدید را به‌صورت اختیاری بگذاریم تا هر زمان که نیاز داشتید، فقط برای همان سایت مجوز بدهید.
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            fontWeight: 700,
                            lineHeight: 1.9,
                            mb: 1,
                            color: isDarkMode ? '#ffffff' : '#1e293b',
                        }}
                    >
                        چرا از همان اول دسترسی همه سایت‌ها را به‌صورت یک‌جا نگرفتیم؟
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.82rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.9,
                            color: muted,
                        }}
                    >
                        من به عنوان سازنده وقتی خودم را جای کاربر می‌گذارم، از دسترسی‌های گسترده، پیش‌فرض و غیرضروری حس ناامنی می‌گیرم. باور دارم حق کاربر است که بداند دقیقاً چه دسترسی‌هایی و به چه دلیلی به یک افزونه داده می‌شود. به همین دلیل شفافیت و حفظ اعتماد شما را در اولویت گذاشتم تا کنترل کامل افزونه دست خودتان باشد.
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={handleDontShowAgain}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        دیگر نشانم نده
                    </Button>
                    <Button
                        onClick={() => setModalOpen(false)}
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

export default SitePermissionsHint;
