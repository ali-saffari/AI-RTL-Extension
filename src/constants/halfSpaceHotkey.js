export const HALF_SPACE_STORAGE_KEY = 'halfSpaceHotkeySites';
export const HALF_SPACE_CHAR = '\u200c';
export const DEFAULT_HALF_SPACE_SITES = Object.freeze({
    chatGpt: true
});

export function normalizeHalfSpaceSites(stored) {
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
        return { ...DEFAULT_HALF_SPACE_SITES };
    }
    return { ...stored };
}

export function isHalfSpaceEnabledForSite(_stored, serviceKey) {
    return serviceKey === 'chatGpt';
}
