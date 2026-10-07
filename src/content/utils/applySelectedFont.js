import {
    DEFAULT_FONT_ID,
    DEFAULT_FONT_SCALE,
    FONT_SCALE_STORAGE_KEY,
    NONE_FONT_ID,
    SELECTED_FONT_STORAGE_KEY,
    getFontById,
    getFontFamilyCssValue,
    getFontFormat,
    loadFontsConfig,
    normalizeFontScale,
    normalizeSelectedFontId,
} from '../../utils/fonts';
import { FONT_SCALE_MODE_FONT_SIZE, FONT_SCALE_MODE_NONE, getFontScaleMode } from '../../utils/fontScaleSites';
import { EXTENSION_ENABLED_STORAGE_KEY, isExtensionEnabledValue } from '../../constants/extensionEnabled.js';

const STYLE_ID = 'ai-rtl-selected-font-style';
const FONT_SCALE_STYLE_ID = 'ai-rtl-font-scale-style';
const HAS_FONT_CLASS = 'ai-rtl-has-font';
const NONE_FONT_CLASS = 'ai-rtl-font-none';
const LEGACY_FONT_SIZE_ATTR = 'data-ai-rtl-font-px';
const loadedFontIds = new Set();
let initialized = false;
let applyingFontId = null;
let pageEffectsEnabled = true;
let harnessFontsSuppressed = false;

function clearInjectedFontStyle() {
    const style = document.getElementById(STYLE_ID);
    if (style) {
        style.textContent = '';
    }
}

function getRuntime() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome;
    }
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
        return browser;
    }
    return null;
}

function ensureStyleElement(styleId) {
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        const parent = document.head || document.documentElement;
        parent.appendChild(style);
    }
    return style;
}

function setRootFontState(fontFamilyValue, isNone) {
    const root = document.documentElement;
    if (!root) {
        return;
    }

    if (isNone) {
        root.style.removeProperty('--ai-rtl-font');
        root.classList.add(NONE_FONT_CLASS);
        root.classList.remove(HAS_FONT_CLASS);
        clearInjectedFontStyle();
        return;
    }

    root.style.setProperty('--ai-rtl-font', fontFamilyValue);
    root.classList.add(HAS_FONT_CLASS);
    root.classList.remove(NONE_FONT_CLASS);
    ensureStyleElement(STYLE_ID).textContent = `:root, html { --ai-rtl-font: ${fontFamilyValue}; }`;
}

function clearLegacyElementScales() {
    document.querySelectorAll('[' + LEGACY_FONT_SIZE_ATTR + ']').forEach((element) => {
        element.style.removeProperty('font-size');
        element.removeAttribute(LEGACY_FONT_SIZE_ATTR);
    });
}

function buildFontScaleCss(value) {
    const mode = getFontScaleMode();
    if (mode === FONT_SCALE_MODE_NONE) {
        return '';
    }
    if (mode === FONT_SCALE_MODE_FONT_SIZE) {
        return `html { font-size: ${value}% !important; }`;
    }
    return `html { zoom: ${value / 100} !important; }`;
}

function clearPageEffects() {
    const root = document.documentElement;
    if (root) {
        root.style.removeProperty('--ai-rtl-font');
        root.style.removeProperty('font-size');
        root.style.removeProperty('zoom');
        root.classList.remove(HAS_FONT_CLASS, NONE_FONT_CLASS);
    }
    clearLegacyElementScales();
    [STYLE_ID, FONT_SCALE_STYLE_ID].forEach((styleId) => {
        const style = document.getElementById(styleId);
        if (style) {
            style.textContent = '';
        }
    });
}

function restorePageEffectsFromStorage() {
    try {
        chrome.storage.sync.get([SELECTED_FONT_STORAGE_KEY, FONT_SCALE_STORAGE_KEY], (result) => {
            if (!pageEffectsEnabled || harnessFontsSuppressed) {
                return;
            }
            applySelectedFont(result[SELECTED_FONT_STORAGE_KEY]);
            applyFontScale(result[FONT_SCALE_STORAGE_KEY]);
        });
    } catch (error) {
        applySelectedFont(DEFAULT_FONT_ID);
        applyFontScale(DEFAULT_FONT_SCALE);
    }
}

export function setHarnessFontsSuppressed(suppressed) {
    const next = suppressed === true;
    if (harnessFontsSuppressed === next) {
        return;
    }
    harnessFontsSuppressed = next;
    if (!pageEffectsEnabled || harnessFontsSuppressed) {
        clearPageEffects();
        return;
    }
    restorePageEffectsFromStorage();
}

