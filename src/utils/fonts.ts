export const NONE_FONT_ID = 'none';
export const DEFAULT_FONT_ID = 'iranyekan';
export const SELECTED_FONT_STORAGE_KEY = 'selectedFont';

export const NONE_FONT_TITLE = 'بدون تغییر فونت';
export const FONT_PREVIEW_SAMPLE = 'نمونه متن فارسی Abc';

export interface RtlFontFile {
    path: string;
    weight: number | string;
    sha256?: string;
}

export interface RtlFont {
    id: string;
    title: string;
    family: string;
    selectable?: boolean;
    files: RtlFontFile[];
    license?: string;
    version?: string;
    source?: string;
}

export interface FontsConfig {
    defaultFont?: string;
    licenseNotice?: string;
    fonts: RtlFont[];
}

let cachedConfig: FontsConfig | null = null;
let cachedPromise: Promise<FontsConfig> | null = null;

export function loadFontsConfig(): Promise<FontsConfig> {
    if (cachedConfig) {
        return Promise.resolve(cachedConfig);
    }
    if (cachedPromise) {
        return cachedPromise;
    }

    cachedPromise = (async () => {
        const url = chrome.runtime.getURL('fonts/ai-rtl-fonts.json');
        const response = await fetch(url);
        cachedConfig = await response.json();
        return cachedConfig as FontsConfig;
    })();

    return cachedPromise;
}

export function getSelectableFonts(config: FontsConfig): RtlFont[] {
    return (config.fonts || []).filter((font) => font.selectable !== false);
}

export function getFontById(config: FontsConfig, id: string): RtlFont | undefined {
    return (config.fonts || []).find((font) => font.id === id);
}

export function quoteFontFamily(family: string): string {
    return /[\s]/.test(family) ? `"${family}"` : family;
}

export function getFontFamilyCssValue(font: RtlFont): string {
    return `${quoteFontFamily(font.family)}, sans-serif`;
}

export function getFontFormat(path: string): string {
    if (path.endsWith('.woff2')) return 'woff2';
    if (path.endsWith('.woff')) return 'woff';
    if (path.endsWith('.ttf')) return 'truetype';
    return 'woff2';
}

export function buildFontFaceCss(fonts: RtlFont[], getUrl: (path: string) => string): string {
    return fonts
        .flatMap((font) =>
            font.files.map((file) => {
                const url = getUrl(`fonts/${file.path}`);
                return [
                    '@font-face {',
                    `  font-family: ${quoteFontFamily(font.family)};`,
                    '  font-style: normal;',
                    `  font-weight: ${file.weight};`,
                    '  font-display: swap;',
                    `  src: url(${JSON.stringify(url)}) format("${getFontFormat(file.path)}");`,
                    '}',
                ].join('\n');
            })
        )
        .join('\n');
}

export function normalizeSelectedFontId(fontId?: string | null): string {
    if (!fontId) {
        return DEFAULT_FONT_ID;
    }
    return fontId;
}

export function injectPreviewFontFaces(styleId: string, fonts: RtlFont[]): void {
    const css = buildFontFaceCss(fonts, (path) => chrome.runtime.getURL(path));
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    style.textContent = css;
}
