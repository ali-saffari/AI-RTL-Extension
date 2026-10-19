import { observeDomSections } from '../utils/domObserver.js';
import { applyRtlToContainer, applyRtlToElement, processTablesInContainer, setTextDirectionAndFont } from '../utils/directionUtils/index.js';
import { SITE_SETTINGS_STORAGE_KEY, isNotionSiteFontOn, isNotionTablesRtlOn } from '../../constants/siteSettings.js';

const USER_MESSAGE_SELECTOR = '[data-agent-service-scroll-anchor^="local:"] div:has(> span)';
const ASSISTANT_MESSAGE_SELECTOR = '[data-agent-service-scroll-anchor^="event_"] p';
const INPUT_SELECTOR = 'textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]';
const TABLE_SELECTOR = 'table, [role="table"], .notion-table-view-cell, .notion-table-view-header-cell';
const SITE_FONT_STYLE_ID = 'notion-site-font-style';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true,
    setUnicodeBidi: 'isolate',
    rtlClass: 'AsRtl',
    ltrClass: 'AsLtr'
};

const USER_MESSAGE_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    isContainer: true,
    setTextAlign: true
};

const ASSISTANT_MESSAGE_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: true
};

const TABLE_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOk',
    setTextAlign: true,
    siteConfig: 'notion'
};

const SITE_FONT_CSS = `
html.ai-rtl-notion-site-font, html.ai-rtl-notion-site-font body,
html.ai-rtl-notion-site-font body *:not(code):not(pre):not(kbd):not(samp):not(svg):not(path):not([class*="icon"]):not([class*="Icon"]) {
    font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
}
html.ai-rtl-notion-site-font :is(code, pre, kbd, samp),
html.ai-rtl-notion-site-font :is(code, pre) * {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}
`;

let siteFontOn = true;
let tablesRtlOn = false;
let settingsWatcherInstalled = false;

function clearNotionTableDirection(el) {
    if (!el || el.nodeType !== 1) {
        return;
    }
    el.removeAttribute('dir');
    el.removeAttribute('data-ai-rtl-direction');
    el.style.removeProperty('direction');
    el.style.removeProperty('text-align');
    el.style.removeProperty('unicode-bidi');
    el.classList.remove('FontSet', 'AsOk');
}

function clearNotionTables() {
    AQ(TABLE_SELECTOR).each(function () {
        clearNotionTableDirection(this);
        if (this.matches('table, [role="table"]')) {
            AQ(this).find('[dir], [data-ai-rtl-direction], .FontSet, .AsOk').each(function () {
                clearNotionTableDirection(this);
            });
        }
    });
}

function applyNotionSiteFont(on) {
    const root = document.documentElement;
    let style = document.getElementById(SITE_FONT_STYLE_ID);
    if (!on) {
        root.classList.remove('ai-rtl-notion-site-font');
        if (style) {
            style.remove();
        }
        return;
    }
    root.classList.add('ai-rtl-notion-site-font');
    if (!style) {
        style = document.createElement('style');
        style.id = SITE_FONT_STYLE_ID;
        (document.head || root).appendChild(style);
    }
    if (style.textContent !== SITE_FONT_CSS) {
        style.textContent = SITE_FONT_CSS;
    }
}

function processNotionTable(el) {
    if (!tablesRtlOn || !el) {
        return;
    }
    if (el.matches('table, [role="table"]')) {
        const parent = el.parentElement;
        if (parent) {
            processTablesInContainer(AQ(parent), TABLE_OPTIONS);
        }
        return;
    }
    setTextDirectionAndFont(el, {
        fontClass: 'FontSet',
        setTextAlign: true
    });
}

function syncNotionSettings() {
    try {
        chrome.storage.sync.get([SITE_SETTINGS_STORAGE_KEY], (result) => {
            const stored = result[SITE_SETTINGS_STORAGE_KEY];
            siteFontOn = isNotionSiteFontOn(stored);
            tablesRtlOn = isNotionTablesRtlOn(stored);
            applyNotionSiteFont(siteFontOn);
            if (!document.body) {
                return;
            }
            if (tablesRtlOn) {
                AQ(TABLE_SELECTOR).each(function () {
                    processNotionTable(this);
                });
                return;
            }
            clearNotionTables();
        });
    } catch (error) {
        applyNotionSiteFont(siteFontOn);
    }
}

function installNotionSettingsWatcher() {
    if (settingsWatcherInstalled) {
        return;
    }
    settingsWatcherInstalled = true;
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync' || !changes[SITE_SETTINGS_STORAGE_KEY]) {
            return;
        }
        syncNotionSettings();
    });
}

export function stopNotion() {
    siteFontOn = false;
    tablesRtlOn = false;
    applyNotionSiteFont(false);
    clearNotionTables();
}

export function activateNotion(rtlAlgorithm = 'advanced_full') {
    console.log('Notion RTL activated with algorithm:', rtlAlgorithm);

    installNotionSettingsWatcher();
    syncNotionSettings();

    observeDomSections([
        {
            selector: USER_MESSAGE_SELECTOR,
            process: (el) => applyRtlToContainer(el, rtlAlgorithm, {
                ...USER_MESSAGE_OPTIONS,
                processTables: tablesRtlOn
            }),
            debounceMs: 150
        },
        {
            selector: ASSISTANT_MESSAGE_SELECTOR,
            process: (el) => applyRtlToElement(el, rtlAlgorithm, ASSISTANT_MESSAGE_OPTIONS),
            debounceMs: 150
        },
        {
            selector: INPUT_SELECTOR,
            ignore: '[data-block-id]',
            process: (el) => {
                applyRtlToElement(el, rtlAlgorithm, INPUT_OPTIONS);

                if (AQ(el).data('rtl-listener-added')) {
                    return;
                }
                AQ(el).data('rtl-listener-added', true);

                AQ(el).on('input keyup paste', function () {
                    applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
                });
            },
            debounceMs: 50
        },
        {
            selector: TABLE_SELECTOR,
            process: processNotionTable,
            debounceMs: 150
        }
    ]);
}
