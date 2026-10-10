import { arMessages } from './ar';
import { enMessages } from './en';
import { faMessages, MessageKey, Messages } from './fa';

export type LocaleCode = 'fa' | 'en' | 'ar';

/** UI chrome stays RTL for every language so control positions never flip. */
export type TextDirection = 'rtl';

export type LocaleDefinition = {
    code: LocaleCode;
    /** Name shown in the language menu, in that language. */
    nativeName: string;
    /** Short label for the header button. */
    shortLabel: string;
    dir: TextDirection;
    messages: Messages;
};

/**
 * Register a new language here: add its code to LocaleCode, add a messages
 * file that satisfies Messages, then append one entry to this list.
 * Persian stays first and is the default. Layout direction is always RTL.
 */
export const locales: readonly LocaleDefinition[] = [
    { code: 'fa', nativeName: 'فارسی', shortLabel: 'فا', dir: 'rtl', messages: faMessages },
    { code: 'en', nativeName: 'English', shortLabel: 'EN', dir: 'rtl', messages: enMessages },
    { code: 'ar', nativeName: 'العربية', shortLabel: 'ع', dir: 'rtl', messages: arMessages },
];

export const DEFAULT_LOCALE: LocaleCode = 'fa';

export const UI_LANGUAGE_STORAGE_KEY = 'uiLanguage';

const localeByCode = new Map(locales.map((locale) => [locale.code, locale]));

export function isLocaleCode(value: unknown): value is LocaleCode {
    return typeof value === 'string' && localeByCode.has(value as LocaleCode);
}

export function getLocale(code: LocaleCode): LocaleDefinition {
    return localeByCode.get(code) ?? locales[0];
}

function lookup(messages: Messages, key: MessageKey): string | undefined {
    const value = key.split('.').reduce<unknown>((node, part) => {
        if (node && typeof node === 'object' && part in node) {
            return (node as Record<string, unknown>)[part];
        }
        return undefined;
    }, messages);
    return typeof value === 'string' ? value : undefined;
}

export function translate(code: LocaleCode, key: MessageKey, vars?: Record<string, string | number>): string {
    const template = lookup(getLocale(code).messages, key) ?? lookup(faMessages, key) ?? key;
    if (!vars) {
        return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, name: string) => (
        vars[name] === undefined ? '' : String(vars[name])
    ));
}

export type { MessageKey };
