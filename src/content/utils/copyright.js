// Copyright utility functions
import { imagePath, saffariLink, textSaffari } from './constants.js';
import { modalDonateFun, modalDonate, BtnDonate } from './modal.js';

/**
 * Adds copyright to target element with custom class and style
 * @param {jQuery} $targetElement - jQuery element to append copyright to
 * @param {string} customClass - Custom CSS class for the copyright box
 * @param {string} customStyle - Custom inline styles for the copyright box
 */
export function addCopyright($targetElement, customClass = '', customStyle = '') {
    if (!$targetElement.hasClass("AsOk")) {
        $targetElement.addClass("AsOk");
        
        const alisaffari = chrome.runtime?.id ? chrome.runtime.getURL(imagePath) : imagePath;
        
        $targetElement.append(`<div class="AsRtl FontSet AsBox ${customClass}" style="${customStyle}">

                <a href="${saffariLink}" target="_blank">

              <img src="${alisaffari}" alt="ali saffari"></a>



                ${textSaffari}

${BtnDonate()}



            </div>`);

        $('body').each(function (each) {
            if (!$(this).hasClass("AsDonateOk")) {
                $(this).append(modalDonate());
                $(this).addClass("AsDonateOk");
            }
        });
        modalDonateFun();
    }
}
