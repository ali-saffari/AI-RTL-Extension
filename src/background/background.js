// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, copilot: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    notebooklm: true, jules: true, lovable: true, synaps: true, writesonic: true, zai: true, lmarena: true, openrouter: true, minimax: true, oneMinai: true, digen: true
};

// ============================================
// INITIALIZATION
// ============================================

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.sync.set({
            ...SERVICE_FLAGS,
            rtlAlgorithmMode: 'advanced_full'
        });
    } else if (details.reason === 'update') {
        try {
            chrome.storage.sync.get((storedData) => {
                const updates = {};
                const allServices = Object.keys(SERVICE_FLAGS);
                
                allServices.forEach(service => {
                    if (!storedData.hasOwnProperty(service)) {
                        updates[service] = true;
                    }
                });
                
                if (!storedData.hasOwnProperty('rtlAlgorithmMode')) {
                    updates.rtlAlgorithmMode = storedData.rtlAlgorithm === 'first_word' ? 'first_word' : 'advanced_full';
                }
                
                if (Object.keys(updates).length > 0) {
                    chrome.storage.sync.set(updates);
                }
            });
        } catch (error) {
            console.log('Update handler warning:', error.message);
        }
    }
});
