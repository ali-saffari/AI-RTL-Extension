// Copyright utility functions
import { extensionIconPath, saffariLink, textSaffari } from './constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from './modal.js';

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
    
    // If supportHide is enabled, don't show copyright
    if (supportHide === true) {
        return;
    }
    
    if (!$element.hasClass("AsOk")) {
        $element.addClass("AsOk");
        
        // Check if AsBox class already exists on the site
        if (AQ('.AsBox').length === 0) {
            const alisaffari = chrome.runtime?.id ? chrome.runtime.getURL(extensionIconPath) : extensionIconPath;
            
            $element.append(`<div class="AsRtl FontSet AsBox ${customClass}" style="${customStyle} ">

                    <a href="${saffariLink}" target="_blank">

                  <img src="${alisaffari}"  alt="ali saffari" width="22" height="22"></a>



                    ${textSaffari}

${BtnDonate()}



                </div>`);

            }
            
            AQ('body').each(function (each) {
                if (!AQ(this).hasClass("AsDonateOk")) {
                    AQ(this).append(modalDonate());
                    AQ(this).addClass("AsDonateOk");
                }
            });
            modalDonateFun();
      
    }
}
