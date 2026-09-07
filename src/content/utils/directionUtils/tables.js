/**
 * Unified direction for HTML tables and ARIA role=table.
 * Called from applyRtlToContainer on every site. Extra tweaks:
 * - ChatGPT: force direction:rtl !important on RTL tables
 * - Grok: mark mask-image parents and swap right-1 to left-1
 */

import { detectTextDirection } from '../analyzeDirection.js';
import { isRtlEngineActive } from '../originalState.js';
import { CODE_BLOCK_SELECTOR, KATEX_SELECTOR } from './codeSelectors.js';
import { setDebugAttr } from './debug.js';
import { applyTextAlignByDirection } from './textStyles.js';

const INNER_DIR_TARGET_SELECTOR = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'blockquote', 'div', 'section', 'article', 'header',
    'span', 'ul', 'ol'
].join(', ');
const TABLE_STRUCTURE_SELECTOR = 'table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col';
const TABLE_CELL_SELECTOR = 'th, td, caption';
const ARIA_TABLE_STRUCTURE_SELECTOR = '[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]';
const ARIA_TABLE_CELL_SELECTOR = '[role="cell"], [role="columnheader"], [role="rowheader"]';
const TABLE_FONT_SKIP_SELECTOR = `${CODE_BLOCK_SELECTOR}, ${KATEX_SELECTOR}, svg, math`;

function applyFontClassToTableContents($table, fontClass, structureSelector, cellSelector) {
    if (!fontClass || !$table || !$table.length) {
        return;
    }

    $table.addClass(fontClass);
    $table.find(structureSelector).addClass(fontClass);
    $table.find(cellSelector).find(INNER_DIR_TARGET_SELECTOR).each(function() {
        try {
            if (this.closest(TABLE_FONT_SKIP_SELECTOR)) {
                return;
            }
        } catch {
            return;
        }
        AQ(this).addClass(fontClass);
    });
}

export function processTablesInContainer(container, options = {}) {
    if (!isRtlEngineActive()) {
        return;
    }
    const {
        fontClass = 'FontSet',
        processedClass = 'AsOk',
        siteConfig = null,
        setTextAlign = true
    } = options;

    container.find('table').each(function() {
        const $table = AQ(this);




        console.log('siteConfig', siteConfig);
        setDebugAttr($table, 'data-debug-mode-site', siteConfig);
        setDebugAttr($table, 'data-debug-mode-2', 'table-element');

        const allTableItems = $table.find('th, td, caption, tr');
        const unprocessedItems = allTableItems.filter(function() {
            return !AQ(this).hasClass(processedClass);
        });

        if (unprocessedItems.length === 0) {
            applyFontClassToTableContents($table, fontClass, TABLE_STRUCTURE_SELECTOR, TABLE_CELL_SELECTOR);
            return;
        }

        console.log("processTablesInContainer", $table)


        let allTableText = '';
        const tableElements = $table.find('th, td, caption').add($table.find('tr').not(':has(th, td)'));

        tableElements.each(function() {
            const text = AQ(this).text();
            if (text && text.trim()) {
                allTableText += ' ' + text.trim();
            }
        });

        if (allTableText.trim()) {
            const tableDirection = detectTextDirection(allTableText.trim());

            $table.attr('dir', tableDirection);
            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').attr('dir', tableDirection);

            if (siteConfig === 'chatgpt' && tableDirection === 'rtl') {
                $table[0].style.setProperty('direction', 'rtl', 'important');
                $table.find('th, td, caption').each(function() {
                    this.style.setProperty('direction', 'rtl', 'important');
                });
            }

            if (tableDirection === 'rtl' && siteConfig === 'grok') {
                const $tbody = $table.find('tbody');
                if ($tbody.length > 0) {
                    let $current = $table;
                    while ($current.length > 0 && $current[0] !== document.body && $current[0] !== container[0]) {
                        const maskImage = $current.css('mask-image');
                        if (maskImage && maskImage !== 'none') {
                            console.log('Checking element for mask-image:', $current[0], 'current mask-image:', maskImage);

                            $current.addClass('rtl-mask-applied');

                            console.log('Applied mask-image to element:', $current[0]);
                        }

                        const $absoluteElements = $current.find('.absolute.top-1.right-1');
                        if ($absoluteElements.length > 0) {
                            console.log('Found .absolute.top-1.right-1 elements:', $absoluteElements.length, 'in parent:', $current[0]);
                            $absoluteElements.each(function() {
                                AQ(this).removeClass('right-1').addClass('left-1');
                                console.log('Changed right-1 to left-1 for element:', this);
                            });
                        }

                        $current = $current.parent();
                    }
                }
            }

            applyTextAlignByDirection($table.find('th, td'), tableDirection, setTextAlign);
            if (tableDirection === 'rtl') {
                $table.find('.text-left').removeClass('text-left');
                $table.removeClass('text-left');
            }





            applyFontClassToTableContents($table, fontClass, TABLE_STRUCTURE_SELECTOR, TABLE_CELL_SELECTOR);

            $table.find('table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col').addClass(processedClass);
        }
    });

    container.find('[role="table"]').each(function() {
        const $table = AQ(this);

        const allAriaTableItems = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"], [role="row"]');
        const unprocessedAriaItems = allAriaTableItems.filter(function() {
            return !AQ(this).hasClass(processedClass);
        });

        if (unprocessedAriaItems.length === 0) {
            applyFontClassToTableContents($table, fontClass, ARIA_TABLE_STRUCTURE_SELECTOR, ARIA_TABLE_CELL_SELECTOR);
            return;
        }

        let allTableText = '';
        const tableElements = $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]');

        tableElements.each(function() {
            const text = AQ(this).text();
            if (text && text.trim()) {
                allTableText += ' ' + text.trim();
            }
        });

        if (allTableText.trim()) {
            const tableDirection = detectTextDirection(allTableText.trim());

            $table.attr('dir', tableDirection);
            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').attr('dir', tableDirection);

            if (siteConfig === 'chatgpt' && tableDirection === 'rtl') {
                $table.addClass('AsJustRtl');
                $table[0].style.setProperty('direction', 'rtl', 'important');
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]').each(function() {
                    this.style.setProperty('direction', 'rtl', 'important');
                });
            }

            applyTextAlignByDirection(
                $table.find('[role="cell"], [role="columnheader"], [role="rowheader"]'),
                tableDirection,
                setTextAlign
            );
            if (tableDirection === 'rtl') {
                $table.find('.text-left').removeClass('text-left');
                $table.removeClass('text-left');
            }

            applyFontClassToTableContents($table, fontClass, ARIA_TABLE_STRUCTURE_SELECTOR, ARIA_TABLE_CELL_SELECTOR);

            $table.find('[role="table"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').addClass(processedClass);
        }
    });
}
