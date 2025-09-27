const chatGpt = true;
const claude = true;
const copilot = true;
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
            chatGpt, claude, copilot,
            duckduckgo, perplexity,
            aiStudio, deepseek, youCom, qwenlm, poeCom, monica, gemini, grok, mistral, manus, kimi, blackbox, notebooklm,
            rtlAlgorithm: 'advanced_section'
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
    }
});
