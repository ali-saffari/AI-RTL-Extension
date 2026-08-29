// google-drive.js — Gemini sidekick in Drive / Docs / Sheets / Slides / Forms
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/textDirectionUtils.js';

const SIDEKICK = '[class*="appsElementsSidekick"]';
const ICON_SELECTOR = [
    'i', 'svg', 'path', 'use', 'md-icon',
    '[class*="icon"]', '[class*="Icon"]',
    '[class*="material-icons"]',
    '[class*="material-symbols"]',
    '[class*="google-symbols"]'
].join(', ');

const INPUT_SELECTOR = [
    `${SIDEKICK} textarea`,
    `${SIDEKICK} input[type="text"]`,
    `${SIDEKICK} input[type="search"]`,
    `${SIDEKICK} input:not([type])`,
    `${SIDEKICK} [contenteditable="true"]`,
    `${SIDEKICK} [role="textbox"]`
].join(', ');

const MESSAGE_SELECTOR = [
    '.appsElementsSidekickAgentMessageBubbleContent',
    `${SIDEKICK} [class*="MessageBubble"]`,
    `${SIDEKICK} [class*="markdown"]`,
    `${SIDEKICK} [class*="Markdown"]`
].join(', ');

const SECTION_SELECTOR = [
    '.appsElementsSidekickQuestionnaireSection',
    '.appsElementsSidekickQuestionnaireQuestion',
    '.appsElementsSidekickQuestionnaireAnswerOption'
].join(', ');

const TEXT_SELECTOR = [
    '.appsElementsSidekickQuestionnaireSectionTitle',
    '.appsElementsSidekickQuestionnaireSectionDescription',
    '.appsElementsSidekickQuestionnaireQuestionTitle',
    '.appsElementsSidekickQuestionnaireAnswerOptionLabel',
    '.appsElementsSidekickThinkingStateThoughtHeadline',
    '.appsElementsSidekickThinkingStateThoughtsSummary',
    '.appsElementsSidekickThinkingStateHeadline',
    '.appsElementsGenerativeaiScoperSourceChipsSectionTitle',
    '.appsElementsGenerativeaiScoperSourceChipsSectionDescription'
].join(', ');

const LAYOUT_SELECTOR = [
    '.appsElementsSidekickQuestionnaireAnswerOptionTitleContainer',
    '.appsElementsSidekickQuestionnaireSectionTitleContainer',
    '.appsElementsSidekickQuestionnaireAnswerOptions'
].join(', ');

const COPYRIGHT_SELECTOR = `${SIDEKICK} textarea:not(.javascriptMaterialdesignGm3WizTextFieldOutlined-text-field__input)`;

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: true
};

const CONTAINER_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true
};

const TEXT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: true
};

function applyGoogleDriveChrome() {
    if (AQ('#google-drive-font-style').length) {
        return;
    }

    AQ(`<style id="google-drive-font-style">
        html.ai-rtl-has-font [class*="appsElementsSidekick"],
        html.ai-rtl-has-font [class*="appsElementsSidekick"] *:not(code):not(pre):not(kbd):not(samp):not(i):not(svg):not(path):not(use):not(md-icon):not([class*="material-icons"]):not([class*="material-symbols"]):not([class*="google-symbols"]) {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
        }
        [class*="appsElementsSidekick"] code,
        [class*="appsElementsSidekick"] pre,
        [class*="appsElementsSidekick"] kbd,
        [class*="appsElementsSidekick"] samp,
        [class*="appsElementsSidekick"] code *,
        [class*="appsElementsSidekick"] pre * {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
        [class*="appsElementsSidekick"] i,
        [class*="appsElementsSidekick"] svg,
        [class*="appsElementsSidekick"] md-icon,
        [class*="appsElementsSidekick"] [class*="material-icons"],
        [class*="appsElementsSidekick"] [class*="material-symbols"],
        [class*="appsElementsSidekick"] [class*="google-symbols"] {
            font-family: 'Google Symbols', 'google-symbols', 'Material Symbols Outlined', 'Material Icons' !important;
        }

        .appsElementsSidekickAgentMessageBubbleContent[dir="rtl"],
        .appsElementsSidekickQuestionnaireRoot[dir="rtl"],
        .appsElementsSidekickQuestionnaireSection[dir="rtl"],
        .appsElementsSidekickQuestionnaireQuestion[dir="rtl"],
        .appsElementsSidekickQuestionnaireAnswerOption[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate;
        }
        .appsElementsSidekickAgentMessageBubbleContent[dir="ltr"],
        .appsElementsSidekickQuestionnaireRoot[dir="ltr"],
        .appsElementsSidekickQuestionnaireSection[dir="ltr"],
        .appsElementsSidekickQuestionnaireQuestion[dir="ltr"],
        .appsElementsSidekickQuestionnaireAnswerOption[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }

        [dir="rtl"] .appsElementsSidekickQuestionnaireSectionTitle,
        [dir="rtl"] .appsElementsSidekickQuestionnaireQuestionTitle,
        [dir="rtl"] .appsElementsSidekickQuestionnaireAnswerOptionLabel,
        .appsElementsSidekickQuestionnaireSectionTitle[dir="rtl"],
        .appsElementsSidekickQuestionnaireQuestionTitle[dir="rtl"],
        .appsElementsSidekickQuestionnaireAnswerOptionLabel[dir="rtl"] {
            text-align: right !important;
        }

        .appsElementsSidekickQuestionnaireAnswerOptionTitleContainer[dir="rtl"],
        [dir="rtl"] .appsElementsSidekickQuestionnaireAnswerOptionTitleContainer,
        .appsElementsSidekickQuestionnaireSectionTitleContainer[dir="rtl"],
        [dir="rtl"] .appsElementsSidekickQuestionnaireSectionTitleContainer,
        .appsElementsSidekickQuestionnaireAnswerOptions[dir="rtl"],
        [dir="rtl"] .appsElementsSidekickQuestionnaireAnswerOptions {
            direction: rtl !important;
        }

        ${SIDEKICK} textarea[dir="rtl"],
        ${SIDEKICK} input[dir="rtl"],
        ${SIDEKICK} [contenteditable="true"][dir="rtl"],
        ${SIDEKICK} [role="textbox"][dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }
        ${SIDEKICK} textarea[dir="ltr"],
        ${SIDEKICK} input[dir="ltr"],
        ${SIDEKICK} [contenteditable="true"][dir="ltr"],
        ${SIDEKICK} [role="textbox"][dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }
    </style>`).appendTo('head');
}

