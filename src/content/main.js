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

// Global variables
let site = window.location.hostname;

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
    
    return activeService;
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


