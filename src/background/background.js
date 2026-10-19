// Import dynamic services configuration
import { DYNAMIC_SERVICES, getServiceNameFromHostname, serviceRequiresComplete } from '../constants/dynamicServices.js';
import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from '../constants/updateModalConfig.js';
import {
    consumeLastError,
    hasExtensionPageListeners,
    sendRuntimeMessage,
    sendTabMessage
} from '../utils/chromeMessaging.js';
import { hasHostPermission, hasServicePermissions } from '../utils/hasHostPermission.js';
import { applyPendingFullPinOpenSite, getDefaultPinOpenSiteMode, PIN_OPEN_SITE_STORAGE_KEY } from '../utils/pinOpenSite';
import { getActivateGuidePath } from '../utils/storeLinks.js';
import { siteUrl } from '../utils/siteUrl.js';
import { DEFAULT_HALF_SPACE_SITES, HALF_SPACE_STORAGE_KEY } from '../constants/halfSpaceHotkey.js';
import {
    defaultSiteSettings,
    normalizeSiteSettings,
    SITE_SETTINGS_REGISTRY,
    SITE_SETTINGS_STORAGE_KEY,
} from '../constants/siteSettings.js';
// import { getSitesConfig } from '../constants/sitesConfig.js';

const IS_DEV = process.env.NODE_ENV !== 'production';
const devLog = (...args) => { if (IS_DEV) console.log.apply(console, args); };
const devError = (...args) => { if (IS_DEV) console.error.apply(console, args); };

// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    googleNotebook: false, jules: true, zai: true, arena: false, openrouter: true, minimax: true, 
    oneMinai: true, writesonic: true, lovable: true, ernie: true, gamma: true
};


// ============================================
// USER ID GENERATION & VALIDATION
// ============================================

/**
 * Get or create user ID and update uninstall URL with uid
 */
