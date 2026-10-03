// deepseek.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

// RTL table columns start on the right. The scroller stays LTR so DeepSeek's
// scrollLeft math works, and we show that right edge until the user scrolls.
const dsTableScrollPin = new WeakMap();
const dsTableScrollWatch = new WeakSet();
const dsTableGutterBound = new WeakMap();

function markDeepSeekTableScrolled(el) {
    const prev = dsTableScrollPin.get(el);
    dsTableScrollPin.set(el, { max: prev ? prev.max : el.scrollLeft, user: true });
}

function watchDeepSeekTableScroll(el) {
    if (!dsTableScrollWatch.has(el)) {
        dsTableScrollWatch.add(el);
        el.addEventListener('wheel', () => markDeepSeekTableScrolled(el), { passive: true, capture: true });
    }
    const gutter = el.querySelector('.ds-scroll-area__horizontal-gutter');
    if (!gutter || dsTableGutterBound.get(el) === gutter) {
        return;
    }
    dsTableGutterBound.set(el, gutter);
    gutter.addEventListener('pointerdown', () => markDeepSeekTableScrolled(el));
}

function repairDeepSeekTableScrollAreas() {
    const areas = document.querySelectorAll('.ds-scroll-area');
    for (let i = 0; i < areas.length; i++) {
        const el = areas[i];
        const table = el.querySelector(':scope > table');
        if (!table) {
            continue;
        }
        if (el.getAttribute('dir') !== 'ltr') {
            el.setAttribute('dir', 'ltr');
        }
        if (el.hasAttribute('data-direction')) {
            el.removeAttribute('data-direction');
        }
        if (!table.getAttribute('dir')) {
            const direction = detectTextDirection((table.textContent || '').trim());
            if (direction === 'rtl' || direction === 'ltr') {
                table.setAttribute('dir', direction);
            }
        }
        if (table.getAttribute('dir') !== 'rtl') {
            continue;
        }
        watchDeepSeekTableScroll(el);
        const max = el.scrollWidth - el.clientWidth;
        if (max <= 1) {
            continue;
        }
        const prev = dsTableScrollPin.get(el);
        if (prev && prev.user) {
            continue;
        }
        const awayFromPin = prev && Math.abs(el.scrollLeft - prev.max) >= 2 && el.scrollLeft >= 2;
        if (awayFromPin) {
            continue;
        }
        if (Math.abs(el.scrollLeft - max) > 2) {
            el.scrollLeft = max;
        }
        dsTableScrollPin.set(el, { max, user: false });
    }
    applyDeepSeekMessageDirectionFromTables();
}

const DS_MESSAGE_FROM_TABLES_ATTR = 'data-ai-rtl-msg-tables';

function topLevelTablesIn(message) {
    const found = message.querySelectorAll('table');
    const tables = [];
    for (let i = 0; i < found.length; i++) {
        const table = found[i];
        if (table.parentElement && table.parentElement.closest('table')) {
            continue;
        }
        tables.push(table);
    }
    return tables;
}

function directionOfTable(table) {
    const dir = table.getAttribute('dir');
    if (dir === 'rtl' || dir === 'ltr') {
        return dir;
    }
    return detectTextDirection((table.textContent || '').trim()) === 'rtl' ? 'rtl' : 'ltr';
}

function directionFromTables(tables) {
    if (tables.length === 1) {
        return directionOfTable(tables[0]);
    }

    // Two tables can split 1–1. The text algorithm decides, not a coin flip.
    if (tables.length === 2) {
        const text = `${tables[0].textContent || ''}\n${tables[1].textContent || ''}`;
        return detectTextDirection(text.trim()) === 'rtl' ? 'rtl' : 'ltr';
    }

    let rtl = 0;
    let ltr = 0;
    for (let i = 0; i < tables.length; i++) {
        if (directionOfTable(tables[i]) === 'rtl') {
            rtl++;
        } else {
            ltr++;
        }
    }
    if (rtl === ltr) {
        let text = '';
        for (let i = 0; i < tables.length; i++) {
            text += `\n${tables[i].textContent || ''}`;
        }
        return detectTextDirection(text.trim()) === 'rtl' ? 'rtl' : 'ltr';
    }
    return rtl > ltr ? 'rtl' : 'ltr';
}

