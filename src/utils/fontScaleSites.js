export const FONT_SCALE_MODE_ZOOM = 'zoom';
export const FONT_SCALE_MODE_FONT_SIZE = 'font-size';
export const DEFAULT_FONT_SCALE_MODE = FONT_SCALE_MODE_FONT_SIZE;

/**
 * Scale method per site:
 *   'zoom'      → html { zoom }
 *   'font-size' → html { font-size }
 *
 * Change each line to 'zoom' or 'font-size'.
 * Unlisted sites (including manual RTL) use DEFAULT_FONT_SCALE_MODE.
 */
export const FONT_SCALE_SITE_MODES = {
    'chatgpt.com': 'font-size',
    'chat.openai.com': 'font-size',

    'claude.ai': 'font-size',
    'copilot.microsoft.com': 'font-size',
    'bing.com': 'font-size',
    'github.com': 'font-size',
    'perplexity.ai': 'font-size',
    'duckduckgo.com': 'font-size',
    'aistudio.google.com': 'font-size',
    'chat.deepseek.com': 'font-size',
    'you.com': 'font-size',
    'chat.qwenlm.ai': 'font-size',
    'chat.qwen.ai': 'font-size',
    'coder.qwen.ai': 'font-size',
    'poe.com': 'font-size',
    'monica.im': 'font-size',
    'gemini.google.com': 'font-size',
    'business.gemini.google': 'font-size',
    'grok.com': 'font-size',
    'chat.mistral.ai': 'font-size',
    'manus.im': 'font-size',
    'kimi.com': 'font-size',
    'kimi.ai': 'font-size',
    'blackbox.ai': 'font-size',
    'notebooklm.google.com': 'font-size',
    'notebook.google.com': 'font-size',
    'usercontent.goog': 'font-size',
    'chat.z.ai': 'font-size',
    'arena.ai': 'font-size',
    'lmarena.ai': 'font-size',
    'openrouter.ai': 'font-size',
    'agent.minimax.io': 'font-size',
    'jules.google.com': 'font-size',
    '1min.ai': 'font-size',
    'app.1min.ai': 'font-size',
    'digen.ai': 'font-size',
    'agent.digen.ai': 'font-size',
    'lovable.dev': 'font-size',
    'synaps.app': 'font-size',
    'app.writesonic.com': 'font-size',
    'ernie.baidu.com': 'font-size',
    'wenxin.baidu.com': 'font-size',
    'chat.baidu.com': 'font-size',
    'gamma.app': 'font-size',
    'notion.so': 'font-size',
    'genspark.ai': 'font-size',
    'duck.ai': 'font-size',
    'app.clickup.com': 'font-size',
    't3.chat': 'font-size',
    'vivado.amd.com': 'font-size',
    'chat.atxp.ai': 'font-size',
    'consensus.app': 'font-size',
    'scispace.com': 'font-size',
    'web.chatboxai.app': 'font-size',
    'lumo.proton.me': 'font-size',
    'meta.ai': 'font-size',
    'labs.google': 'font-size',
    'docs.google.com': 'font-size',
    'drive.google.com': 'font-size',
    'sheets.google.com': 'font-size',
    'slides.google.com': 'font-size',
    'forms.google.com': 'font-size',
    'www-veo3.com': 'font-size',
    'fal.ai': 'font-size',
    'bfl.ai': 'font-size',
    'character.ai': 'font-size',
    'c.ai': 'font-size',
    'pi.ai': 'font-size',
    'cursor.com': 'font-size',
    'typingmind.com': 'font-size',
    'huggingface.co': 'font-size',
    'hf.co': 'font-size',
    'dash0.com': 'font-size',
    'zerve.ai': 'font-size',
    'chat.sakana.ai': 'font-size',
    'm365.cloud.microsoft': 'font-size',
    'copilot.cloud.microsoft': 'font-size',
};

