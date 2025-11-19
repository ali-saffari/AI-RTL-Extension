import { manualRtlState } from './state.js';

export function createRangeForElement(element) {
    if (!element || !element.ownerDocument) {
        return null;
    }
    try {
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(element);
        return range;
    } catch (error) {
        console.error('[RTL Text Selector] ❌ Error creating range for element:', error);
        return null;
    }
}

export function findBestContainer(element) {
    if (!element) {
        return document.body;
    }

    const inlineElements = [
        'SPAN', 'A', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'CODE',
        'SMALL', 'SUB', 'SUP', 'MARK', 'DEL', 'INS'
    ];

    let current = element;
    let depth = 0;
    const maxDepth = 20;

    while (current && current !== document.body && current !== document.documentElement && depth < maxDepth) {
        const tagName = current.tagName;
        if (!inlineElements.includes(tagName)) {
            return current;
        }
        current = current.parentElement;
        depth++;
    }

    return element;
}

export function updateMousePositionFromEvent(event) {
    manualRtlState.mousePosition = { x: event.clientX, y: event.clientY };
}

export function resetMousePosition() {
    manualRtlState.mousePosition = null;
}

