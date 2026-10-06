const LOCAL_API_BASE = 'http://127.0.0.1:4000';
const PRODUCTION_API_BASE = 'https://api.ai-rtl.ir';

export async function devApiBase() {
    const stored = await chrome.storage.local.get('debugApiTarget');
    return stored.debugApiTarget === 'local' ? LOCAL_API_BASE : PRODUCTION_API_BASE;
}
