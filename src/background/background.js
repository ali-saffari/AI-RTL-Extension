// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, copilot: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    notebooklm: true, zai: true, lmarena: true, openrouter: true, minimax: true
};

const ANALYTICS_CONFIG = {
    apiEndpoint: 'https://api.chatgpt-rtl.ir/api/analytics',
    maxRetries: 3,
    retryDelay: 1000,
    minSessionDuration: 1000,
    fetchTimeout: 10000,
    maxSessionAge: 24 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000,
    maxStorageSize: 100 * 1024
};

// ============================================
// STATE
// ============================================

const activeSessions = new Map();
const trackedTabIds = new Set(); // Track all open tabs without needing tabs permission
let isProcessingAnalytics = false;
let cleanupTimer = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const extensionId = chrome.runtime.id || 'rtl-ext';
    return `${extensionId}-${timestamp}-${randomPart}`;
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    
    if (ua.includes('Edg')) {
        name = 'Edge';
        const m = ua.match(/Edg\/(\d+)/);
        if (m) version = m[1];
    } else if (ua.includes('OPR')) {
        name = 'Opera';
        const m = ua.match(/OPR\/(\d+)/);
        if (m) version = m[1];
    } else if (ua.includes('Brave')) {
        name = 'Brave';
        const m = ua.match(/Chrome\/(\d+)/);
        if (m) version = m[1];
    } else if (ua.includes('Firefox')) {
        name = 'Firefox';
        const m = ua.match(/Firefox\/(\d+)/);
        if (m) version = m[1];
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        name = 'Safari';
        const m = ua.match(/Version\/(\d+)/);
        if (m) version = m[1];
    } else if (ua.includes('Chrome')) {
        name = 'Chrome';
        const m = ua.match(/Chrome\/(\d+)/);
        if (m) version = m[1];
    }
    
    return { name, version };
}

function sanitizeHostname(hostname) {
    if (!hostname || typeof hostname !== 'string') return 'unknown';
    return hostname.toLowerCase().replace(/[^a-z0-9.-]/g, '').substring(0, 255);
}

function sanitizeServiceName(serviceName) {
    if (!serviceName || typeof serviceName !== 'string') return 'unknown';
    return serviceName.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 50);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

async function startSession(tabId, serviceName, hostname) {
    if (!tabId || typeof tabId !== 'number' || tabId <= 0) return;
    
    // Track this tab
    trackedTabIds.add(tabId);
    
    if (activeSessions.has(tabId)) {
        await endSession(tabId);
    }
    
    const sanitizedService = sanitizeServiceName(serviceName);
    const sanitizedHost = sanitizeHostname(hostname);
    
    activeSessions.set(tabId, {
        serviceName: sanitizedService,
        hostname: sanitizedHost,
        startTime: Date.now(),
        totalPausedTime: 0,
        lastPauseTime: 0,
        isPaused: false,
        tabId
    });
    
    console.log('[Analytics] ▶️ Session started', { tabId, service: sanitizedService, hostname: sanitizedHost });
}

function pauseSession(tabId) {
    if (!tabId) return;
    const session = activeSessions.get(tabId);
    if (!session || session.isPaused) return;
    
    session.isPaused = true;
    session.lastPauseTime = Date.now();
    console.log('[Analytics] ⏸️ Session paused', { tabId, service: session.serviceName });
}

function resumeSession(tabId) {
    if (!tabId) return;
    const session = activeSessions.get(tabId);
    if (!session || !session.isPaused) return;
    
    if (session.lastPauseTime > 0) {
        session.totalPausedTime += Date.now() - session.lastPauseTime;
        session.lastPauseTime = 0;
    }
    session.isPaused = false;
    console.log('[Analytics] ▶️ Session resumed', { tabId, service: session.serviceName, pausedTime: session.totalPausedTime });
}

async function endSession(tabId) {
    if (!tabId) return;
    const session = activeSessions.get(tabId);
    if (!session) return;
    
    if (session.isPaused && session.lastPauseTime > 0) {
        session.totalPausedTime += Date.now() - session.lastPauseTime;
    }
    
    activeSessions.delete(tabId);
    trackedTabIds.delete(tabId);
    
    const durationMs = Date.now() - session.startTime - session.totalPausedTime;
    console.log('[Analytics] ⏹️ Session ended', { 
        tabId, 
        service: session.serviceName, 
        hostname: session.hostname,
        totalTime: durationMs,
        activeTime: durationMs,
        pausedTime: session.totalPausedTime
    });
    
    if (durationMs >= ANALYTICS_CONFIG.minSessionDuration) {
        await storeUsageDuration(session.serviceName, session.hostname, durationMs);
        processPendingAnalytics().catch(() => {});
    }
}

