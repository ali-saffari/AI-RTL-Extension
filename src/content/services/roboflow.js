// roboflow.js service functions (Roboflow - app.roboflow.com)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setRoboflow(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        addCopyright(AQ('.relative.z-20.shrink-0 .mx-auto.w-full.max-w-3xl'), 'AsBoxGemini AsBoxB' , 'margin-top: -12px; margin-bottom: 2px; font-size: 13px;');
    }

    AQ('textarea, [contenteditable="true"], [role="textbox"]').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
    });

    AQ('[class*="markdown"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    // Source must be "\\/" so the selector string is ".group\/message".
    // A single "\/" is only "/", and Sizzle then throws on ".group/message".

      AQ('.whitespace-pre-wrap').each(function () {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
    });


    // AQ('.group\\/message').each(function () {
    //     applyRtlToContainer(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsOk',
    //         isContainer: true,
    //         setTextAlign: true,
    //         onlyCss: '.whitespace-pre-wrap'
    //     });
    // });
}

export function activateRoboflow(rtlAlgorithm = 'advanced_full') {
    console.log('Roboflow RTL activated with algorithm:', rtlAlgorithm);

    setRoboflow(rtlAlgorithm);

    setInterval(() => {
        setRoboflow(rtlAlgorithm);
    }, 500);
}
