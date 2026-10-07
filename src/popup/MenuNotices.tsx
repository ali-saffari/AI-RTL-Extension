import React from 'react';
import { Box, Typography } from '@mui/material';
import { sendRuntimeMessage } from '../utils/chromeMessaging.js';

const CACHE_KEY = 'noticeCache';
const HIDDEN_KEY = 'noticeHidden';
const SEEN_KEY = 'noticeMenuSeen';

const TONE_COLOR: Record<string, string> = {
    info: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    critical: '#dc2626',
};

const CARD_THEME: Record<string, { light: { title: string; background: string; border: string }; dark: { title: string; background: string; border: string } }> = {
    critical: {
        light: { title: '#9f1239', background: '#fff1f2', border: '#fda4af' },
        dark: { title: '#fecdd3', background: '#3a1d22', border: '#fb7185' },
    },
    warning: {
        light: { title: '#92400e', background: '#fffbeb', border: '#fcd34d' },
        dark: { title: '#fde68a', background: '#3a2a12', border: '#fbbf24' },
    },
    success: {
        light: { title: '#065f46', background: '#ecfdf5', border: '#6ee7b7' },
        dark: { title: '#a7f3d0', background: '#10281f', border: '#34d399' },
    },
};

const claimedViews = new Set<string>();

interface NoticeAction {
    key?: string;
    label?: string;
    url?: string;
    style?: string;
    color?: string | null;
}

interface MenuNotice {
    id: string;
    type?: string;
    tone?: string;
    title?: string;
    body?: string;
    image_url?: string;
    image_width?: string | null;
    image_height?: string | null;
    image_position?: string;
    dismissible?: boolean;
    once_per_user?: boolean;
    dismiss_style?: string;
    dismiss_color?: string | null;
    actions_place?: string;
    actions_top?: string | null;
    actions_right?: string | null;
    actions_bottom?: string | null;
    actions_left?: string | null;
    card_padding_top?: string | null;
    card_padding_right?: string | null;
    card_padding_bottom?: string | null;
    card_padding_left?: string | null;
    actions?: NoticeAction[];
}

interface NoticeCache {
    fetchedAt?: string | number;
    notices?: MenuNotice[];
}

interface HiddenRow {
    fetchedAt?: string | number;
    ids?: string[];
}

function noticeStamp(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    if (typeof value === 'string' && value.trim()) return value;
    return '';
}