function clearMessageDirectionFromTables(message) {
    if (!message.hasAttribute(DS_MESSAGE_FROM_TABLES_ATTR)) {
        return;
    }
    const original = message.getAttribute('data-ai-rtl-orig-dir');
    if (original) {
        message.setAttribute('dir', original);
    } else {
        message.removeAttribute('dir');
    }
    message.removeAttribute('data-direction');
    message.removeAttribute(DS_MESSAGE_FROM_TABLES_ATTR);
}

function applyDeepSeekMessageDirectionFromTables() {
    const groups = new Map();
    const messages = document.querySelectorAll('.ds-message');
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const tables = topLevelTablesIn(message);
        if (!tables.length) {
            continue;
        }
        // Nested .ds-message keeps its own tables; the outer one does not recount them.
        if (message.querySelector('.ds-message')) {
            const own = tables.filter((table) => table.closest('.ds-message') === message);
            if (!own.length) {
                continue;
            }
            groups.set(message, own);
            continue;
        }
        groups.set(message, tables);
    }

    const marked = document.querySelectorAll(`.ds-message[${DS_MESSAGE_FROM_TABLES_ATTR}]`);
    for (let i = 0; i < marked.length; i++) {
        if (!groups.has(marked[i])) {
            clearMessageDirectionFromTables(marked[i]);
        }
    }

    groups.forEach((tables, message) => {
        const direction = directionFromTables(tables);
        if (direction !== 'rtl') {
            clearMessageDirectionFromTables(message);
            return;
        }
        if (message.getAttribute('dir') !== 'rtl') {
            message.setAttribute('dir', 'rtl');
        }
        message.setAttribute('data-direction', 'rtl');
        message.setAttribute(DS_MESSAGE_FROM_TABLES_ATTR, 'rtl');
    });
}

export function setDeepSeek(rtlAlgorithm = 'advanced_full') {
    if (!AQ('#deepseek-font-style').length) {
        AQ(`<style id="deepseek-font-style">
            html.ai-rtl-has-font {
                --dsw-font-markdown-table: 15px / 25px var(--ai-rtl-font, iranyekan, sans-serif) !important;
                --dsw-font-markdown-table-font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
            html.ai-rtl-has-font .ds-markdown h1,
            html.ai-rtl-has-font .ds-markdown h2,
            html.ai-rtl-has-font .ds-markdown h3,
            html.ai-rtl-has-font .ds-markdown h4 {
                font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
            }
        </style>`).appendTo('head');
    }

    if (chrome.runtime?.id) {
        let fo2 = `._871cbca`
        
        // Add copyright using utility function
        addCopyright(AQ(fo2), 'AsBoxDuckduckgo AsBoxB');
    }

    // Process textarea elements for text direction detection
    AQ('textarea').each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });


    AQ('.ds-markdown').each(function () {
        // AQ(this).addClass('AsOk FontSet FontClaude');

        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText',
            isContainer: true,
            setTextAlign: true
        });
    });


    AQ('.ds-message > div:first-of-type > .ds-collapsible-text > div  ').each(function () {
        const $el = AQ(this);
        if ($el.find('.ds-markdown').length) {
            return;
        }

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            rtlClass: 'AsOkRList',
            setTextAlign: true
        });
    });

    AQ('._546d736 , .afa34042').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            rtlClass: 'AsOkRList'
        });
    });

    AQ('text').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOkText'
        });
    });

    repairDeepSeekTableScrollAreas();
}

// Main activation function for DeepSeek
export function activateDeepSeek(rtlAlgorithm = 'advanced_full') {
    console.log('DeepSeek RTL activated with algorithm:', rtlAlgorithm);
    // Initial setup
    setDeepSeek(rtlAlgorithm);

    // SetInterval and Observer
    let interval = setInterval(() => {
        setDeepSeek(rtlAlgorithm);
    }, 500);
}

