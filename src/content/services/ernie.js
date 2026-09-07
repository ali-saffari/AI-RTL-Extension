// ernie.js service functions (ernie.baidu.com / wenxin.baidu.com / chat.baidu.com)
import { addCopyright } from '../utils/copyright.js';
import { applyRtlToContainer, applyRtlToElement } from '../utils/directionUtils/index.js';

const INPUT_SELECTOR = 'textarea, #chat-textarea, .ci-textarea, .ci-editor';
const MESSAGE_SELECTOR = [
    '.dialog-card-wrapper',
    '.chat-qa-container',
    '.ai-entry',
    '.cosd-markdown',
    '.markdown',
    '[class*="chat-search-history-answer"]',
    '[class*="answer-history"]'
].join(', ');
const TITLE_SELECTOR = '[class*="questionText_"] span, [class*="sessionName"], .cs-question-text';

const INPUT_OPTIONS = {
    fontClass: 'FontSet',
    setTextAlign: 'important'
};

const MESSAGE_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'AsOkText',
    rtlClass: 'AsRtl',
    isContainer: true,
    setTextAlign: true
};

const TITLE_OPTIONS = {
    fontClass: 'FontSet',
    processedClass: 'Asok',
    rtlClass: 'AsRtl',
    setTextAlign: true
};

const BAIDU_HOSTS = [
    'ernie.baidu.com',
    'wenxin.baidu.com',
    'chat.baidu.com'
];

function isBaiduHost(hostname = window.location.hostname) {
    const host = String(hostname || '').replace(/^www\./, '').toLowerCase();
    return BAIDU_HOSTS.some((allowed) => host === allowed || host.endsWith('.' + allowed));
}

function ensureErnieStyles() {
    if (!isBaiduHost() || AQ('#ernie-font-style').length) {
        return;
    }

    AQ(`<style id="ernie-font-style">
        body.cos-chat.rtl-algorithm-active .cosd-markdown :is(ul, ol)[dir="rtl"] > li,
        body.cos-chat.rtl-algorithm-active .cosd-markdown [dir="rtl"] :is(ul, ol) > li,
        body.cos-chat.rtl-algorithm-active .cosd-markdown li[dir="rtl"] {
            padding-left: 0 !important;
            padding-right: 21px !important;
        }

        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang ol[dir="rtl"] > li:nth-child(n+10),
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang [dir="rtl"] ol > li:nth-child(n+10) {
            padding-right: 31px !important;
        }

        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang ol[dir="rtl"] > li:nth-child(n+100),
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang [dir="rtl"] ol > li:nth-child(n+100) {
            padding-right: 41px !important;
        }

        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang :is(ul, ol)[dir="rtl"],
        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang [dir="rtl"] :is(ul, ol) {
            padding-left: 0 !important;
            padding-right: var(--cos-text-body-lg) !important;
        }

        body.cos-chat.rtl-algorithm-active .cosd-markdown :is(ul, ol)[dir="rtl"] > li:before,
        body.cos-chat.rtl-algorithm-active .cosd-markdown [dir="rtl"] :is(ul, ol) > li:before,
        body.cos-chat.rtl-algorithm-active .cosd-markdown li[dir="rtl"]:before,
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang :is(ul, ol)[dir="rtl"] > li:before,
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang [dir="rtl"] :is(ul, ol) > li:before,
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang li[dir="rtl"]:before,
        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang :is(ul, ol)[dir="rtl"] > li:before,
        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang [dir="rtl"] :is(ul, ol) > li:before,
        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang li[dir="rtl"]:before {
            left: auto !important;
            right: 5px !important;
            float: right !important;
            margin-left: 8px !important;
            margin-right: -21px !important;
        }

        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang ol[dir="rtl"] > li:nth-child(n+10):before,
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang [dir="rtl"] ol > li:nth-child(n+10):before {
            margin-right: -31px !important;
        }

        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang ol[dir="rtl"] > li:nth-child(n+100):before,
        body.cos-chat.rtl-algorithm-active .cos-pc .ai-entry .cosd-markdown .marklang [dir="rtl"] ol > li:nth-child(n+100):before {
            margin-right: -41px !important;
        }

        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang li[dir="rtl"]:before,
        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang :is(ul, ol)[dir="rtl"] > li:before,
        body.cos-chat.rtl-algorithm-active .cos-wise .ai-entry .cosd-markdown .marklang [dir="rtl"] :is(ul, ol) > li:before {
            margin-left: calc(-1 * var(--cos-space-sm)) !important;
            margin-right: 0 !important;
            transform: translateX(var(--cos-text-body-lg)) !important;
        }

        body.cos-chat.rtl-algorithm-active #ci-area #chat-textarea,
        body.cos-chat.rtl-algorithm-active #ci-area .ci-textarea,
        body.cos-chat.rtl-algorithm-active #ci-area .ci-editor {
            font-family: var(--ai-rtl-font, iranyekan, sans-serif) !important;
        }

        body.cos-chat.rtl-algorithm-active #ci-area #chat-textarea[dir="rtl"],
        body.cos-chat.rtl-algorithm-active #ci-area .ci-textarea[dir="rtl"],
        body.cos-chat.rtl-algorithm-active #ci-area .ci-editor[dir="rtl"],
        body.cos-chat.rtl-algorithm-active #ci-area:has([dir="rtl"]) {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
        }

        body.cos-chat.rtl-algorithm-active #ci-area #chat-textarea[dir="ltr"],
        body.cos-chat.rtl-algorithm-active #ci-area .ci-textarea[dir="ltr"],
        body.cos-chat.rtl-algorithm-active #ci-area .ci-editor[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }
    </style>`).appendTo('head');
}

