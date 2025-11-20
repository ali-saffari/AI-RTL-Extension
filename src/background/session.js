// ============================================
// Analytics Session Management (Background)
// ============================================

import { processPendingAnalytics } from './analyticsApi.js';

const ANALYTICS_CONFIG = {
    minSessionDuration: 1000,
    maxSessionAge: 24 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000
};
const MAX_STORAGE_SIZE = 100 * 1024;

const activeSessions = new Map();
const trackedTabIds = new Set();
let cleanupTimer = null;

// ============================================
// Utility Functions
// ============================================

function sanitizeHostname(hostname) {
    if (!hostname || typeof hostname !== 'string') return 'unknown';
    return hostname.toLowerCase().replace(/[^a-z0-9.-]/g, '').substring(0, 255);
}

function sanitizeServiceName(serviceName) {
    if (!serviceName || typeof serviceName !== 'string') return 'unknown';
    return serviceName.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 50);
}

// ============================================
// Session Management
// ============================================

export async function startSession(tabId, serviceName, hostname) {
    if (!tabId || typeof tabId !== 'number' || tabId <= 0) return;
    
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

export function pauseSession(tabId) {
    if (!tabId) return;
    const session = activeSessions.get(tabId);
    if (!session || session.isPaused) return;
    
    session.isPaused = true;
    session.lastPauseTime = Date.now();
    console.log('[Analytics] ⏸️ Session paused', { tabId, service: session.serviceName });
}

export function resumeSession(tabId) {
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

export async function endSession(tabId) {
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
    }
}

// ============================================
// Storage
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

        await chrome.storage.local.set({ usageStats });
        console.log('[Analytics] 💾 Usage stored', { service: serviceName, hostname, durationMs, key });

        if (dataSize >= MAX_STORAGE_SIZE) {
            processPendingAnalytics().catch(() => {});
        }
        if (dataSize >= MAX_STORAGE_SIZE) {
            console.log('[Analytics] ⚠️ Usage cache near limit, flushing');
        }
        processPendingAnalytics().catch(() => {});
    } catch (error) {
        console.log('[Analytics] ⚠️ Storage warning:', error.message);
    }
}

// ============================================
// Cleanup
// ============================================

export async function cleanupOrphanedSessions() {
    try {
        const now = Date.now();
        const sessionsToEnd = [];
        
        activeSessions.forEach((session, tabId) => {
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

export function startCleanupTimer() {
    if (cleanupTimer) clearInterval(cleanupTimer);
    cleanupTimer = setInterval(() => {
        cleanupOrphanedSessions();
    }, ANALYTICS_CONFIG.cleanupInterval);
}

// ============================================
// Exports
// ============================================

export { trackedTabIds, activeSessions };


