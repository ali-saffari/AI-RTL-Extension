// Shared version changes for update modal and popup ChangesList

/**
 * @typedef {Object} VersionChange
 * @property {string} id
 * @property {string} text
 * @property {string} [note]
 * @property {string} [icon]
 * @property {string} [shortName]
 * @property {string} [type]
 * @property {string} [group]
 * @property {boolean} [chromeOnly]
 */

/** @type {VersionChange} */
export const chatgptUpdateChange = {
    id: '2',
    text: 'آپدیت ChatGPT',
    note: 'هماهنگ شدن افزونه با آخرین نسخه ChatGPT',
    icon: 'sites/openAi-icon.png',
    type: 'update',
    group: 'feature',
};

/** @type {VersionChange} */
export const chatgptPerfChange = {
    id: '9',
    text: 'بهبود عملکرد در ChatGPT',
    icon: 'sites/openAi-icon.png',
    type: 'update',
    group: 'feature',
};

/** @type {VersionChange} */
export const copilotUpdateChange = {
    id: '8',
    text: 'آپدیت Copilot',
    note: 'برای استفاده باید از طریق منوی افزونه فعال کنید',
    icon: 'sites/copilot-icon.png',
    type: 'update',
    group: 'feature',
};

/** Chrome-only: MissingPermissionBanner + enable-all (not shown on Firefox). */
/** @type {VersionChange} */
export const enableAllSitesChange = {
    id: '10',
    text: 'قابلیت فعال کردن همه سایت‌ها با هم',
    icon: 'logo/ai-rtl-logo.png',
    type: 'add',
    group: 'feature',
    chromeOnly: true,
};

// Seen first modal (2026-09-20) but not the second (2026-09-26).
/** @type {VersionChange[]} */
export const chatgptAndCopilotChanges = [chatgptUpdateChange, copilotUpdateChange, enableAllSitesChange];

// Seen second modal (2026-09-26) already.
/** @type {VersionChange[]} */
export const chatgptPerfAndCopilotChanges = [chatgptPerfChange, copilotUpdateChange, enableAllSitesChange];

/** @type {VersionChange[]} */
export const versionChanges = [
    chatgptUpdateChange,
    copilotUpdateChange,
    enableAllSitesChange,
    { id: '7', text: 'دسته‌بندی لیست سایت‌ها در منوی اکستنشن', type: 'add', group: 'feature', icon: 'logo/ai-rtl-logo.png' },
    { id: '1', text: 'حل مشکل نیم‌فاصله در ChatGPT', note: 'افزودن نیم‌فاصله با Ctrl+Shift+2', icon: 'sites/openAi-icon.png', type: 'add', group: 'feature' },
    { id: '11', text: 'افزودن سایت YouTube', note: 'راست‌چین پنل پرسش از ویدیو', icon: 'sites/youtube.png', type: 'add', group: 'site' },
    { id: '3', text: 'افزودن سایت YouTube Studio', icon: 'sites/youtube-studio.png', type: 'add', group: 'site' },
    { id: '4', text: 'افزودن سایت Elicit', icon: 'sites/elicit.png', type: 'add', group: 'site' },
    { id: '5', text: 'افزودن سایت LongCat', icon: 'sites/longcat.png', type: 'add', group: 'site' },
    { id: '6', text: 'افزودن سایت MathGPT', icon: 'sites/mathgpt.png', type: 'add', group: 'site' },
];

/**
 * @param {VersionChange[]} [changes]
 * @param {boolean} [isFirefox]
 * @returns {VersionChange[]}
 */
export function filterVersionChangesForBrowser(changes = versionChanges, isFirefox = false) {
    if (!isFirefox) {
        return changes;
    }
    return changes.filter((change) => !change.chromeOnly);
}

/** @param {VersionChange} change */
export function getSiteShortName(change) {
    if (change.shortName) {
        return change.shortName;
    }

    return String(change.text || '')
        .replace(/^افزودن سایت\s+/, '')
        .replace(/^آپدیت\s+/, '');
}

/**
 * @param {VersionChange[]} [changes]
 * @returns {{
 *   menuChanges: VersionChange[],
 *   features: VersionChange[],
 *   sites: VersionChange[],
 *   updatedSites: VersionChange[],
 *   addedSites: VersionChange[]
 * }}
 */
