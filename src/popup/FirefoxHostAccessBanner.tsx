import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { getMissingHostPermissions } from '../utils/firefoxHostAccess';

interface FirefoxHostAccessBannerProps {
    isDarkMode: boolean;
    placement?: 'popup' | 'settings';
}

interface PermissionChangeEvent {
    addListener: (callback: () => void) => void;
    removeListener: (callback: () => void) => void;
}

const FirefoxHostAccessBanner: React.FC<FirefoxHostAccessBannerProps> = ({
    isDarkMode,
    placement = 'popup',
}) => {
    const [missingOrigins, setMissingOrigins] = React.useState<string[]>([]);
    const [ready, setReady] = React.useState(false);
    const [requesting, setRequesting] = React.useState(false);
    const [denied, setDenied] = React.useState(false);
    const missingRef = React.useRef<string[]>([]);
    const accent = isDarkMode ? '#00e9ff' : '#1c39bb';

    const refresh = React.useCallback(async () => {
        if (!isFirefoxRuntime()) {
            setMissingOrigins([]);
            setReady(true);
            return;
        }
        const missing = await getMissingHostPermissions();
        missingRef.current = missing;
        setMissingOrigins(missing);
        setReady(true);
    }, []);

    React.useEffect(() => {
        void refresh();
        const onAdded = chrome.permissions?.onAdded as unknown as PermissionChangeEvent | undefined;
        const onRemoved = chrome.permissions?.onRemoved as unknown as PermissionChangeEvent | undefined;
        if (!onAdded?.addListener || !onRemoved?.addListener) {
            return undefined;
        }
        const onChange = () => {
            void refresh();
        };
        onAdded.addListener(onChange);
        onRemoved.addListener(onChange);
        return () => {
            onAdded.removeListener(onChange);
            onRemoved.removeListener(onChange);
        };
    }, [refresh]);

    const handleOpenSettings = () => {
        const optionsUrl = chrome.runtime.getURL('options.html#firefox-access');
        chrome.tabs.query({ url: chrome.runtime.getURL('options.html*') }, (tabs) => {
            void chrome.runtime.lastError;
            const existing = tabs?.[0];
            if (existing?.id != null) {
                chrome.tabs.update(existing.id, { url: optionsUrl, active: true });
                if (existing.windowId != null) {
                    chrome.windows.update(existing.windowId, { focused: true });
                }
            } else {
                chrome.tabs.create({ url: optionsUrl });
            }
            window.close();
        });
    };

    const handleActivate = () => {
        const origins = missingRef.current;
        if (!origins.length || requesting) {
            return;
        }
        setRequesting(true);
        setDenied(false);
        // Must start inside the click. Awaiting first drops Firefox's user gesture.
        chrome.permissions.request({ origins }).then((granted) => {
            if (granted) {
                missingRef.current = [];
                setMissingOrigins([]);
                setDenied(false);
                return;
            }
            setDenied(true);
        }).catch(() => {
            setDenied(true);
        }).finally(() => {
            setRequesting(false);
        });
    };

    if (!isFirefoxRuntime() || !ready || missingOrigins.length === 0) {
        return null;
    }

    return (
        <Box
            id="firefox-access"
            sx={{
                mx: placement === 'popup' ? 2 : 0,
                mt: placement === 'popup' ? 1.5 : 0,
                mb: placement === 'popup' ? 0.5 : 3,
                p: placement === 'popup' ? 1.5 : 2,
                borderRadius: 1.5,
                background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.12) 0%, rgba(0, 233, 255, 0.04) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(30, 64, 175, 0.04) 100%)',
                border: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.35)'
                    : '1px solid rgba(30, 64, 175, 0.25)',
            }}
        >
            <Typography
                sx={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    fontFamily: 'iranyekan',
                    color: accent,
                    mb: 0.6,
                }}
            >
                فعال‌سازی دائمی در فایرفاکس
            </Typography>
            <Typography
                sx={{
                    fontSize: '0.8rem',
                    fontWeight: 400,
                    fontFamily: 'iranyekan',
                    lineHeight: 1.7,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.82)' : 'rgba(0, 0, 0, 0.75)',
                    mb: 1,
                }}
            >
                {placement === 'popup'
                    ? 'برای اینکه افزونه همیشه فعال بماند، از صفحه تنظیمات یک‌بار دسترسی سایت‌ها را تأیید کنید.'
                    : 'با یک تأیید، افزونه روی سایت‌های پشتیبانی‌شده همیشه فعال می‌ماند و لازم نیست هر بار روی آیکون بزنید.'}
            </Typography>
            {denied && (
                <Typography
                    sx={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        fontFamily: 'iranyekan',
                        lineHeight: 1.7,
                        color: isDarkMode ? '#ffcc80' : '#e65100',
                        mb: 1,
                    }}
                >
                    تأیید انجام نشد. دوباره بزنید و در پنجره فایرفاکس Allow را انتخاب کنید.
                </Typography>
            )}
            <Button
                type="button"
                variant="contained"
                size="small"
                disabled={placement === 'settings' && requesting}
                onClick={placement === 'popup' ? handleOpenSettings : handleActivate}
                sx={{
                    fontFamily: 'iranyekan',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px !important',
                }}
            >
                {placement === 'popup'
                    ? 'رفتن به تنظیمات'
                    : requesting
                        ? 'در حال درخواست دسترسی...'
                        : 'فعال‌سازی دائمی'}
            </Button>
        </Box>
    );
};

export default FirefoxHostAccessBanner;
