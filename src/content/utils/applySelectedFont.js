import {
    DEFAULT_FONT_ID,
    NONE_FONT_ID,
    SELECTED_FONT_STORAGE_KEY,
    getFontById,
    getFontFamilyCssValue,
    getFontFormat,
    loadFontsConfig,
    normalizeSelectedFontId,
} from '../../utils/fonts';

const STYLE_ID = 'ai-rtl-selected-font-style';
const HAS_FONT_CLASS = 'ai-rtl-has-font';
const NONE_FONT_CLASS = 'ai-rtl-font-none';
const loadedFontIds = new Set();
let initialized = false;
let applyingFontId = null;

const NONE_FONT_OVERRIDE_CSS = `
html.ai-rtl-font-none .FontSet,
html.ai-rtl-font-none .FontSet p,
html.ai-rtl-font-none .FontSet b,
html.ai-rtl-font-none .FontSet h1,
html.ai-rtl-font-none .FontSet h2,
html.ai-rtl-font-none .FontSet h3,
html.ai-rtl-font-none .FontSet li,
html.ai-rtl-font-none .FontSet *,
html.ai-rtl-font-none textarea.FontSetImportant,
html.ai-rtl-font-none .FontSetImportant,
html.ai-rtl-font-none .FontSetImportant2,
html.ai-rtl-font-none .FontSetImportantGPT,
html.ai-rtl-font-none .FontSetImportantGPT p,
html.ai-rtl-font-none .FontSetImportantGPT li,
html.ai-rtl-font-none .chat-input-container textarea.FontSetImportant,
html.ai-rtl-font-none .language-plaintext.FontSet,
html.ai-rtl-font-none .FontSet .font-claude-message,
html.ai-rtl-font-none .FontSet .font-user-message,
html.ai-rtl-font-none .FontSet .ProseMirror,
html.ai-rtl-font-none .AsRtlClaudeList .whitespace-nowrap,
html.ai-rtl-font-none .CopilotFontSet,
html.ai-rtl-font-none .FontSetPerplexity .font-sans,
html.ai-rtl-font-none .FontSetPerplexity h2,
html.ai-rtl-font-none .FontSetImportant .font-display,
html.ai-rtl-font-none .AsRtl .font-display,
html.ai-rtl-font-none pending-request,
html.ai-rtl-font-none .AsOkNotebooklm[dir="rtl"] .ng-star-inserted,
html.ai-rtl-font-none .FontSetVivadoInput,
html.ai-rtl-font-none .FontSetVivado {
    font-family: unset !important;
}
`;

function getRuntime() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome;
    }
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
        return browser;
    }
    return null;
}

function ensureStyleElement() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
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
        ensureStyleElement().textContent = NONE_FONT_OVERRIDE_CSS;
        return;
    }

    root.style.setProperty('--ai-rtl-font', fontFamilyValue);
    root.classList.add(HAS_FONT_CLASS);
    root.classList.remove(NONE_FONT_CLASS);
    ensureStyleElement().textContent = `:root, html { --ai-rtl-font: ${fontFamilyValue}; }`;
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
    const selectedId = normalizeSelectedFontId(fontId);
    applyingFontId = selectedId;

    if (selectedId === NONE_FONT_ID) {
        setRootFontState(null, true);
        return;
    }

    try {
        const config = await loadFontsConfig();
        if (applyingFontId !== selectedId) {
            return;
        }
        const font = getFontById(config, selectedId) || getFontById(config, DEFAULT_FONT_ID);
        if (!font) {
            setRootFontState(null, true);
            return;
        }
        await loadFontFaces(font);
        if (applyingFontId !== selectedId) {
            return;
        }
        setRootFontState(getFontFamilyCssValue(font), false);
    } catch (error) {
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
        chrome.storage.sync.get([SELECTED_FONT_STORAGE_KEY], (result) => {
            applySelectedFont(result[SELECTED_FONT_STORAGE_KEY]);
        });
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' && changes[SELECTED_FONT_STORAGE_KEY]) {
                applySelectedFont(changes[SELECTED_FONT_STORAGE_KEY].newValue);
            }
        });
    } catch (error) {
        applySelectedFont(DEFAULT_FONT_ID);
    }
}
