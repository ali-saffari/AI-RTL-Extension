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
        'grok.com',
        'chat.mistral.ai',
        'manus.im',
        'www.kimi.com',
        'www.blackbox.ai',
        'notebooklm.google.com',
        'chat.z.ai',
        'lmarena.ai',
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
        'ernie.baidu.com'
    ];

    return manualRtlState.aiSitesList;
}

function isAISite() {
    const hostname = window.location.hostname;
    const aiSites = getAISitesList();
    return aiSites.some(site => hostname === site || hostname.endsWith('.' + site));
}

function isAllowedSite(callback) {
    chrome.storage.sync.get(['allowedSites', 'customAllowedSites'], (result) => {
        const hostname = window.location.hostname;
        let isAllowed = false;

        if (result.allowedSites && Array.isArray(result.allowedSites)) {
            isAllowed = result.allowedSites.some(site =>
                hostname === site || hostname.endsWith('.' + site)
            );
        }

        if (!isAllowed && result.customAllowedSites && Array.isArray(result.customAllowedSites)) {
            isAllowed = result.customAllowedSites.some(site =>
                hostname === site || hostname.endsWith('.' + site)
            );
        }

        callback(isAllowed);
    });
}

export function shouldEnableTextSelector(callback) {
    chrome.storage.sync.get(['manualRtlSettings'], (result) => {
        const settings = result.manualRtlSettings;
        if (!settings) {
            callback(false);
            return;
        }

        manualRtlState.manualRtlSettings = settings;

        if (!settings.manualRtlEnabled) {
            callback(false);
            return;
        }

        const siteMode = settings.manualRtlSiteMode || 'all';

        if (siteMode === 'all') {
            callback(true);
            return;
        }

        if (siteMode === 'ai_sites') {
            callback(isAISite());
            return;
        }

        if (siteMode === 'allowed_sites') {
            isAllowedSite(callback);
            return;
        }

        if (siteMode === 'ai_and_allowed') {
            if (isAISite()) {
                callback(true);
                return;
            }
            isAllowedSite(callback);
            return;
        }

        callback(false);
    });
}

