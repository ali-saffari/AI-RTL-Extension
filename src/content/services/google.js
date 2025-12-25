// google.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm, setTextDirectionAndFont } from '../utils/textDirectionUtils.js';

// Default config for Google
const configDefault = {
    bigElement: "[data-container-id=\"main-col\"]",
    smallElement: ".wQN2Jd",
    textarea: ".Txyg0d textarea",
    copyright: ".esoFne ",
    style: ".Y3BBE, .VndcI , .T286Pc { font-family: 'iranyekan' !important; } .CEpIFc { display: none !important; }"
};

// Get config from storage or use default
async function getGoogleConfig() {
    try {
        const result = await chrome.storage.sync.get(['onlineConfig']);
        if (result.onlineConfig?.google?.element) {
            return { ...configDefault, ...result.onlineConfig.google.element };
        }
    } catch (error) {
        console.error('Error getting Google config:', error);
    }
    return configDefault;
}

export async function setGoogle(rtlAlgorithm = 'advanced_full') {
    const config = await getGoogleConfig();
    
    // Inject style if provided
    if (config.style) {
        const styleId = 'google-rtl-style';
        if (!document.getElementById(styleId)) {
            const styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = config.style + ' .AsBoxGoogle { position: absolute; bottom: -34px; right: 0; left: 0; }';
            document.head.appendChild(styleElement);
        }
    }
    
    if (chrome.runtime?.id) {
  
        // Add copyright to configured classes
        if (config.copyright) {
            addCopyright(AQ(config.copyright), 'AsBoxGoogle AsBoxB');
        }
    }

    // Process textarea elements for text direction detection
    AQ(config.textarea).each(function (each) {
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk'
        });
        
        // Add event listener for real-time text direction detection
        AQ(this).on('input keyup paste', function() {
            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                fontClass: 'FontSet'
            });
        });
    });

   
    AQ(config.bigElement).each(function (each) {
        // Skip elements with CEpIFc class
        if (AQ(this).hasClass('CEpIFc') || AQ(this).find('.CEpIFc').length > 0) {
            return;
        }
        processTextElementsByRtlAlgorithm(this, rtlAlgorithm, {
            fontClass: 'FontSetImportant',
            processedClass: 'AsOk',
            isContainer: true
        });
    });
    
    // Process small elements if configured
    if (config.smallElement) {
        AQ(config.smallElement).each(function (each) {
            // Skip elements with CEpIFc class
       
            if (!AQ(this).hasClass('AsOk')) {
                setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                    fontClass: 'FontSet',
                    processedClass: 'AsOk'
                });
            }
        });
    }
}

// Main activation function for Google
export function activateGoogle(rtlAlgorithm = 'advanced_full') {
    console.log('Google RTL activated with algorithm:', rtlAlgorithm);
    // Initial setup
    setGoogle(rtlAlgorithm);

    // SetInterval to handle dynamically added content
    let interval = setInterval(() => {
        setGoogle(rtlAlgorithm);
    }, 1000);
}


