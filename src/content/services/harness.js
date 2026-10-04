// harness.js — DeepSeek Harness local web UI, port 3080.
// Same targets as the Harness plugin: markdown, the composer, a user stack
// whose class ends with _userStack, and text fields. Checkboxes are skipped.
import { applyRtlToContainer, applyRtlToElement, detectTextDirection, getAnalyzableText } from '../utils/directionUtils/index.js';
import { setHarnessFontsSuppressed } from '../utils/applySelectedFont.js';
import {
    clearUntrackedTimeout,
    createUntrackedMutationObserver,
    isRtlEngineActive,
    startRtlEngine,
    stopRtlEngine,
    untrackedTimeout
} from '../utils/originalState.js';
import { SITE_SETTINGS_STORAGE_KEY } from '../../constants/siteSettings.js';

const ATTR_CHROME = 'data-ai-rtl-chrome';
const ATTR_DSH = 'data-ai-rtl-dsh';
const ATTR_OWNER = 'data-ai-rtl-owner';
const ATTR_PRESENT = 'data-ai-rtl-dsh-present';

const HANDOFF_MS = 500;
const HARNESS_FONT_CLASS = 'AiRtlHarnessFont';
const MARKDOWN_CONTAINER_SELECTOR = '[class*="markdown"]';
const WATCH_TARGET_SELECTOR = '[class*="markdown"], [class*="_userStack"], textarea, input, [data-composer-input]';
const COMPOSER_BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote';
const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'email', 'url', 'tel', 'password', 'number']);
const ELEMENT_OPTIONS = {
    fontClass: HARNESS_FONT_CLASS,
    setTextAlign: true
};

let timer = 0;
let handoffTimer = 0;
let healTimer = 0;
let observer = null;
let algorithm = 'advanced_full';
let yielded = false;
let engaged = false;
let session = 0;
let lastOwner = '';
let extensionCssRemoved = false;

function rootEl() {
    return document.documentElement;
}

function publishChrome(on) {
    const el = rootEl();
    if (!el) return;
    if (on) el.setAttribute(ATTR_CHROME, 'on');
    else el.removeAttribute(ATTR_CHROME);
}

function dshSwitchOn() {
    return rootEl()?.getAttribute(ATTR_DSH) === 'on';
}

// Power stays linked while the plugin is loaded, whichever engine is selected.
function pluginLinked() {
    const el = rootEl();
    return !!(el && el.getAttribute(ATTR_PRESENT) === 'on');
}

function setDshSwitch(on) {
    const el = rootEl();
    if (!el || !pluginLinked()) return;
    if (on) {
        if (el.getAttribute(ATTR_DSH) !== 'on') el.setAttribute(ATTR_DSH, 'on');
    } else if (el.hasAttribute(ATTR_DSH)) {
        el.removeAttribute(ATTR_DSH);
    }
}

function ownerValue() {
    return rootEl()?.getAttribute(ATTR_OWNER) || '';
}

// This extension applies only while its own switch is on and it owns the page.
// An empty owner counts as chrome. Harness as owner means apply nothing.
function chromeShouldApply() {
    const el = rootEl();
    return !!el && el.getAttribute(ATTR_CHROME) === 'on' && el.getAttribute(ATTR_OWNER) !== 'dsh';
}

function stripOwnFontClass() {
    const nodes = document.querySelectorAll('.' + HARNESS_FONT_CLASS);
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].classList.remove(HARNESS_FONT_CLASS);
    }
}

// Stop watching first, then undo only the marks this engine wrote.
// No follow-up: that pass kept deleting the plugin's dir after this side was off.
function releaseOwnEngine() {
    if (timer) {
        clearInterval(timer);
        timer = 0;
    }
    clearHandoff();
    clearHeal();
    if (isRtlEngineActive()) {
        stopRtlEngine({ followup: false });
    }
    stripOwnFontClass();
    releaseExtensionAdditions();
}

function setExtensionCss(enabled) {
    const removed = !enabled;
    if (extensionCssRemoved === removed) return;
    extensionCssRemoved = removed;
    try {
        chrome.runtime.sendMessage({ action: 'setHarnessExtensionCss', enabled });
    } catch {
        extensionCssRemoved = !removed;
    }
}

function releaseExtensionAdditions() {
    setHarnessFontsSuppressed(true);
    setExtensionCss(false);
}

function restoreExtensionAdditions() {
    setExtensionCss(true);
    setHarnessFontsSuppressed(false);
}

function isUserStack(el) {
    const value = typeof el.className === 'string' ? el.className : '';
    if (!value.includes('_userStack')) return false;
    return value.split(/\s+/).some((name) => name.endsWith('_userStack'));
}

function isTextInput(el) {
    if (el.matches('[data-composer-input]')) return true;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    return TEXT_INPUT_TYPES.has(type);
}

function elementText(el) {
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return el.value || '';
    return el.textContent || '';
}

function clearElementDirection(el) {
    if (el.hasAttribute('dir')) el.removeAttribute('dir');
    if (el.style && el.style.getPropertyValue('text-align')) el.style.removeProperty('text-align');
}

