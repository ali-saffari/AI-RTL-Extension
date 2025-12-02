// Notion.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm , detectDirectionByAlgorithm } from '../utils/textDirectionUtils.js';

// Storage key for Notion collection view direction
const NOTION_COLLECTION_DIRECTION_KEY = 'notion_collection_direction';

// Function to apply direction from storage
function applyCollectionDirection() {
    const $collectionBody = AQ('.notion-scroller.notion-collection-view-body');
    if ($collectionBody.length === 0) {
        return;
    }
    
    const $body = $collectionBody.first();
    

    
    // Check if already processed to prevent reprocessing
    if ($body.attr('data-rtl-processed') === 'true') {
        return;
    }

    console.log('applyCollectionDirection fired - element found:', $collectionBody.length, 'element(s)');
    
    chrome.storage.local.get([NOTION_COLLECTION_DIRECTION_KEY], function(result) {
        const direction = result[NOTION_COLLECTION_DIRECTION_KEY] || 'ltr';
        
        // Apply direction to collection body
        $body.attr('dir', direction);
        $body.css('direction', direction);
        
        // Apply direction to child elements
        $body.find('[role="textbox"], .notranslate').each(function() {
            AQ(this).attr('dir', direction);
            AQ(this).css('direction', direction);
            if (direction === 'rtl') {
                AQ(this).css('text-align', 'right');
            } else {
                AQ(this).css('text-align', 'left');
            }
        });
        
        // Mark as processed to prevent reprocessing
        $body.attr('data-rtl-processed', 'true');
        
        // Update button text to show current state
        const $button = AQ('.notion-rtl-toggle-btn');
        if ($button.length > 0) {
            $button.html(direction === 'rtl' ? '←' : '→');
        }
    });
}

// Function to add floating RTL/LTR toggle button
function addFloatingRtlButton() {
    // Check if button already exists
    if (AQ('.notion-rtl-toggle-btn').length > 0) {
        return;
    }
    
    // Create floating button
    const $button = AQ('<button>')
        .addClass('notion-rtl-toggle-btn')
        .attr('title', 'Toggle RTL/LTR')
        .html('⇄')
        .css({
            'position': 'fixed',
            'bottom': '90px',
            'right': '30px',
            'width': '45px',
            'height': '45px',
            'border-radius': '50%',
            'background': '#37352f',
            'color': '#ffffff',
            'border': 'none',
            'cursor': 'pointer',
            'font-size': '20px',
            'z-index': '10000',
            'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
            'transition': 'all 0.2s ease',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-family': 'iranyekan, sans-serif'
        })
        .on('mouseenter', function() {
            AQ(this).css({
                'background': '#2e2d29',
                'transform': 'scale(1.1)',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.25)'
            });
        })
        .on('mouseleave', function() {
            AQ(this).css({
                'background': '#37352f',
                'transform': 'scale(1)',
                'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)'
            });
        })
        .on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get current direction from storage
            chrome.storage.local.get([NOTION_COLLECTION_DIRECTION_KEY], function(result) {
                const currentDir = result[NOTION_COLLECTION_DIRECTION_KEY] || 'ltr';
                const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
                
                // Reset processed attribute to allow reprocessing
                const $collectionBody = AQ('.notion-scroller.notion-collection-view-body');
                if ($collectionBody.length > 0) {
                    $collectionBody.first().attr('data-rtl-processed', 'false');
                }
                
                // Save to storage only
                chrome.storage.local.set({ [NOTION_COLLECTION_DIRECTION_KEY]: newDir }, function() {
                    // Apply direction after storage is saved
                    applyCollectionDirection();
                });
            });
        });
    
    // Append button to body (so it stays fixed)
    AQ('body').append($button);
    
    // Apply direction from storage
    applyCollectionDirection();
}

export function setNotionlm(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {

              let fo2 = `.chat-message-input-container.in-chat`
         addCopyright(AQ(fo2), 'AsBoxNotion AsBoxB' ,`margin-top: 11px; margin-bottom: -5px; transform: scale(0.9);`);


    }
    
    // Add floating RTL toggle button
 

    addFloatingRtlButton();
    
    // Apply direction from storage
    applyCollectionDirection();


    

    // Process markdown prose elements
    AQ('[role="textbox"]').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true
        });
    });

    



    

}



