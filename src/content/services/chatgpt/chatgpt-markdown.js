// Assistant markdown near the viewport.
// Streaming updates are throttled; if text changes during the wait, one trailing pass still runs.
import { applyRtlToContainer } from '../../utils/directionUtils/index.js';

export const MARKDOWN = '[class^="MarkdownRoot-"], [class*=" MarkdownRoot-"], [data-assistant-markdown]';
const THROTTLE_MS = 400;

let markdownPageObserver = null;
let markdownViewportObserver = null;
let applyCount = 0;
const streams = new Map();
let lastLength = new WeakMap();
let lastRun = new WeakMap();
const trailing = new Map();

function applyMarkdown(element, rtlAlgorithm) {
    const length = (element.textContent || '').length;
    if (lastLength.get(element) === length) {
        return;
    }
    const elapsed = Date.now() - (lastRun.get(element) || 0);
    if (elapsed < THROTTLE_MS) {
        if (!trailing.has(element)) {
            trailing.set(element, setTimeout(() => {
                trailing.delete(element);
                applyMarkdown(element, rtlAlgorithm);
            }, THROTTLE_MS - elapsed));
        }
        return;
    }
    lastRun.set(element, Date.now());
    lastLength.set(element, length);
    // Debug rings: green stays after first apply, red flashes on each change.
    element.classList.add('AsDoneBorder', 'AsFlashBorder');
    setTimeout(() => element.classList.remove('AsFlashBorder'), 450);
    applyCount += 1;
    console.log('applyRtlToContainer', applyCount);
    applyRtlToContainer(element, rtlAlgorithm, {
        fontClass: 'FontSetGPT',
        codeFontClass: 'FontSetCodeBlocksGPT',
        processedClass: 'AsOk',
        isContainer: true,
        siteConfig: 'chatgpt',
        setTextAlign: true,
        setRootTextAlign: true,
        // rtlClass: 'AsAlignRtl',
        // ltrClass: 'AsAlignLtr',
        removeDirAuto: true,
        walkSkipSelector: '[class*="TableContainer"], [class*="tableContainer"], [class*="CodeBlock-"], [class*="InlineCodePane-"]',
        onlyCss: '.ProseMirror[contenteditable]',
        forceCodeLtr: rtlAlgorithm === 'advanced_full'
    });
}

export function stopMarkdown() {
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
    trailing.forEach((timer) => clearTimeout(timer));
    trailing.clear();
    // Forget prior lengths so turn-off / turn-on reprocesses unchanged text.
    lastLength = new WeakMap();
    lastRun = new WeakMap();
}

export function startMarkdown(rtlAlgorithm) {
    stopMarkdown();
    applyCount = 0;

    // Process only when the markdown root is near the viewport.
    // Stream observers (characterData) attach only while on-screen.
    markdownViewportObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const element = entry.target;
            if (!entry.isIntersecting) {
                const stream = streams.get(element);
                if (stream) {
                    stream.disconnect();
                    streams.delete(element);
                }
                return;
            }
            if (streams.has(element)) {
                return;
            }
            applyMarkdown(element, rtlAlgorithm);
            const stream = new MutationObserver(() => applyMarkdown(element, rtlAlgorithm));
            stream.observe(element, { childList: true, subtree: true, characterData: true });
            streams.set(element, stream);
        });
    }, { root: null, rootMargin: '300px 0px', threshold: 0 });

    // Find newly inserted markdown roots and hand them to the viewport observer.
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
        // Drop previous-run marks so applyRtlToContainer does not treat text as stable.
        element.removeAttribute('data-text-length');
        element.classList.remove('AsSetAlgorithm');
        markdownViewportObserver.observe(element);
    });
}
