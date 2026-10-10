import React from 'react';
import {
    DEFAULT_LOCALE,
    LocaleCode,
    LocaleDefinition,
    UI_LANGUAGE_STORAGE_KEY,
    getLocale,
    isLocaleCode,
    locales,
    translate,
} from './locales';
import { MessageKey } from './locales/fa';

type I18nContextValue = {
    locale: LocaleCode;
    dir: LocaleDefinition['dir'];
    locales: readonly LocaleDefinition[];
    setLocale: (code: LocaleCode) => void;
    t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = React.useState<LocaleCode>(DEFAULT_LOCALE);

    React.useEffect(() => {
        try {
            chrome.storage.sync.get([UI_LANGUAGE_STORAGE_KEY], (result) => {
                if (chrome.runtime.lastError) {
                    return;
                }
                if (isLocaleCode(result[UI_LANGUAGE_STORAGE_KEY])) {
                    setLocaleState(result[UI_LANGUAGE_STORAGE_KEY]);
                }
            });
        } catch {
            // Keep the Persian default outside an extension context.
        }

        const onStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName !== 'sync' || !changes[UI_LANGUAGE_STORAGE_KEY]) {
                return;
            }
            const next = changes[UI_LANGUAGE_STORAGE_KEY].newValue;
            setLocaleState(isLocaleCode(next) ? next : DEFAULT_LOCALE);
        };

        try {
            chrome.storage.onChanged.addListener(onStorageChange);
        } catch {
            return;
        }

        return () => {
            try {
                chrome.storage.onChanged.removeListener(onStorageChange);
            } catch {
                // Ignore
            }
        };
    }, []);

    const setLocale = React.useCallback((code: LocaleCode) => {
        setLocaleState(code);
        try {
            chrome.storage.sync.set({ [UI_LANGUAGE_STORAGE_KEY]: code });
        } catch {
            // Ignore
        }
    }, []);

    const active = getLocale(locale);

    React.useEffect(() => {
        document.documentElement.lang = active.code;
        // Keep the popup/options chrome RTL so English never reshuffles the layout.
        document.documentElement.dir = 'rtl';
    }, [active.code]);

    const value = React.useMemo<I18nContextValue>(() => ({
        locale: active.code,
        dir: active.dir,
        locales,
        setLocale,
        t: (key, vars) => translate(active.code, key, vars),
    }), [active.code, active.dir, setLocale]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const value = React.useContext(I18nContext);
    if (!value) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return value;
}
