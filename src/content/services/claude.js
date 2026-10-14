// پاسخ‌های کلاد نزدیک صفحه دیده می‌شوند. استریم با تأخیر پردازش می‌شود و یک پاس آخر هم می‌ماند.
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement, detectDirectionByAlgorithm } from '../utils/directionUtils/index.js';
import { isRtlEngineActive, preserveOriginalDir } from '../utils/originalState.js';

const MARKDOWN = '.standard-markdown, .progressive-markdown, .font-claude-response, #standard-markdown-artifact, #markdown-artifact';
const THROTTLE_MS = 400;
const UI_MS = 1000;

const markdownOptions = {
    fontClass: 'FontSet FontClaude',
    processedClass: 'AsOkText',
    isContainer: true,
    removeInnerDir: true,
    siteConfig: 'claude',
    walkSkipSelector: '[data-not-prose]'
};

let markdownPageObserver = null;
let markdownViewportObserver = null;
const streams = new Map();
let lastRun = new WeakMap();
const trailing = new Map();
let uiObserver = null;
let uiTimer = null;
let uiLastRun = 0;

function watchComposer(element, rtlAlgorithm) {
    const $element = AQ(element);
    if ($element.data('rtl-listener-added')) {
        return;
    }
    $element.data('rtl-listener-added', true);
    if (!$element.hasClass('AsOk')) {
        $element.addClass('AsOk FontClaude');
        applyRtlToElement(element, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    }
    $element.on('keyup paste input', function () {
        requestAnimationFrame(() => {
            applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSet' });
        });
    });
}

function applyMarkdown(element, rtlAlgorithm, reason) {
    if (
        reason &&
        reason.why === 'change' &&
        reason.changes &&
        reason.changes.length &&
        reason.changes.every((change) => {
            if (change.type === 'characterData') {
                return !(change.to || '').trim() && !(change.from || '').trim();
            }
            return !(change.text || '').trim();
        })
    ) {
        return;
    }
    const elapsed = Date.now() - (lastRun.get(element) || 0);
    if (elapsed < THROTTLE_MS) {
        const pending = trailing.get(element);
        if (pending) {
            if (reason && reason.changes) {
                if (pending.reason.changes) {
                    pending.reason.changes.push(...reason.changes);
                } else {
                    pending.reason = { why: reason.why, changes: reason.changes.slice() };
                }
            }
            return;
        }
        const slot = {
            reason: reason && reason.changes
                ? { why: reason.why, changes: reason.changes.slice() }
                : reason
        };
        slot.timer = setTimeout(() => {
            trailing.delete(element);
            applyMarkdown(element, rtlAlgorithm, slot.reason);
        }, THROTTLE_MS - elapsed);
        trailing.set(element, slot);
        return;
    }
    lastRun.set(element, Date.now());
    const $element = AQ(element);
    $element.addClass('AsSetAlgorithm');
    if (element.id === 'standard-markdown-artifact' || element.id === 'markdown-artifact') {
        $element.addClass('AsOk FontSet FontClaude');
    }
    applyRtlToContainer(element, rtlAlgorithm, markdownOptions);
}

function stopMarkdown() {
    if (markdownPageObserver) {
        markdownPageObserver.disconnect();
        markdownPageObserver = null;
    }
    if (markdownViewportObserver) {
        markdownViewportObserver.disconnect();
        markdownViewportObserver = null;
    }
    streams.forEach((observer) => observer.disconnect());
    streams.clear();
    trailing.forEach((slot) => clearTimeout(slot.timer));
    trailing.clear();
    lastRun = new WeakMap();
}

function startMarkdown(rtlAlgorithm) {
    stopMarkdown();

    markdownViewportObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const root = entry.target;
            if (!entry.isIntersecting) {
                const stream = streams.get(root);
                if (stream) {
                    stream.disconnect();
                    streams.delete(root);
                }
                return;
            }
            if (streams.has(root)) {
                return;
            }
            const stream = new MutationObserver((mutations) => {
                const changes = [];
                mutations.forEach((mutation) => {
                    if (mutation.type === 'characterData') {
                        changes.push({
                            type: 'characterData',
                            from: (mutation.oldValue || '').slice(-80),
                            to: (mutation.target.textContent || '').slice(-80)
                        });
                        return;
                    }
                    mutation.addedNodes.forEach((added) => {
                        changes.push({ type: 'added', text: (added.textContent || '').slice(0, 80) });
                    });
                    mutation.removedNodes.forEach((removed) => {
                        changes.push({ type: 'removed', text: (removed.textContent || '').slice(0, 80) });
                    });
                });
                applyMarkdown(root, rtlAlgorithm, { why: 'change', changes });
            });
            stream.observe(root, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
            streams.set(root, stream);
            applyMarkdown(root, rtlAlgorithm, { why: 'viewport' });
        });
    }, { root: null, rootMargin: '300px 0px', threshold: 0 });

    markdownPageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) {
                    return;
                }
                if (node.matches(MARKDOWN)) {
                    markdownViewportObserver.observe(node);
                }
                node.querySelectorAll(MARKDOWN).forEach((element) => {
                    markdownViewportObserver.observe(element);
                });
            });
        });
    });

    markdownPageObserver.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll(MARKDOWN).forEach((element) => {
        markdownViewportObserver.observe(element);
    });
}

