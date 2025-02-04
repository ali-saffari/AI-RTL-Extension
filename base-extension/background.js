const chatGpt = true;
const claude = true;
const copilot = true;
const freegpt = true;
const thebAi = true
const duckduckgo = true
const perplexity = true
const aiStudio = true
const deepseek = true
const youCom = true
const qwenlm = true


// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.sync.set({ chatGpt , claude ,  copilot ,  freegpt , thebAi , duckduckgo});
//     console.log('Default chatGpt', chatGpt);
// });
//
//
//

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // در نصب اولیه، مقادیر پیش‌فرض را تنظیم می‌کنیم
        chrome.storage.sync.set({
            chatGpt, claude, copilot,
            freegpt, thebAi, duckduckgo, perplexity,
            aiStudio,deepseek, youCom , qwenlm
        });
        console.log('Default values set on installation');
    } else if (details.reason === 'update') {
        // در صورت به‌روزرسانی، بررسی می‌کنیم که مقادیر duckduckgo و perplexity وجود دارند یا خیر
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


            // اگر چیزی برای به‌روزرسانی وجود داشت، ذخیره کنیم
            if (Object.keys(updates).length > 0) {
                chrome.storage.sync.set(updates, () => {
                    console.log('Missing values added during update:', updates);
                });
            } else {
                console.log('All values already exist:', storedData);
            }
        });
    }
});
