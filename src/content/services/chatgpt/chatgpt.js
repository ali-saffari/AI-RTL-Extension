// Current ChatGPT UI (chatgpt.com / chat.openai.com).
// Markdown watches the viewport on its own. The rest shares one page observer.
// Legacy UI is parked in chatgpt-old.js. Snapshot of the previous new UI is in chatgpt-new.bak.js.
import { startMarkdown, stopMarkdown } from './chatgpt-markdown.js';
import { applySidebarHistory, applySmallBlocks, setCopyright, setInputs } from './chatgpt-ui.js';

let rtlAlgorithm = 'advanced_full';
let uiObserver = null;

export function stopChatGptRTL() {
    stopMarkdown();
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
    // applySmallBlocks(rtlAlgorithm);
    // applySidebarHistory(rtlAlgorithm);
    // setCopyright();
    // setInputs(rtlAlgorithm);

    // uiObserver = new MutationObserver(() => {
    //     applySmallBlocks(rtlAlgorithm);
    //     applySidebarHistory(rtlAlgorithm);
    //     setCopyright();
    //     setInputs(rtlAlgorithm);
    // });
    // uiObserver.observe(document.body, { childList: true, subtree: true });
}
