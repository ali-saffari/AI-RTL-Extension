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

function renderNotice(notice, fetchedAt, shadow) {
    const tone = TONE_COLOR[notice.tone] || TONE_COLOR.info;
    const type = notice.type === 'popup' || notice.type === 'banner' || notice.type === 'toast'
        ? notice.type
        : 'in_app';
    const wrap = el('article', `notice notice-${type}`);
    wrap.style.setProperty('--tone', tone);

    if (type === 'popup') {
        const backdrop = el('button', 'backdrop');
        backdrop.type = 'button';
        backdrop.setAttribute('aria-label', 'بستن');
        if (notice.dismissible) {
            backdrop.addEventListener('click', () => dismiss(notice, fetchedAt));
        }
        shadow.append(backdrop);
    }

    const title = el('h2', 'title', notice.title || '');
    const body = el('p', 'body', notice.body || '');
    wrap.append(title, body);

    const imageUrl = safeUrl(notice.image_url);
    if (imageUrl) {
        const image = document.createElement('img');
        image.className = 'image';
        image.alt = '';
        image.src = imageUrl;
        wrap.append(image);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';
    (notice.actions || []).forEach((action) => {
        const button = el('button', `action action-${action.style === 'secondary' ? 'secondary' : 'primary'}`, action.label || action.key);
        button.type = 'button';
        button.addEventListener('click', () => activate(notice, action, fetchedAt));
        actions.append(button);
    });
    if (notice.dismissible) {
        const close = el('button', 'close', 'بستن');
        close.type = 'button';
        close.addEventListener('click', () => dismiss(notice, fetchedAt));
        actions.append(close);
    }
    if (actions.childNodes.length) wrap.append(actions);
    shadow.append(wrap);

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
    const visible = notices.filter((notice) => notice?.id && !hidden.has(notice.id));
    removeHost();
    if (!visible.length) return;

    const host = document.createElement('div');
    host.id = HOST_ID;
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
        :host { all: initial; }
        .backdrop, .notice, button { font-family: IRANYekanX, Tahoma, sans-serif; }
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
            border-top: 4px solid var(--tone);
        }
        .notice-popup { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .stack {
            position: fixed;
            z-index: 2147483647;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .stack .notice { position: relative; max-width: 420px; pointer-events: auto; }
        .stack .notice-banner { max-width: none; }
        .title { margin: 0 0 8px; font-size: 16px; line-height: 1.6; }
        .body { margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: #374151; }
        .image { display: block; width: 100%; max-height: 160px; object-fit: cover; margin-top: 12px; border-radius: 12px; }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        button { border: 0; border-radius: 10px; padding: 8px 12px; cursor: pointer; font-size: 13px; }
        .action-primary { background: var(--tone); color: #fff; }
        .action-secondary, .close { background: #f3f4f6; color: #111827; }
    `;
    shadow.append(style);
    const popup = visible.find((notice) => notice.type === 'popup');
    const rest = visible.filter((notice) => notice !== popup && notice.type !== 'popup');
    if (popup) renderNotice(popup, cache.fetchedAt, shadow);
    if (rest.length) {
        const stack = el('div', 'stack');
        rest.forEach((notice) => renderNotice(notice, cache.fetchedAt, stack));
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
