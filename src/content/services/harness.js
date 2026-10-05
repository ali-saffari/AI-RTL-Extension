// harness.js — DeepSeek Harness local web UI, port 3080.
// Same targets as the Harness plugin: markdown, the composer, a user stack
// whose class ends with _userStack, and text fields. Checkboxes are skipped.
import { applyRtlToContainer, applyRtlToElement, detectTextDirection, getAnalyzableText } from '../utils/directionUtils/index.js';
import { saffariLink, textSaffari } from '../utils/constants.js';
import { BtnDonate } from '../utils/modal.js';
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
const PLUGIN_WAIT_MS = 600;
const FONT_CLASS = 'FontSet';
const COPYRIGHT_BOX = 'AsBoxHarness';
const MARKDOWN_CONTAINER_SELECTOR = '[class*="markdown"]';
const WATCH_TARGET_SELECTOR = '[class*="markdown"], [class*="_userStack"], textarea, input, [data-composer-input], [role="treeitem"]';
const TREE_TITLE_WRAP = 'ai-rtl-tree-title';
const TITLE_HOVER_CLASS = 'ai-rtl-hover-scroll';
const TITLE_HOVER_END = 'ai-rtl-hover-scroll-end';
const COMPOSER_BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote';
const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'email', 'url', 'tel', 'password', 'number']);
const ELEMENT_OPTIONS = {
    fontClass: FONT_CLASS,
    setTextAlign: true
};

let timer = 0;
let handoffTimer = 0;
let healTimer = 0;
let pluginWaitTimer = 0;
let pluginMissing = false;
let observer = null;
let algorithm = 'advanced_full';
let yielded = false;
let engaged = false;
let session = 0;
let lastOwner = '';
let extensionCssRemoved = false;
let sawPlugin = false;
let pluginOffMirrored = false;
let pluginOffGeneration = 0;
let titleHoverBound = false;
let titleHoverItem = null;

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

// This extension applies while its own switch is on, unless the loaded plugin
// owns the page. A saved dsh owner with no plugin yet waits, then this side applies.
function chromeShouldApply() {
    const el = rootEl();
    if (!el || el.getAttribute(ATTR_CHROME) !== 'on') return false;
    if (el.getAttribute(ATTR_OWNER) !== 'dsh') return true;
    return pluginMissing && !pluginLinked();
}

function clearPluginWait() {
    if (!pluginWaitTimer) return;
    clearUntrackedTimeout(pluginWaitTimer);
    pluginWaitTimer = 0;
}

// Give the plugin a moment to announce. If it never does, this extension applies.
function considerMissingPlugin() {
    if (!engaged || ownerValue() !== 'dsh' || pluginLinked() || pluginMissing || pluginWaitTimer) return;
    const current = session;
    pluginWaitTimer = untrackedTimeout(() => {
        pluginWaitTimer = 0;
        if (current !== session || !engaged || ownerValue() !== 'dsh' || pluginLinked()) return;
        pluginMissing = true;
        applyNow();
    }, PLUGIN_WAIT_MS);
}

// Plugin owns the page and its switch is off, or it was here and then unloaded.
// Absent at startup is not off: the plugin may not have announced yet.
function pluginReportsOff() {
    if (ownerValue() !== 'dsh') return false;
    if (pluginLinked()) {
        sawPlugin = true;
        return !dshSwitchOn();
    }
    return sawPlugin;
}

// The bridge mirrors this too. Write here as well so a missed bridge callback
// still turns the Harness site switch off. Skip when the saved value is already false.
function mirrorPluginPower() {
    if (!engaged) return;
    if (!pluginReportsOff()) {
        pluginOffMirrored = false;
        return;
    }
    if (pluginOffMirrored) return;
    pluginOffMirrored = true;
    const generation = ++pluginOffGeneration;
    const current = session;
    let storage;
    try {
        storage = chrome.storage;
    } catch {
        pluginOffMirrored = false;
        return;
    }
    if (!storage || !storage.sync) {
        pluginOffMirrored = false;
        return;
    }
    storage.sync.get(['harness'], (data) => {
        if (generation !== pluginOffGeneration || current !== session || !engaged) {
            if (generation === pluginOffGeneration) pluginOffMirrored = false;
            return;
        }
        if (!pluginReportsOff()) {
            pluginOffMirrored = false;
            return;
        }
        if (data && data.harness === false) return;
        storage.sync.set({ harness: false });
    });
}

function stripOwnFontClass() {
    const nodes = document.querySelectorAll('.' + FONT_CLASS);
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].classList.remove(FONT_CLASS);
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
    unwrapTreeTitles();
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
    removeHarnessCopyright();
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

