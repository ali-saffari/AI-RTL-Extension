import { manualRtlState } from './state.js';
import { updateElementHighlight } from './highlight.js';
import { applyDirection, hasDirectionChanges, removeDirectionChanges } from './direction.js';
import { applyLogoDisplayToElement } from './logo.js';
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
        // اعمال لوگو روی element
        applyLogoDisplayToElement(element);
    } else {
        updateElementHighlight(null, false);
    }

    showPopupMenu(range, element, { forceExpanded });
}

function recalculateMenuPosition(popupMenu, centerOnMouse = false) {
    if (!popupMenu || !popupMenu.parentNode) {
        return;
    }

    requestAnimationFrame(() => {
        const menuRect = popupMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        let finalLeft = parseInt(popupMenu.style.left, 10) || 0;
        let finalTop = parseInt(popupMenu.style.top, 10) || 0;
        
        if (manualRtlState.mousePosition) {
            const mouseX = manualRtlState.mousePosition.x;
            const mouseY = manualRtlState.mousePosition.y;
            
            if (centerOnMouse) {
                // قرار دادن منو طوری که موس در مرکز یا نزدیک مرکز منو باشد
                // سعی می‌کنیم موس را در یک سوم بالای منو قرار دهیم
                finalLeft = mouseX + scrollX - (menuRect.width * 0.3);
                finalTop = mouseY + scrollY - (menuRect.height * 0.2);
            } else {
                // تنظیم موقعیت افقی - اول سعی می‌کنیم سمت راست موس قرار دهیم
                const spaceOnRight = viewportWidth - mouseX;
                const spaceOnLeft = mouseX;
                
                if (spaceOnRight >= menuRect.width + 10) {
                    // جا در سمت راست هست
                    finalLeft = mouseX + scrollX + 10;
                } else if (spaceOnLeft >= menuRect.width + 10) {
                    // جا در سمت چپ هست
                    finalLeft = mouseX + scrollX - menuRect.width - 10;
                } else {
                    // جا در هیچ سمتی نیست، منو را در مرکز قرار می‌دهیم
                    finalLeft = scrollX + (viewportWidth - menuRect.width) / 2;
                }
                
                // تنظیم موقعیت عمودی - اول سعی می‌کنیم زیر موس قرار دهیم
                const spaceBelow = viewportHeight - mouseY;
                const spaceAbove = mouseY;
                
                if (spaceBelow >= menuRect.height + 10) {
                    // جا در پایین هست
                    finalTop = mouseY + scrollY + 10;
                } else if (spaceAbove >= menuRect.height + 10) {
                    // جا در بالا هست
                    finalTop = mouseY + scrollY - menuRect.height - 10;
                } else {
                    // جا در هیچ سمتی نیست، منو را در مرکز قرار می‌دهیم
                    finalTop = scrollY + (viewportHeight - menuRect.height) / 2;
                }
            }
        }
        
        // بررسی و اصلاح موقعیت افقی در صورت خروج از viewport
        const menuLeftInViewport = finalLeft - scrollX;
        if (menuLeftInViewport + menuRect.width > viewportWidth) {
            finalLeft = scrollX + viewportWidth - menuRect.width - 10;
        }
        if (menuLeftInViewport < 0) {
            finalLeft = scrollX + 10;
        }
        
        // بررسی و اصلاح موقعیت عمودی در صورت خروج از viewport
        const menuTopInViewport = finalTop - scrollY;
        if (menuTopInViewport + menuRect.height > viewportHeight) {
            finalTop = scrollY + viewportHeight - menuRect.height - 10;
        }
        if (menuTopInViewport < 0) {
            finalTop = scrollY + 10;
        }
        
        popupMenu.style.left = `${finalLeft}px`;
        popupMenu.style.top = `${finalTop}px`;
    });
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

        // محاسبه مجدد موقعیت منو بعد از expand - قرار دادن منو طوری که موس روی آن باشد
        recalculateMenuPosition(popupMenu, true);

        setTimeout(() => {
            if (manualRtlState.popupMenu) {
                manualRtlState.popupMenu._isExpanding = false;
                // محاسبه مجدد موقعیت بعد از اینکه منو کاملاً expand شد - قرار دادن منو طوری که موس روی آن باشد
                recalculateMenuPosition(manualRtlState.popupMenu, true);
            }
        }, 100);
    };

    if (menuDisplayMode === 'logo_first') {
        popupMenu.addEventListener('click', expandMenu, true);
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

    // اضافه کردن دکمه حذف تغییرات اگر تغییرات وجود داشته باشد
    if (hasDirectionChanges(element)) {
        const divider = document.createElement('div');
        divider.className = 'rtl-text-selector-menu-divider';
        menuBody.appendChild(divider);

        const removeButton = document.createElement('button');
        removeButton.className = 'rtl-text-selector-menu-item';
        removeButton.textContent = 'حذف تغییرات';
        removeButton.type = 'button';

        removeButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            removeDirectionChanges(element);

            setTimeout(() => {
                updateElementHighlight(null, false);
            }, 100);
        }, true);

        menuBody.appendChild(removeButton);
    }

    popupMenu.appendChild(menuBody);

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let menuTop;
    let menuLeft;

    if (manualRtlState.mousePosition) {
        // منو را کنار موس قرار می‌دهیم (هم‌ارتفاع با موس)
        menuTop = manualRtlState.mousePosition.y + scrollY;
        menuLeft = manualRtlState.mousePosition.x + scrollX + 10;
    } else {
        const rect = range.getBoundingClientRect();
        menuTop = rect.top + scrollY;
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

    recalculateMenuPosition(popupMenu);

    setTimeout(() => {
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

