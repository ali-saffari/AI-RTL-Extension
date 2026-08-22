const DEFAULT_OBSERVE = {
    childList: true,
    subtree: true,
    characterData: true,
};

const liveHandles = new Set();

function toElement(node) {
    if (!node) {
        return null;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        return node;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        return node.parentElement;
    }
    return null;
}

function safeMatches(el, selector) {
    if (!el || !selector || typeof el.matches !== 'function') {
        return false;
    }
    try {
        return el.matches(selector);
    } catch {
        return false;
    }
}

function safeClosest(el, selector) {
    if (!el || !selector || typeof el.closest !== 'function') {
        return null;
    }
    try {
        return el.closest(selector);
    } catch {
        return null;
    }
}

function safeQueryAll(el, selector) {
    if (!el || !selector || typeof el.querySelectorAll !== 'function') {
        return [];
    }
    try {
        return el.querySelectorAll(selector);
    } catch {
        return [];
    }
}

function isIgnored(el, ignore) {
    return Boolean(ignore && safeClosest(el, ignore));
}

function addClosestTarget(targets, el, section) {
    if (!el || (section.exclude && safeClosest(el, section.exclude))) {
        return;
    }

    if (safeMatches(el, section.selector) && !isIgnored(el, section.ignore)) {
        targets.add(el);
        return;
    }

    const closest = safeClosest(el, section.selector);
    if (closest && !isIgnored(closest, section.ignore)) {
        targets.add(closest);
    }
}

function collectInSubtree(node, section) {
    const targets = new Set();
    const el = toElement(node);
    if (!el) {
        return targets;
    }

    addClosestTarget(targets, el, section);

    safeQueryAll(el, section.selector).forEach((found) => {
        if (section.exclude && safeMatches(found, section.exclude)) {
            return;
        }
        if (!isIgnored(found, section.ignore)) {
            targets.add(found);
        }
    });

    return targets;
}

/**
 * Watch DOM mutations and run one shared callback after they settle.
 * Prefer observeDomSections when input, markdown, etc. should be handled separately.
 *
 * @param {Function} onChange
 * @param {Object} [options]
 * @returns {{ disconnect: Function, observer: MutationObserver }}
 */
export function observeDomChanges(onChange, options = {}) {
    return observeDomSections(
        [
            {
                selector: 'body',
                process: () => onChange(),
            },
        ],
        options
    );
}

/**
 * Shared MutationObserver that routes each mutation to matching sections.
 * Only the section whose selector matches is processed (e.g. input vs markdown).
 *
 * Timing per section:
 * - debounceMs: wait after the last mutation in a burst, then try to process
 * - throttleMs: after a process run, wait at least this long before the next run
 * - idleMs: after a process run, if the observer stays quiet, run one last pass
 *
 * @param {Array<{
 *   selector: string,
 *   process: Function,
 *   ignore?: string,
 *   exclude?: string,
 *   debounceMs?: number,
 *   throttleMs?: number,
 *   idleMs?: number
 * }>} sections
 * @param {Object} [options]
 * @param {Node} [options.root]
 * @param {number} [options.debounceMs=200]
 * @param {number} [options.throttleMs=1000]
 * @param {number} [options.idleMs=1300]
 * @param {MutationObserverInit} [options.observe]
 * @param {boolean} [options.runImmediately=true]
 * @returns {{ disconnect: Function, observer: MutationObserver }}
 */