async function initializeUserId() {
    try {
        const result = await chrome.storage.sync.get(['uid', 'uiLanguage']);
        let uid = result.uid;
        const locale = result.uiLanguage;
        
        if (!uid) {
            // Generate 10-digit random number
            const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
            const numberString = randomNumber.toString();
            
            // Calculate checksum (like Iranian National ID algorithm)
            let sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(numberString[9 - i], 10) * (i + 1);
            }
            const remainder = sum % 11;
            const checksum = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'A' : (11 - remainder).toString());
            
            uid = numberString + checksum;
            await chrome.storage.sync.set({ uid });
        }
        
        chrome.runtime.setUninstallURL(buildExtensionSiteUrl('/uninstall-feedback/', {
            uid,
            source: 'extension-uninstall'
        }, locale));
        return uid;
    } catch (error) {
        devError('Error initializing user ID:', error);
        chrome.runtime.setUninstallURL(buildExtensionSiteUrl('/uninstall-feedback/', {
            error: '1',
            source: 'extension-uninstall'
        }));
    }
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.uiLanguage) {
        initializeUserId();
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Initialize user ID and set uninstall URL when service worker starts
initializeUserId();

// Function to apply sites config from API
// async function applySitesConfig() {
//     try {
//         const sitesConfig = await getSitesConfig(true); // Force refresh
//
//         // Save entire config to storage as onlineConfig
//         chrome.storage.sync.set({ onlineConfig: sitesConfig }, () => {
//             devLog('[Background] Online config saved to storage:', sitesConfig);
//         });
//
//         // Update all services flags based on config
//         // sitesConfig structure: { "chatGpt": { "disabled": false }, "claude": { "disabled": false }, ... }
//         chrome.storage.sync.get(Object.keys(sitesConfig), (storedData) => {
//             const updates = {};
//             Object.keys(sitesConfig).forEach(key => {
//                 const siteConfig = sitesConfig[key];
//                 const enabled = siteConfig?.disabled === false; // disabled: false means enabled
//                 // Only update if value changed or doesn't exist
//                 if (storedData[key] === undefined || storedData[key] !== enabled) {
//                     updates[key] = enabled;
//                 }
//             });
//
//             if (Object.keys(updates).length > 0) {
//                 chrome.storage.sync.set(updates, () => {
//                     devLog('[Background] Sites config updated from API:', updates);
//                 });
//             }
//         });
//     } catch (error) {
//         devError('[Background] Error applying sites config:', error);
//     }
// }

// Apply config on install/update and every 6 hours
chrome.runtime.onInstalled.addListener(async (details) => {
    // Initialize user ID and set uninstall URL with ID
    await initializeUserId();
    
    // Default manual RTL settings
    const defaultManualRtlSettings = getDefaultManualRtlSettings();

    // Firefox: only supported AI sites (no all_urls / no allowlist)
    if (isFirefoxRuntime()) {
        try {
            const stored = await chrome.storage.sync.get(['manualRtlSettings']);
            const current = stored.manualRtlSettings || {};
            await chrome.storage.sync.set({
                manualRtlSettings: {
                    ...defaultManualRtlSettings,
                    ...current,
                    manualRtlSiteMode: 'ai_sites',
                    manualRtlEnabled: current.manualRtlEnabled === true
                }
            });
        } catch (e) {
            devError('[Background] Firefox manual RTL migrate failed:', e);
        }
    }
    
    if (details.reason === 'install') {
        // Get sites config from API (sites-config commented out – use SERVICE_FLAGS only)
        // getSitesConfig().then(sitesConfig => {
        //     const configFlags = {};
        //     Object.keys(sitesConfig).forEach(key => {
        //         configFlags[key] = sitesConfig[key]?.disabled === false;
        //     });
        //     const allFlags = { ...SERVICE_FLAGS, ...configFlags };
        //     chrome.storage.sync.set({
        //         ...allFlags,
        //         rtlAlgorithmMode: 'advanced_full',
        //         manualRtlSettings: defaultManualRtlSettings,
        //         mixedTitleDisplayMode: 'unified'
        //     });
        // }).catch(() => {
        chrome.storage.sync.set(buildFreshInstallSyncState());
        // });
    }
    
    // Apply config on install and update
    // if (details.reason === 'install' || details.reason === 'update') {
    //     await applySitesConfig();
    // }
    
    if (details.reason === 'install') {
        // Prevent update modal from appearing right after fresh install
        if (UPDATE_MODAL_ENABLED && UPDATE_MODAL_ID) {
            chrome.storage.local.set({ [UPDATE_MODAL_STORAGE_KEY]: UPDATE_MODAL_ID }, () => {
                devLog('[Background] Set update modal closed ID to', UPDATE_MODAL_ID, 'for new installation');
            });
        }
        
        // Open activation guide page in new tab after installation
        try {
            const uidResult = await chrome.storage.sync.get(['uid', 'uiLanguage']);
            chrome.tabs.create({
                url: buildExtensionSiteUrl(getActivateGuidePath(), {
                    uid: uidResult.uid || '',
                    source: 'extension-install'
                }, uidResult.uiLanguage)
            });
        } catch (error) {
            devError('[Background] Error opening activation guide page:', error);
        }
    } else if (details.reason === 'update') {
        try {
            chrome.storage.sync.get(async (storedData) => {
                const updates = {};
                const allServices = Object.keys(SERVICE_FLAGS);
                const allDynamicServices = Object.keys(DYNAMIC_SERVICES);
                
                allServices.forEach(service => {
                    if (!storedData.hasOwnProperty(service)) {
                        updates[service] = true;
                    }
                });
                
                allDynamicServices.forEach(service => {
                    if (!storedData.hasOwnProperty(service)) {
                        updates[service] = false; // Dynamic services default to disabled
                    }
                });

                if (!isFirefoxRuntime()) {
                    for (const serviceKey of allDynamicServices) {
                        // Hybrid services (e.g. kimi, ernie) stay on even if extra-host
                        // optional permissions are missing; only fully-dynamic keys can be forced off.
                        if (Object.prototype.hasOwnProperty.call(SERVICE_FLAGS, serviceKey)) {
                            continue;
                        }
                        const enabled = updates.hasOwnProperty(serviceKey)
                            ? updates[serviceKey]
                            : storedData[serviceKey];
                        if (enabled !== true) {
                            continue;
                        }
                        const service = DYNAMIC_SERVICES[serviceKey];
                        if (!service?.origins) {
                            continue;
                        }
                        if (!(await hasServicePermissions(service.origins))) {
                            updates[serviceKey] = false;
                        }
                    }
                }
                
                if (!storedData.hasOwnProperty('rtlAlgorithmMode')) {
                    updates.rtlAlgorithmMode = storedData.rtlAlgorithm === 'first_word' ? 'first_word' : 'advanced_full';
                }

                if (!storedData.hasOwnProperty('selectedFont')) {
                    updates.selectedFont = 'iranyekan';
                }

                if (!storedData.hasOwnProperty('fontScale')) {
                    updates.fontScale = 100;
                }
                
                // Check and initialize mixedTitleDisplayMode
                if (!storedData.hasOwnProperty('mixedTitleDisplayMode')) {
                    updates.mixedTitleDisplayMode = 'unified';
                }

                if (!storedData.hasOwnProperty('applyAlgorithmToCode')) {
                    updates.applyAlgorithmToCode = true;
                }

                if (!storedData.hasOwnProperty('flipRtlArrows')) {
                    updates.flipRtlArrows = true;
                }

                if (!storedData.hasOwnProperty('fixMixedText')) {
                    updates.fixMixedText = false;
                }

                if (!storedData.hasOwnProperty(PIN_OPEN_SITE_STORAGE_KEY)) {
                    updates[PIN_OPEN_SITE_STORAGE_KEY] = getDefaultPinOpenSiteMode();
                }

                if (!storedData.hasOwnProperty(HALF_SPACE_STORAGE_KEY)) {
                    updates[HALF_SPACE_STORAGE_KEY] = { ...DEFAULT_HALF_SPACE_SITES };
                }

                if (!storedData.hasOwnProperty(SITE_SETTINGS_STORAGE_KEY)) {
                    updates[SITE_SETTINGS_STORAGE_KEY] = defaultSiteSettings();
                } else {
                    const normalizedSiteSettings = normalizeSiteSettings(storedData[SITE_SETTINGS_STORAGE_KEY]);
                    const rawSiteSettings = storedData[SITE_SETTINGS_STORAGE_KEY];
                    const needsSiteSettingsMerge = SITE_SETTINGS_REGISTRY.some((entry) => {
                        const rawSite = rawSiteSettings?.[entry.serviceKey];
                        if (!rawSite || typeof rawSite !== 'object') {
                            return true;
                        }
                        return entry.fields.some((field) => rawSite[field.key] === undefined);
                    });
                    if (needsSiteSettingsMerge) {
                        updates[SITE_SETTINGS_STORAGE_KEY] = normalizedSiteSettings;
                    }
                }

                if (storedData.experimentalAlgoDefaultOn !== true) {
                    updates.applyAlgorithmToCode = true;
                    updates.flipRtlArrows = true;
                    updates.experimentalAlgoDefaultOn = true;
                }
                
                // Check and initialize manual RTL settings
                // Migrate from textSelectorSettings to manualRtlSettings if needed
                if (storedData.textSelectorSettings && !storedData.manualRtlSettings) {
                    // Migrate old textSelectorSettings to manualRtlSettings
                    updates.manualRtlSettings = {
                        ...defaultManualRtlSettings,
                        ...storedData.textSelectorSettings
                    };
                } else {
                    const existingManualRtlSettings = storedData.manualRtlSettings;
                    if (!existingManualRtlSettings) {
                        // No manual RTL settings exist, set defaults
                        updates.manualRtlSettings = defaultManualRtlSettings;
                    } else {
                        // Merge existing settings with defaults to ensure all fields exist
                        const mergedSettings = {
                            ...defaultManualRtlSettings,
                            ...existingManualRtlSettings
                        };
                        // Check if any new fields were added to defaults
                        let needsUpdate = false;
                        Object.keys(defaultManualRtlSettings).forEach(key => {
                            if (!existingManualRtlSettings.hasOwnProperty(key)) {
                                needsUpdate = true;
                            }
                        });
                        if (needsUpdate) {
                            updates.manualRtlSettings = mergedSettings;
                        }
                    }
                }

                if (storedData.activationHintDismissed === false) {
                    updates.troubleshootingHintDismissed = true;
                } else if (storedData.troubleshootingHintDismissed !== true) {
                    updates.troubleshootingHintDismissed = false;
                }

                const currentAlgorithm = storedData.rtlAlgorithmMode
                    || (storedData.rtlAlgorithm === 'first_word' ? 'first_word' : 'advanced_full');
                if (currentAlgorithm !== 'advanced_full') {
                    updates.algorithmHintDismissed = true;
                }

                try {
                    const notebookOrigins = DYNAMIC_SERVICES.googleNotebook?.origins || ['*://notebook.google.com/*'];
                    const granted = await chrome.permissions.getAll();
                    const notebookGrantedOrigins = (granted.origins || []).filter((origin) =>
                        origin.includes('notebook')
                    );
                    let hasNotebookOrigin = await hasHostPermission(notebookOrigins);
                    if (!hasNotebookOrigin) {
                        hasNotebookOrigin = (granted.origins || []).some((origin) =>
                            origin.includes('://notebook.google.com/')
                        );
                    }

                    // Old storage key was `notebook`; `googleNotebook` is the new key
                    const wasNotebookEnabled = storedData.notebook === true || storedData.googleNotebook === true;
                    devLog('[Background] Notebook migration status', {
                        hasNotebookOrigin,
                        oldNotebookKey: storedData.notebook,
                        newGoogleNotebookKey: storedData.googleNotebook,
                        wasNotebookEnabled,
                        notebookGrantedOrigins,
                        requestedOrigins: notebookOrigins
                    });
                    if (wasNotebookEnabled) {
                        if (hasNotebookOrigin) {
                            updates.googleNotebook = true;
                            updates.notebookNeedsReenable = false;
                        } else {
                            updates.googleNotebook = false;
                            updates.notebookNeedsReenable = true;
                        }
                    }
                    devLog('[Background] Notebook migration result', {
                        googleNotebook: updates.googleNotebook,
                        notebookNeedsReenable: updates.notebookNeedsReenable
                    });
                } catch (permissionError) {
                    devError('[Background] Notebook origin permission check failed:', permissionError);
                }

                if (Object.keys(updates).length > 0) {
                    chrome.storage.sync.set(updates, () => {
                        if (storedData.textSelectorSettings && !storedData.manualRtlSettings) {
                            chrome.storage.sync.remove('textSelectorSettings');
                        }
                    });
                } else if (storedData.textSelectorSettings && !storedData.manualRtlSettings) {
                    chrome.storage.sync.set({
                        manualRtlSettings: {
                            ...defaultManualRtlSettings,
                            ...storedData.textSelectorSettings
                        }
                    }, () => {
                        chrome.storage.sync.remove('textSelectorSettings');
                    });
                }
            });
        } catch (error) {
            devLog('Update handler warning:', error.message);
        }
    }
});

let activeTabInfo = null;

function getActiveTabSnapshot() {
    if (!activeTabInfo) {
        return null;
    }

    return {
        tabId: activeTabInfo.tabId ?? null,
        hostname: activeTabInfo.hostname || '',
        port: activeTabInfo.port || '',
        favicon: activeTabInfo.favicon || '',
        hasHostname: Boolean(activeTabInfo.hostname),
        activatedAt: activeTabInfo.activatedAt,
        lastUpdatedAt: activeTabInfo.lastUpdatedAt
    };
}

function broadcastActiveTabInfo(reason = 'unknown') {
    if (!chrome?.runtime?.sendMessage) return;

    const snapshot = getActiveTabSnapshot();

    (async () => {
        try {
            if (!(await hasExtensionPageListeners())) {
                return;
            }
        } catch {
            // Fall through and send; lastError is swallowed
        }

        await sendRuntimeMessage({
            action: 'activeTabInfoUpdated',
            payload: snapshot
        });
    })();
}

function resetActiveTabInfo(tabId) {
    if (!tabId) {
        activeTabInfo = null;
        broadcastActiveTabInfo('reset-null');
        return;
    }

    activeTabInfo = {
        tabId,
        hostname: '',
        favicon: '',
        activatedAt: Date.now(),
        lastUpdatedAt: Date.now()
    };
    broadcastActiveTabInfo('reset-start');

    if (!chrome?.tabs?.get) {
        return;
    }

    try {
        chrome.tabs.get(tabId, (tab) => {
            if (consumeLastError() || !activeTabInfo || activeTabInfo.tabId !== tabId) {
                return;
            }

            if (tab?.url && !isValidHttpPage(tab.url)) {
                activeTabInfo = null;
                broadcastActiveTabInfo('reset-skipped-non-http');
                return;
            }

            if (tab?.url && isValidHttpPage(tab.url)) {
                try {
                    const url = new URL(tab.url);
                    activeTabInfo.hostname = url.hostname;
                    activeTabInfo.port = url.port || '';
                    activeTabInfo.favicon = tab.favIconUrl || '';
                    activeTabInfo.lastUpdatedAt = Date.now();
                    broadcastActiveTabInfo('reset-tab-details');
                    return;
                } catch (err) {
                    // Ignore invalid URL errors
                }
            }

            // Limited mode has no tabs permission, so tab.url is often hidden.
            // Ask the content script — it is already injected on supported sites.
            sendTabMessage(tabId, { action: 'getPageInfo' }).then((pageInfo) => {
                if (!activeTabInfo || activeTabInfo.tabId !== tabId) {
                    return;
                }
                if (!pageInfo?.success || !pageInfo.hostname) {
                    return;
                }
                activeTabInfo.hostname = pageInfo.hostname || '';
                activeTabInfo.port = pageInfo.port || '';
                activeTabInfo.favicon = pageInfo.favicon || activeTabInfo.favicon || '';
                activeTabInfo.lastUpdatedAt = Date.now();
                broadcastActiveTabInfo('reset-page-info');
            });
        });
    } catch (error) {
        // Ignore tab access errors
    }
}


/**
 * True when this background is running inside Firefox.
 */
const harnessCssSlots = new Map();

function harnessCssSlot(tabId) {
    let slot = harnessCssSlots.get(tabId);
    if (!slot) {
        slot = { want: null, applied: false, nav: 0, appliedNav: -1, chain: Promise.resolve() };
        harnessCssSlots.set(tabId, slot);
    }
    return slot;
}

function enqueueHarnessCss(tabId, job) {
    const slot = harnessCssSlot(tabId);
    const run = slot.chain.then(job, job);
    slot.chain = run.then(() => {}, () => {});
    return run;
}

function isYoutubeWatchHostname(hostname) {
    const host = String(hostname || '').toLowerCase();
    return host === 'youtube.com'
        || host === 'www.youtube.com'
        || host === 'm.youtube.com';
}

function harnessExtensionCssFiles(hostname) {
    // Firefox + YouTube: never inject @font-face sheets that point at
    // chrome-extension:// — the page frame tries to fetch them and YouTube logs
    // "Unsafe attempt to load URL". Fonts are registered from bytes in JS instead.
    if (isFirefoxRuntime() || isYoutubeWatchHostname(hostname)) {
        return ['style.css'];
    }
    return ['css/fontiran-iranyekan.css', 'style.css'];
}

function harnessCssOnThisDocument(slot) {
    return slot.applied === true && slot.appliedNav === slot.nav;
}

// insertCSS dies with the document. The tab id stays, so a refresh must
// not reuse applied from the previous page.
function noteHarnessCssNavigation(tabId) {
    const slot = harnessCssSlots.get(tabId);
    if (!slot) return;
    slot.nav += 1;
    slot.applied = false;
}

async function dropHarnessCss(target, files) {
    try {
        await chrome.scripting.removeCSS({ target, files });
    } catch {
        // The sheet was already gone.
    }
}

async function commitHarnessCssInsert(tabId, target, files, nav) {
    await chrome.scripting.insertCSS({ target, files });
    const latest = harnessCssSlot(tabId);
    if (latest.want === false || latest.nav !== nav) {
        await dropHarnessCss(target, files);
        if (latest.nav === nav) latest.applied = false;
        return;
    }
    latest.applied = true;
    latest.appliedNav = nav;
    if (latest.want == null) latest.want = true;
}

// Insert and remove stay on one chain. The content script can yield before
// insertCSS finishes; a later insert must not put the sheet back.
async function insertHarnessCssIfWanted(tabId, target) {
    const slot = harnessCssSlot(tabId);
    if (slot.want === false || harnessCssOnThisDocument(slot)) return;
    const nav = slot.nav;
    await commitHarnessCssInsert(tabId, target, harnessExtensionCssFiles(), nav);
}

async function prepareHarnessCss(tabId) {
    const data = await chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY]);
    const engine = data?.[SITE_SETTINGS_STORAGE_KEY]?.harness?.engine;
    await setHarnessExtensionCss(tabId, engine !== 'dsh');
}

