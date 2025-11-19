/**
 * Text Selector Highlighter
 * Highlights the parent element when text is selected
 */

import { detectTextDirection } from './analyzeDirection.js';
import { imagePath } from './constants.js';

let highlightStyle = null;
let currentHighlightedElement = null;
let popupMenu = null;
let isMenuOpen = false;
let mousePosition = null;
let isMenuMinimized = true;
let textSelectorSettings = null;
let aiSitesList = null;

/**
 * Get list of AI sites from service config
 */
function getAISitesList() {
    if (aiSitesList) {
        return aiSitesList;
    }
    
    // List of AI site domains (from main.js serviceConfig)
    aiSitesList = [
        'chatgpt.com',
        'claude.ai',
        'copilot.microsoft.com',
        'bing.com',
        'www.bing.com',
        'github.com',
        'perplexity.ai',
        'www.perplexity.ai',
        'duckduckgo.com',
        'aistudio.google.com',
        'chat.deepseek.com',
        'you.com',
        'chat.qwenlm.ai',
        'chat.qwen.ai',
        'poe.com',
        'monica.im',
        'gemini.google.com',
        'grok.com',
        'chat.mistral.ai',
        'manus.im',
        'www.kimi.com',
        'www.blackbox.ai',
        'notebooklm.google.com',
        'chat.z.ai',
        'lmarena.ai',
        'openrouter.ai',
        'agent.minimax.io',
        'jules.google.com',
        '1min.ai',
        'app.1min.ai',
        'digen.ai',
        'lovable.dev',
        'www.lovable.dev',
        'synaps.app',
        'www.synaps.app',
        'my.synaps.app',
        'app.writesonic.com',
        'ernie.baidu.com'
    ];
    
    return aiSitesList;
}

/**
 * Check if current site is an AI site
 */
function isAISite() {
    const hostname = window.location.hostname;
    const aiSites = getAISitesList();
    return aiSites.some(site => hostname === site || hostname.endsWith('.' + site));
}

/**
 * Check if current site is in allowed sites list
 */
function isAllowedSite(callback) {
    chrome.storage.sync.get(['allowedSites', 'customAllowedSites'], (result) => {
        const hostname = window.location.hostname;
        let isAllowed = false;
        
        // Check old allowedSites format
        if (result.allowedSites && Array.isArray(result.allowedSites)) {
            isAllowed = result.allowedSites.some(site => 
                hostname === site || hostname.endsWith('.' + site)
            );
        }
        
        // Check customAllowedSites format
        if (!isAllowed && result.customAllowedSites && Array.isArray(result.customAllowedSites)) {
            isAllowed = result.customAllowedSites.some(site => 
                hostname === site || hostname.endsWith('.' + site)
            );
        }
        
        callback(isAllowed);
    });
}

/**
 * Check if text selector should be enabled based on settings
 */
function shouldEnableTextSelector(callback) {
    chrome.storage.sync.get(['textSelectorSettings'], (result) => {
        if (!result.textSelectorSettings) {
            // Default: disabled if no settings
            callback(false);
            return;
        }
        
        const settings = result.textSelectorSettings;
        textSelectorSettings = settings;
        
        // Check if manualRtlEnabled is false or undefined
        if (!settings.manualRtlEnabled) {
            callback(false);
            return;
        }
        
        // Check site mode
        const siteMode = settings.manualRtlSiteMode || 'all';
        const hostname = window.location.hostname;
        
        if (siteMode === 'all') {
            callback(true);
            return;
        }
        
        if (siteMode === 'ai_sites') {
            callback(isAISite());
            return;
        }
        
        if (siteMode === 'allowed_sites') {
            isAllowedSite((isAllowed) => {
                callback(isAllowed);
            });
            return;
        }
        
        if (siteMode === 'ai_and_allowed') {
            const isAI = isAISite();
            if (isAI) {
                callback(true);
                return;
            }
            isAllowedSite((isAllowed) => {
                callback(isAllowed);
            });
            return;
        }
        
        // Default: disabled
        callback(false);
    });
}

/**
 * Initialize text selection highlighter
 */