function syncCiAreaDirection(element) {
    const $area = AQ(element).closest('#ci-area');
    if (!$area.length) {
        return;
    }
    const dir = AQ(element).attr('dir');
    if (dir) {
        $area.attr('dir', dir);
    } else {
        $area.removeAttr('dir');
    }
}

export function setErnie(rtlAlgorithm = 'advanced_full') {
    if (!isBaiduHost()) {
        return;
    }

    ensureErnieStyles();

    if (chrome.runtime?.id) {
        // Add copyright notice - selector should be adjusted based on actual site structure
        let fo2 = `footer`
        addCopyright(AQ(fo2), 'AsBoxErnie AsBoxB', 'margin-top: 4px; margin-bottom: -5px; font-size: 13px;');
    }

    AQ('body.cos-chat, .chat-wrapper').each(function () {
        if (!AQ(this).hasClass('FontSet')) {
            AQ(this).addClass('FontSet');
        }
    });

    // Process textarea / composer elements
    AQ(INPUT_SELECTOR).each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
        syncCiAreaDirection(this);

        if (AQ(this).data('rtl-listener-added')) {
            return;
        }
        AQ(this).data('rtl-listener-added', true);
        
        AQ(this).on('input keyup paste', function() {
            requestAnimationFrame(() => {
                applyRtlToElement(this, rtlAlgorithm, INPUT_OPTIONS);
                syncCiAreaDirection(this);
            });
        });
    });

    // Process message content and chat elements (old Ernie cards + new Wenxin Cosmic chat)
    AQ(MESSAGE_SELECTOR).each(function (each) {
        applyRtlToContainer(this, rtlAlgorithm, MESSAGE_OPTIONS);
    });


    // Process common text elements
    
    AQ(' [class*="container_"] span').each(function (each) {
        if (!AQ(this).hasClass("FontSet")) {
            AQ(this).addClass('FontSet');
        }

    });



    AQ(TITLE_SELECTOR).each(function (each) {
        applyRtlToElement(this, rtlAlgorithm, TITLE_OPTIONS);
    });
}

// Main activation function for Ernie
export function activateErnie(rtlAlgorithm = 'advanced_full') {
    if (!isBaiduHost()) {
        return;
    }

    console.log('Ernie RTL activated with algorithm:', rtlAlgorithm);
    
    // Initial setup
    setErnie(rtlAlgorithm);

    // Periodic updates
    setInterval(() => {
        setErnie(rtlAlgorithm);
    }, 1000);
}
