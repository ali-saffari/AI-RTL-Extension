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
import { mdiInformationOutline, mdiOpenInNew, mdiMagnify, mdiClose } from '@mdi/js';
import { DYNAMIC_SERVICES } from '../constants/dynamicServices';

interface Service {
    key: string;
    name: string;
    icon: string;
    url: string;
    helpText?: string;
    new?: boolean;
    keywords?: string[];
}

interface CheckedState {
    [key: string]: boolean;
}

const services: Service[] = [

    { key: 'chatGpt', name: 'ChatGPT', icon: '/images/sites/openAi-icon.png', url: 'https://chatgpt.com/', keywords: ['chatgpt', 'gpt', 'openai', 'چت جی پی تی', 'چت جی‌پی‌تی', 'چت‌جی‌پی‌تی', 'اوپن ای آی', 'اوپنای'] },
    { key: 'deepseek', name: 'DeepSeek', icon: '/images/sites/deepseek.jpg', url: 'https://chat.deepseek.com', keywords: ['deepseek', 'دیپ سیک', 'دیپ‌سیک', 'دیپسیک'] },
    { key: 'copilot', name: 'Copilot', icon: '/images/sites/copilot-icon.png', url: 'https://www.bing.com/chat?setlang=fa', helpText: 'در مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت از جمله <strong>Copilot</strong> کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی Copilot، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.', keywords: ['copilot', 'کوپایلوت', 'کوپایلت', 'bing', 'بینگ', 'مایکروسافت', 'microsoft'] },
    { key: 'claude', name: 'Claude', icon: '/images/sites/claude-icon.png', url: 'https://claude.ai', keywords: ['claude', 'کلود', 'anthropic', 'انتروپیک'] },
    { key: 'gemini', name: 'Gemini', icon: '/images/sites/Gemini.png', url: 'https://gemini.google.com/', keywords: ['gemini', 'جمینی', 'bard', 'بارد', 'گوگل', 'google'] },
    // { key: 'google', name: 'Google AI Mode', icon: '/images/sites/google.png', url: 'https://google.com/', new: true },
    { key: 'businessGemini', name: 'Business Gemini', icon: '/images/sites/Gemini.png', url: 'https://business.gemini.google/', helpText: 'این سایت به دلیل نوع طراحی و ساخت آن ممکن است کمی لگ احساس کنید. این کندی ارتباطی با این افزونه ندارد و به دلیل ساختار پیچیده و نحوه رندر شدن صفحه توسط خود سایت است.', keywords: ['gemini', 'جمینی', 'بیزینس', 'workspace', 'گوگل', 'google'] },
    { key: 'perplexity', name: 'Perplexity', icon: '/images/sites/perplexity.png', url: 'https://perplexity.ai', keywords: ['perplexity', 'پرپلکسیتی', 'پرپلکسی', 'سرچ', 'جستجو'] },
    { key: 'aiStudio', name: 'Ai Studio', icon: '/images/sites/aistudio.png', url: 'https://aistudio.google.com/', helpText: 'این سایت به دلیل نوع طراحی و ساخت آن ممکن است روند بهینه‌سازی متن‌ها برای فارسی با لگ مواجه شود. همچنین در موقع اسکرول کردن هم این تجربه را احساس خواهید کرد. این مشکلات به دلیل ساختار پیچیده سایت و نحوه رندر شدن صفحه توسط خود سایت است.', keywords: ['aistudio', 'ai studio', 'ای استودیو', 'ای‌استودیو', 'گوگل', 'google'] },
    { key: 'googleNotebook', name: 'Google Notebook', icon: '/images/sites/notebooklm.png', url: 'https://notebook.google.com/?hl=fa', keywords: ['notebooklm', 'notebook', 'نوت بوک', 'نوتبوک', 'نوت‌بوک', 'گوگل'] },
    { key: 'googleLabs', name: 'Google Labs (Flow)', icon: '/images/sites/labs-google.png', url: 'https://labs.google/', new: true, keywords: ['labs', 'flow', 'فلو', 'لبز', 'گوگل لبز', 'whisk', 'ویدیو'] },
    { key: 'meta', name: 'Meta AI', icon: '/images/sites/meta.png', url: 'https://www.meta.ai/', new: true, keywords: ['meta', 'متا', 'llama', 'لاما', 'facebook', 'فیسبوک', 'instagram'] },
    { key: 'grok', name: 'Grok', icon: '/images/sites/gork.png', url: 'https://grok.com/', helpText: 'سایت Grok از فونت <strong>وزیرمتن</strong> به صورت رسمی استفاده می‌کند. به منظور حفظ احترام <strong>مرحوم صابر راستی کردار</strong> سازنده این فونت، فونت این سایت تغییر نمی‌کند و فقط الگوریتم فعال می‌باشد.', keywords: ['grok', 'گروک', 'xai', 'ایکس ای آی', 'توییتر', 'twitter', 'ایلان'] },
    { key: 'qwenlm', name: 'QWEN CHAT', icon: '/images/sites/qwen.png', url: 'https://chat.qwen.ai', keywords: ['qwen', 'کوئن', 'alibaba', 'علی بابا', 'علی‌بابا', 'tongyi'] },
    { key: 'kimi', name: 'Kimi', icon: '/images/sites/kimi.png', url: 'https://www.kimi.com/', keywords: ['kimi', 'کیمی', 'moonshot', 'k2'] },
    { key: 'openrouter', name: 'OpenRouter', icon: '/images/sites/openrouter.png', url: 'https://openrouter.ai/', keywords: ['openrouter', 'اوپن روتر', 'اوپن‌روتر'] },
    { key: 'zai', name: 'Z.ai', icon: '/images/sites/z.ai.png', url: 'https://chat.z.ai/', keywords: ['z.ai', 'zai', 'glm', 'zhipu', 'زی آی', 'زی‌ای'] },
    { key: 'githubCopilot', name: 'GitHub Copilot', icon: '/images/sites/GithubCopilot.png', url: 'https://github.com/copilot', keywords: ['github', 'گیت هاب', 'گیت‌هاب', 'کوپایلوت', 'copilot'] },
    { key: 'minimax', name: 'Minimax', icon: '/images/sites/minimax.png', url: 'https://agent.minimax.io/', keywords: ['minimax', 'مینی مکس', 'مینی‌مکس'] },
    { key: 'duckduckgo', name: 'DuckDuckGo AI', icon: '/images/sites/duckduckgo.png', url: 'https://duckduckgo.com/aichat', keywords: ['duckduckgo', 'داک داک گو', 'داک‌داک‌گو', 'داکداکگو'] },
    { key: 'youCom', name: 'you.com', icon: '/images/sites/you com.jpg', url: 'https://you.com', keywords: ['you', 'یو'] },
    { key: 'poeCom', name: 'poe.com', icon: '/images/sites/poe.png', url: 'https://poe.com/', keywords: ['poe', 'پو', 'quora'] },
    { key: 'monica', name: 'Monica', icon: '/images/sites/monica.png', url: 'https://monica.im/', keywords: ['monica', 'مونیکا'] },
    { key: 'mistral', name: 'Mistral', icon: '/images/sites/chat-mistral.png', url: 'https://chat.mistral.ai', keywords: ['mistral', 'میسترال', 'le chat'] },
    { key: 'manus', name: 'Manus', icon: '/images/sites/manus.png', url: 'https://manus.im/', keywords: ['manus', 'مانوس'] },
    { key: 'blackbox', name: 'Black Box', icon: '/images/sites/blackbox.png', url: 'https://www.blackbox.ai/', keywords: ['blackbox', 'بلک باکس', 'بلک‌باکس', 'کد'] },
    { key: 'oneMinai', name: '1min.AI', icon: '/images/sites/openAi-icon.png', url: 'https://app.1min.ai/', keywords: ['1min', 'وان مین', 'وان‌مین'] },
    { key: 'digen', name: 'Digen', icon: '/images/sites/digen.png', url: 'https://digen.ai/', keywords: ['digen', 'دیجن'] },
    { key: 'jules', name: 'Google Jules', icon: '/images/sites/jules.png', url: 'https://jules.google.com/', keywords: ['jules', 'جولز', 'گوگل', 'کد'] },
    { key: 'writesonic', name: 'Writesonic (Chatsonic)', icon: '/images/sites/writesonic.png', url: 'https://app.writesonic.com/chat/', keywords: ['writesonic', 'chatsonic', 'رایتسونیک', 'چت سونیک', 'چت‌سونیک'] },
    { key: 'lovable', name: 'Lovable', icon: '/images/sites/lovable.png', url: 'https://lovable.dev/', keywords: ['lovable', 'لاوبل', 'لاوابل', 'کد'] },
    { key: 'ernie', name: 'Ernie (Baidu)', icon: '/images/sites/ernie.png', url: 'https://ernie.baidu.com/', keywords: ['ernie', 'ارنی', 'baidu', 'بایدو', 'wenxin'] },
    { key: 'gamma', name: 'Gamma', icon: '/images/sites/gama.png', url: 'https://gamma.app/', keywords: ['gamma', 'گاما', 'ارائه', 'presentation', 'اسلاید'] },
    { key: 'synaps', name: 'Synaps', icon: '/images/sites/synaps.png', url: 'https://www.synaps.app/', helpText: 'این سایت به دلیل انیمیشن‌های سنگین ممکن است برای شما با لگ باز شود. این کندی ارتباطی با این افزونه ندارد و به دلیل ساختار پیچیده و انیمیشن‌های سنگین خود سایت است.', keywords: ['synaps', 'سیناپس'] },
    { key: 'notion', name: 'Notion', icon: '/images/sites/notion.png', url: 'https://www.notion.so/', keywords: ['notion', 'نوشن'] },
    { key: 'genspark', name: 'Genspark', icon: '/images/sites/genspark.png', url: 'https://genspark.ai/', keywords: ['genspark', 'جن اسپارک', 'جن‌اسپارک'] },
    { key: 'arena', name: 'Arena', icon: '/images/sites/arena.png', url: 'https://arena.ai/', keywords: ['arena', 'آرنا', 'lmsys', 'lmarena'] },
    { key: 'duckai', name: 'Duck AI', icon: '/images/sites/duckduckgo.png', url: 'https://duck.ai/', keywords: ['duck', 'داک', 'duck.ai'] },
    { key: 'clickup', name: 'ClickUp', icon: '/images/sites/clickup.png', url: 'https://app.clickup.com/', keywords: ['clickup', 'کلیک آپ', 'کلیک‌آپ'] },
    { key: 't3chat', name: 'T3 Chat', icon: '/images/sites/t3-chat.png', url: 'https://t3.chat/', keywords: ['t3', 'تی تری', 'تی‌تری', 'theo'] },
    { key: 'vivado', name: 'Vivado AMD', icon: '/images/sites/vivado.png', url: 'https://vivado.amd.com/chat', keywords: ['vivado', 'ویوادو', 'amd'] },
    { key: 'atxp', name: 'ATXP Chat', icon: '/images/sites/atxp.png', url: 'https://chat.atxp.ai/', keywords: ['atxp'] },
    { key: 'consensus', name: 'Consensus', icon: '/images/sites/consensus.png', url: 'https://consensus.app/', keywords: ['consensus', 'کنسنسوس', 'مقاله', 'پژوهش', 'paper', 'research'] },
    { key: 'scispace', name: 'SciSpace', icon: '/images/sites/scispace.png', url: 'https://scispace.com/', keywords: ['scispace', 'سای اسپیس', 'سای‌اسپیس', 'مقاله', 'پژوهش', 'paper'] },
    { key: 'chatboxai', name: 'Chatbox AI', icon: '/images/sites/chatboxai.png', url: 'https://web.chatboxai.app/', keywords: ['chatbox', 'چت باکس', 'چت‌باکس'] },
    { key: 'lumo', name: 'Lumo', icon: '/images/sites/lumo-proton.png', url: 'https://lumo.proton.me/', keywords: ['lumo', 'لومو', 'proton', 'پروتون'] },
    { key: 'veo3', name: 'Veo 3', icon: '/images/sites/veo3.png', url: 'https://www-veo3.com/', keywords: ['veo', 'وئو', 'ویدیو', 'video', 'گوگل'] },
    { key: 'fal', name: 'fal.ai', icon: '/images/sites/fal.png', url: 'https://fal.ai/', new: true, helpText: 'ما به نسخه پولی این ابزار دسترسی نداشتیم، بنابراین امکان فعال‌سازی راست‌چین برای همه بخش‌های آن وجود نداشت. اگر به نسخه پولی دسترسی دارید، می‌توانید به <strong>پشتیبانی</strong> پیام بدهید تا بخش‌هایی که هنوز فعال نشده‌اند را هم فعال کنیم.', keywords: ['fal', 'فال', 'تصویر', 'image', 'video', 'ویدیو'] },
    { key: 'bfl', name: 'Black Forest', icon: '/images/sites/bfl.png', url: 'https://bfl.ai/', new: true, keywords: ['bfl', 'flux', 'بلک فارست', 'بلک‌فارست', 'فلوکس', 'تصویر', 'image'] },
    { key: 'characterAi', name: 'Character.AI', icon: '/images/sites/character-ai.png', url: 'https://character.ai/', new: true, keywords: ['character', 'کاراکتر', 'شخصیت', 'c.ai'] },
    { key: 'pi', name: 'Pi', icon: '/images/sites/pi.png', url: 'https://pi.ai/', new: true, keywords: ['pi', 'پای', 'inflection'] },
    { key: 'cursor', name: 'Cursor', icon: '/images/sites/cursor.png', url: 'https://cursor.com/', new: true, keywords: ['cursor', 'کرسر', 'کورسر', 'کرسور', 'کد', 'ide', 'ادیتور'] },
    { key: 'typingmind', name: 'TypingMind', icon: '/images/sites/typingmind.png', url: 'https://www.typingmind.com/', new: true, keywords: ['typingmind', 'تایپینگ مایند', 'تایپینگ‌مایند'] },
    { key: 'huggingface', name: 'Hugging Face', icon: '/images/sites/huggingface.png', url: 'https://huggingface.co/', new: true, keywords: ['huggingface', 'هاگینگ فیس', 'هاگینگ‌فیس', 'hf', 'مدل'] },
    { key: 'dash0', name: 'Dash0', icon: '/images/sites/dash0.png', url: 'https://app.dash0.com/', new: true, keywords: ['dash0', 'دش صفر', 'دش'] },
    { key: 'zerve', name: 'Zerve', icon: '/images/sites/zerve.png', url: 'https://app.zerve.ai/', new: true, keywords: ['zerve', 'زرو'] }
];


