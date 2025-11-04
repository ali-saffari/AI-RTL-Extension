// Main content script - orchestrates all services

import { activateChatGptRTL as activateChatGpt } from './services/chatgpt.js';
import { activateClaude } from './services/claude.js';
import { activateCopilot } from './services/copilot.js';
import { activateGitHubCopilot } from './services/github-copilot.js';
import { activateBlackbox } from './services/blackbox.js';
import { activateKimi } from './services/kimi.js';
import { activateManus } from './services/manus.js';
import { activateMistral } from './services/mistral.js';
import { activateGrok } from './services/grok.js';
import { activateGemini } from './services/gemini.js';
import { activateMonica } from './services/monica.js';
import { activatePoe } from './services/poe.js';
import { activatePerplexity } from './services/perplexity.js';
import { activateDuckduckgo } from './services/duckduckgo.js';
import { activateAistudio } from './services/aistudio.js';
import { activateDeepSeek } from './services/deepseek.js';
import { activateYoucom } from './services/youcom.js';
import { activateQwen } from './services/qwen.js';
import { activateNotebooklm } from './services/notebooklm.js';
import { activateZai } from './services/zai.js';
import { activateLmarena } from './services/lmarena.js';
import { activateOpenRouter } from './services/openrouter.js';
import { activateMinimax } from './services/minimax.js';

// Global variables
let site = window.location.hostname;
let lastTrackedService = null;

// Listen for storage changes
chrome.storage.sync.onChanged.addListener((changes) => {
    // Check for RTL algorithm changes
    if (changes.rtlAlgorithm) {
        location.reload();
        return;
    }
    
    if (changes.rtlAlgorithmMode) {
        location.reload();
        return;
    }


    // Check for supportHide changes
    if (changes.supportHide) {
        location.reload();
        return;
    }
    
    // Check for service enable/disable changes
    Object.keys(serviceConfig).forEach(serviceKey => {
        if (changes[serviceKey]) {
            const config = serviceConfig[serviceKey];
            const isCurrent = isCurrentSite(config.urls);
            
            if (isCurrent) {
                location.reload();
                return;
            }
        }
    });
});


// Service configuration with their activation functions
const serviceConfig = {
    chatGpt: {
        urls: ["chatgpt.com"],
        activate: activateChatGpt
    },
    claude: {
        urls: ["claude.ai"],
        activate: activateClaude
    },
    copilot: {
        urls: ["copilot.microsoft.com", "bing.com", "www.bing.com"],
        activate: activateCopilot
    },
    githubCopilot: {
        urls: ["github.com"],
        activate: activateGitHubCopilot
    },
    perplexity: {
        urls: ["perplexity.ai", "www.perplexity.ai"],
        activate: activatePerplexity
    },
    duckduckgo: {
        urls: ["duckduckgo.com"],
        activate: activateDuckduckgo
    },
    aiStudio: {
        urls: ["aistudio.google.com"],
        activate: activateAistudio
    },
    deepseek: {
        urls: ["chat.deepseek.com"],
        activate: activateDeepSeek
    },
    youCom: {
        urls: ["you.com"],
        activate: activateYoucom
    },
    qwenlm: {
        urls: ["chat.qwenlm.ai", "chat.qwen.ai"],
        activate: activateQwen
    },
    poeCom: {
        urls: ["poe.com"],
        activate: activatePoe
    },
    monica: {
        urls: ["monica.im"],
        activate: activateMonica
    },
    gemini: {
        urls: ["gemini.google.com"],
        activate: activateGemini
    },
    grok: {
        urls: ["grok.com"],
        activate: activateGrok
    },
    mistral: {
        urls: ["chat.mistral.ai"],
        activate: activateMistral
    },
    manus: {
        urls: ["manus.im"],
        activate: activateManus
    },
    kimi: {
        urls: ["www.kimi.com"],
        activate: activateKimi
    },
    blackbox: {
        urls: ["www.blackbox.ai"],
        activate: activateBlackbox
    },
    notebooklm: {
        urls: ["notebooklm.google.com"],
        activate: activateNotebooklm
    },
    zai: {
        urls: ["chat.z.ai"],
        activate: activateZai
    },
    lmarena: {
        urls: ["lmarena.ai"],
        activate: activateLmarena
    },
    openrouter: {
        urls: ["openrouter.ai"],
        activate: activateOpenRouter
    },
    minimax: {
        urls: ["agent.minimax.io"],
        activate: activateMinimax
    }
};

