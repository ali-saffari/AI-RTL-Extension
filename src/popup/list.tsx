import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Switch,
    Avatar,
    Divider,
    ListItemButton,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    useTheme,
    SvgIcon,
    Box,
    Paper,
} from '@mui/material';
import { mdiInformationOutline, mdiOpenInNew, mdiMagnify, mdiClose, mdiChatOutline, mdiBookSearchOutline, mdiCodeTags, mdiImageMultipleOutline, mdiBriefcaseOutline, mdiDotsGrid } from '@mdi/js';
import { DYNAMIC_SERVICES } from '../constants/dynamicServices';
import { sendRuntimeMessage, sendTabMessage } from '../utils/chromeMessaging.js';
import { hasHostPermission, hasServicePermissions } from '../utils/hasHostPermission';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { getDefaultPinOpenSiteMode, isPinOpenSiteEnabled, PinOpenSiteMode } from '../utils/pinOpenSite';
import SitePermissionsHint from './SitePermissionsHint';

interface Service {
    key: string;
    name: string;
    icon: string;
    url: string;
    helpText?: string;
    new?: boolean;
    keywords?: string[];
    hosts?: string[];
}

interface CheckedState {
    [key: string]: boolean;
}

const toPersianDigits = (value: number) => value.toLocaleString('fa-IR');

const normalizeHost = (hostname: string) => hostname.replace(/^www\./, '').toLowerCase();

const hostMatches = (tabHost: string, serviceHost: string) => {
    const a = normalizeHost(tabHost);
    const b = normalizeHost(serviceHost);
    return a === b || a.endsWith('.' + b);
};

const EDGE_BLOCKED_SERVICE_KEYS = new Set(['copilot', 'm365']);

const getServiceHosts = (service: Service) => {
    const hosts = new Set<string>();
    try {
        hosts.add(normalizeHost(new URL(service.url).hostname));
    } catch {
        // Ignore invalid service URLs
    }
    (service.hosts || []).forEach((host) => hosts.add(normalizeHost(host)));
    return Array.from(hosts);
};

