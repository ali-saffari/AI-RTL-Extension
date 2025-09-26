// Copyright utility functions
import { imagePath, saffariLink, textSaffari } from './constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from './modal.js';

/**
 * Adds copyright to target element with custom class and style
 * @param {jQuery} $targetElement - jQuery element to append copyright to
 * @param {string} customClass - Custom CSS class for the copyright box
 * @param {string} customStyle - Custom inline styles for the copyright box
 */
export async function addCopyright($targetElement, customClass = '', customStyle = '') {
    // Check supportHide setting - only show copyright if it's disabled or doesn't exist
    const result = await chrome.storage.sync.get(['supportHide']);
    const supportHide = result.supportHide;
    
    // If supportHide is enabled, don't show copyright
    if (supportHide === true) {
        return;
    }
    
    if (!$targetElement.hasClass("AsOk")) {
        $targetElement.addClass("AsOk");
        
        // Check if AsBox class already exists on the site
        if ($('.AsBox').length === 0) {
            const alisaffari = chrome.runtime?.id ? chrome.runtime.getURL(imagePath) : imagePath;
            
            $targetElement.append(`<div class="AsRtl FontSet AsBox ${customClass}" style="${customStyle}">

                    <a href="${saffariLink}" target="_blank">

                  <img src="${alisaffari}" alt="ali saffari"></a>



                    ${textSaffari}

${BtnDonate()}



                </div>`);

            }
            
            $('body').each(function (each) {
                if (!$(this).hasClass("AsDonateOk")) {
                    $(this).append(modalDonate());
                    $(this).addClass("AsDonateOk");
                }
            });
            modalDonateFun();
      
    }
}
