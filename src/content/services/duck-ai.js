// digen.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setduckai(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo1 = `.pEpgAp_uV2lfaCYzOoNa`
        addCopyright(AQ(fo1), 'AsBoxGemini AsBoxB' , 'margin-top: 0px; margin-bottom: -4px; font-size: 13px;');
        // let fo2 = `.flex.flex-1.flex.flex-col.w-full.bottom-2.left-0.right-0.absolute`
        // addCopyright(AQ(fo2), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -30px; font-size: 13px;');


    }

    AQ('textarea, input[type="text"] ').each(function (each) {
        const inputElement = AQ(this);
        
        if (inputElement.data('rtl-listener-added')) {
            return;
        }
        inputElement.data('rtl-listener-added', true);

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        inputElement.on('input keyup', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

    AQ('.FXxDlyKogO69URjNUfji , .whitespace-normal ,.e9Mu29Jb8w2BUtuoSuuC').each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            setTextAlign: 'important',
            processTables: true
        });
    });
}

// Main activation function for Digen
export function activateDuckai(rtlAlgorithm = 'advanced_full') {
    setduckai(rtlAlgorithm);
    setInterval(() => {
        setduckai(rtlAlgorithm);
    }, 1000);
}

