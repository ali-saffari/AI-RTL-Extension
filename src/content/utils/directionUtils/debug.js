export const DEBUG_MODE = false;

export function setDebugAttr($element, attrName, value) {
    if (DEBUG_MODE) {
        $element.attr(attrName, value);
    }
}
