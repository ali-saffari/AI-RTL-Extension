import { manualRtlState } from './state.js';
import { updateElementHighlight } from './highlight.js';
import { applyDirection } from './direction.js';
import { getExtensionLogoUrl, getManualLogoUrl } from './assets.js';
import { LOGO_ICON_OFFSET, LOGO_ICON_SIZE } from './constants.js';
import { findBestContainer } from './dom.js';

export function handleMenuDisplayForElement(element, range, options = {}) {
    if (!element || !range) {
        return;
    }

    const highlightMode = manualRtlState.textSelectorSettings?.highlightMode || 'disabled';
    const menuDisplayMode = manualRtlState.textSelectorSettings?.menuDisplayMode || 'logo_first';
    const menuStartsMinimized = menuDisplayMode !== 'menu_direct';
    const forceExpanded = options.forceExpanded || false;
    const forceHighlight = options.forceHighlight || false;

    const shouldShowHighlight =
        highlightMode === 'on_selection' ||
        (highlightMode === 'on_direction_change' && (!menuStartsMinimized || forceExpanded || forceHighlight));

    if (highlightMode === 'disabled') {
        updateElementHighlight(null, false);
    } else if (shouldShowHighlight) {
        updateElementHighlight(element, true);
    } else {
        updateElementHighlight(null, false);
    }

    showPopupMenu(range, element, { forceExpanded });
}

export function showPopupMenu(range, element, options = {}) {
    hidePopupMenu();
    manualRtlState.isMenuOpen = false;

    const menuDisplayMode = manualRtlState.textSelectorSettings?.menuDisplayMode || 'logo_first';
    const forceExpanded = options.forceExpanded || false;
    const startsMinimized = !forceExpanded && menuDisplayMode !== 'menu_direct';

    const popupMenu = document.createElement('div');
    popupMenu.className = startsMinimized ? 'rtl-text-selector-menu minimized' : 'rtl-text-selector-menu';
    popupMenu.id = 'rtl-text-selector-popup';

    manualRtlState.popupMenu = popupMenu;
    manualRtlState.isMenuMinimized = startsMinimized;

    const header = document.createElement('div');
    header.className = 'rtl-text-selector-menu-header';

    const logosWrapper = document.createElement('div');
    logosWrapper.className = 'rtl-text-selector-menu-logo-wrapper';

    const mainLogo = document.createElement('img');
    mainLogo.className = 'rtl-text-selector-menu-logo';
    mainLogo.src = getManualLogoUrl();
    mainLogo.alt = 'RTL Manual Direction';

    const extensionLogo = document.createElement('img');
    extensionLogo.className = 'rtl-text-selector-extension-logo';
    extensionLogo.src = getExtensionLogoUrl();
    extensionLogo.alt = 'Extension Icon';

    logosWrapper.appendChild(mainLogo);
    logosWrapper.appendChild(extensionLogo);

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'rtl-text-selector-menu-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.title = 'تنظیمات';

    settingsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'openOptionsPage' }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[RTL Text Selector] Error:', chrome.runtime.lastError);
                }
            });
        }

        hidePopupMenu();
        updateElementHighlight(null, false);
    }, true);

    const expandMenu = (event) => {
        if (menuDisplayMode !== 'logo_first') {
            return;
        }
        if (event.target === settingsBtn || settingsBtn.contains(event.target)) {
            return;
        }
        if (!manualRtlState.isMenuMinimized) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        popupMenu._isExpanding = true;

        popupMenu.classList.remove('minimized');
        manualRtlState.isMenuMinimized = false;

        if (manualRtlState.textSelectorSettings?.highlightMode === 'on_direction_change') {
            updateElementHighlight(element, true);
        }

        setTimeout(() => {
            if (manualRtlState.popupMenu) {
                manualRtlState.popupMenu._isExpanding = false;
            }
        }, 100);
    };

    if (menuDisplayMode === 'logo_first') {
        header.addEventListener('click', expandMenu, true);
        mainLogo.addEventListener('click', expandMenu, true);
        extensionLogo.addEventListener('click', expandMenu, true);
        logosWrapper.addEventListener('click', expandMenu, true);
    } else {
        header.style.cursor = 'default';
    }

    header.appendChild(logosWrapper);
    header.appendChild(settingsBtn);
    popupMenu.appendChild(header);

    const menuBody = document.createElement('div');
    menuBody.className = 'rtl-text-selector-menu-body';

    const menuItems = [
        { text: 'راست چین', direction: 'rtl' },
        { text: 'چپ چین', direction: 'ltr' }
    ];

    menuItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.className = 'rtl-text-selector-menu-item';
        button.textContent = item.text;
        button.type = 'button';

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            applyDirection(element, item.direction);

            setTimeout(() => {
                hidePopupMenu();
                updateElementHighlight(null, false);
            }, 100);
        }, true);

        menuBody.appendChild(button);

        if (index < menuItems.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'rtl-text-selector-menu-divider';
            menuBody.appendChild(divider);
        }
    });

    popupMenu.appendChild(menuBody);

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let menuTop;
    let menuLeft;

    if (manualRtlState.mousePosition) {
        menuTop = manualRtlState.mousePosition.y + scrollY + 10;
        menuLeft = manualRtlState.mousePosition.x + scrollX + 10;
    } else {
        const rect = range.getBoundingClientRect();
        menuTop = rect.top + scrollY + 10;
        menuLeft = rect.left + scrollX + 10;
    }

    popupMenu.style.top = `${menuTop}px`;
    popupMenu.style.left = `${menuLeft}px`;

    document.body.appendChild(popupMenu);
    manualRtlState.isMenuOpen = true;

    if (element && element.classList && element.classList.contains('rtl-manual-direction-element')) {
        element.classList.add('rtl-menu-open');
        manualRtlState.currentMenuElement = element;
    }

    requestAnimationFrame(() => {
        const menuRect = popupMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (menuRect.right > viewportWidth) {
            popupMenu.style.left = `${viewportWidth - menuRect.width - 10}px`;
        }

        if (menuRect.left < 0) {
            popupMenu.style.left = '10px';
        }

        if (menuRect.top < 0) {
            const currentTop = parseInt(popupMenu.style.top, 10) || 0;
            popupMenu.style.top = `${currentTop - menuRect.top + 10}px`;
        }

        if (menuRect.bottom > viewportHeight) {
            const currentTop = parseInt(popupMenu.style.top, 10) || 0;
            popupMenu.style.top = `${currentTop - (menuRect.bottom - viewportHeight) - 10}px`;
        }
    });

    setTimeout(() => {
        if (menuDisplayMode === 'logo_first') {
            const closeHandler = (event) => {
                if (manualRtlState.popupMenu && manualRtlState.popupMenu.contains(event.target)) {
                    return;
                }
                if (manualRtlState.popupMenu && manualRtlState.popupMenu._isExpanding) {
                    return;
                }
                closeMenuOnOutsideClick(event);
            };

            document.addEventListener('click', closeHandler, true);
            popupMenu._closeHandler = closeHandler;
        } else {
            popupMenu._closeHandler = null;
        }

        document.addEventListener('selectionchange', closeMenuOnSelectionChange, true);
    }, 300);
}

