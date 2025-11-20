// ============================================
// BACKEND ENTRY (Background Service Worker)
// ============================================

import {
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    cleanupOrphanedSessions,
    startCleanupTimer,
    trackedTabIds,
    activeSessions
} from './session.js';

// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, copilot: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    notebooklm: true, jules: true, lovable: true, synaps: true, writesonic: true,
    zai: true, lmarena: true, openrouter: true, minimax: true, oneMinai: true,
    digen: true, ernie: true
};

// ============================================
// USER ID MANAGEMENT
// ============================================

async function initializeUserId() {
    try {
        const result = await chrome.storage.sync.get(['uid']);
        let uid = result.uid;

        if (!uid) {
            const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
            const numberString = randomNumber.toString();

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
// MESSAGE HANDLERS
// ============================================

function setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const tabId = sender.tab?.id;

        const isSessionMessage =
            message.type === 'SESSION_START' ||
            message.type === 'SESSION_PAUSE' ||
            message.type === 'SESSION_RESUME' ||
            message.type === 'SESSION_END';

        if (isSessionMessage) {
            if (!tabId || typeof tabId !== 'number') {
                sendResponse({ success: false });
                return true;
            }

            chrome.storage.sync.get(['analyticsEnabled'], async (result) => {
                if (result.analyticsEnabled === false) {
                    sendResponse({ success: false });
                    return;
                }

                try {
                    switch (message.type) {
                        case 'SESSION_START':
                            if (message.serviceName && message.hostname) {
                                await startSession(tabId, message.serviceName, message.hostname);
                            }
                            break;
                        case 'SESSION_PAUSE':
                            pauseSession(tabId);
                            break;
                        case 'SESSION_RESUME':
                            resumeSession(tabId);
                            break;
                        case 'SESSION_END':
                            await endSession(tabId);
                            break;
                    }
                    sendResponse({ success: true });
                } catch (error) {
                    console.log('[Analytics] ⚠️ Message handler error:', error?.message, { type: message.type, tabId });
                    sendResponse({ success: false });
                }
            });

            return true;
        }

        if (message.action === 'openPopup') {
            try {
                const popupUrl = chrome.runtime.getURL('index.html');
                chrome.tabs.create({ url: popupUrl }, (tab) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        sendResponse({ success: true, tabId: tab?.id });
                    }
                });
                return true;
            } catch (error) {
                console.error('[Background] Exception opening popup:', error);
                sendResponse({ success: false, error: error.message });
                return true;
            }
        }

        if (message.action === 'openOptionsPage') {
            try {
                chrome.runtime.openOptionsPage();
                sendResponse({ success: true });
                return true;
            } catch (error) {
                console.error('[Background] Exception opening options page:', error);
                sendResponse({ success: false, error: error.message });
                return true;
            }
        }

        return false;
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    chrome.tabs.onActivated.addListener((activeInfo) => {
        if (!activeInfo?.tabId) return;

        trackedTabIds.add(activeInfo.tabId);
        activeSessions.forEach((session, tabId) => {
            if (tabId !== activeInfo.tabId) {
                pauseSession(tabId);
            } else {
                resumeSession(tabId);
            }
        });
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId) {
            trackedTabIds.delete(tabId);
            endSession(tabId);
        }
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        if (!tabId) return;
        trackedTabIds.add(tabId);

        if (!changeInfo.url || !activeSessions.has(tabId)) return;

        try {
            const newUrl = new URL(changeInfo.url);
            const session = activeSessions.get(tabId);
            if (session && session.hostname !== newUrl.hostname) {
                await endSession(tabId);
            }
        } catch (error) {
            await endSession(tabId);
        }
    });

    chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            activeSessions.forEach((session, tabId) => {
                pauseSession(tabId);
            });
        }
    });

    chrome.storage.sync.onChanged.addListener(async (changes) => {
        if (changes.analyticsEnabled?.newValue === false) {
            chrome.storage.local.set({ usageStats: {} });
            for (const [tabId] of activeSessions) {
                await endSession(tabId);
            }
            trackedTabIds.clear();
        }
    });

    chrome.runtime.onSuspend.addListener(async () => {
        for (const [tabId] of activeSessions) {
            await endSession(tabId);
        }
        trackedTabIds.clear();
    });
}

// ============================================
// INITIALIZATION
// ============================================

initializeUserId();

chrome.runtime.onInstalled.addListener(async (details) => {
    await initializeUserId();

    if (details.reason === 'install') {
        chrome.storage.sync.set({
            ...SERVICE_FLAGS,
            rtlAlgorithmMode: 'advanced_full',
            analyticsEnabled: true
        });
    } else if (details.reason === 'update') {
        try {
            chrome.storage.sync.get((storedData) => {
                const updates = {};
                Object.keys(SERVICE_FLAGS).forEach((service) => {
                    if (!storedData.hasOwnProperty(service)) {
                        updates[service] = true;
                    }
                });

                if (!storedData.hasOwnProperty('rtlAlgorithmMode')) {
                    updates.rtlAlgorithmMode = storedData.rtlAlgorithm === 'first_word' ? 'first_word' : 'advanced_full';
                }

                if (!storedData.hasOwnProperty('analyticsEnabled')) {
                    updates.analyticsEnabled = true;
                }

                if (Object.keys(updates).length > 0) {
                    chrome.storage.sync.set(updates);
                }
            });
        } catch (error) {
            console.log('[Analytics] ⚠️ Update handler warning:', error.message);
        }
    }

    startCleanupTimer();
    cleanupOrphanedSessions();
});

chrome.runtime.onStartup.addListener(() => {
    startCleanupTimer();
    cleanupOrphanedSessions();
});

startCleanupTimer();
setupMessageHandlers();
setupEventListeners();

console.log('[Analytics] ✅ Backend initialized');