// نوار کناری، باکس نوشتن، پیام کاربر و بلوک‌های کوچک.
function refreshChrome(rtlAlgorithm) {
    if (!isRtlEngineActive()) {
        return;
    }

    if (chrome.runtime?.id) {
        const field = document.querySelector('.sticky fieldset.flex.flex-col .items-stretch.transition-all');
        if (field && field.parentElement) {
            addCopyright(AQ(field.parentElement), 'AsBoxClaude AsBoxB', '');
        }
    }

    AQ('.ProseMirror, textarea').each(function () {
        watchComposer(this, rtlAlgorithm);
    });

    AQ('ul.flex.flex-col li > div').each(function () {
        const $item = AQ(this);
        if ($item.data('rtl-listener-added')) {
            return;
        }
        $item.data('rtl-listener-added', true);
        if (detectDirectionByAlgorithm($item.find('.whitespace-nowrap').text(), rtlAlgorithm) === 'rtl') {
            $item.addClass('AsRtlClaudeList');
        }
    });

    AQ('.mb-1 .group').each(function () {
        const $group = AQ(this);
        if ($group.data('rtl-listener-added')) {
            return;
        }
        $group.data('rtl-listener-added', true);
        if (detectDirectionByAlgorithm($group.find('.break-words').text(), rtlAlgorithm) === 'rtl') {
            $group.addClass('AsRtlClaudeUser FontSet');
            $group.find('.break-words').addClass('AsRtl');
        }
    });

    AQ('[data-row-key^="chat:"] .flex-1').each(function () {
        applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    });

    AQ('[data-testid="user-message"]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    });

    const textOptions = {
        fontClass: 'FontSet FontClaude',
        processedClass: 'AsOkText',
        removeInnerDir: true
    };
    AQ('.contents .truncate').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, { ...textOptions, isContainer: false });
    });
    AQ('[data-testid="ask-user-answers-card"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, { ...textOptions, isContainer: true });
    });
    AQ('[data-ask-user-input-banner], [data-cds="AskUserQuestion"]').each(function () {
        const label = this.querySelector('[id$="-label"]');
        const question = label ? label.textContent : '';
        if (detectDirectionByAlgorithm(question, rtlAlgorithm) !== 'rtl') {
            return;
        }
        if (this.getAttribute('dir') !== 'rtl') {
            preserveOriginalDir(this);
            this.setAttribute('dir', 'rtl');
        }
        AQ(this).addClass('FontSet FontClaude');
        const field = this.querySelector('input[type="text"]');
        if (field && field.getAttribute('dir') !== 'rtl') {
            preserveOriginalDir(field);
            field.setAttribute('dir', 'rtl');
        }
    });
    AQ('.contents .font-base-bold, [data-orientation="horizontal"] button').each(function () {
        applyRtlToElement(this, rtlAlgorithm, { ...textOptions, isContainer: true });
    });
    AQ('.artifact-block-cell .leading-tight, .whitespace-pre-wrap.rounded-lg, .group\\/thumbnail p').each(function () {
        applyRtlToElement(this, rtlAlgorithm, { fontClass: 'FontSet', processedClass: 'AsOk' });
    });
    AQ('text').each(function () {
        applyRtlToElement(this, rtlAlgorithm, textOptions);
    });
}

const fontStyleId = 'ai-rtl-claude-font-weights';
const markdownCss = ':is(.standard-markdown, .progressive-markdown, #standard-markdown-artifact, #markdown-artifact)';
const fontCss = `
[data-ask-user-input-banner][dir="rtl"] .text-left,
[data-cds="AskUserQuestion"][dir="rtl"] .text-left {
    text-align: right !important;
}
* {
    --cds-font-weight-regular: 350 !important;
    --cds-font-weight-medium: 500 !important;
    --cds-font-weight-semibold: 680 !important;
    --cds-font-weight-bold: 700 !important;
}
${markdownCss}[dir="rtl"] :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss}[data-ai-rtl-direction="rtl"] :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
[dir="rtl"] ${markdownCss} :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss} :is(p, blockquote, ul, ol, h1, h2, h3, h4, h5, h6)[dir="rtl"] {
    padding-left: calc(var(--spacing) * 8) !important;
    padding-right: 0 !important;
}
${markdownCss}[dir="rtl"] :is(p, blockquote, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss}[data-ai-rtl-direction="rtl"] :is(p, blockquote, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
[dir="rtl"] ${markdownCss} :is(p, blockquote, h1, h2, h3, h4, h5, h6):not([dir="ltr"]),
${markdownCss} :is(p, blockquote, h1, h2, h3, h4, h5, h6)[dir="rtl"] {
    padding-right: var(--msg-text-inset, .5rem) !important;
}
`;

function applyFontWeights() {
    let style = document.getElementById(fontStyleId);
    if (!style) {
        style = document.createElement('style');
        style.id = fontStyleId;
    }
    if (style.textContent !== fontCss) {
        style.textContent = fontCss;
    }
    const parent = document.head || document.documentElement;
    if (style.parentNode !== parent || parent.lastElementChild !== style) {
        parent.appendChild(style);
    }
}

export function stopClaude() {
    if (uiTimer) {
        clearTimeout(uiTimer);
        uiTimer = null;
    }
    if (uiObserver) {
        uiObserver.disconnect();
        uiObserver = null;
    }
    stopMarkdown();
}

export function activateClaude(rtlAlgorithm = 'advanced_full') {
    stopClaude();
    if (!isRtlEngineActive()) {
        return;
    }
    applyFontWeights();
    refreshChrome(rtlAlgorithm);
    startMarkdown(rtlAlgorithm);

    uiLastRun = 0;
    uiObserver = new MutationObserver(() => {
        const elapsed = Date.now() - uiLastRun;
        const run = () => {
            uiLastRun = Date.now();
            refreshChrome(rtlAlgorithm);
        };
        if (elapsed < UI_MS) {
            if (!uiTimer) {
                uiTimer = setTimeout(() => {
                    uiTimer = null;
                    run();
                }, UI_MS - elapsed);
            }
            return;
        }
        run();
    });
    uiObserver.observe(document.body, { childList: true, subtree: true });
}
