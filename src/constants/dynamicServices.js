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
        origins: ['*://character.ai/*', '*://www.character.ai/*'],
        hostnames: ['character.ai', 'www.character.ai']
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
    }
};







// Helper function to get service name from hostname (for background script)
export function getServiceNameFromHostname(hostname) {
    for (const [key, service] of Object.entries(DYNAMIC_SERVICES)) {
        if (service.hostnames.includes(hostname)) {
            return key;
        }
    }
    return null;
}

