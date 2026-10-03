// youtube.js — Ask about this video (YouTube watch page, target-id PAyouchat)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';
import { isRtlEngineActive } from '../utils/originalState.js';

const PANEL_SELECTOR = 'ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"]';
const MARKDOWN_SELECTOR = 'markdown-div';
const USER_TEXT_SELECTOR = '.ytwYouChatItemViewModelHost';
const USER_TURN_SELECTOR = '.ytChatUserTurnViewModelTextContainer';
const USER_TURN_HOST_SELECTOR = 'yt-chat-user-turn-view-model';
const CHIP_SELECTOR = 'you-chat-chips-data button, button.ytwYouChatChipsDataChip';
const INPUT_SELECTOR = 'yt-chat-input-view-model textarea, textarea.chatInputViewModelChatInput';
const DISCLAIMER_SELECTOR = '.chatInputViewModelChatDisclaimer, yt-disclaimer-item-view-model';
const SHELF_SELECTOR = '.ytwHorizontalShelfViewModelItems';
const TEXT_LINE_SELECTOR = '.ytAttributedStringHost, yt-formatted-string#title-text';

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    removeDirAuto: true,
    isContainer: true,
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate',
    applyFontIfRtl: true,
    forceCodeLtr: true
};

const TEXT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: false,
    processTables: false,
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate',
    applyFontIfRtl: true
};

const TEXT_LINE_OPTIONS = {
    ...TEXT_OPTIONS,
    processedClass: false,
    removeDirAuto: true
};

const CHIP_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate',
    applyFontIfRtl: true
};

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: false,
    setTextAlign: 'important',
    setUnicodeBidi: 'isolate',
    applyFontIfRtl: true
};

const PANEL_CSS = `
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] markdown-div[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytwYouChatItemViewModelHost[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytChatUserTurnViewModelTextContainer[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] yt-chat-user-turn-view-model[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .chatInputViewModelChatDisclaimer[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] button.ytwYouChatChipsDataChip[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] you-chat-chips-data button[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] textarea[dir="rtl"] {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: isolate !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] markdown-div[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytwYouChatItemViewModelHost[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytChatUserTurnViewModelTextContainer[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] yt-chat-user-turn-view-model[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .chatInputViewModelChatDisclaimer[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] button.ytwYouChatChipsDataChip[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] you-chat-chips-data button[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] textarea[dir="ltr"] {
    direction: ltr !important;
    text-align: left !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] markdown-div[dir="rtl"] :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption) {
    direction: rtl !important;
    text-align: right !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] markdown-div[dir="ltr"] :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption) {
    direction: ltr !important;
    text-align: left !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] markdown-div[dir="rtl"] :is(ul, ol) {
    padding-left: 0 !important;
    padding-right: 1.4em !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] markdown-div[dir="ltr"] :is(ul, ol) {
    padding-right: 0 !important;
    padding-left: 1.4em !important;
}
/* Source cards are a horizontal shelf. dir on the row flips margin-inline and the scroll. */
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytwHorizontalShelfViewModelItems,
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytwHorizontalShelfViewModelItems :is(
    yt-lockup-view-model,
    yt-lockup-metadata-view-model,
    .ytLockupViewModelWrapper,
    .ytLockupViewModelHost,
    .ytLockupViewModelMetadata,
    .ytLockupMetadataViewModelHost,
    .ytLockupMetadataViewModelTextContainer
) {
    direction: ltr !important;
    unicode-bidi: normal !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytAttributedStringHost[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] yt-formatted-string#title-text[dir="rtl"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] yt-disclaimer-item-view-model[dir="rtl"] {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: isolate !important;
}
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] .ytAttributedStringHost[dir="ltr"],
ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"] yt-formatted-string#title-text[dir="ltr"] {
    direction: ltr !important;
    text-align: left !important;
}
`;

function isExtensionContextValid() {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
    } catch {
        return false;
    }
}

function hasVisibleText(element) {
    return Boolean(String(element?.textContent || '').trim());
}

