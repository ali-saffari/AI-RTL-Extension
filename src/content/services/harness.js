// harness.js — DeepSeek Harness local web UI, port 3080.
// Selectors match the Harness plugin: markdown containers, the user stack
// whose class ends with _userStack, and the composer at data-composer-input.
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';
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

let timer = 0;
let handoffTimer = 0;
let healTimer = 0;
let observer = null;
let algorithm = 'advanced_full';
let yielded = false;
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

// Harness owns the page completely. This extension must not add RTL or fonts.
function chromeShouldApply() {
    return ownerValue() !== 'dsh';
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

function setHarness(rtlAlgorithm) {
    AQ('[data-composer-input]').each(function () {
        const blocks = this.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote');
        if (!blocks.length) {
            if (!(this.textContent || '').trim()) return;
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
            return;
        }
        blocks.forEach((block) => {
            if (!(block.textContent || '').trim()) return;
            applyRtlToElement(block, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
        });
    });

    AQ('[class*="markdown"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('[class*="_userStack"]').each(function () {
        if (!isUserStack(this) || !(this.textContent || '').trim()) return;
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
    });

    AQ('[data-code-wrap], .katex-display').attr('dir', 'ltr');
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
    const owner = ownerValue() === 'dsh' ? 'dsh' : 'chrome';
    const ownerChanged = lastOwner !== '' && lastOwner !== owner;

    if (!chromeShouldApply()) {
        clearHandoff();
        clearHeal();
        lastOwner = owner;
        releaseExtensionAdditions();
        if (!yielded) {
            yielded = true;
            if (timer) {
                clearInterval(timer);
                timer = 0;
            }
            stopRtlEngine();
            ensureOwnerWatch();
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
    session += 1;
    if (timer) {
        clearInterval(timer);
        timer = 0;
    }
    clearHandoff();
    clearHeal();
    lastOwner = '';
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    // Drop the mirrored plugin switch before the Chrome flag, so the plugin
    // does not start applying in the gap after this extension leaves.
    // While Harness is the engine, this side must not change that switch.
    if (ownerValue() !== 'dsh') setDshSwitch(false);
    publishChrome(false);
    yielded = false;
}
