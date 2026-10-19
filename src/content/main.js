// Main content script - orchestrates all services

import { activateChatGptRTL as activateChatGpt, stopChatGptRTL } from './services/chatgpt/chatgpt.js';
import { activateClaude, stopClaude } from './services/claude.js';
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
import { activateZai } from './services/observer/zai.js';
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
import { activateNotion, stopNotion } from './services/notion.js';
import { activateGenspark } from './services/observer/genspark.js';
// import { activateGoogle } from './services/google.js';
import { showUpdateModal } from './utils/updateModal.js';
import { SessionManager } from './utils/session.js';
import { setMixedTitleDisplayMode, setApplyAlgorithmToCode, setFlipRtlArrows, setFixMixedText, setActiveRtlAlgorithm, resetRtlDomCaches, applyLiveCodeAlgorithmSetting, applyLiveFlipRtlArrowsSetting, applyLiveFixMixedTextSetting } from './utils/directionUtils/index.js';
import { startRtlEngine, stopRtlEngine, isRtlEngineActive } from './utils/originalState.js';
import { disconnectAllDomObservers } from './utils/domObserver.js';
import { activateDuckai } from './services/duck-ai.js';
import { activateClickup } from './services/clickup.js';
import { activateT3chat } from './services/t3chat.js';
import { activateVivado } from './services/vivado.js';
import { activateAtxp } from './services/atxp.js';
import { activateConsensus } from './services/consensus.js';
import { activateScispace } from './services/scispace.js';
import { activateElicit } from './services/elicit.js';
import { activateLongcat } from './services/longcat.js';
import { activateMathgpt } from './services/mathgpt.js';
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
import { activateNotta } from './services/notta.js';
import { activateRoboflow } from './services/roboflow.js';
import { activateCodecraft } from './services/codecraft.js';
import { activateHarness, stopHarness } from './services/harness.js';
import { activateGoogleDrive } from './services/google-drive.js';
import { activateGoogleAnalytics } from './services/google-analytics.js';
import { activateYoutubeStudio } from './services/youtube-studio.js';
import { activateYoutube, stopYoutube } from './services/youtube.js';
import { activateM365 } from './services/observer/m365.js';
import { setHalfSpaceHotkeyEnabled, syncHalfSpaceHotkeyForService } from './utils/halfSpaceHotkey.js';
import { EXTENSION_ENABLED_STORAGE_KEY, isExtensionEnabledValue } from '../constants/extensionEnabled.js';
import {
    SITE_SETTINGS_STORAGE_KEY,
    getSiteRtlAlgorithm,
    getSiteTitleMode,
    normalizeSiteSettings,
    serviceHasSiteRtlAlgorithm,
} from '../constants/siteSettings.js';

// Global variables
let site = window.location.hostname;
let lastTrackedService = null;
let extensionEnabled = true;

async function loadExtensionEnabled() {
    try {
        const result = await chrome.storage.sync.get(EXTENSION_ENABLED_STORAGE_KEY);
        extensionEnabled = isExtensionEnabledValue(result[EXTENSION_ENABLED_STORAGE_KEY]);
    } catch (error) {
        extensionEnabled = true;
    }
    return extensionEnabled;
}

