import { DEFAULT_HALF_SPACE_SITES, HALF_SPACE_STORAGE_KEY } from './halfSpaceHotkey.js';
import { defaultSiteSettings, SITE_SETTINGS_STORAGE_KEY } from './siteSettings.js';
import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from './updateModalConfig.js';
import { isFirefoxRuntime } from '../utils/isFirefox.js';
import { getDefaultPinOpenSiteMode, PIN_OPEN_SITE_STORAGE_KEY } from '../utils/pinOpenSite';

export const SERVICE_FLAGS = {
    chatGpt: true, claude: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    googleNotebook: false, jules: true, zai: true, arena: false, openrouter: true, minimax: true,
    oneMinai: true, writesonic: true, lovable: true, ernie: true, gamma: true
};

export function getDefaultManualRtlSettings() {
    if (isFirefoxRuntime()) {
        return {
            manualRtlEnabled: false,
            manualRtlSiteMode: 'ai_sites',
            menuDisplayMode: 'logo_first',
            highlightMode: 'on_direction_change',
            highlightColor: '#ff0000',
            highlightOpacity: 0.3,
            logoDisplay: 'always',
            applyFont: true
        };
    }

    return {
        manualRtlEnabled: false,
        manualRtlSiteMode: 'allowed_sites',
        menuDisplayMode: 'logo_first',
        highlightMode: 'on_direction_change',
        highlightColor: '#ff0000',
        highlightOpacity: 0.3,
        logoDisplay: 'always',
        applyFont: true
    };
}

export function buildInstallSyncDefaults() {
    return {
        ...SERVICE_FLAGS,
        rtlAlgorithmMode: 'advanced_full',
        selectedFont: 'iranyekan',
        fontScale: 100,
        manualRtlSettings: getDefaultManualRtlSettings(),
        mixedTitleDisplayMode: 'unified',
        applyAlgorithmToCode: true,
        flipRtlArrows: true,
        fixMixedText: false,
        experimentalAlgoDefaultOn: true,
        [HALF_SPACE_STORAGE_KEY]: { ...DEFAULT_HALF_SPACE_SITES },
        [SITE_SETTINGS_STORAGE_KEY]: defaultSiteSettings(),
        [PIN_OPEN_SITE_STORAGE_KEY]: getDefaultPinOpenSiteMode(),
        activationHintDismissed: false,
        troubleshootingHintDismissed: true
    };
}

export function buildInstallLocalDefaults() {
    if (!UPDATE_MODAL_ENABLED || !UPDATE_MODAL_ID) {
        return {};
    }
    return { [UPDATE_MODAL_STORAGE_KEY]: UPDATE_MODAL_ID };
}
