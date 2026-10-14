export const UPDATE_MODAL_LOCALES = [
    { code: 'fa', nativeName: 'فارسی', shortLabel: 'فا', dir: 'rtl' },
    { code: 'en', nativeName: 'English', shortLabel: 'EN', dir: 'ltr' },
    { code: 'ar', nativeName: 'العربية', shortLabel: 'ع', dir: 'rtl' },
];

const UI = {
    fa: {
        version: 'نسخه {version}',
        title: 'افزونه با موفقیت به‌روزرسانی شد',
        versionChanges: 'تغییرات این نسخه',
        menuChanges: 'تغییرات منوی افزونه',
        updatedSites: 'سایت‌های آپدیت‌شده',
        addedSites: 'سایت‌های جدید',
        siteCount: '{count} سایت',
        noteLabel: 'توجه:',
        noteBody: 'سایت‌های جدید به‌صورت پیش‌فرض غیرفعال هستند و باید از طریق منوی اکستنشن فعال کنید',
        storySummary: 'چرا اسم اکستنشن تغییر کرده؟',
        storyHtml: `ما برگشتیم، اما با یک نام و نشان جدید! 🚀<br><br>
اگر متوجه غیبت کوتاه‌مدت ما شده بودید، دلیلش شکایت شرکت OpenAI روی نام ChatGPT بود. این موضوع ما را مجبور کرد تا نام و لوگوی افزونه را تغییر دهیم.<br><br>
راستش را بخواهید، این افزونه در ابتدا فقط برای راحتی کار با ChatGPT طراحی شده بود؛ اما به مرور زمان و به درخواست شما عزیزان، پشتیبانی از سایت‌های هوش مصنوعی دیگر را هم به آن اضافه کردیم. متأسفانه فراموش کرده بودیم اسم افزونه را به‌روزرسانی کنیم و فکرش را هم نمی‌کردیم با چنین مشکلی روبه‌رو شویم!<br><br>
خلاصه اینکه ما پرقدرت‌تر از قبل برگشتیم. لطفاً نام و لوگوی جدید ما را به خاطر بسپارید تا گممان نکنید: <strong>AI RTL (Persian/Farsi)</strong><br><br>
📢 برای باخبر شدن از آخرین اخبار، به‌روزرسانی‌ها و اتفاقات بعدی، حتماً کانال تلگرام ما را دنبال کنید:<br>
🔗 <a href="https://t.me/AI_RTL_ir" target="_blank">t.me/AI_RTL_ir</a>`,
        close: 'متوجه شدم',
        support: 'حمایت از اکستنشن',
        language: 'تغییر زبان',
    },
    en: {
        version: 'Version {version}',
        title: 'The extension updated successfully',
        versionChanges: 'Changes in this version',
        menuChanges: 'Extension menu changes',
        updatedSites: 'Updated sites',
        addedSites: 'New sites',
        siteCount: '{count} sites',
        noteLabel: 'Note:',
        noteBody: 'New sites are off by default. Turn them on from the extension menu.',
        storySummary: 'Why did the extension name change?',
        storyHtml: `We are back, with a new name and logo. 🚀<br><br>
If you noticed we were away for a short while, it was because OpenAI complained about the ChatGPT name. That forced us to change the extension’s name and logo.<br><br>
At the start, this extension was only meant to make ChatGPT easier to use. Over time, and because you asked, we added other AI sites too. We had forgotten to update the name, and we did not expect this problem.<br><br>
We are back, stronger than before. Please remember the new name and logo so you can still find us: <strong>AI RTL (Persian/Farsi)</strong><br><br>
📢 Follow our Telegram channel for news and the next updates:<br>
🔗 <a href="https://t.me/AI_RTL_ir" target="_blank">t.me/AI_RTL_ir</a>`,
        close: 'Got it',
        support: 'Support the extension',
        language: 'Change language',
    },
    ar: {
        version: 'الإصدار {version}',
        title: 'تم تحديث الإضافة بنجاح',
        versionChanges: 'تغييرات هذا الإصدار',
        menuChanges: 'تغييرات قائمة الإضافة',
        updatedSites: 'المواقع المحدّثة',
        addedSites: 'المواقع الجديدة',
        siteCount: '{count} موقع',
        noteLabel: 'تنبيه:',
        noteBody: 'المواقع الجديدة متوقفة افتراضيًا، ويمكن تفعيلها من قائمة الإضافة.',
        storySummary: 'لماذا تغيّر اسم الإضافة؟',
        storyHtml: `عدنا، لكن باسم وشعار جديدين! 🚀<br><br>
إذا لاحظتم غيابنا لفترة قصيرة، فالسبب شكوى من OpenAI على اسم ChatGPT. اضطررنا لذلك إلى تغيير اسم الإضافة وشعارها.<br><br>
في البداية صُممت هذه الإضافة فقط لتسهيل استخدام ChatGPT، ثم أضفنا مع الوقت وبطلب منكم دعم مواقع ذكاء اصطناعي أخرى. نسينا تحديث الاسم، ولم نتوقع أن نواجه هذه المشكلة.<br><br>
عدنا الآن أقوى من قبل. احفظوا الاسم والشعار الجديدين حتى لا تضيعوا عنا: <strong>AI RTL (Persian/Farsi)</strong><br><br>
📢 لمتابعة آخر الأخبار والتحديثات، تابعوا قناتنا على تلغرام:<br>
🔗 <a href="https://t.me/AI_RTL_ir" target="_blank">t.me/AI_RTL_ir</a>`,
        close: 'فهمت',
        support: 'ادعم الإضافة',
        language: 'تغيير اللغة',
    },
};