function isDock(el) {
    const value = typeof el.className === 'string' ? el.className : '';
    if (!value.includes('_dock')) return false;
    return value.split(/\s+/).some((name) => name.endsWith('_dock'));
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

function isTitleEl(el) {
    const value = typeof el.className === 'string' ? el.className : '';
    if (!value.includes('_title')) return false;
    return value.split(/\s+/).some((name) => name.endsWith('_title'));
}

function findTreeTitle(treeitem) {
    const nodes = treeitem.querySelectorAll('[class*="_title"]');
    let title = null;
    for (let i = 0; i < nodes.length; i++) {
        if (!isTitleEl(nodes[i])) continue;
        if (nodes[i].closest('[role="treeitem"]') !== treeitem) continue;
        title = nodes[i];
    }
    return title;
}

function wrapTreeTitle(titleEl) {
    let wrap = titleEl.querySelector(':scope > .' + TREE_TITLE_WRAP);
    if (wrap) return wrap;
    wrap = document.createElement('span');
    wrap.className = TREE_TITLE_WRAP;
    while (titleEl.firstChild) wrap.appendChild(titleEl.firstChild);
    titleEl.appendChild(wrap);
    return wrap;
}

function unwrapTitle(titleEl) {
    const wraps = titleEl.querySelectorAll('.' + TREE_TITLE_WRAP);
    for (let i = 0; i < wraps.length; i++) {
        const wrap = wraps[i];
        wrap.style.removeProperty('transform');
        const parent = wrap.parentElement;
        if (parent) {
            while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
        }
        wrap.remove();
    }
    stopRtlTitleScroll(titleEl);
    if (titleEl.hasAttribute('dir')) titleEl.removeAttribute('dir');
}

function measureTitleOverflow(title, wrap) {
    const width = title.clientWidth;
    if (!width) return 0;
    const full = wrap.scrollWidth || wrap.offsetWidth;
    return Math.max(0, full - width);
}

function onTitleScrollEnd(event) {
    if (event.propertyName && event.propertyName !== 'transform') return;
    const wrap = event.currentTarget;
    const title = wrap && wrap.parentElement;
    if (!title || !title.classList.contains(TITLE_HOVER_CLASS)) return;
    title.classList.add(TITLE_HOVER_END);
}

function startRtlTitleScroll(title) {
    const wrap = title.querySelector(':scope > .' + TREE_TITLE_WRAP) || wrapTreeTitle(title);
    const overflow = measureTitleOverflow(title, wrap);
    if (overflow <= 1) {
        stopRtlTitleScroll(title);
        return;
    }
    const ms = Math.min(12000, Math.max(1800, overflow * 22));
    title.classList.remove(TITLE_HOVER_END);
    title.classList.add(TITLE_HOVER_CLASS);
    wrap.removeEventListener('transitionend', onTitleScrollEnd);
    wrap.addEventListener('transitionend', onTitleScrollEnd);
    title.style.setProperty('--ai-rtl-marquee-ms', ms + 'ms');
    title.style.setProperty('--ai-rtl-marquee-x', '0px');
    wrap.offsetWidth;
    title.style.setProperty('--ai-rtl-marquee-x', overflow + 8 + 'px');
}

function stopRtlTitleScroll(title) {
    if (!title) return;
    title.classList.remove(TITLE_HOVER_CLASS, TITLE_HOVER_END);
    title.style.removeProperty('--ai-rtl-marquee-x');
    title.style.removeProperty('--ai-rtl-marquee-ms');
    title.style.removeProperty('transform');
    title.style.removeProperty('translate');
    title.style.removeProperty('transition');
    const wrap = title.querySelector(':scope > .' + TREE_TITLE_WRAP);
    if (wrap) {
        wrap.removeEventListener('transitionend', onTitleScrollEnd);
        wrap.style.removeProperty('transform');
    }
}

function treeitemFromEvent(event) {
    const node = event.target;
    if (!node || !node.closest) return null;
    return node.closest('[role="treeitem"]');
}

function onTreePointerOver(event) {
    const item = treeitemFromEvent(event);
    const from = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest('[role="treeitem"]') : null;
    if (!item || item === from) return;
    if (item.getAttribute('dir') !== 'rtl') return;
    const title = findTreeTitle(item);
    if (!title) return;
    if (titleHoverItem && titleHoverItem !== title) stopRtlTitleScroll(titleHoverItem);
    titleHoverItem = title;
    startRtlTitleScroll(title);
}

function onTreePointerOut(event) {
    const item = treeitemFromEvent(event);
    const to = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest('[role="treeitem"]') : null;
    if (!item || item === to) return;
    const title = findTreeTitle(item);
    if (title) stopRtlTitleScroll(title);
    if (titleHoverItem === title) titleHoverItem = null;
}

function ensureTitleHoverScroll() {
    if (titleHoverBound || !document.body) return;
    document.addEventListener('pointerover', onTreePointerOver, true);
    document.addEventListener('pointerout', onTreePointerOut, true);
    titleHoverBound = true;
}

function stopTitleHoverScroll() {
    if (titleHoverBound) {
        document.removeEventListener('pointerover', onTreePointerOver, true);
        document.removeEventListener('pointerout', onTreePointerOut, true);
        titleHoverBound = false;
    }
    titleHoverItem = null;
}

function applyTreeTitle(treeitem, rtlAlgorithm) {
    const title = findTreeTitle(treeitem);
    applyElementTarget(treeitem, rtlAlgorithm);
    if (!title) return;
    if (treeitem.getAttribute('dir') === 'rtl') {
        wrapTreeTitle(title);
        ensureTitleHoverScroll();
        return;
    }
    unwrapTitle(title);
}

function unwrapTreeTitles() {
    stopTitleHoverScroll();
    const titles = document.querySelectorAll('[class*="_title"]');
    for (let i = 0; i < titles.length; i++) {
        if (isTitleEl(titles[i])) unwrapTitle(titles[i]);
    }
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

function removeHarnessDonateModal() {
    const modal = document.getElementById('Asmodal');
    if (modal) modal.remove();
    document.body?.classList.remove('AsDonateOk');
}

function findDockParent() {
    if (!document.body || typeof AQ !== 'function') return AQ();
    const nodes = document.body.querySelectorAll('[class*="_dock"]');
    let dock = null;
    for (let i = 0; i < nodes.length; i++) {
        if (isDock(nodes[i])) dock = nodes[i];
    }
    return dock ? AQ(dock).parent() : AQ();
}

function removeHarnessCopyrightBox() {
    const nodes = document.querySelectorAll('.' + COPYRIGHT_BOX + '[data-ai-rtl-engine="chrome"], .AsBox:not([data-ai-rtl-engine])');
    for (let i = 0; i < nodes.length; i++) nodes[i].remove();
}

function removeHarnessCopyright() {
    removeHarnessCopyrightBox();
    removeHarnessDonateModal();
}

function addHarnessCopyright() {
    if (typeof AQ !== 'function' || !chrome.runtime?.id || !document.body) return;
    const current = session;
    const finish = (supportHide) => {
        if (current !== session || !engaged || !chromeShouldApply()) return;
        if (supportHide) {
            removeHarnessCopyright();
            return;
        }
        if (document.querySelector('.' + COPYRIGHT_BOX + '[data-ai-rtl-engine="chrome"]')) return;
        const leftovers = document.querySelectorAll('.' + COPYRIGHT_BOX + ', .AsBox');
        for (let i = 0; i < leftovers.length; i++) leftovers[i].remove();
        const $host = findDockParent();
        if (!$host.length) return;
        const logo = chrome.runtime.getURL('images/logo/ai-rtl-logo.png');
        $host.append(`<div class="AsRtl FontSet AsBox AsBoxB ${COPYRIGHT_BOX}" data-ai-rtl-engine="chrome">
            <a href="${saffariLink}" target="_blank" rel="noopener noreferrer">
                <img src="${logo}" alt="AI RTL" width="22" height="22">
            </a>
            ${textSaffari}
            ${BtnDonate()}
        </div>`);
    };
    try {
        chrome.storage.sync.get(['supportHide'], (data) => {
            finish(data?.supportHide === true);
        });
    } catch {
        finish(false);
    }
}

function setHarness(rtlAlgorithm) {
    if (typeof AQ !== 'function' || !document.body) return;
    addHarnessCopyright();
    const nodes = document.body.querySelectorAll(WATCH_TARGET_SELECTOR);
    const seen = new Set();
    const markdownRoots = [];
    for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (!el || !el.isConnected || seen.has(el)) continue;
        seen.add(el);
        if (el.getAttribute('role') === 'treeitem') {
            applyTreeTitle(el, rtlAlgorithm);
            continue;
        }
        if (el.matches('[data-composer-input]')) {
            applyComposer(el, rtlAlgorithm);
            continue;
        }
        if (el.matches(MARKDOWN_CONTAINER_SELECTOR)) {
            applyRtlToContainer(el, rtlAlgorithm, {
                fontClass: FONT_CLASS,
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
    mirrorPluginPower();
    if (pluginLinked() || ownerValue() !== 'dsh') {
        pluginMissing = false;
        clearPluginWait();
    }
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
        if (ownerValue() === 'dsh' && !pluginLinked()) considerMissingPlugin();
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
    pluginMissing = false;
    clearPluginWait();
    pluginOffMirrored = false;
    if (pluginLinked()) sawPlugin = true;
    if (ownerValue() === 'dsh') {
        releaseExtensionAdditions();
    } else {
        // New document: previous insertCSS is gone. Ask background again.
        extensionCssRemoved = true;
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
    clearPluginWait();
    pluginMissing = false;
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
