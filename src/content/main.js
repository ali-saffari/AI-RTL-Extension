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
import { activateBusinessGemini } from './services/business-gemini.js';
import { activateMonica } from './services/monica.js';
import { activatePoe } from './services/poe.js';
import { activatePerplexity } from './services/perplexity.js';
import { activateDuckduckgo } from './services/duckduckgo.js';
import { activateAistudio } from './services/aistudio.js';
import { activateDeepSeek } from './services/deepseek.js';
import { activateYoucom } from './services/youcom.js';
import { activateQwen } from './services/qwen.js';
import { activateQwenCoder } from './services/qwen-coder.js';
import { activateNotebooklm } from './services/notebooklm.js';
import { activateZai } from './services/zai.js';
import { activateArena } from './services/arena.js';
import { activateOpenRouter } from './services/openrouter.js';
import { activateMinimax } from './services/minimax.js';
import { activateJules } from './services/jules.js';
import { activate1minai } from './services/observer/1minai.js';
import { activateDigen } from './services/digen.js';
import { activateLovable } from './services/lovable.js';
import { activateSynaps } from './services/synaps.js';
import { activateChatsonic } from './services/chatsonic.js';




// Make activateChatsonic available globally for scripting injection
window.activateChatsonic = activateChatsonic;
import { activateErnie } from './services/ernie.js';
import { activateGamma } from './services/gamma.js';
import { activateNotion } from './services/notion.js';
import { activateGenspark } from './services/observer/genspark.js';
// import { activateGoogle } from './services/google.js';
import { showUpdateModal } from './utils/updateModal.js';
import { SessionManager } from './utils/session.js';
import { setMixedTitleDisplayMode, setApplyAlgorithmToCode, setFlipRtlArrows, setActiveRtlAlgorithm, resetRtlDomCaches, applyLiveCodeAlgorithmSetting, applyLiveFlipRtlArrowsSetting } from './utils/textDirectionUtils.js';
import { startRtlEngine, stopRtlEngine, isRtlEngineActive } from './utils/originalState.js';
import { disconnectAllDomObservers } from './utils/domObserver.js';
import { activateDuckai } from './services/duck-ai.js';
import { activateClickup } from './services/clickup.js';
import { activateT3chat } from './services/t3chat.js';
import { activateVivado } from './services/vivado.js';
import { activateAtxp } from './services/atxp.js';
import { activateConsensus } from './services/consensus.js';
import { activateScispace } from './services/scispace.js';
import { activateChatboxai } from './services/chatboxai.js';
import { activateLumo } from './services/lumo.js';
import { activateMeta } from './services/meta.js';
import { activateGoogleLabs } from './services/google-labs.js';
import { activateVeo3 } from './services/veo3.js';
import { activateFal } from './services/fal.js';
import { activateBfl } from './services/bfl.js';
import { activateCharacterAi } from './services/character-ai.js';
import { activatePi } from './services/pi.js';
import { activateCursor } from './services/observer/cursor.js';
import { activateTypingMind } from './services/observer/typingmind.js';
import { activateHuggingFace } from './services/observer/huggingface.js';
import { activateDash0 } from './services/observer/dash0.js';
import { activateZerve } from './services/observer/zerve.js';
import { activateSakana } from './services/observer/sakana.js';
import { activateGoogleDrive } from './services/google-drive.js';
import { activateM365 } from './services/observer/m365.js';

// Global variables
let site = window.location.hostname;
let lastTrackedService = null;

function isInvalidatedContextMessage(value) {
    const message = value?.message || String(value || '');
    return message.includes('Extension context invalidated');
}

