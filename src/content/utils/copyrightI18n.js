const COPYRIGHT_BY_LOCALE = {
    fa: {
        hope: 'امیدوارم از نسخه بهینه شده برای فارسی زبانان لذت ببرید',
        donate: 'دوست داری ازش حمایت کنی ؟',
    },
    en: {
        hope: 'I hope you enjoy the optimized version for right-to-left languages',
        donate: 'Want to support it?',
    },
    ar: {
        hope: 'أتمنى أن تستمتعوا بالنسخة المحسّنة للناطقين بالعربية',
        donate: 'هل ترغب في دعمه؟',
    },
};

export function getCopyrightTexts(locale) {
    return COPYRIGHT_BY_LOCALE[locale] || COPYRIGHT_BY_LOCALE.fa;
}

function copyrightDir(locale) {
    return locale === 'en' ? 'ltr' : 'rtl';
}

function eachCopyrightRoot(root, visit) {
    visit(root);
    root.querySelectorAll('*').forEach((el) => {
        if (el.shadowRoot) eachCopyrightRoot(el.shadowRoot, visit);
    });
}

export function applyCopyrightLocale(locale) {
    const texts = getCopyrightTexts(locale);
    const dir = copyrightDir(locale);
    const ltr = dir === 'ltr';
    eachCopyrightRoot(document, (root) => {
        root.querySelectorAll('.AsBox').forEach((box) => {
            box.setAttribute('dir', dir);
            box.classList.toggle('AsLtr', ltr);
            box.classList.toggle('AsRtl', !ltr);
            if (ltr) {
                box.style.setProperty('direction', 'ltr', 'important');
                box.style.setProperty('text-align', 'left', 'important');
                box.style.setProperty('display', 'flex');
                box.style.setProperty('align-items', 'center');
                box.style.setProperty('justify-content', 'flex-start');
                box.style.setProperty('flex-wrap', 'wrap');
                box.style.setProperty('gap', '6px');
            } else {
                box.style.removeProperty('direction');
                box.style.removeProperty('text-align');
                box.style.removeProperty('display');
                box.style.removeProperty('align-items');
                box.style.removeProperty('justify-content');
                box.style.removeProperty('flex-wrap');
                box.style.removeProperty('gap');
            }
        });
        root.querySelectorAll('.AsHope').forEach((el) => {
            el.textContent = texts.hope;
            el.setAttribute('dir', dir);
        });
        root.querySelectorAll('a.AsDonate').forEach((el) => {
            el.textContent = texts.donate;
            el.setAttribute('dir', dir);
        });
    });
}

let copyrightLanguageWatchStarted = false;

export function watchCopyrightLanguage() {
    if (copyrightLanguageWatchStarted) return;
    copyrightLanguageWatchStarted = true;
    try {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'sync' || !changes.uiLanguage) return;
            applyCopyrightLocale(changes.uiLanguage.newValue);
        });
    } catch {
        // Ignore outside an extension context.
    }
}

export async function resolveCopyrightTexts() {
    let locale = 'fa';
    try {
        const result = await chrome.storage.sync.get(['uiLanguage']);
        if (result?.uiLanguage && COPYRIGHT_BY_LOCALE[result.uiLanguage]) {
            locale = result.uiLanguage;
        }
    } catch {
        // Keep Persian default outside a valid extension context.
    }
    const texts = getCopyrightTexts(locale);
    return { ...texts, dir: locale === 'en' ? 'ltr' : 'rtl' };
}
