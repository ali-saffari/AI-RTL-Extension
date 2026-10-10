import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, SvgIcon, Typography } from '@mui/material';
import { mdiPower } from '@mdi/js';
import { DYNAMIC_SERVICES } from '../constants/dynamicServices';
import { sendRuntimeMessage } from '../utils/chromeMessaging.js';
import { hasServicePermissions } from '../utils/hasHostPermission';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { services } from './list';
import { useI18n } from '../i18n';

const VISIBLE_ICON_LIMIT = 12;
const EDGE_BLOCKED_SERVICE_KEYS = new Set(['copilot', 'm365']);

/** Icons shown first in the banner (order = priority). */
const ICON_PRIORITY_KEYS = [
    'copilot',
    'duckai',
    'googleNotebook',
    'cursor',
    'googleLabs',
    'arena',
    'youtube',
    'youtubeStudio',
    'meta',
   
];

/** Keep these out of the first visible icons when possible. */
const ICON_LOW_PRIORITY_KEYS = [
    'm365',
    'businessGemini',
];

/** Sites that need permission mainly because their URL changed. */
const ADDRESS_CHANGED_KEYS = new Set([
    'copilot',
    'duckai',
    'googleNotebook',
    'notion',
    'arena',
]);

const toPersianDigits = (value: number) => value.toLocaleString('fa-IR');

function getPermissionReason(service: (typeof services)[number]): 'address' | 'new' {
    if (ADDRESS_CHANGED_KEYS.has(service.key)) {
        return 'address';
    }
    return 'new';
}

function getAllowButtonText(t: (key: 'shared.allowFa' | 'shared.allowAr' | 'shared.allowEn') => string) {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    if (langCode === 'fa') {
        return t('shared.allowFa');
    }
    if (langCode === 'ar') {
        return t('shared.allowAr');
    }
    return t('shared.allowEn');
}

function getIconPriorityRank(key: string) {
    const high = ICON_PRIORITY_KEYS.indexOf(key);
    if (high !== -1) {
        return high;
    }
    const low = ICON_LOW_PRIORITY_KEYS.indexOf(key);
    if (low !== -1) {
        return 10000 + low;
    }
    return 1000;
}

interface MissingPermissionBannerProps {
    isDarkMode: boolean;
}

