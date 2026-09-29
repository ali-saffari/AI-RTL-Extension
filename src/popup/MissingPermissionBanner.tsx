import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, SvgIcon, Typography } from '@mui/material';
import { mdiPower } from '@mdi/js';
import { DYNAMIC_SERVICES } from '../constants/dynamicServices';
import { sendRuntimeMessage } from '../utils/chromeMessaging.js';
import { hasServicePermissions } from '../utils/hasHostPermission';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { services } from './list';

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
    'youtubeStudio',
    'meta',
   
];

/** Keep these out of the first visible icons when possible. */
const ICON_LOW_PRIORITY_KEYS = [
    'm365',
    'businessGemini',
];

const toPersianDigits = (value: number) => value.toLocaleString('fa-IR');

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
    const [missingServices, setMissingServices] = useState<typeof services>([]);
    const [enablingAll, setEnablingAll] = useState(false);
    const [whyOpen, setWhyOpen] = useState(false);
    const isEdge = navigator.userAgent.indexOf('Edg') > -1;

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
            } else if (response?.granted === false) {
                alert('مجوز داده نشد. لطفاً در تنظیمات افزونه مجوزها را فعال کنید.');
            } else if (response) {
                alert(response?.error || 'خطا در دریافت مجوز. لطفاً دوباره تلاش کنید.');
            }
        } catch {
            alert('خطا در دریافت مجوز. لطفاً دوباره تلاش کنید.');
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
            dir="rtl"
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
            style={{ direction: 'rtl' }}
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
                    سایت‌های جدید/آپدیت‌شده که منتظرن فعالشون کنی
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
                    direction: 'rtl',
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
                    چرا فعال نیستن؟
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    disabled={enablingAll}
                    onClick={enableAll}
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
                    {enablingAll ? '...' : 'فعال کردن همه'}
                </Button>
            </Box>

            <Dialog
                open={whyOpen}
                onClose={() => setWhyOpen(false)}
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
                    sx={{
                        direction: 'rtl',
                        textAlign: 'right',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        padding: '16px 16px 8px 16px',
                        fontFamily: 'iranyekan',
                        color: isDarkMode ? '#00e9ff' : '#0067A5',
                    }}
                >
                    چرا بعضی از سایت‌ها فعال و بعضی غیرفعال هستند؟
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
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
                        این افزونه در ابتدا فقط برای چت‌جی‌پی‌تی (ChatGPT) طراحی شده بود، اما به‌مرور زمان و بنا بر درخواست شما، وب‌سایت‌های دیگر یکی‌یکی به آن اضافه شدند. اوایل با اضافه شدن هر سایت جدید، مجوز پایه افزونه تغییر می‌کرد و مرورگر هم با هر تغییر دسترسی، افزونه را برای همه کاربران خودبه‌خود غیرفعال می‌کرد. برای جلوگیری از این مشکل و قطع نشدن دسترسی شما، تصمیم گرفتیم سایت‌های جدید را به‌صورت اختیاری بگذاریم تا هر زمان که نیاز داشتید فعال کنید.
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
                        چرا از همان اول دسترسی همه سایت‌ها (کل اینترنت) را به‌صورت یک‌جا نگرفتیم؟
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
                        من به عنوان سازنده وقتی خودم را جای کاربر می‌گذارم، از دسترسی‌های گسترده، پیش‌فرض و غیرضروری حس ناامنی می‌گیرم. باور دارم حق کاربر است که بداند دقیقاً چه دسترسی‌هایی و به چه دلیلی به یک افزونه داده می‌شود. به همین دلیل شفافیت و حفظ اعتماد شما را در اولویت گذاشتم تا کنترل کامل افزونه دست خودتان باشد.
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px' }}>
                    <Button
                        onClick={() => setWhyOpen(false)}
                        variant="contained"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        متوجه شدم
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MissingPermissionBanner;
