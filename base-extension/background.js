const chatGpt = true;
const claude = true;
const copilot = true;
const freegpt = true;


chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ chatGpt , claude ,  copilot ,  freegpt});
    console.log('Default chatGpt', chatGpt);
});






