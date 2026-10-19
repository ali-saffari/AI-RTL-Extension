import { UPDATE_MODAL_ENABLED, UPDATE_MODAL_ID, UPDATE_MODAL_STORAGE_KEY } from '../../constants/updateModalConfig.js';
import { versionChanges, filterVersionChangesForBrowser, splitVersionChanges, getSiteShortName } from '../../constants/versionChanges.js';
import { UPDATE_MODAL_LOCALES, getUpdateModalCopy, getUpdateModalLocale, localizeVersionChange, normalizeUpdateLocale } from '../../constants/updateModalCopy.js';
import { sendRuntimeMessage } from '../../utils/chromeMessaging.js';
import { isFirefoxRuntime } from '../../utils/isFirefox.js';
import { siteUrl } from '../../utils/siteUrl.js';

const UI_LANGUAGE_STORAGE_KEY = 'uiLanguage';

let isModalShowing = false;
let activeModal = { persistClose: true, options: {} };

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fill(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, (_, name) => (
        vars[name] === undefined ? '' : String(vars[name])
    ));
}

function renderFeatureItems(changes) {
    return changes.map((change) => `
        <div class="As-change-item">
            ${/^(sites|logo)\//.test(String(change.icon || '')) ? `
                <img class="As-change-icon" src="${chrome.runtime.getURL('images/' + change.icon)}" alt="" onerror="this.style.display='none'">
            ` : ''}
            <div class="As-change-type" style="color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};">
                ${change.type === 'add' ? '+' : '↻'}
            </div>
            <div class="As-change-text">
                ${esc(change.text)}${change.note ? `<span class="As-change-note"> ${esc(change.note)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function renderSiteChips(changes) {
    return changes.map((change) => {
        const details = Array.isArray(change.details) ? change.details : [];
        const name = getSiteShortName(change);
        return `
        <div class="As-site-chip${details.length ? ' As-site-chip-wide' : ''}" title="${esc(change.text)}">
            <span class="As-site-chip-badge" style="color: ${change.type === 'add' ? '#00ff7f' : '#ff8c00'};">
                ${change.type === 'add' ? '+' : '↻'}
            </span>
            ${details.length ? `<div class="As-site-chip-brand">` : ''}
            <img class="As-site-chip-img" src="${chrome.runtime.getURL('images/' + change.icon)}" alt="${esc(name)}" onerror="this.style.display='none'">
            <span class="As-site-chip-name">${esc(name)}</span>
            ${details.length ? `</div><ul class="As-site-chip-details">${details.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>` : ''}
        </div>
    `;
    }).join('');
}

function renderLanguageSwitch(locale) {
    const current = getUpdateModalLocale(locale);
    const copy = getUpdateModalCopy(locale);
    const options = UPDATE_MODAL_LOCALES.map((item) => `
        <button class="As-lang-option${item.code === locale ? ' is-current' : ''}" type="button" data-locale="${item.code}" dir="${item.dir}">
            ${item.nativeName}
        </button>
    `).join('');
    return `
        <div class="As-lang" dir="ltr">
            <button class="As-lang-btn" id="AsLangBtn" type="button" aria-label="${esc(copy.language)}" aria-haspopup="listbox" aria-expanded="false">
                <span>${current.shortLabel}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z"></path></svg>
            </button>
            <div class="As-lang-menu" id="AsLangMenu" hidden>
                ${options}
            </div>
        </div>
    `;
}

function renderChangeItems(changes, copy) {
    const { menuChanges, features, updatedSites, addedSites } = splitVersionChanges(changes);

    return `
        ${features.length ? `
            <div class="As-change-group">
                <div class="As-change-group-title">${esc(copy.versionChanges)}</div>
                <div class="As-change-list">
                    ${renderFeatureItems(features)}
                </div>
            </div>
        ` : ''}
        ${menuChanges.length ? `
            <div class="As-change-group">
                <div class="As-change-group-title">${esc(copy.menuChanges)}</div>
                <div class="As-change-list">
                    ${renderFeatureItems(menuChanges)}
                </div>
            </div>
        ` : ''}
        ${updatedSites.length || addedSites.length ? `
            <div class="As-change-group">
                ${updatedSites.length ? `
                    <div class="As-site-subgroup">
                        <div class="As-change-group-title">
                            ${esc(copy.updatedSites)}
                            <span class="As-change-group-count">${esc(fill(copy.siteCount, { count: updatedSites.length }))}</span>
                        </div>
                        <div class="As-site-grid">
                            ${renderSiteChips(updatedSites)}
                        </div>
                    </div>
                ` : ''}
                ${addedSites.length ? `
                    <div class="As-site-subgroup">
                        <div class="As-change-group-title">
                            ${esc(copy.addedSites)}
                            <span class="As-change-group-count">${esc(fill(copy.siteCount, { count: addedSites.length }))}</span>
                        </div>
                        <div class="As-site-grid As-site-grid-new">
                            ${renderSiteChips(addedSites)}
                        </div>
                        <div class="As-sites-note">
                            <span class="As-sites-note-icon">!</span>
                            <p class="As-sites-note-text">
                                <strong>${esc(copy.noteLabel)}</strong> ${esc(copy.noteBody)}
                            </p>
                        </div>
                    </div>
                ` : ''}
            </div>
        ` : ''}
    `;
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

function readUiLocale(done) {
    try {
        if (!chrome?.storage?.sync?.get) {
            done('fa');
            return;
        }
        chrome.storage.sync.get([UI_LANGUAGE_STORAGE_KEY], function(result) {
            done(normalizeUpdateLocale(result?.[UI_LANGUAGE_STORAGE_KEY]));
        });
    } catch (error) {
        done('fa');
    }
}

function mountUpdateModal(persistClose, modalOptions = {}) {
    if (document.getElementById('AsUpdateModal') || isModalShowing) {
        return;
    }

    isModalShowing = true;

    const open = (locale) => {
        if (document.getElementById('AsUpdateModal')) {
            return;
        }
        const options = { ...modalOptions, locale };
        activeModal = { persistClose, options };
        appendModalToBody(createUpdateModalHTML(options));
        setupUpdateModalListeners(UPDATE_MODAL_ID, persistClose);
    };

    if (modalOptions.locale) {
        open(normalizeUpdateLocale(modalOptions.locale));
        return;
    }

    readUiLocale(open);
}

function switchModalLocale(locale) {
    const next = normalizeUpdateLocale(locale);
    const { persistClose, options } = activeModal;
    const modal = document.getElementById('AsUpdateModal');
    isModalShowing = false;
    if (modal?.parentNode) {
        modal.parentNode.removeChild(modal);
    }
    try {
        chrome?.storage?.sync?.set({ [UI_LANGUAGE_STORAGE_KEY]: next });
    } catch (error) {
        // Keep the chosen language for this modal even if storage is unavailable.
    }
    mountUpdateModal(persistClose, { ...options, locale: next });
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
}

function setupLanguageSwitch() {
    const button = document.getElementById('AsLangBtn');
    const menu = document.getElementById('AsLangMenu');
    const modal = document.getElementById('AsUpdateModal');
    if (!button || !menu || !modal) {
        return;
    }

    button.addEventListener('click', function(event) {
        event.stopPropagation();
        const open = menu.hasAttribute('hidden');
        if (open) {
            menu.removeAttribute('hidden');
        } else {
            menu.setAttribute('hidden', '');
        }
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.querySelectorAll('[data-locale]').forEach((option) => {
        option.addEventListener('click', function(event) {
            event.stopPropagation();
            switchModalLocale(option.getAttribute('data-locale'));
        });
    });

    modal.addEventListener('click', function(event) {
        if (event.target.closest('.As-lang')) {
            return;
        }
        menu.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
    });
}


function createUpdateModalHTML({ changes = versionChanges, includeStory = true, locale = 'fa' } = {}) {
    const manifest = chrome.runtime.getManifest();
    const extensionName = chrome.i18n.getMessage('extension_name') || manifest.name;
    const iconUrl = chrome.runtime.getURL('images/logo/ai-rtl-logo.png');
    const currentVersion = manifest.version;
    const activeLocale = normalizeUpdateLocale(locale);
    const copy = getUpdateModalCopy(activeLocale);
    const visibleChanges = filterVersionChangesForBrowser(changes, isFirefoxRuntime())
        .map((change) => localizeVersionChange(change, activeLocale));

    const staticAnnouncementHTML = `
        <div class="As-story-capsule" id="AsStoryCapsule">
            <button class="As-story-summary" id="AsStoryToggle" type="button" aria-expanded="false">
                <span class="As-story-summary-text">${esc(copy.storySummary)}</span>
                <span class="As-story-arrow" aria-hidden="true">▼</span>
            </button>
            <div class="As-story-panel" id="AsStoryPanel">
                <div class="As-special-announcement As-story-content">
                    ${copy.storyHtml}
                </div>
            </div>
        </div>
    `;

    return `
        <div class="As-modal-backdrop FontSet" id="AsUpdateModal" data-locale="${activeLocale}">
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
                    justify-content: stretch;
                    align-items: stretch;
                    flex-wrap: nowrap;
                    gap: 10px;
                    width: 100%;
                    box-sizing: border-box;
                }
                #AsUpdateModal .As-header {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-bottom: 12px;
                    padding: 0 20px 10px;
                    border-bottom: 1px solid rgba(0, 234, 255, 0.2);
                    direction: rtl;
                    position: relative;
                    z-index: 5;
                }
                #AsUpdateModal .As-lang {
                    position: absolute;
                    top: 0;
                    right: 20px;
                    z-index: 6;
                }
                #AsUpdateModal .As-lang-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin: 0;
                    padding: 4px 8px;
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    border-radius: 8px;
                    background: rgba(26, 26, 46, 0.72);
                    color: rgba(255, 255, 255, 0.92);
                    font-family: iranyekan, sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 1;
                    cursor: pointer;
                }
                #AsUpdateModal .As-lang-btn svg {
                    width: 14px;
                    height: 14px;
                    fill: currentColor;
                }
                #AsUpdateModal .As-lang-btn:hover {
                    color: #ffffff;
                    border-color: rgba(255, 255, 255, 0.55);
                }
                #AsUpdateModal .As-lang-menu {
                    position: absolute;
                    top: calc(100% + 6px);
                    right: 0;
                    min-width: 140px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: 4px;
                    background: #1a1a2e;
                    border: 1px solid rgba(0, 233, 255, 0.45);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
                }
                #AsUpdateModal .As-lang-menu[hidden] {
                    display: none;
                }
                #AsUpdateModal .As-lang-option {
                    display: block;
                    width: 100%;
                    margin: 0;
                    padding: 8px 10px;
                    border: 0;
                    border-radius: 8px;
                    background: transparent;
                    color: #ffffff;
                    font-family: iranyekan, sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: start;
                }
                #AsUpdateModal .As-lang-option:hover,
                #AsUpdateModal .As-lang-option.is-current {
                    color: #00e9ff;
                    background: rgba(0, 233, 255, 0.08);
                }
                #AsUpdateModal[data-locale="en"] .As-modal,
                #AsUpdateModal[data-locale="en"] .As-content,
                #AsUpdateModal[data-locale="en"] .As-header,
                #AsUpdateModal[data-locale="en"] .As-section,
                #AsUpdateModal[data-locale="en"] .As-title,
                #AsUpdateModal[data-locale="en"] .As-change-text,
                #AsUpdateModal[data-locale="en"] .As-change-group-title,
                #AsUpdateModal[data-locale="en"] .As-sites-note-text,
                #AsUpdateModal[data-locale="en"] .As-story-summary,
                #AsUpdateModal[data-locale="en"] .As-story-content,
                #AsUpdateModal[data-locale="en"] .As-site-chip-wide,
                #AsUpdateModal[data-locale="en"] .As-site-chip-details {
                    direction: ltr;
                    text-align: left;
                }
                #AsUpdateModal[data-locale="en"] .As-story-summary-text,
                #AsUpdateModal[data-locale="en"] .As-special-announcement {
                    text-align: left;
                }
                #AsUpdateModal[data-locale="en"] .As-header {
                    justify-content: flex-start;
                }
                #AsUpdateModal[data-locale="en"] .As-header-brand {
                    flex-direction: row;
                }
                #AsUpdateModal[data-locale="en"] .As-site-chip-details {
                    padding: 0 0 0 18px;
                }
                #AsUpdateModal .As-header-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
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
                    margin: 0 0 8px 0;
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
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 8px;
                }
                #AsUpdateModal .As-site-chip {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    min-height: 96px;
                    padding: 12px 6px 8px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    text-align: center;
                }
                #AsUpdateModal .As-site-chip-img {
                    width: 44px;
                    height: 44px;
                    object-fit: contain;
                    border-radius: 0;
                    background: none;
                    border: none;
                    padding: 0;
                }
                #AsUpdateModal .As-site-grid-new .As-site-chip-img {
                    border-radius: 6px;
                }
                #AsUpdateModal .As-site-grid-new .As-site-chip-name {
                    margin-top: 6px;
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
                #AsUpdateModal .As-site-chip-wide {
                    grid-column: 1 / -1;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    justify-content: flex-start;
                    align-items: center;
                    direction: rtl;
                    gap: 8px;
                }
                #AsUpdateModal .As-site-chip-brand {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    flex: 0 0 calc((100% - 24px) / 4);
                    min-height: 76px;
                }
                #AsUpdateModal .As-site-chip-details {
                    width: auto;
                    flex: 1;
                    margin: 0;
                    padding: 0 18px 0 0;
                    list-style: disc;
                    direction: rtl;
                    text-align: right;
                }
                #AsUpdateModal .As-site-chip-details li {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 10.5px;
                    font-weight: 300;
                    line-height: 1.6;
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
                    align-items: center;
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
                    font-size: 14.5px;
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
                #AsUpdateModal .As-change-icon {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                    flex-shrink: 0;
                    border-radius: 4px;
                }
                #AsUpdateModal .As-change-type {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 22px;
                    font-weight: 700;
                    line-height: 1;
                    width: 24px;
                }
                #AsUpdateModal .As-close-btn {
                    background: linear-gradient(135deg, rgba(0, 233, 255, 0.15) 0%, rgba(0, 153, 204, 0.1) 100%);
                    color: #ffffff;
                    border: 2px solid rgba(0, 233, 255, 0.4);
                    padding: 0 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 20px;
                    flex: 1.7 1 0;
                    width: auto;
                    height: 44px;
                    min-height: 44px;
                    min-width: 0;
                    margin: 0;
                    box-sizing: border-box;
                    appearance: none;
                    -webkit-appearance: none;
                    font-family: iranyekan, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
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
                #AsUpdateModal .As-footer-link {
                    box-sizing: border-box;
                    padding: 0 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 20px;
                    font-family: iranyekan, sans-serif;
                    text-decoration: none;
                    white-space: nowrap;
                    flex: 1 1 0;
                    height: 44px;
                    min-height: 44px;
                    min-width: 0;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #00e9ff;
                    background: none;
                    border: 2px solid rgba(0, 233, 255, 0.45);
                    box-shadow: none;
                    appearance: none;
                    -webkit-appearance: none;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
                }
                #AsUpdateModal .As-footer-link:hover {
                    transform: translateY(-2px);
                    color: #ffffff;
                }
            </style>
            <div class="As-modal">
                <div class="As-content">
                    <div class="As-header">
                        ${renderLanguageSwitch(activeLocale)}
                        <div class="As-header-brand">
                            <img class="As-logo" src="${iconUrl}" alt="${esc(extensionName)}">
                            <div class="As-ext-info">
                                <div class="As-version">
                                    ${esc(fill(copy.version, { version: currentVersion }))}
                                </div>
                                <h2 class="As-ext-name">
                                    AI RTL (Persian/Farsi)
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div class="As-section">
                        <h3 class="As-title">
                            ${esc(copy.title)}
                        </h3>
                        <div class="As-changes As-version-changes">
                            ${renderChangeItems(visibleChanges, copy)}
                        </div>

                        ${includeStory ? staticAnnouncementHTML : ''}
                    </div>

                    <div class="As-footer">
                        <button class="As-close-btn" id="AsUpdateCloseBtn">${esc(copy.close)}</button>
                        <a class="As-footer-link" href="${siteUrl('/supporters/', activeLocale)}" target="_blank" rel="noopener noreferrer">${esc(copy.support)}</a>
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
    setupLanguageSwitch();

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
