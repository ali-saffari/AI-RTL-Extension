// Import dynamic services configuration
import { DYNAMIC_SERVICES, getServiceNameFromHostname } from '../constants/dynamicServices.js';

// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, copilot: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    notebooklm: true, jules: true, zai: true, lmarena: true, openrouter: true, minimax: true, oneMinai: true, digen: true
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
        
        chrome.runtime.setUninstallURL(`https://chatgpt-rtl.ir/uninstall-feedback/?uid=${uid}&source=extension-uninstall`);
        return uid;
    } catch (error) {
        console.error('Error initializing user ID:', error);
        chrome.runtime.setUninstallURL('https://chatgpt-rtl.ir/uninstall-feedback/?error=1&source=extension-uninstall');
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize user ID and set uninstall URL when service worker starts
initializeUserId();

chrome.runtime.onInstalled.addListener(async (details) => {
    // Initialize user ID and set uninstall URL with ID
    await initializeUserId();
    
    // Default manual RTL settings
    const defaultManualRtlSettings = {
        enabled: 'enabled',
        highlightMode: 'on_selection',
        highlightColor: '#ff0000',
        highlightOpacity: 0.1,
        logoDisplay: 'always',
        manualRtlEnabled: false,
        manualRtlSiteMode: 'all',
        menuDisplayMode: 'logo_first'
    };
    
    if (details.reason === 'install') {
        // Create default flags for dynamic services (all disabled by default)
        const dynamicServiceFlags = {};
        Object.keys(DYNAMIC_SERVICES).forEach(service => {
            dynamicServiceFlags[service] = false;
        });
        
        chrome.storage.sync.set({
            ...SERVICE_FLAGS,
            ...dynamicServiceFlags,
            rtlAlgorithmMode: 'advanced_full',
            manualRtlSettings: defaultManualRtlSettings
        });
    } else if (details.reason === 'update') {
        try {
            chrome.storage.sync.get((storedData) => {
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
                
                if (Object.keys(updates).length > 0) {
                    chrome.storage.sync.set(updates, () => {
                        // After migration, remove old textSelectorSettings if it exists
                        if (storedData.textSelectorSettings && !storedData.manualRtlSettings) {
                            chrome.storage.sync.remove('textSelectorSettings');
                        }
                    });
                } else if (storedData.textSelectorSettings && !storedData.manualRtlSettings) {
                    // If no other updates, just migrate and remove old key
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
const alertedTabs = new Set();

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
    // console.log('[ActiveTab] Broadcasting update', { reason, snapshot });

    try {
        chrome.runtime.sendMessage({
            action: 'activeTabInfoUpdated',
            payload: snapshot
        }, () => {
            if (chrome.runtime.lastError) {
                // console.warn('[ActiveTab] Broadcast warning:', chrome.runtime.lastError.message);
            }
        });
    } catch (error) {
        // console.warn('[ActiveTab] Broadcast exception:', error?.message);
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
        // console.log('[ActiveTab] Initialized without tab access', activeTabInfo);
        return;
    }

    try {
        chrome.tabs.get(tabId, (tab) => {
            if (!activeTabInfo || activeTabInfo.tabId !== tabId) {
                return;
            }

            if (chrome.runtime.lastError || !tab?.url) {
                if (chrome.runtime.lastError) {
                    // console.warn('[ActiveTab] Unable to fetch initial tab info:', chrome.runtime.lastError.message);
                }
                return;
            }

            try {
                const url = new URL(tab.url);
                activeTabInfo.hostname = url.hostname;
                activeTabInfo.favicon = tab.favIconUrl || '';
                activeTabInfo.lastUpdatedAt = Date.now();
                // console.log('[ActiveTab] Initialized from tab info', { hostname: activeTabInfo.hostname, favicon: activeTabInfo.favicon });
                broadcastActiveTabInfo('reset-tab-details');
            } catch (err) {
                // console.warn('[ActiveTab] Invalid tab URL:', tab.url, err?.message);
            }
        });
    } catch (error) {
        // console.warn('[ActiveTab] Exception while reading tab info:', error.message);
    }
}

function dumpActiveTabInfo(context) {
    if (!activeTabInfo) {
        // console.log(`[ActiveTab] ${context}: no active tab info`);
        return;
    }

    // console.log(`[ActiveTab] ${context}`, {
    //     tabId: activeTabInfo.tabId,
    //     hostname: activeTabInfo.hostname,
    //     favicon: activeTabInfo.favicon,
    //     activatedAt: activeTabInfo.activatedAt,
    //     lastUpdatedAt: activeTabInfo.lastUpdatedAt
    // });
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
        try {
            // Open popup in a new tab
            const popupUrl = chrome.runtime.getURL('index.html');
            console.log('[Background] Opening popup at:', popupUrl);
            chrome.tabs.create({ url: popupUrl }, (tab) => {
                if (chrome.runtime.lastError) {
                    console.error('[Background] Error creating tab:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    console.log('[Background] Tab created successfully:', tab);
                    sendResponse({ success: true });
                }
            });
            return true; // Keep the message channel open for async response
        } catch (error) {
            console.error('[Background] Exception opening popup:', error);
            sendResponse({ success: false, error: error.message });
            return true;
        }
    } else if (message.action === 'openOptionsPage') {
        try {
            // Open options page
            chrome.runtime.openOptionsPage();
            sendResponse({ success: true });
            return true;
        } catch (error) {
            console.error('[Background] Exception opening options page:', error);
            sendResponse({ success: false, error: error.message });
            return true;
        }
    } else if (message.action === 'contentSiteInfo') {
        const tabId = sender?.tab?.id;
        if (!tabId) {
            sendResponse?.({ success: false, error: 'No tab context' });
            return true;
        }

        let derivedHostname = '';
        try {
            if (sender?.tab?.url) {
                derivedHostname = new URL(sender.tab.url).hostname;
            }
        } catch (parseError) {
            console.warn('[Content] Unable to parse sender tab URL:', sender?.tab?.url, parseError?.message);
        }

        if (!activeTabInfo || activeTabInfo.tabId !== tabId) {
            console.log('[Content] Site info received for inactive tab, ignoring', { tabId });
            sendResponse?.({ success: false, error: 'Inactive tab' });
            return true;
        }

        const hostname = message.hostname || derivedHostname || activeTabInfo.hostname || '';
        const favicon = message.favicon || sender?.tab?.favIconUrl || activeTabInfo.favicon || '';
        activeTabInfo.hostname = hostname;
        activeTabInfo.favicon = favicon;
        activeTabInfo.lastUpdatedAt = Date.now();

        console.log('[Content] Active tab info updated', {
            tabId,
            hostname,
            favicon
        });
        dumpActiveTabInfo('Current snapshot');
        broadcastActiveTabInfo('content-update');
        sendResponse?.({ success: true });
        return true;
    } else if (message.action === 'getActiveTabInfo' || message.action === 'getActiveSessionInfo') {
        const snapshot = getActiveTabSnapshot();
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
                const granted = await chrome.permissions.request({ permissions, origins: service.origins });
                
                if (granted) {
                    // Enable the service
                    await chrome.storage.sync.set({ [serviceKey]: true });
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
    }
    return false;
});


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
        
        // Check if tab is in a valid state (not error page, not chrome:// pages)
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') || 
            tab.url.startsWith('about:') ||
            tab.status !== 'complete') {
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
        console.error(`B [Background] Error injecting content script for ${serviceName}:`, injectError);
    }
}

function setupEventListeners() {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        if (!activeInfo?.tabId) return;
        console.log('[Events] Tab activated', activeInfo);
        resetActiveTabInfo(activeInfo.tabId);
        dumpActiveTabInfo('After activation');
        broadcastActiveTabInfo('tab-activated');
        
        // Activate content script for dynamic sites (not in manifest)
        await activateContentScriptForDynamicSites(activeInfo.tabId);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId) {
            console.log('[Events] Tab removed', tabId);
            if (activeTabInfo?.tabId === tabId) {
                dumpActiveTabInfo('Before removal reset');
                activeTabInfo = null;
                // console.log('[ActiveTab] Cleared because tab removed');
                broadcastActiveTabInfo('tab-removed');
            }
            // Remove from alerted tabs set
            alertedTabs.delete(tabId);
        }
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        if (!tabId) return;
        // console.log('[Events] Tab updated', { tabId, changeInfo });
        if (activeTabInfo?.tabId === tabId) {
            if (changeInfo?.favIconUrl) {
                activeTabInfo.favicon = changeInfo.favIconUrl;
            }
            if (changeInfo?.url) {
                try {
                    const url = new URL(changeInfo.url);
                    activeTabInfo.hostname = url.hostname;
                } catch (err) {
                    // console.warn('[ActiveTab] Invalid URL in update:', changeInfo.url);
                }
            }
            activeTabInfo.lastUpdatedAt = Date.now();
            dumpActiveTabInfo('Updated from tab change');
            broadcastActiveTabInfo('tab-updated');
        }



        // Inject content script for dynamic sites (not in manifest) when page is complete
        if (changeInfo?.status === 'complete') {
            await activateContentScriptForDynamicSites(tabId);
        }
    });


    chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            console.log('[Events] Chrome lost focus');
        }
    });

    chrome.storage.sync.onChanged.addListener(async (changes) => {
        console.log('[Events] Storage changed', changes);
    });

    chrome.runtime.onSuspend.addListener(async () => {
        console.log('[Events] Runtime suspending');
    });
}


setupEventListeners()