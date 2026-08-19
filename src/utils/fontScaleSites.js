export const FONT_SCALE_MODE_ZOOM = 'zoom';
export const FONT_SCALE_MODE_FONT_SIZE = 'font-size';
export const DEFAULT_FONT_SCALE_MODE = FONT_SCALE_MODE_ZOOM;

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

    'claude.ai': 'zoom',
    'copilot.microsoft.com': 'zoom',
    'bing.com': 'zoom',
    'github.com': 'zoom',
    'perplexity.ai': 'zoom',
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
    'grok.com': 'zoom',
    'chat.mistral.ai': 'zoom',
    'manus.im': 'zoom',
    'kimi.com': 'zoom',
    'blackbox.ai': 'zoom',
    'notebooklm.google.com': 'zoom',
    'notebook.google.com': 'zoom',
    'chat.z.ai': 'zoom',
    'arena.ai': 'zoom',
    'lmarena.ai': 'zoom',
    'openrouter.ai': 'zoom',
    'agent.minimax.io': 'zoom',
    'jules.google.com': 'zoom',
    '1min.ai': 'zoom',
    'app.1min.ai': 'zoom',
    'digen.ai': 'zoom',
    'lovable.dev': 'zoom',
    'synaps.app': 'zoom',
    'app.writesonic.com': 'zoom',
    'ernie.baidu.com': 'zoom',
    'gamma.app': 'zoom',
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
};

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
