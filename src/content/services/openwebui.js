// openwebui.js — Open WebUI chat. Same observer shape as ChatGPT's UI watcher.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const INPUT_SELECTOR = '#chat-input';
const TEXT_SELECTOR = '.markdown-prose, #user-message, [id^="response-content-"]';
const UI_MS = 1000;

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true
};

const TEXT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true
};

let rtlAlgorithm = 'advanced_full';
let uiObserver = null;
let uiLastRun = 0;
let uiTimer = null;

function setOpenWebui() {
    if (chrome.runtime?.id) {
        const $host = AQ('#message-input-container').parent();
        if ($host.length) {
            addCopyright(
                $host,
                'AsBoxGemini AsBoxB',
                'margin-top: -12px; margin-bottom: -5px; font-size: 13px;'
            );
        }
    }

    AQ(INPUT_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            });
        });
    });

    AQ(TEXT_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, TEXT_OPTIONS);
    });
}

export function stopOpenWebui() {
    if (uiTimer) {
        clearTimeout(uiTimer);
        uiTimer = null;
    }
    if (uiObserver) {
        uiObserver.disconnect();
        uiObserver = null;
    }
}

export function activateOpenWebui(algorithm = 'advanced_full') {
    console.log('Open WebUI RTL activated with algorithm:', algorithm);
    stopOpenWebui();
    rtlAlgorithm = algorithm;
    setOpenWebui();

    uiLastRun = 0;
    uiObserver = new MutationObserver(() => {
        const elapsed = Date.now() - uiLastRun;
        const run = () => {
            uiLastRun = Date.now();
            setOpenWebui();
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
    uiObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}
