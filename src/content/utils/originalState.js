/**
 * Snapshot page DOM before the extension mutates it, then restore
 * those originals when RTL is turned off or the algorithm changes.
 */

const SKIP_STYLE_IDS = new Set([
    'ai-rtl-selected-font-style',
    'ai-rtl-font-scale-style'
]);

const INJECTED_SELECTORS = [
    '.AsBox',
    '#Asmodal',
    '#AsUpdateModal',
    '#ai-rtl-locked-editor-css',
    '#ai-rtl-cm-code-direction',
    '#ai-rtl-claude-font-weights',
    '#1minai-ant-input-style',
    '#google-rtl-style',
    'style[data-rtl-business-gemini]'
];

const JQUERY_DATA_KEYS = ['rtl-processed'];

const originals = new WeakMap();
const trackedElements = new Set();
const trackedTextNodes = new Set();
const trackedObservers = new Set();
const trackedIntervals = new Set();
const trackedTimeouts = new Set();
const trackedRafs = new Set();
const injectedNodes = new Set();
const styleOwners = new WeakMap();
const classListOwners = new WeakMap();

const nativeSetTimeout = window.setTimeout.bind(window);
const nativeClearTimeout = window.clearTimeout.bind(window);
const nativeSetInterval = window.setInterval.bind(window);
const nativeClearInterval = window.clearInterval.bind(window);
const nativeRaf = window.requestAnimationFrame.bind(window);
const nativeCancelRaf = window.cancelAnimationFrame.bind(window);

const addedExtensionClasses = new Set();

const KNOWN_EXTENSION_CLASSES = new Set([
    'AsOk', 'AsOK', 'Asok', 'AsOk2', 'AsOkText', 'AsOkList', 'AsOkList_absolute',
    'AsOkRList', 'AsOkCode', 'AsOkCodeBlock', 'AsOkFontSet', 'AsOkNotebooklm',
    'AsOkUser', 'AsOkBtn', 'AsOkCON', 'AsSet', 'AsSetAlgorithm', 'AsSetLtr',
    'AsRtl', 'AsRtlList', 'AsRtlList_parent', 'AsRtl_rowReverse', 'AsRtlClaudeList',
    'AsRtlClaudeUser', 'AsRtlPerplexity', 'AsJustRtl', 'AsAlignRtl', 'AsRed',
    'AsDonateOk', 'AsDonate', 'AsSBtn', 'AsBox', 'AsBoxB', 'AsBoxGemini',
    'AsBoxClaude', 'AsBoxPerplexity', 'AsBoxDuckduckgo', 'AsBoxMonica',
    'AsBoxgrok', 'AsBoxqwenlm', 'AsBox_copilotBing', 'AsBox_copilotBingBlock',
    'AsBoxBusinessGemini', 'AsBinBox', 'AsMistral', 'AsKimi',
    'FontSet', 'FontSetGPT', 'FontSetCode', 'FontSetCodeBlocksGPT', 'FontClaude',
    'FontSetImportant', 'FontSetImportant2', 'FontSetImportantGPT', 'CopilotFontSet',
    'FontSetPerplexity', 'FontSetVivado', 'FontSetVivadoInput', 'FontSetNodeName',
    'FontOpenRouter', 'FontMinimax', 'noFont',
    'rtl-algorithm-active', 'rtlEelemt', 'listboxRtlCopilot', 'notion-rtl-toggle-btn',
    'rtl-mask-applied', 'activateDuckduckgo', 'removeedDirAuto', 'setRight'
]);

const EXTENSION_CLASS_RE = /^(As[A-Z0-9_-]|Asok$|AsOK$|AsOk|FontSet|FontClaude|FontOpenRouter|FontMinimax|CopilotFontSet|rtl-algorithm-active|rtlEelemt|listboxRtlCopilot|notion-rtl|rtl-mask-applied|activateDuckduckgo|removeedDirAuto|setRight$|noFont$|As-modal|As-close|As-change)/;

const EXTENSION_CLASS_SWEEP_SELECTOR = [
    '[class*="As"]',
    '[class*="FontSet"]',
    '[class*="FontClaude"]',
    '[class*="FontOpen"]',
    '[class*="FontMini"]',
    '[class*="CopilotFont"]',
    '[class*="rtl-algorithm"]',
    '[class*="rtlEelemt"]',
    '[class*="listboxRtl"]',
    '[class*="notion-rtl"]',
    '[class*="rtl-mask"]',
    '[class*="activateDuckduckgo"]',
    '[class*="removeedDirAuto"]',
    '[class*="setRight"]',
    '[class*="noFont"]'
].join(',');

