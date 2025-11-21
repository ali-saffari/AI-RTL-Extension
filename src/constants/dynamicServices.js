// Services that are not in manifest.json (dynamically injected)
export const DYNAMIC_SERVICES = {
    synaps: {
        name: 'Synaps',
        origins: ['*://synaps.app/*', '*://www.synaps.app/*', '*://my.synaps.app/*'],
        hostnames: ['synaps.app', 'www.synaps.app', 'my.synaps.app']
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

