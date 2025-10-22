const chatGpt = true;
const claude = true;
const copilot = true;
const githubCopilot = true;
const duckduckgo = true;
const perplexity = true;
const aiStudio = true;
const deepseek = true;
const youCom = true;
const qwenlm = true;
const poeCom = true;
const monica = true;
const gemini = true;
const grok = true;
const mistral = true;
const manus = true;
const kimi = true;
const blackbox = true;
const notebooklm = true;
const zai = true;
const lmarena = true;
const openrouter = true;
const minimax = true;







// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.sync.set({ chatGpt , claude ,  copilot ,  thebAi , duckduckgo});
//     console.log('Default chatGpt', chatGpt);
// });
//
//
//

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // در نصب اولیه، مقادیر پیش‌فرض را تنظیم می‌کنیم
        chrome.storage.sync.set({
            chatGpt, claude, copilot, githubCopilot,
            duckduckgo, perplexity,
            aiStudio, deepseek, youCom, qwenlm, poeCom, monica, gemini, grok, mistral, manus, kimi, blackbox, notebooklm, zai, lmarena, openrouter, minimax,
            rtlAlgorithm: 'advanced_section'
        });
        console.log('Default values set on installation');
    } else if (details.reason === 'update') {
        // در صورت به‌روزرسانی، بررسی می‌کنیم که مقادیر duckduckgo و perplexity وجود دارند یا خیر
        try {
            chrome.storage.sync.get((storedData) => {
            const updates = {};

            // اگر duckduckgo وجود نداشت، اضافه کنیم
            if (!storedData.hasOwnProperty('duckduckgo')) {
                updates.duckduckgo = true;
            }

            // اگر perplexity وجود نداشت، اضافه کنیم
            if (!storedData.hasOwnProperty('perplexity')) {
                updates.perplexity = true;
            }

            if (!storedData.hasOwnProperty('aiStudio')) {
                updates.aiStudio = true;
            }
            if (!storedData.hasOwnProperty('deepseek')) {
                updates.deepseek = true;
            }
            if (!storedData.hasOwnProperty('youCom')) {
                updates.youCom = true;
            }
            if (!storedData.hasOwnProperty('qwenlm')) {
                updates.qwenlm = true;
            }
            if (!storedData.hasOwnProperty('poeCom')) {
                updates.poeCom = true;
            }
            if (!storedData.hasOwnProperty('monica')) {
                updates.monica = true;
            }
            if (!storedData.hasOwnProperty('gemini')) {
                updates.gemini = true;
            }
            if (!storedData.hasOwnProperty('grok')) {
                updates.grok = true;
            }

            if (!storedData.hasOwnProperty('mistral')) {
                updates.mistral = true;
            }
            if (!storedData.hasOwnProperty('manus')) {
                updates.manus = true;
            }

            if (!storedData.hasOwnProperty('kimi')) {
                updates.kimi = true;
            }
            if (!storedData.hasOwnProperty('blackbox')) {
                updates.blackbox = true;
            }
            if (!storedData.hasOwnProperty('notebooklm')) {
                updates.notebooklm = true;
            }
            if (!storedData.hasOwnProperty('zai')) {
                updates.zai = true;
            }
            if (!storedData.hasOwnProperty('lmarena')) {
                updates.lmarena = true;
            }
            if (!storedData.hasOwnProperty('openrouter')) {
                updates.openrouter = true;
            }
            if (!storedData.hasOwnProperty('minimax')) {
                updates.minimax = true;
            }
            if (!storedData.hasOwnProperty('githubCopilot')) {
                updates.githubCopilot = true;
            }

            // اگر rtlAlgorithm وجود نداشت، اضافه کنیم
            if (!storedData.hasOwnProperty('rtlAlgorithm')) {
                updates.rtlAlgorithm = 'advanced_section';
            }

            // اگر چیزی برای به‌روزرسانی وجود داشت، ذخیره کنیم
            if (Object.keys(updates).length > 0) {
                chrome.storage.sync.set(updates, () => {
                    console.log('Missing values added during update:', updates);
                });
            } else {
                console.log('All values already exist:', storedData);
            }
        });
        } catch (error) {
            console.log('Chrome storage access failed during update:', error);
        }
    }
});