const FALLBACK_ATTRS = [
    'data-direction', 'data-text-length', 'data-algorithm-rtl', 'data-rtl-processed',
    'data-ai-rtl-orig-dir', 'data-ai-rtl-editor', 'data-ai-rtl-sig', 'data-as-mode',
    'data-org-dir', 'data-ai-rtl-bq-mirrored', 'data-ai-rtl-bq-tw', 'data-debug-mode',
    'data-debug-reason', 'data-debug-processed', 'data-skip-log-sent'
];

let capturing = false;
let restoring = false;
let rtlEngineActive = false;
let hooksInstalled = false;
let restorePass = 0;

function isSkippableRoot(el) {
    if (!el || el.nodeType !== 1) {
        return true;
    }
    if (el === document.documentElement || el === document.head) {
        return true;
    }
    if (SKIP_STYLE_IDS.has(el.id)) {
        return true;
    }
    return false;
}

function canCapture(node) {
    if (!capturing || restoring || !node) {
        return false;
    }
    if (node.nodeType === 1) {
        return node.isConnected && !isSkippableRoot(node);
    }
    if (node.nodeType === 3) {
        return Boolean(node.parentNode && node.parentNode.isConnected);
    }
    return false;
}

function getRecord(node) {
    let rec = originals.get(node);
    if (!rec) {
        rec = {
            attrs: new Map(),
            classAdded: new Set(),
            classRemoved: new Set(),
            styles: new Map(),
            innerHTML: undefined,
            nodeValue: undefined
        };
        originals.set(node, rec);
    }
    if (node.nodeType === 1) {
        trackedElements.add(node);
    } else {
        trackedTextNodes.add(node);
    }
    return rec;
}

function rememberAttr(el, name) {
    if (!canCapture(el) || el.nodeType !== 1 || !name) {
        return;
    }
    const rec = getRecord(el);
    if (!rec.attrs.has(name)) {
        rec.attrs.set(name, {
            existed: el.hasAttribute(name),
            value: el.getAttribute(name)
        });
    }
    if (name === 'dir' && !el.hasAttribute('data-ai-rtl-orig-dir')) {
        const originalDir = el.hasAttribute('dir') ? (el.getAttribute('dir') || '') : '';
        el.setAttribute('data-ai-rtl-orig-dir', originalDir);
    }
}

function rememberClassTokens(el, tokens, adding) {
    if (!canCapture(el) || el.nodeType !== 1) {
        return;
    }
    const rec = getRecord(el);
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token) {
            continue;
        }
        if (adding) {
            if (rec.classRemoved.has(token)) {
                rec.classRemoved.delete(token);
            } else if (!el.classList.contains(token)) {
                rec.classAdded.add(token);
                addedExtensionClasses.add(token);
            }
        } else if (rec.classAdded.has(token)) {
            rec.classAdded.delete(token);
        } else if (el.classList.contains(token)) {
            rec.classRemoved.add(token);
        }
    }
}

function rememberStyle(el, prop) {
    if (!canCapture(el) || !el.style || !prop) {
        return;
    }
    const rec = getRecord(el);
    if (!rec.styles.has(prop)) {
        rec.styles.set(prop, {
            value: el.style.getPropertyValue(prop),
            priority: el.style.getPropertyPriority(prop)
        });
    }
}

function rememberInnerHTML(el) {
    if (!canCapture(el) || el.nodeType !== 1) {
        return;
    }
    const rec = getRecord(el);
    if (rec.innerHTML === undefined) {
        rec.innerHTML = el.innerHTML;
    }
}

function rememberText(node) {
    if (!canCapture(node) || node.nodeType !== 3) {
        return;
    }
    const rec = getRecord(node);
    if (rec.nodeValue === undefined) {
        rec.nodeValue = node.nodeValue;
    }
}

function rememberInjected(node) {
    if (!capturing || restoring || !node || node.nodeType !== 1) {
        return;
    }
    if (SKIP_STYLE_IDS.has(node.id)) {
        return;
    }
    const tag = node.tagName && node.tagName.toLowerCase();
    if (tag === 'style') {
        injectedNodes.add(node);
        return;
    }
    if (node.id === 'Asmodal' || node.id === 'AsUpdateModal') {
        injectedNodes.add(node);
        return;
    }
    if (node.classList && (node.classList.contains('AsBox') || node.classList.contains('As-modal-backdrop'))) {
        injectedNodes.add(node);
    }
}