export function hidePopupMenu() {
    const { popupMenu } = manualRtlState;
    if (!popupMenu) {
        return;
    }

    popupMenu._isExpanding = false;

    if (popupMenu._closeHandler) {
        document.removeEventListener('click', popupMenu._closeHandler, true);
        popupMenu._closeHandler = null;
    }
    document.removeEventListener('selectionchange', closeMenuOnSelectionChange, true);

    if (popupMenu.parentNode) {
        popupMenu.parentNode.removeChild(popupMenu);
    }

    manualRtlState.popupMenu = null;
    manualRtlState.isMenuOpen = false;
    manualRtlState.isMenuMinimized = true;

    if (manualRtlState.currentMenuElement && manualRtlState.currentMenuElement.classList) {
        manualRtlState.currentMenuElement.classList.remove('rtl-menu-open');
        manualRtlState.currentMenuElement = null;
    }
}

export function closeMenuOnOutsideClick() {
    hidePopupMenu();
    updateElementHighlight(null, false);
}

export function closeMenuOnSelectionChange() {
    const selection = window.getSelection();
    if (selection && selection.isCollapsed) {
        hidePopupMenu();
        updateElementHighlight(null, false);
    }
}

export function showMenuAfterSelection() {
    if (!manualRtlState.textSelectorSettings || !manualRtlState.textSelectorSettings.manualRtlEnabled) {
        return;
    }

    if (manualRtlState.isMenuOpen) {
        return;
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        if (manualRtlState.currentHighlightedElement) {
            manualRtlState.currentHighlightedElement.classList.remove('rtl-selected-element');
            manualRtlState.currentHighlightedElement = null;
        }
        return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    let element = commonAncestor.nodeType === Node.TEXT_NODE
        ? commonAncestor.parentElement
        : commonAncestor;

    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        element = element?.parentElement || document.body;
    }

    element = findBestContainer(element);

    if (!element || element === document.body || element === document.documentElement) {
        return;
    }

    handleMenuDisplayForElement(element, range, { forceHighlight: false, forceExpanded: false });
}

