// 1minai.js service functions (1min.AI - 1min.ai / app.1min.ai)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"], .ant-input';
const TYPOGRAPHY_SELECTOR = '.ant-typography';
const MARKDOWN_SELECTOR = '.cmrGwy, [class*="markdown"], [class*="prose"], [class*="message"], [class*="chat"], .msg-content';
const COPYRIGHT_SELECTOR = '.sc-jSBIZs';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk'
};

const TYPOGRAPHY_OPTIONS = {
    fontClass: 'FontSet',
    rtlClass: 'AsOkRList'
};

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    isContainer: true,
    setTextAlign: true
};

function apply1minaiChrome() {
    if (!AQ('#1minai-font-style').length) {
        AQ(`<style id="1minai-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font :where(.css-b9n3i9).ant-input,
            html.ai-rtl-has-font .ant-input {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font :is(code, pre, kbd, samp),
            html.ai-rtl-has-font :is(code, pre) * {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
        </style>`).appendTo('head');
    }

    AQ('body').each(function () {
        if (!AQ(this).hasClass('FontSet')) {
            AQ(this).addClass('FontSet');
        }
    });

    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function alignTextareaOverlay($textarea) {
    if (!$textarea.is('textarea')) {
        return;
    }

    const direction = $textarea.attr('data-direction') || $textarea.attr('dir') || 'ltr';
    const siblings = $textarea.siblings('div');
    const parentContainer = $textarea.parent();
    const closestRelative = $textarea.closest('[style*="position"]');
    const searchContainer = closestRelative.length ? closestRelative : parentContainer;

    const adjacentDiv = siblings.add(searchContainer.find('div')).filter(function () {
        const $div = AQ(this);
        if ($div.is('textarea, input') || $div.find('textarea, input').length > 0) {
            return false;
        }
        return $div.css('position') === 'absolute';
    });

    if (!adjacentDiv.length) {
        return;
    }

    adjacentDiv.each(function () {
        const $div = AQ(this);
        if (direction === 'rtl') {
            $div.css({ right: 'auto', left: '10px' });
        } else {
            $div.css({ left: 'auto', right: '10px' });
        }
    });
}

function process1minaiInput(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToElement(element, rtlAlgorithm, INPUT_OPTIONS);
    alignTextareaOverlay(AQ(element));
    AQ(ICON_SELECTOR).removeClass('FontSet');

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            alignTextareaOverlay(AQ(this));
            AQ(ICON_SELECTOR).removeClass('FontSet');
        });
    });
}

function process1minaiTypography(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToElement(element, rtlAlgorithm, TYPOGRAPHY_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function process1minaiMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');
}

function process1minaiCopyright(element) {
    if (!chrome.runtime?.id) {
        return;
    }

    const $element = AQ(element);
    if ($element.is('form') && !$element.has('textarea, [contenteditable="true"], .ant-input').length) {
        return;
    }

    addCopyright(
        $element,
        'AsBoxGemini AsBoxB',
        'margin-top: 4px; margin-bottom: -16px; font-size: 13px;'
    );
}

export function activate1minai(rtlAlgorithm = 'advanced_full') {
    console.log('1min.AI RTL activated with algorithm:', rtlAlgorithm);

    apply1minaiChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => process1minaiInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: TYPOGRAPHY_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => process1minaiTypography(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: MARKDOWN_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: `${INPUT_SELECTOR}, ${TYPOGRAPHY_SELECTOR}`,
            process: (el) => process1minaiMarkdown(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: process1minaiCopyright,
            debounceMs: 200
        }
    ]);
}
