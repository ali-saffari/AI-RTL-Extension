const chatGpt = true;
const claude = true;
const copilot = true;
const githubCopilot = true;
const duckduckgo = true;
const perplexity = true;
const aiStudio = true;
const deepseek = true;
const youCom = true;
const qwenlm = true;
const poeCom = true;
const monica = true;
const gemini = true;
const grok = true;
const mistral = true;
const manus = true;
const kimi = true;
const blackbox = true;
const notebooklm = true;
const zai = true;
const lmarena = true;
const openrouter = true;
const minimax = true;

// تابع برای تولید User ID یکتا
function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const extensionId = chrome.runtime.id || 'rtl-ext';
    return `${extensionId}-${timestamp}-${randomPart}`;
}

// تنظیمات API Analytics
const ANALYTICS_CONFIG = {
    apiEndpoint: 'https://api.chatgpt-rtl.ir/api/analytics',
    batchInterval: 5 * 60 * 1000, // ارسال هر 5 دقیقه (میلی‌ثانیه)
    maxRetries: 3, // تعداد تلاش‌های مجدد برای ارسال
    retryDelay: 1000, // تاخیر بین تلاش‌های مجدد (میلی‌ثانیه)
    minSessionDuration: 1000 // حداقل مدت زمان session برای ثبت (میلی‌ثانیه)
};

// ذخیره sessions فعال - Map<tabId, {serviceName, hostname, startTime, tabId}>
const activeSessions = new Map();

