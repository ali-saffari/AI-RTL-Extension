import {
    HALF_SPACE_CHAR,
    isHalfSpaceEnabledForSite
} from '../../constants/halfSpaceHotkey.js';

const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'url', 'tel', 'email', 'password']);

let hotkeyEnabled = false;
let listenerAttached = false;

function isHalfSpaceShortcut(event) {
    if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) {
        return false;
    }
    return event.code === 'Digit2' || event.code === 'Numpad2';
}

function isEditableElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }

    if (element.isContentEditable) {
        return true;
    }

    const tag = element.tagName;
    if (tag === 'TEXTAREA') {
        return !element.readOnly && !element.disabled;
    }

    if (tag === 'INPUT') {
        const type = String(element.type || 'text').toLowerCase();
        return !element.readOnly && !element.disabled && TEXT_INPUT_TYPES.has(type);
    }

    return Boolean(element.closest && element.closest('[contenteditable="true"], [contenteditable=""]'));
}

function insertInTextControl(element) {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number') {
        return false;
    }

    if (typeof element.setRangeText === 'function') {
        element.setRangeText(HALF_SPACE_CHAR, start, end, 'end');
    } else {
        const value = element.value || '';
        element.value = value.slice(0, start) + HALF_SPACE_CHAR + value.slice(end);
        const caret = start + HALF_SPACE_CHAR.length;
        if (typeof element.setSelectionRange === 'function') {
            element.setSelectionRange(caret, caret);
        }
    }

    element.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: HALF_SPACE_CHAR
    }));
    return true;
}

function insertInContentEditable() {
    try {
        if (document.execCommand('insertText', false, HALF_SPACE_CHAR)) {
            return true;
        }
    } catch {
        // Some editors throw; fall through to Selection API.
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return false;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(HALF_SPACE_CHAR);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    const target = document.activeElement;
    if (target) {
        target.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: HALF_SPACE_CHAR
        }));
    }
    return true;
}

function insertHalfSpace(element) {
    if (!isEditableElement(element)) {
        return false;
    }

    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        return insertInTextControl(element);
    }

    return insertInContentEditable();
}

function onKeyDown(event) {
    if (!hotkeyEnabled || !isHalfSpaceShortcut(event)) {
        return;
    }

    const target = event.target;
    const element = target && target.nodeType === Node.ELEMENT_NODE
        ? target
        : document.activeElement;

    if (!isEditableElement(element)) {
        return;
    }

    if (!insertHalfSpace(element)) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
    }
}

function attachListener() {
    if (listenerAttached) {
        return;
    }
    window.addEventListener('keydown', onKeyDown, true);
    listenerAttached = true;
}

export function setHalfSpaceHotkeyEnabled(enabled) {
    hotkeyEnabled = Boolean(enabled);
    if (hotkeyEnabled) {
        attachListener();
    }
}

export async function syncHalfSpaceHotkeyForService(serviceKey) {
    setHalfSpaceHotkeyEnabled(isHalfSpaceEnabledForSite(undefined, serviceKey));
}