async function cleanupOrphanedSessions() {
    try {
        const now = Date.now();
        const sessionsToEnd = [];
        
        activeSessions.forEach((session, tabId) => {
            // Check if tab still exists (tracked) or session is too old
            if (!trackedTabIds.has(tabId) || (now - session.startTime) > ANALYTICS_CONFIG.maxSessionAge) {
                sessionsToEnd.push(tabId);
            }
        });
        
        if (sessionsToEnd.length > 0) {
            console.log('[Analytics] 🧹 Cleaning up orphaned sessions', { count: sessionsToEnd.length });
        }
        
        for (const tabId of sessionsToEnd) {
            await endSession(tabId);
        }
    } catch (error) {
        console.log('[Analytics] ⚠️ Cleanup warning:', error.message);
    }
}

function startCleanupTimer() {
    if (cleanupTimer) clearInterval(cleanupTimer);
    cleanupTimer = setInterval(() => {
        cleanupOrphanedSessions();
    }, ANALYTICS_CONFIG.cleanupInterval);
}

// ============================================
// ANALYTICS STORAGE
// ============================================

async function storeUsageDuration(serviceName, hostname, durationMs) {
    try {
        const settings = await chrome.storage.sync.get(['analyticsEnabled']);
        if (settings.analyticsEnabled === false) return;

        const result = await chrome.storage.local.get(['usageStats']);
        const usageStats = result.usageStats || {};
        const key = `${serviceName}_${hostname}`;
        
        if (!usageStats[key]) {
            usageStats[key] = {
                serviceName: sanitizeServiceName(serviceName),
                hostname: sanitizeHostname(hostname),
                totalDurationMs: 0,
                sessionCount: 0,
                lastUsed: Date.now(),
                firstUsed: Date.now()
            };
        }
        
        usageStats[key].totalDurationMs += durationMs;
        usageStats[key].sessionCount++;
        usageStats[key].lastUsed = Date.now();
        
        const dataSize = JSON.stringify(usageStats).length;
        if (dataSize > ANALYTICS_CONFIG.maxStorageSize) {
            await processPendingAnalytics();
            return;
        }
        
        await chrome.storage.local.set({ usageStats });
        console.log('[Analytics] 💾 Usage stored', { service: serviceName, hostname, durationMs, key });
    } catch (error) {
        console.log('[Analytics] ⚠️ Storage warning:', error.message);
    }
}

// ============================================
// API COMMUNICATION
// ============================================

async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function sendAnalyticsToAPI(usageStats, userId, retryCount = 0) {
    try {
        const aggregatedData = Object.values(usageStats).map(stat => ({
            serviceName: sanitizeServiceName(stat.serviceName),
            hostname: sanitizeHostname(stat.hostname),
            totalDurationMs: Math.max(0, Math.floor(stat.totalDurationMs)),
            sessionCount: Math.max(0, Math.floor(stat.sessionCount)),
            lastUsed: Math.max(0, Math.floor(stat.lastUsed)),
            firstUsed: Math.max(0, Math.floor(stat.firstUsed))
        }));

        if (aggregatedData.length === 0) return true;

        const browserInfo = getBrowserInfo();
        const payload = {
            userId: String(userId || '').substring(0, 100),
            timestamp: Date.now(),
            browser: {
                name: String(browserInfo.name || 'Unknown').substring(0, 50),
                version: String(browserInfo.version || 'Unknown').substring(0, 20)
            },
            usage: aggregatedData
        };

        console.log('[Analytics] 📤 Sending analytics', { 
            userId: userId.substring(0, 20) + '...', 
            itemsCount: aggregatedData.length,
            retryCount 
        });
        
        const response = await fetchWithTimeout(
            ANALYTICS_CONFIG.apiEndpoint,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            },
            ANALYTICS_CONFIG.fetchTimeout
        );

        if (response.ok) {
            console.log('[Analytics] ✅ Analytics sent successfully', { itemsCount: aggregatedData.length });
            return true;
        }
        
        const isRetryableStatus = response.status >= 500 || response.status === 429;
        if (isRetryableStatus && retryCount < ANALYTICS_CONFIG.maxRetries) {
            const delay = ANALYTICS_CONFIG.retryDelay * Math.pow(2, retryCount);
            console.log('[Analytics] 🔄 Retrying', { status: response.status, retryCount, delay });
            await new Promise(resolve => setTimeout(resolve, delay));
            return await sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }
        console.log('[Analytics] ⚠️ Send failed', { status: response.status, retryCount });
        return false;
    } catch (error) {
        const isRetryableError = (error.name === 'TypeError' || error.name === 'NetworkError' || error.name === 'AbortError');
        if (isRetryableError && retryCount < ANALYTICS_CONFIG.maxRetries) {
            const delay = ANALYTICS_CONFIG.retryDelay * Math.pow(2, retryCount);
            console.log('[Analytics] 🔄 Retrying after error', { error: error.name, retryCount, delay });
            await new Promise(resolve => setTimeout(resolve, delay));
            return await sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }
        console.log('[Analytics] ⚠️ Send failed permanently', { error: error.name, retryCount });
        return false;
    }
}

