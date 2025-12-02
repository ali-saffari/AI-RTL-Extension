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

