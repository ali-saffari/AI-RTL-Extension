import {
    SITE_SETTINGS_STORAGE_KEY,
    getYoutubeMetadataRtl,
} from '../../constants/siteSettings.js';
import { detectTextDirection } from '../utils/analyzeDirection.js';
import { isRtlEngineActive } from '../utils/originalState.js';

const ROOT_CLASS = 'ai-rtl-yt-metadata';
const STYLE_ID = 'ai-rtl-yt-metadata-style';
const MARK_ATTR = 'data-ai-rtl-yt-meta';

// Video titles only (watch page + lists).
const TARGET_SELECTOR = [
    'ytd-watch-metadata #title yt-formatted-string',
    'ytd-watch-metadata h1 yt-formatted-string',
    'a#video-title',
    'yt-formatted-string#video-title',
    '#video-title yt-formatted-string',
    '.ytAttributedStringHost',
    '.ytLockupMetadataViewModelHeadingReset',
].join(', ');

const METADATA_CSS = `
html.${ROOT_CLASS} [${MARK_ATTR}="rtl"] {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: isolate !important;
}
html.${ROOT_CLASS} [${MARK_ATTR}="ltr"] {
    direction: ltr !important;
    text-align: left !important;
}
html.${ROOT_CLASS} .ytLockupViewModelMetadata .ytLockupMetadataViewModelTextContainer {
    width: 100% !important;
}
`;

let watcherInstalled = false;
let syncToken = 0;
let enabled = false;

function isYoutubePage() {
    const host = window.location.hostname;
    return host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com';
}

function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
        (document.head || document.documentElement).appendChild(style);
    }
    if (style.textContent !== METADATA_CSS) {
        style.textContent = METADATA_CSS;
    }
}

function clearMarks() {
    document.querySelectorAll(`[${MARK_ATTR}]`).forEach((element) => {
        element.removeAttribute(MARK_ATTR);
        element.removeAttribute('dir');
        if (element.style) {
            element.style.removeProperty('direction');
            element.style.removeProperty('text-align');
            element.style.removeProperty('unicode-bidi');
        }
    });
    document.getElementById(STYLE_ID)?.remove();
    document.documentElement?.classList.remove(ROOT_CLASS);
}

/** YouTube sometimes wraps each word in <span dir="auto">; flatten to one text node. */
function flattenWordSpans(element) {
    const children = element.children;
    if (!children.length) {
        return;
    }
    for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        if (child.tagName !== 'SPAN' || child.children.length > 0) {
            return;
        }
    }
    const text = element.getAttribute('title') || element.textContent || '';
    element.textContent = text;
}

function applyTarget(element) {
    flattenWordSpans(element);
    const text = String(element.textContent || '').trim();
    if (!text) {
        return;
    }
    const direction = detectTextDirection(text) === 'rtl' ? 'rtl' : 'ltr';
    element.setAttribute(MARK_ATTR, direction);
    element.setAttribute('dir', direction);
}

function processTargets() {
    if (!enabled || !isRtlEngineActive() || !isYoutubePage()) {
        return;
    }
    ensureStyle();
    document.documentElement.classList.add(ROOT_CLASS);
    document.querySelectorAll(TARGET_SELECTOR).forEach(applyTarget);
}

export function tickYoutubeMetadata() {
    processTargets();
}

export function stopYoutubeMetadata() {
    syncToken += 1;
    enabled = false;
    clearMarks();
}

export function syncYoutubeMetadata() {
    if (!isYoutubePage()) {
        return;
    }
    const token = ++syncToken;
    try {
        chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (result) => {
            if (token !== syncToken || !isYoutubePage()) {
                return;
            }
            enabled = Boolean(isRtlEngineActive() && getYoutubeMetadataRtl(result[SITE_SETTINGS_STORAGE_KEY]));
            if (enabled) {
                processTargets();
            } else {
                clearMarks();
            }
        });
    } catch (error) {
        stopYoutubeMetadata();
    }
}

export function installYoutubeMetadataWatcher() {
    if (watcherInstalled || !isYoutubePage()) {
        return;
    }
    watcherInstalled = true;
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync' || !changes[SITE_SETTINGS_STORAGE_KEY]) {
            return;
        }
        if (!isYoutubePage()) {
            return;
        }
        enabled = Boolean(isRtlEngineActive() && getYoutubeMetadataRtl(changes[SITE_SETTINGS_STORAGE_KEY].newValue));
        if (enabled) {
            processTargets();
        } else {
            clearMarks();
        }
    });
}