const services: Service[] = [

    { key: 'chatGpt', name: 'ChatGPT', icon: '/images/sites/openAi-icon.png', url: 'https://chatgpt.com/', hosts: ['chatgpt.com', 'chat.openai.com'], keywords: ['chatgpt', 'gpt', 'openai', 'چت جی پی تی', 'چت جی‌پی‌تی', 'چت‌جی‌پی‌تی', 'اوپن ای آی', 'اوپنای'] },
    { key: 'deepseek', name: 'DeepSeek', icon: '/images/sites/deepseek.jpg', url: 'https://chat.deepseek.com', hosts: ['chat.deepseek.com'], keywords: ['deepseek', 'دیپ سیک', 'دیپ‌سیک', 'دیپسیک'] },
    { key: 'copilot', name: 'Copilot', icon: '/images/sites/copilot-icon.png', url: 'https://copilot.microsoft.com/', hosts: ['copilot.microsoft.com', 'bing.com'], helpText: 'در مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت از جمله <strong>Copilot</strong> کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی Copilot، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.', keywords: ['copilot', 'کوپایلوت', 'کوپایلت', 'bing', 'بینگ', 'مایکروسافت', 'microsoft'] },
    { key: 'm365', name: '365 Copilot', icon: '/images/sites/m365.png', url: 'https://m365.cloud.microsoft/', new: true, hosts: ['m365.cloud.microsoft', 'copilot.cloud.microsoft'], helpText: 'در مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت از جمله <strong>Microsoft 365 Copilot</strong> کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی این سایت، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.', keywords: ['m365', 'microsoft 365', 'مایکروسافت 365', 'کوپایلوت', 'copilot', 'آفیس', 'office', 'outlook', 'teams'] },
    { key: 'claude', name: 'Claude', icon: '/images/sites/claude-icon.png', url: 'https://claude.ai', hosts: ['claude.ai'], keywords: ['claude', 'کلود', 'anthropic', 'انتروپیک'] },
    { key: 'gemini', name: 'Gemini', icon: '/images/sites/Gemini.png', url: 'https://gemini.google.com/', hosts: ['gemini.google.com'], keywords: ['gemini', 'جمینی', 'bard', 'بارد', 'گوگل', 'google'] },
    // { key: 'google', name: 'Google AI Mode', icon: '/images/sites/google.png', url: 'https://google.com/', new: true },
    { key: 'businessGemini', name: 'Business Gemini', icon: '/images/sites/Gemini.png', url: 'https://business.gemini.google/', hosts: ['business.gemini.google'], helpText: 'این سایت به دلیل نوع طراحی و ساخت آن ممکن است کمی لگ احساس کنید. این کندی ارتباطی با این افزونه ندارد و به دلیل ساختار پیچیده و نحوه رندر شدن صفحه توسط خود سایت است.', keywords: ['gemini', 'جمینی', 'بیزینس', 'workspace', 'گوگل', 'google'] },
    { key: 'perplexity', name: 'Perplexity', icon: '/images/sites/perplexity.png', url: 'https://perplexity.ai', hosts: ['perplexity.ai'], keywords: ['perplexity', 'پرپلکسیتی', 'پرپلکسی', 'سرچ', 'جستجو'] },
    { key: 'aiStudio', name: 'Ai Studio', icon: '/images/sites/aistudio.png', url: 'https://aistudio.google.com/', hosts: ['aistudio.google.com'], helpText: 'این سایت به دلیل نوع طراحی و ساخت آن ممکن است روند بهینه‌سازی متن‌ها برای فارسی با لگ مواجه شود. همچنین در موقع اسکرول کردن هم این تجربه را احساس خواهید کرد. این مشکلات به دلیل ساختار پیچیده سایت و نحوه رندر شدن صفحه توسط خود سایت است.', keywords: ['aistudio', 'ai studio', 'ای استودیو', 'ای‌استودیو', 'گوگل', 'google'] },
    { key: 'googleNotebook', name: 'Google Notebook', icon: '/images/sites/notebooklm.png', url: 'https://notebook.google.com/?hl=fa', hosts: ['notebook.google.com', 'notebooklm.google.com', 'usercontent.goog'], keywords: ['notebooklm', 'notebook', 'نوت بوک', 'نوتبوک', 'نوت‌بوک', 'گوگل'] },
    { key: 'googleLabs', name: 'Google Labs (Flow)', icon: '/images/sites/labs-google.png', url: 'https://labs.google/', new: true, hosts: ['labs.google'], keywords: ['labs', 'flow', 'فلو', 'لبز', 'گوگل لبز', 'whisk', 'ویدیو'] },
    { key: 'googleDrive', name: 'Google Drive', icon: '/images/sites/google-docs.png', url: 'https://drive.google.com/', new: true, hosts: ['docs.google.com', 'drive.google.com', 'sheets.google.com', 'slides.google.com', 'forms.google.com'], helpText: 'با فعال‌سازی این گزینه، راست‌چین برای <strong>جمینی در گوگل درایو</strong> فعال می‌شود. این سرویس شامل Drive، Docs، Sheets، Slides و Forms است.', keywords: ['docs', 'drive', 'sheets', 'slides', 'forms', 'گوگل درایو', 'گوگل داکس', 'گوگل داکز', 'جمینی', 'gemini', 'workspace', 'فایل'] },
    { key: 'googleAnalytics', name: 'Google Analytics', icon: '/images/sites/google-analytics.png', url: 'https://analytics.google.com/', new: true, hosts: ['analytics.google.com'], keywords: ['analytics', 'آنالیتیکس', 'آنالیتیک', 'ga4', 'گوگل آنالیتیکس', 'گوگل', 'google'] },
    { key: 'youtubeStudio', name: 'YouTube Studio', icon: '/images/sites/youtube-studio.png', url: 'https://studio.youtube.com/', new: true, hosts: ['studio.youtube.com'], keywords: ['youtube', 'یوتیوب', 'studio', 'استودیو', 'یوتوب'] },
    { key: 'meta', name: 'Meta AI', icon: '/images/sites/meta.png', url: 'https://www.meta.ai/', new: true, hosts: ['meta.ai'], keywords: ['meta', 'متا', 'llama', 'لاما', 'facebook', 'فیسبوک', 'instagram'] },
    { key: 'grok', name: 'Grok', icon: '/images/sites/gork.png', url: 'https://grok.com/', hosts: ['grok.com'], keywords: ['grok', 'گروک', 'xai', 'ایکس ای آی', 'توییتر', 'twitter', 'ایلان'] },
    { key: 'qwenlm', name: 'QWEN CHAT', icon: '/images/sites/qwen.png', url: 'https://chat.qwen.ai', hosts: ['chat.qwen.ai', 'chat.qwenlm.ai'], keywords: ['qwen', 'کوئن', 'alibaba', 'علی بابا', 'علی‌بابا', 'tongyi'] },
    { key: 'qwenCoder', name: 'QWEN CODER', icon: '/images/sites/qwen.png', url: 'https://coder.qwen.ai/', new: true, hosts: ['coder.qwen.ai'], keywords: ['qwen', 'کوئن', 'coder', 'کدر', 'کد', 'alibaba', 'علی بابا', 'علی‌بابا'] },
    { key: 'kimi', name: 'Kimi', icon: '/images/sites/kimi.png', url: 'https://www.kimi.ai/', hosts: ['kimi.ai', 'kimi.com'], keywords: ['kimi', 'کیمی', 'moonshot', 'k2'] },
    { key: 'openrouter', name: 'OpenRouter', icon: '/images/sites/openrouter.png', url: 'https://openrouter.ai/', hosts: ['openrouter.ai'], keywords: ['openrouter', 'اوپن روتر', 'اوپن‌روتر'] },
    { key: 'zai', name: 'Z.ai', icon: '/images/sites/z.ai.png', url: 'https://chat.z.ai/', hosts: ['chat.z.ai'], keywords: ['z.ai', 'zai', 'glm', 'zhipu', 'زی آی', 'زی‌ای'] },
    { key: 'githubCopilot', name: 'GitHub Copilot', icon: '/images/sites/GithubCopilot.png', url: 'https://github.com/copilot', hosts: ['github.com'], keywords: ['github', 'گیت هاب', 'گیت‌هاب', 'کوپایلوت', 'copilot'] },
    { key: 'minimax', name: 'Minimax', icon: '/images/sites/minimax.png', url: 'https://agent.minimax.io/', hosts: ['agent.minimax.io'], keywords: ['minimax', 'مینی مکس', 'مینی‌مکس'] },
    // { key: 'duckduckgo', name: 'DuckDuckGo AI', icon: '/images/sites/duckduckgo.png', url: 'https://duckduckgo.com/aichat', hosts: ['duckduckgo.com'], keywords: ['duckduckgo', 'داک داک گو', 'داک‌داک‌گو', 'داکداکگو'] },
    { key: 'youCom', name: 'you.com', icon: '/images/sites/you com.jpg', url: 'https://you.com', hosts: ['you.com'], helpText: 'این سرویس رایگان نیست و به‌خاطر دسترسی محدود ما، ممکن است افزونه روی همه بخش‌های آن به‌خوبی کار نکند. اگر مشکلی دیدید، به <strong>پشتیبانی</strong> پیام بدهید تا آن را اصلاح کنیم.', keywords: ['you', 'یو'] },
    { key: 'poeCom', name: 'poe.com', icon: '/images/sites/poe.png', url: 'https://poe.com/', hosts: ['poe.com'], keywords: ['poe', 'پو', 'quora'] },
    { key: 'monica', name: 'Monica', icon: '/images/sites/monica.png', url: 'https://monica.im/', hosts: ['monica.im'], keywords: ['monica', 'مونیکا'] },
    { key: 'mistral', name: 'Mistral', icon: '/images/sites/chat-mistral.png', url: 'https://chat.mistral.ai', hosts: ['chat.mistral.ai'], keywords: ['mistral', 'میسترال', 'le chat'] },
    { key: 'manus', name: 'Manus', icon: '/images/sites/manus.png', url: 'https://manus.im/', hosts: ['manus.im'], keywords: ['manus', 'مانوس'] },
    { key: 'blackbox', name: 'Black Box', icon: '/images/sites/blackbox.png', url: 'https://www.blackbox.ai/', hosts: ['blackbox.ai'], keywords: ['blackbox', 'بلک باکس', 'بلک‌باکس', 'کد'] },
    { key: 'oneMinai', name: '1min.AI', icon: '/images/sites/1minai.png', url: 'https://app.1min.ai/', hosts: ['1min.ai', 'app.1min.ai'], keywords: ['1min', 'وان مین', 'وان‌مین'] },
    { key: 'digen', name: 'Digen', icon: '/images/sites/digen.png', url: 'https://agent.digen.ai/', hosts: ['digen.ai', 'agent.digen.ai'], keywords: ['digen', 'دیجن'] },
    { key: 'jules', name: 'Google Jules', icon: '/images/sites/jules.png', url: 'https://jules.google.com/', hosts: ['jules.google.com'], keywords: ['jules', 'جولز', 'گوگل', 'کد'] },
    { key: 'writesonic', name: 'Writesonic (Chatsonic)', icon: '/images/sites/writesonic.png', url: 'https://app.writesonic.com/chat/', hosts: ['app.writesonic.com'], helpText: 'این سرویس رایگان نیست و به‌خاطر دسترسی محدود ما، ممکن است افزونه روی همه بخش‌های آن به‌خوبی کار نکند. اگر مشکلی دیدید، به <strong>پشتیبانی</strong> پیام بدهید تا آن را اصلاح کنیم.', keywords: ['writesonic', 'chatsonic', 'رایتسونیک', 'چت سونیک', 'چت‌سونیک'] },
    { key: 'lovable', name: 'Lovable', icon: '/images/sites/lovable.png', url: 'https://lovable.dev/', hosts: ['lovable.dev'], keywords: ['lovable', 'لاوبل', 'لاوابل', 'کد'] },
    { key: 'ernie', name: 'Ernie (Baidu)', icon: '/images/sites/ernie.png', url: 'https://wenxin.baidu.com/', hosts: ['ernie.baidu.com', 'wenxin.baidu.com', 'chat.baidu.com'], keywords: ['ernie', 'ارنی', 'baidu', 'بایدو', 'wenxin', 'ونشین'] },
    { key: 'gamma', name: 'Gamma', icon: '/images/sites/gama.png', url: 'https://gamma.app/', hosts: ['gamma.app'], keywords: ['gamma', 'گاما', 'ارائه', 'presentation', 'اسلاید'] },
    { key: 'synaps', name: 'Synaps', icon: '/images/sites/synaps.png', url: 'https://www.synaps.app/', hosts: ['synaps.app', 'my.synaps.app'], helpText: 'این سایت به دلیل انیمیشن‌های سنگین ممکن است برای شما با لگ باز شود. این کندی ارتباطی با این افزونه ندارد و به دلیل ساختار پیچیده و انیمیشن‌های سنگین خود سایت است.', keywords: ['synaps', 'سیناپس'] },
    { key: 'notion', name: 'Notion', icon: '/images/sites/notion.png', url: 'https://www.notion.so/', hosts: ['notion.so', 'notion.com', 'app.notion.com'], keywords: ['notion', 'نوشن'] },
    { key: 'genspark', name: 'Genspark', icon: '/images/sites/genspark.png', url: 'https://genspark.ai/', hosts: ['genspark.ai'], keywords: ['genspark', 'جن اسپارک', 'جن‌اسپارک'] },
    { key: 'arena', name: 'Arena', icon: '/images/sites/arena.png', url: 'https://arena.ai/', hosts: ['arena.ai', 'lmarena.ai'], keywords: ['arena', 'آرنا', 'lmsys', 'lmarena'] },
    { key: 'duckai', name: 'Duck AI', icon: '/images/sites/duckduckgo.png', url: 'https://duck.ai/', hosts: ['duck.ai'], keywords: ['duck', 'داک', 'duck.ai'] },
    { key: 'clickup', name: 'ClickUp', icon: '/images/sites/clickup.png', url: 'https://app.clickup.com/', hosts: ['app.clickup.com'], keywords: ['clickup', 'کلیک آپ', 'کلیک‌آپ'] },
    { key: 't3chat', name: 'T3 Chat', icon: '/images/sites/t3-chat.png', url: 'https://t3.chat/', hosts: ['t3.chat'], keywords: ['t3', 'تی تری', 'تی‌تری', 'theo'] },
    { key: 'vivado', name: 'Vivado AMD', icon: '/images/sites/vivado.png', url: 'https://vivado.amd.com/chat', hosts: ['vivado.amd.com'], keywords: ['vivado', 'ویوادو', 'amd'] },
    { key: 'atxp', name: 'ATXP Chat', icon: '/images/sites/atxp.png', url: 'https://chat.atxp.ai/', hosts: ['chat.atxp.ai'], keywords: ['atxp'] },
    { key: 'consensus', name: 'Consensus', icon: '/images/sites/consensus.png', url: 'https://consensus.app/', hosts: ['consensus.app'], keywords: ['consensus', 'کنسنسوس', 'مقاله', 'پژوهش', 'paper', 'research'] },
    { key: 'scispace', name: 'SciSpace', icon: '/images/sites/scispace.png', url: 'https://scispace.com/', hosts: ['scispace.com'], keywords: ['scispace', 'سای اسپیس', 'سای‌اسپیس', 'مقاله', 'پژوهش', 'paper'] },
    { key: 'elicit', name: 'Elicit', icon: '/images/sites/elicit.png', url: 'https://elicit.com/', new: true, hosts: ['elicit.com'], keywords: ['elicit', 'الیسیت', 'مقاله', 'پژوهش', 'paper', 'research', 'علمی'] },
    { key: 'longcat', name: 'LongCat', icon: '/images/sites/longcat.png', url: 'https://longcat.ai/chat/', new: true, hosts: ['longcat.ai', 'longcat.chat'], keywords: ['longcat', 'لانگ کت', 'لانگ‌کت', 'لانگکت', 'meituan', 'میتوان'] },
    { key: 'mathgpt', name: 'MathGPT', icon: '/images/sites/mathgpt.png', url: 'https://math-gpt.org/', new: true, hosts: ['math-gpt.org'], keywords: ['mathgpt', 'math gpt', 'math-gpt', 'مث جی‌پی‌تی', 'مث جی پی تی', 'ریاضی'] },
    { key: 'chatboxai', name: 'Chatbox AI', icon: '/images/sites/chatboxai.png', url: 'https://web.chatboxai.app/', hosts: ['web.chatboxai.app'], keywords: ['chatbox', 'چت باکس', 'چت‌باکس'] },
    { key: 'lumo', name: 'Lumo', icon: '/images/sites/lumo-proton.png', url: 'https://lumo.proton.me/', hosts: ['lumo.proton.me'], keywords: ['lumo', 'لومو', 'proton', 'پروتون'] },
    { key: 'veo3', name: 'Veo 3', icon: '/images/sites/veo3.png', url: 'https://www-veo3.com/', hosts: ['www-veo3.com'], keywords: ['veo', 'وئو', 'ویدیو', 'video', 'گوگل'] },
    { key: 'fal', name: 'fal.ai', icon: '/images/sites/fal.png', url: 'https://fal.ai/', new: true, hosts: ['fal.ai'], helpText: 'ما به نسخه پولی این ابزار دسترسی نداشتیم، بنابراین امکان فعال‌سازی راست‌چین برای همه بخش‌های آن وجود نداشت. اگر به نسخه پولی دسترسی دارید، می‌توانید به <strong>پشتیبانی</strong> پیام بدهید تا بخش‌هایی که هنوز فعال نشده‌اند را هم فعال کنیم.', keywords: ['fal', 'فال', 'تصویر', 'image', 'video', 'ویدیو'] },
    { key: 'bfl', name: 'Black Forest', icon: '/images/sites/bfl.png', url: 'https://bfl.ai/', new: true, hosts: ['bfl.ai'], keywords: ['bfl', 'flux', 'بلک فارست', 'بلک‌فارست', 'فلوکس', 'تصویر', 'image'] },
    { key: 'characterAi', name: 'Character.AI', icon: '/images/sites/character-ai.png', url: 'https://character.ai/', new: true, hosts: ['character.ai', 'c.ai'], keywords: ['character', 'کاراکتر', 'شخصیت', 'c.ai'] },
    { key: 'pi', name: 'Pi', icon: '/images/sites/pi.png', url: 'https://pi.ai/', new: true, hosts: ['pi.ai'], keywords: ['pi', 'پای', 'inflection'] },
    { key: 'cursor', name: 'Cursor', icon: '/images/sites/cursor.png', url: 'https://cursor.com/', new: true, hosts: ['cursor.com', 'docs.cursor.com'], keywords: ['cursor', 'کرسر', 'کورسر', 'کرسور', 'کد', 'ide', 'ادیتور'] },
    { key: 'typingmind', name: 'TypingMind', icon: '/images/sites/typingmind.png', url: 'https://www.typingmind.com/', new: true, hosts: ['typingmind.com'], keywords: ['typingmind', 'تایپینگ مایند', 'تایپینگ‌مایند'] },
    { key: 'huggingface', name: 'Hugging Face', icon: '/images/sites/huggingface.png', url: 'https://huggingface.co/', new: true, hosts: ['huggingface.co', 'hf.co'], keywords: ['huggingface', 'هاگینگ فیس', 'هاگینگ‌فیس', 'hf', 'مدل'] },
    { key: 'dash0', name: 'Dash0', icon: '/images/sites/dash0.png', url: 'https://app.dash0.com/', new: true, hosts: ['dash0.com', 'app.dash0.com'], keywords: ['dash0', 'دش صفر', 'دش'] },
    { key: 'zerve', name: 'Zerve', icon: '/images/sites/zerve.png', url: 'https://app.zerve.ai/', new: true, hosts: ['zerve.ai', 'app.zerve.ai'], keywords: ['zerve', 'زرو'] },
    { key: 'sakana', name: 'Sakana Chat', icon: '/images/sites/sakana.png', url: 'https://chat.sakana.ai/', new: true, hosts: ['chat.sakana.ai'], keywords: ['sakana', 'ساکانا', 'namazu', 'fugu', 'ژاپن', 'japan'] }
];


