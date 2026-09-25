/**
 * Language label on a fenced code block.
 * ChatGPT prints it in the header (.truncate inside [data-markdown-copy="exclude"])
 * and, for the editor, also on [data-language].
 */

const PROSE_LANGUAGES = new Set([
    'plain text',
    'plaintext',
    'text',
    'txt'
]);

const COMMENT_SELECTOR = '[class^="Comment-"], [class*=" Comment-"]';
const COMMENT_MARK_RE = /^(\s*)(\/\/\/|\/\/|\/\*|#|<!--)(\s*)([\s\S]*)$/;

export function classifyCodeLanguage(label) {
    const key = String(label || '').trim().toLowerCase();
    if (!key) {
        return 'unknown';
    }
    if (PROSE_LANGUAGES.has(key)) {
        return 'prose';
    }
    return 'code';
}

export function readCodeBlockLanguage(el) {
    if (!el || el.nodeType !== 1 || typeof el.closest !== 'function') {
        return '';
    }

    const labeled = el.closest('[data-language]');
    const dataLang = labeled && labeled.getAttribute('data-language');
    if (dataLang && dataLang.trim()) {
        return dataLang.trim();
    }

    const block = el.closest('[data-markdown-copy="code-block"]');
    if (!block) {
        return '';
    }
    const header = block.querySelector('[data-markdown-copy="exclude"]');
    const label = header && header.querySelector('.truncate');
    return label ? label.textContent.trim() : '';
}

export function codeBlockKind(el) {
    return classifyCodeLanguage(readCodeBlockLanguage(el));
}

function hasRtlLetters(text) {
    return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || '');
}

function isCodeHeader(el) {
    return Boolean(el && el.closest && el.closest('[data-markdown-copy="exclude"]'));
}

/**
 * Programming comments stay on the left of an LTR line.
 * The marker (//, #, ...) stays on the left; only the comment text is RTL.
 */
export function alignCodeComment(span) {
    if (!span || span.nodeType !== 1 || isCodeHeader(span)) {
        return;
    }
    if (span.getAttribute('data-ai-rtl-comment') === '1') {
        return;
    }
    if (span.children.length > 0) {
        return;
    }

    const text = span.textContent || '';
    const match = text.match(COMMENT_MARK_RE);
    if (!match || !hasRtlLetters(match[4])) {
        return;
    }

    const indent = match[1];
    const mark = match[2] + match[3];
    const body = match[4];

    span.setAttribute('dir', 'ltr');
    span.setAttribute('data-ai-rtl-comment', '1');
    span.textContent = '';

    if (indent) {
        span.appendChild(document.createTextNode(indent));
    }

    const markEl = document.createElement('span');
    markEl.setAttribute('dir', 'ltr');
    markEl.setAttribute('data-ai-rtl-comment', 'mark');
    markEl.textContent = mark;

    const bodyEl = document.createElement('span');
    bodyEl.setAttribute('dir', 'rtl');
    bodyEl.setAttribute('data-ai-rtl-comment', 'body');
    bodyEl.textContent = body;

    span.appendChild(markEl);
    span.appendChild(bodyEl);
}

export function alignCodeCommentsIn(root) {
    if (!root || root.nodeType !== 1 || typeof root.querySelectorAll !== 'function') {
        return;
    }
    const nodes = root.querySelectorAll(COMMENT_SELECTOR);
    for (let i = 0; i < nodes.length; i++) {
        alignCodeComment(nodes[i]);
    }
}

export function restoreCodeCommentsIn(root) {
    if (!root || typeof root.querySelectorAll !== 'function') {
        return;
    }
    const nodes = root.querySelectorAll('[data-ai-rtl-comment="1"]');
    for (let i = 0; i < nodes.length; i++) {
        const span = nodes[i];
        const text = span.textContent;
        span.textContent = text;
        span.removeAttribute('dir');
        span.removeAttribute('data-ai-rtl-comment');
    }
}