// Check if current site matches service URLs
function isCurrentSite(urls) {
    if (Array.isArray(urls)) {
        return urls.some(url => {
            if (url === "github.com") {
                return site === "github.com" && window.location.pathname.startsWith('/copilot');
            }
            return url === site;
        });
    }
    return urls === site;
}

// ============================================
// سیستم مدیریت Session برای Analytics
// ============================================

class SessionManager {
    constructor() {
        this.currentService = null;
        this.currentHostname = null;
        this.isActive = false;
        this.isPaused = false;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        this.initialized = false;
        this.analyticsEnabled = true;
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            // Check analytics setting
            const settings = await chrome.storage.sync.get(['analyticsEnabled']);
            this.analyticsEnabled = settings.analyticsEnabled !== false;
            
            if (!this.analyticsEnabled) {
                console.log('[Analytics] ⏸️ Analytics is disabled');
                return;
            }
            
            // Setup event listeners
            this.setupEventListeners();
            this.initialized = true;
            
            console.log('[Analytics] ✅ Session manager initialized');
        } catch (error) {
            console.error('[Analytics] ❌ Failed to initialize session manager:', error);
        }
    }
    
    setupEventListeners() {
        // Visibility change - وقتی تب visible/hidden می‌شود
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.resume();
            } else if (document.visibilityState === 'hidden') {
                this.pause();
            }
        });
        
        // Window focus/blur - وقتی window focus می‌گیرد یا از دست می‌دهد
        window.addEventListener('focus', () => this.resume());
        window.addEventListener('blur', () => this.pause());
        
        // Page unload - وقتی صفحه unload می‌شود
        window.addEventListener('beforeunload', () => {
            this.stop();
        });
        
        // Page show/hide - برای back/forward navigation
        window.addEventListener('pageshow', () => {
            if (this.currentService) {
                this.resume();
            }
        });
        
        window.addEventListener('pagehide', () => {
            this.pause();
        });
        
        console.log('[Analytics] 📡 Event listeners setup complete');
    }
    
    async start(serviceKey, hostname) {
        // اگر analytics غیرفعال است
        if (!this.analyticsEnabled) {
            return;
        }
        
        // اگر همان service قبلاً active است، کاری نکن
        if (this.isActive && this.currentService === serviceKey && this.currentHostname === hostname) {
            return;
        }
        
        // اگر session دیگری active است، اول آن را stop کن
        if (this.isActive) {
            await this.stop();
        }
        
        // شروع session جدید
        this.currentService = serviceKey;
        this.currentHostname = hostname;
        this.isActive = true;
        this.isPaused = false;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        
        try {
            // ارسال پیام به background script
            await chrome.runtime.sendMessage({
                type: 'SESSION_START',
                serviceName: serviceKey,
                hostname: hostname
            });
            
            console.log('[Analytics] ▶️ Session started:', {
                service: serviceKey,
                hostname: hostname,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[Analytics] ❌ Failed to start session:', error);
            // Reset state on error
            this.isActive = false;
            this.currentService = null;
            this.currentHostname = null;
        }
    }
    
    async pause() {
        // اگر session active نیست یا قبلاً pause شده، کاری نکن
        if (!this.isActive || this.isPaused) {
            return;
        }
        
        this.isPaused = true;
        this.lastPauseTime = Date.now();
        
        try {
            await chrome.runtime.sendMessage({
                type: 'SESSION_PAUSE'
            });
            
            console.log('[Analytics] ⏸️ Session paused:', {
                service: this.currentService,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[Analytics] ❌ Failed to pause session:', error);
        }
    }
    
    async resume() {
        // اگر session active نیست یا pause نشده، کاری نکن
        if (!this.isActive || !this.isPaused) {
            return;
        }
        
        // محاسبه زمان pause
        if (this.lastPauseTime > 0) {
            this.pausedTime += Date.now() - this.lastPauseTime;
            this.lastPauseTime = 0;
        }
        
        this.isPaused = false;
        
        try {
            await chrome.runtime.sendMessage({
                type: 'SESSION_RESUME'
            });
            
            console.log('[Analytics] ▶️ Session resumed:', {
                service: this.currentService,
                pausedDuration: this.pausedTime,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[Analytics] ❌ Failed to resume session:', error);
        }
    }
    
    async stop() {
        // اگر session active نیست، کاری نکن
        if (!this.isActive) {
            return;
        }
        
        const service = this.currentService;
        const hostname = this.currentHostname;
        
        // Reset state
        this.isActive = false;
        this.isPaused = false;
        this.currentService = null;
        this.currentHostname = null;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        
        try {
            await chrome.runtime.sendMessage({
                type: 'SESSION_END'
            });
            
            console.log('[Analytics] ⏹️ Session stopped:', {
                service: service,
                hostname: hostname,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[Analytics] ❌ Failed to stop session:', error);
        }
    }
    
    async updateService(serviceKey, hostname) {
        // اگر service تغییر کرده، session را restart کن
        if (this.currentService !== serviceKey || this.currentHostname !== hostname) {
            await this.stop();
            await this.start(serviceKey, hostname);
        }
    }
}

// ایجاد instance از SessionManager
const sessionManager = new SessionManager();

// Legacy functions for backward compatibility
async function startUsageSession(serviceKey) {
    await sessionManager.start(serviceKey, site);
}

async function endUsageSession() {
    await sessionManager.stop();
}

// Initialize all services
async function initializeAllServices() {
    const serviceKeys = Object.keys(serviceConfig);
    let results = {};
    let rtlAlgorithm = 'advanced_full';
    
    try {
        results = await chrome.storage.sync.get([...serviceKeys, 'rtlAlgorithmMode']);
        rtlAlgorithm = results.rtlAlgorithmMode || 'advanced_full';
    } catch (error) {
        // Extension context invalidated or other error - use default values
        console.log('Chrome storage access failed, using default values:', error);
        rtlAlgorithm = 'advanced_full';
    }
    
    let activeService = null;
    
    serviceKeys.forEach(serviceKey => {
        const config = serviceConfig[serviceKey];
        const isEnabled = results[serviceKey] !== false;
        const isCurrent = isCurrentSite(config.urls);
        
        if (isEnabled && isCurrent) {
            activeService = serviceKey;
            // Run activation function with RTL algorithm setting
            config.activate(rtlAlgorithm);
        }
    });

    // Start session if a service is active
    if (activeService && activeService !== lastTrackedService) {
        await sessionManager.start(activeService, site);
        lastTrackedService = activeService;
    } else if (!activeService && lastTrackedService) {
        // اگر سرویس قبلی فعال بود ولی الان نیست، session را end کنیم
        await sessionManager.stop();
        lastTrackedService = null;
    }
    
    // Return activeService for URL tracking
    return activeService;
}


// Setup page unload tracking برای پایان دادن به session
function setupPageUnloadTracking() {
    let isEndingSession = false;
    
    // وقتی صفحه unload می‌شود، session را end کنیم
    window.addEventListener('beforeunload', () => {
        if (!isEndingSession) {
            isEndingSession = true;
            endUsageSession();
        }
    });
    
    console.log('[Analytics] 🔍 Page unload tracking enabled');
}

// Visibility tracking حالا در SessionManager handle می‌شود

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const activeService = await initializeAllServices();
        setupPageUnloadTracking();
    });
} else {
    (async () => {
        const activeService = await initializeAllServices();
        setupPageUnloadTracking();
    })();
}