export { services };

const SERVICE_CATEGORIES = [
    { id: 'chat', title: 'گفتگوهای عمومی', icon: mdiChatOutline },
    { id: 'search', title: 'جستجو و پژوهش', icon: mdiBookSearchOutline },
    { id: 'coding', title: 'کدنویسی و توسعه', icon: mdiCodeTags },
    { id: 'media', title: 'تصویر، ویدیو و ارائه', icon: mdiImageMultipleOutline },
    { id: 'workspace', title: 'ابزارهای سازمانی', icon: mdiBriefcaseOutline },
    { id: 'other', title: 'چندمدله، ایجنت و سایر', icon: mdiDotsGrid },
] as const;

const CATEGORY_SERVICE_KEYS: Record<(typeof SERVICE_CATEGORIES)[number]['id'], string[]> = {
    chat: [
        'chatGpt', 'claude', 'gemini', 'businessGemini', 'copilot', 'deepseek', 'grok',
        'meta', 'mistral', 'kimi', 'qwenlm', 'zai', 'ernie', 'longcat', 'pi',
        'characterAi', 'lumo', 'sakana', 't3chat', 'atxp', 'duckai', // 'duckduckgo',
    ],
    search: [
        'perplexity', 'genspark', 'youCom', 'consensus', 'scispace', 'elicit',
        'mathgpt', 'googleNotebook',
    ],
    coding: [
        'githubCopilot', 'qwenCoder', 'blackbox', 'jules', 'lovable', 'cursor',
        'vivado', 'huggingface', 'aiStudio',
    ],
    media: ['googleLabs', 'veo3', 'fal', 'bfl', 'gamma'],
    workspace: [
        'googleDrive', 'googleAnalytics', 'youtubeStudio', 'm365', 'notion',
        'clickup', 'dash0',
    ],
    other: [
        'poeCom', 'openrouter', 'typingmind', 'chatboxai', 'arena', 'monica',
        'oneMinai', 'writesonic', 'manus', 'minimax', 'digen', 'synaps', 'zerve',
    ],
};

