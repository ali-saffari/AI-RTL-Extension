// notta.js service functions (Notta Brain - app.notta.ai/brain)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setNotta(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(AQ('[class*="disclaimer__"]').parent(), 'AsBoxGemini AsBoxB', '');
    }

    // AQ(' [class*="tiptapEditor"]').each(function () {
    //     applyRtlToElement(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsRtl'
    //     });
    // });



    AQ('[class*="tiptapEditor"]').parent().each(function() {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet FontMinimax',
            processedClass: 'AsOkText',
            isContainer: true,
            onlyCss: '.tiptap.ProseMirror'
        });
    });


    AQ('[class*="markdown"] ,  [class*="user_text__content"],  [class*="message__bubble"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateNotta(rtlAlgorithm = 'advanced_full') {
    console.log('Notta Brain RTL activated with algorithm:', rtlAlgorithm);

    setNotta(rtlAlgorithm);

    setInterval(() => {
        setNotta(rtlAlgorithm);
    }, 500);
}