window.addEventListener('error', (event) => {
    if (isInvalidatedContextMessage(event.error) || isInvalidatedContextMessage(event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

window.addEventListener('unhandledrejection', (event) => {
    if (isInvalidatedContextMessage(event.reason)) {
        event.preventDefault();
    }
});


// Listen for content script activation event - register early
window.addEventListener('contentScriptActivate', async () => {
    console.log('[Content] Content script activation event received');
    // Re-initialize all services to ensure they are activated
    try {
        // Wait a bit to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                console.log('[Content] DOMContentLoaded event received, initializing services');
                await enqueueRtlTask(() => initializeAllServices(applyToken));
            });
        } else {
            console.log('[Content] DOM already ready, initializing services');
            // Small delay to ensure everything is loaded
            setTimeout(async () => {
                await enqueueRtlTask(() => initializeAllServices(applyToken));
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
    qwenCoder: {
        urls: ["coder.qwen.ai"],
        activate: activateQwenCoder
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
    businessGemini: {
        urls: ["business.gemini.google"],
        activate: activateBusinessGemini
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
        urls: ["kimi.ai", "www.kimi.ai", "kimi.com", "www.kimi.com"],
        activate: activateKimi
    },
    blackbox: {
        urls: ["www.blackbox.ai"],
        activate: activateBlackbox
    },
    googleNotebook: {
        urls: ["notebooklm.google.com", "notebook.google.com"],
        activate: activateNotebooklm
    },
    zai: {
        urls: ["chat.z.ai"],
        activate: activateZai
    },
    arena: {
        urls: ["arena.ai"],
        activate: activateArena
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
        urls: ["digen.ai", "agent.digen.ai"],
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
        urls: ["ernie.baidu.com", "www.ernie.baidu.com", "wenxin.baidu.com", "www.wenxin.baidu.com", "chat.baidu.com", "www.chat.baidu.com"],
        activate: activateErnie
    },
    gamma: {
        urls: ["gamma.app", "www.gamma.app"],
        activate: activateGamma
    },
    notion: {
        urls: ["notion.so", "www.notion.so"],
        activate: activateNotion
    },
    genspark: {
        urls: ["genspark.ai", "www.genspark.ai"],
        activate: activateGenspark
    },
    duckai: {
        urls: ["duck.ai"],
        activate: activateDuckai
    },
    clickup: {
        urls: ["app.clickup.com"],
        activate: activateClickup
    },
    t3chat: {
        urls: ["t3.chat", "www.t3.chat"],
        activate: activateT3chat
    },
    vivado: {
        urls: ["vivado.amd.com"],
        activate: activateVivado
    },
    atxp: {
        urls: ["chat.atxp.ai"],
        activate: activateAtxp
    },
    consensus: {
        urls: ["consensus.app", "www.consensus.app"],
        activate: activateConsensus
    },
    scispace: {
        urls: ["scispace.com", "www.scispace.com"],
        activate: activateScispace
    },
    chatboxai: {
        urls: ["web.chatboxai.app"],
        activate: activateChatboxai
    },
    lumo: {
        urls: ["lumo.proton.me"],
        activate: activateLumo
    },
    meta: {
        urls: ["meta.ai", "www.meta.ai"],
        activate: activateMeta
    },
    googleLabs: {
        urls: ["labs.google", "www.labs.google"],
        activate: activateGoogleLabs
    },
    veo3: {
        urls: ["www-veo3.com"],
        activate: activateVeo3
    },
    fal: {
        urls: ["fal.ai", "www.fal.ai"],
        activate: activateFal
    },
    bfl: {
        urls: ["bfl.ai"],
        activate: activateBfl
    },
    characterAi: {
        urls: ["character.ai", "www.character.ai", "c.ai", "www.c.ai"],
        activate: activateCharacterAi
    },
    pi: {
        urls: ["pi.ai", "www.pi.ai"],
        activate: activatePi
    },
    cursor: {
        urls: ["cursor.com"],
        activate: activateCursor
    },
    typingmind: {
        urls: ["typingmind.com", "www.typingmind.com"],
        activate: activateTypingMind
    },
    huggingface: {
        urls: ["huggingface.co", "www.huggingface.co", "hf.co", "www.hf.co"],
        activate: activateHuggingFace
    },
    dash0: {
        urls: ["dash0.com", "www.dash0.com", "app.dash0.com"],
        activate: activateDash0
    },
    zerve: {
        urls: ["zerve.ai", "www.zerve.ai", "app.zerve.ai"],
        activate: activateZerve
    },
    sakana: {
        urls: ["chat.sakana.ai", "www.chat.sakana.ai"],
        activate: activateSakana
    },
    googleDrive: {
        urls: ["docs.google.com", "drive.google.com", "sheets.google.com", "slides.google.com", "forms.google.com"],
        activate: activateGoogleDrive
    },
    m365: {
        urls: ["m365.cloud.microsoft", "copilot.cloud.microsoft"],
        activate: activateM365
    },
    // google: {
    //     urls: ["google.com", "www.google.com"],
    //     activate: activateGoogle
    // }
};

// Check if current site matches service URLs
function isCurrentSite(urls) {
    if (Array.isArray(urls)) {
        return urls.some(url => {
            if (url === "github.com") {
                return site === "github.com" && window.location.pathname.startsWith('/copilot');
            }
            return url === site || site.endsWith('.' + url);
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

const sessionManager = new SessionManager();

let applyToken = 0;
let rtlTaskChain = Promise.resolve();

function enqueueRtlTask(task) {
    rtlTaskChain = rtlTaskChain.then(task).catch((error) => {
        console.warn('[Content] RTL toggle task failed:', error);
    });
    return rtlTaskChain;
}

function deactivateCurrentRtl() {
    applyToken += 1;
    disconnectAllDomObservers();
    stopRtlEngine();
    resetRtlDomCaches();
}

async function initializeAllServices(token = applyToken) {
    if (token !== applyToken) {
        return;
    }

    if (isRtlEngineActive() && document.body && document.body.classList.contains('rtl-algorithm-active')) {
        console.log('[Content] Algorithm already active, skipping initialization...');
        return;
    }
    
    let results = {};
    let rtlAlgorithm = 'advanced_full';
    
    try {
        results = await chrome.storage.sync.get([...Object.keys(serviceConfig), 'rtlAlgorithmMode', 'mixedTitleDisplayMode', 'applyAlgorithmToCode', 'flipRtlArrows']);
    } catch (error) {
        console.log('Storage access failed:', error);
    }

    if (token !== applyToken) {
        return;
    }

    rtlAlgorithm = results.rtlAlgorithmMode || 'advanced_full';
    setMixedTitleDisplayMode(results.mixedTitleDisplayMode);
    setApplyAlgorithmToCode(results.applyAlgorithmToCode !== false);
    setFlipRtlArrows(results.flipRtlArrows !== false);
    
    let activeService = null;
    
    for (const [serviceKey, config] of Object.entries(serviceConfig)) {
        if (results[serviceKey] !== false && isCurrentSite(config.urls)) {
            activeService = serviceKey;
            if (typeof window.AQ !== 'undefined') {
                if (token !== applyToken) {
                    return;
                }
                setActiveRtlAlgorithm(rtlAlgorithm);
                startRtlEngine();
                if (document.body) {
                    document.body.classList.add('rtl-algorithm-active');
                }
                config.activate(rtlAlgorithm);
                if (token !== applyToken) {
                    deactivateCurrentRtl();
                    return;
                }
                setTimeout(() => {
                    if (token === applyToken && isRtlEngineActive()) {
                        showUpdateModal();
                    }
                }, 1000);
            } else {
                console.log('config.activate(rtlAlgorithm) - AQ is not defined');
            }
            break;
        }
    }

    if (token !== applyToken) {
        return;
    }

    if (activeService && activeService !== lastTrackedService) {
        await sessionManager.start(activeService, site);
        lastTrackedService = activeService;
    } else if (!activeService && lastTrackedService) {
        await sessionManager.stop();
        lastTrackedService = null;
        if (document.body) {
            document.body.classList.remove('rtl-algorithm-active');
        }
    }
}

async function reapplyCurrentRtl() {
    await requestRtlEnable();
}

function requestRtlDisable() {
    const token = ++applyToken;
    return enqueueRtlTask(async () => {
        if (token !== applyToken) {
            return;
        }
        disconnectAllDomObservers();
        stopRtlEngine();
        resetRtlDomCaches();
        if (lastTrackedService) {
            await sessionManager.stop();
            lastTrackedService = null;
        }
        if (document.body) {
            document.body.classList.remove('rtl-algorithm-active');
        }
    });
}

function requestRtlEnable() {
    const token = ++applyToken;
    return enqueueRtlTask(async () => {
        if (token !== applyToken) {
            return;
        }
        disconnectAllDomObservers();
        stopRtlEngine();
        resetRtlDomCaches();
        await initializeAllServices(token);
    });
}

// Listen for storage changes
chrome.storage.sync.onChanged.addListener(async (changes) => {
    if (changes.analyticsEnabled) {
        sessionManager.analyticsEnabled = changes.analyticsEnabled.newValue !== false;
        if (!sessionManager.analyticsEnabled) {
            await sessionManager.stop();
        }
    }
    
    if (!isCurrentSiteInServiceConfig()) return;
    
    if (changes.rtlAlgorithm || changes.rtlAlgorithmMode || changes.mixedTitleDisplayMode) {
        await requestRtlEnable();
        return;
    }

    if (changes.applyAlgorithmToCode || changes.flipRtlArrows) {
        if (changes.applyAlgorithmToCode) {
            applyLiveCodeAlgorithmSetting(changes.applyAlgorithmToCode.newValue === true);
        }
        if (changes.flipRtlArrows) {
            applyLiveFlipRtlArrowsSetting(changes.flipRtlArrows.newValue === true);
        }
        return;
    }

    if (changes.supportHide) {
        const hide = changes.supportHide.newValue === true;
        const checkAQ = () => {
            if (typeof window.AQ !== 'undefined') {
                AQ('.AsBox')[hide ? 'hide' : 'show']();
            } else {
                setTimeout(checkAQ, 100);
            }
        };
        checkAQ();
        return;
    }
    
    for (const serviceKey of Object.keys(serviceConfig)) {
        if (changes[serviceKey] && isCurrentSite(serviceConfig[serviceKey].urls)) {
            if (changes[serviceKey].newValue === false) {
                await requestRtlDisable();
            } else {
                await requestRtlEnable();
            }
            return;
        }
    }
});

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
    } else if (message.action === 'enableRtl') {
        requestRtlEnable()
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error?.message }));
        return true;
    } else if (message.action === 'disableRtl') {
        requestRtlDisable()
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error?.message }));
        return true;
    } else if (message.action === 'closeUpdateModal') {
        // Close update modal in this tab
        const modal = document.getElementById('AsUpdateModal');
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
        sendResponse({ success: true });
        return true;
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await enqueueRtlTask(() => initializeAllServices(applyToken));
    });
} else {
    enqueueRtlTask(() => initializeAllServices(applyToken));
}