export function observeDomSections(sections, options = {}) {
    const {
        root,
        debounceMs = 200,
        throttleMs = 1000,
        idleMs = 1300,
        observe = DEFAULT_OBSERVE,
        runImmediately = true,
    } = options;

    const states = sections.map((section) => ({
        pending: new Set(),
        lastElements: [],
        debounceTimer: null,
        cooldownTimer: null,
        idleTimer: null,
        lastFlushAt: 0,
        debounceMs: section.debounceMs ?? debounceMs,
        throttleMs: section.throttleMs ?? throttleMs,
        idleMs: section.idleMs ?? idleMs,
    }));
    let active = false;
    let alive = true;

    const flushSection = (index, { fromIdle = false } = {}) => {
        if (!alive) {
            return;
        }
        const section = sections[index];
        const state = states[index];
        const source = state.pending.size ? state.pending : fromIdle ? state.lastElements : [];
        const elements = Array.from(source);
        state.pending.clear();

        const connected = elements.filter((el) => el.isConnected);
        connected.forEach((el) => section.process(el));
        if (connected.length) {
            state.lastElements = connected;
            state.lastFlushAt = Date.now();
        }

        observer.takeRecords();

        if (state.cooldownTimer) {
            clearTimeout(state.cooldownTimer);
            state.cooldownTimer = null;
        }

        if (fromIdle || state.idleMs <= 0 || !connected.length) {
            return;
        }

        clearTimeout(state.idleTimer);
        state.idleTimer = setTimeout(() => {
            state.idleTimer = null;
            if (state.pending.size) {
                tryFlush(index);
                return;
            }

            // Observer stayed quiet: run one last pass on the latest elements.
            state.lastElements.forEach((el) => {
                if (el.isConnected) {
                    state.pending.add(el);
                }
            });
            flushSection(index, { fromIdle: true });
        }, state.idleMs);
    };

    const tryFlush = (index) => {
        const state = states[index];
        if (!state.pending.size) {
            return;
        }

        if (state.throttleMs > 0 && state.lastFlushAt) {
            const remaining = state.throttleMs - (Date.now() - state.lastFlushAt);
            if (remaining > 0) {
                if (!state.cooldownTimer) {
                    state.cooldownTimer = setTimeout(() => {
                        state.cooldownTimer = null;
                        tryFlush(index);
                    }, remaining);
                }
                return;
            }
        }

        flushSection(index);
    };

    const queueTargets = (index, targets) => {
        if (!targets.size) {
            return;
        }

        const state = states[index];
        targets.forEach((el) => state.pending.add(el));

        // Observer fired again, so cancel the quiet-pass timer.
        if (state.idleTimer) {
            clearTimeout(state.idleTimer);
            state.idleTimer = null;
        }

        clearTimeout(state.debounceTimer);
        state.debounceTimer = setTimeout(() => {
            state.debounceTimer = null;
            tryFlush(index);
        }, state.debounceMs);
    };

    const observer = new MutationObserver((mutations) => {
        if (!active) {
            return;
        }

        sections.forEach((section, index) => {
            const targets = new Set();
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        collectInSubtree(node, section).forEach((el) => targets.add(el));
                    });
                    addClosestTarget(targets, toElement(mutation.target), section);
                } else if (mutation.type === 'characterData') {
                    addClosestTarget(targets, toElement(mutation.target), section);
                }
            });
            queueTargets(index, targets);
        });
    });

    const start = (node) => {
        if (!node || active) {
            return;
        }
        observer.observe(node, observe);
        active = true;
    };

    const tryStart = () => start(root || document.body);

    const processExisting = () => {
        const scope = root || document.body;
        if (!scope) {
            return;
        }

        sections.forEach((section, index) => {
            collectInSubtree(scope, section).forEach((el) => states[index].pending.add(el));
            if (states[index].pending.size) {
                flushSection(index);
            }
        });
    };

    if (runImmediately) {
        if (document.body || root) {
            processExisting();
        } else {
            document.addEventListener('DOMContentLoaded', processExisting, { once: true });
        }
    }

    if (!tryStart()) {
        document.addEventListener('DOMContentLoaded', tryStart, { once: true });
    }

    const handle = {
        disconnect() {
            alive = false;
            active = false;
            states.forEach((state) => {
                clearTimeout(state.debounceTimer);
                clearTimeout(state.cooldownTimer);
                clearTimeout(state.idleTimer);
                state.pending.clear();
                state.lastElements = [];
            });
            observer.disconnect();
            liveHandles.delete(handle);
        },
        observer,
    };
    liveHandles.add(handle);
    return handle;
}

export function disconnectAllDomObservers() {
    Array.from(liveHandles).forEach((handle) => {
        try {
            handle.disconnect();
        } catch {
            // Ignore
        }
    });
    liveHandles.clear();
}
