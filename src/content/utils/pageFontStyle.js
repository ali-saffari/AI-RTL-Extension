export const AI_RTL_FONT_STYLE_ID = 'ai-rtl-font-style';

export const AI_RTL_ICON_SELECTOR = [
    'mat-icon',
    '.mat-icon',
    '.lm-icon-m',
    '.lumi-symbols',
    '.mat-ligature-font',
    '.mat-icon-no-color',
    '.google-symbols',
    '[data-mat-icon-type="font"]'
].join(', ');

const ICON_FONT_FAMILY = "'Google Symbols', 'google-symbols', 'Material Symbols Outlined', 'Material Symbols Rounded', 'Material Icons', 'Material Icons Outlined'";

const DEFAULT_NOT_SELECTORS = [
    'pre',
    'pre *',
    'code',
    'code *',
    '[data-not-prose]',
    '[data-not-prose] *',
    'mat-icon',
    'mat-icon *',
    '[aria-hidden="true"]',
    '[data-cds="Icon"]',
    '[style*="font-"]',
    '[class*="icon"]',
    '[class*="Icon"]',
    '[class*="symbol"]',
    '[class*="Symbol"]',
    '[class*="material-symbol"]',
    '[class*="material-icon"]',
    '[class*="iconfont"]',
    '.google-symbols',
    '.lumi-symbols',
    '.lm-icon-m',
    '.mat-ligature-font',
    '.mat-icon-no-color',
    '[data-mat-icon-type="font"]'
];

function buildPageFontCss(uiFallback) {
    const fallbackValue = uiFallback || 'sans-serif';
    const notSelectors = DEFAULT_NOT_SELECTORS.join(',\n                ');

    return `
            html.ai-rtl-has-font {
                --ai-rtl-ui-fallback: ${fallbackValue};
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
                ${notSelectors}
            ) {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif), var(--ai-rtl-ui-fallback) !important;
            }
        `;
}

export function ensureAiRtlPageFontStyle(uiFallback) {
    if (document.getElementById(AI_RTL_FONT_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = AI_RTL_FONT_STYLE_ID;
    style.textContent = buildPageFontCss(uiFallback);
    (document.head || document.documentElement).appendChild(style);

    // if (document.body && !document.body.classList.contains('FontSet')) {
    //     document.body.classList.add('FontSet');
    // }
}