export function initTextSelector() {
    // Check if text selector should be enabled
    shouldEnableTextSelector((enabled) => {
        if (!enabled) {
            console.log('[RTL Text Selector] Disabled based on settings');
            return;
        }
        
        // Initialize if enabled
        initTextSelectorInternal();
    });
    
    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.textSelectorSettings) {
            shouldEnableTextSelector((enabled) => {
                if (!enabled) {
                    // Cleanup if disabled
                    cleanupTextSelector();
                } else {
                    // Re-initialize if enabled
                    if (!highlightStyle) {
                        initTextSelectorInternal();
                    }
                }
            });
        }
    });
}

/**
 * Internal initialization function
 */
function initTextSelectorInternal() {
    // Create style element for highlighting
    if (!highlightStyle) {
        highlightStyle = document.createElement('style');
        highlightStyle.id = 'rtl-text-selector-style';
        highlightStyle.textContent = `
            .rtl-selected-element {
                outline: 3px solid var(--rtl-highlight-color, red) !important;
                outline-offset: 2px !important;
                background-color: var(--rtl-highlight-bg, rgba(255, 0, 0, 0.1)) !important;
            }
            .rtl-text-selector-menu {
                position: absolute;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                z-index: 999999;
                font-family: iranyekan, 'IRANYekan', Tahoma, Arial, sans-serif;
                font-size: 12px;
                min-width: 130px;
                direction: rtl;
                overflow: hidden;
                transition: all 0.2s ease;
            }
            .rtl-text-selector-menu.minimized {
                min-width: auto;
                width: auto;
                padding: 0;
                border-radius: 6px;
            }
            .rtl-text-selector-menu-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 10px;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                cursor: pointer;
                transition: background-color 0.15s;
            }
            .rtl-text-selector-menu.minimized .rtl-text-selector-menu-header {
                border-bottom: none;
                padding: 6px;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 6px;
            }
            .rtl-text-selector-menu-header:hover {
                background-color: #f3f4f6;
            }
            .rtl-text-selector-menu-logo {
                width: 18px;
                height: 18px;
                object-fit: contain;
                cursor: pointer;
            }
            .rtl-text-selector-menu.minimized .rtl-text-selector-menu-logo {
                width: 20px;
                height: 20px;
            }
            .rtl-text-selector-menu-settings-btn {
                width: 20px;
                height: 20px;
                padding: 0;
                border: none;
                background: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
                color: #6b7280;
                font-size: 14px;
                transition: all 0.15s;
            }
            .rtl-text-selector-menu-settings-btn:hover {
                background-color: #e5e7eb;
                color: #374151;
            }
            .rtl-text-selector-menu-body {
                padding: 2px 0;
                max-height: 500px;
                overflow: hidden;
                transition: max-height 0.2s ease, opacity 0.2s ease;
            }
            .rtl-text-selector-menu.minimized .rtl-text-selector-menu-body {
                display: none;
            }
            .rtl-text-selector-menu.minimized .rtl-text-selector-menu-settings-btn {
                display: none;
            }
            .rtl-text-selector-menu-item {
                padding: 6px 12px;
                cursor: pointer;
                transition: background-color 0.15s;
                border: none;
                background: none;
                width: 100%;
                text-align: right;
                font-size: 12px;
                font-family: iranyekan, 'IRANYekan', Tahoma, Arial, sans-serif;
                color: #374151;
                display: block;
                line-height: 1.4;
            }
            .rtl-text-selector-menu-item:hover {
                background-color: #f3f4f6;
            }
            .rtl-text-selector-menu-item:active {
                background-color: #e5e7eb;
            }
            .rtl-text-selector-menu-divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 1px 0;
            }
        `;
        document.head.appendChild(highlightStyle);
        
        // Verify style was added
        const verifyStyle = document.getElementById('rtl-text-selector-style');
        if (!verifyStyle) {
            console.error('[RTL Text Selector] ❌ Style element NOT found in DOM!');
        }
    }

    // Load settings and update highlight style
    chrome.storage.sync.get(['textSelectorSettings'], (result) => {
        if (result.textSelectorSettings) {
            textSelectorSettings = result.textSelectorSettings;
            updateHighlightStyle(result.textSelectorSettings);
        }
    });
    
    // Add selection change listener (for highlighting during selection)
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Listen for mouseup to catch selection end and show menu
    document.addEventListener('mouseup', (e) => {
        // Store mouse position
        mousePosition = { x: e.clientX, y: e.clientY };
        
        // Small delay to allow selection to complete
        setTimeout(() => {
            if (!isMenuOpen) {
                showMenuAfterSelection();
            }
        }, 100);
    });
    
    // Listen for keyup to catch keyboard selections end
    document.addEventListener('keyup', () => {
        // Clear mouse position for keyboard selection
        mousePosition = null;
        
        if (!isMenuOpen) {
            setTimeout(() => {
                showMenuAfterSelection();
            }, 50);
        }
    });
}

