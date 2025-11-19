import { manualRtlState } from './state.js';

const STYLE_CONTENT = `
    .rtl-selected-element {
        outline: 3px solid var(--rtl-highlight-color, red) !important;
        outline-offset: 0 !important;
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
    .rtl-text-selector-menu-logo-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .rtl-text-selector-extension-logo {
        width: 18px;
        height: 18px;
        object-fit: contain;
        cursor: pointer;
    }
    .rtl-text-selector-menu.minimized .rtl-text-selector-extension-logo {
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
    }
    .rtl-text-selector-menu-settings-btn:hover {
        background-color: #e5e7eb;
        color: #374151;
    }
    .rtl-text-selector-menu-body {
        padding: 2px 0;
        max-height: 500px;
        overflow: hidden;
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
    .rtl-manual-direction-element {
        position: relative;
    }
    .rtl-manual-direction-element::after {
        content: '';
        position: absolute;
        top: 6px;
        left: 6px;
        width: 20px;
        height: 20px;
        background-image: var(--rtl-manual-logo-image, none);
        background-repeat: no-repeat;
        background-size: contain;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
        z-index: 1;
    }
    .rtl-manual-logo-always::after {
        opacity: 1;
    }
    .rtl-manual-logo-hover::after {
        opacity: 0;
    }
    .rtl-manual-logo-hover:hover::after {
        opacity: 1;
    }
    .rtl-manual-logo-disabled::after {
        display: none;
    }
    .rtl-manual-direction-element.rtl-menu-open::after {
        display: none !important;
    }
`;

export function ensureHighlightStyle() {
    if (manualRtlState.highlightStyle) {
        return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'rtl-text-selector-style';
    styleElement.textContent = STYLE_CONTENT;

    document.head.appendChild(styleElement);
    manualRtlState.highlightStyle = styleElement;

    if (!document.getElementById('rtl-text-selector-style')) {
        console.error('[RTL Text Selector] ❌ Style element NOT found in DOM!');
    }
}

export function removeHighlightStyle() {
    if (manualRtlState.highlightStyle && manualRtlState.highlightStyle.parentNode) {
        manualRtlState.highlightStyle.parentNode.removeChild(manualRtlState.highlightStyle);
        manualRtlState.highlightStyle = null;
    }
}

