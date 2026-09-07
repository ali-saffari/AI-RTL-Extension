// google-drive.js service functions (Gemini in Drive / Docs / Sheets / Slides / Forms)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

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

const WORKSPACE_FONT_CSS = `
        html.ai-rtl-has-font {
            --ai-rtl-drive-ui-fallback: "Google Sans Flex", "Google Sans", "Helvetica Neue", sans-serif;
        }
        html.ai-rtl-has-font body :where(
            p,
            span,
            div,
            mark,
            a,
            h1, h2, h3, h4, h5, h6,
            li,
            label,
            button,
            input,
            textarea,
            select,
            option,
            em,
            strong,
            b,
            i,
            small,
            time,
            cite,
            q,
            blockquote,
            figcaption,
            summary,
            dt, dd,
            th, td, caption,
            legend,
            [role="heading"],
            [role="button"],
            [role="menuitem"],
            [role="option"],
            [role="tab"]
        ):not(
            pre,
            pre *,
            code,
            code *,
            [aria-hidden="true"],
            [style*="font-"],
            [class*="icon"],
            [class*="Icon"],
            [class*="symbol"],
            [class*="Symbol"],
            [class*="material-symbol"],
            [class*="material-icon"],
            [class*="google-material"],
            [class*="docs-icon"],
            [class*="gm3-icon"],
            .google-symbols,
            .lumi-symbols,
            .mat-ligature-font,
            [data-mat-icon-type="font"]
        ) {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif), var(--ai-rtl-drive-ui-fallback) !important;
        }
        html.ai-rtl-has-font body code,
        html.ai-rtl-has-font body code *,
        html.ai-rtl-has-font body pre,
        html.ai-rtl-has-font body pre *,
        html.ai-rtl-has-font body kbd,
        html.ai-rtl-has-font body kbd *,
        html.ai-rtl-has-font body samp,
        html.ai-rtl-has-font body samp * {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
`;

const ICON_SELECTOR = '.google-symbols, .lumi-symbols, .mat-ligature-font, [class*="docs-icon"], [class*="gm3-icon"], [class*="google-material"]';

function isDriveFileManager() {
    const host = String(location.hostname || '')
        .replace(/^www\./, '')
        .toLowerCase();
    return host === 'drive.google.com' || host.endsWith('.drive.google.com');
}

function applyGoogleDriveChrome() {
    if (AQ('#google-drive-font-style').length) {
        return;
    }

    const cssParts = [
        GEMINI_ROOT + ' textarea[dir="rtl"],',
        GEMINI_ROOT + ' input[dir="rtl"],',
        GEMINI_ROOT + ' [contenteditable="true"][dir="rtl"],',
        GEMINI_ROOT + ' [role="textbox"][dir="rtl"] {',
        '    direction: rtl !important;',
        '    text-align: right !important;',
        '    unicode-bidi: isolate !important;',
        '}',
        GEMINI_ROOT + ' textarea[dir="ltr"],',
        GEMINI_ROOT + ' input[dir="ltr"],',
        GEMINI_ROOT + ' [contenteditable="true"][dir="ltr"],',
        GEMINI_ROOT + ' [role="textbox"][dir="ltr"] {',
        '    direction: ltr !important;',
        '    text-align: left !important;',
        '}',
        '[jscontroller="TZy0Wb"][dir="rtl"],',
        '[jscontroller="TZy0Wb"] [dir="rtl"],',
        '.appsElementsSidekickUserMessageBubbleContent[dir="rtl"],',
        '.appsElementsSidekickUserMessageBubbleContent [dir="rtl"],',
        GEMINI_ROOT + ' .appsElementsSidekickHeaderTitle[dir="rtl"],',
        GEMINI_ROOT + ' [role="menuitem"][dir="rtl"] {',
        '    text-align: right !important;',
        '}',
        '[jscontroller="TZy0Wb"][dir="ltr"],',
        '[jscontroller="TZy0Wb"] [dir="ltr"],',
        '.appsElementsSidekickUserMessageBubbleContent[dir="ltr"],',
        '.appsElementsSidekickUserMessageBubbleContent [dir="ltr"],',
        GEMINI_ROOT + ' .appsElementsSidekickHeaderTitle[dir="ltr"],',
        GEMINI_ROOT + ' [role="menuitem"][dir="ltr"] {',
        '    text-align: left !important;',
        '}',
        '[jscontroller="TZy0Wb"] > span[jsname="t1Rade"] {',
        '    display: block;',
        '}'
    ];

    if (isDriveFileManager()) {
        cssParts.push(WORKSPACE_FONT_CSS);
    }

    const style = document.createElement('style');
    style.id = 'google-drive-font-style';
    style.textContent = cssParts.join('\n');
    document.head.appendChild(style);
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
    if (isDriveFileManager()) {
        AQ(ICON_SELECTOR).removeClass('FontSet');
    }
    setGoogleDriveCopyright();

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

export function activateGoogleDrive(rtlAlgorithm = 'advanced_full') {
    console.log('Google Drive RTL activated with algorithm:', rtlAlgorithm);

    setGoogleDrive(rtlAlgorithm);

    setInterval(() => {
        setGoogleDrive(rtlAlgorithm);
    }, 1000);
}
