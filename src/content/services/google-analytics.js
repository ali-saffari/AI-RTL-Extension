// google-analytics.js service functions (Gemini in Google Analytics - analytics.google.com)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';
import { AI_RTL_ICON_SELECTOR, ensureAiRtlPageFontStyle } from '../utils/pageFontStyle.js';

const GEMINI_ROOT = [
    '[aria-label="Gemini"]',
    '[aria-label*="Gemini" i]',
    '[aria-label*="Ask Analytics" i]'
].join(', ');

const COPYRIGHT_FOOTER_SELECTOR = 'footer, [class*="Footer"], [class*="footer"], form';

const INPUT_SELECTOR = [
    'material-input',
    'material-input input',
    'material-input textarea'
].join(', ');

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate'
};

const GEMINI_TEXT_SELECTOR = [
    `${GEMINI_ROOT} .appsElementsSidekickHeaderTitle`,
    `${GEMINI_ROOT} [role="menuitem"]`,
    `${GEMINI_ROOT} .javascriptMaterialdesignGm3WizListShared-list-item__primary-text`
].join(', ');

const GEMINI_TEXT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: 'important'
};

const MARKDOWN_SELECTOR = 'chat-message';

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    removeDirAuto: true,
    isContainer: true,
    setTextAlign: 'important',
    includeTags: ['span']
};

function applyGoogleAnalyticsChrome() {
    ensureAiRtlPageFontStyle('"Google Sans Flex", "Google Sans", "Helvetica Neue", sans-serif');

    if (AQ('#google-analytics-dir-style').length) {
        return;
    }

    const cssParts = [
        'material-input[dir="rtl"],',
        'material-input input[dir="rtl"],',
        'material-input textarea[dir="rtl"] {',
        '    direction: rtl !important;',
        '    text-align: right !important;',
        '    unicode-bidi: isolate !important;',
        '}',
        'material-input[dir="ltr"],',
        'material-input input[dir="ltr"],',
        'material-input textarea[dir="ltr"] {',
        '    direction: ltr !important;',
        '    text-align: left !important;',
        '}',
        'main-content[dir="rtl"],',
        'main-content [dir="rtl"] {',
        '    text-align: right !important;',
        '}',
        'main-content[dir="ltr"],',
        'main-content [dir="ltr"] {',
        '    text-align: left !important;',
        '}'
    ];

    const style = document.createElement('style');
    style.id = 'google-analytics-dir-style';
    style.textContent = cssParts.join('\n');
    document.head.appendChild(style);
}

function setGoogleAnalyticsCopyright() {
    if (!chrome.runtime?.id) {
        return;
    }

    const $root = AQ(GEMINI_ROOT);
    if (!$root.length) {
        return;
    }

    let $footer = $root.children(COPYRIGHT_FOOTER_SELECTOR);
    if (!$footer.length) {
        $footer = $root.find(COPYRIGHT_FOOTER_SELECTOR).last();
    } else {
        $footer = $footer.last();
    }

    if (!$footer.length) {
        return;
    }

    addCopyright(
        $footer,
        'AsBoxGemini AsBoxB',
        'margin-top: -12px; margin-bottom: -8px; font-size: 12px;'
    );
}

export function setGoogleAnalytics(rtlAlgorithm = 'advanced_full') {
    applyGoogleAnalyticsChrome();
    AQ(AI_RTL_ICON_SELECTOR).removeClass('FontSet');
    setGoogleAnalyticsCopyright();

    AQ(MARKDOWN_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, MARKDOWN_OPTIONS);
    });

    AQ(GEMINI_TEXT_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, GEMINI_TEXT_OPTIONS);
    });

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
}

export function activateGoogleAnalytics(rtlAlgorithm = 'advanced_full') {
    console.log('Google Analytics RTL activated with algorithm:', rtlAlgorithm);

    setGoogleAnalytics(rtlAlgorithm);

    setInterval(() => {
        setGoogleAnalytics(rtlAlgorithm);
    }, 1000);
}
