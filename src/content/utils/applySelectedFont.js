import {
    DEFAULT_FONT_ID,
    DEFAULT_FONT_SCALE,
    FONT_SCALE_STORAGE_KEY,
    NONE_FONT_ID,
    SELECTED_FONT_STORAGE_KEY,
    getFontById,
    getFontFamilyCssValue,
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

function isYoutubeWatchHost() {
    const host = typeof location !== 'undefined' ? location.hostname : '';
    return host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com';
}

function isChatGptHost() {
    const host = typeof location !== 'undefined' ? location.hostname.replace(/^www\./, '') : '';
    return host === 'chatgpt.com' || host === 'chat.openai.com';
}

// ChatGPT locks text to px tokens, so html { font-size } never reaches it.
const CHATGPT_FONT_VAR_FALLBACKS = {
    '--markdown-font-size': 16,
    '--codex-chat-font-size': 16,
    '--codex-chat-code-font-size': 12,
    '--font-text-xs-size': 12,
    '--font-text-sm-size': 14,
    '--font-text-md-size': 16,
    '--font-text-lg-size': 18,
    '--font-text-xl-size': 20,
    '--text-xs': 12,
    '--text-sm': 14,
    '--text-base': 16,
    '--text-lg': 18
};
const chatgptFontVarBases = new Map();
let chatgptScaleRetries = 0;
let chatgptScaleTimer = 0;

function rememberChatgptFontVar(name, value) {
    if (!name || chatgptFontVarBases.has(name)) {
        return;
    }
    const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)px$/);
    if (match) {
        chatgptFontVarBases.set(name, Number(match[1]));
    }
}

function captureChatgptFontVars(root) {
    const style = document.getElementById(FONT_SCALE_STYLE_ID);
    const written = style && style.textContent ? style.textContent : '';
    const nodes = [
        root,
        document.body,
        document.querySelector('[class*="MarkdownRoot"]'),
        document.querySelector('.ProseMirror')
    ];
    Object.keys(CHATGPT_FONT_VAR_FALLBACKS).forEach((name) => {
        if (written.includes(name + ':')) {
            return;
        }
        for (let i = 0; i < nodes.length; i += 1) {
            if (!nodes[i]) {
                continue;
            }
            rememberChatgptFontVar(name, getComputedStyle(nodes[i]).getPropertyValue(name));
        }
    });

    const sheets = document.styleSheets;
    for (let index = 0; index < sheets.length; index += 1) {
        const sheet = sheets[index];
        if (sheet.ownerNode && sheet.ownerNode.id === FONT_SCALE_STYLE_ID) {
            continue;
        }
        let rules;
        try {
            rules = sheet.cssRules;
        } catch (error) {
            continue;
        }
        if (!rules) {
            continue;
        }
        const pending = [rules];
        while (pending.length) {
            const list = pending.pop();
            for (let ruleIndex = 0; ruleIndex < list.length; ruleIndex += 1) {
                const rule = list[ruleIndex];
                if (rule.cssRules) {
                    pending.push(rule.cssRules);
                }
                if (!rule.style) {
                    continue;
                }
                for (let propIndex = 0; propIndex < rule.style.length; propIndex += 1) {
                    const prop = rule.style[propIndex];
                    if (!prop || prop.charAt(0) !== '-' || prop.charAt(1) !== '-') {
                        continue;
                    }
                    if (!/font-size|font-text-|markdown-font|^--text-(2xs|xs|sm|base|md|lg|xl|2xl|3xl)$/.test(prop)) {
                        continue;
                    }
                    rememberChatgptFontVar(prop, rule.style.getPropertyValue(prop));
                }
            }
        }
    }
}

function chatgptFontScaleExtra(value) {
    const root = document.documentElement;
    if (root) {
        captureChatgptFontVars(root);
    }
    const factor = value / 100;
    const px = (size) => `${Math.round(size * factor * 100) / 100}px`;
    const vars = Object.keys(CHATGPT_FONT_VAR_FALLBACKS).map((name) => {
        const base = chatgptFontVarBases.has(name)
            ? chatgptFontVarBases.get(name)
            : CHATGPT_FONT_VAR_FALLBACKS[name];
        return `${name}: ${px(base)} !important`;
    });
    chatgptFontVarBases.forEach((base, name) => {
        if (!Object.prototype.hasOwnProperty.call(CHATGPT_FONT_VAR_FALLBACKS, name)) {
            vars.push(`${name}: ${px(base)} !important`);
        }
    });
    const body = px(chatgptFontVarBases.get('--markdown-font-size') || 16);
    const code = px(chatgptFontVarBases.get('--codex-chat-code-font-size') || 12);
    return `
        html, html * { ${vars.join('; ')}; }
        [class*="MarkdownRoot"] :is(p, li, blockquote),
        [data-message-author-role="user"],
        [data-message-author-role="user"] .whitespace-pre-wrap,
        [data-user-message-bubble],
        [data-user-message-bubble] .whitespace-pre-wrap,
        .ProseMirror,
        #prompt-textarea,
        [data-mobile-composer-prompt],
        [class*="suggested-followup"] {
            font-size: ${body} !important;
        }
        [class*="MarkdownRoot"] :is(td, th) {
            font-size: ${px(14)} !important;
        }
        [class*="MarkdownRoot"] :is(pre, code),
        [class*="MarkdownRoot"] [class*="CodeBlock"],
        [class*="MarkdownRoot"] [class*="InlineCode"] {
            font-size: ${code} !important;
        }
    `;
}

