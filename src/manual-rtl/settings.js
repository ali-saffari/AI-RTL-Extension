import { manualRtlState } from './state.js';

function getAISitesList() {
    if (manualRtlState.aiSitesList) {
        return manualRtlState.aiSitesList;
    }

    manualRtlState.aiSitesList = [
        'chatgpt.com',
        'claude.ai',
        'copilot.microsoft.com',
        'bing.com',
        'www.bing.com',
        'github.com',
        'perplexity.ai',
        'www.perplexity.ai',
        'duckduckgo.com',
        'aistudio.google.com',
        'chat.deepseek.com',
        'you.com',
        'chat.qwenlm.ai',
        'chat.qwen.ai',
        'poe.com',
        'monica.im',
        'gemini.google.com',
        'business.gemini.google',
        'grok.com',
        'chat.mistral.ai',
        'manus.im',
        'www.kimi.com',
        'www.blackbox.ai',
        'notebooklm.google.com',
        'notebook.google.com',
        'chat.z.ai',
        'arena.ai',
        'openrouter.ai',
        'agent.minimax.io',
        'jules.google.com',
        '1min.ai',
        'app.1min.ai',
        'digen.ai',
        'lovable.dev',
        'www.lovable.dev',
        'synaps.app',
        'www.synaps.app',
        'my.synaps.app',
        'app.writesonic.com',
        'ernie.baidu.com',
        'app.clickup.com',
        't3.chat',
        'www.t3.chat',
        'vivado.amd.com',
        'chat.atxp.ai'
    ];

    return manualRtlState.aiSitesList;
}

function isAISite() {
    const hostname = window.location.hostname;
    const aiSites = getAISitesList();
    return aiSites.some(site => hostname === site || hostname.endsWith('.' + site));
}

function isAllowedSite(callback) {
    chrome.storage.sync.get(['manualRtlActiveSites'], (result) => {
        const hostname = window.location.hostname;
        const activeSites = result.manualRtlActiveSites || [];
        
        const isAllowed = activeSites.some(site => 
            site.hostname === hostname || hostname.endsWith('.' + site.hostname)
        );

        callback(isAllowed);
    });
}

export function shouldEnableTextSelector(callback) {
    chrome.storage.sync.get(['manualRtlSettings', 'manualRtlActiveSites'], (result) => {
        const settings = result.manualRtlSettings;
        if (!settings) {
            console.log('[RTL Text Selector] No manualRtlSettings found');
            callback(false);
            return;
        }

        manualRtlState.manualRtlSettings = settings;

        if (!settings.manualRtlEnabled) {
            console.log('[RTL Text Selector] manualRtlEnabled is false');
            callback(false);
            return;
        }

        const siteMode = settings.manualRtlSiteMode || 'allowed_sites';
        const hostname = window.location.hostname;
        console.log('[RTL Text Selector] Checking site:', hostname, 'mode:', siteMode);

        if (siteMode === 'all') {
            console.log('[RTL Text Selector] Site mode is "all", enabling');
            callback(true);
            return;
        }

        if (siteMode === 'ai_sites') {
            const isAI = isAISite();
            console.log('[RTL Text Selector] Site mode is "ai_sites", isAI:', isAI);
            callback(isAI);
            return;
        }

        if (siteMode === 'allowed_sites') {
            isAllowedSite((isAllowed) => {
                console.log('[RTL Text Selector] Site mode is "allowed_sites", isAllowed:', isAllowed);
                callback(isAllowed);
            });
            return;
        }

        if (siteMode === 'ai_and_allowed') {
            if (isAISite()) {
                console.log('[RTL Text Selector] Site mode is "ai_and_allowed", isAI: true');
                callback(true);
                return;
            }
            isAllowedSite((isAllowed) => {
                console.log('[RTL Text Selector] Site mode is "ai_and_allowed", isAllowed:', isAllowed);
                callback(isAllowed);
            });
            return;
        }

        console.log('[RTL Text Selector] Unknown site mode:', siteMode);
        callback(false);
    });
}

