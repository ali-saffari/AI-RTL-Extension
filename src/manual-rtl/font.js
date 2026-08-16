import { manualRtlState } from './state.js';
import {
    DEFAULT_FONT_ID,
    NONE_FONT_ID,
    SELECTED_FONT_STORAGE_KEY,
    getFontById,
    getFontFamilyCssValue,
    loadFontsConfig,
    normalizeSelectedFontId,
} from '../utils/fonts';

export async function syncSelectedFont(fontId) {
    const selectedId = normalizeSelectedFontId(fontId);
    manualRtlState.selectedFont = selectedId;

    if (selectedId === NONE_FONT_ID) {
        manualRtlState.selectedFontFamily = null;
        return;
    }

    try {
        const config = await loadFontsConfig();
        const font = getFontById(config, selectedId) || getFontById(config, DEFAULT_FONT_ID);
        manualRtlState.selectedFontFamily = font ? getFontFamilyCssValue(font) : 'iranyekan, sans-serif';
    } catch (error) {
        manualRtlState.selectedFontFamily = selectedId === DEFAULT_FONT_ID ? 'iranyekan, sans-serif' : null;
    }
}

export function initManualRtlFont() {
    try {
        chrome.storage.sync.get([SELECTED_FONT_STORAGE_KEY], (result) => {
            syncSelectedFont(result[SELECTED_FONT_STORAGE_KEY]);
        });
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' && changes[SELECTED_FONT_STORAGE_KEY]) {
                syncSelectedFont(changes[SELECTED_FONT_STORAGE_KEY].newValue);
            }
        });
    } catch (error) {
        syncSelectedFont(DEFAULT_FONT_ID);
    }
}
