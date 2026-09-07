// NotebookLM service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

// Helper function to detect text direction based on algorithm
function detectDirectionByAlgorithm(text, rtlAlgorithm) {
    if (!text || !text.trim()) return 'ltr';
    
    let direction;
    if (rtlAlgorithm === 'advanced_section' || rtlAlgorithm === 'advanced_full') {
        direction = detectTextDirection(text);
    } else if (rtlAlgorithm === 'first_word') {
        direction = analyzeTextDirectionFirstWord(text);
    } else {
        direction = detectTextDirection(text); // fallback
    }
    
    return direction;
}

const NOTEBOOK_FONT_STYLE_ID = 'notebooklm-font-style';
const NOTEBOOK_FONT_CSS = `
    html.ai-rtl-has-font {
        --ai-rtl-notebook-ui-fallback: "Google Sans Flex", "Google Sans", "Helvetica Neue", sans-serif;
    }
    html.ai-rtl-has-font body :where(
        p,
        span,
        div,
        mark,
        a,
        h1, h2, h3, h4, h5, h6,
        li,
        label,
        button,
        input,
        textarea,
        select,
        option,
        em,
        strong,
        b,
        i,
        small,
        time,
        cite,
        q,
        blockquote,
        figcaption,
        summary,
        dt, dd,
        th, td, caption,
        legend,
        [role="heading"],
        [role="button"],
        [role="menuitem"],
        [role="option"],
        [role="tab"]
    ):not(
        pre,
        pre *,
        code,
        code *,
        [aria-hidden="true"],
        [style*="font-"],
        [class*="icon"],
        [class*="Icon"],
        [class*="symbol"],
        [class*="Symbol"],
        [class*="material-symbol"],
        [class*="material-icon"],
        .google-symbols,
        .lumi-symbols,
        .mat-ligature-font,
        [data-mat-icon-type="font"]
    ) {
        font-family: var(--ai-rtl-font, iranyekan, sans-serif), var(--ai-rtl-notebook-ui-fallback) !important;
    }
    html.ai-rtl-has-font body code,
    html.ai-rtl-has-font body code *,
    html.ai-rtl-has-font body pre,
    html.ai-rtl-has-font body pre *,
    html.ai-rtl-has-font body kbd,
    html.ai-rtl-has-font body kbd *,
    html.ai-rtl-has-font body samp,
    html.ai-rtl-has-font body samp * {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    }
`;

function injectFontStyleIntoRoot(root, styleId = NOTEBOOK_FONT_STYLE_ID) {
    if (!root) {
        return;
    }
    const host = root.head || root;
    let style = (root.getElementById && root.getElementById(styleId))
        || (root.querySelector && root.querySelector('#' + styleId));
    if (!style) {
        const doc = root.ownerDocument || document;
        style = doc.createElement('style');
        style.id = styleId;
        host.appendChild(style);
    }
    style.textContent = NOTEBOOK_FONT_CSS;
}

function ensureNotebookFontStyle(doc) {
    const targetDoc = doc || document;
    injectFontStyleIntoRoot(targetDoc.head || targetDoc.documentElement);
}

function copyFontFacesToDocument(targetDoc) {
    if (!document.fonts || !targetDoc?.fonts || targetDoc === document) {
        return;
    }
    try {
        document.fonts.forEach((face) => {
            try {
                targetDoc.fonts.add(face);
            } catch (error) {
                // Some FontFace objects cannot be shared across documents
            }
        });
    } catch (error) {
        // Ignore
    }
}

function applyNotebookFontToDocument(targetDoc) {
    if (!targetDoc?.documentElement) {
        return;
    }

    const parentRoot = document.documentElement;
    const iframeRoot = targetDoc.documentElement;
    const fontValue = getComputedStyle(parentRoot).getPropertyValue('--ai-rtl-font').trim()
        || parentRoot.style.getPropertyValue('--ai-rtl-font');

    if (parentRoot.classList.contains('ai-rtl-font-none')) {
        iframeRoot.classList.add('ai-rtl-font-none');
        iframeRoot.classList.remove('ai-rtl-has-font');
        iframeRoot.style.removeProperty('--ai-rtl-font');
        return;
    }

    if (parentRoot.classList.contains('ai-rtl-has-font') && fontValue) {
        iframeRoot.style.setProperty('--ai-rtl-font', fontValue);
        iframeRoot.classList.add('ai-rtl-has-font');
        iframeRoot.classList.remove('ai-rtl-font-none');
    }

    ensureNotebookFontStyle(targetDoc);
    copyFontFacesToDocument(targetDoc);

    if (targetDoc.body && !targetDoc.body.classList.contains('FontSet')) {
        targetDoc.body.classList.add('FontSet');
    }
}

function requestNotebookIframeInject() {
    if (window !== window.top || window.__aiRtlNotebookIframeInjectQueued) {
        return;
    }
    window.__aiRtlNotebookIframeInjectQueued = true;
    setTimeout(() => {
        window.__aiRtlNotebookIframeInjectQueued = false;
        try {
            chrome.runtime.sendMessage({ action: 'injectNotebookIframes' });
        } catch (error) {
            // Ignore
        }
    }, 400);
}

