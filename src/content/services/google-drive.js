// google-drive.js service functions (Gemini in Drive / Docs / Sheets / Slides / Forms)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

const GEMINI_ROOT = '[aria-label="Gemini"]';
const COPYRIGHT_FOOTER_SELECTOR = 'footer, [class*="Footer"], [class*="footer"]';
const INPUT_SELECTOR = [
    `${GEMINI_ROOT} textarea`,
    `${GEMINI_ROOT} input[type="text"]`,
    `${GEMINI_ROOT} input[type="search"]`,
    `${GEMINI_ROOT} input:not([type])`,
    `${GEMINI_ROOT} [contenteditable="true"]`,
    `${GEMINI_ROOT} [role="textbox"]`
].join(', ');

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate'
};

// Gemini markdown body in Drive. TZy0Wb stays after dir changes; dir=auto is only the first paint.
const MARKDOWN_SELECTOR = [
    '[jscontroller="TZy0Wb"]',
    '.appsElementsSidekickUserMessageBubbleContent',
    `${GEMINI_ROOT} div[dir="auto"]`
].join(', ');

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    removeDirAuto: true,
    isContainer: true,
    setTextAlign: 'important',
    // onlyCss: true,
    includeTags: ['span']
};

function applyGoogleDriveChrome() {
    if (AQ('#google-drive-font-style').length) {
        return;
    }

    AQ(`<style id="google-drive-font-style">
        ${GEMINI_ROOT} textarea[dir="rtl"],
        ${GEMINI_ROOT} input[dir="rtl"],
        ${GEMINI_ROOT} [contenteditable="true"][dir="rtl"],
        ${GEMINI_ROOT} [role="textbox"][dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }
        ${GEMINI_ROOT} textarea[dir="ltr"],
        ${GEMINI_ROOT} input[dir="ltr"],
        ${GEMINI_ROOT} [contenteditable="true"][dir="ltr"],
        ${GEMINI_ROOT} [role="textbox"][dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }

        /* Drive wipes inline text-align on AST nodes; align from dir instead.
           Paragraphs are span[jsname="t1Rade"] (inline) so they need display:block. */
        [jscontroller="TZy0Wb"][dir="rtl"],
        [jscontroller="TZy0Wb"] [dir="rtl"],
        .appsElementsSidekickUserMessageBubbleContent[dir="rtl"],
        .appsElementsSidekickUserMessageBubbleContent [dir="rtl"] {
            text-align: right !important;
        }
        [jscontroller="TZy0Wb"][dir="ltr"],
        [jscontroller="TZy0Wb"] [dir="ltr"],
        .appsElementsSidekickUserMessageBubbleContent[dir="ltr"],
        .appsElementsSidekickUserMessageBubbleContent [dir="ltr"] {
            text-align: left !important;
        }
        [jscontroller="TZy0Wb"] > span[jsname="t1Rade"] {
            display: block;
        }
    </style>`).appendTo('head');
}

function setGoogleDriveCopyright() {
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
        'AsBoxGoogleDrive AsBoxB',
        'margin-top: -12px; margin-bottom: -8px; font-size: 12px;'
    );
}

function clearDirAuto($root) {
    $root.find('[dir="auto"]').addBack('[dir="auto"]').each(function () {
        if (!this.hasAttribute('data-ai-rtl-orig-dir')) {
            this.setAttribute('data-ai-rtl-orig-dir', this.getAttribute('dir') || 'auto');
        }
        this.removeAttribute('dir');
    });
}

export function setGoogleDrive(rtlAlgorithm = 'advanced_full') {
    applyGoogleDriveChrome();
    setGoogleDriveCopyright();

    AQ(MARKDOWN_SELECTOR).each(function () {
        applyRtlToContainer(this, rtlAlgorithm, MARKDOWN_OPTIONS);
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

export function activateGoogleDrive(rtlAlgorithm = 'advanced_full') {
    console.log('Google Drive RTL activated with algorithm:', rtlAlgorithm);

    setGoogleDrive(rtlAlgorithm);

    setInterval(() => {
        setGoogleDrive(rtlAlgorithm);
    }, 1000);
}
