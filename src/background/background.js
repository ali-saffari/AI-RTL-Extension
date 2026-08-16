// Import dynamic services configuration
import { DYNAMIC_SERVICES, getServiceNameFromHostname } from '../constants/dynamicServices.js';
import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from '../constants/updateModalConfig.js';
// import { getSitesConfig } from '../constants/sitesConfig.js';

// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, copilot: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    googleNotebook: false, jules: true, zai: true, arena: false, openrouter: true, minimax: true, 
    oneMinai: true, digen: true, writesonic: true, lovable: true, ernie: true, gamma: true
};


// ============================================
// USER ID GENERATION & VALIDATION
// ============================================

/**
 * Get or create user ID and update uninstall URL with uid
 */
async function initializeUserId() {
    try {
        const result = await chrome.storage.sync.get(['uid']);
        let uid = result.uid;
        
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
        }));
        return uid;
    } catch (error) {
        console.error('Error initializing user ID:', error);
        chrome.runtime.setUninstallURL(buildExtensionSiteUrl('/uninstall-feedback/', {
            error: '1',
            source: 'extension-uninstall'
        }));
    }
}

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
//             console.log('[Background] Online config saved to storage:', sitesConfig);
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
//                     console.log('[Background] Sites config updated from API:', updates);
//                 });
//             }
//         });
//     } catch (error) {
//         console.error('[Background] Error applying sites config:', error);
//     }
// }

// Apply config on install/update and every 6 hours
chrome.runtime.onInstalled.addListener(async (details) => {
    // Initialize user ID and set uninstall URL with ID
    await initializeUserId();
    
    // Default manual RTL settings
    const defaultManualRtlSettings = getDefaultManualRtlSettings();

    // Firefox: migrate existing profiles to all-sites mode (no allowlist)
    if (isFirefoxRuntime()) {
        try {
            const stored = await chrome.storage.sync.get(['manualRtlSettings']);
            const current = stored.manualRtlSettings || {};
            await chrome.storage.sync.set({
                manualRtlSettings: {
                    ...defaultManualRtlSettings,
                    ...current,
                    manualRtlSiteMode: 'all',
                    manualRtlEnabled: current.manualRtlEnabled === true
                }
            });
        } catch (e) {
            console.error('[Background] Firefox manual RTL migrate failed:', e);
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
        chrome.storage.sync.set({
            ...SERVICE_FLAGS,
            rtlAlgorithmMode: 'advanced_full',
            selectedFont: 'iranyekan',
            fontScale: 100,
            manualRtlSettings: defaultManualRtlSettings,
            mixedTitleDisplayMode: 'unified',
            applyAlgorithmToCode: false,
            flipRtlArrows: false,
            activationHintDismissed: false,
            troubleshootingHintDismissed: true
        });
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
                console.log('[Background] Set update modal closed ID to', UPDATE_MODAL_ID, 'for new installation');
            });
        }
        
        // Open activation guide page in new tab after installation
        try {
            const uidResult = await chrome.storage.sync.get(['uid']);
            chrome.tabs.create({
                url: buildExtensionSiteUrl('/activate', {
                    uid: uidResult.uid || '',
                    source: 'extension-install'
                })
            });
        } catch (error) {
            console.error('[Background] Error opening activation guide page:', error);
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
                    updates.applyAlgorithmToCode = false;
                }

                if (!storedData.hasOwnProperty('flipRtlArrows')) {
                    updates.flipRtlArrows = false;
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
                    let hasNotebookOrigin = await chrome.permissions.contains({ origins: notebookOrigins });
                    if (!hasNotebookOrigin) {
                        hasNotebookOrigin = (granted.origins || []).some((origin) =>
                            origin.includes('://notebook.google.com/')
                        );
                    }

                    // Old storage key was `notebook`; `googleNotebook` is the new key
                    const wasNotebookEnabled = storedData.notebook === true || storedData.googleNotebook === true;
                    console.log('[Background] Notebook migration status', {
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
                    console.log('[Background] Notebook migration result', {
                        googleNotebook: updates.googleNotebook,
                        notebookNeedsReenable: updates.notebookNeedsReenable
                    });
                } catch (permissionError) {
                    console.error('[Background] Notebook origin permission check failed:', permissionError);
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
            console.log('Update handler warning:', error.message);
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
        favicon: activeTabInfo.favicon || '',
        hasHostname: Boolean(activeTabInfo.hostname),
        activatedAt: activeTabInfo.activatedAt,
        lastUpdatedAt: activeTabInfo.lastUpdatedAt
    };
}

function broadcastActiveTabInfo(reason = 'unknown') {
    if (!chrome?.runtime?.sendMessage) return;

    const snapshot = getActiveTabSnapshot();

    try {
        chrome.runtime.sendMessage({
            action: 'activeTabInfoUpdated',
            payload: snapshot
        }, (response) => {
            // Check for errors silently
            if (chrome.runtime.lastError) {
                // Receiving end does not exist - this is normal when no listeners are available
                return;
            }
        });
    } catch (error) {
        // Ignore broadcast errors
    }
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
            if (!activeTabInfo || activeTabInfo.tabId !== tabId) {
                return;
            }

            if (chrome.runtime.lastError || !tab?.url) {
                return;
            }

            // Only process http/https pages
            if (!isValidHttpPage(tab.url)) {
                activeTabInfo = null;
                broadcastActiveTabInfo('reset-skipped-non-http');
                return;
            }

            try {
                const url = new URL(tab.url);
                activeTabInfo.hostname = url.hostname;
                activeTabInfo.favicon = tab.favIconUrl || '';
                activeTabInfo.lastUpdatedAt = Date.now();
                broadcastActiveTabInfo('reset-tab-details');
            } catch (err) {
                // Ignore invalid URL errors
            }
        });
    } catch (error) {
        // Ignore tab access errors
    }
}


