import { manualRtlState } from './state.js';

function getAISitesList() {
    if (manualRtlState.aiSitesList) {
        return manualRtlState.aiSitesList;
    }

    manualRtlState.aiSitesList = [
        'chatgpt.com',
        'claude.ai',
        'copilot.com',
        'www.copilot.com',
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
        'kimi.com',
        'www.kimi.ai',
        'kimi.ai',
        'www.blackbox.ai',
        'notebooklm.google.com',
        'notebook.google.com',
        'usercontent.goog',
        'chat.z.ai',
        'arena.ai',
        'openrouter.ai',
        'agent.minimax.io',
        'jules.google.com',
        '1min.ai',
        'app.1min.ai',
        'digen.ai',
        'agent.digen.ai',
        'lovable.dev',
        'www.lovable.dev',
        'synaps.app',
        'www.synaps.app',
        'my.synaps.app',
        'app.writesonic.com',
        'ernie.baidu.com',
        'wenxin.baidu.com',
        'chat.baidu.com',
        'app.clickup.com',
        't3.chat',
        'www.t3.chat',
        'vivado.amd.com',
        'chat.atxp.ai',
        'consensus.app',
        'www.consensus.app',
        'scispace.com',
        'www.scispace.com',
        'elicit.com',
        'www.elicit.com',
        'longcat.ai',
        'www.longcat.ai',
        'longcat.chat',
        'www.longcat.chat',
        'math-gpt.org',
        'www.math-gpt.org',
        'web.chatboxai.app',
        'lumo.proton.me',
        'meta.ai',
        'www.meta.ai',
        'labs.google',
        'www.labs.google',
        'www-veo3.com',
        'fal.ai',
        'www.fal.ai',
        'bfl.ai',
        'www.bfl.ai',
        'dashboard.bfl.ai',
        'playground.bfl.ai',
        'character.ai',
        'www.character.ai',
        'c.ai',
        'www.c.ai',
        'pi.ai',
        'www.pi.ai',
        'cursor.com',
        'www.cursor.com',
        'docs.cursor.com',
        'typingmind.com',
        'www.typingmind.com',
        'huggingface.co',
        'www.huggingface.co',
        'hf.co',
        'www.hf.co',
        'dash0.com',
        'www.dash0.com',
        'app.dash0.com',
        'zerve.ai',
        'www.zerve.ai',
        'app.zerve.ai',
        'coder.qwen.ai',
        'chat.sakana.ai',
        'www.chat.sakana.ai',
        'genspark.ai',
        'www.genspark.ai',
        'docs.google.com',
        'drive.google.com',
        'sheets.google.com',
        'slides.google.com',
        'forms.google.com',
        'analytics.google.com',
        'studio.youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'm365.cloud.microsoft',
        'copilot.cloud.microsoft',
        'app.notta.ai',
        'app.roboflow.com'
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

        const siteMode = (typeof chrome !== 'undefined'
            && chrome.runtime
            && chrome.runtime.getURL
            && chrome.runtime.getURL('').startsWith('moz-extension:'))
            ? 'ai_sites'
            : (settings.manualRtlSiteMode || 'allowed_sites');
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

