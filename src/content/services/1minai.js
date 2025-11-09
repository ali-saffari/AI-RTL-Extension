// 1minai.js service functions
import { addCopyright } from '../utils/copyright.js';
import { processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

export function set1minai(rtlAlgorithm = 'advanced_full') {
    if (chrome.runtime?.id) {
        let fo2 = `.sc-fWMeal`
     addCopyright($(fo2), 'AsBoxGemini AsBoxB' , 'margin-top: 4px; margin-bottom: -16px; font-size: 13px;');
    }

    // Add CSS for ant-input elements
    if (!$('#1minai-ant-input-style').length) {
        $('<style id="1minai-ant-input-style">:where(.css-b9n3i9).ant-input { font-family: iranyekan, sans-serif !important; }</style>').appendTo('head');
    }

    $('textarea, input[type="text"], input[type="search"], input:not([type])').each(function (each) {
        const inputElement = $(this);
        
        if (inputElement.data('rtl-listener-added')) {
            return;
        }
        inputElement.data('rtl-listener-added', true);

        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        inputElement.on('input keyup', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
            
            // Only find adjacent DIV for textarea elements
            if ($(this).is('textarea')) {
                const $textarea = $(this);
                const direction = $textarea.attr('data-direction') || $textarea.attr('dir') || 'ltr';
                const siblings = $textarea.siblings('div');
                const parentContainer = $textarea.parent();
                const closestRelative = $textarea.closest('[style*="position"]');
                const searchContainer = closestRelative.length ? closestRelative : parentContainer;
                
                const adjacentDiv = siblings.add(searchContainer.find('div')).filter(function() {
                    const $div = $(this);
                    if ($div.is('textarea, input') || $div.find('textarea, input').length > 0) {
                        return false;
                    }
                    return $div.css('position') === 'absolute';
                });
                
                if (adjacentDiv.length > 0) {
                    adjacentDiv.each(function() {
                        const $div = $(this);
                        if (direction === 'rtl') {
                            $div.css({ 'right': 'auto', 'left': '10px' });
                        } else {
                            $div.css({ 'left': 'auto', 'right': '10px' });
                        }
                    });
                }
            }
        });
    });

    $('.ant-typography').each(function (each) {
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            rtlClass: 'AsOkRList'
        });
    });

    $('.cmrGwy ').each(function (each) {
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });
}

// Main activation function for 1minai
export function activate1minai(rtlAlgorithm = 'advanced_full') {
    set1minai(rtlAlgorithm);
    setInterval(() => {
        set1minai(rtlAlgorithm);
    }, 1000);
}

