/**
 * Shared viewport + message-watch helpers for ChatGPT new and Claude.
 * Site selectors and RTL options stay in each service.
 */

export const VIEWPORT_MARGIN_PX = 300;
export const VIEWPORT_ROOT_MARGIN = `${VIEWPORT_MARGIN_PX}px 0px`;
export const MARKDOWN_THROTTLE_MS = 650;
export const MISSED_LOOK_BUDGET = 6;
export const MISSED_PROCESS_BUDGET = 3;

export function isNearViewport(element, marginPx = VIEWPORT_MARGIN_PX) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
        return false;
    }
    const rect = element.getBoundingClientRect();
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.bottom >= -marginPx && rect.top <= height + marginPx;
}

export function createViewportObserver(onEntry, options = {}) {
    return new IntersectionObserver(onEntry, {
        root: null,
        rootMargin: VIEWPORT_ROOT_MARGIN,
        threshold: 0,
        ...options
    });
}

export function hasSelector(node, matchSelector, containsSelector = matchSelector) {
    if (!node || node.nodeType !== 1) {
        return false;
    }
    try {
        if (node.matches && node.matches(matchSelector)) {
            return true;
        }
        return Boolean(node.querySelector && node.querySelector(containsSelector));
    } catch {
        return false;
    }
}

export function closestMatching(node, selector) {
    if (!node) {
        return null;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
    }
    if (!node || node.nodeType !== 1 || !node.closest) {
        return null;
    }
    return node.matches(selector) ? node : node.closest(selector);
}

export function eachMatch(root, selector, run) {
    const $root = AQ(root || document);
    $root.find(selector).add($root.filter(selector)).each(function () {
        run(this);
    });
}

export function createStreamWatch() {
    const streams = new Map();

    function stop(element) {
        const observer = streams.get(element);
        if (!observer) {
            return;
        }
        observer.disconnect();
        streams.delete(element);
    }

    function watch(element, onChange) {
        if (!element || streams.has(element)) {
            return;
        }
        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                const type = mutations[i].type;
                if (type === 'characterData' || type === 'childList') {
                    onChange(element);
                    return;
                }
            }
        });
        observer.observe(element, { childList: true, subtree: true, characterData: true });
        streams.set(element, observer);
    }

    function stopInTree(node) {
        if (!node || node.nodeType !== 1) {
            return;
        }
        streams.forEach((_observer, element) => {
            if (element === node || node.contains(element)) {
                stop(element);
            }
        });
    }

    function clear() {
        streams.forEach((observer) => observer.disconnect());
        streams.clear();
    }

    return { watch, stop, stopInTree, clear };
}

export function createThrottleMap() {
    const timers = new Map();

    function clear(element) {
        const timer = timers.get(element);
        if (!timer) {
            return;
        }
        clearTimeout(timer);
        timers.delete(element);
    }

    function clearAll() {
        timers.forEach((timer) => clearTimeout(timer));
        timers.clear();
    }

    function schedule(element, delayMs, run) {
        if (timers.has(element)) {
            return;
        }
        timers.set(element, setTimeout(() => {
            timers.delete(element);
            run(element);
        }, Math.max(0, delayMs)));
    }

    return { schedule, clear, clearAll };
}

/**
 * Page MutationObserver + IntersectionObserver for markdown messages.
 *
 * @param {object} options
 * @param {string} options.markdownSelector
 * @param {(el: Element) => void} options.processMarkdown
 * @param {(node: Node) => Element|null} [options.closestMarkdown]
 * @param {(node: Element, api) => void} [options.onAdded]
 * @param {(target: Node, api) => void} [options.onMutationTarget]
 * @param {(el: Element) => number} [options.throttleMs]
 * @param {(el: Element) => boolean} [options.shouldSkipMissed]
 * @param {string} [options.unprocessedSelector]
 * @param {() => boolean} [options.isEngineActive]
 * @param {(node: Element, queueMarkdown: Function) => void} [options.collectMarkdown]
 */
