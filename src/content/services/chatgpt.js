// Routes ChatGPT RTL to the UI that is actually on the page.
// #stage-sidebar-tiny-bar is the previous layout (including A/B tests).
import { runChatGptOld, stopChatGptOld } from './chatgpt-old.js';
import { runChatGptNew, stopChatGptNew } from './chatgpt-new.js';

const OLD_UI_SELECTOR = '#stage-sidebar-tiny-bar, .stage-sidebar-tiny-bar';

function isOldChatGptUi() {
    return Boolean(document.querySelector(OLD_UI_SELECTOR));
}

export function stopChatGptRTL() {
    stopChatGptOld();
    stopChatGptNew();
}

export function activateChatGptRTL(rtlAlgorithm = 'advanced_full') {
    let mode = null;
    let sawOldUi = false;

    const tick = () => {
        if (isOldChatGptUi()) {
            sawOldUi = true;
        }
        const next = sawOldUi ? 'old' : 'new';
        if (next !== mode) {
            if (mode === 'old') {
                stopChatGptOld();
            }
            if (mode === 'new') {
                stopChatGptNew();
            }
            mode = next;
            console.log(mode === 'old' ? 'ChatGPT RTL: old 4.0.16' : 'ChatGPT RTL: new');
        }
        if (mode === 'old') {
            runChatGptOld(rtlAlgorithm);
        } else {
            runChatGptNew(rtlAlgorithm);
        }
    };

    console.log('AI RTL activated with algorithm:', rtlAlgorithm);
    tick();
    setInterval(tick, 1000);
}