// YouTube's own html font-size percent, read before we override it.
let youtubeRootFontPercent = null;

function percentFromFontSize(value) {
    const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)%$/);
    return match ? Number(match[1]) : null;
}

function readHtmlFontSizePercentFromSheets() {
    const sheets = document.styleSheets;
    for (let index = 0; index < sheets.length; index += 1) {
        const sheet = sheets[index];
        if (sheet.ownerNode && sheet.ownerNode.id === FONT_SCALE_STYLE_ID) {
            continue;
        }
        let rules;
        try {
            rules = sheet.cssRules;
        } catch (error) {
            continue;
        }
        if (!rules) {
            continue;
        }
        for (let ruleIndex = rules.length - 1; ruleIndex >= 0; ruleIndex -= 1) {
            const rule = rules[ruleIndex];
            if (!rule.selectorText || !rule.style) {
                continue;
            }
            const matchesHtml = rule.selectorText.split(',').some((part) => part.trim() === 'html');
            if (!matchesHtml) {
                continue;
            }
            const percent = percentFromFontSize(rule.style.fontSize);
            if (percent != null) {
                return percent;
            }
        }
    }
    return null;
}

function captureYoutubeRootFontPercent(root) {
    const inline = percentFromFontSize(root.style.fontSize);
    if (inline != null) {
        youtubeRootFontPercent = inline;
        return inline;
    }
    if (youtubeRootFontPercent != null) {
        return youtubeRootFontPercent;
    }
    const fromSheets = readHtmlFontSizePercentFromSheets();
    if (fromSheets != null) {
        youtubeRootFontPercent = fromSheets;
    }
    return youtubeRootFontPercent;
}

function buildFontScaleCss(value, youtubeBasePercent) {
    const mode = getFontScaleMode();
    if (mode === FONT_SCALE_MODE_NONE) {
        return '';
    }
    if (mode === FONT_SCALE_MODE_FONT_SIZE) {
        if (isYoutubeWatchHost()) {
            if (youtubeBasePercent == null) {
                return '';
            }
            const percent = (youtubeBasePercent * value) / 100;
            return `html { font-size: ${percent}% !important; }`;
        }
        const rootRule = `html { font-size: ${value}% !important; }`;
        if (!isChatGptHost()) {
            return rootRule;
        }
        return rootRule + chatgptFontScaleExtra(value);
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
    const onYoutube = isYoutubeWatchHost();
    const youtubeBase = onYoutube ? captureYoutubeRootFontPercent(root) : null;
    const css = buildFontScaleCss(value, youtubeBase);

    // Put YouTube's own root percent back. Clearing the sheet is not enough
    // after a scaled value has been applied.
    if (value === DEFAULT_FONT_SCALE && onYoutube && youtubeBase != null) {
        ensureStyleElement(FONT_SCALE_STYLE_ID).textContent =
            `html { font-size: ${youtubeBase}% !important; }`;
        return;
    }

    if (value === DEFAULT_FONT_SCALE || !css) {
        const style = document.getElementById(FONT_SCALE_STYLE_ID);
        if (style) {
            style.textContent = '';
        }
        return;
    }

    // Do not strip YouTube's inline root; override with !important only.
    if (!onYoutube) {
        root.style.removeProperty('font-size');
        root.style.removeProperty('zoom');
    }
    ensureStyleElement(FONT_SCALE_STYLE_ID).textContent = css;
    if (isChatGptHost() && !chatgptFontVarBases.has('--markdown-font-size') && chatgptScaleRetries < 6) {
        if (!chatgptScaleTimer) {
            chatgptScaleRetries += 1;
            chatgptScaleTimer = setTimeout(() => {
                chatgptScaleTimer = 0;
                applyFontScale(value);
            }, 500);
        }
    }
}

async function readFontBytes(runtime, relativePath) {
    // Ask the service worker. A content-script fetch of chrome-extension:// is
    // attributed to the YouTube frame and logged as an unsafe load.
    const response = await runtime.runtime.sendMessage({
        action: 'readExtensionFont',
        path: relativePath,
    });
    if (!response?.success || !response.bytes) {
        return null;
    }
    return new Uint8Array(response.bytes);
}

async function loadFontFaces(font) {
    if (!font || loadedFontIds.has(font.id)) {
        return;
    }

    const runtime = getRuntime();
    if (!runtime?.runtime?.sendMessage) {
        return;
    }

    const canUseFontFace = typeof FontFace !== 'undefined' && document.fonts;
    if (!canUseFontFace) {
        return;
    }

    const loaders = (font.files || []).map(async (file) => {
        try {
            const bytes = await readFontBytes(runtime, file.path);
            if (!bytes) {
                return;
            }
            const face = new FontFace(font.family, bytes, {
                style: 'normal',
                weight: String(file.weight),
            });
            const loaded = await face.load();
            document.fonts.add(loaded);
        } catch (error) {
            // Ignore individual font failures; content script must keep running
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
