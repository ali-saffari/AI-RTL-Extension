// codecraft.js service functions (CodeCraft API - codecraftapi.com)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';
import { ensureAiRtlPageFontStyle } from '../utils/pageFontStyle.js';

const CODE_IGNORE = 'pre, code, kbd, samp, .monaco-editor, [class*="cm-editor"]';

const INPUT_SELECTOR = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    '[contenteditable="true"]',
    '[contenteditable="plaintext-only"]',
    '[role="textbox"]'
].join(', ');

const USER_SELECTOR = '[x-text="userText(msg)"]';
const ASSISTANT_SELECTOR = '[x-html="renderContent(msg)"]';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true
};

const USER_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    setTextAlign: true
};

const ASSISTANT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true
};

function isCode(element) {
    return AQ(element).closest(CODE_IGNORE).length > 0;
}

export function setCodecraft(rtlAlgorithm = 'advanced_full') {
    ensureAiRtlPageFontStyle('sans-serif');

    if (chrome.runtime?.id) {
        addCopyright(
            AQ('form[\\@submit\\.prevent="send"]').parent(),
            'AsBoxGemini AsBoxB',
            'margin-top: 0px; margin-bottom: -14px; font-size: 13px;'
        );
    }

    AQ(INPUT_SELECTOR).each(function () {
        if (isCode(this)) {
            return;
        }

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

    AQ(USER_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, USER_OPTIONS);
    });

    AQ(ASSISTANT_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, ASSISTANT_OPTIONS);
    });
}

export function activateCodecraft(rtlAlgorithm = 'advanced_full') {
    console.log('CodeCraft API RTL activated with algorithm:', rtlAlgorithm);

    setCodecraft(rtlAlgorithm);

    setInterval(() => {
        setCodecraft(rtlAlgorithm);
    }, 1000);
}