const MissingPermissionBanner: React.FC<MissingPermissionBannerProps> = ({ isDarkMode }) => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const [missingServices, setMissingServices] = useState<typeof services>([]);
    const [enablingAll, setEnablingAll] = useState(false);
    const [whyOpen, setWhyOpen] = useState(false);
    const [enableOpen, setEnableOpen] = useState(false);
    const isEdge = navigator.userAgent.indexOf('Edg') > -1;
    const allowButtonText = getAllowButtonText(t);

    const refreshMissing = useCallback(async () => {
        if (isFirefoxRuntime()) {
            setMissingServices([]);
            return;
        }

        const missing = [];
        for (const service of services) {
            if (isEdge && EDGE_BLOCKED_SERVICE_KEYS.has(service.key)) {
                continue;
            }
            const dynamic = DYNAMIC_SERVICES[service.key as keyof typeof DYNAMIC_SERVICES];
            if (!dynamic?.origins) {
                continue;
            }
            if (!(await hasServicePermissions(dynamic.origins))) {
                missing.push(service);
            }
        }
        setMissingServices(missing);
    }, [isEdge]);

    useEffect(() => {
        void refreshMissing();
        const onPermissionChange = () => {
            void refreshMissing();
        };
        const onAdded = chrome.permissions?.onAdded as unknown as chrome.events.Event<() => void> | undefined;
        const onRemoved = chrome.permissions?.onRemoved as unknown as chrome.events.Event<() => void> | undefined;
        try {
            onAdded?.addListener(onPermissionChange);
            onRemoved?.addListener(onPermissionChange);
        } catch {
            // Ignore browsers without permission events
        }
        return () => {
            try {
                onAdded?.removeListener(onPermissionChange);
                onRemoved?.removeListener(onPermissionChange);
            } catch {
                // Ignore
            }
        };
    }, [refreshMissing]);

    const enableAll = async () => {
        if (!missingServices.length || enablingAll) {
            return;
        }

        setEnablingAll(true);
        try {
            const response = await sendRuntimeMessage({
                action: 'requestPermissionsAndEnableServices',
                serviceKeys: missingServices.map((service) => service.key),
            });

            if (response?.success) {
                setMissingServices([]);
                setEnableOpen(false);
            } else if (response?.granted === false) {
                alert(t('missingPermission.permissionDenied'));
            } else if (response) {
                alert(response?.error || t('missingPermission.permissionError'));
            }
        } catch {
            alert(t('missingPermission.permissionError'));
        } finally {
            setEnablingAll(false);
        }
    };

    if (!missingServices.length) {
        return null;
    }

    const sortedForIcons = [...missingServices].sort((a, b) => {
        const rankDiff = getIconPriorityRank(a.key) - getIconPriorityRank(b.key);
        if (rankDiff !== 0) {
            return rankDiff;
        }
        return missingServices.indexOf(a) - missingServices.indexOf(b);
    });
    const visibleServices = sortedForIcons.slice(0, VISIBLE_ICON_LIMIT);
    const remainingCount = missingServices.length - visibleServices.length;

    return (
        <Box
            dir={dir}
            sx={{
                position: 'relative',
                zIndex: 0,
                isolation: 'isolate',
                px: 1.5,
                py: 1.25,
                background: isDarkMode
                    ? 'linear-gradient(90deg, rgba(0, 233, 255, 0.14) 0%, rgba(20, 28, 48, 0.95) 45%, rgba(0, 103, 165, 0.22) 100%)'
                    : 'linear-gradient(90deg, #dbeafe 0%, #eff6ff 50%, #e0f2fe 100%)',
                borderTop: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.28)' : 'rgba(0, 103, 165, 0.18)'}`,
                borderBottom: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.28)' : 'rgba(0, 103, 165, 0.18)'}`,
            }}
            style={{ direction: dir }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 1 }}>
                <SvgIcon sx={{ fontSize: '1.05rem', color: isDarkMode ? '#00e9ff' : '#0067A5' }}>
                    <path d={mdiPower} />
                </SvgIcon>
                <Typography
                    sx={{
                        fontFamily: 'iranyekan',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        lineHeight: 1.6,
                        color: isDarkMode ? '#ffffff' : '#0f172a',
                    }}
                >
                    {t('missingPermission.title')}
                </Typography>
            </Box>

            <Box
                dir="ltr"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    mb: 1.1,
                }}
                style={{ direction: 'ltr' }}
            >
                {remainingCount > 0 && (
                    <Typography
                        component="span"
                        dir="ltr"
                        sx={{
                            fontFamily: 'iranyekan',
                            fontSize: '0.88rem',
                            fontWeight: 400,
                            color: isDarkMode ? '#00e9ff' : '#0067A5',
                            whiteSpace: 'nowrap',
                            lineHeight: 1,
                            pointerEvents: 'none',
                            flexShrink: 0,
                        }}
                    >
                        {toPersianDigits(remainingCount)}+
                    </Typography>
                )}
                <Box
                    dir="ltr"
                    component="div"
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        position: 'relative',
                        zIndex: 0,
                        isolation: 'isolate',
                        pointerEvents: 'none',
                        lineHeight: 0,
                    }}
                    style={{ direction: 'ltr' }}
                >
                    {visibleServices.map((service, index) => (
                        <Avatar
                            key={service.key}
                            alt={service.name}
                            src={chrome.runtime.getURL(service.icon)}
                            variant="circular"
                            imgProps={{ draggable: false }}
                            style={{
                                width: 28,
                                height: 28,
                                marginLeft: index === 0 ? 0 : -8,
                                zIndex: visibleServices.length - index,
                                border: isDarkMode
                                    ? '1px solid rgba(160, 160, 170, 0.75)'
                                    : '1px solid rgba(120, 120, 130, 0.6)',
                                boxShadow: 'none',
                                backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                boxSizing: 'border-box',
                                flexShrink: 0,
                                pointerEvents: 'none',
                                cursor: 'default',
                            }}
                            sx={{
                                width: 28,
                                height: 28,
                                flexShrink: 0,
                                pointerEvents: 'none',
                                '&:hover': {
                                    transform: 'none',
                                    filter: 'none',
                                    opacity: 1,
                                },
                                '& img': {
                                    pointerEvents: 'none',
                                },
                            }}
                        />
                    ))}
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    direction: dir,
                }}
            >
                <Box
                    component="button"
                    type="button"
                    onClick={() => setWhyOpen(true)}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        p: 0,
                        border: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'iranyekan',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isDarkMode ? '#00e9ff' : '#0067A5',
                        textDecoration: 'none',
                    }}
                >
                    {t('missingPermission.why')}
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    disabled={enablingAll}
                    onClick={() => setEnableOpen(true)}
                    sx={{
                        flexShrink: 0,
                        minWidth: 0,
                        px: 1.25,
                        py: 0.45,
                        fontFamily: 'iranyekan',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        lineHeight: 1.4,
                        borderRadius: 1.25,
                        boxShadow: 'none',
                        backgroundColor: isDarkMode ? '#00e9ff' : '#0067A5',
                        color: isDarkMode ? '#0b1220' : '#ffffff',
                        '&:hover': {
                            backgroundColor: isDarkMode ? '#7df4ff' : '#005589',
                            boxShadow: 'none',
                        },
                    }}
                >
                    {t('missingPermission.enableAll')}
                </Button>
            </Box>

            <Dialog
                open={enableOpen}
                onClose={() => !enablingAll && setEnableOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    zIndex: 1600,
                    '& .MuiDialog-paper': {
                        padding: '8px',
                        direction: dir,
                        maxHeight: '85vh',
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
                        color: isDarkMode ? '#00e9ff' : '#0067A5',
                    }}
                >
                    {t('missingPermission.enableTitle')}
                </DialogTitle>
                <DialogContent
                    style={{ direction: dir, padding: '8px 16px' }}
                    sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 2,
                            pb: 1.25,
                            mb: 1,
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)'}`,
                        }}
                    >
                        <Typography
                            style={{ textAlign: dir === 'rtl' ? 'justify' : 'left' }}
                            sx={{
                                fontSize: '0.82rem',
                                fontFamily: 'iranyekan',
                                fontWeight: 500,
                                lineHeight: 1.9,
                                mb: 1,
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.96)' : '#0f172a',
                            }}
                        >
                            {t('missingPermission.enableSteps', { allow: allowButtonText })}
                        </Typography>
                        <Typography
                            style={{ textAlign: dir === 'rtl' ? 'justify' : 'left' }}
                            sx={{
                                fontSize: '0.82rem',
                                fontFamily: 'iranyekan',
                                fontWeight: 500,
                                lineHeight: 1.9,
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.96)' : '#0f172a',
                            }}
                        >
                            {t('missingPermission.enablePurpose')}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 1,
                            overflowY: 'auto',
                            minHeight: 0,
                            flex: 1,
                            pb: 0.5,
                        }}
                    >
                        {sortedForIcons.map((service) => {
                            const reason = getPermissionReason(service);
                            const isAddressChange = reason === 'address';
                            return (
                                <Box
                                    key={service.key}
                                    dir="ltr"
                                    style={{ direction: 'ltr' }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        px: 1,
                                        py: 0.7,
                                        borderRadius: 1.25,
                                        backgroundColor: isDarkMode
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(15, 23, 42, 0.04)',
                                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)'}`,
                                    }}
                                >
                                    <Avatar
                                        alt={service.name}
                                        src={chrome.runtime.getURL(service.icon)}
                                        sx={{ width: 22, height: 22, flexShrink: 0 }}
                                    />
                                    <Typography
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            color: isDarkMode ? '#ffffff' : '#0f172a',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            textAlign: 'left',
                                        }}
                                        style={{ textAlign: 'left' }}
                                    >
                                        {service.name}
                                    </Typography>
                                    <Box
                                        component="span"
                                        sx={{
                                            flexShrink: 0,
                                            px: 0.7,
                                            py: 0.2,
                                            borderRadius: 1,
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.58rem',
                                            fontWeight: 700,
                                            lineHeight: 1.4,
                                            color: isAddressChange
                                                ? (isDarkMode ? '#ffcc80' : '#e65100')
                                                : (isDarkMode ? '#00e9ff' : '#1c39bb'),
                                            bgcolor: isAddressChange
                                                ? (isDarkMode ? 'rgba(255, 152, 0, 0.18)' : 'rgba(230, 81, 0, 0.1)')
                                                : (isDarkMode ? 'rgba(0, 233, 255, 0.14)' : 'rgba(28, 57, 187, 0.1)'),
                                            border: `1px solid ${isAddressChange
                                                ? (isDarkMode ? 'rgba(255, 152, 0, 0.35)' : 'rgba(230, 81, 0, 0.28)')
                                                : (isDarkMode ? 'rgba(0, 233, 255, 0.32)' : 'rgba(28, 57, 187, 0.28)')}`,
                                        }}
                                    >
                                        {reason === 'address' ? t('missingPermission.reasonAddress') : t('missingPermission.reasonNew')}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                    <Button
                        onClick={() => setEnableOpen(false)}
                        variant="text"
                        disabled={enablingAll}
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('missingPermission.close')}
                    </Button>
                    <Button
                        onClick={enableAll}
                        variant="contained"
                        disabled={enablingAll}
                        sx={{
                            fontFamily: 'iranyekan',
                            textTransform: 'none',
                            backgroundColor: isDarkMode ? '#00e9ff' : '#0067A5',
                            color: isDarkMode ? '#0b1220' : '#ffffff',
                            '&:hover': {
                                backgroundColor: isDarkMode ? '#7df4ff' : '#005589',
                            },
                        }}
                    >
                        {enablingAll ? t('missingPermission.requesting') : t('missingPermission.grantPermission')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={whyOpen}
                onClose={() => setWhyOpen(false)}
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
                        color: isDarkMode ? '#00e9ff' : '#0067A5',
                    }}
                >
                    {t('missingPermission.whyTitle')}
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
                        {t('missingPermission.whyBody')}
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
                        {t('missingPermission.whyQuestion')}
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
                        {t('missingPermission.whyAnswer')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px' }}>
                    <Button
                        onClick={() => setWhyOpen(false)}
                        variant="contained"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        {t('missingPermission.understood')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MissingPermissionBanner;
