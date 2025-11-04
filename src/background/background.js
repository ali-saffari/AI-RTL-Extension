// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true,
    claude: true,
    copilot: true,
    githubCopilot: true,
    duckduckgo: true,
    perplexity: true,
    aiStudio: true,
    deepseek: true,
    youCom: true,
    qwenlm: true,
    poeCom: true,
    monica: true,
    gemini: true,
    grok: true,
    mistral: true,
    manus: true,
    kimi: true,
    blackbox: true,
    notebooklm: true,
    zai: true,
    lmarena: true,
    openrouter: true,
    minimax: true
};

const ANALYTICS_CONFIG = {
    apiEndpoint: 'https://api.chatgpt-rtl.ir/api/analytics',
    maxRetries: 3,
    retryDelay: 1000,
    minSessionDuration: 1000
};

// ============================================
// STATE
// ============================================

const activeSessions = new Map();
let isProcessingAnalytics = false;

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

// ============================================
// SESSION MANAGEMENT
// ============================================

async function startSession(tabId, serviceName, hostname) {
    if (activeSessions.has(tabId)) {
        await endSession(tabId);
    }
    
    activeSessions.set(tabId, {
        serviceName,
        hostname,
        startTime: Date.now(),
        totalPausedTime: 0,
        lastPauseTime: 0,
        isPaused: false,
        tabId
    });
}

function pauseSession(tabId) {
    const session = activeSessions.get(tabId);
    if (!session || session.isPaused) return;
    session.isPaused = true;
    session.lastPauseTime = Date.now();
}

function resumeSession(tabId) {
    const session = activeSessions.get(tabId);
    if (!session || !session.isPaused) return;
    
    if (session.lastPauseTime > 0) {
        session.totalPausedTime += Date.now() - session.lastPauseTime;
        session.lastPauseTime = 0;
    }
    session.isPaused = false;
}

async function endSession(tabId) {
    const session = activeSessions.get(tabId);
    if (!session) return;
    
    if (session.isPaused && session.lastPauseTime > 0) {
        session.totalPausedTime += Date.now() - session.lastPauseTime;
    }
    
    activeSessions.delete(tabId);
    
    const durationMs = Date.now() - session.startTime - session.totalPausedTime;
    if (durationMs >= ANALYTICS_CONFIG.minSessionDuration) {
        await storeUsageDuration(session.serviceName, session.hostname, durationMs);
        processPendingAnalytics().catch(() => {});
    }
}

// ============================================
// ANALYTICS STORAGE
// ============================================

async function storeUsageDuration(serviceName, hostname, durationMs) {
    const settings = await chrome.storage.sync.get(['analyticsEnabled']);
    if (settings.analyticsEnabled === false) return;

    const result = await chrome.storage.local.get(['usageStats']);
    const usageStats = result.usageStats || {};
    const key = `${serviceName}_${hostname}`;
    
    if (!usageStats[key]) {
        usageStats[key] = {
            serviceName,
            hostname,
            totalDurationMs: 0,
            sessionCount: 0,
            lastUsed: Date.now(),
            firstUsed: Date.now()
        };
    }
    
    usageStats[key].totalDurationMs += durationMs;
    usageStats[key].sessionCount++;
    usageStats[key].lastUsed = Date.now();
    
    await chrome.storage.local.set({ usageStats });
}

// ============================================
// API COMMUNICATION
// ============================================

async function sendAnalyticsToAPI(usageStats, userId, retryCount = 0) {
    try {
        const aggregatedData = Object.values(usageStats).map(stat => ({
            serviceName: stat.serviceName,
            hostname: stat.hostname,
            totalDurationMs: stat.totalDurationMs,
            sessionCount: stat.sessionCount,
            lastUsed: stat.lastUsed,
            firstUsed: stat.firstUsed
        }));

        const browserInfo = getBrowserInfo();
        const response = await fetch(ANALYTICS_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                timestamp: Date.now(),
                browser: { name: browserInfo.name, version: browserInfo.version },
                usage: aggregatedData
            })
        });

        if (response.ok) return true;
        
        const isRetryable = (response.status >= 500 || response.status === 429) && retryCount < ANALYTICS_CONFIG.maxRetries;
        if (isRetryable) {
            await new Promise(resolve => setTimeout(resolve, ANALYTICS_CONFIG.retryDelay * Math.pow(2, retryCount)));
            return await sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }
        return false;
    } catch (error) {
        const isRetryable = (error.name === 'TypeError' || error.name === 'NetworkError') && retryCount < ANALYTICS_CONFIG.maxRetries;
        if (isRetryable) {
            await new Promise(resolve => setTimeout(resolve, ANALYTICS_CONFIG.retryDelay * Math.pow(2, retryCount)));
            return await sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }
        return false;
    }
}

async function processPendingAnalytics() {
    if (isProcessingAnalytics) return;
    
    isProcessingAnalytics = true;
    
    try {
        const settings = await chrome.storage.sync.get(['analyticsEnabled', 'userId']);
        if (settings.analyticsEnabled === false || !settings.userId) return;

        const result = await chrome.storage.local.get(['usageStats']);
        const usageStats = result.usageStats || {};
        if (Object.keys(usageStats).length === 0) return;

        const success = await sendAnalyticsToAPI(usageStats, settings.userId);
        if (success) {
            await chrome.storage.local.set({ usageStats: {} });
        }
    } catch (error) {
        console.error('[Analytics] ❌ Failed to process analytics:', error);
    } finally {
        isProcessingAnalytics = false;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    
    chrome.storage.sync.get(['analyticsEnabled'], async (result) => {
        if (result.analyticsEnabled === false || !tabId) {
            sendResponse({ success: false });
            return;
        }
        
        try {
            switch (message.type) {
                case 'SESSION_START':
                    await startSession(tabId, message.serviceName, message.hostname);
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
            console.error('[Analytics] ❌ Error handling message:', error);
            sendResponse({ success: false });
        }
    });
    
    return true;
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    activeSessions.forEach((session, tabId) => {
        if (tabId !== activeInfo.tabId) {
            pauseSession(tabId);
        } else {
            resumeSession(tabId);
        }
    });
});

chrome.tabs.onRemoved.addListener((tabId) => {
    endSession(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && activeSessions.has(tabId)) {
        const session = activeSessions.get(tabId);
        const newHostname = new URL(changeInfo.url).hostname;
        
        if (session.hostname !== newHostname) {
            await endSession(tabId);
        }
    }
});

chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.analyticsEnabled && changes.analyticsEnabled.newValue === false) {
        chrome.storage.local.set({ usageStats: {} });
    }
});

// ============================================
// INITIALIZATION
// ============================================

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        const userId = generateUserId();
        chrome.storage.sync.set({
            ...SERVICE_FLAGS,
            rtlAlgorithmMode: 'advanced_full',
            userId,
            analyticsEnabled: true
        });
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
            console.error('Chrome storage access failed during update:', error);
        }
    }
});
