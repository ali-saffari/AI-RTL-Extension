export function normalizeTagNameList(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .map((tag) => String(tag || '').trim().toLowerCase())
        .filter(Boolean);
}

export function resolveAdjustedTagList(defaults, addTags, removeTags) {
    const extraTags = normalizeTagNameList(addTags);
    const removeSet = new Set(normalizeTagNameList(removeTags));
    const seen = new Set();
    const resolved = [];

    [...defaults, ...extraTags].forEach((tag) => {
        if (removeSet.has(tag) || seen.has(tag)) {
            return;
        }
        seen.add(tag);
        resolved.push(tag);
    });

    return resolved;
}
