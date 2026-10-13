import {
    SITE_SETTINGS_STORAGE_KEY,
    getYoutubeCaptionsRtl,
} from '../../constants/siteSettings.js';
import { applyRtlToElement } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';

const CAPTIONS_SELECTOR = '.captions-text';

const CAPTION_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: 'important',
    setUnicodeBidi: 'plaintext',
    applyFontIfRtl: true,
    removeDirAuto: true,
};

const CLEAR_ATTRS = [
    'dir',
    'data-ai-rtl-direction',
    'data-algorithm-rtl',
    'data-text-length',
    'data-ai-rtl-orig-dir',
    'data-ai-rtl-orig-align',
    'data-ai-rtl-orig-bidi',
    'data-ai-rtl-orig-css-direction',
    'data-ai-rtl-orig-font',
];

let watcherInstalled = false;
let syncToken = 0;
let running = false;
let captionsEnabled = false;
let rtlAlgorithm = 'advanced_full';
let observer = null;
let pendingFrame = 0;

function isYoutubePage() {
    const host = window.location.hostname;
    return host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com';
}

function clearCaptionElement(element) {
    if (!element?.classList) {
        return;
    }
    element.classList.remove('FontSet', 'AsRtl', 'AsLtr', 'AsAlignRtl', 'AsAlignLtr');
    CLEAR_ATTRS.forEach((name) => {
        element.removeAttribute(name);
    });
    if (element.style) {
        element.style.removeProperty('direction');
        element.style.removeProperty('text-align');
        element.style.removeProperty('unicode-bidi');
        element.style.removeProperty('font-family');
    }
}

function applyCaptionElement(element) {
    if (!captionsEnabled || !isRtlEngineActive()) {
        return;
    }
    if (!String(element.textContent || '').trim()) {
        return;
    }
    applyRtlToElement(element, rtlAlgorithm, CAPTION_OPTIONS);
}

function processAllCaptions() {
    document.querySelectorAll(CAPTIONS_SELECTOR).forEach((element) => {
        if (captionsEnabled && isRtlEngineActive()) {
            applyCaptionElement(element);
        } else {
            clearCaptionElement(element);
        }
    });
}

function queueProcess() {
    if (pendingFrame) {
        return;
    }
    pendingFrame = requestAnimationFrame(() => {
        pendingFrame = 0;
        processAllCaptions();
    });
}

function startCaptionsObserver() {
    if (running || !document.documentElement) {
        return;
    }
    running = true;
    observer = new MutationObserver(queueProcess);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}

function stopCaptionsObserver() {
    running = false;
    if (pendingFrame) {
        cancelAnimationFrame(pendingFrame);
        pendingFrame = 0;
    }
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

function setCaptionsEnabled(enabled, algorithm) {
    if (algorithm) {
        rtlAlgorithm = algorithm;
    }
    captionsEnabled = Boolean(enabled);
    if (captionsEnabled && isRtlEngineActive()) {
        startCaptionsObserver();
        processAllCaptions();
        return;
    }
    stopCaptionsObserver();
    processAllCaptions();
}

function applyFromStored(stored, algorithm) {
    const enabled = Boolean(isRtlEngineActive() && getYoutubeCaptionsRtl(stored));
    setCaptionsEnabled(enabled, algorithm);
}

export function stopYoutubeCaptions() {
    syncToken += 1;
    setCaptionsEnabled(false);
}

export function syncYoutubeCaptions(algorithm) {
    if (!isYoutubePage()) {
        return;
    }
    if (algorithm) {
        rtlAlgorithm = algorithm;
    }
    const token = ++syncToken;
    try {
        chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (result) => {
            if (token !== syncToken || !isYoutubePage()) {
                return;
            }
            applyFromStored(result[SITE_SETTINGS_STORAGE_KEY], algorithm);
        });
    } catch (error) {
        stopYoutubeCaptions();
    }
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
        applyFromStored(changes[SITE_SETTINGS_STORAGE_KEY].newValue, rtlAlgorithm);
    });
}
