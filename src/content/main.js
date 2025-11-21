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
import { activateJules } from './services/jules.js';
import { activate1minai } from './services/1minai.js';
import { activateDigen } from './services/digen.js';
import { activateLovable } from './services/lovable.js';
import { activateSynaps } from './services/synaps.js';
import { activateChatsonic } from './services/chatsonic.js';

// Make activateChatsonic available globally for scripting injection
window.activateChatsonic = activateChatsonic;
import { activateErnie } from './services/ernie.js';

// Global variables
let site = window.location.hostname;
let lastTrackedService = null;


// Listen for content script activation event - register early
window.addEventListener('contentScriptActivate', async () => {
    console.log('[Content] Content script activation event received');
    // Re-initialize all services to ensure they are activated
    try {
        // Wait a bit to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                console.log('[Content] DOMContentLoaded event received, initializing services');
                await initializeAllServices();
            });
        } else {
            console.log('[Content] DOM already ready, initializing services');
            // Small delay to ensure everything is loaded
            setTimeout(async () => {
                await initializeAllServices();
            }, 200);
        }
    } catch (error) {
        console.error('[Content] Error initializing services:', error);
    }
}, { once: false });

// Listen for manual RTL activation event from scripting injection
window.addEventListener('manualRtlActivate', () => {
    console.log('[Content] Manual RTL activation event received');
    // The manual RTL will be activated via storage change listener
    // This event just ensures the content script is aware
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
    },
    jules: {
        urls: ["jules.google.com"],
        activate: activateJules
    },
    oneMinai: {
        urls: ["1min.ai", "app.1min.ai"],
        activate: activate1minai
    },
    digen: {
        urls: ["digen.ai"],
        activate: activateDigen
    },
    lovable: {
        urls: ["lovable.dev", "www.lovable.dev"],
        activate: activateLovable
    },
    synaps: {
        urls: ["synaps.app", "www.synaps.app", "my.synaps.app"],
        activate: activateSynaps
    },
    writesonic: {
        urls: ["app.writesonic.com"],
        activate: activateChatsonic
    },
    ernie: {
        urls: ["ernie.baidu.com", "www.ernie.baidu.com"],
        activate: activateErnie
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

// Check if current site is in any serviceConfig
function isCurrentSiteInServiceConfig() {
    return Object.values(serviceConfig).some(config => isCurrentSite(config.urls));
}

// ============================================
// Analytics Session Manager
// ============================================

import { SessionManager } from './utils/session.js';

const sessionManager = new SessionManager();

// Listen for storage changes
chrome.storage.sync.onChanged.addListener(async (changes) => {
    if (changes.analyticsEnabled) {
        sessionManager.analyticsEnabled = changes.analyticsEnabled.newValue !== false;
        if (!sessionManager.analyticsEnabled) {
            await sessionManager.stop();
        }
    }
    
    if (!isCurrentSiteInServiceConfig()) return;
    
    if (changes.rtlAlgorithm || changes.rtlAlgorithmMode) {
        // Remove class from body when algorithm changes
        if (document.body) {
            document.body.classList.remove('rtl-algorithm-active');
        }
        location.reload();
        return;
    }

    if (changes.supportHide) {
        const hide = changes.supportHide.newValue === true;
        // Wait for AQ to be available
        const checkAQ = () => {
            if (typeof window.AQ !== 'undefined') {
                AQ('.AsBox')[hide ? 'hide' : 'show']();
            } else {
                // Retry after a short delay
                setTimeout(checkAQ, 100);
            }
        };
        checkAQ();
        return;
    }
    
    for (const serviceKey of Object.keys(serviceConfig)) {
        if (changes[serviceKey] && isCurrentSite(serviceConfig[serviceKey].urls)) {
            // Remove class from body when service is disabled
            if (changes[serviceKey].newValue === false && document.body) {
                document.body.classList.remove('rtl-algorithm-active');
            }
            location.reload();
            return;
        }
    }
});


// Initialize all services
async function initializeAllServices() {
    // Check if algorithm is already active by checking for class on body
    if (document.body && document.body.classList.contains('rtl-algorithm-active')) {
        console.log('[Content] Algorithm already active (class exists on body), skipping initialization...');
        return;
    }
    
    let results = {};
    let rtlAlgorithm = 'advanced_full';
    
    try {
        results = await chrome.storage.sync.get([...Object.keys(serviceConfig), 'rtlAlgorithmMode']);
        rtlAlgorithm = results.rtlAlgorithmMode || 'advanced_full';
    } catch (error) {
        console.log('Storage access failed:', error);
    }
    
    let activeService = null;
    
    for (const [serviceKey, config] of Object.entries(serviceConfig)) {
        if (results[serviceKey] !== false && isCurrentSite(config.urls)) {
            activeService = serviceKey;
            if (typeof window.AQ !== 'undefined') {
                config.activate(rtlAlgorithm);
                // Add class to body to mark as active
                if (document.body) {
                    document.body.classList.add('rtl-algorithm-active');
                }
            } else {
                console.log('config.activate(rtlAlgorithm) - AQ is not defined');
            }
            break;
        }
    }

    if (activeService && activeService !== lastTrackedService) {
        await sessionManager.start(activeService, site);
        lastTrackedService = activeService;
    } else if (!activeService && lastTrackedService) {
        await sessionManager.stop();
        lastTrackedService = null;
        // Remove class from body when no service is active
        if (document.body) {
            document.body.classList.remove('rtl-algorithm-active');
        }
    }
}

// Make initializeAllServices available globally for scripting injection
window.initializeAllServices = initializeAllServices;

// Listen for messages from background script to get page info
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getPageInfo') {
        try {
            const url = window.location.href;
            const hostname = window.location.hostname;
            const favicon = document.querySelector('link[rel*="icon"]')?.href || '';
            
            // Only return if it's http/https
            if (url.startsWith('http://') || url.startsWith('https://')) {
                sendResponse({
                    success: true,
                    hostname: hostname,
                    favicon: favicon,
                    url: url
                });
            } else {
                sendResponse({
                    success: false,
                    error: 'Not an http/https page'
                });
            }
        } catch (e) {
            sendResponse({
                success: false,
                error: e.message
            });
        }
        return true; // Keep channel open for async response
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeAllServices();
    });
} else {
    (async () => {
        await initializeAllServices();
    })();
}



