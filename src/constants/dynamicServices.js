// Services that are not in manifest.json (dynamically injected)
export const DYNAMIC_SERVICES = {
    writesonic: {
        name: 'Writesonic',
        origins: ['*://app.writesonic.com/*', '*://www.app.writesonic.com/*'],
        hostnames: ['app.writesonic.com', 'www.app.writesonic.com']
    },
    lovable: {
        name: 'Lovable',
        origins: ['*://lovable.dev/*', '*://www.lovable.dev/*'],
        hostnames: ['lovable.dev', 'www.lovable.dev']
    },
    synaps: {
        name: 'Synaps',
        origins: ['*://synaps.app/*', '*://www.synaps.app/*', '*://my.synaps.app/*'],
        hostnames: ['synaps.app', 'www.synaps.app', 'my.synaps.app']
    },
    ernie: {
        name: 'Ernie',
        origins: ['*://ernie.baidu.com/*', '*://www.ernie.baidu.com/*'],
        hostnames: ['ernie.baidu.com', 'www.ernie.baidu.com']
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