function youchatPanels() {
    const panels = Array.from(document.querySelectorAll(PANEL_SELECTOR));
    if (panels.length) {
        return panels;
    }

    document.querySelectorAll('ytd-watch-flexy').forEach((host) => {
        if (!host.shadowRoot) {
            return;
        }
        host.shadowRoot.querySelectorAll(PANEL_SELECTOR).forEach((panel) => {
            panels.push(panel);
        });
    });
    return panels;
}

function queryInPanel(panel, selector) {
    const found = [];
    const seen = new Set();
    const add = (element) => {
        if (!element || seen.has(element)) {
            return;
        }
        seen.add(element);
        found.push(element);
    };
    const collect = (root) => {
        if (!root?.querySelectorAll) {
            return;
        }
        root.querySelectorAll(selector).forEach(add);
        root.querySelectorAll('*').forEach((element) => {
            if (element.shadowRoot) {
                collect(element.shadowRoot);
            }
        });
    };
    collect(panel);
    return found;
}

function applyYoutubeChrome() {
    let style = document.getElementById('youtube-youchat-dir-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'youtube-youchat-dir-style';
        (document.head || document.documentElement).appendChild(style);
    }
    if (style.textContent !== PANEL_CSS) {
        style.textContent = PANEL_CSS;
    }
}

function pinInlineDirection(element) {
    const dir = element.getAttribute('data-direction') || element.getAttribute('dir');
    if (!element.style || (dir !== 'rtl' && dir !== 'ltr')) {
        return;
    }
    element.style.setProperty('direction', dir, 'important');
    element.style.setProperty('text-align', dir === 'rtl' ? 'right' : 'left', 'important');
    element.style.setProperty('unicode-bidi', 'isolate');
}

function applyChatInputDirection(element, rtlAlgorithm) {
    if (!isRtlEngineActive()) {
        return;
    }
    const value = String(element.value || '').trim();
    if (value) {
        applyRtlToElement(element, rtlAlgorithm, INPUT_OPTIONS);
        pinInlineDirection(element);
        return;
    }

    // Empty field has no text for the algorithm, so the caret stays LTR until the first key.
    element.setAttribute('data-direction', 'rtl');
    element.setAttribute('dir', 'rtl');
    pinInlineDirection(element);
    element.classList.remove('FontSet');
}

function applyUserTurn(element, rtlAlgorithm) {
    if (!hasVisibleText(element)) {
        return;
    }
    applyRtlToElement(element, rtlAlgorithm, TEXT_OPTIONS);
    pinInlineDirection(element);
}

function isShelfTextLine(element) {
    return Boolean(element.matches && element.matches(TEXT_LINE_SELECTOR));
}

function releaseHorizontalShelves(panel) {
    queryInPanel(panel, SHELF_SELECTOR).forEach((shelf) => {
        walkDeep(shelf, (element) => {
            if (isShelfTextLine(element)) {
                return;
            }
            clearMarkedElement(element);
        });
        if (!isRtlEngineActive()) {
            return;
        }
        shelf.setAttribute('dir', 'ltr');
        if (shelf.style) {
            shelf.style.setProperty('direction', 'ltr', 'important');
            shelf.style.removeProperty('text-align');
            shelf.style.removeProperty('unicode-bidi');
        }
        shelf.classList.remove('FontSet', 'AsOkText', 'AsOk');
    });
}

function applyTextLine(element, rtlAlgorithm) {
    if (!hasVisibleText(element)) {
        return;
    }
    applyRtlToElement(element, rtlAlgorithm, TEXT_LINE_OPTIONS);
    pinInlineDirection(element);
}

function bindChatInput(element, rtlAlgorithm) {
    applyChatInputDirection(element, rtlAlgorithm);

    const $element = AQ(element);
    if ($element.data('rtl-listener-added')) {
        return;
    }
    const session = youtubeSession;
    $element.data('rtl-listener-added', true);
    $element.on('input.youtubeRtl keyup.youtubeRtl paste.youtubeRtl', function () {
        if (session !== youtubeSession || !isRtlEngineActive()) {
            return;
        }
        requestAnimationFrame(() => {
            if (session !== youtubeSession || !isRtlEngineActive()) {
                return;
            }
            applyChatInputDirection(element, rtlAlgorithm);
        });
    });
}