export function splitVersionChanges(changes = versionChanges) {
    /** @type {VersionChange[]} */
    const menuChanges = [];
    /** @type {VersionChange[]} */
    const features = [];
    /** @type {VersionChange[]} */
    const sites = [];

    for (const change of changes) {
        const isSite = change.group === 'site' || (
            change.group !== 'feature' &&
            change.group !== 'menu' &&
            String(change.icon || '').startsWith('sites/')
        );
        if (isSite) {
            sites.push(change);
        } else if (change.group === 'menu') {
            menuChanges.push(change);
        } else {
            features.push(change);
        }
    }

    const updatedSites = sites.filter((site) => site.type !== 'add');
    const addedSites = sites.filter((site) => site.type === 'add');

    return { menuChanges, features, sites, updatedSites, addedSites };
}

// لیست تغییرات نسخه‌های قبلی
export const previousChanges = [
    {
        version: '1405/06/29',
        changes: [
            { id: '1', text: 'تغییر ظاهر افزونه' },
            { id: '25', text: 'تغییر لوگو و آیکون' },
            { id: '19', text: 'قابلیت نمایش سایت باز در بالای لیست' },
            { id: '26', text: 'قابلیت سرچ در لیست سایت‌ها' },
            { id: '36', text: 'افزودن متن‌های راهنمای بیشتر' },
            { id: '16', text: 'افزودن قابلیت تغییر فونت و سایز فونت' },
            { id: '17', text: 'قابلیت برعکس کردن فلش‌ها در متن‌های فارسی و راست‌چین' },
            { id: '18', text: 'قابلیت راست‌چین باکس کدها (مارک‌داون‌های) فارسی' },
            { id: '20', text: 'آپدیت الگوریتم راست‌چین و بهینه‌سازی آن' },
            { id: '24', text: 'بهبود عملکرد نسخه فایرفاکس اکستنشن' },
            { id: '2', text: 'افزودن سایت Google Labs (Flow)' },
            { id: '3', text: 'افزودن سایت Meta AI' },
            { id: '4', text: 'افزودن سایت fal.ai' },
            { id: '5', text: 'آپدیت Gemini' },
            { id: '23', text: 'آپدیت ChatGPT' },
            { id: '29', text: 'آپدیت Claude' },
            { id: '30', text: 'آپدیت Ernie (Baidu) — wenxin.baidu.com و chat.baidu.com' },
            { id: '31', text: 'آپدیت Copilot' },
            { id: '32', text: 'آپدیت Digen' },
            { id: '33', text: 'آپدیت Kimi' },
            { id: '28', text: 'آپدیت Minimax' },
            { id: '27', text: 'آپدیت Duck AI' },
            { id: '34', text: 'آپدیت Grok' },
            { id: '35', text: 'آپدیت Gamma' },
            { id: '6', text: 'افزودن سایت Black Forest' },
            { id: '7', text: 'افزودن سایت Character.AI' },
            { id: '8', text: 'افزودن سایت Pi' },
            { id: '9', text: 'افزودن سایت Cursor' },
            { id: '10', text: 'آپدیت DeepSeek' },
            { id: '21', text: 'آپدیت Qwen' },
            { id: '22', text: 'آپدیت Z.ai' },
            { id: '11', text: 'افزودن سایت TypingMind' },
            { id: '12', text: 'افزودن سایت Hugging Face' },
            { id: '13', text: 'افزودن سایت Dash0' },
            { id: '14', text: 'افزودن سایت Zerve' },
            { id: '15', text: 'افزودن سایت Qwen Coder' },
            { id: '37', text: 'افزودن سایت Sakana Chat' },
            { id: '38', text: 'آپدیت Genspark' },
            { id: '39', text: 'افزودن سایت Google Drive' },
            { id: '40', text: 'افزودن سایت Microsoft 365 Copilot' },
            { id: '41', text: 'آپدیت AI Studio' },
            { id: '42', text: 'آپدیت Arena' },
            { id: '43', text: 'افزودن سایت Google Analytics' },
        ]
    },
    {
        version: '1405/05/12',
        changes: [
            { id: '1', text: 'آپدیت Claude' },
            { id: '2', text: 'آپدیت Google Notebook' },
            { id: '3', text: 'آپدیت DeepSeek' },
            { id: '4', text: 'آپدیت ChatGPT' },
            { id: '5', text: 'افزودن سایت Lumo' },
            { id: '6', text: 'افزودن سایت ATXP Chat' },
            { id: '7', text: 'افزودن سایت Consensus' },
            { id: '8', text: 'افزودن سایت SciSpace' },
            { id: '9', text: 'افزودن سایت Chatbox AI' },
            { id: '10', text: 'افزودن سایت Veo 3' },
        ]
    },
    {
        version: '1405/04/20',
        changes: [
            { id: '1', text: 'آپدیت Qwen' },
            { id: '2', text: 'آپدیت Manus' },
            { id: '3', text: 'افزودن Duck AI' },
            { id: '4', text: 'افزودن ClickUp' },
            { id: '5', text: 'افزودن T3 Chat' },
            { id: '6', text: 'افزودن Vivado AMD' },

        ]
    },
    {
        version: '1405/02/20',
        changes: [
            { id: '1', text: 'تغیر اسم پلاگین از ChatGPT RTL به AI RTL' },
            { id: '2', text: 'تغیر لوگو و آیکون‌ افزونه' },
        ]
    },
    {
        version: '1404/11/19',
        changes: [
            { id: '1', text: 'تغییر LMArena به Arena' },
        ]
    },
    {
        version: '1404/09/11',
        changes: [
            { id: '1', text: 'افزودن Business Gemini' },
            { id: '2', text: 'افزودن synapse' },
            { id: '3', text: 'افزودن notion' },
            { id: '4', text: 'افزودن Genspark' },
            { id: '5', text: 'اپدیت perplexity' },
            { id: '6', text: 'اپدیت google ai studio' },
        ]
    },
    {
        version: '1404/09/1',
        changes: [
            { id: '1', text: 'افزودن قابلیت راست چین دستی برای همه سایت ها (آزمایشی)' },
            { id: '2', text: 'افزودن Lovable' },
            { id: '3', text: 'افزودن Gamma' },
            { id: '4', text: 'افزودن Writesonic (Chatsonic)' },
            { id: '5', text: 'افزودن Ernie (Baidu)' },
            { id: '6', text: 'اپدیت NotebookLM' },
        ]
    },
    {
        version: '1404/08/18',
        changes: [
            { id: '1', text: 'افزودن Digen' },
            { id: '2', text: 'افزودن Google Jules' },
            { id: '3', text: 'اپدیت Gemini' },
        ]
    },
    {
        version: '1404/07/10',
        changes: [
            { id: '1', text: 'افزودن متن راهنما برای Copilot درباره محدودیت مرورگر Edge' },
            { id: '2', text: 'غیرفعال کردن خودکار Copilot در مرورگر Edge' },
            { id: '3', text: 'افزودن باکس هشدار برای Copilot در Edge' },
        ]
    },
    {
        version: '1404/07/09',
        changes: [
            { id: '1', text: 'اپدیت NotebookLM' },
        ]
    },
    {
        version: '1404/07/04',
        changes: [
            { id: '1', text: "تغییر الگوریتم پیش‌فرض از 'تحلیل پیشرفته بخش‌ها' به 'تحلیل پیشرفته یکپارچه'" },
            { id: '2', text: 'رفع مشکل هنگ شدن در هنگام تایپ' },
        ]
    },
    {
        version: '1404/06/30',
        changes: [
            { id: '1', text: 'آپدیت NotebookLM' },
            { id: '2', text: 'حل مشکل جدول‌ها در ChatGPT' },
            { id: '3', text: 'حل مشکل gemini' },
            { id: '4', text: 'اپدیت Google AI Studio' },
            { id: '5', text: 'افزودن GitHub Copilot' },
            { id: '6', text: 'افزودن OpenRouter' },
            { id: '7', text: 'افزودن Minimax' },
        ]
    },
    {
        version: '1404/06/4',
        changes: [
            { id: '1', text: 'اضافه شدن الگوریتم هوشمند و پیشرفته برای تشخیص راست‌چین و چپ‌چین' },
            { id: '2', text: 'به‌روزرسانی تمامی سایت‌ها' },
            { id: '3', text: 'به‌روزرسانی لینک حمایت' },
            { id: '4', text: 'اضافه شدن بخش تنظیمات انتخاب الگوریتم' },
            { id: '5', text: 'امکان پنهان کردن متن حمایت در تنظیمات' },
            { id: '6', text: 'حذف سایت‌های غیرفعال' },
            { id: '7', text: 'افزودن NotebookLM' },
            { id: '8', text: 'افزودن Z.ai' },
            { id: '9', text: 'افزودن Arena' }
        ]
    },
    {
        version: '1404/04/23',
        changes: [
            { id: '1', text: 'هماهنگی با سایت های اپدیت شده' },
            { id: '2', text: 'افزودن Mistral' },
            { id: '3', text: 'افزودن Manus' },
            { id: '4', text: 'افزودن Kimi' },
            { id: '5', text: 'افزودن Black box' },
            { id: '6', text: 'افزودن بخش حمایت از اکستنشن' }
        ]
    },
    {
        version: '1404/03/16',
        changes: [
            { id: '1', text: 'اپدیت ChatGPT' },
            { id: '2', text: 'اپدیت Grok' },
            { id: '3', text: 'اپدیت Qwen' }
        ]
    },
    {
        version: '1404/01/31',
        changes: [
            { id: '1', text: 'اپدیت ChatGPT (اصلاح فونت برای فرمول های ریاضی)' }
        ]
    },
    {
        version: '1404/01/23',
        changes: [
            { id: '1', text: 'اپدیت claude' }
        ]
    },
    {
        version: '1404/01/03',
        changes: [
            { id: '1', text: 'اپدیت ChatGPT' },
            { id: '2', text: 'اپدیت DeepSeek' },
            { id: '3', text: 'رفع مشکلات جزعی در بقیه سایت ها' }
        ]
    },
    {
        version: '1403/12/08',
        changes: [
            { id: '1', text: 'سایت gemini.google.com اضافه شد (آزمایشی)' },
            { id: '2', text: 'سایت grok.com اضافه شد (آزمایشی)' }
        ]
    },
    {
        version: '1403/11/18',
        changes: [
            { id: '1', text: 'سایت poe.com اضافه شد' },
            { id: '2', text: 'سایت monica.im اضافه شد' }
        ]
    },
    {
        version: '1403/11/16',
        changes: [
            { id: '1', text: 'اپدیت DeepSeek' },
            { id: '2', text: 'اپدیت ChatGPT' }
        ]
    },
    {
        version: '1403/11/06',
        changes: [
            { id: '1', text: 'حل مشکلات chat.deepseek.com' },
            { id: '2', text: 'حل مشکلات claude.ai' },
            { id: '3', text: 'سایت you.com اضافه شد (آزمایشی)' },
            { id: '4', text: 'سایت chat.qwenlm.ai اضافه شد (آزمایشی)' }
        ]
    },
    {
        version: '1403/10/11',
        changes: [
            { id: '1', text: 'سایت chat.deepseek.com اضافه شد' }
        ]
    },
    {
        version: '1403/10/08',
        changes: [
            { id: '1', text: 'سایت aistudio.google.com اضافه شد' }
        ]
    },
    {
        version: '1403/9/28',
        changes: [
            { id: '1', text: 'فعال شدن راست چین برای قسمت های جدید ChatGPT' }
        ]
    },
    {
        version: '1403/9/25',
        changes: [
            { id: '1', text: 'سایت perplexity.ai اضافه شد' },
            { id: '2', text: 'سایت duckduckgo.com/aichat اضافه شد' },
            { id: '3', text: 'رفع برخی ایرادات در بقیه سایت ها' }
        ]
    },
    {
        version: '1403/8/12',
        changes: [
            { id: '1', text: 'هماهنگ سازی با نسخه جدید ChatGpt و Copilot' },
            { id: '2', text: 'بهینه سازی جداول و کد ها در ChatGpt' },
            { id: '3', text: 'بهینه سازی فرمول های ریاضی در ChatGpt' }
        ]
    },
    {
        version: '1403/6/26',
        changes: [
            { id: '1', text: 'با نسخه جدید ChatGpt هماهنگ شد' }
        ]
    },
    {
        version: '1403/3/22',
        changes: [
            { id: '1', text: 'با نسخه جدید ChatGpt هماهنگ شد' }
        ]
    },
    {
        version: '1403/3/1',
        changes: [
            { id: '1', text: 'مشکل فرمول های ریاضی در ChatGpt حل شد' },
            { id: '2', text: 'TheB Api اضافه شد' }
        ]
    },
    {
        version: '1403/2/29',
        changes: [
            { id: '1', text: 'با نسخه جدید هماهنگ شد' },
            { id: '2', text: 'فعال شد Claude و Copilot' },
            { id: '3', text: 'منو مدیریت و تنظیمات برای مدیریت افزونه اضافه شد' }
        ]
    },
    {
        version: '1402/9/14',
        changes: [
            { id: '1', text: 'هماهنگ شد ChatGPT با نسخه جدید' }
        ]
    },
    {
        version: '1402/2/30',
        changes: [
            { id: '1', text: 'هماهنگ شد ChatGPT با نسخه جدید' }
        ]
    },
    {
        version: '1402/2/15',
        changes: [
            { id: '1', text: 'نسخه اولیه منتشر شد' }
        ]
    }
];