function clearComposerShell(el) {
    clearElementDirection(el);
    if (el.hasAttribute('data-direction')) el.removeAttribute('data-direction');
    if (el.hasAttribute('data-algorithm-rtl')) el.removeAttribute('data-algorithm-rtl');
}

// Lexical keeps dir=auto on each paragraph. Direction on the editor shell
// inherits text-align onto those lines and fights the paragraph.
function applyComposer(root, rtlAlgorithm) {
    clearComposerShell(root);
    const blocks = root.querySelectorAll(COMPOSER_BLOCK_SELECTOR);
    if (!blocks.length) {
        if (!elementText(root).trim()) return;
        applyRtlToElement(root, rtlAlgorithm, ELEMENT_OPTIONS);
        return;
    }
    const sharedText = rtlAlgorithm === 'advanced_full' ? elementText(root).trim() : '';
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const own = elementText(block).trim();
        if (sharedText) {
            applyRtlToElement(block, rtlAlgorithm, { ...ELEMENT_OPTIONS, text: sharedText });
            continue;
        }
        if (!own) {
            clearElementDirection(block);
            continue;
        }
        applyRtlToElement(block, rtlAlgorithm, ELEMENT_OPTIONS);
    }
}

function applyElementTarget(el, rtlAlgorithm) {
    if (!elementText(el).trim()) {
        clearElementDirection(el);
        return;
    }
    applyRtlToElement(el, rtlAlgorithm, ELEMENT_OPTIONS);
}

function lockDirLtr(selector, root) {
    const scope = root && root.querySelectorAll ? root : document;
    const nodes = scope.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getAttribute('dir') !== 'ltr') nodes[i].setAttribute('dir', 'ltr');
    }
}

function ownedTables(root) {
    const found = root.querySelectorAll('table, [role="table"]');
    const tables = [];
    for (let i = 0; i < found.length; i++) {
        const table = found[i];
        if (table.closest(MARKDOWN_CONTAINER_SELECTOR) !== root) continue;
        const parent = table.parentElement;
        if (parent && parent.closest('table, [role="table"]')) continue;
        tables.push(table);
    }
    return tables;
}

function tableDirectionCounts(root) {
    const tables = ownedTables(root);
    let rtl = 0;
    let ltr = 0;
    for (let i = 0; i < tables.length; i++) {
        const dir = tables[i].getAttribute('dir');
        if (dir === 'rtl') rtl += 1;
        else if (dir === 'ltr') ltr += 1;
    }
    return { rtl, ltr };
}

function outermostMarkdowns() {
    const found = document.querySelectorAll(MARKDOWN_CONTAINER_SELECTOR);
    const list = [];
    for (let i = 0; i < found.length; i++) {
        const el = found[i];
        const parent = el.parentElement;
        if (parent && parent.closest(MARKDOWN_CONTAINER_SELECTOR)) continue;
        list.push(el);
    }
    return list;
}

function wholeChatDirection(containers) {
    let text = '';
    for (let i = 0; i < containers.length; i++) {
        const part = getAnalyzableText(containers[i]);
        if (part && part.trim()) text += ` ${part.trim()}`;
    }
    return detectTextDirection(text.trim()) === 'rtl' ? 'rtl' : 'ltr';
}

// Section mode puts one dir on the markdown. A dir taken from the whole
// message fights the table. Match the plugin: majority of this markdown's
// tables, and the chat direction when the tables do not pick a side.
function applySectionMarkdownDirection(containers, rtlAlgorithm) {
    if (rtlAlgorithm !== 'advanced_section' || !containers || !containers.length) return;
    const chatRoots = outermostMarkdowns();
    let chatDirection = null;
    for (let i = 0; i < containers.length; i++) {
        const el = containers[i];
        if (!el || !el.isConnected) continue;
        const { rtl, ltr } = tableDirectionCounts(el);
        let direction;
        if (rtl > ltr) direction = 'rtl';
        else if (ltr > rtl) direction = 'ltr';
        else {
            if (chatDirection == null) chatDirection = wholeChatDirection(chatRoots);
            direction = chatDirection;
        }
        if (el.getAttribute('dir') !== direction) el.setAttribute('dir', direction);
        const align = direction === 'rtl' ? 'right' : 'left';
        if (el.style.getPropertyValue('text-align') !== align) {
            el.style.setProperty('text-align', align);
        }
    }
}

function setHarness(rtlAlgorithm) {
    if (typeof AQ !== 'function' || !document.body) return;
    const nodes = document.body.querySelectorAll(WATCH_TARGET_SELECTOR);
    const seen = new Set();
    const markdownRoots = [];
    for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (!el || !el.isConnected || seen.has(el)) continue;
        seen.add(el);
        if (el.matches('[data-composer-input]')) {
            applyComposer(el, rtlAlgorithm);
            continue;
        }
        if (el.matches(MARKDOWN_CONTAINER_SELECTOR)) {
            applyRtlToContainer(el, rtlAlgorithm, {
                fontClass: HARNESS_FONT_CLASS,
                processedClass: 'AsOk',
                isContainer: true,
                setTextAlign: true
            });
            lockDirLtr('.katex-display', el);
            lockDirLtr('[data-code-wrap]', el);
            markdownRoots.push(el);
            continue;
        }
        if (isUserStack(el) || isTextInput(el)) applyElementTarget(el, rtlAlgorithm);
    }
    applySectionMarkdownDirection(markdownRoots, rtlAlgorithm);
    lockDirLtr('.katex-display');
    lockDirLtr('[data-code-wrap]');
}

