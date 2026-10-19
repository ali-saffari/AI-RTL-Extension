// roadmap.js service functions (roadmap.sh)
import { addCopyright } from '../../utils/copyright.js';
import { observeDomSections } from '../../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

const ICON_SELECTOR = 'i, svg, path, use, [class*="icon"], [class*="Icon"]';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]';
const MARKDOWN_SELECTOR = '.message-markdown, .prose';
const COPYRIGHT_SELECTOR = 'textarea[placeholder*="Ask AI"], input[placeholder*="Ask AI"]';

let pageObserver = null;
let viewportObserver = null;
const streams = new Map();

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true
};

const MARKDOWN_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    isContainer: true,
    setTextAlign: true
};

function applyRoadmapChrome() {
    if (!AQ('#roadmap-font-style').length) {
        AQ(`<style id="roadmap-font-style">
            html.ai-rtl-has-font, html.ai-rtl-has-font body,
            html.ai-rtl-has-font body *:not(code):not(pre):not(kbd):not(samp):not(.katex):not(.katex-display):not(.katex *):not(.katex-display *):not(i):not(svg):not(path):not(use):not([class*="icon"]):not([class*="Icon"]) {
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

function processRoadmapInput(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToElement(element, rtlAlgorithm, INPUT_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');

    if (AQ(element).data('rtl-listener-added')) {
        return;
    }
    AQ(element).data('rtl-listener-added', true);

    AQ(element).on('input keyup paste', function () {
        requestAnimationFrame(() => {
            applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
            AQ(ICON_SELECTOR).removeClass('FontSet');
        });
    });
}

function processRoadmapMarkdown(element, rtlAlgorithm) {
    if (AQ(element).is(ICON_SELECTOR)) {
        return;
    }

    applyRtlToContainer(element, rtlAlgorithm, MARKDOWN_OPTIONS);
    AQ(ICON_SELECTOR).removeClass('FontSet');

    const heading = element.previousElementSibling;
    if (heading && heading.matches('h1')) {
        applyRtlToElement(heading, rtlAlgorithm, {
            fontClass: 'FontSet',
            setTextAlign: true
        });
    }
}

export function stopRoadmap() {
    if (pageObserver) {
        pageObserver.disconnect();
        pageObserver = null;
    }
    if (viewportObserver) {
        viewportObserver.disconnect();
        viewportObserver = null;
    }
    streams.forEach((observer) => observer.disconnect());
    streams.clear();
}

function watchRoadmapProse(rtlAlgorithm) {
    stopRoadmap();

    viewportObserver = new IntersectionObserver((entries) => {
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

            const stream = new MutationObserver(() => {
                processRoadmapMarkdown(root, rtlAlgorithm);
            });
            stream.observe(root, { childList: true, subtree: true, characterData: true });
            streams.set(root, stream);
            processRoadmapMarkdown(root, rtlAlgorithm);
        });
    }, { root: null, rootMargin: '300px 0px', threshold: 0 });

    pageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== 1 || !viewportObserver) {
                    return;
                }
                if (node.matches(MARKDOWN_SELECTOR)) {
                    viewportObserver.observe(node);
                }
                node.querySelectorAll(MARKDOWN_SELECTOR).forEach((element) => {
                    viewportObserver.observe(element);
                });
            });
        });
    });

    if (!document.body) {
        return;
    }
    pageObserver.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll(MARKDOWN_SELECTOR).forEach((element) => {
        viewportObserver.observe(element);
    });
}

function processRoadmapCopyright(input) {
    if (!chrome.runtime?.id) {
        return;
    }

    addCopyright(
        AQ(input).parent().parent(),
        'AsBoxGemini AsBoxB',
        'margin-top: 4px; margin-bottom: 4px; font-size: 13px;'
    );
}

export function activateRoadmap(rtlAlgorithm = 'advanced_full') {
    console.log('roadmap.sh RTL activated with algorithm:', rtlAlgorithm);

    applyRoadmapChrome();

    watchRoadmapProse(rtlAlgorithm);

    observeDomSections([
        {
            selector: INPUT_SELECTOR,
            ignore: ICON_SELECTOR,
            process: (el) => processRoadmapInput(el, rtlAlgorithm),
            debounceMs: 50
        },
        {
            selector: COPYRIGHT_SELECTOR,
            process: processRoadmapCopyright,
            debounceMs: 200
        }
    ]);
}