const SERVICE_CATEGORY_BY_KEY: Record<string, (typeof SERVICE_CATEGORIES)[number]['id']> = Object.fromEntries(
    Object.entries(CATEGORY_SERVICE_KEYS).flatMap(([categoryId, keys]) =>
        keys.map((key) => [key, categoryId])
    )
) as Record<string, (typeof SERVICE_CATEGORIES)[number]['id']>;

interface ServiceListProps {
    pinOpenSiteMode?: PinOpenSiteMode;
    extensionEnabled?: boolean;
}

export default function ServiceList({
    pinOpenSiteMode = getDefaultPinOpenSiteMode(),
    extensionEnabled = true,
}: ServiceListProps) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [checked, setChecked] = useState<CheckedState>({
        chatGpt: true,
        claude: true,
        copilot: true,
        githubCopilot: true,
        // duckduckgo: true,
        perplexity: true,
        aiStudio: true,
        deepseek: true,
        youCom: true,
        qwenlm: true,
        poeCom: true,
        monica: true,
        gemini: true,
        businessGemini: true,
        mistral: true,
        manus: true,
        kimi: true,
        blackbox: true,
        googleNotebook: false,
        zai: true,
        arena: false,
        openrouter: true,
        minimax: true,
        jules: true,
        oneMinai: true,
        digen: false,
        lovable: true,
        synaps: true,
        writesonic: true,
        ernie: true,
        gamma: true,
    });

    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [permissionServiceName, setPermissionServiceName] = useState<string>('');
    const [permissionServiceKey, setPermissionServiceKey] = useState<string>('');
    const [activeServiceKey, setActiveServiceKey] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPermissionsHint, setShowPermissionsHint] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const lovableItemRef = useRef<HTMLLIElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchStickySentinelRef = useRef<HTMLDivElement>(null);
    
    // Detect Edge browser
    const isEdge = navigator.userAgent.indexOf('Edg') > -1;
    
    // Get browser language and determine "Allow" button text
    const getAllowButtonText = () => {
        const browserLang = navigator.language || navigator.languages?.[0] || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        if (langCode === 'fa') {
            return 'اجازه دادن';
        } else if (langCode === 'ar') {
            return 'السماح';
        } else {
            return 'Allow';
        }
    };
    
    const allowButtonText = getAllowButtonText();

    const pinOpenSiteInList = isPinOpenSiteEnabled(pinOpenSiteMode);

    // Detect the currently open tab. Prefer tabs.query so the pin appears on first
    // popup open, without waiting for the background cache / content script.
    useEffect(() => {
        if (!pinOpenSiteInList) {
            setActiveServiceKey(null);
            return;
        }
        let isMounted = true;
        let applySeq = 0;

        const isHttpUrl = (url?: string) => Boolean(url && /^https?:/i.test(url));
        const isExtensionPage = (url?: string) =>
            Boolean(url && /^(moz-extension:|chrome-extension:|about:)/i.test(url));

        const findMatchingService = (hostname: string) => {
            const normalizedHostname = normalizeHost(hostname);
            return services.find((service) =>
                getServiceHosts(service).some((host) => hostMatches(normalizedHostname, host))
            ) || null;
        };

        const canShowInLimitedMode = async (service: Service) => {
            const dynamic = DYNAMIC_SERVICES[service.key as keyof typeof DYNAMIC_SERVICES];
            if (!dynamic?.origins) {
                return true;
            }
            return hasHostPermission(dynamic.origins);
        };

        const applyHostname = async (hostname?: string | null, clearIfMissing = false) => {
            const seq = ++applySeq;
            if (!isMounted) {
                return false;
            }
            if (!hostname) {
                if (clearIfMissing && seq === applySeq) {
                    setActiveServiceKey(null);
                }
                return false;
            }

            const service = findMatchingService(hostname);
            if (!service) {
                if (seq === applySeq) {
                    setActiveServiceKey(null);
                }
                return false;
            }

            if (pinOpenSiteMode === 'limited' && !(await canShowInLimitedMode(service))) {
                if (isMounted && seq === applySeq) {
                    setActiveServiceKey(null);
                }
                return false;
            }

            if (isMounted && seq === applySeq) {
                setActiveServiceKey(service.key);
            }
            return true;
        };

        const applyTabUrl = async (url?: string, clearIfMissing = false) => {
            if (!url || isExtensionPage(url)) {
                return false;
            }
            if (!isHttpUrl(url)) {
                return applyHostname(null, clearIfMissing);
            }
            return applyHostname(new URL(url).hostname, clearIfMissing);
        };

        const hostnameFromTabs = async (tabs?: chrome.tabs.Tab[], clearIfMissing = false) => {
            const url = (tabs || []).find((tab) => isHttpUrl(tab.url))?.url;
            return applyTabUrl(url, clearIfMissing);
        };

        // Without the tabs permission, missing tab.url only means the URL is hidden —
        // it is not proof that the page is chrome:// or otherwise restricted.
        const hasVisibleRestrictedUrl = (tabs?: chrome.tabs.Tab[]) => {
            return (tabs || []).some((tab) => {
                if (!tab.url || isExtensionPage(tab.url)) {
                    return false;
                }
                return !isHttpUrl(tab.url);
            });
        };

        const queryCandidateTabs = async () => {
            try {
                const focusedTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
                if (focusedTabs?.length) {
                    return focusedTabs;
                }
            } catch {
                // tabs.query can fail in some contexts
            }
            try {
                return await chrome.tabs.query({ active: true });
            } catch {
                return [];
            }
        };

        const hostnameFromContentScript = async (tabs?: chrome.tabs.Tab[]) => {
            for (const tab of tabs || []) {
                if (!tab.id || isExtensionPage(tab.url)) {
                    continue;
                }
                const pageInfo = await sendTabMessage(tab.id, { action: 'getPageInfo' });
                if (pageInfo?.success && pageInfo.hostname) {
                    return applyHostname(pageInfo.hostname);
                }
            }
            return false;
        };

        const detectFromTabs = async () => {
            try {
                const tabs = await queryCandidateTabs();
                if (await hostnameFromTabs(tabs)) {
                    return true;
                }
                if (hasVisibleRestrictedUrl(tabs)) {
                    setActiveServiceKey(null);
                    return true;
                }
                if (await hostnameFromContentScript(tabs)) {
                    return true;
                }
            } catch {
                // tabs permission may be missing in Chrome
            }
            return false;
        };

        const detectFromTabId = async (tabId?: number) => {
            if (!tabId || !chrome.tabs?.get) {
                return detectFromTabs();
            }
            try {
                const tab = await chrome.tabs.get(tabId);
                if (await applyTabUrl(tab?.url, true)) {
                    return true;
                }
            } catch {
                // Ignore
            }
            return detectFromTabs();
        };

        const detectFromBackground = () => {
            void sendRuntimeMessage({ action: 'getActiveTabInfo' }).then((response) => {
                if (!isMounted) {
                    return;
                }
                void applyHostname(response?.tabInfo?.hostname);
            });
        };

        const handleActiveTabUpdate = (message: any) => {
            if (!isMounted || !message) return;
            if (message.action === 'activeTabInfoUpdated') {
                void applyHostname(message.payload?.hostname);
            }
        };

        const runDetection = async (tabId?: number) => {
            const found = tabId
                ? await detectFromTabId(tabId)
                : await detectFromTabs();
            if (!isMounted || found) {
                return;
            }
            detectFromBackground();
        };

        const handleTabActivated = (activeInfo: { tabId?: number }) => {
            void runDetection(activeInfo?.tabId);
        };

        const handleTabUpdated = (
            tabId: number,
            changeInfo: { url?: string; status?: string },
            tab?: chrome.tabs.Tab
        ) => {
            if (!changeInfo?.url && changeInfo?.status !== 'complete') {
                return;
            }
            if (tab && tab.active === false) {
                return;
            }
            if (changeInfo.url) {
                void applyTabUrl(changeInfo.url, true);
                return;
            }
            void runDetection(tabId);
        };

        void runDetection();
        chrome.runtime.onMessage.addListener(handleActiveTabUpdate);

        try {
            chrome.tabs?.onActivated?.addListener(handleTabActivated);
            chrome.tabs?.onUpdated?.addListener(handleTabUpdated);
        } catch {
            // tabs permission may be missing in Chrome
        }

        const retryTimer = window.setTimeout(() => {
            void runDetection();
        }, 250);

        return () => {
            isMounted = false;
            window.clearTimeout(retryTimer);
            chrome.runtime.onMessage.removeListener(handleActiveTabUpdate);
            try {
                chrome.tabs?.onActivated?.removeListener(handleTabActivated);
                chrome.tabs?.onUpdated?.removeListener(handleTabUpdated);
            } catch {
                // Ignore
            }
        };
    }, [pinOpenSiteInList, pinOpenSiteMode]);

    useEffect(() => {
        try {
            chrome.storage.sync.get(
                services.map(service => service.key),
                async (data) => {
                    const updatedData = { ...data };
                    // If Edge, force Microsoft sites to be disabled
                    if (isEdge) {
                        updatedData.copilot = false;
                        updatedData.m365 = false;
                        chrome.storage.sync.set({ copilot: false, m365: false });
                    }

                    if (!isFirefoxRuntime()) {
                        const storageFixes: CheckedState = {};
                        for (const key of Object.keys(DYNAMIC_SERVICES)) {
                            if (updatedData[key] !== true) {
                                continue;
                            }
                            const service = DYNAMIC_SERVICES[key as keyof typeof DYNAMIC_SERVICES];
                            if (!service?.origins) {
                                continue;
                            }
                            if (!(await hasServicePermissions(service.origins))) {
                                updatedData[key] = false;
                                storageFixes[key] = false;
                            }
                        }
                        if (Object.keys(storageFixes).length) {
                            chrome.storage.sync.set(storageFixes);
                        }
                    }

                    setChecked(updatedData);
                }
            );
        } catch (error) {
            // Extension context invalidated or other error - use default values
            // If Edge, ensure Microsoft sites are disabled
            if (isEdge) {
                setChecked(prev => ({ ...prev, copilot: false, m365: false }));
            }
        }
    }, [isEdge]);

    // Get list of dynamic service keys
    const dynamicServices = Object.keys(DYNAMIC_SERVICES);

    const handleChange = (key: string) => async (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        // Prevent enabling Microsoft sites in Edge
        if (isEdge && EDGE_BLOCKED_SERVICE_KEYS.has(key)) {
            return;
        }
        
        // Firefox already has <all_urls> in the manifest — no Chrome-style permission prompt
        if (checked && dynamicServices.includes(key) && !isFirefoxRuntime()) {
            const service = DYNAMIC_SERVICES[key as keyof typeof DYNAMIC_SERVICES];
            if (service && service.origins) {
                const origins = service.origins;
                try {
                    if (!(await hasServicePermissions(origins))) {
                        // Show permission dialog
                        const serviceName = services.find(s => s.key === key)?.name || key;
                        setPermissionServiceName(serviceName);
                        setPermissionServiceKey(key);
                        setPermissionModalOpen(true);
                        // Don't enable the service
                        return;
                    }
                } catch (error) {
                    alert(`خطا در بررسی مجوزها برای ${services.find(s => s.key === key)?.name}`);
                    return;
                }
            }
        }
        
        try {
            const storageUpdate = { [key]: checked };
            if (key === 'googleNotebook' && checked) {
                storageUpdate.notebookNeedsReenable = false;
            }
            chrome.storage.sync.set(storageUpdate);
        } catch (error) {
            // Silently handle save errors
        }
        setChecked(prev => ({ ...prev, [key]: checked }));
    };


    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const sentinel = searchStickySentinelRef.current;
        const listEl = listRef.current;
        const scrollRoot = document.querySelector('.popup-main');
        if (!sentinel || !listEl || !scrollRoot) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                listEl.classList.toggle('service-list--search-stuck', !entry.isIntersecting);
            },
            {
                root: scrollRoot,
                threshold: 0,
                rootMargin: '-48px 0px 0px 0px',
            }
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
        };
    }, []);

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const matchesSearch = (service: Service, query: string) => {
        const normalizedQuery = query.trim().toLowerCase().replace(/\u200c/g, '');
        if (!normalizedQuery) {
            return true;
        }

        let hostname = '';
        try {
            hostname = normalizeHost(new URL(service.url).hostname);
        } catch {
            hostname = '';
        }

        const searchableText = [
            service.name,
            service.key,
            service.url,
            hostname,
            ...(service.hosts || []),
            ...(service.keywords || []),
        ]
            .join(' ')
            .toLowerCase()
            .replace(/\u200c/g, '');

        return searchableText.includes(normalizedQuery);
    };

    const filteredServices = useMemo(() => {
        const categoryIndex = new Map(SERVICE_CATEGORIES.map((category, index) => [category.id, index]));
        return services
            .filter(service => matchesSearch(service, searchQuery))
            .sort((a, b) => {
                const categoryA = SERVICE_CATEGORY_BY_KEY[a.key] || 'other';
                const categoryB = SERVICE_CATEGORY_BY_KEY[b.key] || 'other';
                const categoryDiff = (categoryIndex.get(categoryA) ?? 99) - (categoryIndex.get(categoryB) ?? 99);
                if (categoryDiff !== 0) {
                    return categoryDiff;
                }
                const keys = CATEGORY_SERVICE_KEYS[categoryA] || [];
                return keys.indexOf(a.key) - keys.indexOf(b.key);
            });
    }, [searchQuery]);

    // Get active service for display at top
    const activeService = React.useMemo(() => {
        if (!activeServiceKey) {
            return null;
        }
        return services.find(s => s.key === activeServiceKey) || null;
    }, [activeServiceKey]);

    const listItems = useMemo(() => {
        const items: Array<{ service: Service; pinned: boolean }> = filteredServices
            .map((service) => ({
                service,
                pinned: false,
            }));

        if (pinOpenSiteInList && activeService && matchesSearch(activeService, searchQuery)) {
            items.unshift({ service: activeService, pinned: true });
        }

        return items;
    }, [filteredServices, activeService, searchQuery, pinOpenSiteInList]);

    const groupedList = useMemo(() => {
        const pinnedItems = listItems.filter((item) => item.pinned);
        const groups = SERVICE_CATEGORIES
            .map((category) => ({
                ...category,
                items: listItems.filter((item) =>
                    !item.pinned && (SERVICE_CATEGORY_BY_KEY[item.service.key] || 'other') === category.id
                ),
            }))
            .filter((group) => group.items.length > 0);

        return { pinnedItems, groups };
    }, [listItems]);

    useEffect(() => {
        if (showPermissionsHint) {
            return;
        }

        const lovableInList = listItems.some((item) => !item.pinned && item.service.key === 'lovable');
        const scrollRoot = document.querySelector('.popup-main');

        if (!lovableInList || !scrollRoot) {
            return;
        }

        const updateHintVisibility = () => {
            const lovableEl = lovableItemRef.current;
            if (!lovableEl || searchQuery.trim()) {
                return;
            }

            const rootRect = scrollRoot.getBoundingClientRect();
            const lovableRect = lovableEl.getBoundingClientRect();
            if (lovableRect.top <= rootRect.bottom - 32) {
                setShowPermissionsHint(true);
            }
        };

        updateHintVisibility();
        scrollRoot.addEventListener('scroll', updateHintVisibility, { passive: true });
        window.addEventListener('resize', updateHintVisibility);

        return () => {
            scrollRoot.removeEventListener('scroll', updateHintVisibility);
            window.removeEventListener('resize', updateHintVisibility);
        };
    }, [listItems, searchQuery, showPermissionsHint]);

    const dividerColor = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#a2a2a2';
    const categoryStickyTop = groupedList.pinnedItems.length > 0
        ? 'calc(48px + var(--service-search-h, 48px) + var(--service-pinned-h, 56px))'
        : 'calc(48px + var(--service-search-h, 48px))';

    const renderServiceRow = (service: Service, pinned: boolean, showDivider: boolean) => {
        const isActive = service.key === activeServiceKey;
        return (
            <React.Fragment key={pinned ? `pinned-${service.key}` : service.key}>
                <ListItem
                    disablePadding
                    className={pinned ? 'service-list-pinned' : undefined}
                    ref={!pinned && service.key === 'lovable' ? lovableItemRef : undefined}
                    style={{ direction: 'ltr' }}
                    sx={pinned ? {
                        position: 'sticky',
                        top: 'calc(48px + var(--service-search-h, 48px))',
                        zIndex: 2,
                        backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                        boxShadow: 'none',
                        transition: 'none',
                    } : undefined}
                >
                    <ListItemButton
                        style={{ direction: 'ltr' }}
                        sx={pinned ? {
                            backgroundColor: isDarkMode
                                ? 'rgba(76, 175, 80, 0.16)'
                                : 'rgba(76, 175, 80, 0.1)',
                            '&:hover': {
                                backgroundColor: isDarkMode
                                    ? 'rgba(76, 175, 80, 0.24)'
                                    : 'rgba(76, 175, 80, 0.16)',
                            },
                        } : undefined}
                    >
                        <a href={service.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <Avatar
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        filter: extensionEnabled ? 'none' : 'grayscale(1)',
                                        opacity: extensionEnabled ? 1 : 0.55,
                                        transition: 'filter 0.2s ease, opacity 0.2s ease',
                                    }}
                                    alt={service.name}
                                    src={chrome.runtime.getURL(service.icon)}
                                />
                            </ListItemIcon>
                        </a>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <a href={service.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                                        <Typography sx={{
                                            color: isDarkMode ? '#ffffff' : '#000000',
                                            fontWeight: 500,
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}>
                                            {service.name}
                                        </Typography>
                                    </a>
                                    {!isActive && (
                                        <a href={service.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    p: 0.5,
                                                    color: 'text.primary',
                                                    opacity: 0.4,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        opacity: 1,
                                                        transform: 'scale(1.1)',
                                                        '& .MuiSvgIcon-root': {
                                                            color: '#ffffff'
                                                        }
                                                    }
                                                }}
                                            >
                                                <SvgIcon sx={{
                                                    fontSize: '1.15rem',
                                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                                                    transition: 'all 0.2s ease'
                                                }}>
                                                    <path d={mdiOpenInNew} />
                                                </SvgIcon>
                                            </IconButton>
                                        </a>
                                    )}
                                    {isActive && (
                                        <Box component="span" sx={{
                                            px: 1,
                                            py: 0.3,
                                            bgcolor: isDarkMode
                                                ? 'rgba(76, 175, 80, 0.2)'
                                                : 'rgba(76, 175, 80, 0.15)',
                                            border: `1px solid ${isDarkMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.4)'}`,
                                            color: isDarkMode ? '#4caf50' : '#2e7d32',
                                            borderRadius: 1,
                                            fontSize: '0.6rem',
                                            fontWeight: 600
                                        }}>
                                            باز
                                        </Box>
                                    )}
                                    {service.new && (
                                        <Box component="span" sx={{
                                            px: 1,
                                            py: 0.3,
                                            bgcolor: extensionEnabled
                                                ? (isDarkMode ? 'rgb(33, 46, 65)' : 'rgba(30, 64, 175, 0.1)')
                                                : (isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'),
                                            border: `1px solid ${
                                                extensionEnabled
                                                    ? (isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)')
                                                    : (isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.16)')
                                            }`,
                                            color: extensionEnabled
                                                ? (isDarkMode ? '#00e9ff' : '#1c39bb')
                                                : (isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.4)'),
                                            borderRadius: 1,
                                            fontSize: '0.6rem',
                                            fontWeight: 600,
                                            filter: extensionEnabled ? 'none' : 'grayscale(1)',
                                            transition: 'filter 0.2s ease, color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
                                        }}>
                                            جدید
                                        </Box>
                                    )}
                                </Box>
                            }
                        />

                        {service.helpText && !(isEdge && EDGE_BLOCKED_SERVICE_KEYS.has(service.key)) && (
                            <IconButton
                                size="small"
                                sx={{
                                    ml: 1,
                                    color: 'text.primary',
                                    opacity: 0.8,
                                    '&:hover': {
                                        opacity: 1,
                                        color: 'primary.main'
                                    }
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedService(service);
                                    setHelpModalOpen(true);
                                }}
                            >
                                <SvgIcon sx={{
                                    fontSize: '1.25rem',
                                    color: isDarkMode ? '#ffffff' : '#000000'
                                }}>
                                    <path d={mdiInformationOutline} />
                                </SvgIcon>
                            </IconButton>
                        )}

                        <Switch
                            edge="start"
                            onChange={handleChange(service.key)}
                            checked={checked?.[service.key] || false}
                            disabled={!extensionEnabled || (isEdge && EDGE_BLOCKED_SERVICE_KEYS.has(service.key))}
                            data-list-switch="true"
                            inputProps={{
                                'aria-labelledby': `switch-list-label-${service.key}`,
                            }}
                            sx={{
                                transform: 'rotate(180deg)',
                                '& .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled)': {
                                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled) + .MuiSwitch-track': {
                                    backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                },
                                '& .MuiSwitch-switchBase.Mui-disabled': {
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
                                },
                                '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                                    opacity: 1,
                                },
                                '& .Mui-disabled': {
                                    opacity: 0.5
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>
                {isEdge && EDGE_BLOCKED_SERVICE_KEYS.has(service.key) && (
                    <Box sx={{ px: 2, py: 1.5 }} style={{ direction: 'rtl' }}>
                        <Paper
                            elevation={0}
                            dir="rtl"
                            style={{ direction: 'rtl', textAlign: 'right' }}
                            sx={{
                                backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)',
                                border: `1px solid ${isDarkMode ? 'rgba(211, 47, 47, 0.4)' : 'rgba(211, 47, 47, 0.3)'}`,
                                borderRadius: 1,
                                p: 1.5,
                            }}
                        >
                            <Typography
                                dir="rtl"
                                style={{ direction: 'rtl', textAlign: 'right' }}
                                sx={{
                                    fontSize: '0.80rem',
                                    color: isDarkMode ? '#ffcdd2' : '#c62828',
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                }}
                            >
                                برای مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت (از جمله {service.name}) کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی {service.name}، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.
                            </Typography>
                        </Paper>
                    </Box>
                )}
                {showDivider && <Divider sx={{ borderColor: dividerColor }} />}
            </React.Fragment>
        );
    };

    return (
        <>
            <div ref={searchStickySentinelRef} className="service-list-search-sentinel" aria-hidden />
            <List
                ref={listRef}
                className="service-list"
                sx={{ width: '100%', backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff' }}
                style={{ direction: 'ltr' }}
                subheader={
                    <ListSubheader 
                        component="div" 
                        id="nested-list-subheader" 
                        className="service-list-search-slot"
                        sx={{ 
                            position: 'sticky',
                            top: 48,
                            zIndex: 3,
                            overflow: 'hidden',
                            boxSizing: 'border-box',
                            p: 0,
                            backgroundColor: 'transparent',
                            color: isDarkMode ? '#ffffff' : '#000000',
                        }}
                        style={{ direction: 'ltr' }}
                    >
                        <Box
                            className="service-list-search"
                            sx={{
                                textAlign: 'center',
                                position: 'relative',
                                backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                                borderBottom: `1px solid ${isDarkMode ?  'rgba(255, 255, 255, 0.12)' : '#a2a2a2'}`,
                            }}
                        >
                        {isSearchOpen ? (
                            <input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        closeSearch();
                                    }
                                }}
                                placeholder="جستجوی سایت..."
                                dir="rtl"
                                className="service-list-search-input"
                            />
                        ) : (
                            `تعداد کل: ${toPersianDigits(services.length)} | تعداد فعال: ${toPersianDigits(Object.values(checked).filter(Boolean).length)}`
                        )}
                        <Box
                            component="button"
                            type="button"
                            className="service-list-search-toggle"
                            onClick={isSearchOpen ? closeSearch : () => setIsSearchOpen(true)}
                            aria-label={isSearchOpen ? 'بستن جستجو' : 'جستجو'}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 0,
                                width: 28,
                                p: 0,
                                border: 0,
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                opacity: 0.55,
                                '&:hover': { opacity: 1 },
                            }}
                        >
                            <SvgIcon sx={{ fontSize: '1.15rem' }}>
                                <path d={isSearchOpen ? mdiClose : mdiMagnify} />
                            </SvgIcon>
                        </Box>
                        </Box>
                    </ListSubheader>
                }
            >
                {filteredServices.length === 0 && (
                    <Box sx={{ py: 4, px: 2, textAlign: 'center' }} style={{ direction: 'rtl' }}>
                        <Typography sx={{ fontSize: '0.85rem', opacity: 0.7 }}>
                            سایتی با این جستجو پیدا نشد
                        </Typography>
                    </Box>
                )}
                {groupedList.pinnedItems.map((item, index) =>
                    renderServiceRow(
                        item.service,
                        true,
                        index < groupedList.pinnedItems.length - 1 || groupedList.groups.length > 0
                    )
                )}
                {groupedList.groups.map((group) => (
                    <React.Fragment key={group.id}>
                        <ListSubheader
                            component="div"
                            style={{ direction: 'rtl' }}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 0.75,
                                position: 'sticky',
                                top: categoryStickyTop,
                                zIndex: 1,
                                height: 36,
                                minHeight: 36,
                                lineHeight: 1,
                                px: 2,
                                backgroundColor: isDarkMode ? '#262636' : '#f4f5f7',
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.82)' : 'rgba(0, 0, 0, 0.64)',
                                borderTop: `1px solid ${dividerColor}`,
                                borderBottom: `1px solid ${dividerColor}`,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                            }}
                        >
                            <SvgIcon sx={{ fontSize: '1rem', opacity: 0.8, display: 'block' }}>
                                <path d={group.icon} />
                            </SvgIcon>
                            <Box component="span" sx={{ lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                                {group.title}
                            </Box>
                            <Box
                                component="span"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 20,
                                    height: 18,
                                    px: 0.7,
                                    borderRadius: 1,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    bgcolor: extensionEnabled
                                        ? (isDarkMode ? 'rgba(0, 233, 255, 0.14)' : 'rgba(28, 57, 187, 0.1)')
                                        : (isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'),
                                    border: `1px solid ${
                                        extensionEnabled
                                            ? (isDarkMode ? 'rgba(0, 233, 255, 0.32)' : 'rgba(28, 57, 187, 0.28)')
                                            : (isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.16)')
                                    }`,
                                    color: extensionEnabled
                                        ? (isDarkMode ? '#00e9ff' : '#1c39bb')
                                        : (isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.4)'),
                                    filter: extensionEnabled ? 'none' : 'grayscale(1)',
                                    transition: 'filter 0.2s ease, color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
                                }}
                            >
                                {toPersianDigits(group.items.length)}
                            </Box>
                        </ListSubheader>
                        {group.items.map((item, index) =>
                            renderServiceRow(item.service, false, index < group.items.length - 1)
                        )}
                    </React.Fragment>
                ))}
            </List>


            <SitePermissionsHint
                visible={showPermissionsHint}
                isDarkMode={isDarkMode}
            />

            {/* Generic Help Modal */}
            <Dialog 
                open={helpModalOpen} 
                onClose={() => setHelpModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                    درباره {selectedService?.name}
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
                    <Typography 
                        variant="body1" 
                        paragraph 
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify' }}
                        dangerouslySetInnerHTML={{ __html: selectedService?.helpText || '' }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px' }}>
                    <Button 
                        onClick={() => setHelpModalOpen(false)}
                        variant="contained"
                        color="primary"
                    >
                        متوجه شدم
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permission Required Modal */}
            <Dialog 
                open={permissionModalOpen} 
                onClose={() => setPermissionModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                    نیاز به مجوز
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
                    <Typography 
                        variant="body1" 
                        paragraph 
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                    >
                        برای فعال کردن <strong>{permissionServiceName}</strong>، نیاز به مجوز دسترسی به این سایت دارید.
                    </Typography>
                    <Typography 
                        variant="body1" 
                        paragraph 
                        sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                    >
                        روی دکمه دریافت مجوز کلیک کنید. بعد از باز شدن صفحه دریافت مجوز، روی دکمه <strong>"{allowButtonText}"</strong> کلیک کنید. پس از تأیید، سایت به صورت خودکار فعال می‌شود.
                    </Typography>
                    <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify', lineHeight: 1.8 }}
                >
                    این مجوز برای اعمال تغییرات روی صفحه استفاده می‌شود.
                </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px' }}>
                <Button 
                        onClick={() => setPermissionModalOpen(false)}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan' }}
                    >
                        بستن
                    </Button>
                    <Button 
                        onClick={async () => {
                            try {
                                const key = permissionServiceKey;
                                const service = DYNAMIC_SERVICES[key as keyof typeof DYNAMIC_SERVICES];
                                const serviceInfo = services.find(s => s.key === key);
                                
                                if (!service || !service.origins || !serviceInfo) {
                                    setPermissionModalOpen(false);
                                    return;
                                }
                                
                                // Send message to background to request permissions and enable service
                                try {
                                    const response = await sendRuntimeMessage({
                                        action: 'requestPermissionsAndEnableService',
                                        serviceKey: key
                                    });
                                    
                                    if (response?.success) {
                                        setChecked(prev => ({ ...prev, [key]: true }));
                                        setPermissionModalOpen(false);
                                    } else if (response?.granted === false) {
                                        alert('مجوز داده نشد. لطفاً در تنظیمات افزونه مجوزها را فعال کنید.');
                                    } else if (response) {
                                        alert(response?.error || 'خطا در دریافت مجوز. لطفاً دوباره تلاش کنید.');
                                    }
                                } catch (error) {
                                    // Silently handle connection errors
                                }
                            } catch (error) {
                                alert('خطا در دریافت مجوز. لطفاً دوباره تلاش کنید.');
                            }
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan' }}
                    >
                        دریافت مجوز
                    </Button>
                
                </DialogActions>
            </Dialog>
        </>
    );
}