function wrapMethod(object, key, wrapper) {
    const original = object[key];
    if (typeof original !== 'function' || original.__aiRtlWrapped) {
        return;
    }
    const wrapped = function (...args) {
        return wrapper.call(this, original, args);
    };
    wrapped.__aiRtlWrapped = true;
    object[key] = wrapped;
}

function wrapSetter(proto, key, beforeSet) {
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.set !== 'function' || desc.set.__aiRtlWrapped) {
        return;
    }
    const wrapped = function (value) {
        beforeSet(this, value);
        return desc.set.call(this, value);
    };
    wrapped.__aiRtlWrapped = true;
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set: wrapped
    });
}

function wrapGetterMap(proto, key, map) {
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.get !== 'function' || desc.get.__aiRtlWrapped) {
        return;
    }
    const wrapped = function () {
        const value = desc.get.call(this);
        if (value) {
            map.set(value, this);
        }
        return value;
    };
    wrapped.__aiRtlWrapped = true;
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: desc.enumerable,
        get: wrapped,
        set: desc.set
    });
}

function installDomHooks() {
    wrapMethod(Element.prototype, 'setAttribute', function (original, args) {
        rememberAttr(this, args[0]);
        return original.apply(this, args);
    });
    wrapMethod(Element.prototype, 'removeAttribute', function (original, args) {
        rememberAttr(this, args[0]);
        return original.apply(this, args);
    });
    wrapMethod(Element.prototype, 'toggleAttribute', function (original, args) {
        rememberAttr(this, args[0]);
        return original.apply(this, args);
    });

    wrapGetterMap(Element.prototype, 'classList', classListOwners);
    wrapMethod(DOMTokenList.prototype, 'add', function (original, args) {
        const el = classListOwners.get(this);
        if (el) {
            rememberClassTokens(el, args, true);
        }
        return original.apply(this, args);
    });
    wrapMethod(DOMTokenList.prototype, 'remove', function (original, args) {
        const el = classListOwners.get(this);
        if (el) {
            rememberClassTokens(el, args, false);
        }
        return original.apply(this, args);
    });
    wrapMethod(DOMTokenList.prototype, 'toggle', function (original, args) {
        const el = classListOwners.get(this);
        const token = args[0];
        if (el && token) {
            const force = args.length > 1 ? Boolean(args[1]) : !this.contains(token);
            rememberClassTokens(el, [token], force);
        }
        return original.apply(this, args);
    });
    wrapMethod(DOMTokenList.prototype, 'replace', function (original, args) {
        const el = classListOwners.get(this);
        if (el) {
            rememberClassTokens(el, [args[0]], false);
            rememberClassTokens(el, [args[1]], true);
        }
        return original.apply(this, args);
    });

    wrapGetterMap(HTMLElement.prototype, 'style', styleOwners);
    if (typeof SVGElement !== 'undefined') {
        wrapGetterMap(SVGElement.prototype, 'style', styleOwners);
    }
    wrapMethod(CSSStyleDeclaration.prototype, 'setProperty', function (original, args) {
        const el = styleOwners.get(this);
        if (el) {
            rememberStyle(el, args[0]);
        }
        return original.apply(this, args);
    });
    wrapMethod(CSSStyleDeclaration.prototype, 'removeProperty', function (original, args) {
        const el = styleOwners.get(this);
        if (el) {
            rememberStyle(el, args[0]);
        }
        return original.apply(this, args);
    });

    wrapSetter(Element.prototype, 'innerHTML', function (el) {
        rememberInnerHTML(el);
    });
    wrapSetter(CharacterData.prototype, 'data', function (node) {
        rememberText(node);
    });
    wrapSetter(CharacterData.prototype, 'nodeValue', function (node) {
        rememberText(node);
    });
    wrapSetter(Node.prototype, 'nodeValue', function (node) {
        rememberText(node);
    });

    wrapMethod(Node.prototype, 'appendChild', function (original, args) {
        const result = original.apply(this, args);
        rememberInjected(args[0]);
        return result;
    });
    wrapMethod(Node.prototype, 'insertBefore', function (original, args) {
        const result = original.apply(this, args);
        rememberInjected(args[0]);
        return result;
    });
    wrapMethod(Element.prototype, 'prepend', function (original, args) {
        args.forEach((node) => rememberInjected(node));
        return original.apply(this, args);
    });
    wrapMethod(Element.prototype, 'append', function (original, args) {
        args.forEach((node) => rememberInjected(node));
        return original.apply(this, args);
    });
}

