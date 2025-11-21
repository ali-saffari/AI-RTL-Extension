// Manual RTL Content Script - Separate from main content script
// This script is injected separately to all sites based on settings

import { initTextSelector } from './index.js';

// Initialize text selector highlighter (works on all sites)
initTextSelector();

// Listen for manual RTL activation event from scripting injection
window.addEventListener('manualRtlActivate', () => {
    console.log('[Manual RTL Content] Manual RTL activation event received');
    // The manual RTL will be activated via storage change listener
    // This event just ensures the content script is aware
});

