// Copyright utility functions
import { extensionIconPath, saffariLink } from './constants.js';
import { BtnDonate } from './modal.js';
import { resolveCopyrightTexts, watchCopyrightLanguage } from './copyrightI18n.js';

watchCopyrightLanguage();

/**
 * Adds copyright to target element with custom class and style
 * @param {AQ} $targetElement - AQ element to append copyright to
 * @param {string} customClass - Custom CSS class for the copyright box
 * @param {string} customStyle - Custom inline styles for the copyright box
 */
export async function addCopyright($targetElement, customClass = '', customStyle = '') {
    // Convert string selector to jQuery object if needed
    let $element;
    if (typeof $targetElement === 'string') {
        $element = AQ($targetElement);
    } else {
        $element = $targetElement;
    }
    
    // Check if targetElement exists and has elements
    if (!$element || $element.length === 0) {
        return;
    }
    
    // Check supportHide setting - only show copyright if it's disabled or doesn't exist
    let supportHide = false;
    try {
        const result = await chrome.storage.sync.get(['supportHide']);
        supportHide = result.supportHide;
    } catch (error) {
        // Extension context invalidated or other error - use default value
        console.log('Chrome storage access failed, using default supportHide value:', error);
        supportHide = false;
    }
    
    const leftoverModal = document.getElementById('Asmodal');
    if (leftoverModal) leftoverModal.remove();
    document.body?.classList.remove('AsDonateOk');

    // If supportHide is enabled, don't show copyright
    if (supportHide === true) {
        return;
    }

    if (!$element.hasClass("AsOk")) {
        $element.addClass("AsOk");
        
        // Check if AsBox class already exists on the site
        if (AQ('.AsBox').length === 0) {
            const alisaffari = chrome.runtime?.id ? chrome.runtime.getURL(extensionIconPath) : extensionIconPath;
            const { hope, donate, dir } = await resolveCopyrightTexts();
            
            const boxClass = dir === 'ltr' ? 'AsLtr' : 'AsRtl';
            const boxAlign = dir === 'ltr'
                ? 'direction:ltr !important;text-align:left !important;display:flex;align-items:center;justify-content:flex-start;flex-wrap:wrap;gap:6px;'
                : '';
            $element.append(`<div class="${boxClass} FontSet AsBox ${customClass}" dir="${dir}" style="${customStyle} ${boxAlign}">

                    <a href="${saffariLink}" target="_blank">

                  <img src="${alisaffari}"  alt="ali saffari" width="22" height="22"></a>



                    <span class="AsHope" dir="${dir}">${hope}</span>

${BtnDonate(donate, dir)}



                </div>`);

            }
      
    }
}
