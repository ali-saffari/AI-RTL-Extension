// Assistant markdown near the viewport.
// Streaming updates are throttled; if text changes during the wait, one trailing pass still runs.
// When Dil UI appears inside a markdown root, follow Dil instead of the markdown wrapper.
import { applyRtlToContainer, applyRtlToElement } from '../../utils/directionUtils/index.js';

export const MARKDOWN = '[class^="MarkdownRoot-"], [class*=" MarkdownRoot-"], [data-assistant-markdown]';
const DIL = '[class*="DilRenderer"], [class*="DilResponseRoot"]';
const THROTTLE_MS = 400;
const COMPLETE_MS = 200;
const ASSURE_MAX = 2;
const FLASH_MS = 700;
let markdownDebug = false;

let markdownPageObserver = null;
let markdownViewportObserver = null;
let turnObserver = null;
const completeTimers = new Map();
const inViewport = new Set();
const freshComplete = new Set();
const assure = new Map();
const streams = new Map();
let lastRun = new WeakMap();
const trailing = new Map();
const paragraphJoin = new Map();
const flashTimers = new Map();

function logMarkdown(status, note) {
    if (!markdownDebug) {
        return;
    }
    console.log('applyMarkdown', status, note);
}

try {
    chrome.storage.sync.get('markdownDebug', (result) => {
        markdownDebug = result.markdownDebug === true;
    });
    chrome.storage.sync.onChanged.addListener((changes) => {
        if (!changes.markdownDebug) {
            return;
        }
        markdownDebug = changes.markdownDebug.newValue === true;
        if (!markdownDebug) {
            flashTimers.forEach((timer, el) => {
                clearTimeout(timer);
                el.style.outline = '';
            });
            flashTimers.clear();
        }
    });
} catch (error) {
    markdownDebug = false;
}
const JOIN_MS = 500;

// Neighboring word spans in the same parent become one text node.
// A span that wraps its own words stays; those inner words join on their own.
// Spans with --fade-delay stay as ChatGPT wrote them.
function mergeAdjacentWords(parent) {
    const children = Array.from(parent.childNodes);
    let text = '';
    let first = null;
    const rest = [];
    const flush = () => {
        if (!first) {
            return;
        }
        first.replaceWith(document.createTextNode(text));
        rest.forEach((node) => node.remove());
        text = '';
        first = null;
        rest.length = 0;
    };
    children.forEach((node) => {
        if (node.nodeType === 1 && node.getAttribute('data-d-text-flow') === 'word') {
            if ((node.getAttribute('style') || '').includes('--fade-delay')) {
                flush();
                return;
            }
            if (!first) {
                first = node;
            } else {
                rest.push(node);
            }
            text += node.textContent;
            return;
        }
        flush();
        if (node.nodeType === 1) {
            mergeAdjacentWords(node);
        }
    });
    flush();
}

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

function assureAllowed(root) {
    return inViewport.has(root) || freshComplete.has(root);
}

function stopAssure(root) {
    const slot = assure.get(root);
    freshComplete.delete(root);
    if (!slot) {
        return;
    }
    if (slot.timer) {
        clearTimeout(slot.timer);
    }
    assure.delete(root);
}

function fireAssure(root, rtlAlgorithm) {
    const slot = assure.get(root);
    if (!slot || !root.isConnected || !assureAllowed(root) || slot.count >= ASSURE_MAX) {
        stopAssure(root);
        return;
    }
    const pass = slot.count + 1;
    assure.set(root, { count: pass, timer: null });
    applyMarkdown(root, rtlAlgorithm, {
        why: 'assure',
        pass,
        color: pass === 1 ? '#6ecbff' : pass === 2 ? '#0b3d91' : 'red'
    });
}

function markdownNote(reason) {
    const why = (reason && reason.why) || 'unknown';
    const pass = reason && reason.pass ? ' ' + reason.pass : '';
    const changeTypes = reason && reason.changes && reason.changes.length
        ? ' ' + reason.changes.map((change) => change.type).join(',')
        : '';
    return why + pass + changeTypes;
}