function safeUrl(value: unknown) {
    try {
        const url = new URL(String(value || ''));
        if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch {
        return '';
    }
    return '';
}

function isMenuNotice(notice: MenuNotice) {
    return notice.type === 'menu' || notice.type === 'in_app';
}

function seenArea() {
    return chrome.storage.session ?? chrome.storage.local;
}

async function claimViews(fetchedAt: string | number, ids: string[]) {
    const area = seenArea();
    const stored = await area.get(SEEN_KEY);
    const row = stored[SEEN_KEY] as HiddenRow | undefined;
    const seen = row?.fetchedAt === fetchedAt && Array.isArray(row.ids) ? row.ids : [];
    const fresh = ids.filter((id) => {
        const key = `${fetchedAt}:${id}`;
        return !seen.includes(id) && !claimedViews.has(key);
    });
    fresh.forEach((id) => claimedViews.add(`${fetchedAt}:${id}`));
    if (!fresh.length) return;
    try {
        await area.set({ [SEEN_KEY]: { fetchedAt, ids: [...seen, ...fresh] } });
    } catch {
        fresh.forEach((id) => claimedViews.delete(`${fetchedAt}:${id}`));
        return;
    }
    fresh.forEach((id) => {
        sendRuntimeMessage({ type: 'notices:action', id, action: 'view' });
    });
}

async function hideNotice(fetchedAt: string | number, id: string) {
    const stored = await chrome.storage.local.get(HIDDEN_KEY);
    const row = stored[HIDDEN_KEY] as HiddenRow | undefined;
    const ids = row?.fetchedAt === fetchedAt && Array.isArray(row.ids) ? row.ids : [];
    if (!ids.includes(id)) ids.push(id);
    await chrome.storage.local.set({ [HIDDEN_KEY]: { fetchedAt, ids } });
}

function imageLength(value: unknown) {
    const next = String(value || '').replace(/\s+/g, '').toLowerCase();
    const match = next.match(/^(\d{1,4}(?:\.\d{1,2})?)(px|%|rem|em|vw|vh)$/);
    if (!match) return '';
    const amount = Number(match[1]);
    const unit = match[2];
    const max = unit === 'px' ? 800 : unit === 'rem' || unit === 'em' ? 40 : 100;
    if (!Number.isFinite(amount) || amount <= 0 || amount > max) return '';
    return `${amount}${unit}`;
}

function boxLength(value: unknown) {
    const next = String(value || '').replace(/\s+/g, '').toLowerCase();
    const match = next.match(/^(\d{1,4}(?:\.\d{1,2})?)(px|%|rem|em|vw|vh)$/);
    if (!match) return '';
    const amount = Number(match[1]);
    const unit = match[2];
    const max = unit === 'px' ? 800 : unit === 'rem' || unit === 'em' ? 40 : 100;
    if (!Number.isFinite(amount) || amount < 0 || amount > max) return '';
    return `${amount}${unit}`;
}

function floatActionStyle(notice: MenuNotice): React.CSSProperties {
    const top = boxLength(notice.actions_top);
    const right = boxLength(notice.actions_right);
    const bottom = boxLength(notice.actions_bottom);
    const left = boxLength(notice.actions_left);
    return {
        position: 'absolute',
        zIndex: 2,
        marginTop: 0,
        top: top || 'auto',
        bottom: bottom || (!top ? '8px' : 'auto'),
        left: !left && !right ? '8px' : left || 'auto',
        right: !left && !right ? '8px' : right || 'auto',
    };
}

function floatPadStyle(notice: MenuNotice, reserveBottom: boolean): React.CSSProperties {
    const top = boxLength(notice.card_padding_top);
    const right = boxLength(notice.card_padding_right);
    const bottom = boxLength(notice.card_padding_bottom);
    const left = boxLength(notice.card_padding_left);
    if (!top && !right && !bottom && !left) return reserveBottom ? { paddingBottom: 46 } : {};
    return {
        paddingTop: top || '10px',
        paddingRight: right || '10px',
        paddingBottom: bottom || '10px',
        paddingLeft: left || '10px',
    };
}

function buttonColor(value: unknown) {
    const next = String(value || '').trim();
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(next) ? next : '';
}

function contrastText(color: string) {
    const hex = color.slice(1);
    const full = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
    const red = parseInt(full.slice(0, 2), 16);
    const green = parseInt(full.slice(2, 4), 16);
    const blue = parseInt(full.slice(4, 6), 16);
    return (red * 299 + green * 587 + blue * 114) / 1000 > 160 ? '#111827' : '#ffffff';
}

function buttonPaint(color: unknown): React.CSSProperties | undefined {
    const next = buttonColor(color);
    if (!next) return undefined;
    return { background: next, color: contrastText(next) };
}

function openUrl(url: string) {
    if (chrome.tabs?.create) {
        chrome.tabs.create({ url });
        return;
    }
    window.open(url, '_blank', 'noopener');
}

interface MenuNoticesProps {
    isDarkMode: boolean;
}

const MenuNotices: React.FC<MenuNoticesProps> = ({ isDarkMode }) => {
    const [items, setItems] = React.useState<MenuNotice[]>([]);
    const [fetchedAt, setFetchedAt] = React.useState<string | number>('');

    const reload = React.useCallback(async () => {
        const stored = await chrome.storage.local.get([CACHE_KEY, HIDDEN_KEY]);
        const cache = stored[CACHE_KEY] as NoticeCache | undefined;
        const at = noticeStamp(cache?.fetchedAt);
        const hiddenRow = stored[HIDDEN_KEY] as HiddenRow | undefined;
        const hidden = new Set(
            at !== '' && hiddenRow?.fetchedAt === at && Array.isArray(hiddenRow.ids) ? hiddenRow.ids : [],
        );
        const rawNotices = cache?.notices;
        const notices = Array.isArray(rawNotices) ? rawNotices : [];
        const menu = notices.filter((notice) => notice?.id && isMenuNotice(notice) && !hidden.has(notice.id)).slice(0, 1);
        setFetchedAt(at);
        setItems(menu);
        if (at && menu.length) await claimViews(at, menu.map((notice) => notice.id));
    }, []);

    React.useEffect(() => {
        void reload();
        const onChange = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
            if (area === 'local' && (changes[CACHE_KEY] || changes[HIDDEN_KEY])) void reload();
        };
        chrome.storage.onChanged.addListener(onChange);
        return () => chrome.storage.onChanged.removeListener(onChange);
    }, [reload]);

    const dismiss = async (notice: MenuNotice) => {
        if (!fetchedAt) return;
        setItems((current) => current.filter((item) => item.id !== notice.id));
        await hideNotice(fetchedAt, notice.id);
        sendRuntimeMessage({ type: 'notices:action', id: notice.id, action: 'dismiss' });
    };

    const activate = async (notice: MenuNotice, action: NoticeAction) => {
        if (!fetchedAt || !action.key) return;
        const url = safeUrl(action.url);
        if (url) openUrl(url);
        setItems((current) => current.filter((item) => item.id !== notice.id));
        await hideNotice(fetchedAt, notice.id);
        sendRuntimeMessage({ type: 'notices:action', id: notice.id, action: action.key });
    };

    if (!items.length) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 1.5, pt: 1.5 }}>
            {items.map((notice) => {
                const theme = CARD_THEME[notice.tone || ''];
                const themePaint = theme ? (isDarkMode ? theme.dark : theme.light) : null;
                const imageUrl = safeUrl(notice.image_url);
                const imageWidth = imageLength(notice.image_width);
                const imageHeight = imageLength(notice.image_height);
                const imageSized = Boolean(imageWidth || imageHeight);
                const closeable = Boolean(notice.dismissible) && notice.once_per_user !== false;
                const floatPlace = notice.actions_place === 'float';
                const hasActionRow = Boolean(notice.actions?.length || (closeable && notice.dismiss_style !== 'icon'));
                const floatActions = floatPlace && hasActionRow;
                const imagePlace = notice.image_position === 'above_title' || notice.image_position === 'below_title' || notice.image_position === 'right' ? notice.image_position : 'below_body';
                const imageOnRight = imagePlace === 'right' && Boolean(imageUrl);
                const sideWidth = imageWidth || '72px';
                const imageNode = imageUrl && imagePlace !== 'right' ? (
                    <Box
                        component="img"
                        src={imageUrl}
                        alt=""
                        sx={{
                            display: 'block',
                            width: imageWidth || '100%',
                            height: imageHeight || 'auto',
                            maxWidth: '100%',
                            maxHeight: imageSized ? 'none' : 72,
                            objectFit: imageSized ? 'contain' : 'cover',
                            borderRadius: 1,
                            mt: imagePlace === 'above_title' ? 0 : 1,
                            mb: imagePlace === 'below_body' ? 0 : 1,
                        }}
                    />
                ) : null;
                const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.92)' : '#111827';
                const titleColor = themePaint?.title ?? textColor;
                const mutedColor = isDarkMode ? 'rgba(255, 255, 255, 0.72)' : '#374151';
                return (
                    <Box
                        key={notice.id}
                        component="article"
                        className={`menu-notice${closeable && notice.dismiss_style === 'icon' ? ' has-dismiss-icon' : ''}${floatActions ? ' has-float-actions' : ''}`}
                        dir="rtl"
                        style={{ direction: 'rtl', textAlign: 'right', padding: '10px', ...(floatPlace ? { position: 'relative', ...floatPadStyle(notice, hasActionRow) } : {}) }}
                        sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            width: '100%',
                            boxSizing: 'border-box',
                            background: themePaint?.background ?? (isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                            border: themePaint ? `1px solid ${themePaint.border}` : `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e5e7eb'}`,
                            boxShadow: isDarkMode ? 'none' : '0 6px 16px rgba(15, 23, 42, 0.06)',
                        }}
                    >
                        {imageOnRight ? (
                            <div style={{ display: 'flex', direction: 'rtl', alignItems: 'center', gap: 8 }}>
                                <img
                                    src={imageUrl}
                                    alt=""
                                    style={{
                                        display: 'block',
                                        width: sideWidth,
                                        height: imageHeight || 'auto',
                                        maxWidth: sideWidth,
                                        flex: '0 0 auto',
                                        alignSelf: 'center',
                                        objectFit: 'contain',
                                        borderRadius: 4,
                                    }}
                                />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    {notice.title ? (
                                        <Typography style={{ direction: 'rtl', textAlign: 'right' }} sx={{ fontFamily: 'iranyekan', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.6, color: titleColor }}>
                                            {notice.title}
                                        </Typography>
                                    ) : null}
                                    {notice.body ? (
                                        <Typography style={{ direction: 'rtl', textAlign: 'right' }} sx={{ fontFamily: 'iranyekan', fontSize: '0.78rem', lineHeight: 1.7, color: mutedColor, whiteSpace: 'pre-wrap', mt: notice.title ? 0.4 : 0 }}>
                                            {notice.body}
                                        </Typography>
                                    ) : null}
                                </div>
                            </div>
                        ) : imagePlace === 'above_title' ? imageNode : null}
                        {imageOnRight ? null : notice.title ? (
                            <Typography style={{ direction: 'rtl', textAlign: 'right' }} sx={{ fontFamily: 'iranyekan', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.6, color: titleColor }}>
                                {notice.title}
                            </Typography>
                        ) : null}
                        {imagePlace === 'below_title' ? imageNode : null}
                        {imageOnRight || !notice.body ? null : (
                            <Typography style={{ direction: 'rtl', textAlign: 'right' }} sx={{ fontFamily: 'iranyekan', fontSize: '0.78rem', lineHeight: 1.7, color: mutedColor, whiteSpace: 'pre-wrap', mt: notice.title ? 0.4 : 0 }}>
                                {notice.body}
                            </Typography>
                        )}
                        {imagePlace === 'below_body' ? imageNode : null}
                        {(notice.actions?.length || (closeable && notice.dismiss_style !== 'icon')) ? (
                            <Box className={`menu-notice-actions${floatActions ? ' is-float' : ''}`} style={{ direction: 'rtl', textAlign: 'right', ...(floatActions ? floatActionStyle(notice) : {}) }} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.75, mt: floatActions ? 0 : 1 }}>
                                {(notice.actions || []).map((action) => (
                                    <Box
                                        key={action.key || action.label}
                                        component="button"
                                        type="button"
                                        onClick={() => { void activate(notice, action); }}
                                        style={buttonPaint(action.color)}
                                        sx={{
                                            border: 0,
                                            borderRadius: 1,
                                            px: 1,
                                            py: 0.4,
                                            cursor: 'pointer',
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.75rem',
                                            background: action.style === 'secondary' ? (isDarkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6') : TONE_COLOR.info,
                                            color: action.style === 'secondary' ? textColor : '#fff',
                                        }}
                                    >
                                        {action.label || action.key}
                                    </Box>
                                ))}
                                {closeable && notice.dismiss_style !== 'icon' ? (
                                    <Box
                                        component="button"
                                        type="button"
                                        className="menu-notice-close"
                                        onClick={() => { void dismiss(notice); }}
                                        style={buttonPaint(notice.dismiss_color)}
                                        sx={{
                                            border: 0,
                                            borderRadius: 1,
                                            px: 1,
                                            py: 0.4,
                                            cursor: 'pointer',
                                            fontFamily: 'iranyekan',
                                            fontSize: '0.75rem',
                                            background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                                            color: textColor,
                                        }}
                                    >
                                        بستن
                                    </Box>
                                ) : null}
                            </Box>
                        ) : null}
                        {closeable && notice.dismiss_style === 'icon' ? (
                            <Box
                                component="button"
                                type="button"
                                className="menu-notice-dismiss-icon"
                                aria-label="بستن"
                                onClick={() => { void dismiss(notice); }}
                                style={buttonColor(notice.dismiss_color) ? { color: buttonColor(notice.dismiss_color) } : undefined}
                            >
                                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                                    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </Box>
                        ) : null}
                    </Box>
                );
            })}
        </Box>
    );
};

export default MenuNotices;
