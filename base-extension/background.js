const chatGpt = true;
const claude = true;
const copilot = true;
const freegpt = true;
const thebAi = true


chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ chatGpt , claude ,  copilot ,  freegpt , thebAi});
    console.log('Default chatGpt', chatGpt);
});






