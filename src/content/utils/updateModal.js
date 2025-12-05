// Update modal for showing changelog
const UPDATE_MODAL_STORAGE_KEY = 'updateModalClosedVersion';

// Latest version changes data
const latestChanges = [
    { id: "1", text: "افزودن Business Gemini", icon: "Gemini.png", type: "add" },
    { id: "2", text: "افزودن synapse", icon: "synaps.png", type: "add" },
    { id: "3", text: "افزودن notion", icon: "notion.png", type: "add" },
    { id: "4", text: "اپدیت perplexity", icon: "White on Turquiose.png", type: "update" },
    { id: "5", text: "اپدیت google ai studio", icon: "aistudio.png", type: "update" },
];

let isModalShowing = false;

export function showUpdateModal() {
    // Check if modal already exists or is showing
    if (document.getElementById('AsUpdateModal') || isModalShowing) {
        return;
    }

    // Wait for AQ to be available
    if (typeof window.AQ === 'undefined') {
        setTimeout(showUpdateModal, 100);
        return;
    }

    // Get current extension version
    const currentVersion = chrome.runtime.getManifest().version;

    // Check if user already closed modal for this version
    chrome.storage.local.get([UPDATE_MODAL_STORAGE_KEY], function(result) {
        const closedVersion = result[UPDATE_MODAL_STORAGE_KEY];

        // If user already closed modal for this version, don't show it
        if (closedVersion === currentVersion) {
            return;
        }

        // Mark as showing
        isModalShowing = true;

        // Create modal HTML
        const modalHTML = createUpdateModalHTML();
        
        // Append to body
        AQ('body').append(modalHTML);

        // Setup event listeners
        setupUpdateModalListeners(currentVersion);
    });
}