async function setHarnessExtensionCss(tabId, enabled) {
    if (!tabId) return;
    const want = enabled !== false;
    harnessCssSlot(tabId).want = want;
    await enqueueHarnessCss(tabId, async () => {
        const slot = harnessCssSlot(tabId);
        const files = harnessExtensionCssFiles();
        const target = { tabId };
        if (slot.want === true) {
            if (harnessCssOnThisDocument(slot)) return;
            const nav = slot.nav;
            await commitHarnessCssInsert(tabId, target, files, nav);
            return;
        }
        await dropHarnessCss(target, files);
        harnessCssSlot(tabId).applied = false;
    });
}

function isFirefoxRuntime() {
    try {
        return chrome.runtime.getURL('').startsWith('moz-extension:');
    } catch {
        return false;
    }
}

function getExtensionVersion() {
    try {
        return chrome.runtime.getManifest()?.version || '';
    } catch {
        return '';
    }
}

function getExtensionBrowserParam() {
    return isFirefoxRuntime() ? 'f' : 'c';
}

function buildExtensionSiteUrl(path, extraParams = {}, locale = 'fa') {
    const params = new URLSearchParams();

    Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });

    params.set('b', getExtensionBrowserParam());

    const version = getExtensionVersion();
    if (version) {
        params.set('v', version);
    }

    const query = params.toString();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return siteUrl(query ? `${normalizedPath}?${query}` : normalizedPath, locale);
}