export { services };

export default function ServiceList() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [checked, setChecked] = useState<CheckedState>({
        chatGpt: true,
        claude: true,
        copilot: true,
        githubCopilot: true,
        duckduckgo: true,
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
        digen: true,
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
    const searchInputRef = useRef<HTMLInputElement>(null);
    
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

    // Check current tab and find matching service using the same method as ManualRtlBanner
    useEffect(() => {
        let isMounted = true;

        const handleActiveTabUpdate = (message: any) => {
            if (!isMounted || !message) return;
            if (message.action === 'activeTabInfoUpdated') {
                const tabInfo = message.payload;
                if (tabInfo?.hostname) {
                    findMatchingService(tabInfo.hostname);
                } else {
                    setActiveServiceKey(null);
                }
            }
        };

        const findMatchingService = (hostname: string) => {
            // Normalize hostname (remove www. prefix if present)
            const normalizedHostname = hostname.replace(/^www\./, '').toLowerCase();
            
            // Find matching service
            for (const service of services) {
                try {
                    const serviceUrlObj = new URL(service.url);
                    const serviceHostname = serviceUrlObj.hostname.replace(/^www\./, '').toLowerCase();
                    
                    // Check if hostname matches
                    if (normalizedHostname === serviceHostname || 
                        normalizedHostname.endsWith('.' + serviceHostname) ||
                        serviceHostname.endsWith('.' + normalizedHostname)) {
                        setActiveServiceKey(service.key);
                        return;
                    }
                } catch (e) {
                    // Skip invalid service URLs
                    continue;
                }
            }
            setActiveServiceKey(null);
        };

        const fetchActiveTabInfo = () => {
            try {
                chrome.runtime.sendMessage({ action: 'getActiveTabInfo' }, (response) => {
                    if (!isMounted) return;
                    if (chrome.runtime.lastError) {
                        setActiveServiceKey(null);
                        return;
                    }
                    if (response?.success && response?.tabInfo?.hostname) {
                        findMatchingService(response.tabInfo.hostname);
                    } else {
                        setActiveServiceKey(null);
                    }
                });
            } catch (error) {
                if (isMounted) {
                    setActiveServiceKey(null);
                }
            }
        };

        fetchActiveTabInfo();
        chrome.runtime.onMessage.addListener(handleActiveTabUpdate);

        return () => {
            isMounted = false;
            chrome.runtime.onMessage.removeListener(handleActiveTabUpdate);
        };
    }, []);

    useEffect(() => {
        try {
            chrome.storage.sync.get(
                services.map(service => service.key),
                (data) => {
                    const updatedData = { ...data };
                    // If Edge, force Copilot to be disabled
                    if (isEdge) {
                        updatedData.copilot = false;
                        chrome.storage.sync.set({ copilot: false });
                    }
                    setChecked(updatedData);
                }
            );
        } catch (error) {
            // Extension context invalidated or other error - use default values
            // If Edge, ensure Copilot is disabled
            if (isEdge) {
                setChecked(prev => ({ ...prev, copilot: false }));
            }
        }
    }, [isEdge]);

    // Get list of dynamic service keys
    const dynamicServices = Object.keys(DYNAMIC_SERVICES);

    const handleChange = (key: string) => async (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        // Prevent enabling Copilot in Edge
        if (key === 'copilot' && isEdge) {
            return;
        }
        
        // If enabling a dynamic service, check permissions
        if (checked && dynamicServices.includes(key)) {
            const service = DYNAMIC_SERVICES[key as keyof typeof DYNAMIC_SERVICES];
            if (service && service.origins) {
                const origins = service.origins;
                try {
                    const hasScripting = await chrome.permissions.contains({ permissions: ['scripting'] });
                    const hasOrigins = await chrome.permissions.contains({ origins });
                    
                    if (!hasScripting || !hasOrigins) {
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
            hostname = new URL(service.url).hostname.replace(/^www\./, '');
        } catch {
            hostname = '';
        }

        const searchableText = [
            service.name,
            service.key,
            service.url,
            hostname,
            ...(service.keywords || []),
        ]
            .join(' ')
            .toLowerCase()
            .replace(/\u200c/g, '');

        return searchableText.includes(normalizedQuery);
    };

    const filteredServices = useMemo(() => {
        return services.filter(service => matchesSearch(service, searchQuery));
    }, [searchQuery]);

    // Get active service for display at top
    const activeService = React.useMemo(() => {
        if (!activeServiceKey) {
            return null;
        }
        return services.find(s => s.key === activeServiceKey) || null;
    }, [activeServiceKey]);

    // default: '#1a1a2e',
    // paper: '#2f2f41',
    return (
        <>
            <List
                sx={{ width: '100%', backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff' }}
                style={{ direction: 'ltr' }}
                subheader={
                    <ListSubheader 
                        component="div" 
                        id="nested-list-subheader" 
                        sx={{ 
                            textAlign: 'center',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            height: 48,
                            minHeight: 48,
                            maxHeight: 48,
                            lineHeight: '48px',
                            overflow: 'hidden',
                            boxSizing: 'border-box',
                            backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            borderBottom: `1px solid ${isDarkMode ?  'rgba(255, 255, 255, 0.12)' : '#a2a2a2'}`
                        }}
                        style={{ direction: 'ltr' }}
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
                            `تعداد کل: ${services.length} | تعداد فعال: ${Object.values(checked).filter(Boolean).length}`
                        )}
                        <Box
                            component="button"
                            type="button"
                            onClick={isSearchOpen ? closeSearch : () => setIsSearchOpen(true)}
                            aria-label={isSearchOpen ? 'بستن جستجو' : 'جستجو'}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 0,
                                height: 48,
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
                {filteredServices.map((service, index) => {
                    const isActive = service.key === activeServiceKey;
                    return (
                    <React.Fragment key={service.key}>
                            <ListItem disablePadding style={{ direction: 'ltr' }}>
                                <ListItemButton style={{ direction: 'ltr' }}>
                                    <a href={service.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Avatar 
                                                sx={{ width: 30, height: 30 }} 
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
                                                        bgcolor: isDarkMode 
                                                            ? 'rgb(33, 46, 65)' 
                                                            : 'rgba(30, 64, 175, 0.1)',
                                                        border: `1px solid ${isDarkMode ? 'rgba(0, 233, 255, 0.3)' : 'rgba(30, 64, 175, 0.3)'}`,
                                                        color: isDarkMode ? '#00e9ff' : '#1c39bb', 
                                                        borderRadius: 1, 
                                                        fontSize: '0.6rem',
                                                        fontWeight: 600
                                                    }}>
                                                        جدید
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                    />
                                    
                                    {service.helpText && !(service.key === 'copilot' && isEdge) && (
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
                                        disabled={service.key === 'copilot' && isEdge}
                                        data-list-switch="true"
                                        inputProps={{
                                            'aria-labelledby': `switch-list-label-${service.key}`,
                                        }}
                                        sx={{
                                            transform: 'rotate(180deg)',
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            },
                                            '& .Mui-disabled': {
                                                opacity: 0.5
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        {service.key === 'copilot' && isEdge && (
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
                                        برای مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت (از جمله Copilot) کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی Copilot، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                        {index < filteredServices.length - 1 && <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#a2a2a2' }} />}
                    </React.Fragment>
                    );
                })}
            </List>


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
                <DialogActions style={{ padding: '8px 16px 16px 16px', flexDirection: 'row-reverse' }}>
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
                    این مجوز فقط برای اعمال تغییرات روی صفحه استفاده می‌شود و هیچ داده‌ای جمع‌آوری نمی‌شود.
                </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px', flexDirection: 'row-reverse' }}>
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
                                    chrome.runtime.sendMessage({
                                        action: 'requestPermissionsAndEnableService',
                                        serviceKey: key
                                    }, (response) => {
                                        if (chrome.runtime.lastError) {
                                            // Silently handle connection errors
                                            return;
                                        }
                                        
                                        if (response?.success) {
                                            setChecked(prev => ({ ...prev, [key]: true }));
                                            setPermissionModalOpen(false);
                                        } else if (response?.granted === false) {
                                            alert('مجوز داده نشد. لطفاً در تنظیمات افزونه مجوزها را فعال کنید.');
                                        } else {
                                            alert(response?.error || 'خطا در دریافت مجوز. لطفاً دوباره تلاش کنید.');
                                        }
                                    });
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
