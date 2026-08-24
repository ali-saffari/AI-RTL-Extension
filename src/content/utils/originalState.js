/**
 * Keep original dir/text-align on the element itself, then restore
 * those values when RTL is turned off or a setting is reverted.
 */

const ORIG_DIR_ATTR = 'data-ai-rtl-orig-dir';
const ORIG_ALIGN_ATTR = 'data-ai-rtl-orig-align';

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
    '#1minai-font-style',
    '#google-rtl-style',
    'style[data-rtl-business-gemini]'
];

const JQUERY_DATA_KEYS = ['rtl-processed'];

const trackedObservers = new Set();
const trackedIntervals = new Set();
const trackedTimeouts = new Set();
const trackedRafs = new Set();
const injectedNodes = new Set();
const styleOwners = new WeakMap();

const nativeSetTimeout = window.setTimeout.bind(window);
const nativeClearTimeout = window.clearTimeout.bind(window);
const nativeSetInterval = window.setInterval.bind(window);
const nativeClearInterval = window.clearInterval.bind(window);
const nativeRaf = window.requestAnimationFrame.bind(window);
const nativeCancelRaf = window.cancelAnimationFrame.bind(window);
const nativeSetAttribute = Element.prototype.setAttribute;
const nativeRemoveAttribute = Element.prototype.removeAttribute;
const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
const nativeRemoveProperty = CSSStyleDeclaration.prototype.removeProperty;

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
    ORIG_DIR_ATTR, ORIG_ALIGN_ATTR, 'data-ai-rtl-editor', 'data-ai-rtl-sig', 'data-as-mode',
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

function canStamp(el) {
    return capturing && !restoring && el && el.nodeType === 1 && el.isConnected && !isSkippableRoot(el);
}

function stampOrigDir(el) {
    if (!canStamp(el) || el.hasAttribute(ORIG_DIR_ATTR)) {
        return;
    }
    nativeSetAttribute.call(el, ORIG_DIR_ATTR, el.hasAttribute('dir') ? (el.getAttribute('dir') || '') : '');
}

function stampOrigAlign(el) {
    if (!canStamp(el) || !el.style || el.hasAttribute(ORIG_ALIGN_ATTR)) {
        return;
    }
    nativeSetAttribute.call(el, ORIG_ALIGN_ATTR, el.style.getPropertyValue('text-align') || '');
}