// Main activation function for Notion
export function activateNotion(rtlAlgorithm = 'advanced_full') {
    console.log('Notion RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup

    addFloatingRtlButton();

    // Listen for storage changes
    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local' && changes[NOTION_COLLECTION_DIRECTION_KEY]) {
            applyCollectionDirection();
        }
    });

    setNotionlm(rtlAlgorithm);
    
    // SetInterval for continuous processing
    let interval = setInterval(() => {
        setNotionlm(rtlAlgorithm);
    }, 1000);

    // Observer for notion-table-view-cell and notranslate elements
    const tableCellObserver = new MutationObserver(function(mutations) {
        // Check for .notion-scroller.notion-collection-view-body
        const $collectionBody = AQ('.notion-scroller.notion-collection-view-body');
        if ($collectionBody.length > 0) {
            // Apply direction from storage when collection body appears
            // applyCollectionDirection will check if already processed with same direction
            applyCollectionDirection();
        }
        
        // Process notion-table-view-cell elements
        AQ('.notion-table-view-cell').each(function() {
            const $cell = AQ(this);
            const processedText = $cell.attr('rtl-processed');
            // Only process if not already processed
            if (processedText === 'true') {
                return;
            }
            const currentText = $cell.text();
            console.log('notion-table-view-cell', currentText);

            const direction = detectDirectionByAlgorithm(currentText, rtlAlgorithm);

            if (direction === 'rtl') {
                const $firstDiv = $cell.find('div').first();
                if ($firstDiv.length > 0) {
                    $firstDiv.addClass('FontSet');
                    $firstDiv.attr('dir', 'rtl');
                }
            }
            
            // Mark as processed
            $cell.attr('rtl-processed', 'true');
        });

        // Process notion-table-view-header-cell elements
        AQ('.notion-table-view-header-cell').each(function() {
            const $cell = AQ(this);
            const processedText = $cell.attr('rtl-processed');
            // Only process if not already processed
            if (processedText === 'true') {
                return;
            }
            const currentText = $cell.text();
            
            console.log('notion-table-view-header-cell', currentText);

            const direction = detectDirectionByAlgorithm(currentText, rtlAlgorithm);

            if (direction === 'rtl') {
                const $firstDiv = $cell.find('div').first();
                if ($firstDiv.length > 0) {
                    $firstDiv.addClass('FontSet');
                    $firstDiv.attr('dir', 'rtl');
                }
            }
            
            // Mark as processed
            $cell.attr('rtl-processed', 'true');
        });

        // Process notranslate elements
        AQ('.notranslate').each(function() {
            const $element = AQ(this);
            const processedText = $element.attr('rtl-processed');
            // Only process if not already processed
            if (processedText === 'true') {
                return;
            }
            
            if (!$element.hasClass("FontSet")) {
                $element.addClass('FontSet');
            }
            
            if (!$element.data('rtl-listener-added')) {
                $element.data('rtl-listener-added', true);
                
                // Add event listener for real-time direction detection
                $element.on('keyup paste input', function() {
                    setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                        fontClass: 'FontSet',
                        setTextAlign: true
                    });
                });
            }

            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                processedClass: 'AsRtl'
            });
            
            // Mark as processed
            $element.attr('rtl-processed', 'true');
        });
    });

    // Start observing the document body for changes
    tableCellObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Initial check for existing cells
    AQ('.notion-table-view-cell').each(function() {
        const $cell = AQ(this);
        const processedText = $cell.attr('rtl-processed');
        // Only process if not already processed
        if (processedText === 'true') {
            return;
        }
        const currentText = $cell.text();
        const direction = detectDirectionByAlgorithm(currentText, rtlAlgorithm);

        if (direction === 'rtl') {
            const $firstDiv = $cell.find('div').first();
            if ($firstDiv.length > 0) {
                $firstDiv.addClass('FontSet');
                $firstDiv.attr('dir', 'rtl');
            }
        }
        
        // Mark as processed
        $cell.attr('rtl-processed', 'true');
    });

    // Initial check for existing header cells
    AQ('.notion-table-view-header-cell').each(function() {
        const $cell = AQ(this);
        const processedText = $cell.attr('rtl-processed');
        // Only process if not already processed
        if (processedText === 'true') {
            return;
        }
        const currentText = $cell.text();
        const direction = detectDirectionByAlgorithm(currentText, rtlAlgorithm);

        if (direction === 'rtl') {
            const $firstDiv = $cell.find('div').first();
            if ($firstDiv.length > 0) {
                $firstDiv.addClass('FontSet');
                $firstDiv.attr('dir', 'rtl');
            }
        }
        
        // Mark as processed
        $cell.attr('rtl-processed', 'true');
    });

    // Initial check for existing notranslate elements
    AQ('.notranslate').each(function() {
        const $element = AQ(this);
        const processedText = $element.attr('rtl-processed');
        // Only process if not already processed
        if (processedText === 'true') {
            return;
        }
        
        if (!$element.hasClass("FontSet")) {
            $element.addClass('FontSet');
        }
        
        if (!$element.data('rtl-listener-added')) {
            $element.data('rtl-listener-added', true);
            
            // Add event listener for real-time direction detection
            $element.on('keyup paste input', function() {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    setTextAlign: true
                });
            });
        }

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
        // Mark as processed
        $element.attr('rtl-processed', 'true');
    });

}