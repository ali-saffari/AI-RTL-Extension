import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from '../../constants/updateModalConfig.js';
import { versionChanges, previousChanges, splitVersionChanges, getSiteShortName } from '../../constants/versionChanges.js';
import { sendRuntimeMessage } from '../../utils/chromeMessaging.js';

let isModalShowing = false;

function renderFeatureItems(changes) {
    return changes.map((change) => `
        <div class="As-change-item">
            <div class="As-change-type" style="color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};">
                ${change.type === 'add' ? '+' : '↻'}
            </div>
            <div class="As-change-text">
                ${change.text}${change.note ? `<span class="As-change-note"> ${change.note}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function renderSiteChips(changes) {
    return changes.map((change) => `
        <div class="As-site-chip" title="${change.text}">
            <span class="As-site-chip-badge" style="color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};">
                ${change.type === 'add' ? '+' : '↻'}
            </span>
            <img class="As-site-chip-img" src="${chrome.runtime.getURL('images/' + change.icon)}" alt="${getSiteShortName(change)}" onerror="this.style.display='none'">
            <span class="As-site-chip-name">${getSiteShortName(change)}</span>
        </div>
    `).join('');
}

function renderChangeItems(changes) {
    const { menuChanges, features, updatedSites, addedSites } = splitVersionChanges(changes);

    return `
        ${menuChanges.length ? `
            <div class="As-change-group">
                <div class="As-change-group-title">تغییرات منوی افزونه</div>
                <div class="As-change-list">
                    ${renderFeatureItems(menuChanges)}
                </div>
            </div>
        ` : ''}
        ${features.length ? `
            <div class="As-change-group">
                <div class="As-change-group-title">قابلیت‌های جدید برای همه سایت‌ها</div>
                <div class="As-change-list">
                    ${renderFeatureItems(features)}
                </div>
            </div>
        ` : ''}
        ${updatedSites.length || addedSites.length ? `
            <div class="As-change-group">
                ${updatedSites.length ? `
                    <div class="As-site-subgroup">
                        <div class="As-change-group-title">
                            سایت‌های آپدیت‌شده
                            <span class="As-change-group-count">${updatedSites.length}</span>
                        </div>
                        <div class="As-site-grid">
                            ${renderSiteChips(updatedSites)}
                        </div>
                    </div>
                ` : ''}
                ${addedSites.length ? `
                    <div class="As-site-subgroup">
                        <div class="As-change-group-title">
                            سایت‌های اضافه‌شده
                            <span class="As-change-group-count">${addedSites.length} جدید</span>
                        </div>
                        <div class="As-sites-note">
                            <span class="As-sites-note-icon">!</span>
                            <p class="As-sites-note-text">
                                <strong>توجه:</strong> سایت‌های جدید به‌صورت پیش‌فرض غیرفعال هستند و باید از طریق منوی اکستنشن فعال کنید
                            </p>
                        </div>
                        <div class="As-site-grid">
                            ${renderSiteChips(addedSites)}
                        </div>
                    </div>
                ` : ''}
            </div>
        ` : ''}
    `;
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



function appendModalToBody(modalHTML) {
    if (typeof window.AQ === 'function') {
        window.AQ('body').append(modalHTML);
        return;
    }

    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function mountUpdateModal(persistClose) {
    if (document.getElementById('AsUpdateModal') || isModalShowing) {
        return;
    }

    isModalShowing = true;
    appendModalToBody(createUpdateModalHTML());
    setupUpdateModalListeners(UPDATE_MODAL_ID, persistClose);
}

/**
 * @param {{ force?: boolean }} [options]
 */
export function showUpdateModal(options = {}) {
    const force = options.force === true;

    if (!force && (!UPDATE_MODAL_ENABLED || !UPDATE_MODAL_ID)) {
        return;
    }

    if (document.getElementById('AsUpdateModal') || isModalShowing) {
        return;
    }

    if (force) {
        mountUpdateModal(false);
        return;
    }

    // Wait for AQ to be available on content pages
    if (typeof window.AQ === 'undefined') {
        setTimeout(() => showUpdateModal(options), 100);
        return;
    }

    try {
        if (!chrome?.storage?.local?.get) {
            return;
        }
        chrome.storage.local.get([UPDATE_MODAL_STORAGE_KEY], function(result) {
            const closedId = result?.[UPDATE_MODAL_STORAGE_KEY];

            if (closedId === UPDATE_MODAL_ID) {
                return;
            }

            mountUpdateModal(true);
        });
    } catch (error) {
        console.warn('[Content] Update modal storage read failed:', error);
    }
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
    const iconUrl = chrome.runtime.getURL('images/logo/ai-rtl-logo.png');
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
                    padding: 18px 0 0;
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
                    gap: 8px;
                    margin-bottom: 12px;
                    padding: 0 20px 10px;
                    border-bottom: 1px solid rgba(0, 234, 255, 0.2);
                    direction: rtl;
                    flex-direction: row-reverse;
                }
                #AsUpdateModal .As-logo {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    box-shadow: none;
                    flex-shrink: 0;
                    border: none;
                }
                #AsUpdateModal .As-ext-info {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 6px;
                    flex-wrap: wrap;
                }
                #AsUpdateModal .As-ext-name {
                    margin: 0;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 1.2;
                    text-shadow: none;
                }
                #AsUpdateModal .As-version {
                    display: inline-block;
                    background: transparent;
                    color: #00e9ff;
                    border: 1px solid rgba(0, 233, 255, 0.35);
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    box-shadow: none;
                }
                #AsUpdateModal .As-section {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    padding: 0 20px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 233, 255, 0.7) transparent;
                    scrollbar-gutter: stable;
                }
                #AsUpdateModal .As-section::-webkit-scrollbar {
                    width: 8px;
                }
                #AsUpdateModal .As-section::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 0;
                }
                #AsUpdateModal .As-section::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #00e9ff 0%, #0099cc 100%);
                    border-radius: 8px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
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
                    margin: 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 8px 10px;
                    direction: rtl;
                    text-align: right;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 120, 120, 0.28);
                    border-radius: 10px;
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
                    margin-top: 18px;
                    margin-bottom: 12px;
                    direction: rtl;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
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
                #AsUpdateModal .As-change-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                #AsUpdateModal .As-site-subgroup {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                #AsUpdateModal .As-site-subgroup + .As-site-subgroup {
                    margin-top: 6px;
                    padding-top: 12px;
                    border-top: 1px dashed rgba(0, 233, 255, 0.18);
                }
                #AsUpdateModal .As-change-group-title {
                    color: rgba(0, 233, 255, 0.8);
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }
                #AsUpdateModal .As-change-group-count {
                    color: rgba(0, 233, 255, 0.75);
                    font-size: 11px;
                    font-weight: 600;
                }
                #AsUpdateModal .As-change-list {
                    display: flex;
                    flex-direction: column;
                }
                #AsUpdateModal .As-site-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
                    gap: 8px;
                }
                #AsUpdateModal .As-site-chip {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    min-height: 76px;
                    padding: 10px 6px 8px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    text-align: center;
                }
                #AsUpdateModal .As-site-chip-img {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 3px;
                }
                #AsUpdateModal .As-site-chip-name {
                    color: rgba(255, 255, 255, 0.88);
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 1.35;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                #AsUpdateModal .As-site-chip-badge {
                    position: absolute;
                    top: 4px;
                    left: 6px;
                    font-size: 12px;
                    font-weight: 800;
                    line-height: 1;
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

                /* استایل لیست قابلیت‌های جدید */
                #AsUpdateModal .As-change-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 7px 2px;
                    border-radius: 0;
                    direction: rtl;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                #AsUpdateModal .As-change-item:last-child {
                    border-bottom: none;
                    padding-bottom: 2px;
                }
                #AsUpdateModal .As-change-text {
                    color: rgba(255, 255, 255, 0.88);
                    font-size: 12.5px;
                    line-height: 1.6;
                    flex: 1;
                    font-weight: 500;
                    text-align: right;
                }
                #AsUpdateModal .As-change-note {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 10.5px;
                    font-weight: 300;
                    margin-right: 6px;
                }
                #AsUpdateModal .As-change-type {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.4;
                    width: 18px;
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
                            <div class="As-version">
                                نسخه ${currentVersion}
                            </div>
                            <h2 class="As-ext-name">
                                AI RTL (Persian/Farsi)
                            </h2>
                        </div>
                    </div>

                    <div class="As-section">
                        <h3 class="As-title">
                            افزونه با موفقیت به‌روزرسانی شد
                        </h3>
                        <div class="As-changes As-version-changes">
                            ${renderChangeItems(versionChanges)}
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

function closeUpdateModalElement(modal) {
    isModalShowing = false;
    if (!modal) {
        return;
    }

    modal.style.display = 'none';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function setupUpdateModalListeners(modalId, persistClose = true) {
    const modal = document.getElementById('AsUpdateModal');
    const closeBtn = document.getElementById('AsUpdateCloseBtn');

    if (!modal || !closeBtn) {
        return;
    }

    setupStoryCapsuleAnimation();

    closeBtn.addEventListener('click', function() {
        if (!persistClose) {
            closeUpdateModalElement(modal);
            return;
        }

        try {
            if (!chrome?.storage?.local?.set) {
                closeUpdateModalElement(modal);
                return;
            }
            chrome.storage.local.set({ [UPDATE_MODAL_STORAGE_KEY]: modalId }, function() {
                closeUpdateModalElement(modal);

                void sendRuntimeMessage({ action: 'closeUpdateModalInAllTabs' });
            });
        } catch (error) {
            console.warn('[Content] Update modal storage write failed:', error);
            closeUpdateModalElement(modal);
        }
    });
}
