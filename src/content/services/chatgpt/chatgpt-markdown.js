// Assistant markdown near the viewport.
// Streaming updates are throttled; if text changes during the wait, one trailing pass still runs.
// When Dil UI appears inside a markdown root, follow Dil instead of the markdown wrapper.
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

export const MARKDOWN = '[class^="MarkdownRoot-"], [class*=" MarkdownRoot-"], [data-assistant-markdown]';
const DIL = '[class*="DilRenderer"], [class*="DilResponseRoot"]';
const THROTTLE_MS = 400;

let markdownPageObserver = null;
let markdownViewportObserver = null;
const streams = new Map();
let lastRun = new WeakMap();
const trailing = new Map();
const paragraphJoin = new Map();
const JOIN_MS = 500;

function findDils(root) {
    if (!root || root.nodeType !== 1) {
        return [];
    }
    const found = [];
    const list = root.matches(DIL) ? [root] : Array.from(root.querySelectorAll(DIL));
    list.forEach((node) => {
        if (node.parentElement && node.parentElement.closest(DIL)) {
            return;
        }
        found.push(node);
    });
    return found;
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
    const targets = element.matches && element.matches(DIL) ? [element] : findDils(element);
    (targets.length ? targets : [element]).forEach((target) => {
        const elapsed = Date.now() - (lastRun.get(target) || 0);
        if (elapsed < THROTTLE_MS) {
            const pending = trailing.get(target);
            if (pending) {
                if (reason && reason.changes) {
                    pending.reason.changes.push(...reason.changes);
                }
                return;
            }
            const slot = {
                reason: reason && reason.changes
                    ? { why: reason.why, changes: reason.changes.slice() }
                    : reason
            };
            slot.timer = setTimeout(() => {
                trailing.delete(target);
                applyMarkdown(target, rtlAlgorithm, slot.reason);
            }, THROTTLE_MS - elapsed);
            trailing.set(target, slot);
            return;
        }
        lastRun.set(target, Date.now());
        applyRtlToContainer(target, rtlAlgorithm, {
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
            walkSkipSelector: '[class*="TableContainer"], [class*="tableContainer"], [class*="CodeBlock-"], [class*="InlineCodePane-"], [data-d-text-flow="word"]',
            onlyCss: '.ProseMirror[contenteditable]',
            forceCodeLtr: rtlAlgorithm === 'advanced_full',
        });

        target.querySelectorAll('p[data-d-component="text"]').forEach((paragraph) => {
            if (!paragraph.querySelector('[data-d-text-flow="word"]')) {
                return;
            }
            if (paragraphJoin.has(paragraph)) {
                clearTimeout(paragraphJoin.get(paragraph));
            }
            paragraphJoin.set(paragraph, setTimeout(() => {
                paragraphJoin.delete(paragraph);
                if (!paragraph.isConnected || !paragraph.querySelector('[data-d-text-flow="word"]')) {
                    return;
                }
                paragraph.textContent = paragraph.textContent;
                AQ(paragraph).removeClass('AsOk').removeAttr('data-text-length');
                applyRtlToElement(paragraph, rtlAlgorithm, {
                    fontClass: 'FontSetGPT',
                    processedClass: 'AsOk',
                    setTextAlign: true,
                    removeDirAuto: true
                });
            }, JOIN_MS));
        });
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
    streams.forEach((list) => list.forEach((observer) => observer.disconnect()));
    streams.clear();
    trailing.forEach((slot) => clearTimeout(slot.timer));
    trailing.clear();
    paragraphJoin.forEach((timer) => clearTimeout(timer));
    paragraphJoin.clear();
    lastRun = new WeakMap();
}

export function startMarkdown(rtlAlgorithm) {
    stopMarkdown();

    // Process only when the markdown root is near the viewport.
    // Stream observers attach to Dil when present, otherwise to the markdown root.
    markdownViewportObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const root = entry.target;
            if (!entry.isIntersecting) {
                const list = streams.get(root);
                if (list) {
                    list.forEach((observer) => observer.disconnect());
                    streams.delete(root);
                }
                return;
            }
            if (streams.has(root)) {
                return;
            }

            const byNode = new Map();
            const observers = [];
            const watchOptions = { childList: true, subtree: true, characterData: true, characterDataOldValue: true };
            const attach = (node) => {
                if (byNode.has(node)) {
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
                    const dilsNow = findDils(root);
                    dilsNow.forEach((dil) => attach(dil));
                    if (dilsNow.length && byNode.has(root)) {
                        byNode.get(root).disconnect();
                        byNode.delete(root);
                    }
                    applyMarkdown(node, rtlAlgorithm, { why: 'change', changes });
                });
                stream.observe(node, watchOptions);
                byNode.set(node, stream);
                observers.push(stream);
            };

            const dils = findDils(root);
            (dils.length ? dils : [root]).forEach(attach);
            streams.set(root, observers);
            applyMarkdown(root, rtlAlgorithm, { why: 'viewport' });
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
        markdownViewportObserver.observe(element);
    });
}
