// Services that are not in manifest.json (dynamically injected)
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
    notebook: {
        name: 'NotebookLM',
        origins: ['*://notebook.google.com/*'],
        hostnames: ['notebook.google.com']
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