function installObserverHooks() {
    const NativeMO = window.MutationObserver;
    if (!NativeMO || NativeMO.__aiRtlWrapped) {
        return;
    }

    class TrackedMutationObserver extends NativeMO {
        observe(target, options) {
            if (capturing && !restoring) {
                trackedObservers.add(this);
            }
            return super.observe(target, options);
        }

        disconnect() {
            trackedObservers.delete(this);
            return super.disconnect();
        }
    }
    TrackedMutationObserver.__aiRtlWrapped = true;
    window.MutationObserver = TrackedMutationObserver;
}

function installTimerHooks() {
    if (!window.setInterval.__aiRtlWrapped) {
        const wrappedInterval = function (...args) {
            const id = nativeSetInterval(...args);
            if (capturing && !restoring) {
                trackedIntervals.add(id);
            }
            return id;
        };
        wrappedInterval.__aiRtlWrapped = true;
        window.setInterval = wrappedInterval;
        window.clearInterval = function (id) {
            trackedIntervals.delete(id);
            return nativeClearInterval(id);
        };
    }

    if (!window.setTimeout.__aiRtlWrapped) {
        const wrappedTimeout = function (...args) {
            const id = nativeSetTimeout(...args);
            if (capturing && !restoring) {
                trackedTimeouts.add(id);
            }
            return id;
        };
        wrappedTimeout.__aiRtlWrapped = true;
        window.setTimeout = wrappedTimeout;
        window.clearTimeout = function (id) {
            trackedTimeouts.delete(id);
            return nativeClearTimeout(id);
        };
    }

    if (typeof window.requestAnimationFrame === 'function' && !window.requestAnimationFrame.__aiRtlWrapped) {
        const wrappedRaf = function (callback) {
            const id = nativeRaf(callback);
            if (capturing && !restoring) {
                trackedRafs.add(id);
            }
            return id;
        };
        wrappedRaf.__aiRtlWrapped = true;
        window.requestAnimationFrame = wrappedRaf;
        window.cancelAnimationFrame = function (id) {
            trackedRafs.delete(id);
            return nativeCancelRaf(id);
        };
    }
}

function splitClassNames(value) {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        return value.flatMap(splitClassNames);
    }
    return String(value).match(/\S+/g) || [];
}

function installJqueryHooks() {
    const jq = typeof window.AQ === 'function' ? window.AQ : null;
    if (!jq || !jq.fn || jq.fn.attr.__aiRtlWrapped) {
        return;
    }

    const origAttr = jq.fn.attr;
    jq.fn.attr = function (name, value) {
        if (typeof name === 'string' && arguments.length >= 2) {
            this.each(function () {
                rememberAttr(this, name);
            });
        } else if (name && typeof name === 'object') {
            const keys = Object.keys(name);
            this.each(function () {
                keys.forEach((key) => rememberAttr(this, key));
            });
        }
        return origAttr.apply(this, arguments);
    };
    jq.fn.attr.__aiRtlWrapped = true;

    const origRemoveAttr = jq.fn.removeAttr;
    jq.fn.removeAttr = function (name) {
        const names = splitClassNames(name);
        this.each(function () {
            names.forEach((key) => rememberAttr(this, key));
        });
        return origRemoveAttr.apply(this, arguments);
    };

    const origAddClass = jq.fn.addClass;
    jq.fn.addClass = function (value) {
        if (typeof value === 'string' || Array.isArray(value)) {
            const tokens = splitClassNames(value);
            this.each(function () {
                rememberClassTokens(this, tokens, true);
            });
        }
        return origAddClass.apply(this, arguments);
    };

    const origRemoveClass = jq.fn.removeClass;
    jq.fn.removeClass = function (value) {
        if (typeof value === 'string' || Array.isArray(value)) {
            const tokens = splitClassNames(value);
            this.each(function () {
                rememberClassTokens(this, tokens, false);
            });
        }
        return origRemoveClass.apply(this, arguments);
    };

    const origCss = jq.fn.css;
    jq.fn.css = function (name, value) {
        if (typeof name === 'string' && arguments.length >= 2) {
            this.each(function () {
                rememberStyle(this, name);
            });
        } else if (name && typeof name === 'object') {
            const keys = Object.keys(name);
            this.each(function () {
                keys.forEach((key) => rememberStyle(this, key));
            });
        }
        return origCss.apply(this, arguments);
    };

    const origHtml = jq.fn.html;
    jq.fn.html = function (value) {
        if (arguments.length > 0) {
            this.each(function () {
                rememberInnerHTML(this);
            });
        }
        return origHtml.apply(this, arguments);
    };
}

