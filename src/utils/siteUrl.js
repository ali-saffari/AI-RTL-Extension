const SITE_ORIGIN = 'https://ai-rtl.ir';

/** Paths that stay Persian on the site and never take /en or /ar. */
const NEUTRAL_PREFIXES = ['/blog', '/survey', '/logos'];

export function localizeSitePath(path, locale = 'fa') {
    const raw = path.startsWith('/') ? path : `/${path}`;
    const hashIndex = raw.indexOf('#');
    const hash = hashIndex >= 0 ? raw.slice(hashIndex) : '';
    const beforeHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
    const queryIndex = beforeHash.indexOf('?');
    const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : '';
    let pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;

    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    if (!pathname) pathname = '/';

    const neutral = NEUTRAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    const lang = locale === 'en' || locale === 'ar' ? locale : 'fa';
    const localized = neutral || lang === 'fa'
        ? pathname
        : `/${lang}${pathname === '/' ? '' : pathname}`;

    if (localized === '/') return `/${query}${hash}`;
    return `${localized}/${query}${hash}`;
}

export function siteUrl(path, locale = 'fa') {
    return `${SITE_ORIGIN}${localizeSitePath(path, locale)}`;
}