function buildFreshInstallSyncState() {
    const state = {
        ...SERVICE_FLAGS,
        rtlAlgorithmMode: 'advanced_full',
        selectedFont: 'iranyekan',
        fontScale: 100,
        manualRtlSettings: getDefaultManualRtlSettings(),
        mixedTitleDisplayMode: 'unified',
        applyAlgorithmToCode: true,
        flipRtlArrows: true,
        fixMixedText: false,
        experimentalAlgoDefaultOn: true,
        [HALF_SPACE_STORAGE_KEY]: { ...DEFAULT_HALF_SPACE_SITES },
        [SITE_SETTINGS_STORAGE_KEY]: defaultSiteSettings(),
        [PIN_OPEN_SITE_STORAGE_KEY]: getDefaultPinOpenSiteMode(),
        activationHintDismissed: false,
        troubleshootingHintDismissed: true
    };

    return state;
}

function parseMatchPattern(pattern) {
    if (pattern === '<all_urls>') {
        return { scheme: '*', host: '*' };
    }
    const match = /^(\*|https?|wss?|ftp|file):\/\/([^/]+)/.exec(pattern);
    if (!match) {
        return null;
    }
    return { scheme: match[1], host: match[2] };
}

function hostPatternCovers(grantedHost, requiredHost) {
    if (grantedHost === '*') {
        return true;
    }
    if (grantedHost === requiredHost) {
        return true;
    }
    if (grantedHost.startsWith('*.')) {
        const base = grantedHost.slice(2);
        return requiredHost === base || requiredHost.endsWith(`.${base}`);
    }
    return false;
}

function originCoversRequiredHost(origin, requiredOrigins) {
    const granted = parseMatchPattern(origin);
    if (!granted) {
        return true;
    }
    for (const requiredOrigin of requiredOrigins) {
        const required = parseMatchPattern(requiredOrigin);
        if (!required) {
            continue;
        }
        const schemeCovers = granted.scheme === '*' || granted.scheme === required.scheme;
        if (schemeCovers && hostPatternCovers(granted.host, required.host)) {
            return true;
        }
    }
    return false;
}

async function removePermissionsQuietly(toRemove) {
    try {
        await chrome.permissions.remove(toRemove);
    } catch (error) {
        const message = error?.message || String(error || '');
        if (!/required permissions/i.test(message)) {
            devError('[Background] Could not revoke optional permissions on reset:', error);
        }
    }
}

async function revokeGrantedOptionalAccess() {
    if (typeof chrome.permissions?.getAll !== 'function' || typeof chrome.permissions?.remove !== 'function') {
        return;
    }

    const manifest = chrome.runtime.getManifest();
    const optionalPermissions = new Set(manifest.optional_permissions || []);
    const requiredOrigins = manifest.host_permissions || [];
    const granted = await chrome.permissions.getAll();
    const permissions = (granted.permissions || []).filter((permission) => optionalPermissions.has(permission));
    const origins = (granted.origins || []).filter((origin) => !originCoversRequiredHost(origin, requiredOrigins));

    if (permissions.length) {
        await removePermissionsQuietly({ permissions });
    }
    for (const origin of origins) {
        await removePermissionsQuietly({ origins: [origin] });
    }
}

async function resetExtensionToFreshInstall() {
    const stored = await chrome.storage.sync.get(['uid']);
    const uid = typeof stored.uid === 'string' && stored.uid ? stored.uid : '';

    await chrome.storage.sync.clear();
    const freshState = buildFreshInstallSyncState();
    Object.keys(DYNAMIC_SERVICES).forEach((serviceKey) => {
        if (!Object.prototype.hasOwnProperty.call(freshState, serviceKey)) {
            freshState[serviceKey] = false;
        }
    });
    if (uid) {
        freshState.uid = uid;
    }
    await chrome.storage.sync.set(freshState);
    if (!uid) {
        await initializeUserId();
    }

    await chrome.storage.local.clear();
    if (UPDATE_MODAL_ENABLED && UPDATE_MODAL_ID) {
        await chrome.storage.local.set({ [UPDATE_MODAL_STORAGE_KEY]: UPDATE_MODAL_ID });
    }

    if (typeof chrome.storage.session?.clear === 'function') {
        try {
            await chrome.storage.session.clear();
        } catch (error) {
            devError('[Background] Could not clear session storage on reset:', error);
        }
    }

    await revokeGrantedOptionalAccess();
}

function getDefaultManualRtlSettings() {
    // Firefox: supported AI sites only, Manual RTL off by default (no allowlist UI)
    if (isFirefoxRuntime()) {
        return {
            manualRtlEnabled: false,
            manualRtlSiteMode: 'ai_sites',
            menuDisplayMode: 'logo_first',
            highlightMode: 'on_direction_change',
            highlightColor: '#ff0000',
            highlightOpacity: 0.3,
            logoDisplay: 'always',
            applyFont: true
        };
    }

    return {
        manualRtlEnabled: false,
        manualRtlSiteMode: 'allowed_sites',
        menuDisplayMode: 'logo_first',
        highlightMode: 'on_direction_change',
        highlightColor: '#ff0000',
        highlightOpacity: 0.3,
        logoDisplay: 'always',
        applyFont: true
    };
}

/**
 * Check if URL is valid http/https page (not extension or chrome://)
 */
