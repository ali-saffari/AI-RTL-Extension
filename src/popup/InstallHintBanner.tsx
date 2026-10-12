import React from 'react';
import {
    Box,
    Typography,
    Button,
    SvgIcon,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { mdiInformationOutline, mdiChevronDown, mdiOpenInNew } from '@mdi/js';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n';

interface InstallHintBannerProps {
    isDarkMode: boolean;
    onDismiss?: () => void;
    onOpenSettings?: () => void;
    variant: 'install' | 'troubleshooting' | 'notebook' | 'algorithm';
    embedded?: boolean;
}

const getTroubleshootingSteps = (t: (key: MessageKey) => string) => [
    t('installHint.step1'),
    t('installHint.step2'),
    t('installHint.step3'),
    t('installHint.step4'),
];

const InstallHintBanner: React.FC<InstallHintBannerProps> = ({
    isDarkMode,
    onDismiss,
    onOpenSettings,
    variant,
    embedded = false,
}) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const troubleshootingSteps = getTroubleshootingSteps(t);
    const [expanded, setExpanded] = React.useState(false);
    const [hideConfirmOpen, setHideConfirmOpen] = React.useState(false);
    const isInstall = variant === 'install';
    const textColor = isDarkMode
        ? 'rgba(255, 255, 255, 0.82)'
        : isInstall
            ? '#3c5d86'
            : 'rgba(0, 0, 0, 0.75)';
    const accentColor = isDarkMode
        ? '#00e9ff'
        : isInstall
            ? '#3c5d86'
            : '#387af2';
    const defaultOffNote = (
        <Typography
            sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'iranyekan',
                lineHeight: 1.7,
                color: isDarkMode ? '#ffcc80' : '#e65100',
                mb: 0.8
            }}
        >
            {t('installHint.defaultOff')}
        </Typography>
    );
    const isAlgorithm = variant === 'algorithm';
    const collapsibleTitle = variant === 'install'
        ? t('installHint.installTitle')
        : isAlgorithm
            ? t('installHint.algorithmTitle')
            : t('installHint.troubleshootingTitle');

    return (
        <Box
            className={`install-hint-banner${isAlgorithm ? ' install-hint-banner--algorithm' : ''}`}
            dir={dir}
            style={{ direction: dir, textAlign: contentAlign }}
            sx={
                isAlgorithm
                    ? {
                        width: embedded ? 'calc(100% + 16px)' : 'auto',
                        mx: embedded ? '-8px' : 2,
                        mb: embedded ? 0 : 1.5,
                        px: embedded ? '8px' : 1.25,
                        py: 0.95,
                        borderRadius: 0,
                        border: 'none',
                        background: isDarkMode
                            ? 'rgba(0, 233, 255, 0.08)'
                            : 'rgba(56, 122, 242, 0.07)',
                        boxShadow: 'none',
                        boxSizing: 'border-box',
                    }
                    : {
                        mx: embedded ? 0 : 2,
                        mb: embedded ? 0 : 1.5,
                        p: embedded ? 1.25 : 1.5,
                        borderRadius: 1.5,
                        background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.12) 0%, rgba(0, 233, 255, 0.04) 100%)'
                            : isInstall
                                ? '#e2eefc'
                                : 'linear-gradient(135deg, rgba(56, 122, 242, 0.1) 0%, rgba(56, 122, 242, 0.04) 100%)',
                        border: isDarkMode
                            ? '1px solid rgba(0, 233, 255, 0.35)'
                            : isInstall
                                ? '1px solid #3c5d86'
                                : '1px solid rgba(56, 122, 242, 0.25)',
                    }
            }
        >
            {variant === 'notebook' ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <SvgIcon
                        sx={{
                            fontSize: '1.05rem',
                            mt: '2px',
                            color: accentColor,
                            flexShrink: 0
                        }}
                    >
                        <path d={mdiInformationOutline} />
                    </SvgIcon>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'iranyekan',
                                color: accentColor,
                                mb: 0.5
                            }}
                        >
                            {t('installHint.notebookTitle')}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                fontFamily: 'iranyekan',
                                lineHeight: 1.7,
                                color: isDarkMode ? '#ffcc80' : '#e65100'
                            }}
                        >
                            {t('installHint.notebookBody')}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <>
                    <Box
                        component="button"
                        type="button"
                        dir={dir}
                        className="install-hint-banner-toggle"
                        style={{ direction: dir, textAlign: contentAlign }}
                        onClick={() => setExpanded((open) => !open)}
                    >
                        {isAlgorithm ? (
                            <>
                                <SvgIcon sx={{ fontSize: '1.1rem', color: accentColor, flexShrink: 0 }}>
                                    <path d={mdiInformationOutline} />
                                </SvgIcon>
                                <Typography
                                    className="install-hint-banner-title"
                                    style={{ direction: dir, textAlign: contentAlign }}
                                    sx={{
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        fontFamily: 'iranyekan',
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.92)' : '#0f172a',
                                    }}
                                >
                                    {collapsibleTitle}
                                </Typography>
                                <SvgIcon
                                    sx={{
                                        fontSize: '1.1rem',
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(15, 23, 42, 0.55)',
                                        flexShrink: 0,
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease',
                                    }}
                                >
                                    <path d={mdiChevronDown} />
                                </SvgIcon>
                            </>
                        ) : (
                            <>
                                <SvgIcon
                                    sx={{
                                        fontSize: '1.05rem',
                                        color: accentColor,
                                        flexShrink: 0,
                                    }}
                                >
                                    <path d={mdiInformationOutline} />
                                </SvgIcon>
                                <Typography
                                    className="install-hint-banner-title"
                                    style={{ direction: dir, textAlign: contentAlign }}
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        fontFamily: 'iranyekan',
                                        color: accentColor,
                                    }}
                                >
                                    {collapsibleTitle}
                                </Typography>
                                <SvgIcon
                                    sx={{
                                        fontSize: '1.15rem',
                                        color: accentColor,
                                        flexShrink: 0,
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease',
                                    }}
                                >
                                    <path d={mdiChevronDown} />
                                </SvgIcon>
                            </>
                        )}
                    </Box>
                    <Collapse in={expanded}>
                        <Box sx={{ mt: 1.2 }} style={{ direction: dir, textAlign: contentAlign }}>
                            {variant === 'install' ? (
                                <>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        {t('installHint.installBody1')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        {t('installHint.installBody2')}
                                    </Typography>
                                </>
                            ) : variant === 'algorithm' ? (
                                <>
                    
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        {t('installHint.algorithmBefore')}{' '}
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                onOpenSettings?.();
                                            }}
                                            sx={{
                                                display: 'inline',
                                                p: 0,
                                                m: 0,
                                                border: 0,
                                                background: 'none',
                                                cursor: 'pointer',
                                                font: 'inherit',
                                                fontWeight: 700,
                                                color: accentColor,
                                                textDecoration: 'underline',
                                                textUnderlineOffset: '3px',
                                                '&:hover': {
                                                    color: isDarkMode ? '#4dd4ff' : '#3b82f6'
                                                }
                                            }}
                                        >
                                            {t('installHint.algorithmSettings')}
                                        </Box>
                                        {' '}{t('installHint.algorithmAfter')}
                                    </Typography>
                 
                                </>
                            ) : (
                                <>
                                    {defaultOffNote}
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        {t('installHint.troubleshootingIntro')}
                                    </Typography>
                                    <Box
                                        component="ol"
                                        className="install-hint-banner-list"
                                        style={{ marginRight: '18px', paddingRight: '18px', paddingLeft: 0 }}
                                        sx={{ m: 0, mb: 0.8 }}
                                    >
                                        {troubleshootingSteps.map((step) => (
                                            <Typography
                                                key={step}
                                                component="li"
                                                sx={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 400,
                                                    fontFamily: 'iranyekan',
                                                    lineHeight: 1.7,
                                                    color: textColor,
                                                    mb: 0.35
                                                }}
                                            >
                                                {step}
                                            </Typography>
                                        ))}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: isDarkMode ? '#ffcc80' : '#e65100',
                                            mb: 0.5
                                        }}
                                    >
                                        {t('installHint.importantNote')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor
                                        }}
                                    >
                                        {t('installHint.supportNote')}
                                    </Typography>
                                </>
                            )}
                            {onDismiss && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                                    <Button
                                        size="small"
                                        onClick={() => setHideConfirmOpen(true)}
                                        sx={{
                                            fontSize: '0.75rem',
                                            fontFamily: 'iranyekan',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            minWidth: 'auto',
                                            px: 1.5,
                                            py: 0.25,
                                            borderRadius: '6px !important',
                                            color: accentColor,
                                            '&:hover': {
                                                color: isDarkMode ? '#4dd4ff' : isInstall ? '#2f4a6c' : '#3b82f6',
                                                backgroundColor: isDarkMode
                                                    ? 'rgba(0, 233, 255, 0.1)'
                                                    : isInstall
                                                        ? 'rgba(60, 93, 134, 0.12)'
                                                        : 'rgba(56, 122, 242, 0.1)'
                                            }
                                        }}
                                    >
                                        {t('installHint.understood')}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </>
            )}
            <Dialog
                open={hideConfirmOpen}
                onClose={() => setHideConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ direction: dir, textAlign: contentAlign, fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px', fontFamily: 'iranyekan' }}>
                    {t('installHint.hideTitle')}
                </DialogTitle>
                <DialogContent style={{ direction: dir, textAlign: contentAlign, padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8
                        }}
                    >
                        {t('installHint.hideQuestion')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setHideConfirmOpen(false)}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('installHint.no')}
                    </Button>
                    <Button
                        onClick={() => {
                            setHideConfirmOpen(false);
                            onDismiss?.();
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('installHint.yes')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InstallHintBanner;