function setYoutubeCopyright(panel) {
    if (!chrome.runtime?.id || !isRtlEngineActive()) {
        return;
    }

    const footer = panel.querySelector('#footer') || panel.querySelector('yt-chat-input-view-model');
    if (!footer) {
        return;
    }

    addCopyright(
        AQ(footer),
        'AsBoxB',
        'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
    ).then(() => {
        if (isRtlEngineActive()) {
            return;
        }
        removeYoutubePanelChrome();
    }).catch(() => {});
}

function applyYoutubePanel(panel, rtlAlgorithm) {
    setYoutubeCopyright(panel);

    queryInPanel(panel, MARKDOWN_SELECTOR).forEach((element) => {
        applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    });

    queryInPanel(panel, USER_TEXT_SELECTOR).forEach((element) => {
        if (!hasVisibleText(element) || element.querySelector(MARKDOWN_SELECTOR)) {
            return;
        }
        applyRtlToContainer(element, rtlAlgorithm, TEXT_OPTIONS);
    });

    const userTurns = queryInPanel(panel, USER_TURN_SELECTOR);
    userTurns.forEach((element) => {
        applyUserTurn(element, rtlAlgorithm);
    });
    if (!userTurns.length) {
        queryInPanel(panel, USER_TURN_HOST_SELECTOR).forEach((element) => {
            if (element.querySelector(MARKDOWN_SELECTOR)) {
                return;
            }
            applyUserTurn(element, rtlAlgorithm);
        });
    }

    queryInPanel(panel, CHIP_SELECTOR).forEach((element) => {
        if (!hasVisibleText(element)) {
            return;
        }
        applyRtlToElement(element, rtlAlgorithm, CHIP_OPTIONS);
    });

    queryInPanel(panel, DISCLAIMER_SELECTOR).forEach((element) => {
        if (!hasVisibleText(element)) {
            return;
        }
        applyRtlToElement(element, rtlAlgorithm, CHIP_OPTIONS);
    });

    queryInPanel(panel, INPUT_SELECTOR).forEach((element) => {
        bindChatInput(element, rtlAlgorithm);
    });

    releaseHorizontalShelves(panel);

    queryInPanel(panel, TEXT_LINE_SELECTOR).forEach((element) => {
        applyTextLine(element, rtlAlgorithm);
    });

    panel.querySelectorAll('yt-icon, yt-icon-shape, .yt-icon-shape').forEach((icon) => {
        icon.classList.remove('FontSet');
    });
}

const PANEL_MARK_ATTRS = [
    'data-direction',
    'data-text-length',
    'data-algorithm-rtl',
    'data-ai-rtl-orig-dir',
    'data-ai-rtl-orig-align',
    'data-ai-rtl-orig-bidi',
    'data-ai-rtl-orig-css-direction',
    'data-ai-rtl-orig-font',
    'data-skip-log-sent'
];

let youtubeSession = 0;
let youtubeInterval = null;

function isYoutubeWatchHost() {
    const host = window.location.hostname;
    return host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com';
}

function walkDeep(root, visitor, seen = new Set()) {
    if (!root || seen.has(root)) {
        return;
    }
    seen.add(root);

    const elements = [];
    if (root.nodeType === 1) {
        elements.push(root);
    }
    if (root.querySelectorAll) {
        root.querySelectorAll('*').forEach((element) => {
            elements.push(element);
        });
    }

    elements.forEach((element) => {
        visitor(element);
        if (element.shadowRoot) {
            walkDeep(element.shadowRoot, visitor, seen);
        }
    });
}

