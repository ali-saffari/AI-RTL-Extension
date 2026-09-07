/**
 * Public index for site services. Implementation lives in sibling modules.
 */

export {
    analyzeTextDirection,
    detectDirectionByAlgorithm,
    detectTextDirection,
    isRTL,
    isCode
} from '../analyzeDirection.js';
export {
    applyLiveFlipRtlArrowsSetting,
    setFlipRtlArrows
} from './arrows.js';
export {
    applyLiveFixMixedTextSetting,
    setFixMixedText
} from './mixedPhrases.js';
export {
    processParagraphWithBreaks,
    setTextDirectionAndFont,
    setTextDirectionAndFontOneTime,
    getAnalyzableText
} from './applyElementDirection.js';
export {
    applyRtlToContainer,
    applyRtlToElement,
    getAttributeTextElements,
    resetRtlDomCaches
} from './applyRtl.js';
export {
    applyLiveCodeAlgorithmSetting,
    processCodeMirrorBlocks,
    setApplyAlgorithmToCode
} from './codeBlocks.js';
export {
    isLockedMarkdownEditor,
    processLockedEditorByCss
} from './lockedEditor.js';
export { processTextElementsAdvanced } from './processAdvanced.js';
export {
    getActiveRtlAlgorithm,
    setActiveRtlAlgorithm,
    setMixedTitleDisplayMode
} from './settings.js';
export { processTablesInContainer } from './tables.js';
