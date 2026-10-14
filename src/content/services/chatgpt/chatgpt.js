// Current ChatGPT UI (chatgpt.com / chat.openai.com).
// Markdown watches the viewport on its own. The rest shares one page observer.
// Legacy UI is parked in chatgpt-old.js. Snapshot of the previous new UI is in chatgpt-new.bak.js.
import { startMarkdown, stopMarkdown } from './chatgpt-markdown.js';
import { applySidebarHistory, applySmallBlocks, setCopyright, setInputs } from './chatgpt-ui.js';

let rtlAlgorithm = 'advanced_full';
let uiObserver = null;
let uiLastRun = 0;
let uiTimer = null;
const UI_MS = 1000;

export function stopChatGptRTL() {
    stopMarkdown();
    if (uiTimer) {
        clearTimeout(uiTimer);
        uiTimer = null;
    }
    if (uiObserver) {
        uiObserver.disconnect();
        uiObserver = null;
    }
}

export function activateChatGptRTL(algorithm = 'advanced_full') {
    console.log('AI RTL activated with algorithm:', algorithm);
    console.log('ChatGPT RTL: new');
    stopChatGptRTL();
    rtlAlgorithm = algorithm;

    startMarkdown(rtlAlgorithm);
    applySmallBlocks(rtlAlgorithm);
    applySidebarHistory(rtlAlgorithm);
    setCopyright();
    setInputs(rtlAlgorithm);

    uiLastRun = 0;
    uiObserver = new MutationObserver(() => {
        const elapsed = Date.now() - uiLastRun;
        const run = () => {
            uiLastRun = Date.now();
            console.log('ChatGPT uiObserver');
            applySmallBlocks(rtlAlgorithm);
            applySidebarHistory(rtlAlgorithm);
            setCopyright();
            setInputs(rtlAlgorithm);
        };
        if (elapsed < UI_MS) {
            if (!uiTimer) {
                uiTimer = setTimeout(() => {
                    uiTimer = null;
                    run();
                }, UI_MS - elapsed);
            }
            return;
        }
        run();
    });
    uiObserver.observe(document.body, { childList: true, subtree: true });
}
