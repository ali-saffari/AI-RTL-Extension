import {
    SITE_SETTINGS_STORAGE_KEY,
    YOUTUBE_CAPTION_FONT_SCALE_BASE,
    YOUTUBE_CAPTIONS_RTL_ON,
    getYoutubeCaptionFontScaleFactor,
    isYoutubeCaptionEffectActive,
    normalizeSiteSettings,
} from '../../constants/siteSettings.js';
import { isRtlEngineActive } from '../utils/originalState.js';

const ROOT_CLASS = 'ai-rtl-yt-captions';
const RTL_CLASS = 'ai-rtl-yt-captions-rtl';
const SCALE_VAR = '--ai-rtl-caption-scale';
const STYLE_ID = 'ai-rtl-yt-captions-style';
const MIRROR_CLASS = 'ai-rtl-caption-mirror';
const SOURCE_CLASS = 'ai-rtl-caption-source';
const DEFAULT_FACTOR = YOUTUBE_CAPTION_FONT_SCALE_BASE / 100;

const CAPTIONS_CSS = `
html.${ROOT_CLASS} .caption-window {
    scale: var(${SCALE_VAR}, ${DEFAULT_FACTOR});
    transform-origin: center bottom;
}
html.${ROOT_CLASS}.${RTL_CLASS} .captions-text {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: plaintext !important;
}
html.${ROOT_CLASS} .ytp-caption-segment {
    font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
}
`;

let watcherInstalled = false;
let syncToken = 0;

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
    if (style.textContent !== CAPTIONS_CSS) {
        style.textContent = CAPTIONS_CSS;
    }
}

function removeCopiedCaptions() {
    document.querySelectorAll(`.${MIRROR_CLASS}`).forEach((element) => {
        element.remove();
    });
    document.querySelectorAll(`.${SOURCE_CLASS}`).forEach((element) => {
        element.classList.remove(SOURCE_CLASS);
    });
    document.getElementById('ai-rtl-caption-mirror-style')?.remove();
}

function applyCaptions({ enabled, rtl, factor }) {
    const root = document.documentElement;
    if (!root) {
        return;
    }
    removeCopiedCaptions();
    if (!enabled || !isRtlEngineActive()) {
        root.classList.remove(ROOT_CLASS, RTL_CLASS);
        root.style.removeProperty(SCALE_VAR);
        document.getElementById(STYLE_ID)?.remove();
        return;
    }
    const scaleFactor = Number.isFinite(factor) ? factor : DEFAULT_FACTOR;
    ensureStyle();
    root.style.setProperty(SCALE_VAR, String(scaleFactor));
    root.classList.add(ROOT_CLASS);
    root.classList.toggle(RTL_CLASS, Boolean(rtl));
}

function applyFromStored(stored) {
    const youtube = normalizeSiteSettings(stored).youtube;
    applyCaptions({
        enabled: Boolean(isRtlEngineActive() && isYoutubeCaptionEffectActive(stored)),
        rtl: youtube.captionsRtl === YOUTUBE_CAPTIONS_RTL_ON,
        factor: getYoutubeCaptionFontScaleFactor(stored),
    });
}

export function stopYoutubeCaptions() {
    syncToken += 1;
    applyCaptions({ enabled: false, rtl: false, factor: DEFAULT_FACTOR });
}

export function syncYoutubeCaptions() {
    if (!isYoutubePage()) {
        return;
    }
    const token = ++syncToken;
    try {
        chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (result) => {
            if (token !== syncToken || !isYoutubePage()) {
                return;
            }
            applyFromStored(result[SITE_SETTINGS_STORAGE_KEY]);
        });
    } catch (error) {
        stopYoutubeCaptions();
    }
}

function previewCaptionScale(userScale) {
    const root = document.documentElement;
    if (!root?.classList.contains(ROOT_CLASS) || !Number.isFinite(userScale)) {
        return;
    }
    root.style.setProperty(SCALE_VAR, String((userScale / 100) * DEFAULT_FACTOR));
}

export function installYoutubeCaptionsWatcher() {
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
        applyFromStored(changes[SITE_SETTINGS_STORAGE_KEY].newValue);
    });
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message || message.action !== 'previewYoutubeCaptionFontScale' || !isYoutubePage()) {
            return;
        }
        previewCaptionScale(Number(message.scale));
        sendResponse({ success: true });
    });
}
