// Routes ChatGPT RTL to the UI that is actually on the page.
// #stage-sidebar-tiny-bar is the previous layout (including A/B tests).
import { runChatGptOld, stopChatGptOld, refreshChatGptOldLiveTargets } from './chatgpt-old.js';
import { runChatGptNew, stopChatGptNew, refreshChatGptLiveTargets } from './chatgpt-new.js';

const OLD_UI_SELECTOR = '#stage-sidebar-tiny-bar, .stage-sidebar-tiny-bar';
const UI_DETECT_INTERVAL_MS = 1000;

let uiDetectInterval = 0;
let activeMode = null;
let activeRtlAlgorithm = 'advanced_full';

function isOldChatGptUi() {
    return Boolean(document.querySelector(OLD_UI_SELECTOR));
}

function clearUiDetectInterval() {
    if (uiDetectInterval) {
        clearInterval(uiDetectInterval);
        uiDetectInterval = 0;
    }
}

function switchToMode(next) {
    if (next === activeMode) {
        return;
    }

    if (activeMode === 'old') {
        stopChatGptOld();
    }
    if (activeMode === 'new') {
        stopChatGptNew();
    }

    activeMode = next;
    console.log(activeMode === 'old' ? 'ChatGPT RTL: old 4.0.16' : 'ChatGPT RTL: new');

    if (activeMode === 'old') {
        runChatGptOld(activeRtlAlgorithm);
    } else {
        runChatGptNew(activeRtlAlgorithm);
    }
}

function detectUiTick() {
    const next = isOldChatGptUi() ? 'old' : 'new';

    if (next !== activeMode) {
        switchToMode(next);
        return;
    }

    // Both UIs: light refresh only after first run — observer owns live messages.
    if (activeMode === 'old') {
        refreshChatGptOldLiveTargets(activeRtlAlgorithm);
    } else if (activeMode === 'new') {
        refreshChatGptLiveTargets(activeRtlAlgorithm);
    }
}

export function stopChatGptRTL() {
    clearUiDetectInterval();
    stopChatGptOld();
    stopChatGptNew();
    activeMode = null;
}

export function activateChatGptRTL(rtlAlgorithm = 'advanced_full') {
    activeRtlAlgorithm = rtlAlgorithm;
    clearUiDetectInterval();
    activeMode = null;

    console.log('AI RTL activated with algorithm:', rtlAlgorithm);
    detectUiTick();
    uiDetectInterval = setInterval(detectUiTick, UI_DETECT_INTERVAL_MS);
}
