import {
    SITE_SETTINGS_STORAGE_KEY,
    YOUTUBE_FONT_SCOPE_SITE,
    getYoutubeFontScope,
} from '../../constants/siteSettings.js';
import { isRtlEngineActive } from '../utils/originalState.js';
import { NONE_FONT_ID, SELECTED_FONT_STORAGE_KEY } from '../../utils/fonts';

const ROOT_CLASS = 'ai-rtl-yt-font-site';
const DOCUMENT_STYLE_ID = 'ai-rtl-yt-site-font';
const SKIP_SHADOW_HOSTS = new Set([
    'YT-ICON',
    'YT-ICON-SHAPE',
    'TP-YT-IRON-ICON',
    'IRON-ICON',
    'SVG',
]);

const TEXT_SELECTOR = `:where(
    p, span, div, a,
    h1, h2, h3, h4, h5, h6,
    li, label, button, input, textarea, select, option,
    yt-formatted-string, yt-attributed-string, .yt-core-attributed-string
):not(
    yt-icon, yt-icon-shape, svg, path, use,
    tp-yt-iron-icon, iron-icon,
    code, pre, kbd, samp,
    [class*="icon"], [class*="Icon"]
)`;

const DOCUMENT_CSS = `
html.${ROOT_CLASS} ${TEXT_SELECTOR} {
    font-family: var(--ai-rtl-font) !important;
}
`;

const SHADOW_CSS = `
:host-context(html.${ROOT_CLASS}) ${TEXT_SELECTOR} {
    font-family: var(--ai-rtl-font) !important;
}
`;

let watcherInstalled = false;
let syncToken = 0;
let running = false;
let observer = null;
let pendingNodes = [];
let pendingFrame = 0;

function isYoutubePage() {
    const host = window.location.hostname;
    return host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com';
}

function ensureDocumentStyle() {
    let style = document.getElementById(DOCUMENT_STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = DOCUMENT_STYLE_ID;
        (document.head || document.documentElement).appendChild(style);
    }
    if (style.textContent !== DOCUMENT_CSS) {
        style.textContent = DOCUMENT_CSS;
    }
}

function injectShadow(root) {
    if (!root || !root.host || SKIP_SHADOW_HOSTS.has(root.host.tagName)) {
        return;
    }
    // A constructed stylesheet from the content script can fail to paint in the page.
    // A style element inside the open shadow root does apply.
    if (root.querySelector && root.querySelector('style[data-ai-rtl-yt-font]')) {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute('data-ai-rtl-yt-font', '');
    style.textContent = SHADOW_CSS;
    root.appendChild(style);
}

function forEachShadowHost(node, seen, visitor) {
    const visitHost = (element) => {
        const root = element && element.shadowRoot;
        if (!root || seen.has(root)) {
            return;
        }
        seen.add(root);
        if (SKIP_SHADOW_HOSTS.has(element.tagName)) {
            return;
        }
        visitor(root);
        walk(root);
    };

    const walk = (current) => {
        if (!current || !current.querySelectorAll) {
            return;
        }
        if (current.shadowRoot) {
            visitHost(current);
        }
        current.querySelectorAll('*').forEach((element) => {
            if (element.shadowRoot) {
                visitHost(element);
            }
        });
    };

    walk(node);
}

function flushPending() {
    pendingFrame = 0;
    const nodes = pendingNodes;
    pendingNodes = [];
    const seen = new Set();
    nodes.forEach((node) => {
        forEachShadowHost(node, seen, injectShadow);
    });
}

function queueInject(node) {
    pendingNodes.push(node);
    if (pendingFrame) {
        return;
    }
    pendingFrame = requestAnimationFrame(flushPending);
}

function clearShadow(root) {
    if (!root.querySelectorAll) {
        return;
    }
    root.querySelectorAll('style[data-ai-rtl-yt-font]').forEach((style) => {
        style.remove();
    });
}

function startSiteFont() {
    if (!document.documentElement) {
        return;
    }
    document.documentElement.classList.add(ROOT_CLASS);
    ensureDocumentStyle();
    if (running) {
        return;
    }
    running = true;
    forEachShadowHost(document, new Set(), injectShadow);
    observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    queueInject(node);
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

function stopSiteFont() {
    running = false;
    if (pendingFrame) {
        cancelAnimationFrame(pendingFrame);
        pendingFrame = 0;
    }
    pendingNodes = [];
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    document.getElementById(DOCUMENT_STYLE_ID)?.remove();
    document.documentElement?.classList.remove(ROOT_CLASS);
    if (document.documentElement) {
        forEachShadowHost(document, new Set(), clearShadow);
    }
}

export function stopYoutubeSiteFont() {
    syncToken += 1;
    stopSiteFont();
}

export function syncYoutubeSiteFont() {
    if (!isYoutubePage()) {
        return;
    }
    const token = ++syncToken;
    try {
        chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY, SELECTED_FONT_STORAGE_KEY], (result) => {
            if (token !== syncToken || !isYoutubePage()) {
                return;
            }
            const scope = getYoutubeFontScope(result[SITE_SETTINGS_STORAGE_KEY]);
            const fontId = result[SELECTED_FONT_STORAGE_KEY] || 'iranyekan';
            const enabled = scope === YOUTUBE_FONT_SCOPE_SITE
                && fontId !== NONE_FONT_ID
                && isRtlEngineActive();
            if (enabled) {
                startSiteFont();
            } else {
                stopSiteFont();
            }
        });
    } catch (error) {
        stopSiteFont();
    }
}

export function installYoutubeSiteFontWatcher() {
    if (watcherInstalled || !isYoutubePage()) {
        return;
    }
    watcherInstalled = true;
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync') {
            return;
        }
        if (!changes[SITE_SETTINGS_STORAGE_KEY] && !changes[SELECTED_FONT_STORAGE_KEY]) {
            return;
        }
        if (!isRtlEngineActive()) {
            stopYoutubeSiteFont();
            return;
        }
        syncYoutubeSiteFont();
    });
}
