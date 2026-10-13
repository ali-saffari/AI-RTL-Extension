// zai.js service functions (Z.ai - chat.z.ai)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const IGNORE_SELECTOR = '.thinking-chain-container, .thinking-block';
const THINKING_CHAIN_SELECTOR = '.thinking-chain-container';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"]';
const USER_MESSAGE_SELECTOR = '.textGradientDark, .chat-user .rounded-xl';
const ASSISTANT_SELECTOR = '[class*="markdown"]';
const COPYRIGHT_SELECTOR = '.footer, .chat-container, .main-container';

const ELEMENT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOK',
    ignoreSelector: IGNORE_SELECTOR,
    removeInnerDir: true
};

const USER_MESSAGE_OPTIONS = {
    ...ELEMENT_OPTIONS,
    rtlClass: 'AsRtl'
};

const CONTAINER_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    isContainer: true,
    ignoreSelector: IGNORE_SELECTOR,
    removeInnerDir: true,
    removeDirAuto: true
};

function processZaiThinking(element) {
    AQ(element).attr('dir', 'auto');
    AQ(element).parent().attr('dir', 'auto');
}

function processZaiInput(element, rtlAlgorithm) {
    if (!AQ(element).hasClass('FontSet')) {
        AQ(element).addClass('FontSet');
    }

    applyRtlToElement(element, rtlAlgorithm, ELEMENT_OPTIONS);

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    AQ(element).on('keyup paste input', function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            setTextAlign: true,
            ignoreSelector: IGNORE_SELECTOR,
            removeInnerDir: true
        });
    });
}

function processZaiUserMessage(element, rtlAlgorithm) {
    applyRtlToElement(element, rtlAlgorithm, USER_MESSAGE_OPTIONS);
}

function processZaiAssistant(element, rtlAlgorithm) {
    applyRtlToContainer(element, rtlAlgorithm, CONTAINER_OPTIONS);
}

function processZaiCopyright(element) {
    if (!chrome.runtime?.id) {
        return;
    }

    addCopyright(AQ(element), 'AsBoxB');
}

export function activateZai(rtlAlgorithm = 'advanced_full') {
    console.log('Z.ai RTL activated with algorithm:', rtlAlgorithm);

    observeDomSections([
        {
            selector: THINKING_CHAIN_SELECTOR,
            process: processZaiThinking,
            debounceMs: 50
        },
        {
            selector: INPUT_SELECTOR,
            ignore: IGNORE_SELECTOR,
            process: (el) => processZaiInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: USER_MESSAGE_SELECTOR,
            ignore: IGNORE_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processZaiUserMessage(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: ASSISTANT_SELECTOR,
            ignore: IGNORE_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processZaiAssistant(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processZaiCopyright,
            debounceMs: 200
        }
    ]);
}
