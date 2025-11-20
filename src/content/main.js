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
import { activateErnie } from './services/ernie.js';
import { initTextSelector } from './manual-rtl/index.js';

// Global variables
let site = window.location.hostname;
let lastTrackedService = null;

function getFaviconUrl() {
    const selectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel~="icon"]'
    ];

    for (const selector of selectors) {
        const link = document.querySelector(selector);
        if (link?.href) {
            return link.href;
        }
    }

    try {
        return new URL('/favicon.ico', window.location.origin).href;
    } catch {
        return '';
    }
}

function reportActiveSiteToBackground() {
    if (!chrome?.runtime?.sendMessage) return;

    try {
        chrome.runtime.sendMessage({
            action: 'contentSiteInfo',
            hostname: window.location.hostname,
            favicon: getFaviconUrl()
        }, () => {
            if (chrome.runtime.lastError) {
                console.warn('[Content] Failed to report site info:', chrome.runtime.lastError.message);
            }
        });
    } catch (error) {
        console.warn('[Content] Exception while reporting site info:', error.message);
    }
}

reportActiveSiteToBackground();
window.addEventListener('focus', reportActiveSiteToBackground, { passive: true });
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        reportActiveSiteToBackground();
    }
});

// Initialize text selector highlighter (works on all sites)
initTextSelector();


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
        location.reload();
        return;
    }

    if (changes.supportHide) {
        const hide = changes.supportHide.newValue === true;
        $('.AsBox')[hide ? 'hide' : 'show']();
        return;
    }
    
    for (const serviceKey of Object.keys(serviceConfig)) {
        if (changes[serviceKey] && isCurrentSite(serviceConfig[serviceKey].urls)) {
            location.reload();
            return;
        }
    }
});


// Initialize all services
async function initializeAllServices() {
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
            config.activate(rtlAlgorithm);
            break;
        }
    }

    if (activeService && activeService !== lastTrackedService) {
        await sessionManager.start(activeService, site);
        lastTrackedService = activeService;
    } else if (!activeService && lastTrackedService) {
        await sessionManager.stop();
        lastTrackedService = null;
    }
}

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



