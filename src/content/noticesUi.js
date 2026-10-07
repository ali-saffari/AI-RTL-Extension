import { sendRuntimeMessage } from '../utils/chromeMessaging.js';

const CACHE_KEY = 'noticeCache';
const HIDDEN_KEY = 'noticeHidden';
const HOST_ID = 'ai-rtl-notices-root';

const TONE_COLOR = {
    info: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    critical: '#dc2626',
};

function buttonColor(value) {
    const next = String(value || '').trim();
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(next) ? next : '';
}

function contrastText(color) {
    const hex = color.slice(1);
    const full = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
    const red = parseInt(full.slice(0, 2), 16);
    const green = parseInt(full.slice(2, 4), 16);
    const blue = parseInt(full.slice(4, 6), 16);
    return (red * 299 + green * 587 + blue * 114) / 1000 > 160 ? '#111827' : '#fff';
}

function paintButton(button, color) {
    const next = buttonColor(color);
    if (!next) return;
    button.style.background = next;
    button.style.color = contrastText(next);
}

function imageLength(value) {
    const next = String(value || '').replace(/\s+/g, '').toLowerCase();
    const match = next.match(/^(\d{1,4}(?:\.\d{1,2})?)(px|%|rem|em|vw|vh)$/);
    if (!match) return '';
    const amount = Number(match[1]);
    const unit = match[2];
    const max = unit === 'px' ? 800 : unit === 'rem' || unit === 'em' ? 40 : 100;
    if (!Number.isFinite(amount) || amount <= 0 || amount > max) return '';
    return `${amount}${unit}`;
}

function boxLength(value) {
    const next = String(value || '').replace(/\s+/g, '').toLowerCase();
    const match = next.match(/^(\d{1,4}(?:\.\d{1,2})?)(px|%|rem|em|vw|vh)$/);
    if (!match) return '';
    const amount = Number(match[1]);
    const unit = match[2];
    const max = unit === 'px' ? 800 : unit === 'rem' || unit === 'em' ? 40 : 100;
    if (!Number.isFinite(amount) || amount < 0 || amount > max) return '';
    return `${amount}${unit}`;
}

function applyFloatActions(actions, notice) {
    const top = boxLength(notice.actions_top);
    const right = boxLength(notice.actions_right);
    const bottom = boxLength(notice.actions_bottom);
    const left = boxLength(notice.actions_left);
    actions.style.position = 'absolute';
    actions.style.zIndex = '2';
    actions.style.marginTop = '0';
    actions.style.top = top || 'auto';
    actions.style.bottom = bottom || (!top ? '8px' : 'auto');
    if (!left && !right) {
        actions.style.left = '8px';
        actions.style.right = '8px';
    } else {
        actions.style.left = left || 'auto';
        actions.style.right = right || 'auto';
    }
}

function applyCardPadding(wrap, notice, kind, hasButtons) {
    const top = boxLength(notice.card_padding_top);
    const right = boxLength(notice.card_padding_right);
    const bottom = boxLength(notice.card_padding_bottom);
    const left = boxLength(notice.card_padding_left);
    if (!top && !right && !bottom && !left) {
        if (hasButtons) wrap.style.paddingBottom = kind === 'banner' ? '48px' : '64px';
        return;
    }
    const fallback = kind === 'banner'
        ? { top: '10px', right: '12px', bottom: '10px', left: '12px' }
        : { top: '16px', right: '16px', bottom: '16px', left: '16px' };
    wrap.style.paddingTop = top || fallback.top;
    wrap.style.paddingRight = right || fallback.right;
    wrap.style.paddingBottom = bottom || fallback.bottom;
    wrap.style.paddingLeft = left || fallback.left;
}

function applyImageSize(image, notice, banner) {
    const width = imageLength(notice.image_width);
    const height = imageLength(notice.image_height);
    if (!width && !height) return;
    image.style.objectFit = 'contain';
    image.style.maxWidth = '100%';
    image.style.maxHeight = 'none';
    if (width) image.style.width = width;
    if (height) {
        image.style.height = height;
        image.style.alignSelf = 'center';
    }
    if (banner && width) image.style.flex = `0 0 ${width}`;
}

function closeIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3.5 3.5l9 9M12.5 3.5l-9 9');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.6');
    path.setAttribute('stroke-linecap', 'round');
    svg.append(path);
    return svg;
}

function safeUrl(value) {
    try {
        const url = new URL(String(value || ''));
        if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch {
        return '';
    }
    return '';
}

function rememberView(fetchedAt, id) {
    const key = `ai-rtl-notice-viewed:${fetchedAt}`;
    let seen = [];
    try {
        seen = JSON.parse(sessionStorage.getItem(key) || '[]');
    } catch {
        seen = [];
    }
    if (seen.includes(id)) return false;
    seen.push(id);
    sessionStorage.setItem(key, JSON.stringify(seen));
    return true;
}

async function hiddenIds(fetchedAt) {
    const stored = await chrome.storage.local.get(HIDDEN_KEY);
    const row = stored[HIDDEN_KEY];
    if (!row || row.fetchedAt !== fetchedAt) return new Set();
    return new Set(row.ids || []);
}

async function hideNotice(fetchedAt, id) {
    const ids = await hiddenIds(fetchedAt);
    ids.add(id);
    await chrome.storage.local.set({
        [HIDDEN_KEY]: { fetchedAt, ids: [...ids] },
    });
}

function removeHost() {
    document.getElementById(HOST_ID)?.remove();
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
}

function imagePlace(notice) {
    return notice?.image_position === 'above_title' || notice?.image_position === 'below_title' ? notice.image_position : 'below_body';
}

function pagePlacement(type) {
    if (type === 'popup') return 'popup';
    if (type === 'banner' || type === 'toast') return 'banner';
    return '';
}

function showClose(notice) {
    return Boolean(notice?.dismissible) && notice?.once_per_user !== false;
}

function renderNotice(notice, fetchedAt, parent) {
    const type = pagePlacement(notice.type);
    if (!type) return;
    const toneKey = TONE_COLOR[notice.tone] ? notice.tone : 'info';
    const wrap = el('article', toneKey === 'info' ? `notice notice-${type}` : `notice notice-${type} tone-${toneKey}`);

    if (type === 'popup') {
        const backdrop = el('button', 'backdrop');
        backdrop.type = 'button';
        backdrop.setAttribute('aria-label', 'بستن');
        if (showClose(notice)) {
            backdrop.addEventListener('click', () => dismiss(notice, fetchedAt));
        }
        parent.append(backdrop);
    }

    const titleText = typeof notice.title === 'string' ? notice.title.trim() : '';
    const title = titleText ? el('h2', 'title', titleText) : null;
    const body = el('p', 'body', notice.body || '');
    const imageUrl = safeUrl(notice.image_url);
    const image = imageUrl ? document.createElement('img') : null;
    if (image) {
        image.className = 'image';
        image.alt = '';
        image.src = imageUrl;
        applyImageSize(image, notice, type === 'banner');
    }

    const actions = document.createElement('div');
    actions.className = 'actions';
    (notice.actions || []).forEach((action) => {
        const button = el('button', `action action-${action.style === 'secondary' ? 'secondary' : 'primary'}`, action.label || action.key);
        button.type = 'button';
        paintButton(button, action.color);
        button.addEventListener('click', () => activate(notice, action, fetchedAt));
        actions.append(button);
    });
    if (showClose(notice) && notice.dismiss_style === 'icon') {
        const close = el('button', 'dismiss-icon');
        close.type = 'button';
        close.setAttribute('aria-label', 'بستن');
        close.append(closeIcon());
        const iconColor = buttonColor(notice.dismiss_color);
        if (iconColor) close.style.color = iconColor;
        close.addEventListener('click', () => dismiss(notice, fetchedAt));
        wrap.append(close);
    } else if (showClose(notice)) {
        const close = el('button', 'close', 'بستن');
        close.type = 'button';
        paintButton(close, notice.dismiss_color);
        close.addEventListener('click', () => dismiss(notice, fetchedAt));
        actions.append(close);
    }
    if (notice.actions_place === 'float') {
        if (actions.childNodes.length) {
            actions.classList.add('actions-float');
            applyFloatActions(actions, notice);
        }
        wrap.classList.add('has-float-actions');
        applyCardPadding(wrap, notice, type, actions.childNodes.length > 0);
    }
    if (type === 'banner' && image) {
        const main = el('div', 'banner-main');
        const copy = el('div', 'copy');
        const side = el('div', 'banner-side');
        const sideWidth = imageLength(notice.image_width) || '88px';
        side.style.flex = `0 0 ${sideWidth}`;
        side.style.width = sideWidth;
        image.style.flex = 'none';
        image.style.width = '100%';
        image.style.maxWidth = '100%';
        image.style.alignSelf = 'auto';
        image.style.height = imageLength(notice.image_height) || '100%';
        image.style.maxHeight = '100%';
        image.style.objectFit = 'contain';
        image.style.objectPosition = 'center';
        side.append(image);
        if (title) copy.append(title);
        copy.append(body);
        if (actions.childNodes.length) copy.append(actions);
        main.append(side, copy);
        wrap.append(main);
    } else {
        const place = imagePlace(notice);
        if (image) image.classList.add(`image-${place.replaceAll('_', '-')}`);
        if (place === 'above_title' && image) wrap.append(image);
        if (title) wrap.append(title);
        if (place === 'below_title' && image) wrap.append(image);
        wrap.append(body);
        if (place === 'below_body' && image) wrap.append(image);
        if (actions.childNodes.length) wrap.append(actions);
    }
    parent.append(wrap);

    if (rememberView(fetchedAt, notice.id)) {
        sendRuntimeMessage({ type: 'notices:action', id: notice.id, action: 'view' });
    }
}

async function dismiss(notice, fetchedAt) {
    await hideNotice(fetchedAt, notice.id);
    sendRuntimeMessage({ type: 'notices:action', id: notice.id, action: 'dismiss' });
    await paintSoon();
}

async function activate(notice, action, fetchedAt) {
    const url = safeUrl(action.url);
    if (url) window.open(url, '_blank', 'noopener');
    await hideNotice(fetchedAt, notice.id);
    sendRuntimeMessage({ type: 'notices:action', id: notice.id, action: action.key });
    await paintSoon();
}

async function paint(isActivePage) {
    if (!isActivePage()) {
        removeHost();
        return;
    }
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cache = stored[CACHE_KEY];
    const notices = Array.isArray(cache?.notices) ? cache.notices : [];
    const hidden = await hiddenIds(cache?.fetchedAt);
    const popupWinner = notices.find((notice) => pagePlacement(notice?.type) === 'popup');
    const bannerWinner = notices.find((notice) => pagePlacement(notice?.type) === 'banner');
    const popup = popupWinner && !hidden.has(popupWinner.id) ? popupWinner : null;
    const banners = bannerWinner && !hidden.has(bannerWinner.id) ? [bannerWinner] : [];
    removeHost();
    if (!popup && !banners.length) return;

    const host = document.createElement('div');
    host.id = HOST_ID;
    host.style.setProperty('all', 'initial', 'important');
    host.style.setProperty('position', 'fixed', 'important');
    host.style.setProperty('z-index', '2147483647', 'important');
    host.style.setProperty('pointer-events', 'none', 'important');
    host.style.setProperty('transform', 'none', 'important');
    host.style.setProperty('overflow', 'visible', 'important');
    if (popup) {
        host.style.setProperty('inset', '0', 'important');
    } else {
        host.style.setProperty('top', '12px', 'important');
        host.style.setProperty('right', '12px', 'important');
        host.style.setProperty('width', 'min(420px, calc(100vw - 24px))', 'important');
    }
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
        :host { all: initial; }
        .backdrop, .notice, button { font-family: IRANYekanX, Tahoma, sans-serif; pointer-events: auto; }
        .backdrop {
            position: fixed;
            inset: 0;
            z-index: 2147483646;
            border: 0;
            background: rgba(15, 23, 42, 0.45);
            cursor: pointer;
        }
        .notice {
            position: fixed;
            z-index: 2147483647;
            direction: rtl;
            box-sizing: border-box;
            max-width: min(420px, calc(100vw - 32px));
            padding: 16px;
            border-radius: 16px;
            background: #fff;
            color: #111827;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
        }
        .notice-popup { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .stack {
            position: fixed;
            z-index: 2147483647;
            top: 12px;
            right: 12px;
            width: min(420px, calc(100vw - 24px));
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            pointer-events: none;
        }
        .stack .notice {
            position: relative;
            width: 100%;
            max-width: none;
            padding: 10px 12px;
            pointer-events: auto;
        }
        .stack .title {
            font-size: 13px;
            margin-bottom: 4px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .stack .body {
            font-size: 12px;
            line-height: 1.6;
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .stack .banner-main {
            display: flex;
            direction: rtl;
            align-items: stretch;
            gap: 10px;
        }
        .stack .copy { flex: 1; min-width: 0; }
        .stack .banner-side {
            display: flex;
            align-items: center;
            justify-content: center;
            align-self: stretch;
            flex: 0 0 88px;
            width: 88px;
            min-height: 0;
        }
        .stack .banner-side .image {
            display: block;
            width: 100%;
            height: 100%;
            max-height: 100%;
            margin: 0;
            flex: none;
            object-fit: contain;
            object-position: center;
            border-radius: 0;
        }
        .stack .actions { margin-top: 8px; justify-content: flex-end; }
        .stack .close { margin-right: 0; }
        .stack button { padding: 5px 8px; font-size: 12px; }
        .title { margin: 0 0 8px; font-size: 16px; line-height: 1.6; }
        .body { margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: #374151; }
        .image { display: block; width: 100%; max-height: 160px; object-fit: cover; margin-top: 12px; border-radius: 12px; }
        .image.image-above-title { margin-top: 0; margin-bottom: 12px; }
        .image.image-below-title { margin-top: 8px; margin-bottom: 8px; }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .actions.actions-float, .stack .actions.actions-float {
            position: absolute;
            z-index: 2;
            margin-top: 0;
        }
        .close { margin-right: auto; }
        .dismiss-icon,
        .stack .dismiss-icon {
            position: absolute;
            top: 7px;
            left: 7px;
            z-index: 2;
            width: auto;
            height: auto;
            min-width: 0;
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            line-height: 0;
        }
        button { border: 0; border-radius: 10px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
        .action-primary { background: #2563eb; color: #fff; }
        .action-secondary, .close { background: #f3f4f6; color: #111827; }
        .notice.tone-critical { background: #fff1f2; border: 1px solid #fda4af; }
        .notice.tone-critical .title { color: #9f1239; }
        .notice.tone-warning { background: #fffbeb; border: 1px solid #fcd34d; }
        .notice.tone-warning .title { color: #92400e; }
        .notice.tone-success { background: #ecfdf5; border: 1px solid #6ee7b7; }
        .notice.tone-success .title { color: #065f46; }
        @media (prefers-color-scheme: dark) {
            .backdrop { background: rgba(0, 0, 0, 0.62); }
            .notice {
                background: #202124;
                color: #e8eaed;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .body { color: #bdc1c6; }
            .action-secondary, .close { background: #3c4043; color: #e8eaed; }
            .dismiss-icon, .stack .dismiss-icon { background: transparent; color: #bdc1c6; }
            .notice.tone-critical { background: #3a1d22; border-color: #fb7185; }
            .notice.tone-critical .title { color: #fecdd3; }
            .notice.tone-warning { background: #3a2a12; border-color: #fbbf24; }
            .notice.tone-warning .title { color: #fde68a; }
            .notice.tone-success { background: #10281f; border-color: #34d399; }
            .notice.tone-success .title { color: #a7f3d0; }
        }
    `;
    shadow.append(style);
    if (popup) renderNotice(popup, cache.fetchedAt, shadow);
    if (banners.length) {
        const stack = el('div', 'stack');
        banners.forEach((notice) => renderNotice(notice, cache.fetchedAt, stack));
        shadow.append(stack);
    }
    document.documentElement.append(host);
}

let painting = false;
let activePage = () => false;

async function paintSoon() {
    if (painting) return;
    painting = true;
    try {
        await paint(activePage);
    } catch {
        removeHost();
    } finally {
        painting = false;
    }
}

export function startNoticeUi(isActivePage) {
    activePage = isActivePage;
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && (changes[CACHE_KEY] || changes[HIDDEN_KEY])) paintSoon();
    });
    paintSoon();
    if (isActivePage()) sendRuntimeMessage({ type: 'notices:maybe' });
}
