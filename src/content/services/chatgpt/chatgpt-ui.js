// Everything outside assistant markdown: small blocks, sidebar history, inputs, copyright.
import { addCopyright } from '../../utils/copyright.js';
import { applyRtlToElement } from '../../utils/directionUtils/index.js';
import { MARKDOWN } from './chatgpt-markdown.js';

const INPUT = 'textarea, input[type="text"], input[type="search"], input:not([type]), .ProseMirror, [contenteditable="true"]';

// Global ChatGPT font for the whole page.
export function setPageFont() {
    AQ('body').addClass('FontSetGPT');
}

// User bubbles, suggested follow-ups, suggestion rows, writing-block titles,
// and Codex request-card questions/options. Composer inputs inside request cards stay on setInputs.
export function applySmallBlocks(rtlAlgorithm) {
    AQ('[data-message-author-role="user"], .text-user-message, [data-user-message-bubble]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true,
            removeDirAuto: true,
            forceCodeLtr: rtlAlgorithm === 'advanced_full'
        });
    });

    AQ('button[class*="suggested-followup"]').each(function () {
        if (AQ(this).hasClass('AsOkSuggest')) {
            return;
        }
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOkSuggest',
            setTextAlign: 'important',
            ignoreSelector: 'svg'
        });
    });

    AQ('ul.divide-token-border-light .whitespace-pre-wrap').each(function () {
        if (AQ(this).hasClass('AsOk')) {
            return;
        }
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    });

    AQ('header[class*="header-"] .overflow-hidden.whitespace-nowrap').each(function () {
        const header = this.closest('header[class*="header-"]');
        const parent = header && header.parentElement;
        if (!parent || !parent.querySelector('.writing-block-editor, textarea[name="subject"], textarea[aria-label="Subject"]')) {
            return;
        }
        const text = (this.textContent || '').trim();
        if (!text) {
            return;
        }
        const sig = `${text.length}:${text.slice(0, 24)}:${text.slice(-24)}`;
        if (this.getAttribute('data-ai-rtl-title-sig') === sig && AQ(this).hasClass('AsOk')) {
            return;
        }
        AQ(this).removeClass('AsOk');
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true
        });
        this.setAttribute('data-ai-rtl-title-sig', sig);
    });

    AQ('[data-codex-composer-request-navigation="true"]').each(function () {
        AQ(this).find('.wrap-anywhere.font-medium, [role="radio"]').each(function () {
            if (AQ(this).hasClass('AsOk')) {
                return;
            }
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSetGPT',
                processedClass: 'AsOk',
                setTextAlign: true,
                ignoreSelector: 'svg'
            });
        });
    });

    AQ('.text-token-text-secondary span').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk'
        });
    });
}

// Project rows, Recents chats, and chats inside projects (same listitem pass).
export function applySidebarHistory(rtlAlgorithm) {
    AQ('[data-app-action-sidebar-section-heading="Recents"] [role="listitem"], [data-sidebar-project-kind] [role="list"] [role="listitem"], [data-app-action-sidebar-project-row]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSetGPT',
            processedClass: 'AsOk',
            setTextAlign: true
        });
    });
}

// Mobile composer prompt (kept out of setInputs; it uses its own algorithm attr).
export function setMobileComposer(rtlAlgorithm) {
    AQ('#mobile-composer-prompt, [data-mobile-composer-prompt]').each(function () {
        const algorithm = AQ(this).attr('data-algorithm-rtl') || rtlAlgorithm;
        applyRtlToElement(this, algorithm, {
            fontClass: 'FontSetGPT',
            setTextAlign: true,
            removeDirAuto: true,
            forceCodeLtr: algorithm === 'advanced_full'
        });
    });
}

// Live RTL on textareas, inputs, and ProseMirror composers.
// Skips hidden mirrors, code panes, table controls, and markdown editors.
export function setInputs(rtlAlgorithm) {
    AQ(INPUT).each(function () {
        if (
            this.id === 'mobile-composer-prompt' ||
            this.id === 'prompt-textarea' ||
            (this.classList.contains('ProseMirror') && this.closest(MARKDOWN)) ||
            this.closest('[class*="InlineCodePane-"]') ||
            this.closest('[data-writing-block-table-controls-container]')
        ) {
            return;
        }
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        const applyInput = (element) => {
            AQ(element).removeClass('AsOk');
            element.removeAttribute('data-ai-rtl-editor');
            element.removeAttribute('data-ai-rtl-sig');
            applyRtlToElement(element, rtlAlgorithm, {
                fontClass: 'FontSetGPT',
                setTextAlign: true
            });
        };

        applyInput(this);
        AQ(this).on('input keyup paste', function () {
            requestAnimationFrame(() => applyInput(this));
        });
    });
}

// AI RTL credit near the thread footer / composer layout.
export function setCopyright() {
    if (!chrome.runtime?.id) {
        return;
    }
    let $target = AQ('[data-thread-scroll-footer="true"] [data-pip-obstacle="thread-footer"]');
    if (!$target.length) {
        const body = document.querySelector('[class^="ComposerLayoutBody"], [class*=" ComposerLayoutBody"]');
        const form = body && body.closest && body.closest('form');
        const twoUp = form && form.parentElement && form.parentElement.parentElement;
        if (twoUp) {
            $target = AQ(twoUp);
        }
    }
    if (!$target.length) {
        $target = AQ('#thread-bottom .w-full .pointer-events-auto');
    }
    if ($target.length) {
        addCopyright($target, 'text-xs text-token-text-secondary AsBoxB', 'margin-top: 9px; margin-bottom: -11px;');
    }
}