function applyNotebookFontToIframes(rootDoc) {
    const doc = rootDoc || document;
    const frames = doc.querySelectorAll('iframe');
    frames.forEach((iframe) => {
        if (!iframe.dataset.aiRtlFontLoadBound) {
            iframe.dataset.aiRtlFontLoadBound = '1';
            iframe.addEventListener('load', () => {
                applyNotebookFontToIframes(document);
                requestNotebookIframeInject();
            });
            requestNotebookIframeInject();
        }
        try {
            const frameDoc = iframe.contentDocument;
            if (!frameDoc) {
                return;
            }
            applyNotebookFontToDocument(frameDoc);
            applyNotebookFontToIframes(frameDoc);
        } catch (error) {
            // Cross-origin frames are injected via allFrames
        }
    });
}

export function setNotebooklm(rtlAlgorithm = 'advanced_full') {
    ensureNotebookFontStyle(document);
    applyNotebookFontToIframes(document);

    if (chrome.runtime?.id) {
        addCopyright(AQ('.omnibar-container').parent() , 'AsBoxB' );
    }

    // Process textarea elements with RTL algorithm
    AQ('body textarea , body input[type="text"], body input[type="search"]').each(function (each) {
        
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }
        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);

        
        

        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
        // Add event listener for real-time direction detection
        AQ(this).on('keyup paste input', function() {
            applyRtlToElement(this, rtlAlgorithm, {
                fontClass: 'FontSet',
                setTextAlign: true
            });
        });
    });

    // Process input elements with RTL algorithm
    AQ('.projects-header , .mat-title-large , .mat-body-medium , [class*="project-button-"] ').each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsRtl'
        });
        
    
    });
    

    AQ('.mat-button-toggle-label-content , .mat-mdc-button , .extendable-label , .create-new-label , .project-table-title , .mat-mdc-cell , .mat-headline-medium  , .mat-label-small ,.mat-label-large ,.title-and-promo , .panel-header-content ,.panel-content-title ').each(function (each) {

        if (!AQ(this).hasClass("FontSet") && !AQ(this).hasClass("mat-icon")) {
                AQ(this).addClass('FontSet');
            }
    
    });
    AQ('.panel-header-content .mat-title-small ,.footer , .selected-num ,.notebook-title ,.dropzone__description ,.loading-message').each(function (each) {

        if (!AQ(this).hasClass("FontSet") && !AQ(this).hasClass("mat-icon")) {
            AQ(this).addClass('FontSet');
        }

    });
  

     AQ('[class*="note-header"] , [class*="mindmap"] , .source-title-column ,.mat-mdc-tooltip-trigger , .card-text').each(function (each) {

        
        if (!AQ(this).hasClass("FontSet") && !AQ(this).hasClass("mat-icon")) {
            AQ(this).addClass('FontSet');
        }

    });

  

    AQ('.node-name').each(function (each) {


        if (!AQ(this).hasClass("FontSetNodeName")) {
            AQ(this).addClass('FontSetNodeName FontSet' );
        }

    });



    
    AQ('[class*="mat-"]:not([class*="mat-icon"]):not([class*="mat-fab"]):not([class*="mat-mini-fab"]):not([class*="mat-raised-button"]):not([class*="mat-flat-button"]):not([class*="mat-stroked-button"])').each(function (each) {



        if (!AQ(this).hasClass("AsOkFontSet")) {
            AQ(this).addClass('AsOkFontSet');
            const text = AQ(this).val() || AQ(this).text();
            const direction = detectDirectionByAlgorithm(text, rtlAlgorithm);

            if (direction === 'rtl') {
                AQ(this).addClass('FontSet');
            }
          
        }

    });

    
    AQ('.message-text-content , .summary-content , .note-editor , .artifact-content , .elements-container').each(function (each) {

        AQ(this).addClass('AsOkNotebooklm');
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
    });

    AQ('app-flashcard, app-root').each(function () {
        const $el = AQ(this);
        $el.addClass('FontSet AsOkNotebooklm');
        applyRtlToContainer(this, rtlAlgorithm, {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: true,
            setTextAlign: true
        });
        if (this.shadowRoot) {
            injectFontStyleIntoRoot(this.shadowRoot);
            this.shadowRoot.querySelectorAll('*').forEach((node) => {
                if (node.classList && !node.classList.contains('mat-icon')) {
                    node.classList.add('FontSet');
                }
            });
        }
    });




 
    // Process notebook content elements using RTL algorithm
    // AQ('.notebook-content, .notebook-text, .document-content, .source-content, .summary-content, .generated-content').each(function (each) {
    //     applyRtlToContainer(this, rtlAlgorithm, {
    //         fontClass: 'FontSet',
    //         processedClass: 'AsOk',
    //         isContainer: true,
    //         setTextAlign: true
    //     });
    // });
}

// Main activation function for NotebookLM
export function activateNotebooklm(rtlAlgorithm = 'advanced_full') {
    if (window.__aiRtlNotebooklmActive) {
        setNotebooklm(rtlAlgorithm);
        return;
    }
    window.__aiRtlNotebooklmActive = true;

    console.log('NotebookLM RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setNotebooklm(rtlAlgorithm);
    
    // SetInterval for continuous processing
    window.__aiRtlNotebooklmInterval = setInterval(() => {
        setNotebooklm(rtlAlgorithm);
    }, 500);
}
