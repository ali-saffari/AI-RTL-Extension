import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from '../../constants/updateModalConfig.js';
import { versionChanges, previousChanges } from '../../constants/versionChanges.js';

let isModalShowing = false;

function renderChangeItems(changes) {
    return changes.map((change) => `
        <div class="As-change-item">
            <img class="As-change-icon-img" src="${chrome.runtime.getURL('images/' + change.icon)}" alt="${change.text}" onerror="this.style.display='none'">
            <div class="As-change-text">
                ${change.text}
            </div>
            <div class="As-change-type" style="color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};">
                ${change.type === 'add' ? '+' : '↻'}
            </div>
        </div>
    `).join('');
}

function renderPreviousChanges(changes) {
    return changes.map((versionData, index) => `
        <div class="As-prev-version">
            <div class="As-prev-version-title">${versionData.version}</div>
            <div class="As-prev-version-list">
                ${versionData.changes.map((change) => `
                    <div class="As-prev-change-item">✓ ${change.text}</div>
                `).join('')}
            </div>
            ${index < changes.length - 1 ? '<div class="As-prev-divider"></div>' : ''}
        </div>
    `).join('');
}



export function showUpdateModal() {
    if (!UPDATE_MODAL_ENABLED || !UPDATE_MODAL_ID) {
        return;
    }

    // Check if modal already exists or is showing
    if (document.getElementById('AsUpdateModal') || isModalShowing) {
        return;
    }

    // Wait for AQ to be available
    if (typeof window.AQ === 'undefined') {
        setTimeout(showUpdateModal, 100);
        return;
    }

    // Check if user already closed modal for this ID
    chrome.storage.local.get([UPDATE_MODAL_STORAGE_KEY], function(result) {
        const closedId = result[UPDATE_MODAL_STORAGE_KEY];

        if (closedId === UPDATE_MODAL_ID) {
            return;
        }

        // Mark as showing
        isModalShowing = true;

        // Create modal HTML
        const modalHTML = createUpdateModalHTML();
        
        // Append to body
        AQ('body').append(modalHTML);

        // Setup event listeners
        setupUpdateModalListeners(UPDATE_MODAL_ID);
    });
}

function setupCapsuleAnimation(capsuleId, toggleId, panelId) {
    const capsule = document.getElementById(capsuleId);
    const toggle = document.getElementById(toggleId);
    const panel = document.getElementById(panelId);

    if (!capsule || !toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', function() {
        const isOpen = capsule.classList.contains('is-open');

        if (isOpen) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
            panel.offsetHeight;
            capsule.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            panel.style.maxHeight = '0px';
            panel.style.opacity = '0';
            return;
        }

        capsule.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';

        const onTransitionEnd = function(event) {
            if (event.propertyName !== 'max-height' || !capsule.classList.contains('is-open')) {
                return;
            }
            panel.style.maxHeight = 'none';
            panel.removeEventListener('transitionend', onTransitionEnd);
        };

        panel.addEventListener('transitionend', onTransitionEnd);
    });
}

function setupStoryCapsuleAnimation() {
    setupCapsuleAnimation('AsStoryCapsule', 'AsStoryToggle', 'AsStoryPanel');
    setupCapsuleAnimation('AsPrevChangesCapsule', 'AsPrevChangesToggle', 'AsPrevChangesPanel');
}


