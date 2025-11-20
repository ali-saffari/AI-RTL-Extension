// ============================================
// Analytics API Communication
// ============================================

const ANALYTICS_API_CONFIG = {
    apiEndpoint: 'https://api.chatgpt-rtl.ir/api/analytics',
    maxRetries: 3,
    retryDelay: 1000,
    fetchTimeout: 10000
};

let isProcessingAnalytics = false;

function sanitize(value, type = 'string', maxLength = 100) {
    if (typeof value === 'undefined' || value === null) return type === 'number' ? 0 : 'unknown';
    if (type === 'number') {
        const num = Number(value);
        return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
    }
    return String(value).substring(0, maxLength);
}

async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
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
            serviceName: sanitize(stat.serviceName, 'string', 50),
            hostname: sanitize(stat.hostname, 'string', 255),
            totalDurationMs: sanitize(stat.totalDurationMs, 'number'),
            sessionCount: sanitize(stat.sessionCount, 'number'),
            lastUsed: sanitize(stat.lastUsed, 'number'),
            firstUsed: sanitize(stat.firstUsed, 'number')
        }));

        if (aggregatedData.length === 0) return true;

        const payload = {
            userId: sanitize(userId, 'string', 100),
            timestamp: Date.now(),
            browser: {
                name: sanitize(navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|OPR)/)?.[0] || 'Unknown', 'string', 50),
                version: sanitize(navigator.userAgent.match(/(?:Chrome|Firefox|Version|Edge|OPR)\/(\d+)/)?.[1] || 'Unknown', 'string', 20)
            },
            usage: aggregatedData
        };

        const response = await fetchWithTimeout(
            ANALYTICS_API_CONFIG.apiEndpoint,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            },
            ANALYTICS_API_CONFIG.fetchTimeout
        );

        if (response.ok) {
            console.log('[Analytics] ✅ Analytics sent successfully', { itemsCount: aggregatedData.length });
            return true;
        }

        const isRetryableStatus = response.status >= 500 || response.status === 429;
        if (isRetryableStatus && retryCount < ANALYTICS_API_CONFIG.maxRetries) {
            const delay = ANALYTICS_API_CONFIG.retryDelay * Math.pow(2, retryCount);
            console.log('[Analytics] 🔄 Retrying', { status: response.status, retryCount, delay });
            await new Promise(resolve => setTimeout(resolve, delay));
            return sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }

        console.log('[Analytics] ⚠️ Send failed', { status: response.status, retryCount });
        return false;
    } catch (error) {
        const isRetryableError = ['TypeError', 'NetworkError', 'AbortError'].includes(error.name);
        if (isRetryableError && retryCount < ANALYTICS_API_CONFIG.maxRetries) {
            const delay = ANALYTICS_API_CONFIG.retryDelay * Math.pow(2, retryCount);
            console.log('[Analytics] 🔄 Retrying after error', { error: error.name, retryCount, delay });
            await new Promise(resolve => setTimeout(resolve, delay));
            return sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }

        console.log('[Analytics] ⚠️ Send failed permanently', { error: error.name, retryCount });
        return false;
    }
}

export async function processPendingAnalytics() {
    if (isProcessingAnalytics) {
        console.log('[Analytics] ⏳ Already processing, skipping');
        return;
    }

    isProcessingAnalytics = true;

    try {
        const settings = await chrome.storage.sync.get(['analyticsEnabled', 'uid']);
        if (settings.analyticsEnabled === false || !settings.uid) {
            console.log('[Analytics] ⏸️ Analytics disabled or no uid');
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
        const success = await sendAnalyticsToAPI(usageStats, settings.uid);

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

