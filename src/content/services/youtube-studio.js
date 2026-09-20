// youtube-studio.js service functions (YouTube Studio - studio.youtube.com)
// import { addCopyright } from '../utils/copyright.js';
// import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';
import { applyRtlToElement } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';
import { AI_RTL_ICON_SELECTOR } from '../utils/pageFontStyle.js';

const ICON_SELECTOR = [
    AI_RTL_ICON_SELECTOR,
    'yt-icon',
    'yt-icon-shape',
    'tp-yt-iron-icon',
    'iron-icon'
].join(', ');

const INPUT_SELECTOR = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    '[contenteditable="true"]',
    '#textbox'
].join(', ');

// const TEXT_SELECTOR = [
//     '#video-title',
//     'a#video-title',
//     '#content-text',
//     '#description'
// ].join(', ');

// const MARKDOWN_SELECTOR = [
//     '[class*="markdown"]',
//     '[class*="prose"]',
//     '[class*="message"]',
//     '[class*="chat"]',
//     '.msg-content'
// ].join(', ');

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate',
    applyFontIfRtl: true
};

// const TEXT_OPTIONS = {
//     fontClass: 'FontSet',
//     processedClass: 'AsOk',
//     setTextAlign: 'important',
//     applyFontIfRtl: true
// };

// const MARKDOWN_OPTIONS = {
//     fontClass: 'FontSet',
//     processedClass: 'AsOkText',
//     removeDirAuto: true,
//     isContainer: true,
//     setTextAlign: 'important',
//     applyFontIfRtl: true
// };

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

function applyYoutubeStudioChrome() {
    if (AQ('#youtube-studio-dir-style').length) {
        return;
    }

    AQ(`<style id="youtube-studio-dir-style">
        #textbox[dir="rtl"],
        textarea[dir="rtl"],
        input[dir="rtl"],
        [contenteditable="true"][dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }
        #textbox[dir="ltr"],
        textarea[dir="ltr"],
        input[dir="ltr"],
        [contenteditable="true"][dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }
        /* #video-title[dir="rtl"],
        a#video-title[dir="rtl"],
        #content-text[dir="rtl"],
        #description[dir="rtl"],
        yt-formatted-string[dir="rtl"],
        [data-direction="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }
        #video-title[dir="ltr"],
        a#video-title[dir="ltr"],
        #content-text[dir="ltr"],
        #description[dir="ltr"],
        yt-formatted-string[dir="ltr"],
        [data-direction="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        } */
    </style>`).appendTo('head');
}

export function setYoutubeStudio(rtlAlgorithm = 'advanced_full') {
    applyYoutubeStudioChrome();
    AQ(ICON_SELECTOR).removeClass('FontSet');

    // if (chrome.runtime?.id) {
    //     addCopyright(
    //         AQ('form, footer, [class*="footer"]'),
    //         'AsBoxGemini AsBoxB',
    //         'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
    //     );
    // }

    AQ(INPUT_SELECTOR).each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            });
        });
    });

    // AQ(TEXT_SELECTOR).each(function () {
    //     applyRtlToElement(this, rtlAlgorithm, TEXT_OPTIONS);
    // });

    // AQ(MARKDOWN_SELECTOR).each(function () {
    //     applyRtlToContainer(this, rtlAlgorithm, MARKDOWN_OPTIONS);
    // });

    AQ(ICON_SELECTOR).removeClass('FontSet');
}

export function activateYoutubeStudio(rtlAlgorithm = 'advanced_full') {
    console.log('YouTube Studio RTL activated with algorithm:', rtlAlgorithm);
    setYoutubeStudio(rtlAlgorithm);

    let studioInterval;
    const stopYoutubeStudioTimers = () => {
        clearInterval(studioInterval);
    };

    studioInterval = setInterval(() => {
        if (!isExtensionContextValid() || !isRtlEngineActive()) {
            stopYoutubeStudioTimers();
            return;
        }

        try {
            setYoutubeStudio(rtlAlgorithm);
        } catch (error) {
            if (!isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated')) {
                stopYoutubeStudioTimers();
                return;
            }
            throw error;
        }
    }, 1000);
}
