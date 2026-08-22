// digen.js service functions
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/textDirectionUtils.js';

export function setDigen(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo1 = `.fixed.bottom-6.w-full`
        addCopyright(AQ(fo1), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -30px; font-size: 13px;');
        let fo2 = `.flex.flex-1.flex.flex-col.w-full.bottom-2.left-0.right-0.absolute`
        addCopyright(AQ(fo2), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -30px; font-size: 13px;');


    }

    AQ('textarea, input[type="text"], input[type="search"], input:not([type]) , .tiptap . .line-clamp-2 ').each(function (each) {
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

    // AQ('.message-content, .chat-message, .conversation-message').each(function (each) {
    //     applyRtlToContainer(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsOk',
    //         isContainer: true,
    //         setTextAlign: true
    //     });
    // });
}

// Main activation function for Digen
export function activateDigen(rtlAlgorithm = 'advanced_full') {
    setDigen(rtlAlgorithm);
    setInterval(() => {
        setDigen(rtlAlgorithm);
    }, 1000);
}