async function processPendingAnalytics() {
    if (isProcessingAnalytics) {
        console.log('[Analytics] ⏳ Already processing, skipping');
        return;
    }
    
    isProcessingAnalytics = true;
    
    try {
        const settings = await chrome.storage.sync.get(['analyticsEnabled', 'userId']);
        if (settings.analyticsEnabled === false || !settings.userId) {
            console.log('[Analytics] ⏸️ Analytics disabled or no userId');
            return;
        }

        const result = await chrome.storage.local.get(['usageStats']);
        const usageStats = result.usageStats || {};
        const statsCount = Object.keys(usageStats).length;
        
        if (statsCount === 0) {
            console.log('[Analytics] 📭 No data to send');
            return;
        }

        console.log('[Analytics] 🔄 Processing analytics', { statsCount });
        const success = await sendAnalyticsToAPI(usageStats, settings.userId);
        if (success) {
            await chrome.storage.local.set({ usageStats: {} });
            console.log('[Analytics] ✅ Storage cleared after successful send');
        } else {
            console.log('[Analytics] ⚠️ Data kept in storage for retry');
        }
    } catch (error) {
        console.log('[Analytics] ⚠️ Process error:', error.message);
    } finally {
        isProcessingAnalytics = false;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    
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
            console.log('[Analytics] ⚠️ Message handler error:', error.message, { type: message.type, tabId });
            sendResponse({ success: false });
        }
    });
    
    return true;
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    if (!activeInfo?.tabId) return;
    
    // Track the activated tab
    trackedTabIds.add(activeInfo.tabId);
    
    console.log('[Analytics] 🔀 Tab activated', { tabId: activeInfo.tabId, activeSessions: activeSessions.size });
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tabId) return;
    
    // Track the tab when it's updated
    trackedTabIds.add(tabId);
    
    // If URL changed and we have an active session, check if we need to end it
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
        console.log('[Analytics] 🚫 Analytics disabled by user');
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

// ============================================
// INITIALIZATION
// ============================================

chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Analytics] 🚀 Extension', details.reason);
    
    if (details.reason === 'install') {
        const userId = generateUserId();
        chrome.storage.sync.set({
            ...SERVICE_FLAGS,
            rtlAlgorithmMode: 'advanced_full',
            userId,
            analyticsEnabled: true
        });
        console.log('[Analytics] ✅ Initialized', { userId: userId.substring(0, 20) + '...' });
    } else if (details.reason === 'update') {
        try {
            chrome.storage.sync.get((storedData) => {
                const updates = {};
                const allServices = Object.keys(SERVICE_FLAGS);
                
                allServices.forEach(service => {
                    if (!storedData.hasOwnProperty(service)) {
                        updates[service] = true;
                    }
                });
                
                if (!storedData.hasOwnProperty('rtlAlgorithmMode')) {
                    updates.rtlAlgorithmMode = storedData.rtlAlgorithm === 'first_word' ? 'first_word' : 'advanced_full';
                }
                
                if (!storedData.hasOwnProperty('userId') || !storedData.userId) {
                    updates.userId = generateUserId();
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
console.log('[Analytics] ✅ Background script initialized');