function clearJqueryData(el) {
    if (typeof window.AQ !== 'function') {
        return;
    }
    try {
        const $el = window.AQ(el);
        JQUERY_DATA_KEYS.forEach((key) => $el.removeData(key));
    } catch {
        // Ignore
    }
}

function cleanupEmptyClassAndStyle(el) {
    if (!el || el.nodeType !== 1) {
        return;
    }
    if (el.hasAttribute('class') && !String(el.getAttribute('class') || '').trim()) {
        el.removeAttribute('class');
    }
    if (el.hasAttribute('style') && !String(el.getAttribute('style') || '').trim()) {
        el.removeAttribute('style');
    }
}

function restoreOrigDirOn(el) {
    if (!el || !el.hasAttribute('data-ai-rtl-orig-dir')) {
        return;
    }
    const originalDir = el.getAttribute('data-ai-rtl-orig-dir');
    if (originalDir) {
        el.setAttribute('dir', originalDir);
    } else {
        el.removeAttribute('dir');
    }
    el.removeAttribute('data-ai-rtl-orig-dir');
}

function restoreElement(el, options = {}) {
    const rec = originals.get(el);
    if (!rec || !el.isConnected) {
        return false;
    }

    if (!options.skipInnerHTML && rec.innerHTML !== undefined) {
        el.innerHTML = rec.innerHTML;
    }

    rec.attrs.forEach((orig, name) => {
        if (orig.existed) {
            el.setAttribute(name, orig.value == null ? '' : orig.value);
        } else {
            el.removeAttribute(name);
        }
    });

    if (!rec.attrs.has('class')) {
        rec.classAdded.forEach((token) => el.classList.remove(token));
        rec.classRemoved.forEach((token) => el.classList.add(token));
    }

    rec.styles.forEach((orig, prop) => {
        if (orig.value) {
            el.style.setProperty(prop, orig.value, orig.priority || undefined);
        } else {
            el.style.removeProperty(prop);
        }
    });

    rec.classAdded.forEach((token) => el.classList.remove(token));
    stripExtensionClassesFrom(el);
    clearJqueryData(el);
    cleanupEmptyClassAndStyle(el);
    return true;
}

export function restoreTrackedElement(el, options = {}) {
    if (!el || el.nodeType !== 1) {
        return false;
    }
    const prevRestoring = restoring;
    restoring = true;
    try {
        const restored = restoreElement(el, options);
        restoreOrigDirOn(el);
        cleanupEmptyClassAndStyle(el);
        return restored;
    } finally {
        restoring = prevRestoring;
    }
}

export function runWhileRestoring(fn) {
    const prevRestoring = restoring;
    restoring = true;
    try {
        return fn();
    } finally {
        restoring = prevRestoring;
    }
}

