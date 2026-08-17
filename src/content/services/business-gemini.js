// business-gemini.js service functions
import { addCopyright } from '../utils/copyright.js';
import { detectTextDirection, isRTL, analyzeTextDirectionFirstWord } from '../utils/analyzeDirection.js';
import { processTextElementsAdvanced, setTextDirectionAndFont, processTextElementsByRtlAlgorithm, setTextDirectionAndFontByRtlAlgorithm } from '../utils/textDirectionUtils.js';

// Global WeakSet to track styled shadow roots across all function calls
const styledShadowRoots = new WeakSet();

// Helper function to recursively find and process elements in Shadow Root
async function findAndProcessDisclaimerInShadowRoots(rtlAlgorithm = 'advanced_full') {
    const processedShadowRoots = new WeakSet();
    
    // Recursive function to process shadow roots
    async function processShadowRoot(shadowRoot, depth = 0) {
        if (!shadowRoot || processedShadowRoots.has(shadowRoot)) {
            return;
        }
        
        processedShadowRoots.add(shadowRoot);
        
        try {
            // Add copyright styles to shadow root if not already added
            if (!styledShadowRoots.has(shadowRoot)) {
                // Check if style tag already exists
                const existingStyle = shadowRoot.querySelector('style[data-rtl-business-gemini]');
                if (!existingStyle) {
                    styledShadowRoots.add(shadowRoot);
                    const styleElement = document.createElement('style');
                    styleElement.setAttribute('data-rtl-business-gemini', 'true');
                    styleElement.textContent = `
                    .AsBox {
                        text-align: center;
                        margin-top: 7px;
                        margin-bottom: 0px;
                    }
                    .AsBox img {
                        display: initial;
                        margin-right: 3px;
                        margin-top: -3px;
                        margin-left: 6px;
                        height: 22px;
                        width: 22px;
                        border-radius: 0;
                        border: none;
                    }
                    .AsBoxB {
                        margin: auto;
                        color: #888888;
                        transform: scale(0.8);
                    }
                    .AsBoxB a {
                        vertical-align: -webkit-baseline-middle;
                    }
                    .AsBoxGemini {
                        color: #888888;
                    }
                    .AsBoxGemini a {
                        vertical-align: -webkit-baseline-middle;
                    }
                    .AsBoxBusinessGemini {
                        color: #888888;
                    }
                    .AsBoxBusinessGemini a {
                        vertical-align: -webkit-baseline-middle;
                    }
                    .AsRtl {
                        direction: rtl !important;
                    }
                    .FontSet {
                        font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
                    }
                    .disclaimer {
                        font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
                    }
                    .conversation-title {
                        font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
                    }
                    .greeting {
                        font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
                    }
                    .greeting-subtitle {
                        font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
                    }
                    .AsSBtn {
                        border: 1px solid;
                        padding: 0px 9px;
                        margin-right: 6px;
                    }
                    .AsSBtn:hover {
                        background: rgb(212 212 212);
                    }
                    .dark .AsSBtn:hover {
                        background: rgb(116 116 116);
                    }
                    .AsDonate {
                        display: inline;
                        cursor: pointer;
                    }
                    a.AsSBtn.AsDonate {
                        color: inherit;
                        font-family: 'iranyekan';
                        vertical-align: middle;
                    }
                `;
                    // Insert style tag at the beginning of shadow root
                    if (shadowRoot.firstChild) {
                        shadowRoot.insertBefore(styleElement, shadowRoot.firstChild);
                    } else {
                        shadowRoot.appendChild(styleElement);
                    }
                }
            }
            
            // Process .markdown-document elements in shadow root
            const markdownDocuments = shadowRoot.querySelectorAll('.markdown-document');
            markdownDocuments.forEach(markdownDoc => {
                if (!markdownDoc.hasAttribute('data-rtl-processed')) {
                    markdownDoc.setAttribute('data-rtl-processed', 'true');
                    processTextElementsByRtlAlgorithm(markdownDoc, rtlAlgorithm, {
                        fontClass: 'FontSet',
                        processedClass: 'AsOk',
                        isContainer: true,
                        setTextAlign: true
                    });
                    console.log('[BusinessGemini] Processed .markdown-document in shadow root');
                }
            });
            
            // Process .ProseMirror elements in shadow root
            const proseMirrorElements = shadowRoot.querySelectorAll('.ProseMirror');
            proseMirrorElements.forEach(proseMirror => {
                if (!proseMirror.hasAttribute('data-rtl-listener-added')) {
                    proseMirror.setAttribute('data-rtl-listener-added', 'true');
                    setTextDirectionAndFontByRtlAlgorithm(proseMirror, rtlAlgorithm, {
                        fontClass: 'FontSet',
                        processedClass: 'AsOk'
                    });
                    
                    // Add event listener for real-time text direction detection
                    proseMirror.addEventListener('input', function() {
                        requestAnimationFrame(() => {
                            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                                fontClass: 'FontSet'
                            });
                        });
                    });
                    proseMirror.addEventListener('keyup', function() {
                        requestAnimationFrame(() => {
                            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                                fontClass: 'FontSet'
                            });
                        });
                    });
                    proseMirror.addEventListener('paste', function() {
                        requestAnimationFrame(() => {
                            setTextDirectionAndFontByRtlAlgorithm(this, rtlAlgorithm, {
                                fontClass: 'FontSet'
                            });
                        });
                    });
                    console.log('[BusinessGemini] Processed .ProseMirror in shadow root');
                }
            });
            
            // Process .conversation-title elements in shadow root
            const conversationTitles = shadowRoot.querySelectorAll('.conversation-title');
            conversationTitles.forEach(title => {
                if (!title.classList.contains('FontSet')) {
                    title.classList.add('FontSet');
                    console.log('[BusinessGemini] Added FontSet to .conversation-title in shadow root');
                }
            });
            
            // Process .greeting elements in shadow root
            const greetingElements = shadowRoot.querySelectorAll('.greeting');
            greetingElements.forEach(greeting => {
                if (!greeting.classList.contains('FontSet')) {
                    greeting.classList.add('FontSet');
                    console.log('[BusinessGemini] Added FontSet to .greeting in shadow root');
                }
            });
            
            // Process .greeting-subtitle elements in shadow root
            const greetingSubtitles = shadowRoot.querySelectorAll('.greeting-subtitle');
            greetingSubtitles.forEach(subtitle => {
                if (!subtitle.classList.contains('FontSet')) {
                    subtitle.classList.add('FontSet');
                    console.log('[BusinessGemini] Added FontSet to .greeting-subtitle in shadow root');
                }
            });
            
            // Look for .disclaimer element in current shadow root
            const disclaimerElement = shadowRoot.querySelector('.disclaimer');
            if (disclaimerElement) {
                console.log(`[BusinessGemini] Found .disclaimer at shadow root depth ${depth}`);
                // Add FontSet class to disclaimer
                if (!disclaimerElement.classList.contains('FontSet')) {
                    disclaimerElement.classList.add('FontSet');
                }
                // Add copyright to disclaimer element
                if (!disclaimerElement.hasAttribute('data-rtl-copyright-added')) {
                    disclaimerElement.setAttribute('data-rtl-copyright-added', 'true');
                    // Convert to AQ element and add copyright
                    const $disclaimerElement = AQ(disclaimerElement);
                    if ($disclaimerElement && $disclaimerElement.length > 0) {
                        await addCopyright($disclaimerElement, 'AsBoxBusinessGemini AsBoxB', ' margin-top: 0px; margin-bottom: 4px; font-size: 13px;');
                        console.log('[BusinessGemini] Added copyright to .disclaimer');
                    }
                }
            }
            
            // Look for all elements inside this shadow root
            const allElements = shadowRoot.querySelectorAll('*');
            for (const element of allElements) {
                // Check if this element has its own shadow root (nested shadow root)
                if (element.shadowRoot) {
                    await processShadowRoot(element.shadowRoot, depth + 1);
                }
            }
        } catch (error) {
            // Some shadow roots might be closed or inaccessible
            console.warn('[BusinessGemini] Cannot access shadow root:', error);
        }
    }
    
    // Process all existing shadow roots
    for (const element of document.querySelectorAll('*')) {
        if (element.shadowRoot) {
            await processShadowRoot(element.shadowRoot, 0);
        }
    }
    
    // Hook into attachShadow to catch newly created shadow roots
    if (!window.__businessGeminiShadowHook) {
        window.__businessGeminiShadowHook = true;
        const originalAttachShadow = Element.prototype.attachShadow;
        
        Element.prototype.attachShadow = function(opts) {
            const shadowRoot = originalAttachShadow.call(this, opts);
            
            // Process the newly created shadow root after a short delay
            setTimeout(async () => {
                await processShadowRoot(shadowRoot, 0);
            }, 100);
            
            return shadowRoot;
        };
    }
}

export async function setBusinessGemini(rtlAlgorithm = 'advanced_full') {
    // Find and process .disclaimer elements in all shadow roots
    await findAndProcessDisclaimerInShadowRoots(rtlAlgorithm);

}

// Main activation function for Business Gemini
export function activateBusinessGemini(rtlAlgorithm = 'advanced_full') {
    console.log("activateBusinessGemini with RTL algorithm:", rtlAlgorithm);
    // Initial setup
    setBusinessGemini(rtlAlgorithm);
  

   
    setInterval(() => {
        setBusinessGemini(rtlAlgorithm);
    }, 1000);
}

