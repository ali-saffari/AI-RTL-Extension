// aistudio.js service functions
import { 
    analyzeTextDirection
} from '../utils/analyzeDirection.js';
import { 
    processTextElementsAdvanced,
    processTablesInContainer,
    getArticleTextElements,
    getAttributeTextElements
} from '../utils/textDirectionUtils.js';
import { addCopyright } from '../utils/copyright.js';

// Global variable to store the observer
let msTextChunkObserver = null;

// Initial setup that runs only once
export function initializeAiStudio() {
    // Setup MutationObserver for ms-text-chunk changes
    setupMsTextChunkObserver();
}

// Recurring tasks that need to run periodically
export function setAiStudio() {
    // Add copyright to footer sections
    if (chrome.runtime?.id) {
        let fo2 = `section footer`;
        addCopyright($(fo2), 'AsBoxB', 'margin-top: 14px');
    }

    $("ms-chat-turn").each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
        }
    });

    $("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        processTablesInContainer($(this), 'FontSet', 'AsOk'); // Enable tracking for AI Studio
    });


    // ms-text-chunk processing is now handled by MutationObserver
    // processMsTextChunks(); // Removed - handled by MutationObserver

    $("ms-text-chunk textarea").each(function (each) {
        if (!$(this).hasClass("FontSet")) {
            $(this).addClass('FontSet');
            $(this).addClass('FontSetImportant2');
            
            const text = $(this).val() || $(this).text();

            if (text && text.trim()) {
                $(this).attr("dir", analyzeTextDirection(text));
            }

            // Add input event listener for real-time direction detection
            $(this).on('input keyup paste', function() {
                const currentText = $(this).val();
                if (currentText && currentText.trim()) {
                    $(this).attr("dir", analyzeTextDirection(currentText));
                }
            });
        }
    });
}

// Function to process ms-text-chunk elements
function processMsTextChunks() {
    $("ms-text-chunk").each(function (each) {
        // پردازش پیشرفته تمام عناصر متنی
        
     
        processTextElementsAdvanced($(this), {
            fontClass: 'FontSet',
            processedClass: 'AsOk',
            isContainer: false
        }); // Enable tracking for AI Studio
    });
}

// Function to setup MutationObserver for ms-text-chunk changes
function setupMsTextChunkObserver() {
    // Clean up existing observer
    if (msTextChunkObserver) {
        msTextChunkObserver.disconnect();
    }

    // Create new observer
    msTextChunkObserver = new MutationObserver(function(mutations) {
        let shouldProcess = false;
        
        mutations.forEach(function(mutation) {
            // Check if ms-text-chunk elements were added or modified
            if (mutation.type === 'childList') {
                // Check if any added nodes are ms-text-chunk or contain ms-text-chunk
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'MS-TEXT-CHUNK' || 
                            $(node).find('ms-text-chunk').length > 0 ||
                            $(node).is('ms-text-chunk')) {
                            shouldProcess = true;
                        }
                    }
                });
            }
            
            // Check if ms-text-chunk content was modified
            if (mutation.type === 'characterData' || mutation.type === 'attributes') {
                const target = $(mutation.target);
                if (target.is('ms-text-chunk') || target.closest('ms-text-chunk').length > 0) {
                    shouldProcess = true;
                }
            }
        });
        
        // Process ms-text-chunk elements if changes detected
        if (shouldProcess) {
            processMsTextChunks();
        }
    });

    // Start observing
    msTextChunkObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'dir']
    });
}

// Main activation function for Aistudio
export function activateAistudio() {
    // Initialize once
    initializeAiStudio();
    
    // Run initial setup
    setAiStudio();
    
    // Continue running setAiStudio every second for other tasks
    let interval = setInterval(() => {
        setAiStudio();
    }, 1000);
}

// Function to cleanup observer when needed
export function cleanupAistudio() {
    if (msTextChunkObserver) {
        msTextChunkObserver.disconnect();
        msTextChunkObserver = null;
    }
}