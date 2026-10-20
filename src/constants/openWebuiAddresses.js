const DEFAULT_HOSTS = ['localhost', '127.0.0.1'];
const DEFAULT_PORTS = ['3000', '8080'];
const MAX_CUSTOM_ADDRESSES = 20;

let cachedAddresses = [];

export function setOpenWebuiAddressCache(addresses) {
    cachedAddresses = Array.isArray(addresses) ? addresses : [];
}

export function getOpenWebuiAddressCache() {
    return cachedAddresses;
}

function normalizeHostname(value) {
    return String(value || '').trim().toLowerCase().replace(/^\[|\]$/g, '');
}

export function formatOpenWebuiAddress(entry) {
    const port = entry.port ? `:${entry.port}` : '';
    return `${entry.protocol}//${entry.hostname}${port}`;
}

export function isOpenWebuiDefaultAddress(entry) {
    return entry?.protocol === 'http:'
        && DEFAULT_HOSTS.includes(entry.hostname)
        && DEFAULT_PORTS.includes(entry.port);
}

export function isProtectedOpenWebuiPattern(pattern) {
    return pattern === 'http://localhost/*' || pattern === 'http://127.0.0.1/*';
}

/**
 * @param {string} input
 * @returns {{ id: string, protocol: string, hostname: string, port: string, pattern: string } | null}
 */
export function parseOpenWebuiAddress(input) {
    let raw = String(input || '').trim();
    if (!raw || raw.length > 300) {
        return null;
    }
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
        raw = `http://${raw}`;
    }

    let url;
    try {
        url = new URL(raw);
    } catch {
        return null;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
    }
    if (url.username || url.password) {
        return null;
    }

    const hostname = normalizeHostname(url.hostname);
    if (!hostname || hostname.includes('*') || hostname.includes('/')) {
        return null;
    }

    const port = url.port || '';
    const entry = {
        protocol: url.protocol,
        hostname,
        port,
        pattern: `${url.protocol}//${hostname}/*`,
    };
    entry.id = formatOpenWebuiAddress(entry);
    return entry;
}

export function parseOpenWebuiAddressList(value) {
    const raw = Array.isArray(value) ? value.join('\n') : String(value || '');
    const parts = raw.split(/[\n,]+/);
    const unique = [];
    parts.forEach((part) => {
        const parsed = parseOpenWebuiAddress(part);
        if (!parsed || isOpenWebuiDefaultAddress(parsed)) {
            return;
        }
        if (unique.some((item) => item.id === parsed.id)) {
            return;
        }
        unique.push(parsed);
    });
    return unique.slice(0, MAX_CUSTOM_ADDRESSES);
}

export function serializeOpenWebuiAddresses(addresses) {
    return (addresses || []).map((entry) => entry.id || formatOpenWebuiAddress(entry)).join('\n');
}

export function readOpenWebuiAddresses(stored) {
    const site = stored && typeof stored === 'object' ? stored.openwebui : null;
    return parseOpenWebuiAddressList(site?.customUrls);
}

export function matchesOpenWebuiCustom(hostname, port, addresses = cachedAddresses) {
    const host = normalizeHostname(hostname);
    const currentPort = port == null ? '' : String(port);
    return (addresses || []).some((entry) => entry.hostname === host && entry.port === currentPort);
}

export function originPatternForPage(pageUrl) {
    const parsed = new URL(pageUrl);
    return `${parsed.protocol}//${normalizeHostname(parsed.hostname)}/*`;
}