/**
 * Update highlight style based on settings
 */
function updateHighlightStyle(settings) {
    if (!highlightStyle) return;
    
    const highlightColor = settings.highlightColor || '#ff0000';
    const highlightOpacity = settings.highlightOpacity || 0.1;
    
    // Convert hex color to rgba
    const r = parseInt(highlightColor.slice(1, 3), 16);
    const g = parseInt(highlightColor.slice(3, 5), 16);
    const b = parseInt(highlightColor.slice(5, 7), 16);
    
    const bgColor = `rgba(${r}, ${g}, ${b}, ${highlightOpacity})`;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--rtl-highlight-color', highlightColor);
    document.documentElement.style.setProperty('--rtl-highlight-bg', bgColor);
}

/**
 * Handle text selection changes (only highlight during selection)
 */
function handleSelectionChange() {
    // Check if text selector is enabled
    if (!textSelectorSettings || !textSelectorSettings.manualRtlEnabled) {
        return;
    }
    
    // Check highlight mode
    if (textSelectorSettings.highlightMode === 'disabled') {
        return;
    }
    
    // If menu is open, don't process selection changes
    if (isMenuOpen) {
        return;
    }
    
    const selection = window.getSelection();
    
    // Remove previous highlight
    if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove('rtl-selected-element');
        currentHighlightedElement = null;
    }
    
    // Check if there's a selection
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
    }
    
    // Get the range
    const range = selection.getRangeAt(0);
    
    // Find the common ancestor container
    const commonAncestor = range.commonAncestorContainer;
    
    // Get the element (if node is text, get parent element)
    let element = commonAncestor.nodeType === Node.TEXT_NODE 
        ? commonAncestor.parentElement 
        : commonAncestor;
    
    // If it's not an element, try to get parent
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        element = element?.parentElement || document.body;
    }
    
    // Find the best container element (not inline elements)
    element = findBestContainer(element);
    
    // Highlight the element (only highlight, don't show menu)
    if (!element || element === document.body || element === document.documentElement) {
        return;
    }
    
    // Only highlight if highlightMode is 'on_selection'
    if (textSelectorSettings && textSelectorSettings.highlightMode === 'on_selection') {
        element.classList.add('rtl-selected-element');
        currentHighlightedElement = element;
    }
    
    // Optional: Scroll into view
    try {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {
        // Silent fail
    }
}

/**
 * Show menu after selection is complete
 */
function showMenuAfterSelection() {
    // Check if text selector is enabled
    if (!textSelectorSettings || !textSelectorSettings.manualRtlEnabled) {
        return;
    }
    
    // If menu is open, don't process
    if (isMenuOpen) {
        return;
    }
    
    const selection = window.getSelection();
    
    // Check if there's a selection
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        // If no selection, remove highlight
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('rtl-selected-element');
            currentHighlightedElement = null;
        }
        return;
    }
    
    // Get the range
    const range = selection.getRangeAt(0);
    
    // Find the common ancestor container
    const commonAncestor = range.commonAncestorContainer;
    
    // Get the element (if node is text, get parent element)
    let element = commonAncestor.nodeType === Node.TEXT_NODE 
        ? commonAncestor.parentElement 
        : commonAncestor;
    
    // If it's not an element, try to get parent
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        element = element?.parentElement || document.body;
    }
    
    // Find the best container element (not inline elements)
    element = findBestContainer(element);
    
    // Check if element is valid
    if (!element || element === document.body || element === document.documentElement) {
        return;
    }
    
    // Make sure element is highlighted (if highlightMode allows)
    if (textSelectorSettings && textSelectorSettings.highlightMode !== 'disabled') {
        if (currentHighlightedElement !== element) {
            // Remove previous highlight
            if (currentHighlightedElement) {
                currentHighlightedElement.classList.remove('rtl-selected-element');
            }
            // Add highlight to current element
            element.classList.add('rtl-selected-element');
            currentHighlightedElement = element;
        }
    }
    
    // Log selected element
    console.log('[RTL Text Selector] Selected element:', element);
    
    // Show popup menu (only if highlightMode is 'on_direction_change' or 'on_selection')
    if (!textSelectorSettings || textSelectorSettings.highlightMode !== 'disabled') {
        showPopupMenu(range, element);
    }
}

