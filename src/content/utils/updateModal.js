import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from '../../constants/updateModalConfig.js';

// ابزار نمایش لیست تغییرات نسخه جدید
// آرایه فقط شامل تغییرات خطی و فنی نسخه جدید است
const latestChanges = [
    // { id: "1", text: "افزودن Google AI Mode", icon: "google.png", type: "add" },
    { id: "1", text: "تغییر لوگو و آیکون‌ افزونه", icon: "icon-128.png", type: "fix" },
    { id: "2", text: "به‌روزرسانی سازگاری با ظاهر جدید سایت‌ها", icon: "icon-128.png", type: "fix" },
];

let isModalShowing = false;



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


function createUpdateModalHTML() {
    const manifest = chrome.runtime.getManifest();
    const extensionName = chrome.i18n.getMessage('extension_name') || manifest.name;
    const iconUrl = chrome.runtime.getURL('images/icon-128.png');
    const currentVersion = manifest.version;

    // متن استاتیک اصلی که کاملاً از لیست جدا شده است
    const staticAnnouncementHTML = `
        <div class="As-special-announcement">
            ما برگشتیم، اما با یک نام و نشان جدید! 🚀<br><br>
            اگر متوجه غیبت کوتاه‌مدت ما شده بودید، دلیلش شکایت شرکت OpenAI روی نام ChatGPT بود. این موضوع ما را مجبور کرد تا نام و لوگوی افزونه را تغییر دهیم.<br><br>
            راستش را بخواهید، این افزونه در ابتدا فقط برای راحتی کار با ChatGPT طراحی شده بود؛ اما به مرور زمان و به درخواست شما عزیزان، پشتیبانی از سایت‌های هوش مصنوعی دیگر را هم به آن اضافه کردیم. متأسفانه فراموش کرده بودیم اسم افزونه را به‌روزرسانی کنیم و فکرش را هم نمی‌کردیم با چنین مشکلی روبه‌رو شویم!<br><br>
            خلاصه اینکه ما پرقدرت‌تر از قبل برگشتیم. لطفاً نام و لوگوی جدید ما را به خاطر بسپارید تا گممان نکنید: <strong>AI RTL (Persian/Farsi)</strong><br><br>
            📢 برای باخبر شدن از آخرین اخبار، به‌روزرسانی‌ها و اتفاقات بعدی، حتماً کانال تلگرام ما را دنبال کنید:<br>
            🔗 <a href="https://t.me/AI_RTL_ir" target="_blank">t.me/AI_RTL_ir</a>
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
                    margin: 0 0 20px 0;
                    color: #00e9ff;
                    font-size: 19px;
                    font-weight: 700;
                    text-align: center;
                    text-shadow: 0 1px 8px rgba(0, 233, 255, 0.3);
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
                #AsUpdateModal .As-change-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
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
                    padding: 12px 16px;
                    border-radius: 10px;
                    direction: rtl;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
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
                        
                        ${staticAnnouncementHTML}
                        
                        <div class="As-changes">
                            <div class="As-changes-title">
                                <span>↻</span> سایر تغییرات این نسخه:
                            </div>
                            
                            <div class="As-change-list">
                                ${latestChanges.map((change) => `
                                    <div class="As-change-item">
                                        <img class="As-change-icon-img" src="${chrome.runtime.getURL('images/' + change.icon)}" alt="${change.text}" onerror="this.style.display='none'">
                                        <div class="As-change-text">
                                            ${change.text}
                                        </div>
                                        <div class="As-change-type" style="color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};">
                                            ${change.type === 'add' ? '+' : '↻'}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
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
