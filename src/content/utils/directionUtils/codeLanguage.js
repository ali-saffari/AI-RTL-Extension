/**
 * One object, one entry per site. Each site only has the functions it needs.
 * 'prose' is plain text (RTL). 'code' is a programming language (LTR).
 */

const PROSE_LANGUAGES = new Set(['plain text', 'plaintext', 'text', 'txt', 'markdown', 'md']);
const COMMENT_MARK = /^(\s*)(\/\/\/|\/\/|\/\*|#|<!--)(\s*)([\s\S]*)$/;
const RTL_LETTERS = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const SITES = {
    chatgpt: {
        readLanguage(el) {
            const fromEditor = el.closest('[data-language]');
            const dataLang = fromEditor && fromEditor.getAttribute('data-language');
            if (dataLang && dataLang.trim()) {
                return dataLang.trim();
            }

            const block = el.closest('[data-markdown-copy="code-block"]');
            const label = block && block.querySelector('[data-markdown-copy="exclude"] .truncate');
            return label ? label.textContent.trim() : '';
        },

        alignComments(root) {
            if (!root || root.nodeType !== 1 || typeof root.querySelectorAll !== 'function') {
                return;
            }
            root.querySelectorAll('[class^="Comment-"], [class*=" Comment-"]').forEach((span) => {
                if (span.closest('[data-markdown-copy="exclude"]')) {
                    return;
                }
                if (span.getAttribute('data-ai-rtl-comment') === '1' || span.children.length > 0) {
                    return;
                }
                const match = (span.textContent || '').match(COMMENT_MARK);
                if (!match || !RTL_LETTERS.test(match[4])) {
                    return;
                }

                const indent = match[1];
                const mark = document.createElement('span');
                mark.setAttribute('dir', 'ltr');
                mark.setAttribute('data-ai-rtl-comment', 'mark');
                mark.textContent = match[2] + match[3];

                const body = document.createElement('span');
                body.setAttribute('dir', 'rtl');
                body.setAttribute('data-ai-rtl-comment', 'body');
                body.textContent = match[4];

                span.setAttribute('dir', 'ltr');
                span.setAttribute('data-ai-rtl-comment', '1');
                span.textContent = '';
                if (indent) {
                    span.appendChild(document.createTextNode(indent));
                }
                span.appendChild(mark);
                span.appendChild(body);
            });
        },

        restoreComments(root) {
            if (!root || typeof root.querySelectorAll !== 'function') {
                return;
            }
            root.querySelectorAll('[data-ai-rtl-comment="1"]').forEach((span) => {
                span.textContent = span.textContent;
                span.removeAttribute('dir');
                span.removeAttribute('data-ai-rtl-comment');
            });
        }
    },

    claude: {
        readLanguage(el) {
            const group = el.closest('[role="group"][aria-label]');
            if (group) {
                const label = group.querySelector(':scope > .font-small');
                if (label && label.textContent.trim()) {
                    return label.textContent.trim();
                }
                const aria = (group.getAttribute('aria-label') || '').trim();
                const fromAria = aria.replace(/\s+code$/i, '').trim();
                if (fromAria && fromAria !== aria) {
                    return fromAria;
                }
            }

            const code = el.matches('code') ? el : el.querySelector('code');
            const className = String((code && code.className) || el.className || '');
            const match = className.match(/(?:^|\s)language-([^\s]+)/);
            return match ? match[1].replace(/-/g, ' ') : '';
        }
    }
};

export function codeBlockKind(el, site) {
    const read = SITES[site] && SITES[site].readLanguage;
    if (!read || !el || el.nodeType !== 1 || typeof el.closest !== 'function') {
        return 'unknown';
    }
    const label = String(read(el) || '').trim().toLowerCase();
    if (!label) {
        return 'unknown';
    }
    return PROSE_LANGUAGES.has(label) ? 'prose' : 'code';
}

export function alignSiteCodeComments(root, site) {
    const align = SITES[site] && SITES[site].alignComments;
    if (align) {
        align(root);
    }
}

export function restoreCodeCommentsIn(root) {
    Object.keys(SITES).forEach((site) => {
        const restore = SITES[site].restoreComments;
        if (restore) {
            restore(root);
        }
    });
}
