// ============================================
// CONFIGURATION
// ============================================

const SERVICE_FLAGS = {
    chatGpt: true, claude: true, copilot: true, githubCopilot: true,
    duckduckgo: true, perplexity: true, aiStudio: true, deepseek: true,
    youCom: true, qwenlm: true, poeCom: true, monica: true, gemini: true,
    grok: true, mistral: true, manus: true, kimi: true, blackbox: true,
    notebooklm: true, jules: true, lovable: true, synaps: true, writesonic: true, zai: true, lmarena: true, openrouter: true, minimax: true, oneMinai: true, digen: true, ernie: true
};

// ============================================
// USER ID GENERATION & VALIDATION
// ============================================

/**
 * Get or create user ID and update uninstall URL with uid
 */
async function initializeUserId() {
    try {
        const result = await chrome.storage.sync.get(['uid']);
        let uid = result.uid;
        
        if (!uid) {
            // Generate 10-digit random number
            const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
            const numberString = randomNumber.toString();
            
            // Calculate checksum (like Iranian National ID algorithm)
            let sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(numberString[9 - i], 10) * (i + 1);
            }
            const remainder = sum % 11;
            const checksum = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'A' : (11 - remainder).toString());
            
            uid = numberString + checksum;
            await chrome.storage.sync.set({ uid });
        }
        
        chrome.runtime.setUninstallURL(`https://chatgpt-rtl.ir/uninstall-feedback/?uid=${uid}&source=extension-uninstall`);
        return uid;
    } catch (error) {
        console.error('Error initializing user ID:', error);
        chrome.runtime.setUninstallURL('https://chatgpt-rtl.ir/uninstall-feedback/?error=1&source=extension-uninstall');
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize user ID and set uninstall URL when service worker starts
initializeUserId();

chrome.runtime.onInstalled.addListener(async (details) => {
    // Initialize user ID and set uninstall URL with ID
    await initializeUserId();
    
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

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
        try {
            // Open popup in a new tab
            const popupUrl = chrome.runtime.getURL('index.html');
            console.log('[Background] Opening popup at:', popupUrl);
            chrome.tabs.create({ url: popupUrl }, (tab) => {
                if (chrome.runtime.lastError) {
                    console.error('[Background] Error creating tab:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    console.log('[Background] Tab created successfully:', tab);
                    sendResponse({ success: true });
                }
            });
            return true; // Keep the message channel open for async response
        } catch (error) {
            console.error('[Background] Exception opening popup:', error);
            sendResponse({ success: false, error: error.message });
            return true;
        }
    } else if (message.action === 'openOptionsPage') {
        try {
            // Open options page
            chrome.runtime.openOptionsPage();
            sendResponse({ success: true });
            return true;
        } catch (error) {
            console.error('[Background] Exception opening options page:', error);
            sendResponse({ success: false, error: error.message });
            return true;
        }
    }
    return false;
});