function applyMarkdown(element, rtlAlgorithm, reason) {
    const note = markdownNote(reason);
    if (!element || element.nodeType !== 1) {
        logMarkdown('skip not-element', note);
        return;
    }
    if (
        reason &&
        reason.why === 'change' &&
        reason.changes &&
        reason.changes.length &&
        reason.changes.every((change) => {
            if (change.type === 'characterData') {
                return !(change.to || '').trim() && !(change.from || '').trim();
            }
            if (String(change.type || '').indexOf('attr:') === 0) {
                return false;
            }
            return !(change.text || '').trim();
        })
    ) {
        logMarkdown('skip empty', note);
        return;
    }
    const targets = element.matches && element.matches(DIL) ? [element] : findDils(element);
    let applied = false;
    (targets.length ? targets : [element]).forEach((target) => {
        // Finished turn keeps the same text length, so the length gate would skip.
        const force = reason && reason.why === 'complete';
        if (force) {
            AQ(target).removeAttr('data-text-length');
            AQ(target).find('.AsOk').addBack().removeClass('AsOk');
        }
        const elapsed = Date.now() - (lastRun.get(target) || 0);
        if (!force && elapsed < THROTTLE_MS) {
            const pending = trailing.get(target);
            if (pending) {
                if (reason && reason.changes) {
                    if (pending.reason && pending.reason.changes) {
                        pending.reason.changes.push(...reason.changes);
                    } else {
                        pending.reason = { why: reason.why, changes: reason.changes.slice() };
                    }
                }
                logMarkdown('skip throttle', note);
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
            logMarkdown('skip throttle', note);
            return;
        }
        lastRun.set(target, Date.now());
        logMarkdown('run', note);
        if (markdownDebug) {
            const prevFlash = flashTimers.get(target);
            if (prevFlash) {
                clearTimeout(prevFlash);
            }
            target.style.outline = '2px solid ' + ((reason && reason.color) || 'red');
            flashTimers.set(target, setTimeout(() => {
                flashTimers.delete(target);
                target.style.outline = '';
            }, FLASH_MS));
        }
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
        applied = true;

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
                mergeAdjacentWords(paragraph);
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
    if (!applied) {
        return;
    }
    const root = element.matches(MARKDOWN) ? element : element.closest(MARKDOWN);
    if (!root) {
        return;
    }
    if (reason && reason.why === 'assure') {
        const slot = assure.get(root);
        if (!slot || !assureAllowed(root) || slot.count >= ASSURE_MAX) {
            stopAssure(root);
            return;
        }
        if (slot.timer) {
            clearTimeout(slot.timer);
        }
        assure.set(root, {
            count: slot.count,
            timer: setTimeout(() => fireAssure(root, rtlAlgorithm), 1700 + Math.random() * 800)
        });
        return;
    }
    if (!reason || reason.why !== 'complete') {
        return;
    }
    freshComplete.add(root);
    const prev = assure.get(root);
    if (prev && prev.timer) {
        clearTimeout(prev.timer);
    }
    assure.set(root, {
        count: 0,
        timer: setTimeout(() => fireAssure(root, rtlAlgorithm), 1200 + Math.random() * 500)
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
    if (turnObserver) {
        turnObserver.disconnect();
        turnObserver = null;
    }
    completeTimers.forEach((timer) => clearTimeout(timer));
    completeTimers.clear();
    assure.forEach((slot) => slot.timer && clearTimeout(slot.timer));
    assure.clear();
    inViewport.clear();
    freshComplete.clear();
    streams.forEach((list) => list.forEach((observer) => observer.disconnect()));
    streams.clear();
    trailing.forEach((slot) => clearTimeout(slot.timer));
    trailing.clear();
    paragraphJoin.forEach((timer) => clearTimeout(timer));
    paragraphJoin.clear();
    flashTimers.forEach((timer, el) => {
        clearTimeout(timer);
        el.style.outline = '';
    });
    flashTimers.clear();
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
                inViewport.delete(root);
                if (!freshComplete.has(root)) {
                    stopAssure(root);
                }
                const list = streams.get(root);
                if (list) {
                    list.forEach((observer) => observer.disconnect());
                    streams.delete(root);
                }
                return;
            }
            inViewport.add(root);
            if (streams.has(root)) {
                return;
            }

            const byNode = new Map();
            const observers = [];
            const watchOptions = { childList: true, subtree: true, characterData: true, characterDataOldValue: true };
            const rootWatchOptions = {
                ...watchOptions,
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ['class', 'data-markdown-animated']
            };
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
                                to: (mutation.target && mutation.target.textContent || '').slice(-80)
                            });
                            return;
                        }
                        if (mutation.type === 'attributes') {
                            changes.push({ type: 'attr:' + (mutation.attributeName || '') });
                            return;
                        }
                        mutation.addedNodes.forEach((added) => {
                            changes.push({ type: 'added', text: (added.textContent || '').slice(0, 80) });
                        });
                        mutation.removedNodes.forEach((removed) => {
                            changes.push({ type: 'removed', text: (removed.textContent || '').slice(0, 80) });
                        });
                    });
                    if (!root.isConnected) {
                        return;
                    }
                    // Stream end swaps word spans for one span. Text length stays, so the length gate would skip.
                    const streaming = root.hasAttribute('data-markdown-animated')
                        || /(^|\s)AdaptiveStreaming-/.test(root.className || '');
                    const streamEnded = mutations.some((mutation) => {
                        if (mutation.type === 'attributes' && mutation.target === root) {
                            if (mutation.attributeName === 'data-markdown-animated') {
                                return mutation.oldValue !== null && !root.hasAttribute('data-markdown-animated');
                            }
                            if (mutation.attributeName === 'class') {
                                const had = /(^|\s)AdaptiveStreaming-/.test(mutation.oldValue || '');
                                return had && !/(^|\s)AdaptiveStreaming-/.test(root.className || '');
                            }
                        }
                        if (streaming || mutation.type !== 'childList') {
                            return false;
                        }
                        return Array.from(mutation.removedNodes).some((removed) => {
                            if (removed.nodeType !== 1) {
                                return false;
                            }
                            if ((removed.getAttribute('style') || '').includes('--fade-delay')) {
                                return true;
                            }
                            return Boolean(removed.querySelector && removed.querySelector('[style*="--fade-delay"]'));
                        });
                    });
                    const dilsNow = findDils(root);
                    dilsNow.forEach((dil) => attach(dil));
                    if (dilsNow.length) {
                        if (byNode.has(root)) {
                            byNode.get(root).disconnect();
                            byNode.delete(root);
                        }
                    } else {
                        // Stream finished / Dil fell back to plain MarkdownRoot — watch root again.
                        byNode.forEach((observer, watched) => {
                            if (watched === root) {
                                return;
                            }
                            observer.disconnect();
                            byNode.delete(watched);
                            const index = observers.indexOf(observer);
                            if (index >= 0) {
                                observers.splice(index, 1);
                            }
                        });
                        attach(root);
                    }
                    applyMarkdown(streamEnded ? root : (dilsNow[0] || root), rtlAlgorithm, {
                        why: streamEnded ? 'complete' : 'change',
                        color: streamEnded ? 'purple' : undefined,
                        changes
                    });
                });
                stream.observe(node, node === root ? rootWatchOptions : watchOptions);
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

    turnObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const turn = mutation.target;
            if (
                !turn
                || turn.nodeType !== 1
                || mutation.oldValue == null
                || mutation.oldValue === 'complete'
                || turn.getAttribute('data-talvt-turn-state') !== 'complete'
            ) {
                return;
            }
            const pending = completeTimers.get(turn);
            if (pending) {
                clearTimeout(pending);
            }
            completeTimers.set(turn, setTimeout(() => {
                completeTimers.delete(turn);
                if (!turn.isConnected || turn.getAttribute('data-talvt-turn-state') !== 'complete') {
                    return;
                }
                const roots = [];
                if (turn.matches(MARKDOWN)) {
                    roots.push(turn);
                }
                turn.querySelectorAll(MARKDOWN).forEach((element) => {
                    roots.push(element);
                });
                roots.forEach((element) => {
                    freshComplete.add(element);
                    applyMarkdown(element, rtlAlgorithm, { why: 'complete', color: 'orange' });
                });
            }, COMPLETE_MS));
        });
    });
    turnObserver.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['data-talvt-turn-state'],
        subtree: true
    });
}