/**
 * Find the best container element (skip inline elements)
 */
function findBestContainer(element) {
    if (!element) {
        return document.body;
    }
    
    const inlineElements = [
        'SPAN', 'A', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'CODE', 
        'SMALL', 'SUB', 'SUP', 'MARK', 'DEL', 'INS'
    ];
    
    let current = element;
    let depth = 0;
    const maxDepth = 20; // Prevent infinite loops
    
    // Go up the DOM tree to find a block-level element
    while (current && current !== document.body && current !== document.documentElement && depth < maxDepth) {
        const tagName = current.tagName;
        
        // If it's not an inline element, use it
        if (!inlineElements.includes(tagName)) {
            return current;
        }
        
        current = current.parentElement;
        depth++;
    }
    
    // If we couldn't find a good container, return the original element
    return element;
}

/**
 * Show popup menu with direction options
 */
function showPopupMenu(range, element) {
    // Remove existing popup
    hidePopupMenu();
    isMenuOpen = false;
    
    // Create popup menu
    popupMenu = document.createElement('div');
    popupMenu.className = 'rtl-text-selector-menu minimized';
    popupMenu.id = 'rtl-text-selector-popup';
    
    // Create header with logo and settings button
    const header = document.createElement('div');
    header.className = 'rtl-text-selector-menu-header';
    
    // Logo
    const logo = document.createElement('img');
    logo.className = 'rtl-text-selector-menu-logo';
    logo.src = chrome.runtime?.id ? chrome.runtime.getURL(imagePath) : imagePath;
    logo.alt = 'RTL Extension';
    
    // Settings button - Create first and add handler before header handler
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'rtl-text-selector-menu-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.title = 'تنظیمات';
    
    // Add click handler for settings button
    settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Open options page via background script
        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'openOptionsPage' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[RTL Text Selector] Error:', chrome.runtime.lastError);
                }
            });
        }
        
        hidePopupMenu();
        removeHighlight();
    }, true);
    
    // Add click handler to expand menu (for header and logo only)
    const expandMenu = (e) => {
        // Don't expand if clicking on settings button
        if (e.target === settingsBtn || settingsBtn.contains(e.target)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        if (isMenuMinimized) {
            popupMenu.classList.remove('minimized');
            isMenuMinimized = false;
        }
    };
    
    header.addEventListener('click', expandMenu, true);
    logo.addEventListener('click', expandMenu, true);
    
    header.appendChild(logo);
    header.appendChild(settingsBtn);
    popupMenu.appendChild(header);
    
    // Create menu body
    const menuBody = document.createElement('div');
    menuBody.className = 'rtl-text-selector-menu-body';
    
    // Create menu items
    const menuItems = [
        { text: 'راست چین', direction: 'rtl' },
        { text: 'چپ چین', direction: 'ltr' }
    ];
    
    menuItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.className = 'rtl-text-selector-menu-item';
        button.textContent = item.text;
        button.type = 'button'; // Prevent form submission
        
        // Use addEventListener instead of onclick
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Apply direction
            applyDirection(element, item.direction);
            
            // Close menu and remove highlight
            setTimeout(() => {
                hidePopupMenu();
                removeHighlight();
            }, 100);
        }, true); // Use capture phase
        
        menuBody.appendChild(button);
        
        // Add divider between items (except last)
        if (index < menuItems.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'rtl-text-selector-menu-divider';
            menuBody.appendChild(divider);
        }
    });
    
    popupMenu.appendChild(menuBody);
    
    // Position the menu next to mouse cursor (or selection if mouse position not available)
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    let menuTop, menuLeft;
    if (mousePosition) {
        // Use mouse position if available
        menuTop = mousePosition.y + scrollY + 10; // 10px below cursor
        menuLeft = mousePosition.x + scrollX + 10; // 10px right of cursor
    } else {
        // Fallback to selection position (for keyboard selection)
        const rect = range.getBoundingClientRect();
        menuTop = rect.top + scrollY + 10; // 10px below selection
        menuLeft = rect.left + scrollX + 10; // 10px right of selection
    }
    
    popupMenu.style.top = menuTop + 'px';
    popupMenu.style.left = menuLeft + 'px';
    
    // Add to document
    document.body.appendChild(popupMenu);
    isMenuOpen = true;
    
    // Adjust position if menu goes off screen
    setTimeout(() => {
        const menuRect = popupMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check if menu goes off right edge
        if (menuRect.right > viewportWidth) {
            popupMenu.style.left = (viewportWidth - menuRect.width - 10) + 'px';
        }
        
        // Check if menu goes off left edge
        if (menuRect.left < 0) {
            popupMenu.style.left = '10px';
        }
        
        // Check if menu goes off top edge
        if (menuRect.top < 0) {
            const currentTop = parseInt(popupMenu.style.top) || 0;
            popupMenu.style.top = (currentTop - menuRect.top + 10) + 'px';
        }
        
        // Check if menu goes off bottom edge
        if (menuRect.bottom > viewportHeight) {
            const currentTop = parseInt(popupMenu.style.top) || 0;
            popupMenu.style.top = (currentTop - (menuRect.bottom - viewportHeight) - 10) + 'px';
        }
    }, 0);
    
    // Close menu when clicking outside (with delay to allow button clicks)
    setTimeout(() => {
        const closeHandler = (e) => {
            // Don't close if clicking on the menu itself
            if (popupMenu && popupMenu.contains(e.target)) {
                return;
            }
            closeMenuOnOutsideClick(e);
        };
        
        document.addEventListener('click', closeHandler, true);
        document.addEventListener('selectionchange', closeMenuOnSelectionChange, true);
        
        // Store handler for cleanup
        popupMenu._closeHandler = closeHandler;
    }, 200);
}