function armTimer() {
    if (timer) return;
    timer = setInterval(applyNow, 500);
}

function clearHandoff() {
    if (!handoffTimer) return;
    clearUntrackedTimeout(handoffTimer);
    handoffTimer = 0;
}

function clearHeal() {
    if (!healTimer) return;
    clearUntrackedTimeout(healTimer);
    healTimer = 0;
}

// The plugin's restore can land just after this engine writes direction.
// Apply once more after that window, and start again if the engine was
// cleared while this side is still the owner.
function scheduleHeal() {
    clearHeal();
    const current = session;
    healTimer = untrackedTimeout(() => {
        healTimer = 0;
        if (current !== session || handoffTimer || !chromeShouldApply()) return;
        restoreExtensionAdditions();
        if (yielded || !isRtlEngineActive()) {
            yielded = false;
            startRtlEngine();
            if (document.body) document.body.classList.add('rtl-algorithm-active');
        }
        setHarness(algorithm);
        armTimer();
    }, 120);
}

function applyNow() {
    if (!engaged) return;
    const owner = ownerValue() === 'dsh' ? 'dsh' : 'chrome';
    const ownerChanged = lastOwner !== '' && lastOwner !== owner;

    if (!chromeShouldApply()) {
        clearHandoff();
        clearHeal();
        lastOwner = owner;
        if (!yielded) {
            yielded = true;
            releaseOwnEngine();
            ensureOwnerWatch();
        } else {
            releaseExtensionAdditions();
        }
        return;
    }

    // The plugin is still the active engine. Let it stop, then start this one.
    if (handoffTimer) return;
    if (ownerChanged && dshSwitchOn()) {
        lastOwner = owner;
        const current = session;
        handoffTimer = untrackedTimeout(() => {
            handoffTimer = 0;
            if (current !== session) return;
            applyNow();
        }, HANDOFF_MS);
        return;
    }

    lastOwner = owner;
    restoreExtensionAdditions();
    const restarting = yielded || !isRtlEngineActive();
    if (restarting) {
        yielded = false;
        startRtlEngine();
        if (document.body) document.body.classList.add('rtl-algorithm-active');
    }
    setHarness(algorithm);
    armTimer();
    if (restarting) scheduleHeal();
}

function watchOwner() {
    const el = rootEl();
    if (observer || !el) return;
    observer = createUntrackedMutationObserver(() => {
        applyNow();
    });
    observer.observe(el, { attributes: true, attributeFilter: [ATTR_DSH, ATTR_OWNER, ATTR_PRESENT] });
}

// stopRtlEngine disconnects observers that were wrapped while the engine
// was capturing. Build this watch again afterwards so a later owner change
// can start Chrome without a manual toggle.
function ensureOwnerWatch() {
    if (observer) {
        try {
            observer.disconnect();
        } catch {
            // Already disconnected.
        }
        observer = null;
    }
    watchOwner();
}

export function activateHarness(rtlAlgorithm = 'advanced_full') {
    console.log('DeepSeek Harness RTL activated with algorithm:', rtlAlgorithm);
    const current = ++session;
    algorithm = rtlAlgorithm;
    engaged = true;
    yielded = false;
    if (ownerValue() === 'dsh') {
        releaseExtensionAdditions();
    }
    publishChrome(true);
    watchOwner();
    const start = () => {
        if (current !== session) return;
        // Chrome is only showing the plugin switch. Do not write it.
        if (ownerValue() !== 'dsh') setDshSwitch(true);
        applyNow();
    };
    try {
        chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (data) => {
            const saved = data?.[SITE_SETTINGS_STORAGE_KEY]?.harness?.engine;
            const el = rootEl();
            if (current === session && el && (saved === 'chrome' || saved === 'dsh') && !el.getAttribute(ATTR_OWNER)) {
                el.setAttribute(ATTR_OWNER, saved);
            }
            start();
        });
    } catch {
        start();
    }
}

export function stopHarness() {
    const wasEngaged = engaged;
    engaged = false;
    session += 1;
    yielded = true;
    lastOwner = '';
    if (timer) {
        clearInterval(timer);
        timer = 0;
    }
    clearHandoff();
    clearHeal();
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    // Undo our own marks before the switch goes off. If the plugin owns the
    // page and this engine never started, leave its dir and font class alone.
    if (wasEngaged && (ownerValue() !== 'dsh' || isRtlEngineActive())) {
        releaseOwnEngine();
    } else if (wasEngaged) {
        releaseExtensionAdditions();
    }
    // Drop the mirrored plugin switch before the Chrome flag, so the plugin
    // does not start applying in the gap after this extension leaves.
    // While Harness is the engine, this side must not change that switch.
    if (ownerValue() !== 'dsh') setDshSwitch(false);
    publishChrome(false);
}
