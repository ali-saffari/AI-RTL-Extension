// elicit.js service functions (Elicit - elicit.com)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const INPUT_SELECTOR = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    '[contenteditable="true"]'
].join(', ');

const TEXT_SELECTOR = [
    '[class*="markdown"]',
    '[class*="prose"]',
    '[class*="message"]',
    '[class*="answer"]',
    '[class*="report"]',
    '[class*="abstract"]'
].join(', ');

const SUGGESTION_BUTTON_SELECTOR = 'ul[aria-label="Suggested follow-up actions"] button';
const SUGGESTION_TEXT_SELECTOR = 'ul[aria-label="Suggested follow-up actions"] button span.min-w-0';

const SUGGESTION_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkSuggest',
    setTextAlign: 'important',
    applyFontIfRtl: true,
    ignoreSelector: 'svg'
};

function applyElicitSuggestionChrome() {
    if (AQ('#elicit-suggestion-dir-style').length) {
        return;
    }

    AQ(`<style id="elicit-suggestion-dir-style">
        ul[aria-label="Suggested follow-up actions"] button[dir="rtl"],
        ul[aria-label="Suggested follow-up actions"] button[dir="rtl"] span.min-w-0 {
            direction: rtl !important;
            text-align: right !important;
        }
        ul[aria-label="Suggested follow-up actions"] button[dir="ltr"],
        ul[aria-label="Suggested follow-up actions"] button[dir="ltr"] span.min-w-0 {
            direction: ltr !important;
            text-align: left !important;
        }
    </style>`).appendTo('head');
}

function alignSuggestionButton($button) {
    const isRtl = $button.attr('dir') === 'rtl' || $button.find('span.min-w-0').attr('dir') === 'rtl';
    if (isRtl) {
        $button.attr('dir', 'rtl');
        $button.find('.text-left').removeClass('text-left').addClass('text-right');
        $button.removeClass('text-left').addClass('text-right');
        return;
    }
    if ($button.attr('dir') === 'ltr') {
        $button.find('.text-right').removeClass('text-right').addClass('text-left');
        $button.removeClass('text-right').addClass('text-left');
    }
}

export function setElicit(rtlAlgorithm = 'advanced_full') {
    applyElicitSuggestionChrome();

    if (chrome.runtime?.id) {
        addCopyright(
            AQ('.relative.bg-default.shrink-0.duration-200.ease-in-out').filter(function () {
                return this.classList.contains('transition-[padding-right]');
            }),
            'AsBoxGemini AsBoxB',
            'margin-top: -7px; margin-bottom: 6px; font-size: 13px;'
        );
    }

    AQ(INPUT_SELECTOR).each(function () {
        if (AQ(this).data('rtl-listener-added')) {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsOk'
            });
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });

        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, {
                    fontClass: 'FontSet'
                });
            });
        });
    });

    AQ(TEXT_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ(SUGGESTION_TEXT_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, SUGGESTION_OPTIONS);
    });

    AQ(SUGGESTION_BUTTON_SELECTOR).each(function () {
        applyRtlToElement(this, rtlAlgorithm, SUGGESTION_OPTIONS);
        alignSuggestionButton(AQ(this));
    });
}

export function activateElicit(rtlAlgorithm = 'advanced_full') {
    console.log('Elicit RTL activated with algorithm:', rtlAlgorithm);

    setElicit(rtlAlgorithm);

    setInterval(() => {
        setElicit(rtlAlgorithm);
    }, 500);
}