// تابع برای تشخیص نام و نسخه مرورگر
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    // Chrome/Chromium
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR') && !userAgent.includes('Brave')) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }
    // Edge
    else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/(\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }
    // Opera
    else if (userAgent.includes('OPR')) {
        browserName = 'Opera';
        const match = userAgent.match(/OPR\/(\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }
    // Brave
    else if (userAgent.includes('Brave')) {
        browserName = 'Brave';
        const match = userAgent.match(/Chrome\/(\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }
    
    return {
        name: browserName,
        version: browserVersion
    };
}

// ذخیره مدت زمان استفاده در storage محلی
async function storeUsageDuration(serviceName, hostname, durationMs) {
    try {
        // بررسی اینکه analytics فعال است یا نه
        const settings = await chrome.storage.sync.get(['analyticsEnabled']);
        if (settings.analyticsEnabled === false) {
            return;
        }

        const result = await chrome.storage.local.get(['usageStats']);
        let usageStats = result.usageStats || {};
        
        // کلید ترکیبی از serviceName و hostname
        const key = `${serviceName}_${hostname}`;
        
        if (!usageStats[key]) {
            usageStats[key] = {
                serviceName: serviceName,
                hostname: hostname,
                totalDurationMs: 0, // مجموع مدت زمان استفاده (میلی‌ثانیه)
                sessionCount: 0, // تعداد sessionها
                lastUsed: Date.now(),
                firstUsed: Date.now()
            };
        }
        
        // اضافه کردن مدت زمان جدید
        usageStats[key].totalDurationMs += durationMs;
        usageStats[key].sessionCount++;
        usageStats[key].lastUsed = Date.now();
        
        await chrome.storage.local.set({ usageStats: usageStats });
        
        console.log('[Analytics] ✅ Usage duration stored:', {
            service: serviceName,
            hostname: hostname,
            durationMs: durationMs,
            durationSeconds: Math.round(durationMs / 1000),
            totalDurationMs: usageStats[key].totalDurationMs,
            totalDurationMinutes: Math.round(usageStats[key].totalDurationMs / 60000),
            sessionCount: usageStats[key].sessionCount
        });
    } catch (error) {
        console.error('[Analytics] ❌ Failed to store usage duration:', error);
    }
}

/**
 * شروع یک session جدید
 */
async function startSession(tabId, serviceName, hostname) {
    try {
        // اگر session قبلی برای این tab وجود داشت، آن را پایان بده
        if (activeSessions.has(tabId)) {
            await endSession(tabId);
        }
        
        const startTime = Date.now();
        activeSessions.set(tabId, {
            serviceName: serviceName,
            hostname: hostname,
            startTime: startTime,
            totalPausedTime: 0,
            lastPauseTime: 0,
            isPaused: false,
            tabId: tabId
        });
        
        console.log('[Analytics] ▶️ Session started:', {
            tabId: tabId,
            service: serviceName,
            hostname: hostname,
            startTime: new Date(startTime).toISOString()
        });
    } catch (error) {
        console.error('[Analytics] ❌ Failed to start session:', error);
    }
}

/**
 * Pause کردن یک session (مثلاً وقتی تب hidden می‌شود)
 */
function pauseSession(tabId) {
    try {
        const session = activeSessions.get(tabId);
        if (!session || session.isPaused) {
            return; // session وجود ندارد یا قبلاً pause شده
        }
        
        session.isPaused = true;
        session.lastPauseTime = Date.now();
        
        console.log('[Analytics] ⏸️ Session paused:', {
            tabId: tabId,
            service: session.serviceName,
            pauseTime: new Date(session.lastPauseTime).toISOString()
        });
    } catch (error) {
        console.error('[Analytics] ❌ Failed to pause session:', error);
    }
}

/**
 * Resume کردن یک session (مثلاً وقتی تب دوباره visible می‌شود)
 */
function resumeSession(tabId) {
    try {
        const session = activeSessions.get(tabId);
        if (!session || !session.isPaused) {
            return; // session وجود ندارد یا pause نشده
        }
        
        // محاسبه زمان pause و اضافه کردن به totalPausedTime
        if (session.lastPauseTime > 0) {
            const pauseDuration = Date.now() - session.lastPauseTime;
            session.totalPausedTime += pauseDuration;
            session.lastPauseTime = 0;
        }
        
        session.isPaused = false;
        
        console.log('[Analytics] ▶️ Session resumed:', {
            tabId: tabId,
            service: session.serviceName,
            totalPausedTime: session.totalPausedTime,
            resumeTime: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Analytics] ❌ Failed to resume session:', error);
    }
}

/**
 * پایان یک session و ذخیره duration
 */
async function endSession(tabId) {
    try {
        const session = activeSessions.get(tabId);
        if (!session) {
            return; // session وجود ندارد یا قبلاً end شده
        }
        
        // اگر session pause شده، ابتدا resume کن
        if (session.isPaused && session.lastPauseTime > 0) {
            const pauseDuration = Date.now() - session.lastPauseTime;
            session.totalPausedTime += pauseDuration;
        }
        
        // جلوگیری از duplicate end - حذف session قبل از پردازش
        activeSessions.delete(tabId);
        
        const endTime = Date.now();
        // محاسبه duration واقعی (بدون زمان pause)
        const durationMs = endTime - session.startTime - session.totalPausedTime;
        
        // فقط اگر مدت زمان بیشتر از حداقل باشد
        if (durationMs >= ANALYTICS_CONFIG.minSessionDuration) {
            await storeUsageDuration(
                session.serviceName,
                session.hostname,
                durationMs
            );
            
            console.log('[Analytics] ⏹️ Session ended:', {
                tabId: tabId,
                service: session.serviceName,
                hostname: session.hostname,
                totalDuration: endTime - session.startTime,
                activeDuration: durationMs,
                pausedDuration: session.totalPausedTime,
                durationSeconds: Math.round(durationMs / 1000)
            });
            
            // ارسال فوری داده‌ها بعد از بسته شدن session
            console.log('[Analytics] 🚀 Triggering immediate send after session end...');
            processPendingAnalytics().catch(error => {
                console.error('[Analytics] ❌ Failed to send analytics after session end:', error);
            });
        } else {
            console.log('[Analytics] ⏭️ Session too short, skipping:', {
                tabId: tabId,
                activeDuration: durationMs,
                minDuration: ANALYTICS_CONFIG.minSessionDuration
            });
        }
    } catch (error) {
        console.error('[Analytics] ❌ Failed to end session:', error);
    }
}

// ارسال داده‌های analytics به API با retry mechanism
async function sendAnalyticsToAPI(usageStats, userId, retryCount = 0) {
    try {
        // تبدیل usageStats به فرمت مناسب برای ارسال
        // usageStats یک object است با کلیدهای serviceName_hostname
        const aggregatedData = Object.values(usageStats).map(stat => ({
            serviceName: stat.serviceName,
            hostname: stat.hostname,
            totalDurationMs: stat.totalDurationMs,
            totalDurationMinutes: Math.round(stat.totalDurationMs / 60000),
            totalDurationHours: Math.round(stat.totalDurationMs / 3600000 * 100) / 100,
            sessionCount: stat.sessionCount,
            lastUsed: stat.lastUsed,
            firstUsed: stat.firstUsed
        }));

        console.log('[Analytics] 📤 Starting to send analytics data:', {
            servicesCount: aggregatedData.length,
            userId: userId,
            endpoint: ANALYTICS_CONFIG.apiEndpoint,
            attempt: retryCount + 1,
            maxRetries: ANALYTICS_CONFIG.maxRetries
        });

        // دریافت اطلاعات مرورگر
        const browserInfo = getBrowserInfo();
        
        const payload = {
            userId: userId,
            timestamp: Date.now(),
            browser: {
                name: browserInfo.name,
                version: browserInfo.version
            },
            usage: aggregatedData
        };

        console.log('[Analytics] 📊 Aggregated data:', {
            servicesCount: aggregatedData.length,
            browser: browserInfo
        });

        const response = await fetch(ANALYTICS_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('[Analytics] ✅ Data sent successfully to API:', {
                status: response.status,
                servicesCount: aggregatedData.length
            });
            return true;
        } else {
            // خطاهای موقت (5xx) قابل retry هستند
            const isRetryableError = response.status >= 500 || response.status === 429;
            
            console.error('[Analytics] ❌ API error:', {
                status: response.status,
                statusText: response.statusText,
                endpoint: ANALYTICS_CONFIG.apiEndpoint,
                isRetryable: isRetryableError,
                retryCount: retryCount
            });

            // اگر خطا قابل retry است و تعداد تلاش‌ها کمتر از maxRetries است
            if (isRetryableError && retryCount < ANALYTICS_CONFIG.maxRetries) {
                const delay = ANALYTICS_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
                console.log(`[Analytics] 🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/${ANALYTICS_CONFIG.maxRetries})`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return await sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
            }
            
            return false;
        }
    } catch (error) {
        // خطاهای شبکه قابل retry هستند
        const isRetryableError = error.name === 'TypeError' || error.name === 'NetworkError';
        
        console.error('[Analytics] ❌ Failed to send analytics:', {
            error: error.message,
            errorName: error.name,
            endpoint: ANALYTICS_CONFIG.apiEndpoint,
            isRetryable: isRetryableError,
            retryCount: retryCount,
            stack: error.stack
        });

        // اگر خطا قابل retry است و تعداد تلاش‌ها کمتر از maxRetries است
        if (isRetryableError && retryCount < ANALYTICS_CONFIG.maxRetries) {
            const delay = ANALYTICS_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
            console.log(`[Analytics] 🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/${ANALYTICS_CONFIG.maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return await sendAnalyticsToAPI(usageStats, userId, retryCount + 1);
        }
        
        return false;
    }
}

// Flag برای جلوگیری از ارسال همزمان
let isProcessingAnalytics = false;
let pendingProcessRequest = false;

// ارسال دوره‌ای داده‌ها به API
async function processPendingAnalytics() {
    // اگر در حال پردازش هستیم، flag را set کن و بعد از اتمام پردازش، دوباره تلاش کن
    if (isProcessingAnalytics) {
        console.log('[Analytics] ⏳ Already processing, will retry after current process...');
        pendingProcessRequest = true;
        return;
    }
    
    isProcessingAnalytics = true;
    pendingProcessRequest = false;
    
    try {
        console.log('[Analytics] 🔄 Processing pending analytics...');
        
        // بررسی اینکه analytics فعال است یا نه
        const settings = await chrome.storage.sync.get(['analyticsEnabled', 'userId']);
        
        if (settings.analyticsEnabled === false) {
            console.log('[Analytics] ⏸️ Analytics is disabled, skipping...');
            return; // Analytics disabled
        }

        const userId = settings.userId;
        if (!userId) {
            console.log('[Analytics] ⚠️ No user ID found, skipping...');
            return; // No user ID yet
        }

        const result = await chrome.storage.local.get(['usageStats']);
        const usageStats = result.usageStats || {};

        // بررسی اینکه آیا داده‌ای برای ارسال وجود دارد
        const statsKeys = Object.keys(usageStats);
        if (statsKeys.length === 0) {
            console.log('[Analytics] 📊 No usage stats to send');
            return;
        }

        console.log('[Analytics] 📈 Current usage stats:', {
            servicesCount: statsKeys.length,
            willSend: true
        });

        // ارسال داده‌ها
        const success = await sendAnalyticsToAPI(usageStats, userId);
        
        // اگر ارسال موفق بود، داده‌های ارسال شده را پاک می‌کنیم
        if (success) {
            await chrome.storage.local.set({ usageStats: {} });
            console.log('[Analytics] ✅ Usage stats cleared after successful send');
        } else {
            console.log('[Analytics] 📦 Data send failed, keeping stats for next attempt');
        }
    } catch (error) {
        console.error('[Analytics] ❌ Failed to process analytics:', error);
    } finally {
        isProcessingAnalytics = false;
        
        // اگر درخواست دیگری pending بود، دوباره پردازش کن
        if (pendingProcessRequest) {
            console.log('[Analytics] 🔄 Processing pending request...');
            setTimeout(() => processPendingAnalytics(), 100); // تاخیر کوتاه برای جلوگیری از race condition
        }
    }
}

// تنظیم interval برای ارسال دوره‌ای
let analyticsInterval = null;

function startAnalyticsInterval() {
    if (analyticsInterval) {
        console.log('[Analytics] 🔄 Restarting analytics interval...');
        clearInterval(analyticsInterval);
    } else {
        console.log('[Analytics] ▶️ Starting analytics interval...');
    }
    
    analyticsInterval = setInterval(() => {
        console.log('[Analytics] ⏰ Interval triggered, processing analytics...');
        processPendingAnalytics();
    }, ANALYTICS_CONFIG.batchInterval);
    
    console.log('[Analytics] ✅ Analytics interval started:', {
        interval: ANALYTICS_CONFIG.batchInterval / 1000 + ' seconds'
    });
    
    // اولین بار بعد از 30 ثانیه
    setTimeout(() => {
        console.log('[Analytics] 🚀 First analytics check (30 seconds after start)...');
        processPendingAnalytics();
    }, 30000);
}

function stopAnalyticsInterval() {
    if (analyticsInterval) {
        console.log('[Analytics] ⏹️ Stopping analytics interval...');
        clearInterval(analyticsInterval);
        analyticsInterval = null;
        console.log('[Analytics] ✅ Analytics interval stopped');
    }
}

// شروع interval در صورت فعال بودن analytics
chrome.storage.sync.get(['analyticsEnabled'], (result) => {
    console.log('[Analytics] 🔍 Checking analytics status on startup:', {
        analyticsEnabled: result.analyticsEnabled !== false
    });
    
    if (result.analyticsEnabled !== false) {
        startAnalyticsInterval();
    } else {
        console.log('[Analytics] ⏸️ Analytics is disabled, interval not started');
    }
});

// گوش دادن به تغییرات analyticsEnabled
chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.analyticsEnabled) {
        const newValue = changes.analyticsEnabled.newValue;
        const oldValue = changes.analyticsEnabled.oldValue;
        
        console.log('[Analytics] 🔄 Analytics setting changed:', {
            oldValue: oldValue,
            newValue: newValue
        });
        
        if (newValue === false) {
            console.log('[Analytics] ⏸️ Analytics disabled by user');
            stopAnalyticsInterval();
            // پاک کردن داده‌های pending در صورت غیرفعال شدن
            chrome.storage.local.set({ usageStats: {} }, () => {
                console.log('[Analytics] 🗑️ Pending analytics data cleared');
            });
        } else {
            console.log('[Analytics] ▶️ Analytics enabled by user');
            startAnalyticsInterval();
        }
    }
});

// گوش دادن به پیام‌های tracking از content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    
    // بررسی اینکه analytics فعال است یا نه
    chrome.storage.sync.get(['analyticsEnabled'], async (result) => {
        if (result.analyticsEnabled === false) {
            console.log('[Analytics] ⏸️ Analytics disabled, ignoring message:', message.type);
            sendResponse({ success: false, reason: 'analytics_disabled' });
            return;
        }
        
        if (!tabId) {
            console.error('[Analytics] ❌ No tab ID for message:', message.type);
            sendResponse({ success: false, reason: 'no_tab_id' });
            return;
        }
        
        try {
            switch (message.type) {
                case 'SESSION_START':
                    await startSession(tabId, message.serviceName, message.hostname);
                    sendResponse({ success: true });
                    break;
                    
                case 'SESSION_PAUSE':
                    pauseSession(tabId);
                    sendResponse({ success: true });
                    break;
                    
                case 'SESSION_RESUME':
                    resumeSession(tabId);
                    sendResponse({ success: true });
                    break;
                    
                case 'SESSION_END':
                    await endSession(tabId);
                    sendResponse({ success: true });
                    break;
                    
                default:
                    console.warn('[Analytics] ⚠️ Unknown message type:', message.type);
                    sendResponse({ success: false, reason: 'unknown_message_type' });
            }
        } catch (error) {
            console.error('[Analytics] ❌ Error handling message:', error);
            sendResponse({ success: false, reason: 'error', error: error.message });
        }
    });
    
    return true; // برای async response
});

// گوش دادن به تغییرات تب برای پایان دادن به sessions
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // وقتی تب جدید فعال می‌شود، تب‌های دیگر را pause کنیم
    // (نه end، چون ممکن است کاربر دوباره برگردد)
    const allTabs = await chrome.tabs.query({});
    allTabs.forEach(tab => {
        if (tab.id !== activeInfo.tabId && activeSessions.has(tab.id)) {
            // تب‌های غیرفعال را pause کنیم
            pauseSession(tab.id);
        }
    });
    
    // تب فعال را resume کنیم (اگر session دارد)
    if (activeSessions.has(activeInfo.tabId)) {
        resumeSession(activeInfo.tabId);
    }
});

// گوش دادن به بسته شدن تب
chrome.tabs.onRemoved.addListener((tabId) => {
    // پایان دادن به session تب بسته شده
    endSession(tabId);
});

// گوش دادن به تغییر URL تب
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // اگر URL تغییر کرد و session فعالی برای این tab وجود دارد
    if (changeInfo.url && activeSessions.has(tabId)) {
        const session = activeSessions.get(tabId);
        const newHostname = new URL(changeInfo.url).hostname;
        
        // اگر hostname تغییر کرد، session قبلی را end کنیم
        if (session.hostname !== newHostname) {
            await endSession(tabId);
        }
    }
});







chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // تولید User ID یکتا برای کاربر جدید
        const userId = generateUserId();
        
        // در نصب اولیه، مقادیر پیش‌فرض را تنظیم می‌کنیم
        chrome.storage.sync.set({
            chatGpt, claude, copilot, githubCopilot,
            duckduckgo, perplexity,
            aiStudio, deepseek, youCom, qwenlm, poeCom, monica, gemini, grok, mistral, manus, kimi, blackbox, notebooklm, zai, lmarena, openrouter, minimax,
            rtlAlgorithmMode: 'advanced_full',
            userId: userId,
            analyticsEnabled: true // Analytics به صورت پیش‌فرض فعال است
        });
        console.log('Default values set on installation');
        console.log('User ID generated:', userId);
    } else if (details.reason === 'update') {
        // در صورت به‌روزرسانی، بررسی می‌کنیم که مقادیر duckduckgo و perplexity وجود دارند یا خیر
        try {
            chrome.storage.sync.get((storedData) => {
            const updates = {};

            // اگر duckduckgo وجود نداشت، اضافه کنیم
            if (!storedData.hasOwnProperty('duckduckgo')) {
                updates.duckduckgo = true;
            }

            // اگر perplexity وجود نداشت، اضافه کنیم
            if (!storedData.hasOwnProperty('perplexity')) {
                updates.perplexity = true;
            }

            if (!storedData.hasOwnProperty('aiStudio')) {
                updates.aiStudio = true;
            }
            if (!storedData.hasOwnProperty('deepseek')) {
                updates.deepseek = true;
            }
            if (!storedData.hasOwnProperty('youCom')) {
                updates.youCom = true;
            }
            if (!storedData.hasOwnProperty('qwenlm')) {
                updates.qwenlm = true;
            }
            if (!storedData.hasOwnProperty('poeCom')) {
                updates.poeCom = true;
            }
            if (!storedData.hasOwnProperty('monica')) {
                updates.monica = true;
            }
            if (!storedData.hasOwnProperty('gemini')) {
                updates.gemini = true;
            }
            if (!storedData.hasOwnProperty('grok')) {
                updates.grok = true;
            }

            if (!storedData.hasOwnProperty('mistral')) {
                updates.mistral = true;
            }
            if (!storedData.hasOwnProperty('manus')) {
                updates.manus = true;
            }

            if (!storedData.hasOwnProperty('kimi')) {
                updates.kimi = true;
            }
            if (!storedData.hasOwnProperty('blackbox')) {
                updates.blackbox = true;
            }
            if (!storedData.hasOwnProperty('notebooklm')) {
                updates.notebooklm = true;
            }
            if (!storedData.hasOwnProperty('zai')) {
                updates.zai = true;
            }
            if (!storedData.hasOwnProperty('lmarena')) {
                updates.lmarena = true;
            }
            if (!storedData.hasOwnProperty('openrouter')) {
                updates.openrouter = true;
            }
            if (!storedData.hasOwnProperty('minimax')) {
                updates.minimax = true;
            }
            if (!storedData.hasOwnProperty('githubCopilot')) {
                updates.githubCopilot = true;
            }

            // اگر rtlAlgorithmMode وجود نداشت، اضافه کنیم
            if (!storedData.hasOwnProperty('rtlAlgorithmMode')) {
                // اگر rtlAlgorithm قدیمی وجود دارد و first_word است، آن را حفظ کنیم
                if (storedData.hasOwnProperty('rtlAlgorithm') && storedData.rtlAlgorithm === 'first_word') {
                    updates.rtlAlgorithmMode = 'first_word';
                } else {
                    updates.rtlAlgorithmMode = 'advanced_full';
                }
            }

            // اگر userId وجود نداشت، یک User ID یکتا تولید کنیم
            if (!storedData.hasOwnProperty('userId') || !storedData.userId) {
                updates.userId = generateUserId();
                console.log('User ID generated during update:', updates.userId);
            }

            // اگر analyticsEnabled وجود نداشت، مقدار پیش‌فرض را تنظیم کنیم
            if (!storedData.hasOwnProperty('analyticsEnabled')) {
                updates.analyticsEnabled = true;
            }

            // اگر چیزی برای به‌روزرسانی وجود داشت، ذخیره کنیم
            if (Object.keys(updates).length > 0) {
                chrome.storage.sync.set(updates, () => {
                    console.log('Missing values added during update:', updates);
                });
            } else {
                console.log('All values already exist:', storedData);
            }
        });
        } catch (error) {
            console.log('Chrome storage access failed during update:', error);
        }
    }
});