export function createViewportMessageWatch(options) {
    const {
        markdownSelector,
        processMarkdown,
        closestMarkdown = (node) => closestMatching(node, markdownSelector),
        onAdded = null,
        onMutationTarget = null,
        throttleMs = () => MARKDOWN_THROTTLE_MS,
        shouldSkipMissed = null,
        unprocessedSelector = null,
        isEngineActive = () => true,
        collectMarkdown = null
    } = options;

    let pageObserver = null;
    let viewportObserver = null;
    let flushFrame = 0;
    let lastRun = new WeakMap();
    const streams = createStreamWatch();
    const throttle = createThrottleMap();
    const extraFlushHandlers = new Map();

    const pendingMarkdown = new Set();
    const pendingExtras = new Map();
    const onScreen = new Set();
    const waiting = new Set();
    const seen = new WeakSet();
    const offscreen = new WeakSet();

    function scheduleFlush() {
        if (!flushFrame) {
            flushFrame = requestAnimationFrame(flush);
        }
    }

    function queueExtra(name, node) {
        if (!pendingExtras.has(name)) {
            pendingExtras.set(name, new Set());
        }
        pendingExtras.get(name).add(node);
        scheduleFlush();
    }

    function setExtraFlush(name, handler) {
        extraFlushHandlers.set(name, handler);
    }

    function seeMarkdown(element) {
        if (!element || seen.has(element) || !viewportObserver) {
            return;
        }
        seen.add(element);
        viewportObserver.observe(element);
    }

    function queueMarkdown(element) {
        if (!element || element.nodeType !== 1) {
            return;
        }
        seeMarkdown(element);
        pendingMarkdown.add(element);
        scheduleFlush();
    }

    function runMarkdown(element) {
        if (!isEngineActive() || !element || !element.isConnected) {
            return;
        }
        if (!onScreen.has(element)) {
            waiting.add(element);
            return;
        }
        const waitMs = throttleMs(element);
        const elapsed = Date.now() - (lastRun.get(element) || 0);
        if (elapsed < waitMs) {
            waiting.add(element);
            throttle.schedule(element, waitMs - elapsed, runMarkdown);
            return;
        }
        lastRun.set(element, Date.now());
        waiting.delete(element);
        throttle.clear(element);
        processMarkdown(element);
    }

    function flush() {
        flushFrame = 0;
        pendingMarkdown.forEach((element) => {
            if (element.isConnected) {
                runMarkdown(element);
            }
        });
        pendingMarkdown.clear();
        pendingExtras.forEach((nodes, name) => {
            const handler = extraFlushHandlers.get(name);
            if (handler) {
                nodes.forEach((node) => {
                    if (node.isConnected) {
                        handler(node);
                    }
                });
            }
            nodes.clear();
        });
    }

    function defaultCollectMarkdown(node) {
        if (node.matches && node.matches(markdownSelector)) {
            queueMarkdown(node);
        }
        if (node.querySelectorAll) {
            node.querySelectorAll(markdownSelector).forEach(queueMarkdown);
        }
    }

    function start() {
        stop();
        lastRun = new WeakMap();

        viewportObserver = createViewportObserver((entries) => {
            entries.forEach((entry) => {
                const element = entry.target;
                if (entry.isIntersecting) {
                    onScreen.add(element);
                    streams.watch(element, queueMarkdown);
                    if (waiting.has(element) || !lastRun.has(element)) {
                        runMarkdown(element);
                    }
                    return;
                }
                onScreen.delete(element);
                waiting.add(element);
                streams.stop(element);
            });
        });

        const api = { queueMarkdown, queueExtra, scheduleFlush };

        pageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type !== 'childList') {
                    return;
                }
                mutation.removedNodes.forEach((node) => streams.stopInTree(node));
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) {
                        return;
                    }
                    if (collectMarkdown) {
                        collectMarkdown(node, queueMarkdown);
                    } else {
                        defaultCollectMarkdown(node);
                    }
                    if (onAdded) {
                        onAdded(node, api);
                    }
                    scheduleFlush();
                });
                if (onMutationTarget) {
                    onMutationTarget(mutation.target, api);
                }
                const markdown = closestMarkdown(mutation.target);
                if (markdown) {
                    queueMarkdown(markdown);
                }
            });
        });

        if (document.body) {
            pageObserver.observe(document.body, { childList: true, subtree: true });
        }
        if (collectMarkdown) {
            collectMarkdown(document.body, queueMarkdown);
        } else {
            document.querySelectorAll(markdownSelector).forEach(queueMarkdown);
        }
    }

    function stop() {
        if (pageObserver) {
            pageObserver.disconnect();
            pageObserver = null;
        }
        if (viewportObserver) {
            viewportObserver.disconnect();
            viewportObserver = null;
        }
        if (flushFrame) {
            cancelAnimationFrame(flushFrame);
            flushFrame = 0;
        }
        streams.clear();
        throttle.clearAll();
        pendingMarkdown.clear();
        pendingExtras.forEach((nodes) => nodes.clear());
        onScreen.clear();
        waiting.clear();
    }

    function recheck() {
        if (!isEngineActive()) {
            return;
        }
        const nodes = document.querySelectorAll(unprocessedSelector || markdownSelector);
        let looked = 0;
        let processed = 0;
        for (let i = nodes.length - 1; i >= 0 && looked < MISSED_LOOK_BUDGET && processed < MISSED_PROCESS_BUDGET; i--) {
            const element = nodes[i];
            if (!element.isConnected || element.hasAttribute('data-text-length') || element.classList.contains('AsSetAlgorithm')) {
                continue;
            }
            if (shouldSkipMissed && shouldSkipMissed(element)) {
                continue;
            }
            if (offscreen.has(element)) {
                continue;
            }
            seeMarkdown(element);
            looked += 1;
            if (!isNearViewport(element)) {
                offscreen.add(element);
                continue;
            }
            onScreen.add(element);
            streams.watch(element, queueMarkdown);
            runMarkdown(element);
            processed += 1;
        }
    }

    return { start, stop, recheck, queueMarkdown, setExtraFlush, queueExtra, scheduleFlush };
}
