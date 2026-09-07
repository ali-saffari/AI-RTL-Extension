/**
 * Text direction utility functions
 * Public index for site services. Implementation lives in directionUtils/.
 */

export {
    analyzeTextDirection,
    detectDirectionByAlgorithm,
    detectTextDirection,
    isRTL,
    isCode
} from './analyzeDirection.js';
export {
    applyLiveFlipRtlArrowsSetting,
    setFlipRtlArrows
} from './directionUtils/arrows.js';
export {
    processParagraphWithBreaks,
    setTextDirectionAndFont,
    setTextDirectionAndFontOneTime
} from './directionUtils/applyElementDirection.js';
export {
    applyRtlToContainer,
    applyRtlToElement,
    getAttributeTextElements
} from './directionUtils/applyRtl.js';
export {
    applyLiveCodeAlgorithmSetting,
    processCodeMirrorBlocks,
    setApplyAlgorithmToCode
} from './directionUtils/codeBlocks.js';
export {
    isLockedMarkdownEditor,
    processLockedEditorByCss
} from './directionUtils/lockedEditor.js';
export { processTextElementsAdvanced } from './directionUtils/processAdvanced.js';
export { resetRtlDomCaches } from './directionUtils/resetCaches.js';
export {
    getActiveRtlAlgorithm,
    setActiveRtlAlgorithm,
    setMixedTitleDisplayMode
} from './directionUtils/settings.js';
export { processTablesInContainer } from './directionUtils/tables.js';