function removeInjectedUi() {
    injectedNodes.forEach((node) => {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });
    injectedNodes.clear();

    INJECTED_SELECTORS.forEach((selector) => {
        try {
            document.querySelectorAll(selector).forEach((node) => {
                if (SKIP_STYLE_IDS.has(node.id)) {
                    return;
                }
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            });
        } catch {
            // Ignore invalid selectors
        }
    });

    document.querySelectorAll('style[id$="-font-style"]').forEach((node) => {
        if (!SKIP_STYLE_IDS.has(node.id) && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });
}

function stopTrackedJobs() {
    const observers = Array.from(trackedObservers);
    trackedObservers.clear();
    observers.forEach((observer) => {
        try {
            observer.disconnect();
        } catch {
            // Ignore
        }
    });

    const intervals = Array.from(trackedIntervals);
    trackedIntervals.clear();
    intervals.forEach((id) => nativeClearInterval(id));

    const timeouts = Array.from(trackedTimeouts);
    trackedTimeouts.clear();
    timeouts.forEach((id) => nativeClearTimeout(id));

    const rafs = Array.from(trackedRafs);
    trackedRafs.clear();
    rafs.forEach((id) => nativeCancelRaf(id));
}

function clearOriginalRecords() {
    trackedElements.forEach((el) => originals.delete(el));
    trackedTextNodes.forEach((node) => originals.delete(node));
    trackedElements.clear();
    trackedTextNodes.clear();
    injectedNodes.clear();
}

function isExtensionClassName(name) {
    if (!name) {
        return false;
    }
    return KNOWN_EXTENSION_CLASSES.has(name)
        || addedExtensionClasses.has(name)
        || EXTENSION_CLASS_RE.test(name);
}

function stripExtensionClassesFrom(el) {
    if (!el || el.nodeType !== 1 || !el.classList) {
        return;
    }
    if (el === document.documentElement || el === document.head) {
        return;
    }

    const toRemove = [];
    el.classList.forEach((name) => {
        if (isExtensionClassName(name)) {
            toRemove.push(name);
        }
    });
    if (toRemove.length) {
        el.classList.remove(...toRemove);
    }
}

function stripExtensionArtifacts() {
    try {
        document.querySelectorAll(EXTENSION_CLASS_SWEEP_SELECTOR).forEach(stripExtensionClassesFrom);
    } catch {
        document.querySelectorAll('[class]').forEach(stripExtensionClassesFrom);
    }

    trackedElements.forEach((el) => {
        const rec = originals.get(el);
        if (rec && rec.classAdded.size) {
            rec.classAdded.forEach((name) => {
                if (el.classList) {
                    el.classList.remove(name);
                }
            });
        }
        stripExtensionClassesFrom(el);
    });

    FALLBACK_ATTRS.forEach((name) => {
        try {
            document.querySelectorAll(`[${name}]`).forEach((el) => {
                if (el === document.documentElement || el === document.head) {
                    return;
                }
                el.removeAttribute(name);
                if (typeof window.AQ === 'function') {
                    window.AQ(el).removeData('rtl-processed');
                }
            });
        } catch {
            // Ignore invalid attribute selectors
        }
    });

    removeInjectedUi();

    if (document.body) {
        stripExtensionClassesFrom(document.body);
        document.body.classList.remove('rtl-algorithm-active', 'AsDonateOk');
    }
    if (document.documentElement) {
        document.documentElement.classList.remove('ai-rtl-code-algorithm');
    }
}

export function isRtlEngineActive() {
    return rtlEngineActive;
}

export function startRtlEngine() {
    installJqueryHooks();
    restorePass += 1;
    clearOriginalRecords();
    rtlEngineActive = true;
    capturing = true;
}

function restoreLeftoverOrigDir() {
    try {
        document.querySelectorAll('[data-ai-rtl-orig-dir]').forEach((el) => {
            const originalDir = el.getAttribute('data-ai-rtl-orig-dir');
            if (originalDir) {
                el.setAttribute('dir', originalDir);
            } else {
                el.removeAttribute('dir');
            }
            el.removeAttribute('data-ai-rtl-orig-dir');
        });
    } catch {
        // Ignore
    }
}

export function restoreAllOriginals(options = {}) {
    restoring = true;
    capturing = false;
    try {
        trackedElements.forEach((el) => restoreElement(el));
        trackedTextNodes.forEach((node) => {
            const rec = originals.get(node);
            if (rec && rec.nodeValue !== undefined && node.parentNode) {
                node.nodeValue = rec.nodeValue;
            }
        });
        restoreLeftoverOrigDir();
        removeInjectedUi();
        if (document.body) {
            document.body.classList.remove('rtl-algorithm-active', 'AsDonateOk');
        }
        if (document.documentElement) {
            document.documentElement.classList.remove('ai-rtl-code-algorithm');
        }
    } finally {
        if (!options.keepRecords) {
            clearOriginalRecords();
        }
        restoring = false;
    }
}

function scheduleFollowupRestore(pass) {
    const rerun = () => {
        if (rtlEngineActive || pass !== restorePass) {
            return;
        }
        restoreAllOriginals({ keepRecords: true });
        stripExtensionArtifacts();
    };
    queueMicrotask(rerun);
    nativeSetTimeout(rerun, 0);
    nativeSetTimeout(rerun, 50);
}

export function stopRtlEngine() {
    rtlEngineActive = false;
    capturing = false;
    const pass = ++restorePass;
    stopTrackedJobs();
    restoreAllOriginals({ keepRecords: true });
    stripExtensionArtifacts();
    scheduleFollowupRestore(pass);
}

export function installOriginalStateHooks() {
    if (hooksInstalled) {
        return;
    }
    hooksInstalled = true;
    try {
        installDomHooks();
        installObserverHooks();
        installTimerHooks();
        installJqueryHooks();
    } catch (error) {
        console.warn('[AI RTL] original state hooks failed', error);
    }
}

installOriginalStateHooks();
