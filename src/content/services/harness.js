// harness.js service functions (DeepSeek Harness local web UI, port 3080)
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

export function setHarness(rtlAlgorithm = 'advanced_full') {
    AQ('[data-composer-input]').each(function () {
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

    // The bubble is inside the flow item. The row itself is flex-end, so RTL
    // stays on the text. An unscoped bubble class is the shell tooltip.
    AQ('[data-chat-flow-kind="user"] [class*="bubble"], [data-chat-flow-kind="steering"] [class*="bubble"]').each(function () {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}

export function activateHarness(rtlAlgorithm = 'advanced_full') {
    console.log('DeepSeek Harness RTL activated with algorithm:', rtlAlgorithm);
    setHarness(rtlAlgorithm);
    setInterval(() => { setHarness(rtlAlgorithm); }, 500);
}