/*
export const FONT_SCALE_SITE_MODES = {
    'chatgpt.com': 'font-size',
    'chat.openai.com': 'font-size',

    'claude.ai': 'zoom',
    'copilot.microsoft.com': 'zoom',
    'bing.com': 'zoom',
    'github.com': 'zoom',
    'perplexity.ai': 'font-size',
    'duckduckgo.com': 'zoom',
    'aistudio.google.com': 'zoom',
    'chat.deepseek.com': 'zoom',
    'you.com': 'zoom',
    'chat.qwenlm.ai': 'zoom',
    'chat.qwen.ai': 'zoom',
    'coder.qwen.ai': 'zoom',
    'poe.com': 'zoom',
    'monica.im': 'zoom',
    'gemini.google.com': 'zoom',
    'business.gemini.google': 'zoom',
    'grok.com': 'font-size',
    'chat.mistral.ai': 'zoom',
    'manus.im': 'zoom',
    'kimi.com': 'zoom',
    'kimi.ai': 'zoom',
    'blackbox.ai': 'zoom',
    'notebooklm.google.com': 'zoom',
    'notebook.google.com': 'zoom',
    'usercontent.goog': 'zoom',
    'chat.z.ai': 'zoom',
    'arena.ai': 'zoom',
    'lmarena.ai': 'zoom',
    'openrouter.ai': 'zoom',
    'agent.minimax.io': 'zoom',
    'jules.google.com': 'zoom',
    '1min.ai': 'zoom',
    'app.1min.ai': 'zoom',
    'digen.ai': 'zoom',
    'agent.digen.ai': 'zoom',
    'lovable.dev': 'zoom',
    'synaps.app': 'zoom',
    'app.writesonic.com': 'zoom',
    'ernie.baidu.com': 'zoom',
    'wenxin.baidu.com': 'zoom',
    'chat.baidu.com': 'zoom',
    'gamma.app': 'font-size',
    'notion.so': 'zoom',
    'genspark.ai': 'zoom',
    'duck.ai': 'zoom',
    'app.clickup.com': 'zoom',
    't3.chat': 'zoom',
    'vivado.amd.com': 'zoom',
    'chat.atxp.ai': 'zoom',
    'consensus.app': 'zoom',
    'scispace.com': 'zoom',
    'web.chatboxai.app': 'zoom',
    'lumo.proton.me': 'zoom',
    'meta.ai': 'zoom',
    'labs.google': 'zoom',
    'docs.google.com': 'zoom',
    'drive.google.com': 'zoom',
    'sheets.google.com': 'zoom',
    'slides.google.com': 'zoom',
    'forms.google.com': 'zoom',
    'www-veo3.com': 'zoom',
    'fal.ai': 'zoom',
    'bfl.ai': 'zoom',
    'character.ai': 'zoom',
    'c.ai': 'zoom',
    'pi.ai': 'zoom',
    'cursor.com': 'zoom',
    'typingmind.com': 'zoom',
    'huggingface.co': 'zoom',
    'hf.co': 'zoom',
    'dash0.com': 'zoom',
    'zerve.ai': 'zoom',
    'chat.sakana.ai': 'zoom',
    'm365.cloud.microsoft': 'zoom',
    'copilot.cloud.microsoft': 'zoom',
};
*/

function normalizeHostname(hostname) {
    return String(hostname || '')
        .replace(/^www\./, '')
        .toLowerCase();
}

export function getFontScaleMode(hostname) {
    const host = normalizeHostname(hostname || (typeof location !== 'undefined' ? location.hostname : ''));
    if (!host) {
        return DEFAULT_FONT_SCALE_MODE;
    }

    if (FONT_SCALE_SITE_MODES[host]) {
        return FONT_SCALE_SITE_MODES[host];
    }

    const match = Object.keys(FONT_SCALE_SITE_MODES).find((site) => {
        const key = normalizeHostname(site);
        return host === key || host.endsWith('.' + key);
    });

    return match ? FONT_SCALE_SITE_MODES[match] : DEFAULT_FONT_SCALE_MODE;
}