/**
 * True when this background is running inside Firefox.
 */
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

function buildExtensionSiteUrl(path, extraParams = {}) {
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
    return `https://ai-rtl.ir${normalizedPath}${query ? `?${query}` : ''}`;
}

function getDefaultManualRtlSettings() {
    // Firefox: all-sites mode available, Manual RTL off by default (no allowlist UI)
    if (isFirefoxRuntime()) {
        return {
            manualRtlEnabled: false,
            manualRtlSiteMode: 'all',
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


// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
            console.error('[Background] Exception opening options page:', error);
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
                    return chrome.tabs.sendMessage(tab.id, {
                        action: 'previewFontScale',
                        scale
                    }).catch(() => {});
                }));
            } catch (error) {
                // Tabs permission may be missing; preview is optional
            }
            sendResponse({ success: true });
        })();
        return true;
    } else if (message.action === 'getActiveTabInfo' || message.action === 'getActiveSessionInfo') {
        const snapshot = getActiveTabSnapshot();
        
        // If we don't have hostname, try to get it from content script
        if (!snapshot || !snapshot.hostname) {
            (async () => {
                try {
                    // Try to get active tab ID
                    let activeTabId = null;
                    try {
                        const hasTabsPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
                        if (hasTabsPermission && chrome?.tabs?.query) {
                            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                            if (tabs && tabs.length > 0) {
                                activeTabId = tabs[0].id;
                            }
                        } else if (activeTabInfo?.tabId) {
                            // Use cached tab ID if available
                            activeTabId = activeTabInfo.tabId;
                        }
                    } catch (e) {
                        // If tabs permission not available, try to use cached tab ID
                        if (activeTabInfo?.tabId) {
                            activeTabId = activeTabInfo.tabId;
                        }
                    }

                    // If we have tab ID, try to get info from content script via message
                    if (activeTabId && chrome?.tabs?.sendMessage) {
                        try {
                            const pageInfo = await chrome.tabs.sendMessage(activeTabId, { action: 'getPageInfo' });

                            if (pageInfo && pageInfo.success && pageInfo.hostname) {
                                const enhancedSnapshot = {
                                    tabId: activeTabId,
                                    hostname: pageInfo.hostname || '',
                                    favicon: pageInfo.favicon || '',
                                    hasHostname: Boolean(pageInfo.hostname),
                                    activatedAt: activeTabInfo?.activatedAt || Date.now(),
                                    lastUpdatedAt: Date.now()
                                };
                                
                                // Update activeTabInfo cache
                                activeTabInfo = enhancedSnapshot;
                                
                                sendResponse?.({
                                    success: true,
                                    tabInfo: enhancedSnapshot,
                                    tabHostname: enhancedSnapshot.hostname || '',
                                    session: null
                                });
                                return;
                            }
                        } catch (e) {
                            // If content script message fails (e.g., receiving end does not exist), fall back to snapshot
                            // This is normal when content script is not injected or not ready
                            if (e.message && !e.message.includes('Receiving end does not exist')) {
                                console.log('[ActiveTab] Failed to get info from content script:', e.message);
                            }
                        }
                    }
                } catch (error) {
                    console.log('[ActiveTab] Error getting info from content script:', error.message);
                }
                
                // Fall back to original snapshot
                sendResponse?.({
                    success: true,
                    tabInfo: snapshot,
                    tabHostname: snapshot?.hostname || '',
                    session: null
                });
            })();
            return true; // Keep channel open for async response
        }
        
        sendResponse?.({
            success: true,
            tabInfo: snapshot,
            tabHostname: snapshot?.hostname || '',
            session: null
        });
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

                console.log('[Background] service.origins', { permissions, origins: service.origins });
                const granted = await chrome.permissions.request({ permissions, origins: service.origins });
                
                if (granted) {
                    // Enable the service
                    const storageUpdate = { [serviceKey]: true };
                    if (serviceKey === 'googleNotebook') {
                        storageUpdate.notebookNeedsReenable = false;
                    }
                    await chrome.storage.sync.set(storageUpdate);
                    console.log(`[Background] Service ${serviceKey} enabled after permission grant`);
                    sendResponse?.({ success: true, granted: true });
                } else {
                    sendResponse?.({ success: false, granted: false, error: 'Permissions denied' });
                }
            } catch (error) {
                console.error('[Background] Error in requestPermissionsAndEnableService:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for async response
    } else if (message.action === 'toggleManualRtlSite') {
        // Handle adding site to manual RTL active sites list
        // Request scripting permission for the site before adding
        // Note: This is called from popup onClick (user gesture context)
        // Only handles enable=true, disable is handled in popup
        console.log('[Background] Received toggleManualRtlSite message:', message);
        (async () => {
            try {
                const { hostname, favicon } = message;
                
                if (!hostname) {
                    console.error('[Background] Hostname is required');
                    sendResponse?.({ success: false, error: 'Hostname is required' });
                    return;
                }

                console.log(`[Background] Requesting permissions for ${hostname}`);
                // Request permissions
                const permissions = ['scripting'];
                const origins = [`*://${hostname}/*`];
                const granted = await chrome.permissions.request({ permissions, origins: origins });

                console.log(`[Background] Permission request result for ${hostname}:`, granted);

                if (granted) {
                    // Get current active sites
                    const storage = await chrome.storage.sync.get(['manualRtlActiveSites']);
                    const currentSites = storage.manualRtlActiveSites || [];

                    // Check if site already exists
                    const siteExists = currentSites.some(site => site.hostname === hostname);
                    if (siteExists) {
                        console.log(`[Background] Site ${hostname} already in list`);
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

                    console.log(`[Background] Site ${hostname} added to manual RTL active sites`);
                    sendResponse?.({ success: true, granted: true });
                } else {
                    console.log(`[Background] Permission denied for ${hostname}`);
                    sendResponse?.({ success: false, granted: false, error: 'Permissions denied' });
                }
            } catch (error) {
                console.error('[Background] Error in toggleManualRtlSite:', error);
                sendResponse?.({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for async response
    } else if (message.action === 'closeUpdateModalInAllTabs') {
        // Close update modal in all tabs
        (async () => {
            try {
                const tabs = await chrome.tabs.query({});
                const promises = tabs.map(tab => {
                    if (tab.id && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                        return chrome.tabs.sendMessage(tab.id, { action: 'closeUpdateModal' }).catch(() => {
                            // Ignore errors (tab might not have content script)
                        });
                    }
                });
                await Promise.all(promises);
                sendResponse?.({ success: true });
            } catch (error) {
                console.error('[Background] Error closing update modal in all tabs:', error);
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
    'chatgpt.com', 'claude.ai', 'copilot.microsoft.com', 'bing.com', 'www.bing.com',
    'github.com', 'perplexity.ai', 'www.perplexity.ai', 'duckduckgo.com',
    'aistudio.google.com', 'chat.deepseek.com', 'you.com', 'chat.qwenlm.ai',
    'chat.qwen.ai', 'poe.com', 'monica.im', 'gemini.google.com', 'business.gemini.google', 'grok.com',
    // 'google.com', 'www.google.com',
    'chat.mistral.ai', 'manus.im', 'www.kimi.com', 'www.blackbox.ai',
    'notebooklm.google.com', 'notebook.google.com', 'chat.z.ai', 'arena.ai', 'openrouter.ai',
    'agent.minimax.io', 'jules.google.com', '1min.ai', 'app.1min.ai',
    'digen.ai', 'lovable.dev', 'www.lovable.dev', 'synaps.app',
    'www.synaps.app', 'my.synaps.app', 'app.writesonic.com', 'ernie.baidu.com',
    'gamma.app', 'www.gamma.app', 'duck.ai', 'app.clickup.com',
    't3.chat', 'www.t3.chat',
    'vivado.amd.com',
    'chat.atxp.ai',
    'consensus.app', 'www.consensus.app',
    'scispace.com', 'www.scispace.com',
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
    'zerve.ai', 'www.zerve.ai', 'app.zerve.ai'
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
        
        // Firefox: always treat as all-sites mode (no allowlist)
        const siteMode = isFirefoxRuntime()
            ? 'all'
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
        console.error('[Background] Error checking manual RTL for site:', error);
        return false;
    }
}

async function activateManualRtlForSite(tabId) {
    if (!tabId) return;
    
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!tab.url) return;
        
        // Check if tab is in a valid state
        if (isRestrictedBrowserUrl(tab.url) || tab.status !== 'complete') {
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
            console.log('[Background] Missing scripting permission for manual RTL');
            return;
        }
        
        // Check if origin permission is granted
        const origin = `*://${hostname}/*`;
        const hasOrigin = await chrome.permissions.contains({ origins: [origin] });
        if (!hasOrigin) {
            console.log(`[Background] Missing origin permission for ${hostname}`);
            return;
        }
        
        // Inject manual RTL script
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['js/manual-rtl.js']
            });
            
            console.log(`[Background] Manual RTL injected for ${hostname} (tab ${tabId})`);
        } catch (injectError) {
            // Ignore errors for error pages or invalid tabs
            if (injectError.message && injectError.message.includes('error page')) {
                console.log('[Background] Tab is showing error page, skipping manual RTL injection');
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
                console.error('[Background] Error injecting manual RTL:', injectError);
            }
        }
    } catch (error) {
        // Tab might not be accessible, ignore
        console.error('[Background] Error in activateManualRtlForSite:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

async function activateContentScriptForDynamicSites(tabId) {
    if (!tabId) return;
    
    console.log('[Background] activateContentScriptForDynamicSites', tabId);
    try {
        const tab = await chrome.tabs.get(tabId);
        console.log('[Background] tab', tab);
        if (!tab.url) return;
        
        // Check if tab is in a valid state (not error page, not browser internal pages)
        if (isRestrictedBrowserUrl(tab.url) || tab.status !== 'complete') {
            return;
        }
        
        console.log('[Background] tab.url', tab.url);

        const url = new URL(tab.url);
        const serviceName = getServiceNameFromHostname(url.hostname);
        
        if (!serviceName) {
            return;
        }
        
        // Get service setting from storage first
        const storage = await chrome.storage.sync.get([serviceName, 'rtlAlgorithmMode']);
        const serviceEnabled = storage[serviceName] === true;
        const rtlAlgorithm = storage.rtlAlgorithmMode || 'advanced_full';
        
        // If service is not enabled, no need to check permissions
        if (!serviceEnabled) {
            console.log(`[Background] ${serviceName} is disabled in settings`);
            return;
        }
        
        // Check if permissions are granted
        const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
        
        // Check required origins based on service
        const service = DYNAMIC_SERVICES[serviceName];
        let hasRequiredOrigins = false;
        if (service) {
            // For all dynamic services, check their specific origins
            hasRequiredOrigins = await chrome.permissions.contains({ origins: service.origins });
        }
        
        console.log('[Background] hasScripting', hasScripting);
        console.log('[Background] hasRequiredOrigins', hasRequiredOrigins);
        
        // If permissions are missing, return without injecting
        if (!hasScripting || !hasRequiredOrigins) {
            console.log(`[Background] Missing permissions for ${serviceName}`);
            return;
        }
        
        // Inject content script activation
        try {
            if (serviceEnabled) {
                // Inject all files together (CSS and JavaScript in parallel)
                console.log('[Background] inject all files together (CSS and JavaScript in parallel)');
                try {
                    if (isFirefoxRuntime()) {
                        // Firefox: avoid moz-extension @font-face (blocked by page CSP).
                        // Keep same idle timing as Chrome; fonts load via FontFace API.
                        await Promise.all([
                            chrome.scripting.insertCSS({
                                target: { tabId: tabId },
                                files: ['style.css']
                            }),
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ['js/inject-fonts.js', 'js/myJquery-3.7.1.js', 'js/content.js']
                            })
                        ]);
                    } else {
                        await Promise.all([
                            chrome.scripting.insertCSS({
                                target: { tabId: tabId },
                                files: ['css/fontiran-iranyekan.css', 'style.css']
                            }),
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ['js/myJquery-3.7.1.js', 'js/content.js']
                            })
                        ]);
                    }
                    console.log(`[Background] All files (CSS and JavaScript) injected for ${url.hostname} (${serviceName}) tab`, tabId);
                } catch (injectError) {
                    // Ignore errors for error pages or invalid tabs
                    if (injectError.message && injectError.message.includes('error page')) {
                        console.log('[Background] Tab is showing error page, skipping injection');
                    } else {
                        console.error('[Background] Error injecting files:', injectError);
                    }
                }
            }
        } catch (injectError) {
            console.error(`[Background] Error injecting content script for ${serviceName}:`, injectError);
        }
    } catch (error) {
        // Tab might not be accessible, ignore
        console.error(`[Background] Error injecting content script for ${serviceName}:`, error);
    }
}

function setupEventListeners() {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        if (!activeInfo?.tabId) return;
        console.log('[Events] Tab activated', activeInfo);
        resetActiveTabInfo(activeInfo.tabId);
        broadcastActiveTabInfo('tab-activated');
        
        // Activate content script for dynamic sites (not in manifest)
        await activateContentScriptForDynamicSites(activeInfo.tabId);
        
        // Activate manual RTL for active sites
        await activateManualRtlForSite(activeInfo.tabId);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId) {
            console.log('[Events] Tab removed', tabId);
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



        // Inject content script for dynamic sites (not in manifest) when page is complete
        if (changeInfo?.status === 'complete') {
            await activateContentScriptForDynamicSites(tabId);
            
            // Activate manual RTL for active sites
            await activateManualRtlForSite(tabId);
        }
    });


    chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            console.log('[Events] Chrome lost focus');
        }
    });

    chrome.storage.sync.onChanged.addListener(async (changes) => {
        console.log('[Events] Storage changed', changes);
        
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
                console.error('[Background] Error updating manual RTL after storage change:', error);
            }
        }
    });

    chrome.runtime.onSuspend.addListener(async () => {
        console.log('[Events] Runtime suspending');
        // Analytics cleanup is handled in analytics.js
    });
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
        console.error('[Background] Error activating manual RTL on startup:', error);
    }
})();// Analytics initialization is handled in analytics.js