function createUpdateModalHTML() {
    const manifest = chrome.runtime.getManifest();
    const extensionName = chrome.i18n.getMessage('extension_name') || manifest.name;
    const iconUrl = chrome.runtime.getURL('images/icon-128.png');
    const currentVersion = manifest.version;

    // متن استاتیک اصلی که کاملاً از لیست جدا شده است
    const staticAnnouncementHTML = `
        <div class="As-story-capsule" id="AsStoryCapsule">
            <button class="As-story-summary" id="AsStoryToggle" type="button" aria-expanded="false">
                <span class="As-story-summary-text">چرا اسم اکستشن تغییر کرده؟</span>
                <span class="As-story-arrow" aria-hidden="true">▼</span>
            </button>
            <div class="As-story-panel" id="AsStoryPanel">
                <div class="As-special-announcement As-story-content">
                    ما برگشتیم، اما با یک نام و نشان جدید! 🚀<br><br>
                    اگر متوجه غیبت کوتاه‌مدت ما شده بودید، دلیلش شکایت شرکت OpenAI روی نام ChatGPT بود. این موضوع ما را مجبور کرد تا نام و لوگوی افزونه را تغییر دهیم.<br><br>
                    راستش را بخواهید، این افزونه در ابتدا فقط برای راحتی کار با ChatGPT طراحی شده بود؛ اما به مرور زمان و به درخواست شما عزیزان، پشتیبانی از سایت‌های هوش مصنوعی دیگر را هم به آن اضافه کردیم. متأسفانه فراموش کرده بودیم اسم افزونه را به‌روزرسانی کنیم و فکرش را هم نمی‌کردیم با چنین مشکلی روبه‌رو شویم!<br><br>
                    خلاصه اینکه ما پرقدرت‌تر از قبل برگشتیم. لطفاً نام و لوگوی جدید ما را به خاطر بسپارید تا گممان نکنید: <strong>AI RTL (Persian/Farsi)</strong><br><br>
                    📢 برای باخبر شدن از آخرین اخبار، به‌روزرسانی‌ها و اتفاقات بعدی، حتماً کانال تلگرام ما را دنبال کنید:<br>
                    🔗 <a href="https://t.me/AI_RTL_ir" target="_blank">t.me/AI_RTL_ir</a>
                </div>
            </div>
        </div>
    `;

    // باکس بازشو برای تغییرات نسخه‌های قبلی
    const previousChangesHTML = `
        <div class="As-story-capsule" id="AsPrevChangesCapsule">
            <button class="As-story-summary" id="AsPrevChangesToggle" type="button" aria-expanded="false">
                <span class="As-story-summary-text">تغییرات قبلی</span>
                <span class="As-story-arrow" aria-hidden="true">▼</span>
            </button>
            <div class="As-story-panel" id="AsPrevChangesPanel">
                <div class="As-prev-changes As-story-content">
                    ${renderPreviousChanges(previousChanges)}
                </div>
            </div>
        </div>
    `;

    return `
        <div class="As-modal-backdrop FontSet" id="AsUpdateModal">
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                #AsUpdateModal {
                    display: flex;
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.75) 100%);
                    backdrop-filter: blur(8px);
                    z-index: 999999;
                    align-items: center;
                    justify-content: center;
                    font-family: iranyekan, sans-serif;
                    animation: fadeIn 0.3s ease;
                }
                #AsUpdateModal .As-modal {
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    max-height: 90vh;
                    width: min(550px, 95vw);
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(135deg, #2f2f41 0%, #1a1a2e 100%);
                    border: 2px solid rgba(0, 233, 255, 0.5);
                    border-radius: 20px;
                    padding: 0;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0, 233, 255, 0.2), 0 0 40px rgba(0, 233, 255, 0.1), inset 0 0 30px rgba(0, 233, 255, 0.03);
                    overflow: hidden;
                    direction: rtl;
                }
                #AsUpdateModal .As-content {
                    padding: 35px 25px;
                    direction: rtl;
                    flex: 1 1 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    min-height: 0;
                    overflow: hidden;
                }
                #AsUpdateModal .As-footer {
                    padding: 15px 25px 25px 25px;
                    position: sticky;
                    bottom: 0;
                    background: transparent;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #AsUpdateModal .As-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    margin-bottom: 25px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(0, 234, 255, 0.2);
                    direction: rtl;
                    flex-direction: row-reverse;
                }
                #AsUpdateModal .As-logo {
                    width: 52px;
                    height: 52px;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0, 233, 255, 0.15);
                    flex-shrink: 0;
                    border: 1px solid rgba(0, 233, 255, 0.2);
                }
                #AsUpdateModal .As-ext-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    gap: 6px;
                }
                #AsUpdateModal .As-ext-name {
                    margin: 0;
                    color: #ffffff;
                    font-size: 17px;
                    font-weight: 700;
                    line-height: 1.3;
                    text-shadow: 0 1px 5px rgba(0, 233, 255, 0.2);
                }
                #AsUpdateModal .As-version {
                    display: inline-block;
                    background: linear-gradient(135deg, rgba(0, 233, 255, 0.2) 0%, rgba(0, 153, 204, 0.15) 100%);
                    color: #00e9ff;
                    border: 1px solid rgba(0, 233, 255, 0.4);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    box-shadow: 0 1px 4px rgba(0, 233, 255, 0.1);
                }
                #AsUpdateModal .As-section {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    padding-right: 12px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 233, 255, 0.7) rgba(255, 255, 255, 0.05);
                }
                #AsUpdateModal .As-section::-webkit-scrollbar {
                    width: 10px;
                }
                #AsUpdateModal .As-section::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                #AsUpdateModal .As-section::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #00e9ff 0%, #0099cc 100%);
                    border-radius: 10px;
                    border: 2px solid rgba(255, 255, 255, 0.08);
                }
                #AsUpdateModal .As-title {
                    margin: 0 0 12px 0;
                    color: #00e9ff;
                    font-size: 19px;
                    font-weight: 700;
                    text-align: center;
                    text-shadow: 0 1px 8px rgba(0, 233, 255, 0.3);
                }
                #AsUpdateModal .As-sites-note {
                    margin: 0 0 20px 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 11px 13px;
                    direction: rtl;
                    text-align: right;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 120, 120, 0.28);
                    border-radius: 12px;
                }
                #AsUpdateModal .As-sites-note-icon {
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 120, 120, 0.12);
                    border: 1px solid rgba(255, 120, 120, 0.3);
                    color: rgba(255, 150, 150, 0.9);
                    font-size: 13px;
                    font-weight: 800;
                    line-height: 1;
                    margin-top: 1px;
                }
                #AsUpdateModal .As-sites-note-text {
                    margin: 0;
                    flex: 1;
                    min-width: 0;
                    color: rgba(255, 190, 190, 0.85);
                    font-size: 12.5px;
                    font-weight: 600;
                    line-height: 1.75;
                }
                #AsUpdateModal .As-sites-note-text strong {
                    color: rgba(255, 160, 160, 0.95);
                    font-weight: 800;
                }
                #AsUpdateModal .As-changes {
                    margin-top: 20px;
                    margin-bottom: 15px;
                    direction: rtl;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                #AsUpdateModal .As-changes-title {
                    color: rgba(0, 233, 255, 0.8);
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #AsUpdateModal .As-version-changes {
                    margin-top: 0;
                }
                #AsUpdateModal .As-change-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                #AsUpdateModal .As-story-capsule {
                    background: linear-gradient(135deg, rgba(0, 233, 255, 0.06) 0%, rgba(0, 153, 204, 0.02) 100%);
                    border: 1px dashed rgba(0, 233, 255, 0.35);
                    border-radius: 16px;
                    margin-top: 20px;
                    margin-bottom: 5px;
                    overflow: hidden;
                    transition: border-color 0.35s ease, box-shadow 0.35s ease;
                    box-shadow: inset 0 0 15px rgba(0, 233, 255, 0.03);
                }
                #AsUpdateModal .As-story-capsule.is-open {
                    border-color: rgba(0, 233, 255, 0.5);
                    box-shadow: 0 4px 16px rgba(0, 233, 255, 0.08), inset 0 0 15px rgba(0, 233, 255, 0.03);
                }
                #AsUpdateModal .As-story-summary {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                    padding: 14px 18px;
                    cursor: pointer;
                    border: none;
                    background: transparent;
                    color: #00e9ff;
                    font-size: 13px;
                    font-weight: 700;
                    user-select: none;
                    direction: rtl;
                    font-family: iranyekan, sans-serif;
                    text-align: right;
                }
                #AsUpdateModal .As-story-summary-text {
                    flex: 1;
                    text-align: right;
                    line-height: 1.6;
                }
                #AsUpdateModal .As-story-arrow {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    font-size: 11px;
                    color: #00e9ff;
                    transition: transform 0.35s ease;
                    flex-shrink: 0;
                }
                #AsUpdateModal .As-story-capsule.is-open .As-story-arrow {
                    transform: rotate(180deg);
                }
                #AsUpdateModal .As-story-panel {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                    transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
                    will-change: max-height, opacity;
                }
                #AsUpdateModal .As-story-content {
                    border: none;
                    border-top: 1px dashed rgba(0, 233, 255, 0.2);
                    border-radius: 0;
                    margin: 0;
                    box-shadow: none;
                }

                #AsUpdateModal .As-prev-changes {
                    padding: 12px 16px 16px;
                    max-height: 220px;
                    overflow-y: auto;
                    direction: rtl;
                }
                #AsUpdateModal .As-prev-version {
                    margin-bottom: 4px;
                }
                #AsUpdateModal .As-prev-version-title {
                    color: #00e9ff;
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                #AsUpdateModal .As-prev-version-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding-right: 8px;
                }
                #AsUpdateModal .As-prev-change-item {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 12px;
                    line-height: 1.6;
                }
                #AsUpdateModal .As-prev-divider {
                    height: 1px;
                    margin: 12px 0;
                    background: rgba(0, 233, 255, 0.15);
                }

                /* استایل باکس استاتیک اطلاعیه اصلی */
                #AsUpdateModal .As-special-announcement {
                    background: linear-gradient(135deg, rgba(0, 233, 255, 0.06) 0%, rgba(0, 153, 204, 0.02) 100%);
                    border: 1px dashed rgba(0, 233, 255, 0.35);
                    border-radius: 12px;
                    padding: 20px;
                    color: rgba(255, 255, 255, 0.95);
                    font-size: 14px;
                    line-height: 1.8;
                    text-align: justify;
                    box-shadow: inset 0 0 15px rgba(0, 233, 255, 0.03);
                    margin-bottom: 5px;
                }
                #AsUpdateModal .As-special-announcement a {
                    color: #00e9ff !important;
                    text-decoration: none;
                    font-weight: bold;
                    border-bottom: 1px dotted #00e9ff;
                    transition: color 0.2s ease;
                }
                #AsUpdateModal .As-special-announcement a:hover {
                    color: #fff !important;
                    border-bottom-style: solid;
                }

                /* استایل لیست تغییرات کوچک فرعی */
                #AsUpdateModal .As-change-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 4px;
                    border-radius: 0;
                    direction: rtl;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                #AsUpdateModal .As-change-item:last-child {
                    border-bottom: none;
                }
                #AsUpdateModal .As-change-icon-img {
                    width: 26px;
                    height: 26px;
                    min-width: 26px;
                    border-radius: 6px;
                    flex-shrink: 0;
                    object-fit: contain;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 4px;
                }
                #AsUpdateModal .As-change-text {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 13px;
                    line-height: 1.6;
                    flex: 1;
                    font-weight: 500;
                    text-align: right;
                }
                #AsUpdateModal .As-change-type {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 18px;
                    font-weight: 700;
                    line-height: 1;
                    width: 26px;
                    height: 26px;
                }
                #AsUpdateModal .As-close-btn {
                    background: linear-gradient(135deg, rgba(0, 233, 255, 0.15) 0%, rgba(0, 153, 204, 0.1) 100%);
                    color: #ffffff;
                    border: 2px solid rgba(0, 233, 255, 0.4);
                    padding: 12px 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    width: 100%;
                    font-family: iranyekan, sans-serif;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 2px 8px rgba(0, 233, 255, 0.2);
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
            <div class="As-modal">
                <div class="As-content">
                    <div class="As-header">
                        <img class="As-logo" src="${iconUrl}" alt="${extensionName}">
                        <div class="As-ext-info">
                            <h2 class="As-ext-name">
                                AI RTL (Persian/Farsi)
                            </h2>
                            <div class="As-version">
                                نسخه ${currentVersion}
                            </div>
                        </div>
                    </div>

                    <div class="As-section">
                        <h3 class="As-title">
                            افزونه با موفقیت به‌روزرسانی شد
                        </h3>
                        <div class="As-sites-note">
                            <span class="As-sites-note-icon">!</span>
                            <p class="As-sites-note-text">
                                <strong>توجه:</strong> سایت‌های جدید به‌صورت پیش‌فرض غیرفعال هستند و باید از طریق منوی اکستنشن فعال کنید
                            </p>
                        </div>
                        
                        <div class="As-changes As-version-changes">
                            <div class="As-changes-title">
                                <span>↻</span> تغییرات این نسخه:
                            </div>
                            <div class="As-change-list">
                                ${renderChangeItems(versionChanges)}
                            </div>
                        </div>

                        ${staticAnnouncementHTML}
                        ${previousChangesHTML}
                    </div>

                    <div class="As-footer">
                        <button class="As-close-btn" id="AsUpdateCloseBtn">متوجه شدم</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupUpdateModalListeners(modalId) {
    const modal = document.getElementById('AsUpdateModal');
    const closeBtn = document.getElementById('AsUpdateCloseBtn');

    if (!modal || !closeBtn) {
        return;
    }

    setupStoryCapsuleAnimation();

    closeBtn.addEventListener('click', function() {
        chrome.storage.local.set({ [UPDATE_MODAL_STORAGE_KEY]: modalId }, function() {
            if (modal) {
                isModalShowing = false;
                modal.style.display = 'none';
                setTimeout(() => {
                    if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
            
            chrome.runtime.sendMessage({ action: 'closeUpdateModalInAllTabs' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('[UpdateModal] Error sending close message:', chrome.runtime.lastError);
                }
            });
        });
    });
}