function isValidHttpPage(url) {
    if (!url) return false;
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Restricted browser pages that cannot be scripted (Chrome + Firefox)
 */
function isRestrictedBrowserUrl(url) {
    if (!url) return true;
    return (
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('about:') ||
        url.startsWith('resource://')
    );
}

function isMissingTabError(error) {
    const message = error?.message || String(error || '');
    return /No tab with id/i.test(message)
        || /Invalid tab ID/i.test(message)
        || /The tab was closed/i.test(message);
}


// Handle messages from content scripts
function readExtensionFontBytes(relativePath) {
    const relative = String(relativePath || '').replace(/\\/g, '/');
    if (!relative || relative.includes('..') || relative.startsWith('/')) {
        return Promise.resolve(null);
    }
    const encoded = relative
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
    return fetch(chrome.runtime.getURL(`fonts/${encoded}`))
        .then((response) => {
            if (!response.ok) {
                return null;
            }
            return response.arrayBuffer();
        })
        .then((buffer) => (buffer ? Array.from(new Uint8Array(buffer)) : null))
        .catch(() => null);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'readExtensionFont') {
        readExtensionFontBytes(message.path).then((bytes) => {
            sendResponse(bytes ? { success: true, bytes } : { success: false });
        });
        return true;
    }
    if (message.action === 'setHarnessExtensionCss') {
        const tabId = sender?.tab?.id;
        setHarnessExtensionCss(tabId, message.enabled !== false).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            sendResponse({ success: false, error: error?.message });
        });
        return true;
    }
    if (message.action === 'getToolbarPinState') {
        (async () => {
            try {
                if (typeof chrome.action?.getUserSettings !== 'function') {
                    sendResponse({ success: true, pinned: false });
                    return;
                }
                const settings = await chrome.action.getUserSettings();
                sendResponse({ success: true, pinned: settings?.isOnToolbar === true });
            } catch (error) {
                sendResponse({ success: false, pinned: false, error: error?.message });
            }
        })();
        return true;
    }
    if (message.action === 'resetToFreshInstall') {
        const senderUrl = sender?.url || '';
        const extensionOrigin = chrome.runtime.getURL('');
        if (sender?.tab && !senderUrl.startsWith(extensionOrigin)) {
            sendResponse?.({ success: false, error: 'forbidden' });
            return false;
        }
        resetExtensionToFreshInstall()
            .then(() => sendResponse?.({ success: true }))
            .catch((error) => sendResponse?.({ success: false, error: error?.message || 'reset failed' }));
        return true;
    }
    if (message.action === 'openOptionsPage') {
        try {
            // Check if hash is provided in message, default to #manual-rtl
            const hash = message.hash || '#manual-rtl';
            const optionsUrl = chrome.runtime.getURL(`options.html${hash}`);
            
            // Open options page with hash
            chrome.tabs.query({ url: chrome.runtime.getURL('options.html*') }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    // If options page is already open, update it with hash
                    chrome.tabs.update(tabs[0].id, { url: optionsUrl, active: true });
                } else {
                    // If not open, create new tab with hash
                    chrome.tabs.create({ url: optionsUrl });
                }
            });
            
            sendResponse({ success: true });
            return true;
        } catch (error) {
            devError('[Background] Exception opening options page:', error);
            sendResponse({ success: false, error: error.message });
            return true;
        }
    } else if (message.action === 'previewFontScale') {
        const scale = message.scale;
        (async () => {
            try {
                const tabs = await chrome.tabs.query({});
                await Promise.all((tabs || []).map((tab) => {
                    if (!tab.id || isRestrictedBrowserUrl(tab.url)) {
                        return Promise.resolve();
                    }
                    return sendTabMessage(tab.id, {
                        action: 'previewFontScale',
                        scale
                    });
                }));
            } catch (error) {
                // Tabs permission may be missing; preview is optional
            }
            sendResponse({ success: true });
        })();
        return true;
    } else if (message.action === 'getActiveTabInfo' || message.action === 'getActiveSessionInfo') {
        (async () => {
            const snapshot = getActiveTabSnapshot();
            let activeTabId = null;

            try {
                // tab.id is available even without the tabs permission
                const focusedTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
                activeTabId = focusedTabs?.[0]?.id || null;
                if (!activeTabId) {
                    const activeTabs = await chrome.tabs.query({ active: true });
                    activeTabId = activeTabs?.[0]?.id || null;
                }
            } catch (e) {
                activeTabId = snapshot?.tabId || null;
            }

            if (!activeTabId && snapshot?.tabId) {
                activeTabId = snapshot.tabId;
            }

            if (activeTabId && chrome?.tabs?.sendMessage) {
                const pageInfo = await sendTabMessage(activeTabId, { action: 'getPageInfo' });

                if (pageInfo && pageInfo.success && pageInfo.hostname) {
                    const enhancedSnapshot = {
                        tabId: activeTabId,
                        hostname: pageInfo.hostname || '',
                        port: pageInfo.port || '',
                        favicon: pageInfo.favicon || '',
                        hasHostname: Boolean(pageInfo.hostname),
                        activatedAt: (snapshot?.tabId === activeTabId ? snapshot.activatedAt : Date.now()) || Date.now(),
                        lastUpdatedAt: Date.now()
                    };

                    activeTabInfo = enhancedSnapshot;

                    sendResponse?.({
                        success: true,
                        tabInfo: enhancedSnapshot,
                        tabHostname: enhancedSnapshot.hostname || '',
                        session: null
                    });
                    return;
                }
            }

            const safeSnapshot = snapshot?.tabId && activeTabId && snapshot.tabId !== activeTabId
                ? null
                : snapshot;

            sendResponse?.({
                success: true,
                tabInfo: safeSnapshot,
                tabHostname: safeSnapshot?.hostname || '',
                session: null
            });
        })();
        return true; // Keep channel open for async response
    } else if (message.action === 'requestPermissionsAndEnableServices') {
        (async () => {
            try {
                const serviceKeys = Array.isArray(message.serviceKeys) ? message.serviceKeys : [];
                const origins = [];
                const validKeys = [];

                serviceKeys.forEach((serviceKey) => {
                    const service = DYNAMIC_SERVICES[serviceKey];
                    if (!service?.origins?.length) {
                        return;
                    }
                    validKeys.push(serviceKey);
                    origins.push(...service.origins);
                });

                const uniqueOrigins = [...new Set(origins)];
                if (!validKeys.length || !uniqueOrigins.length) {
                    sendResponse?.({ success: false, error: 'No services to enable' });
                    return;
                }

                const granted = await chrome.permissions.request({
                    permissions: ['scripting'],
                    origins: uniqueOrigins
                });

                if (!granted) {
                    sendResponse?.({ success: false, granted: false, error: 'Permissions denied' });
                    return;
                }

                const storageUpdate = {};
                validKeys.forEach((serviceKey) => {
                    storageUpdate[serviceKey] = true;
                    if (serviceKey === 'googleNotebook') {
                        storageUpdate.notebookNeedsReenable = false;
                    }
                });
                await chrome.storage.sync.set(storageUpdate);
                sendResponse?.({ success: true, granted: true, serviceKeys: validKeys });
            } catch (error) {
                devError('[Background] Error in requestPermissionsAndEnableServices:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true;
    } else if (message.action === 'requestPermissionsAndEnableService') {
        // Handle permission request and service activation from popup
        // Note: This is called from popup onClick (user gesture context)
        (async () => {
            try {
                const { serviceKey } = message;
                const service = DYNAMIC_SERVICES[serviceKey];
                
                if (!service || !service.origins) {
                    sendResponse?.({ success: false, error: 'Service not found' });
                    return;
                }
                
                // Request permissions
                const permissions = ['scripting'];

                devLog('[Background] service.origins', { permissions, origins: service.origins });
                const granted = await chrome.permissions.request({ permissions, origins: service.origins });
                
                if (granted) {
                    // Enable the service
                    const storageUpdate = { [serviceKey]: true };
                    if (serviceKey === 'googleNotebook') {
                        storageUpdate.notebookNeedsReenable = false;
                    }
                    await chrome.storage.sync.set(storageUpdate);
                    devLog(`[Background] Service ${serviceKey} enabled after permission grant`);
                    sendResponse?.({ success: true, granted: true });
                } else {
                    sendResponse?.({ success: false, granted: false, error: 'Permissions denied' });
                }
            } catch (error) {
                devError('[Background] Error in requestPermissionsAndEnableService:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for async response
    } else if (message.action === 'injectNotebookIframes') {
        (async () => {
            const tabId = sender?.tab?.id;
            if (!tabId) {
                sendResponse?.({ success: false });
                return;
            }
            try {
                await injectContentFiles(tabId, { allFrames: true });
                sendResponse?.({ success: true });
            } catch (error) {
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true;
    } else if (message.action === 'toggleManualRtlSite') {
        // Handle adding site to manual RTL active sites list
        // Request scripting permission for the site before adding
        // Note: This is called from popup onClick (user gesture context)
        // Only handles enable=true, disable is handled in popup
        devLog('[Background] Received toggleManualRtlSite message:', message);
        (async () => {
            try {
                const { hostname, favicon } = message;
                
                if (!hostname) {
                    devError('[Background] Hostname is required');
                    sendResponse?.({ success: false, error: 'Hostname is required' });
                    return;
                }

                devLog(`[Background] Requesting permissions for ${hostname}`);
                // Request permissions
                const permissions = ['scripting'];
                const origins = [`*://${hostname}/*`];
                const granted = await chrome.permissions.request({ permissions, origins: origins });

                devLog(`[Background] Permission request result for ${hostname}:`, granted);

                if (granted) {
                    // Get current active sites
                    const storage = await chrome.storage.sync.get(['manualRtlActiveSites']);
                    const currentSites = storage.manualRtlActiveSites || [];

                    // Check if site already exists
                    const siteExists = currentSites.some(site => site.hostname === hostname);
                    if (siteExists) {
                        devLog(`[Background] Site ${hostname} already in list`);
                        sendResponse?.({ success: true, granted: true, alreadyExists: true });
                        return;
                    }

                    // Add site to list
                    const newSite = {
                        hostname: hostname,
                        favicon: favicon || undefined,
                        addedAt: Date.now()
                    };
                    const updatedSites = [...currentSites, newSite];

                    await chrome.storage.sync.set({ 
                        manualRtlActiveSites: updatedSites
                    });

                    devLog(`[Background] Site ${hostname} added to manual RTL active sites`);
                    sendResponse?.({ success: true, granted: true });
                } else {
                    devLog(`[Background] Permission denied for ${hostname}`);
                    sendResponse?.({ success: false, granted: false, error: 'Permissions denied' });
                }
            } catch (error) {
                devError('[Background] Error in toggleManualRtlSite:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for async response
    } else if (message.action === 'activateCurrentTab') {
        (async () => {
            try {
                await activateCurrentTab({
                    tabId: message.tabId,
                    activateAllTabs: message.activateAllTabs === true,
                    skipOriginCheck: true
                });
                sendResponse?.({ success: true });
            } catch (error) {
                devError('[Background] Error in activateCurrentTab:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true;
    } else if (message.action === 'closeUpdateModalInAllTabs') {
        // Close update modal in all tabs
        (async () => {
            try {
                const tabs = await chrome.tabs.query({});
                const promises = tabs.map(tab => {
                    if (tab.id && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                        return sendTabMessage(tab.id, { action: 'closeUpdateModal' });
                    }
                    return Promise.resolve();
                });
                await Promise.all(promises);
                sendResponse?.({ success: true });
            } catch (error) {
                devError('[Background] Error closing update modal in all tabs:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for async response
    }
    // Analytics messages are handled in analytics.js
    return false;
});


// ============================================
// MANUAL RTL INJECTION
// ============================================

// AI sites list for manual RTL
const AI_SITES = [
    'chatgpt.com', 'claude.ai', 'copilot.com', 'www.copilot.com', 'copilot.microsoft.com', 'bing.com', 'www.bing.com',
    'github.com', 'perplexity.ai', 'www.perplexity.ai', 'duckduckgo.com',
    'aistudio.google.com', 'chat.deepseek.com', 'you.com', 'chat.qwenlm.ai',
    'chat.qwen.ai', 'poe.com', 'monica.im', 'gemini.google.com', 'business.gemini.google', 'grok.com',
    // 'google.com', 'www.google.com',
    'chat.mistral.ai', 'manus.im', 'www.kimi.com', 'kimi.com', 'www.kimi.ai', 'kimi.ai', 'www.blackbox.ai',
    'notebooklm.google.com', 'notebook.google.com', 'usercontent.goog', 'chat.z.ai', 'arena.ai', 'openrouter.ai',
    'agent.minimax.io', 'jules.google.com', '1min.ai', 'app.1min.ai',
    'digen.ai', 'agent.digen.ai', 'lovable.dev', 'www.lovable.dev', 'synaps.app',
    'www.synaps.app', 'my.synaps.app', 'app.writesonic.com', 'ernie.baidu.com',
    'wenxin.baidu.com', 'chat.baidu.com',
    'gamma.app', 'www.gamma.app', 'duck.ai', 'app.clickup.com',
    't3.chat', 'www.t3.chat',
    'vivado.amd.com',
    'chat.atxp.ai',
    'consensus.app', 'www.consensus.app',
    'scispace.com', 'www.scispace.com',
    'elicit.com', 'www.elicit.com',
    'longcat.ai', 'www.longcat.ai', 'longcat.chat', 'www.longcat.chat',
    'math-gpt.org', 'www.math-gpt.org',
    'web.chatboxai.app',
    'lumo.proton.me',
    'meta.ai', 'www.meta.ai',
    'labs.google', 'www.labs.google',
    'www-veo3.com',
    'fal.ai', 'www.fal.ai',
    'bfl.ai', 'www.bfl.ai', 'dashboard.bfl.ai', 'playground.bfl.ai',
    'character.ai', 'www.character.ai', 'c.ai', 'www.c.ai',
    'pi.ai', 'www.pi.ai',
    'cursor.com', 'www.cursor.com', 'docs.cursor.com',
    'typingmind.com', 'www.typingmind.com',
    'huggingface.co', 'www.huggingface.co', 'hf.co', 'www.hf.co',
    'dash0.com', 'www.dash0.com', 'app.dash0.com',
    'zerve.ai', 'www.zerve.ai', 'app.zerve.ai',
    'coder.qwen.ai',
    'chat.sakana.ai', 'www.chat.sakana.ai',
    'genspark.ai', 'www.genspark.ai',
    'docs.google.com', 'drive.google.com', 'sheets.google.com', 'slides.google.com', 'forms.google.com',
    'analytics.google.com',
    'studio.youtube.com',
    'www.youtube.com', 'm.youtube.com',
    'm365.cloud.microsoft', 'copilot.cloud.microsoft',
    'app.notta.ai',
    'app.roboflow.com',
    'codecraftapi.com', 'www.codecraftapi.com'
];

function isAISite(hostname) {
    return AI_SITES.some(site => hostname === site || hostname.endsWith('.' + site));
}

async function shouldEnableManualRtlForSite(hostname) {
    try {
        const storage = await chrome.storage.sync.get(['manualRtlSettings', 'manualRtlActiveSites', 'allowedSites', 'customAllowedSites']);
        const manualRtlSettings = storage.manualRtlSettings || {};
        
        // Check if manual RTL is enabled
        if (!manualRtlSettings.manualRtlEnabled) {
            return false;
        }
        
        // Firefox: only sites declared in the manifest (no allowlist)
        const siteMode = isFirefoxRuntime()
            ? 'ai_sites'
            : (manualRtlSettings.manualRtlSiteMode || 'allowed_sites');
        
        // Check site mode
        if (siteMode === 'all') {
            return true;
        }
        
        if (siteMode === 'ai_sites') {
            return isAISite(hostname);
        }
        
        if (siteMode === 'allowed_sites') {
            const activeSites = storage.manualRtlActiveSites || [];
            return activeSites.some(site => site.hostname === hostname);
        }
        
        if (siteMode === 'ai_and_allowed') {
            if (isAISite(hostname)) {
                return true;
            }
            const activeSites = storage.manualRtlActiveSites || [];
            return activeSites.some(site => site.hostname === hostname);
        }
        
        return false;
    } catch (error) {
        devError('[Background] Error checking manual RTL for site:', error);
        return false;
    }
}

function shouldInjectNotebookAllFrames(hostname) {
    const host = String(hostname || '').toLowerCase();
    return host === 'notebook.google.com'
        || host === 'notebooklm.google.com'
        || host.endsWith('.notebook.google.com')
        || host.endsWith('.notebooklm.google.com')
        || host === 'usercontent.goog'
        || host.endsWith('.usercontent.goog');
}

async function injectContentFiles(tabId, options = {}) {
    const target = { tabId };
    if (options.allFrames) {
        target.allFrames = true;
    }
    let hostname = '';
    try {
        const tab = await chrome.tabs.get(tabId);
        hostname = tab?.url ? new URL(tab.url).hostname : '';
    } catch {
        hostname = '';
    }
    const files = harnessExtensionCssFiles(hostname);
    if (isFirefoxRuntime()) {
        // Sequential files: Firefox does not always run a files[] array in order.
        if (options.manageHarnessCss) {
            await enqueueHarnessCss(tabId, () => insertHarnessCssIfWanted(tabId, target));
        } else {
            await chrome.scripting.insertCSS({ target, files }).catch(() => {});
        }
        await chrome.scripting.executeScript({
            target,
            files: ['js/inject-fonts.js']
        });
        await chrome.scripting.executeScript({
            target,
            files: ['js/myJquery-3.7.1.js']
        });
        await chrome.scripting.executeScript({
            target,
            files: ['js/content.js']
        });
        return;
    }

    if (options.manageHarnessCss) {
        const cssReady = enqueueHarnessCss(tabId, () => insertHarnessCssIfWanted(tabId, target));
        await chrome.scripting.executeScript({
            target,
            files: ['js/myJquery-3.7.1.js', 'js/content.js']
        });
        await cssReady;
        return;
    }

    await Promise.all([
        chrome.scripting.insertCSS({ target, files }),
        chrome.scripting.executeScript({
            target,
            files: ['js/myJquery-3.7.1.js', 'js/content.js']
        })
    ]);
}

async function activateManualRtlForSite(tabId, options = {}) {
    if (!tabId) return;
    const skipOriginCheck = options.skipOriginCheck === true;
    
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!tab.url) return;
        
        if (isRestrictedBrowserUrl(tab.url)) {
            return;
        }
        
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        // Check if manual RTL should be enabled for this site
        const shouldEnable = await shouldEnableManualRtlForSite(hostname);
        if (!shouldEnable) {
            return;
        }
        
        // Check if permissions are granted
        const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
        if (!hasScripting) {
            devLog('[Background] Missing scripting permission for manual RTL');
            return;
        }
        
        if (!skipOriginCheck) {
            const origin = `*://${hostname}/*`;
            const hasOrigin = await hasHostPermission(origin);
            if (!hasOrigin) {
                devLog(`[Background] Missing origin permission for ${hostname}`);
                return;
            }
        }
        
        // Inject manual RTL script
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['js/manual-rtl.js']
            });
            
            devLog(`[Background] Manual RTL injected for ${hostname} (tab ${tabId})`);
        } catch (injectError) {
            // Ignore errors for error pages or invalid tabs
            if (isMissingTabError(injectError)) {
                return;
            } else if (injectError.message && injectError.message.includes('error page')) {
                devLog('[Background] Tab is showing error page, skipping manual RTL injection');
            } else if (injectError.message && injectError.message.includes('extensions gallery cannot be scripted')) {
                // Store error for this hostname so popup can display appropriate message
                chrome.storage.local.get(['manualRtlUnsupportedSites'], (result) => {
                    const unsupportedSites = result.manualRtlUnsupportedSites || [];
                    if (!unsupportedSites.includes(hostname)) {
                        unsupportedSites.push(hostname);
                        chrome.storage.local.set({ manualRtlUnsupportedSites: unsupportedSites });
                    }
                });
            } else {
                devError('[Background] Error injecting manual RTL:', injectError);
            }
        }
    } catch (error) {
        if (isMissingTabError(error)) {
            return;
        }
        devError('[Background] Error in activateManualRtlForSite:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

async function pingOrInjectDynamicRtl(tabId) {
    if (!tabId) return;

    const ping = await sendTabMessage(tabId, { action: 'enableRtl' });
    if (ping?.success) {
        return;
    }

    await activateContentScriptForDynamicSites(tabId);
}

async function activateDynamicServiceOnMatchingTabs(serviceKey) {
    const service = DYNAMIC_SERVICES[serviceKey];
    if (!service?.origins?.length) {
        return;
    }

    let tabs = [];
    try {
        tabs = await chrome.tabs.query({ url: service.origins });
    } catch (error) {
        devError('[Background] Error querying tabs for dynamic service:', error);
        try {
            tabs = await chrome.tabs.query({});
        } catch (fallbackError) {
            devError('[Background] Error querying all tabs for dynamic service:', fallbackError);
            return;
        }
    }

    for (const tab of tabs) {
        if (!tab?.id || !tab.url || isRestrictedBrowserUrl(tab.url) || !isValidHttpPage(tab.url)) {
            continue;
        }

        try {
            const parsedUrl = new URL(tab.url);
            if (getServiceNameFromHostname(parsedUrl.hostname, parsedUrl.port) !== serviceKey) {
                continue;
            }
        } catch {
            continue;
        }

        await pingOrInjectDynamicRtl(tab.id);
    }
}

async function injectHarnessBridge(tabId) {
    try {
        const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
        if (!hasScripting) {
            return;
        }
        const allowed = await hasHostPermission(DYNAMIC_SERVICES.harness.origins);
        if (!allowed) {
            return;
        }
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['js/harness-bridge.js']
        });
    } catch (error) {
        if (!isMissingTabError(error)) {
            devLog('[Background] Harness bridge skipped', error);
        }
    }
}

async function activateContentScriptForDynamicSites(tabId) {
    if (!tabId) return;
    
    devLog('[Background] activateContentScriptForDynamicSites', tabId);
    try {
        const tab = await chrome.tabs.get(tabId);
        devLog('[Background] tab', tab);
        if (!tab.url) return;
        
        if (isRestrictedBrowserUrl(tab.url)) {
            return;
        }
        
        devLog('[Background] tab.url', tab.url);

        const url = new URL(tab.url);
        const serviceName = getServiceNameFromHostname(url.hostname, url.port);
        
        if (!serviceName) {
            return;
        }

        if (serviceRequiresComplete(serviceName) && tab.status !== 'complete') {
            return;
        }

        if (serviceName === 'harness') {
            await injectHarnessBridge(tabId);
        }

        // Get service setting from storage first
        const storage = await chrome.storage.sync.get([serviceName, 'rtlAlgorithmMode']);
        const serviceEnabled = storage[serviceName] === true;
        const rtlAlgorithm = storage.rtlAlgorithmMode || 'advanced_full';
        
        // If service is not enabled, no need to check permissions
        if (!serviceEnabled) {
            devLog(`[Background] ${serviceName} is disabled in settings`);
            return;
        }
        
        // Check if permissions are granted
        const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
        
        // Check required origins based on service
        const service = DYNAMIC_SERVICES[serviceName];
        let hasRequiredOrigins = false;
        if (service) {
            hasRequiredOrigins = await hasHostPermission(service.origins);
        }
        
        devLog('[Background] hasScripting', hasScripting);
        devLog('[Background] hasRequiredOrigins', hasRequiredOrigins);
        
        // If permissions are missing, return without injecting
        if (!hasScripting || !hasRequiredOrigins) {
            devLog(`[Background] Missing permissions for ${serviceName}`);
            return;
        }
        
        try {
            const manageHarnessCss = serviceName === 'harness';
            if (manageHarnessCss) {
                await prepareHarnessCss(tabId);
            }
            await injectContentFiles(tabId, {
                allFrames: serviceName === 'googleNotebook' || shouldInjectNotebookAllFrames(url.hostname),
                manageHarnessCss
            });
            devLog(`[Background] All files (CSS and JavaScript) injected for ${url.hostname} (${serviceName}) tab`, tabId);
        } catch (injectError) {
            if (isMissingTabError(injectError)) {
                return;
            } else if (injectError.message && injectError.message.includes('error page')) {
                devLog('[Background] Tab is showing error page, skipping injection');
            } else {
                devError('[Background] Error injecting files:', injectError);
            }
        }
    } catch (error) {
        if (isMissingTabError(error)) {
            return;
        }
        devError('[Background] Error injecting content script:', error);
    }
}

async function injectTabNow(tabId, options = {}) {
    if (!tabId) return;
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!tab?.url || isRestrictedBrowserUrl(tab.url) || !isValidHttpPage(tab.url)) {
            return;
        }

        let allFrames = false;
        let manageHarnessCss = false;
        try {
            const parsed = new URL(tab.url);
            allFrames = shouldInjectNotebookAllFrames(parsed.hostname);
            manageHarnessCss = getServiceNameFromHostname(parsed.hostname, parsed.port) === 'harness';
        } catch {
            allFrames = false;
        }

        try {
            if (manageHarnessCss) {
                await prepareHarnessCss(tabId);
            }
            await injectContentFiles(tabId, { allFrames, manageHarnessCss });
        } catch (injectError) {
            if (isMissingTabError(injectError) || (injectError.message && injectError.message.includes('error page'))) {
                return;
            }
            await activateContentScriptForDynamicSites(tabId);
        }

        await activateManualRtlForSite(tabId, {
            skipOriginCheck: options.skipOriginCheck === true
        });
    } catch (error) {
        if (isMissingTabError(error)) {
            return;
        }
        devError('[Background] Error in injectTabNow:', error);
    }
}

async function activateCurrentTab(options = {}) {
    let tabId = options.tabId;
    if (!tabId) {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tabs[0]?.id;
        } catch {
            tabId = activeTabInfo?.tabId;
        }
    }

    if (options.activateAllTabs) {
        try {
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                if (tab.id && tab.url && isValidHttpPage(tab.url) && !isRestrictedBrowserUrl(tab.url)) {
                    await injectTabNow(tab.id, options);
                }
            }
            return;
        } catch (error) {
            devError('[Background] Error activating all tabs:', error);
        }
    }

    await injectTabNow(tabId, options);
}

function setupEventListeners() {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        if (!activeInfo?.tabId) return;
        devLog('[Events] Tab activated', activeInfo);
        resetActiveTabInfo(activeInfo.tabId);
        broadcastActiveTabInfo('tab-activated');
        
        // Activate content script for dynamic sites (not in manifest)
        await pingOrInjectDynamicRtl(activeInfo.tabId);
        
        // Activate manual RTL for active sites
        await activateManualRtlForSite(activeInfo.tabId);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId) {
            harnessCssSlots.delete(tabId);
            devLog('[Events] Tab removed', tabId);
            if (activeTabInfo?.tabId === tabId) {
                activeTabInfo = null;
                broadcastActiveTabInfo('tab-removed');
            }
        }
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        if (!tabId) return;
        if (activeTabInfo?.tabId === tabId) {
            // Only process http/https pages
            if (changeInfo?.url && !isValidHttpPage(changeInfo.url)) {
                activeTabInfo = null;
                broadcastActiveTabInfo('updated-to-non-http');
                return;
            }

            if (changeInfo?.favIconUrl) {
                activeTabInfo.favicon = changeInfo.favIconUrl;
            }
            if (changeInfo?.url) {
                try {
                    const url = new URL(changeInfo.url);
                    activeTabInfo.hostname = url.hostname;
                } catch (err) {
                    // Ignore invalid URL errors
                }
            }
            activeTabInfo.lastUpdatedAt = Date.now();
            broadcastActiveTabInfo('tab-updated');
        }



        if (changeInfo?.status === 'loading') {
            noteHarnessCssNavigation(tabId);
        }

        let injectBeforeComplete = false;
        if (changeInfo?.status === 'loading' || changeInfo?.url) {
            let pageUrl = changeInfo.url || '';
            if (!pageUrl) {
                try {
                    pageUrl = (await chrome.tabs.get(tabId))?.url || '';
                } catch {
                    pageUrl = '';
                }
            }
            try {
                const parsed = new URL(pageUrl);
                const serviceName = getServiceNameFromHostname(parsed.hostname, parsed.port);
                injectBeforeComplete = !!serviceName && !serviceRequiresComplete(serviceName);
            } catch {
                injectBeforeComplete = false;
            }
        }

        if (changeInfo?.status === 'complete' || injectBeforeComplete) {
            await pingOrInjectDynamicRtl(tabId);
        }

        if (changeInfo?.status === 'complete') {
            await activateManualRtlForSite(tabId);
        }
    });


    chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            devLog('[Events] Chrome lost focus');
        }
    });

    chrome.storage.sync.onChanged.addListener(async (changes) => {
        devLog('[Events] Storage changed', changes);
        
        // If manual RTL settings changed, update active tabs
        if (changes.manualRtlSettings || changes.manualRtlActiveSites) {
            try {
                // Get all tabs and update manual RTL for each
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                    if (tab.id && tab.url && !isRestrictedBrowserUrl(tab.url)) {
                        await activateManualRtlForSite(tab.id);
                    }
                }
            } catch (error) {
                devError('[Background] Error updating manual RTL after storage change:', error);
            }
        }

        for (const serviceKey of Object.keys(DYNAMIC_SERVICES)) {
            if (!changes[serviceKey] || changes[serviceKey].newValue !== true) {
                continue;
            }
            try {
                await activateDynamicServiceOnMatchingTabs(serviceKey);
            } catch (error) {
                devError(`[Background] Error enabling dynamic service ${serviceKey}:`, error);
            }
        }
    });

    if (chrome.permissions?.onAdded) {
        chrome.permissions.onAdded.addListener(async (perms) => {
            if (perms?.permissions?.includes('tabs')) {
                try {
                    await applyPendingFullPinOpenSite();
                } catch (error) {
                    devError('[Background] Error applying pin-open-site after tabs permission:', error);
                }
            }
            if (!perms?.origins?.length) {
                return;
            }
            try {
                await activateCurrentTab({ skipOriginCheck: true });
            } catch (error) {
                devError('[Background] Error activating tab after permission grant:', error);
            }
        });
    }
}


setupEventListeners();

// Activate manual RTL for existing tabs on startup
(async () => {
    try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.id && tab.url && !isRestrictedBrowserUrl(tab.url)) {
                await activateManualRtlForSite(tab.id);
            }
        }
    } catch (error) {
        devError('[Background] Error activating manual RTL on startup:', error);
    }
})();// Analytics initialization is handled in analytics.js

