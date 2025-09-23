// Main content script - orchestrates all services
import { activateChatGptRTL as activateChatGpt } from './services/chatgpt.js';
import { activateClaude } from './services/claude.js';
import { activateCopilot } from './services/copilot.js';
import { activateBlackbox } from './services/blackbox.js';
import { activateKimi } from './services/kimi.js';
import { activateManus } from './services/manus.js';
import { activateMistral } from './services/mistral.js';
import { activateGrok } from './services/grok.js';
import { activateGemini } from './services/gemini.js';
import { activateMonica } from './services/monica.js';
import { activatePoe } from './services/poe.js';
import { activateTheb } from './services/thebai.js';
import { activatePerplexity } from './services/perplexity.js';
import { activateDuckduckgo } from './services/duckduckgo.js';
import { activateAistudio } from './services/aistudio.js';
import { activateDeepSeek } from './services/deepseek.js';
import { activateYoucom } from './services/youcom.js';
import { activateQwen } from './services/qwen.js';

// Global variables
let site = window.location.hostname;

// Listen for storage changes
chrome.storage.sync.onChanged.addListener((changes) => {
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
    thebAi: {
        urls: ["beta.theb.ai", "chatbot.theb.ai"],
        activate: activateTheb
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
    }
};

// Check if current site matches service URLs
function isCurrentSite(urls) {
    return Array.isArray(urls) ? urls.includes(site) : urls === site;
}

// Initialize all services
async function initializeAllServices() {
    const serviceKeys = Object.keys(serviceConfig);
    const results = await chrome.storage.sync.get(serviceKeys);
    
    serviceKeys.forEach(serviceKey => {
        const config = serviceConfig[serviceKey];
        const isEnabled = results[serviceKey] !== false;
        const isCurrent = isCurrentSite(config.urls);
        
        if (isEnabled && isCurrent) {
            // Run activation function
            config.activate();
        }
    });
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllServices);
} else {
    initializeAllServices();
}


