/**
 * Text direction utility functions
 * Public index for site services. Implementation lives in directionUtils/.
 */

export {
    analyzeTextDirection,
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
    detectDirectionByAlgorithm,
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
export {
    getActiveRtlAlgorithm,
    resetRtlDomCaches,
    setActiveRtlAlgorithm,
    setMixedTitleDisplayMode
} from './directionUtils/settings.js';
export { processTablesInContainer } from './directionUtils/tables.js';
