import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    SvgIcon,
} from '@mui/material';
import {
    mdiWhatsapp,
    mdiFacebook,
    mdiLinkedin,
    mdiEmailOutline,
    mdiContentCopy,
    mdiShareVariant,
    mdiCheck,
    mdiInstagram,
} from '@mdi/js';
import {
    EXTENSION_SHARE_URL,
    getSocialShareTargets,
    shareExtension,
} from '../utils/storeLinks';
import { useI18n } from '../i18n';

const TELEGRAM_ICON_PATH =
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z';

// Official X (Twitter) mark scaled for 24x24 viewBox
const X_ICON_PATH =
    'M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44186 3H3.19995L10.0767 13.0074L3.19995 21H4.75369L10.7665 14.0113L15.5685 21H20.8104L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.69681L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.3033L11.5541 13.096V13.0956Z';

const SHARE_ICONS: Record<string, string> = {
    telegram: TELEGRAM_ICON_PATH,
    whatsapp: mdiWhatsapp,
    twitter: X_ICON_PATH,
    instagram: mdiInstagram,
    facebook: mdiFacebook,
    linkedin: mdiLinkedin,
    email: mdiEmailOutline,
};

interface ShareTarget {
    id: string;
    label: string;
    href: string;
    color: string;
    action?: 'open' | 'copy-and-open';
}

interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, isDarkMode }) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [copied, setCopied] = React.useState(false);
    const [nativeShared, setNativeShared] = React.useState(false);
    const shareText = t('share.text');
    const targets = React.useMemo(
        () => getSocialShareTargets({
            telegram: t('share.telegram'),
            whatsapp: t('share.whatsapp'),
            twitter: t('share.twitter'),
            instagram: t('share.instagram'),
            facebook: t('share.facebook'),
            linkedin: t('share.linkedin'),
            email: t('share.email'),
        }, shareText) as ShareTarget[],
        [t, shareText],
    );
    const canNativeShare =
        typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    React.useEffect(() => {
        if (!open) {
            setCopied(false);
            setNativeShared(false);
        }
    }, [open]);

    const handleCopy = async () => {
        const result = await shareExtension({ preferNative: false, shareText });
        if (result === 'copied') {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        }
    };

    const handleNativeShare = async () => {
        const result = await shareExtension({ preferNative: true, shareText });
        if (result === 'shared') {
            setNativeShared(true);
            window.setTimeout(() => setNativeShared(false), 1800);
        }
    };

    const openTarget = async (target: ShareTarget) => {
        if (target.action === 'copy-and-open') {
            await shareExtension({ preferNative: false, shareText });
        }
        window.open(target.href, '_blank', 'noopener,noreferrer');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            className="popup-share-dialog"
            PaperProps={{ className: 'popup-share-dialog-paper' }}
            sx={{
                '& .MuiDialog-paper': {
                    backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                },
            }}
        >
            <DialogTitle
                className="popup-share-title"
                sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '16px 16px 8px 16px',
                    fontFamily: 'iranyekan',
                }}
            >
                {t('share.title')}
            </DialogTitle>
            <DialogContent className="popup-share-content" sx={{ padding: '8px 16px 4px' }}>
                <Typography
                    variant="body2"
                    className="popup-share-desc"
                    sx={{
                        mb: 1.5,
                        color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(30,41,59,0.75)',
                        lineHeight: 1.7,
                        fontSize: '0.8rem',
                    }}
                >
                    {t('share.description')}
                </Typography>

                <div className="popup-share-grid">
                    {targets.map((target) => (
                        <button
                            key={target.id}
                            type="button"
                            className={`popup-share-item popup-share-item-${target.id}`}
                            onClick={() => void openTarget(target)}
                            aria-label={target.label}
                        >
                            <span
                                className="popup-share-item-icon"
                                style={{ backgroundColor: target.color }}
                            >
                                <SvgIcon viewBox="0 0 24 24">
                                    <path d={SHARE_ICONS[target.id] || mdiShareVariant} />
                                </SvgIcon>
                            </span>
                            <span className="popup-share-item-label">{target.label}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        className="popup-share-item popup-share-item-copy"
                        onClick={() => void handleCopy()}
                        aria-label={t('share.copyLink')}
                    >
                        <span
                            className="popup-share-item-icon"
                            style={{ backgroundColor: copied ? '#16a34a' : '#64748b' }}
                        >
                            <SvgIcon viewBox="0 0 24 24">
                                <path d={copied ? mdiCheck : mdiContentCopy} />
                            </SvgIcon>
                        </span>
                        <span className="popup-share-item-label">
                            {copied ? t('share.copied') : t('share.copyLink')}
                        </span>
                    </button>

                    {canNativeShare && (
                        <button
                            type="button"
                            className="popup-share-item popup-share-item-native"
                            onClick={() => void handleNativeShare()}
                            aria-label={t('share.nativeShare')}
                        >
                            <span
                                className="popup-share-item-icon"
                                style={{ backgroundColor: nativeShared ? '#16a34a' : '#0ea5e9' }}
                            >
                                <SvgIcon viewBox="0 0 24 24">
                                    <path d={nativeShared ? mdiCheck : mdiShareVariant} />
                                </SvgIcon>
                            </span>
                            <span className="popup-share-item-label">
                                {nativeShared ? t('share.sent') : t('share.more')}
                            </span>
                        </button>
                    )}
                </div>

                <Typography
                    variant="caption"
                    className="popup-share-preview"
                    sx={{
                        display: 'block',
                        mt: 1.5,
                        color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.5)',
                        lineHeight: 1.6,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.68rem',
                    }}
                >
                    {`${shareText}\n${EXTENSION_SHARE_URL}`}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ padding: '8px 16px 16px 16px' }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: isDarkMode ? '#00e9ff' : '#1e40af',
                        fontFamily: 'iranyekan',
                    }}
                >
                    {t('share.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareModal;