export function applyFontScale(scale) {
    if (!pageEffectsEnabled || harnessFontsSuppressed) {
        return;
    }
    const value = normalizeFontScale(scale);
    const root = document.documentElement;
    if (!root) {
        return;
    }

    clearLegacyElementScales();
    const css = buildFontScaleCss(value);
    // Mode "none" must not strip a site's own html font-size or zoom.
    // YouTube sets that inline; removing it leaves the page larger after toggle-off.
    if (css) {
        root.style.removeProperty('font-size');
        root.style.removeProperty('zoom');
    }

    if (value === DEFAULT_FONT_SCALE || !css) {
        const style = document.getElementById(FONT_SCALE_STYLE_ID);
        if (style) {
            style.textContent = '';
        }
        return;
    }

    ensureStyleElement(FONT_SCALE_STYLE_ID).textContent = css;
}

async function loadFontFaces(font) {
    if (!font || loadedFontIds.has(font.id)) {
        return;
    }

    const runtime = getRuntime();
    if (!runtime) {
        return;
    }

    const canUseFontFace = typeof FontFace !== 'undefined' && document.fonts;
    const loaders = (font.files || []).map((file) => {
        try {
            const url = runtime.runtime.getURL('fonts/' + file.path);
            if (!canUseFontFace) {
                return Promise.resolve();
            }
            const format = getFontFormat(file.path);
            const source = `url(${JSON.stringify(url)}) format("${format}")`;
            const face = new FontFace(font.family, source, {
                style: 'normal',
                weight: String(file.weight),
            });
            return face
                .load()
                .then((loaded) => {
                    document.fonts.add(loaded);
                })
                .catch(() => {});
        } catch (error) {
            return Promise.resolve();
        }
    });

    await Promise.all(loaders);
    loadedFontIds.add(font.id);
}

export async function applySelectedFont(fontId) {
    if (!pageEffectsEnabled || harnessFontsSuppressed) {
        return;
    }
    const selectedId = normalizeSelectedFontId(fontId);
    applyingFontId = selectedId;

    if (selectedId === NONE_FONT_ID) {
        setRootFontState(null, true);
        return;
    }

    try {
        const config = await loadFontsConfig();
        if (applyingFontId !== selectedId || !pageEffectsEnabled || harnessFontsSuppressed) {
            return;
        }
        const font = getFontById(config, selectedId) || getFontById(config, DEFAULT_FONT_ID);
        if (!font) {
            setRootFontState(null, true);
            return;
        }
        await loadFontFaces(font);
        if (applyingFontId !== selectedId || !pageEffectsEnabled || harnessFontsSuppressed) {
            return;
        }
        setRootFontState(getFontFamilyCssValue(font), false);
    } catch (error) {
        if (!pageEffectsEnabled || harnessFontsSuppressed) {
            return;
        }
        if (selectedId === DEFAULT_FONT_ID) {
            setRootFontState('iranyekan, sans-serif', false);
            return;
        }
        setRootFontState(null, true);
    }
}

export function initSelectedFont() {
    if (initialized) {
        return;
    }
    initialized = true;

    try {
        chrome.storage.sync.get([SELECTED_FONT_STORAGE_KEY, FONT_SCALE_STORAGE_KEY, EXTENSION_ENABLED_STORAGE_KEY], (result) => {
            pageEffectsEnabled = isExtensionEnabledValue(result[EXTENSION_ENABLED_STORAGE_KEY]);
            if (!pageEffectsEnabled) {
                clearPageEffects();
                return;
            }
            applySelectedFont(result[SELECTED_FONT_STORAGE_KEY]);
            applyFontScale(result[FONT_SCALE_STORAGE_KEY]);
        });
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'sync') {
                return;
            }
            if (changes[EXTENSION_ENABLED_STORAGE_KEY]) {
                pageEffectsEnabled = isExtensionEnabledValue(changes[EXTENSION_ENABLED_STORAGE_KEY].newValue);
                if (!pageEffectsEnabled || harnessFontsSuppressed) {
                    clearPageEffects();
                    return;
                }
                restorePageEffectsFromStorage();
            }
            if (!pageEffectsEnabled || harnessFontsSuppressed) {
                return;
            }
            if (changes[SELECTED_FONT_STORAGE_KEY]) {
                applySelectedFont(changes[SELECTED_FONT_STORAGE_KEY].newValue);
            }
            if (changes[FONT_SCALE_STORAGE_KEY]) {
                applyFontScale(changes[FONT_SCALE_STORAGE_KEY].newValue);
            }
        });
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message && message.action === 'previewFontScale') {
                if (pageEffectsEnabled && !harnessFontsSuppressed) {
                    applyFontScale(message.scale);
                }
                sendResponse({ success: true });
                return true;
            }
            return false;
        });
    } catch (error) {
        applySelectedFont(DEFAULT_FONT_ID);
        applyFontScale(DEFAULT_FONT_SCALE);
    }
}