function invalidateStaleRtl(element) {
    const $el = AQ(element);
    const intended = $el.attr('data-direction');
    const dir = $el.attr('dir');
    if (intended && dir !== intended) {
        $el.removeAttr('data-text-length');
        $el.removeClass('AsOkText AsOk');
    }
}

function processGoogleDriveInput(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToElement(element, rtlAlgorithm, INPUT_OPTIONS);
    AQ(element).find(ICON_SELECTOR).addBack().filter(ICON_SELECTOR).removeClass('FontSet');

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);
    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
        });
    });
}

function processGoogleDriveMessage(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }
    invalidateStaleRtl(element);
    applyRtlToContainer(element, rtlAlgorithm, CONTAINER_OPTIONS);
    AQ(element).find(ICON_SELECTOR).removeClass('FontSet');
}

function processGoogleDriveSection(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }
    invalidateStaleRtl(element);
    applyRtlToElement(element, rtlAlgorithm, TEXT_OPTIONS);
    AQ(element).find(ICON_SELECTOR).removeClass('FontSet');
}

function processGoogleDriveText(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }
    const text = AQ(element).text().trim();
    if (!text) {
        return;
    }
    invalidateStaleRtl(element);
    applyRtlToElement(element, rtlAlgorithm, TEXT_OPTIONS);
}

function processGoogleDriveLayout(element, rtlAlgorithm) {
    const $el = AQ(element);
    const text = $el.text().trim();
    if (!text) {
        return;
    }
    applyRtlToElement(element, rtlAlgorithm, {
        fontClass: false,
        processedClass: false,
        setTextAlign: false
    });
}

function processGoogleDriveCopyright(element) {
    if (!chrome.runtime?.id) {
        return;
    }
    const $el = AQ(element);
    if ($el.closest('.appsElementsSidekickQuestionnaireCustomInputField, .appsElementsSidekickQuestionnaireAnswerOption').length) {
        return;
    }
    addCopyright(
        $el.parent(),
        'AsBoxGoogleDrive AsBoxB',
        'margin-top: 4px; margin-bottom: -8px; font-size: 13px;'
    );
}

export function activateGoogleDrive(rtlAlgorithm = 'advanced_full') {
    console.log('Google Drive RTL activated with algorithm:', rtlAlgorithm);

    applyGoogleDriveChrome();

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => processGoogleDriveInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: MESSAGE_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processGoogleDriveMessage(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: SECTION_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processGoogleDriveSection(el, rtlAlgorithm),
            debounceMs: 150
        },
        {
            selector: TEXT_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processGoogleDriveText(el, rtlAlgorithm),
            debounceMs: 120
        },
        {
            selector: LAYOUT_SELECTOR,
            ignore: ICON_SELECTOR,
            exclude: INPUT_SELECTOR,
            process: (el) => processGoogleDriveLayout(el, rtlAlgorithm),
            debounceMs: 120
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processGoogleDriveCopyright,
            debounceMs: 250
        }
    ]);
}
