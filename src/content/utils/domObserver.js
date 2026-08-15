const DEFAULT_OBSERVE = {
    childList: true,
    subtree: true,
    characterData: true,
};

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
 * @param {Array<{
 *   selector: string,
 *   process: Function,
 *   ignore?: string,
 *   exclude?: string,
 *   debounceMs?: number
 * }>} sections
 * @param {Object} [options]
 * @param {Node} [options.root]
 * @param {number} [options.debounceMs=200]
 * @param {MutationObserverInit} [options.observe]
 * @param {boolean} [options.runImmediately=true]
 * @returns {{ disconnect: Function, observer: MutationObserver }}
 */
export function observeDomSections(sections, options = {}) {
    const {
        root,
        debounceMs = 200,
        observe = DEFAULT_OBSERVE,
        runImmediately = true,
    } = options;

    const pendingBySection = sections.map(() => new Set());
    const timers = sections.map(() => null);
    let active = false;

    const flushSection = (index) => {
        const section = sections[index];
        const pending = pendingBySection[index];
        const elements = Array.from(pending);
        pending.clear();

        elements.forEach((el) => {
            if (!el.isConnected) {
                return;
            }
            section.process(el);
        });

        observer.takeRecords();
    };

    const queueTargets = (index, targets) => {
        if (!targets.size) {
            return;
        }

        targets.forEach((el) => pendingBySection[index].add(el));
        clearTimeout(timers[index]);
        const wait = sections[index].debounceMs ?? debounceMs;
        timers[index] = setTimeout(() => flushSection(index), wait);
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
            collectInSubtree(scope, section).forEach((el) => pendingBySection[index].add(el));
            if (pendingBySection[index].size) {
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

    return {
        disconnect() {
            active = false;
            timers.forEach((timer) => clearTimeout(timer));
            pendingBySection.forEach((pending) => pending.clear());
            observer.disconnect();
        },
        observer,
    };
}
