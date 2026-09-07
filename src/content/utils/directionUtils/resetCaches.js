import { restoreFlippedArrowsInPage } from './arrows.js';
import { resetCodeMirrorDirectionStyles } from './codeBlocks.js';
import { resetLockedEditorCaches } from './lockedEditor.js';

export function resetRtlDomCaches() {
    resetLockedEditorCaches();
    restoreFlippedArrowsInPage();
    resetCodeMirrorDirectionStyles();
}