async function startExtensionFeatures() {
    if (!extensionEnabled) {
        return;
    }
    initializeHalfSpaceHotkey();
    await enqueueRtlTask(() => initializeAllServices(applyToken));
}

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
    try {
        await loadExtensionEnabled();
        if (!extensionEnabled) {
            return;
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                void startExtensionFeatures();
            });
        } else {
            setTimeout(() => {
                void startExtensionFeatures();
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
        urls: ["chatgpt.com", "chat.openai.com"],
        activate: activateChatGpt
    },
    claude: {
        urls: ["claude.ai"],
        activate: activateClaude
    },
    copilot: {
        urls: ["copilot.com", "www.copilot.com", "copilot.microsoft.com"],
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
        urls: ["notebooklm.google.com", "notebook.google.com", "usercontent.goog"],
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
        urls: ["notion.so", "www.notion.so", "notion.com", "www.notion.com", "app.notion.com"],
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
    elicit: {
        urls: ["elicit.com", "www.elicit.com"],
        activate: activateElicit
    },
    longcat: {
        urls: ["longcat.ai", "www.longcat.ai", "longcat.chat", "www.longcat.chat"],
        activate: activateLongcat
    },
    mathgpt: {
        urls: ["math-gpt.org", "www.math-gpt.org"],
        activate: activateMathgpt
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
    notta: {
        urls: ["app.notta.ai"],
        activate: activateNotta
    },
    roboflow: {
        urls: ["app.roboflow.com"],
        activate: activateRoboflow
    },
    codecraft: {
        urls: ["codecraftapi.com", "www.codecraftapi.com"],
        activate: activateCodecraft
    },
    harness: {
        urls: ["127.0.0.1", "localhost"],
        port: "3080",
        exact: true,
        activate: activateHarness
    },
    googleDrive: {
        urls: ["docs.google.com", "drive.google.com", "sheets.google.com", "slides.google.com", "forms.google.com"],
        activate: activateGoogleDrive
    },
    googleAnalytics: {
        urls: ["analytics.google.com"],
        activate: activateGoogleAnalytics
    },
    youtubeStudio: {
        urls: ["studio.youtube.com"],
        activate: activateYoutubeStudio
    },
    youtube: {
        urls: ["youtube.com", "www.youtube.com", "m.youtube.com"],
        exact: true,
        activate: activateYoutube
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
function isCurrentSite(urls, exact = false, port) {
    if (port != null && String(port) !== '' && String(window.location.port || '') !== String(port)) {
        return false;
    }
    if (Array.isArray(urls)) {
        return urls.some(url => {
            if (url === "github.com") {
                return site === "github.com" && window.location.pathname.startsWith('/copilot');
            }
            if (exact) {
                return url === site;
            }
            return url === site || site.endsWith('.' + url);
        });
    }
    return urls === site;
}

// Check if current site is in any serviceConfig
function isCurrentSiteInServiceConfig() {
    return Object.values(serviceConfig).some(config => isCurrentSite(config.urls, config.exact === true, config.port));
}

function getCurrentServiceKey() {
    for (const [serviceKey, config] of Object.entries(serviceConfig)) {
        if (isCurrentSite(config.urls, config.exact === true, config.port)) {
            return serviceKey;
        }
    }
    return null;
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

function isHarnessPage() {
    const config = serviceConfig.harness;
    return !!(config && isCurrentSite(config.urls, config.exact === true, config.port));
}

function pluginOwnsHarnessPage() {
    return isHarnessPage() && document.documentElement?.getAttribute('data-ai-rtl-owner') === 'dsh';
}

// On Harness, stopHarness removes this extension's own marks and then goes idle.
// A second restore here deletes dir markers the plugin has already written.
function stopPageRtlEngine() {
    if (isHarnessPage()) {
        return;
    }
    stopRtlEngine();
}

function deactivateCurrentRtl() {
    applyToken += 1;
    stopYoutube();
    stopNotion();
    stopHarness();
    stopChatGptRTL();
    stopClaude();
    disconnectAllDomObservers();
    stopPageRtlEngine();
    resetRtlDomCaches();
}

async function initializeAllServices(token = applyToken) {
    if (token !== applyToken || !extensionEnabled) {
        return;
    }

    if (isRtlEngineActive() && document.body && document.body.classList.contains('rtl-algorithm-active')) {
        console.log('[Content] Algorithm already active, skipping initialization...');
        return;
    }
    
    let results = {};
    let rtlAlgorithm = 'advanced_full';
    
    try {
        results = await chrome.storage.sync.get([...Object.keys(serviceConfig), SITE_SETTINGS_STORAGE_KEY, 'rtlAlgorithmMode', 'mixedTitleDisplayMode', 'applyAlgorithmToCode', 'flipRtlArrows', 'fixMixedText']);
    } catch (error) {
        console.log('Storage access failed:', error);
    }

    if (token !== applyToken) {
        return;
    }

    const globalRtlAlgorithm = results.rtlAlgorithmMode || 'advanced_full';
    rtlAlgorithm = globalRtlAlgorithm;
    setMixedTitleDisplayMode(results.mixedTitleDisplayMode);
    setApplyAlgorithmToCode(results.applyAlgorithmToCode !== false);
    setFlipRtlArrows(results.flipRtlArrows !== false);
    setFixMixedText(results.fixMixedText === true);
    
    let activeService = null;
    
    for (const [serviceKey, config] of Object.entries(serviceConfig)) {
        if (results[serviceKey] !== false && isCurrentSite(config.urls, config.exact === true, config.port)) {
            activeService = serviceKey;
            rtlAlgorithm = getSiteRtlAlgorithm(
                results[SITE_SETTINGS_STORAGE_KEY],
                serviceKey,
                globalRtlAlgorithm
            );
            setMixedTitleDisplayMode(
                getSiteTitleMode(
                    results[SITE_SETTINGS_STORAGE_KEY],
                    serviceKey,
                    results.mixedTitleDisplayMode
                )
            );
            if (typeof window.AQ !== 'undefined') {
                if (token !== applyToken) {
                    return;
                }
                setActiveRtlAlgorithm(rtlAlgorithm);
                const ownerAttr = document.documentElement?.getAttribute('data-ai-rtl-owner');
                const storedEngine = results?.[SITE_SETTINGS_STORAGE_KEY]?.harness?.engine;
                const liveOwner = ownerAttr === 'dsh' || ownerAttr === 'chrome'
                    ? ownerAttr
                    : (storedEngine === 'dsh' ? 'dsh' : 'chrome');
                const harnessStandsDown = serviceKey === 'harness' && liveOwner === 'dsh';
                if (!harnessStandsDown) {
                    startRtlEngine();
                    if (document.body) {
                        document.body.classList.add('rtl-algorithm-active');
                    }
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
        if (document.body && !pluginOwnsHarnessPage()) {
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
        stopYoutube();
        stopNotion();
        stopHarness();
        stopChatGptRTL();
        stopClaude();
        disconnectAllDomObservers();
        stopPageRtlEngine();
        resetRtlDomCaches();
        if (lastTrackedService) {
            await sessionManager.stop();
            lastTrackedService = null;
        }
        if (document.body && !pluginOwnsHarnessPage()) {
            document.body.classList.remove('rtl-algorithm-active');
        }
    });
}

function requestRtlEnable() {
    if (!extensionEnabled) {
        return Promise.resolve();
    }
    const token = ++applyToken;
    return enqueueRtlTask(async () => {
        if (token !== applyToken) {
            return;
        }
        stopYoutube();
        stopNotion();
        stopChatGptRTL();
        stopClaude();
        disconnectAllDomObservers();
        if (!pluginOwnsHarnessPage()) {
            if (isHarnessPage()) {
                if (isRtlEngineActive()) stopRtlEngine({ followup: false });
            } else {
                stopRtlEngine();
            }
        }
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

    if (changes[EXTENSION_ENABLED_STORAGE_KEY]) {
        extensionEnabled = isExtensionEnabledValue(changes[EXTENSION_ENABLED_STORAGE_KEY].newValue);
        if (extensionEnabled) {
            await startExtensionFeatures();
        } else {
            setHalfSpaceHotkeyEnabled(false);
            await requestRtlDisable();
        }
        return;
    }

    if (!extensionEnabled) {
        return;
    }
    
    if (!isCurrentSiteInServiceConfig()) return; 
    if (changes.rtlAlgorithm || changes.rtlAlgorithmMode || changes.mixedTitleDisplayMode) {
        await requestRtlEnable();
        return;
    }

    if (changes[SITE_SETTINGS_STORAGE_KEY]) {
        const serviceKey = getCurrentServiceKey();
        if (serviceKey && serviceHasSiteRtlAlgorithm(serviceKey)) {
            const prev = normalizeSiteSettings(changes[SITE_SETTINGS_STORAGE_KEY].oldValue);
            const next = normalizeSiteSettings(changes[SITE_SETTINGS_STORAGE_KEY].newValue);
            if (
                prev?.[serviceKey]?.rtlAlgorithm !== next?.[serviceKey]?.rtlAlgorithm
                || prev?.[serviceKey]?.titleMode !== next?.[serviceKey]?.titleMode
            ) {
                await requestRtlEnable();
                return;
            }
        }
    }

    if (changes.applyAlgorithmToCode || changes.flipRtlArrows || changes.fixMixedText) {
        if (changes.applyAlgorithmToCode) {
            applyLiveCodeAlgorithmSetting(changes.applyAlgorithmToCode.newValue === true);
        }
        if (changes.flipRtlArrows) {
            applyLiveFlipRtlArrowsSetting(changes.flipRtlArrows.newValue === true);
        }
        if (changes.fixMixedText) {
            applyLiveFixMixedTextSetting(changes.fixMixedText.newValue === true);
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
        if (changes[serviceKey] && isCurrentSite(serviceConfig[serviceKey].urls, serviceConfig[serviceKey].exact === true, serviceConfig[serviceKey].port)) {
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
                    port: window.location.port || '',
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
        if (!extensionEnabled) {
            sendResponse({ success: false, error: 'extension disabled' });
            return true;
        }
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

function initializeHalfSpaceHotkey() {
    void syncHalfSpaceHotkeyForService(getCurrentServiceKey());
}

async function bootContentScript() {
    await loadExtensionEnabled();
    await startExtensionFeatures();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        void bootContentScript();
    });
} else {
    void bootContentScript();
}