function clearMarkedElement(element) {
    const marked = element.hasAttribute('data-direction')
        || element.hasAttribute('data-algorithm-rtl')
        || element.hasAttribute('data-ai-rtl-orig-dir')
        || element.classList.contains('FontSet')
        || element.classList.contains('AsOk')
        || element.classList.contains('AsOkText')
        || element.classList.contains('AsRtl');
    if (!marked) {
        return;
    }

    if (element.hasAttribute('data-ai-rtl-orig-dir')) {
        const originalDir = element.getAttribute('data-ai-rtl-orig-dir');
        if (originalDir) {
            element.setAttribute('dir', originalDir);
        } else {
            element.removeAttribute('dir');
        }
    } else if (element.hasAttribute('data-direction') || element.hasAttribute('data-algorithm-rtl')) {
        element.removeAttribute('dir');
    }

    restoreStampedInline(element, 'data-ai-rtl-orig-align', 'text-align');
    restoreStampedInline(element, 'data-ai-rtl-orig-bidi', 'unicode-bidi');
    restoreStampedInline(element, 'data-ai-rtl-orig-css-direction', 'direction');
    restoreStampedInline(element, 'data-ai-rtl-orig-font', 'font-family');

    PANEL_MARK_ATTRS.forEach((name) => {
        element.removeAttribute(name);
    });
    element.classList.remove('FontSet', 'AsOk', 'AsOkText', 'AsRtl', 'AsLtr', 'AsAlignRtl', 'AsAlignLtr');
    if (typeof window.AQ === 'function') {
        const $element = AQ(element);
        $element.off('.youtubeRtl');
        $element.removeData('rtl-listener-added');
        $element.removeData('rtl-processed');
    }
}

function restoreStampedInline(element, attr, prop) {
    if (!element.style || !element.hasAttribute(attr)) {
        return;
    }
    const raw = element.getAttribute(attr) || '';
    const split = raw.lastIndexOf('!');
    const value = split >= 0 ? raw.slice(0, split) : raw;
    const priority = split >= 0 ? raw.slice(split + 1) : '';
    if (value) {
        element.style.setProperty(prop, value, priority);
    } else {
        element.style.removeProperty(prop);
    }
}

function removeYoutubePanelChrome() {
    if (!isYoutubeWatchHost()) {
        return;
    }
    document.getElementById('youtube-youchat-dir-style')?.remove();
    document.getElementById('Asmodal')?.remove();
    if (document.body) {
        document.body.classList.remove('AsDonateOk');
    }
    youchatPanels().forEach((panel) => {
        const boxes = [];
        walkDeep(panel, (element) => {
            if (element.classList && element.classList.contains('AsBox')) {
                boxes.push(element);
                return;
            }
            clearMarkedElement(element);
        });
        boxes.forEach((box) => {
            if (box.parentNode) {
                box.parentNode.removeChild(box);
            }
        });
    });
}

function clearYoutubeFontScale() {
    if (!isYoutubeWatchHost()) {
        return;
    }
    // Only our scale sheet. YouTube's own html font-size must stay.
    document.getElementById('ai-rtl-font-scale-style')?.remove();
}

export function stopYoutube() {
    youtubeSession += 1;
    if (youtubeInterval) {
        clearInterval(youtubeInterval);
        youtubeInterval = null;
    }

    // Run after stopRtlEngine. Cleaning inline styles while capturing is still
    // on makes the attribute hooks stamp our RTL values back as the original.
    const session = youtubeSession;
    queueMicrotask(() => {
        if (session !== youtubeSession || isRtlEngineActive()) {
            return;
        }
        removeYoutubePanelChrome();
        clearYoutubeFontScale();
    });
}

export function setYoutube(rtlAlgorithm = 'advanced_full') {
    if (!isRtlEngineActive()) {
        return;
    }

    applyYoutubeChrome();

    youchatPanels().forEach((panel) => {
        applyYoutubePanel(panel, rtlAlgorithm);
    });
}

export function activateYoutube(rtlAlgorithm = 'advanced_full') {
    console.log('YouTube RTL activated with algorithm:', rtlAlgorithm);

    const session = ++youtubeSession;
    if (youtubeInterval) {
        clearInterval(youtubeInterval);
        youtubeInterval = null;
    }

    setYoutube(rtlAlgorithm);

    youtubeInterval = setInterval(() => {
        if (session !== youtubeSession) {
            return;
        }
        if (!isExtensionContextValid() || !isRtlEngineActive()) {
            stopYoutube();
            return;
        }

        try {
            setYoutube(rtlAlgorithm);
        } catch (error) {
            if (!isExtensionContextValid() || String(error?.message || error).includes('Extension context invalidated')) {
                stopYoutube();
                return;
            }
            throw error;
        }
    }, 1000);
}
