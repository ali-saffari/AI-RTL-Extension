// Services that are not in the browser manifests (dynamically injected)
export const DYNAMIC_SERVICES = {
    synaps: {
        name: 'Synaps',
        origins: ['*://synaps.app/*', '*://www.synaps.app/*', '*://my.synaps.app/*'],
        hostnames: ['synaps.app', 'www.synaps.app', 'my.synaps.app']
    },
    notion: {
        name: 'Notion',
        origins: ['*://notion.so/*', '*://www.notion.so/*'],
        hostnames: ['notion.so', 'www.notion.so']
    },
    businessGemini: {
        name: 'Business Gemini',
        origins: ['*://business.gemini.google/*'],
        hostnames: ['business.gemini.google']
    },
    genspark: {
        name: 'Genspark',
        origins: ['*://genspark.ai/*', '*://www.genspark.ai/*'],
        hostnames: ['genspark.ai', 'www.genspark.ai']
    },
    // google: {
    //     name: 'Google',
    //     origins: ['*://google.com/*', '*://www.google.com/*'],
    //     hostnames: ['google.com', 'www.google.com']
    // },
    arena: {
        name: 'Arena',
        origins: ['*://arena.ai/*'],
        hostnames: ['arena.ai']
    },

    duckai: {
        name: 'Duck AI',
        origins: ['*://duck.ai/*'],
        hostnames: ['duck.ai']
    },
    clickup: {
        name: 'ClickUp',
        origins: ['*://app.clickup.com/*'],
        hostnames: ['app.clickup.com']
    },
    t3chat: {
        name: 'T3 Chat',
        origins: ['*://t3.chat/*', '*://www.t3.chat/*'],
        hostnames: ['t3.chat', 'www.t3.chat']
    },
    vivado: {
        name: 'Vivado Doc Search',
        origins: ['*://vivado.amd.com/*'],
        hostnames: ['vivado.amd.com']
    },
    atxp: {
        name: 'ATXP Chat',
        origins: ['*://chat.atxp.ai/*'],
        hostnames: ['chat.atxp.ai']
    },
    googleNotebook: {
        name: 'Google Notebook',
        origins: ['*://notebook.google.com/*'],
        hostnames: ['notebook.google.com']
    },
    consensus: {
        name: 'Consensus',
        origins: ['*://consensus.app/*', '*://www.consensus.app/*'],
        hostnames: ['consensus.app', 'www.consensus.app']
    },
    scispace: {
        name: 'SciSpace',
        origins: ['*://scispace.com/*', '*://www.scispace.com/*'],
        hostnames: ['scispace.com', 'www.scispace.com']
    },
    chatboxai: {
        name: 'Chatbox AI',
        origins: ['*://web.chatboxai.app/*'],
        hostnames: ['web.chatboxai.app']
    },
    lumo: {
        name: 'Lumo',
        origins: ['*://lumo.proton.me/*'],
        hostnames: ['lumo.proton.me']
    },
    meta: {
        name: 'Meta AI',
        origins: ['*://meta.ai/*', '*://www.meta.ai/*'],
        hostnames: ['meta.ai', 'www.meta.ai']
    },
    googleLabs: {
        name: 'Google Labs (Flow)',
        origins: ['*://labs.google/*', '*://www.labs.google/*'],
        hostnames: ['labs.google', 'www.labs.google']
    },
    googleDrive: {
        name: 'Google Drive',
        origins: [
            '*://docs.google.com/*',
            '*://drive.google.com/*',
            '*://sheets.google.com/*',
            '*://slides.google.com/*',
            '*://forms.google.com/*'
        ],
        hostnames: [
            'docs.google.com',
            'drive.google.com',
            'sheets.google.com',
            'slides.google.com',
            'forms.google.com'
        ]
    },
    veo3: {
        name: 'Veo 3',
        origins: ['*://www-veo3.com/*'],
        hostnames: ['www-veo3.com']
    },
    fal: {
        name: 'fal.ai',
        origins: ['*://fal.ai/*', '*://www.fal.ai/*'],
        hostnames: ['fal.ai', 'www.fal.ai']
    },
    bfl: {
        name: 'Black Forest',
        origins: ['*://bfl.ai/*', '*://*.bfl.ai/*'],
        hostnames: ['bfl.ai', 'www.bfl.ai', 'dashboard.bfl.ai', 'playground.bfl.ai']
    },
    characterAi: {
        name: 'Character.AI',
        origins: ['*://character.ai/*', '*://www.character.ai/*', '*://c.ai/*', '*://www.c.ai/*'],
        hostnames: ['character.ai', 'www.character.ai', 'c.ai', 'www.c.ai']
    },
    pi: {
        name: 'Pi',
        origins: ['*://pi.ai/*', '*://www.pi.ai/*'],
        hostnames: ['pi.ai', 'www.pi.ai']
    },
    cursor: {
        name: 'Cursor',
        origins: ['*://cursor.com/*', '*://www.cursor.com/*', '*://docs.cursor.com/*'],
        hostnames: ['cursor.com', 'www.cursor.com', 'docs.cursor.com']
    },
    typingmind: {
        name: 'TypingMind',
        origins: ['*://typingmind.com/*', '*://www.typingmind.com/*'],
        hostnames: ['typingmind.com', 'www.typingmind.com']
    },
    huggingface: {
        name: 'Hugging Face',
        origins: ['*://huggingface.co/*', '*://www.huggingface.co/*', '*://hf.co/*', '*://www.hf.co/*'],
        hostnames: ['huggingface.co', 'www.huggingface.co', 'hf.co', 'www.hf.co']
    },
    dash0: {
        name: 'Dash0',
        origins: ['*://dash0.com/*', '*://www.dash0.com/*', '*://app.dash0.com/*'],
        hostnames: ['dash0.com', 'www.dash0.com', 'app.dash0.com']
    },
    zerve: {
        name: 'Zerve',
        origins: ['*://zerve.ai/*', '*://www.zerve.ai/*', '*://app.zerve.ai/*'],
        hostnames: ['zerve.ai', 'www.zerve.ai', 'app.zerve.ai']
    },
    qwenCoder: {
        name: 'QWEN CODER',
        origins: ['*://coder.qwen.ai/*'],
        hostnames: ['coder.qwen.ai']
    },
    kimi: {
        name: 'Kimi',
        origins: ['*://kimi.ai/*', '*://www.kimi.ai/*'],
        hostnames: ['kimi.ai', 'www.kimi.ai']
    },
    digen: {
        name: 'Digen',
        origins: ['*://digen.ai/*', '*://*.digen.ai/*'],
        hostnames: ['digen.ai', 'www.digen.ai', 'agent.digen.ai']
    },
    ernie: {
        name: 'Ernie (Baidu)',
        origins: [
            '*://wenxin.baidu.com/*',
            '*://www.wenxin.baidu.com/*',
            '*://chat.baidu.com/*',
            '*://www.chat.baidu.com/*'
        ],
        hostnames: ['wenxin.baidu.com', 'www.wenxin.baidu.com', 'chat.baidu.com', 'www.chat.baidu.com']
    },
    sakana: {
        name: 'Sakana Chat',
        origins: ['*://chat.sakana.ai/*', '*://www.chat.sakana.ai/*'],
        hostnames: ['chat.sakana.ai', 'www.chat.sakana.ai']
    },
    m365: {
        name: 'Microsoft 365 Copilot',
        origins: ['*://m365.cloud.microsoft/*', '*://copilot.cloud.microsoft/*'],
        hostnames: ['m365.cloud.microsoft', 'copilot.cloud.microsoft']
    }
};







// Helper function to get service name from hostname (for background script)
export function getServiceNameFromHostname(hostname) {
    const host = String(hostname || '').toLowerCase();
    for (const [key, service] of Object.entries(DYNAMIC_SERVICES)) {
        if (service.hostnames.some((allowed) => host === allowed || host.endsWith('.' + allowed))) {
            return key;
        }
    }
    return null;
}