const ITEMS = {
    en: {
        '1': { text: 'ChatGPT update', note: 'The extension now matches the latest version, and issues are fixed' },
        '2': { text: 'Claude update', note: 'Better performance, updated code blocks, and right-to-left questions' },
        '12': { text: 'DeepSeek update', note: 'Fixed scrolling in right-to-left tables' },
        '13': { text: 'Z.ai update', note: 'Performance improvements' },
        '5': { text: 'The extension interface was improved and updated' },
        '6': { text: 'The extension menu is now multilingual: Persian, English, and Arabic' },
        '7': {
            text: 'YouTube added',
            short: 'YouTube',
            details: [
                'Right-to-left for YouTube’s AI',
                'Smart right-to-left for subtitles',
                'Settings made for YouTube',
                'Apply a font across YouTube',
            ],
        },
        '8': { text: 'Notta Brain added', note: 'Right-to-left for Notta Brain chat', short: 'Notta Brain' },
        '9': { text: 'Roboflow added', short: 'Roboflow' },
        '10': { text: 'CodeCraft API added', short: 'CodeCraft API' },
        '11': { text: 'DeepSeek Harness added', note: 'Right-to-left for the local harness on port 3080', short: 'DeepSeek Harness' },
    },
    ar: {
        '1': { text: 'تحديث ChatGPT', note: 'توافق الإضافة مع آخر إصدار وإصلاح المشكلات' },
        '2': { text: 'تحديث Claude', note: 'تحسين الأداء، وتحديث صناديق الكود، وجعل الأسئلة من اليمين إلى اليسار' },
        '12': { text: 'تحديث DeepSeek', note: 'إصلاح تمرير الجداول ذات الاتجاه من اليمين إلى اليسار' },
        '13': { text: 'تحديث Z.ai', note: 'تحسين الأداء' },
        '5': { text: 'تحسين وتحديث واجهة الإضافة' },
        '6': { text: 'أصبحت قائمة الإضافة متعددة اللغات: الفارسية والإنجليزية والعربية' },
        '7': {
            text: 'إضافة موقع YouTube',
            short: 'YouTube',
            details: [
                'اتجاه ذكاء يوتيوب من اليمين إلى اليسار',
                'اتجاه ذكي لترجمة الشاشة',
                'إعدادات خاصة بيوتيوب',
                'إمكانية تطبيق الخط على يوتيوب كله',
            ],
        },
        '8': { text: 'إضافة موقع Notta Brain', note: 'اتجاه محادثة Notta Brain من اليمين إلى اليسار', short: 'Notta Brain' },
        '9': { text: 'إضافة موقع Roboflow', short: 'Roboflow' },
        '10': { text: 'إضافة موقع CodeCraft API', short: 'CodeCraft API' },
        '11': { text: 'إضافة موقع DeepSeek Harness', note: 'اتجاه Harness المحلي على المنفذ ٣٠٨٠ من اليمين إلى اليسار', short: 'DeepSeek Harness' },
    },
};

export function normalizeUpdateLocale(value) {
    return UPDATE_MODAL_LOCALES.some((item) => item.code === value) ? value : 'fa';
}

export function getUpdateModalLocale(code) {
    const locale = normalizeUpdateLocale(code);
    return UPDATE_MODAL_LOCALES.find((item) => item.code === locale);
}

export function getUpdateModalCopy(code) {
    const locale = normalizeUpdateLocale(code);
    return UI[locale];
}

export function localizeVersionChange(change, code) {
    const locale = normalizeUpdateLocale(code);
    const item = locale === 'fa' ? null : ITEMS[locale]?.[change?.id];
    if (!item) {
        return change;
    }
    return {
        ...change,
        text: item.text || change.text,
        note: item.note,
        details: item.details || change.details,
        shortName: item.short || change.shortName,
    };
}