/**
 * Apply direction to element
 */
function applyDirection(element, direction) {
    if (!element) {
        console.error('[RTL Text Selector] ❌ No element provided!');
        return;
    }
    
    let finalDirection = direction;
    
    if (direction === 'auto') {
        // Use smart detection
        const text = element.textContent || element.innerText || '';
        finalDirection = detectTextDirection(text);
    }
    
    // Apply dir attribute
    try {
        element.setAttribute('dir', finalDirection);
    } catch (e) {
        console.error('[RTL Text Selector] ❌ Error setting dir attribute:', e);
    }
    
    // Apply text-align with !important using setProperty
    const textAlignValue = finalDirection === 'rtl' ? 'right' : 'left';
    try {
        element.style.setProperty('text-align', textAlignValue, 'important');
    } catch (e) {
        console.error('[RTL Text Selector] ❌ Error setting text-align:', e);
    }
    
    // Also set direction in style for better compatibility
    try {
        element.style.setProperty('direction', finalDirection, 'important');
    } catch (e) {
        console.error('[RTL Text Selector] ❌ Error setting direction style:', e);
    }
}

/**
 * Hide popup menu
 */
function hidePopupMenu() {
    if (popupMenu) {
        // Remove event listeners if they exist
        if (popupMenu._closeHandler) {
            document.removeEventListener('click', popupMenu._closeHandler, true);
            popupMenu._closeHandler = null;
        }
        document.removeEventListener('selectionchange', closeMenuOnSelectionChange, true);
        
        // Remove from DOM
        if (popupMenu.parentNode) {
            popupMenu.parentNode.removeChild(popupMenu);
        }
        popupMenu = null;
    }
    isMenuOpen = false;
    isMenuMinimized = true; // Reset to minimized state
}

/**
 * Close menu when clicking outside
 */
function closeMenuOnOutsideClick(event) {
    if (popupMenu && !popupMenu.contains(event.target)) {
        hidePopupMenu();
        removeHighlight();
    }
}

/**
 * Close menu when selection changes
 */
function closeMenuOnSelectionChange() {
    const selection = window.getSelection();
    if (selection && selection.isCollapsed) {
        hidePopupMenu();
        removeHighlight();
    }
}

/**
 * Remove highlight manually
 */
export function removeHighlight() {
    if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove('rtl-selected-element');
        currentHighlightedElement = null;
    }
    hidePopupMenu();
}

/**
 * Cleanup function
 */
export function cleanupTextSelector() {
    if (highlightStyle && highlightStyle.parentNode) {
        highlightStyle.parentNode.removeChild(highlightStyle);
        highlightStyle = null;
    }
    
    removeHighlight();
    hidePopupMenu();
    
    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('mouseup', handleSelectionChange);
    document.removeEventListener('keyup', handleSelectionChange);
    document.removeEventListener('click', closeMenuOnOutsideClick, true);
    document.removeEventListener('selectionchange', closeMenuOnSelectionChange, true);
}