function isTextAlignProp(prop) {
    return prop === 'text-align' || prop === 'textAlign';
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

function installDomHooks() {
    wrapMethod(Element.prototype, 'setAttribute', function (original, args) {
        if (args[0] === 'dir') {
            stampOrigDir(this);
        }
        return original.apply(this, args);
    });
    wrapMethod(Element.prototype, 'removeAttribute', function (original, args) {
        if (args[0] === 'dir') {
            stampOrigDir(this);
        }
        return original.apply(this, args);
    });
    wrapMethod(Element.prototype, 'toggleAttribute', function (original, args) {
        if (args[0] === 'dir') {
            stampOrigDir(this);
        }
        return original.apply(this, args);
    });

    wrapSetter(HTMLElement.prototype, 'dir', function (el) {
        stampOrigDir(el);
    });

    wrapGetterMap(HTMLElement.prototype, 'style', styleOwners);
    wrapMethod(CSSStyleDeclaration.prototype, 'setProperty', function (original, args) {
        if (isTextAlignProp(args[0])) {
            const el = styleOwners.get(this);
            if (el) {
                stampOrigAlign(el);
            }
        }
        return original.apply(this, args);
    });
    wrapMethod(CSSStyleDeclaration.prototype, 'removeProperty', function (original, args) {
        if (isTextAlignProp(args[0])) {
            const el = styleOwners.get(this);
            if (el) {
                stampOrigAlign(el);
            }
        }
        return original.apply(this, args);
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

function installJqueryHooks() {
    const jq = typeof window.AQ === 'function' ? window.AQ : null;
    if (!jq || !jq.fn || jq.fn.attr.__aiRtlWrapped) {
        return;
    }

    const origAttr = jq.fn.attr;
    jq.fn.attr = function (name, value) {
        if (typeof name === 'string' && name === 'dir' && arguments.length >= 2) {
            this.each(function () {
                stampOrigDir(this);
            });
        } else if (name && typeof name === 'object' && Object.prototype.hasOwnProperty.call(name, 'dir')) {
            this.each(function () {
                stampOrigDir(this);
            });
        }
        return origAttr.apply(this, arguments);
    };
    jq.fn.attr.__aiRtlWrapped = true;

    const origRemoveAttr = jq.fn.removeAttr;
    jq.fn.removeAttr = function (name) {
        if (String(name).split(/\s+/).includes('dir')) {
            this.each(function () {
                stampOrigDir(this);
            });
        }
        return origRemoveAttr.apply(this, arguments);
    };

    const origCss = jq.fn.css;
    jq.fn.css = function (name, value) {
        if (typeof name === 'string' && isTextAlignProp(name) && arguments.length >= 2) {
            this.each(function () {
                stampOrigAlign(this);
            });
        } else if (name && typeof name === 'object' && (name['text-align'] != null || name.textAlign != null)) {
            this.each(function () {
                stampOrigAlign(this);
            });
        }
        return origCss.apply(this, arguments);
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
        nativeRemoveAttribute.call(el, 'class');
    }
    if (el.hasAttribute('style') && !String(el.getAttribute('style') || '').trim()) {
        nativeRemoveAttribute.call(el, 'style');
    }
}

function isExtensionClassName(name) {
    if (!name) {
        return false;
    }
    return KNOWN_EXTENSION_CLASSES.has(name) || EXTENSION_CLASS_RE.test(name);
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

function restoreDirFromSelf(el) {
    if (!el.hasAttribute(ORIG_DIR_ATTR)) {
        return;
    }
    const originalDir = el.getAttribute(ORIG_DIR_ATTR);
    if (originalDir) {
        nativeSetAttribute.call(el, 'dir', originalDir);
    } else {
        nativeRemoveAttribute.call(el, 'dir');
    }
    nativeRemoveAttribute.call(el, ORIG_DIR_ATTR);
}

function restoreAlignFromSelf(el) {
    if (!el.hasAttribute(ORIG_ALIGN_ATTR) || !el.style) {
        if (el.hasAttribute(ORIG_ALIGN_ATTR)) {
            nativeRemoveAttribute.call(el, ORIG_ALIGN_ATTR);
        }
        return;
    }
    const originalAlign = el.getAttribute(ORIG_ALIGN_ATTR);
    if (originalAlign) {
        nativeSetProperty.call(el.style, 'text-align', originalAlign);
    } else {
        nativeRemoveProperty.call(el.style, 'text-align');
    }
    nativeRemoveAttribute.call(el, ORIG_ALIGN_ATTR);
}

export function restoreElementFromSelf(el) {
    if (!el || el.nodeType !== 1) {
        return false;
    }

    const prevRestoring = restoring;
    restoring = true;
    try {
        const hasOrigDir = el.hasAttribute(ORIG_DIR_ATTR);
        const hasOrigAlign = el.hasAttribute(ORIG_ALIGN_ATTR);
        const touched = hasOrigDir || hasOrigAlign || el.classList.contains('AsSetLtr') || el.hasAttribute('data-direction');
        if (!touched) {
            return false;
        }

        restoreDirFromSelf(el);
        restoreAlignFromSelf(el);
        nativeRemoveAttribute.call(el, 'data-direction');
        stripExtensionClassesFrom(el);
        clearJqueryData(el);
        cleanupEmptyClassAndStyle(el);
        return true;
    } finally {
        restoring = prevRestoring;
    }
}

function restoreMarkedElements() {
    try {
        document.querySelectorAll(`[${ORIG_DIR_ATTR}], [${ORIG_ALIGN_ATTR}], .AsSetLtr, [data-direction]`).forEach((el) => {
            restoreElementFromSelf(el);
        });
    } catch {
        // Ignore
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

function stripExtensionArtifacts() {
    try {
        document.querySelectorAll(EXTENSION_CLASS_SWEEP_SELECTOR).forEach(stripExtensionClassesFrom);
    } catch {
        document.querySelectorAll('[class]').forEach(stripExtensionClassesFrom);
    }

    FALLBACK_ATTRS.forEach((name) => {
        try {
            document.querySelectorAll(`[${name}]`).forEach((el) => {
                if (el === document.documentElement || el === document.head) {
                    return;
                }
                nativeRemoveAttribute.call(el, name);
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
    injectedNodes.clear();
    rtlEngineActive = true;
    capturing = true;
}

export function restoreAllOriginals() {
    restoring = true;
    capturing = false;
    try {
        restoreMarkedElements();
        removeInjectedUi();
        if (document.body) {
            document.body.classList.remove('rtl-algorithm-active', 'AsDonateOk');
        }
        if (document.documentElement) {
            document.documentElement.classList.remove('ai-rtl-code-algorithm');
        }
    } finally {
        restoring = false;
    }
}

function scheduleFollowupRestore(pass) {
    const rerun = () => {
        if (rtlEngineActive || pass !== restorePass) {
            return;
        }
        restoreAllOriginals();
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
    restoreAllOriginals();
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
