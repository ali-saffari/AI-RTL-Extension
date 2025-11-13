import React, { useEffect, useState } from 'react';
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
    Chip,
    Box,
    Paper,
} from '@mui/material';
import { mdiInformationOutline } from '@mdi/js';

interface Service {
    key: string;
    name: string;
    icon: string;
    url: string;
    helpText?: string;
    new?: boolean;
}

interface CheckedState {
    [key: string]: boolean;
}

const services: Service[] = [
    { key: 'chatGpt', name: 'ChatGPT', icon: '/images/openAi-icon.png', url: 'https://chatgpt.com/' },
    { key: 'deepseek', name: 'DeepSeek', icon: '/images/deepseek.jpg', url: 'https://chat.deepseek.com' },
    { key: 'copilot', name: 'Copilot', icon: '/images/copilot-icon.png', url: 'https://www.bing.com/chat?setlang=fa', helpText: 'در مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت از جمله <strong>Copilot</strong> کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی Copilot، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.' },
    { key: 'claude', name: 'Claude', icon: '/images/claude-icon.png', url: 'https://claude.ai' },
    { key: 'gemini', name: 'Gemini', icon: '/images/Gemini.png', url: 'https://gemini.google.com/' },
    { key: 'notebooklm', name: 'NotebookLM', icon: '/images/notebooklm.png', url: 'https://notebooklm.google.com/?hl=fa' },
    { key: 'jules', name: 'Google Jules', icon: '/images/jules.png', url: 'https://jules.google.com/', new: true },
    { key: 'lovable', name: 'Lovable', icon: '/images/lovable.png', url: 'https://lovable.dev/', new: true },
    { key: 'synaps', name: 'Synaps', icon: '/images/synaps.png', url: 'https://www.synaps.app/', new: true },
    { key: 'digen', name: 'Digen', icon: '/images/digen.png', url: 'https://digen.ai/', new: true },
    { key: 'lmarena', name: 'LMArena', icon: '/images/lmarena_logo.jpg', url: 'https://lmarena.ai/' },
    { key: 'zai', name: 'Z.ai', icon: '/images/z.ai.png', url: 'https://chat.z.ai/' },
    { key: 'githubCopilot', name: 'GitHub Copilot', icon: '/images/GithubCopilot.png', url: 'https://github.com/copilot' },
    { key: 'openrouter', name: 'OpenRouter', icon: '/images/openrouter.png', url: 'https://openrouter.ai/' },
    { key: 'minimax', name: 'Minimax', icon: '/images/minimax.png', url: 'https://agent.minimax.io/' },
    { key: 'grok', name: 'Grok', icon: '/images/gork.png', url: 'https://grok.com/', helpText: 'سایت Grok از فونت <strong>وزیرمتن</strong> به صورت رسمی استفاده می‌کند. به منظور حفظ احترام <strong>مرحوم صابر راستی کردار</strong> سازنده این فونت، فونت این سایت تغییر نمی‌کند و فقط الگوریتم فعال می‌باشد.' },
    { key: 'aiStudio', name: 'Ai Studio', icon: '/images/aistudio.png', url: 'https://aistudio.google.com/', helpText: 'این سایت به دلیل نوع طراحی و ساخت آن ممکن است روند بهینه‌سازی متن‌ها برای فارسی با لگ مواجه شود. همچنین در موقع اسکرول کردن هم این تجربه را احساس خواهید کرد. این مشکلات به دلیل ساختار پیچیده سایت و نحوه رندر شدن صفحه توسط خود سایت است.' },
    { key: 'duckduckgo', name: 'DuckDuckGo AI', icon: '/images/duckduckgo.png', url: 'https://duckduckgo.com/aichat' },
    { key: 'perplexity', name: 'perplexity AI', icon: '/images/White on Turquiose.png', url: 'https://perplexity.ai' },
    { key: 'youCom', name: 'you.com', icon: '/images/you com.jpg', url: 'https://you.com' },
    { key: 'qwenlm', name: 'QWEN CHAT', icon: '/images/qwen.png', url: 'https://chat.qwen.ai' },
    { key: 'poeCom', name: 'poe.com', icon: '/images/poe.png', url: 'https://poe.com/' },
    { key: 'monica', name: 'Monica', icon: '/images/monica.png', url: 'https://monica.im/' },
    { key: 'mistral', name: 'Mistral', icon: '/images/chat-mistral.png', url: 'https://chat.mistral.ai' },
    { key: 'manus', name: 'Manus', icon: '/images/manus.png', url: 'https://manus.im/' },
    { key: 'kimi', name: 'Kimi', icon: '/images/kimi.png', url: 'https://www.kimi.com/' },
    { key: 'blackbox', name: 'Black Box', icon: '/images/blackbox.png', url: 'https://www.blackbox.ai/' },
    { key: 'oneMinai', name: '1min.AI', icon: '/images/openAi-icon.png', url: 'https://app.1min.ai/' }
    
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
        mistral: true,
        manus: true,
        kimi: true,
        blackbox: true,
        notebooklm: true,
        zai: true,
        lmarena: true,
        openrouter: true,
        minimax: true,
        jules: true,
        oneMinai: true,
        digen: true,
        lovable: true,
        synaps: true,
    });

    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    
    // Detect Edge browser
    const isEdge = navigator.userAgent.indexOf('Edg') > -1;

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
            console.log('Chrome storage access failed, using default service states:', error);
            // If Edge, ensure Copilot is disabled
            if (isEdge) {
                setChecked(prev => ({ ...prev, copilot: false }));
            }
        }
    }, [isEdge]);

    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        // Prevent enabling Copilot in Edge
        if (key === 'copilot' && isEdge) {
            return;
        }
        try {
            chrome.storage.sync.set({ [key]: checked });
        } catch (error) {
            console.log('Failed to save service setting:', error);
        }
        setChecked(prev => ({ ...prev, [key]: checked }));
    };


    // default: '#1a1a2e',
    // paper: '#2f2f41',
    return (
        <>
            <List
                sx={{ width: '100%', maxWidth: 360, backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff' }}
                subheader={
                    <ListSubheader 
                        component="div" 
                        id="nested-list-subheader" 
                        sx={{ 
                            textAlign: 'center', 
                            direction: 'rtl',
                            backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            borderBottom: `1px solid ${isDarkMode ?  'rgba(255, 255, 255, 0.12)' : '#a2a2a2'}`
                        }}
                    >
                        {Object.values(checked).filter(Boolean).length} سایت فعال
                    </ListSubheader>
                }
            >
                {services.map((service, index) => (
                    <React.Fragment key={service.key}>
                            <a href={service.url} target="_blank" rel="noopener noreferrer">
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Avatar 
                                                sx={{ width: 30, height: 30 }} 
                                                alt={service.name} 
                                                src={chrome.runtime.getURL(service.icon)}
                                            />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ 
                                                        color: isDarkMode ? '#ffffff' : '#000000',
                                                        fontWeight: 500
                                                    }}>
                                                        {service.name}
                                                    </Typography>
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
                                                            fontSize: '0.7rem',
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
                                            edge="end"
                                            onChange={handleChange(service.key)}
                                            checked={checked?.[service.key] || false}
                                            disabled={service.key === 'copilot' && isEdge}
                                            data-list-switch="true"
                                            inputProps={{
                                                'aria-labelledby': `switch-list-label-${service.key}`,
                                            }}
                                            sx={{
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
                            </a>
                        {service.key === 'copilot' && isEdge && (
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Paper 
                                    elevation={0}
                                    sx={{
                                        backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)',
                                        border: `1px solid ${isDarkMode ? 'rgba(211, 47, 47, 0.4)' : 'rgba(211, 47, 47, 0.3)'}`,
                                        borderRadius: 1,
                                        p: 1.5,
                                        direction: 'rtl',
                                        textAlign: 'right'
                                    }}
                                >
                                    <Typography 
                                        sx={{ 
                                            fontSize: '0.80rem',
                                            color: isDarkMode ? '#ffcdd2' : '#c62828',
                                            fontWeight: 400,
                                            lineHeight: 1.6
                                        }}
                                    >
                                        برای مرورگر <strong>Microsoft Edge</strong> هیچ افزونه‌ای روی سایت‌های مایکروسافت (از جمله Copilot) کار نمی‌کند. این یک محدودیت امنیتی است که توسط مایکروسافت اعمال شده است. برای استفاده از این افزونه روی Copilot، لطفاً از مرورگر <strong>Chrome</strong> استفاده کنید.
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                        {index < services.length - 1 && <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#a2a2a2' }} />}
                    </React.Fragment>
                ))}
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
        </>
    );
}