function createUpdateModalHTML() {
    const manifest = chrome.runtime.getManifest();
    const extensionName = chrome.i18n.getMessage('extension_name') || manifest.name;
    const iconUrl = chrome.runtime.getURL('images/icon-128.png');
    const currentVersion = manifest.version;

    return `
        <div class="As-modal-backdrop FontSet" id="AsUpdateModal" style="
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.75) 100%);
            backdrop-filter: blur(8px);
            z-index: 999999;
            align-items: center;
            justify-content: center;
            font-family: iranyekan, sans-serif;
            animation: fadeIn 0.3s ease;
        ">
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                #AsUpdateModal .As-modal {
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                #AsUpdateModal .As-close-btn:hover {
                    background: linear-gradient(135deg, #00e9ff 0%, #0099cc 100%) !important;
                    color: #1a1a2e !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 233, 255, 0.3);
                }
                #AsUpdateModal .As-close-btn:active {
                    transform: translateY(0);
                }
            </style>
            <div class="As-modal" style="
                background: linear-gradient(135deg, #2f2f41 0%, #1a1a2e 100%);
                border: 2px solid rgba(0, 233, 255, 0.5);
                border-radius: 20px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 233, 255, 0.2), 0 0 40px rgba(0, 233, 255, 0.1), inset 0 0 30px rgba(0, 233, 255, 0.03);
                overflow: hidden;
                direction: rtl;
            ">
                <!-- Content -->
                <div style="padding: 35px 25px; direction: rtl;">
                    <!-- Logo and Extension Info -->
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 14px;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid rgba(0, 234, 255, 0.2);
                        direction: rtl;
                        flex-direction: row-reverse;
                    ">
                        <img src="${iconUrl}" alt="${extensionName}" style="
                            width: 52px;
                            height: 52px;
                            border-radius: 10px;
                            box-shadow: 0 2px 8px rgba(0, 233, 255, 0.15);
                            flex-shrink: 0;
                            border: 1px solid rgba(0, 233, 255, 0.2);
                        ">
                        <div style="
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                            justify-content: center;
                            gap: 6px;
                        ">
                            <h2 style="
                                margin: 0;
                                color: #ffffff;
                                font-size: 17px;
                                font-weight: 700;
                                line-height: 1.3;
                                text-shadow: 0 1px 5px rgba(0, 233, 255, 0.2);
                            ">
                                ChatGPT RTL (Persian/Farsi)
                            </h2>
                            <div style="
                                display: inline-block;
                                background: linear-gradient(135deg, rgba(0, 233, 255, 0.2) 0%, rgba(0, 153, 204, 0.15) 100%);
                                color: #00e9ff;
                                border: 1px solid rgba(0, 233, 255, 0.4);
                                padding: 4px 10px;
                                border-radius: 6px;
                                font-size: 11px;
                                font-weight: 600;
                                box-shadow: 0 1px 4px rgba(0, 233, 255, 0.1);
                            ">
                                نسخه ${currentVersion}
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 24px 0;
                            color: #00e9ff;
                            font-size: 22px;
                            font-weight: 700;
                            text-align: center;
                            text-shadow: 0 1px 8px rgba(0, 233, 255, 0.3);
                        ">
                            افزونه با موفقیت به‌روزرسانی شد
                        </h3>
                        
                        <!-- Changes List - Attractive Design -->
                        <div style="margin-bottom: 20px; direction: rtl;">
                            <div style="
                                color: #00e9ff;
                                font-size: 16px;
                                font-weight: 700;
                                margin-bottom: 18px;
                                text-align: center;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 10px;
                            ">
                         
                                تغییرات نسخه جدید
                            </div>
                            
                            <div style="
                                display: flex;
                                flex-direction: column;
                                gap: 0;
                                background: rgba(0, 233, 255, 0.04);
                                border-radius: 10px;
                                padding: 16px;
                                border: 1px solid rgba(0, 233, 255, 0.15);
                                border-right: none;
                            ">
                                ${latestChanges.map((change, index) => `
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        gap: 12px;
                                        padding: 14px 16px;
                                        background: ${index % 2 === 0 ? 'rgba(0, 233, 255, 0.03)' : 'transparent'};
                                        border-radius: 8px;
                                        transition: all 0.2s ease;
                                        position: relative;
                                        direction: rtl;
                                    ">
                                        <img src="${chrome.runtime.getURL('images/' + change.icon)}" alt="${change.text}" style="
                                            width: 32px;
                                            height: 32px;
                                            min-width: 32px;
                                            border-radius: 8px;
                                            flex-shrink: 0;
                                            object-fit: contain;
                                            background: rgba(255, 255, 255, 0.05);
                                            padding: 4px;
                                        " onerror="this.style.display='none'">
                                        <div style="
                                            color: rgba(255, 255, 255, 0.95);
                                            font-size: 14px;
                                            line-height: 1.7;
                                            flex: 1;
                                            font-weight: 500;
                                            text-align: right;
                                        ">
                                            ${change.text}
                                        </div>
                                        <div style="
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            flex-shrink: 0;
                                            font-size: 24px;
                                            font-weight: 700;
                                            color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};
                                            line-height: 1;
                                            width: 32px;
                                            height: 32px;
                                        ">
                                            ${change.type === 'add' ? '+' : '↻'}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <button class="As-close-btn" id="AsUpdateCloseBtn" style="
                        background: linear-gradient(135deg, rgba(0, 233, 255, 0.15) 0%, rgba(0, 153, 204, 0.1) 100%);
                        color: #ffffff;
                        border: 2px solid rgba(0, 233, 255, 0.4);
                        padding: 14px 28px;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 700;
                        width: 100%;
                        font-family: iranyekan, sans-serif;
                        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                        box-shadow: 0 2px 8px rgba(0, 233, 255, 0.2);
                        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                    ">بستن</button>
                </div>
            </div>
        </div>
    `;
}

function setupUpdateModalListeners(latestVersion) {
    const modal = document.getElementById('AsUpdateModal');
    const closeBtn = document.getElementById('AsUpdateCloseBtn');

    if (!modal || !closeBtn) {
        return;
    }

    // Close button click - only way to close the modal
    closeBtn.addEventListener('click', function() {
        // Save closed version to storage
        chrome.storage.local.set({ [UPDATE_MODAL_STORAGE_KEY]: latestVersion }, function() {
            // Hide modal in this tab
            if (modal) {
                isModalShowing = false;
                modal.style.display = 'none';
                // Remove modal after animation
                setTimeout(() => {
                    if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
            
            // Send message to background script to close modal in all tabs
            chrome.runtime.sendMessage({ action: 'closeUpdateModalInAllTabs' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('[UpdateModal] Error sending close message:', chrome.runtime.lastError);
                }
            });
        });
    });
}

