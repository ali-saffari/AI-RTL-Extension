import { detectTextDirection } from '../utils/analyzeDirection.js';
import { applyLogoDisplayToElement } from './logo.js';

export function applyDirection(element, direction) {
    if (!element) {
        console.error('[RTL Text Selector] ❌ No element provided!');
        return;
    }

    let finalDirection = direction;

    if (direction === 'auto') {
        const text = element.textContent || element.innerText || '';
        finalDirection = detectTextDirection(text);
    }

    try {
        element.setAttribute('dir', finalDirection);
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error setting dir attribute:', error);
    }

    const textAlignValue = finalDirection === 'rtl' ? 'right' : 'left';
    try {
        element.style.setProperty('text-align', textAlignValue, 'important');
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error setting text-align:', error);
    }

    try {
        element.style.setProperty('direction', finalDirection, 'important');
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error setting direction style:', error);
    }

    applyLogoDisplayToElement(element);
}

