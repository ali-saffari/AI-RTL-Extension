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
} from '@mui/material';

interface Service {
    key: string;
    name: string;
    icon: string;
    url: string;
    helpText?: string;
}

interface CheckedState {
    [key: string]: boolean;
}

export default function ServiceList() {
    const [checked, setChecked] = useState<CheckedState>({
        chatGpt: true,
        claude: true,
        copilot: true,
        thebAi: true,
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
    });

    const [grokModalOpen, setGrokModalOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const services: Service[] = [
        { key: 'chatGpt', name: 'ChatGPT', icon: '/images/openAi-icon.png', url: 'https://chatgpt.com/' },
        { key: 'deepseek', name: 'DeepSeek', icon: '/images/deepseek.jpg', url: 'https://chat.deepseek.com' },
        { key: 'copilot', name: 'Copilot', icon: '/images/copilot-icon.png', url: 'https://www.bing.com/chat?setlang=fa' },
        { key: 'claude', name: 'Claude', icon: '/images/claude-icon.png', url: 'https://claude.ai' },
        { key: 'gemini', name: 'Gemini', icon: '/images/Gemini.png', url: 'https://gemini.google.com/' },
        { key: 'grok', name: 'Grok', icon: '/images/gork.png', url: 'https://grok.com/' },
        { key: 'thebAi', name: 'TheB AI', icon: '/images/theb-ai-icon.png', url: 'https://beta.theb.ai' },
        { key: 'aiStudio', name: 'Ai Studio', icon: '/images/google-ai-studio.png', url: 'https://aistudio.google.com/', helpText: 'این سایت به دلیل نوع طراحی و ساخت آن ممکن است روند بهینه‌سازی متن‌ها برای فارسی با لگ مواجه شود. همچنین در موقع اسکرول کردن هم این تجربه را احساس خواهید کرد. این مشکلات به دلیل ساختار پیچیده سایت و نحوه رندر شدن صفحه توسط خود سایت است.' },
        { key: 'duckduckgo', name: 'DuckDuckGo AI', icon: '/images/duckduckgo.png', url: 'https://duckduckgo.com/aichat' },
        { key: 'perplexity', name: 'perplexity AI', icon: '/images/White on Turquiose.png', url: 'https://perplexity.ai' },
        { key: 'youCom', name: 'you.com', icon: '/images/you com.jpg', url: 'https://you.com' },
        { key: 'qwenlm', name: 'QWEN CHAT', icon: '/images/qwen.png', url: 'https://chat.qwen.ai' },
        { key: 'poeCom', name: 'poe.com', icon: '/images/poe.png', url: 'https://poe.com/' },
        { key: 'monica', name: 'Monica', icon: '/images/monica.png', url: 'https://monica.im/' },
        { key: 'mistral', name: 'Mistral', icon: '/images/chat-mistral.png', url: 'https://chat.mistral.ai' },
        { key: 'manus', name: 'Manus', icon: '/images/manus.png', url: 'https://manus.im/' },
        { key: 'kimi', name: 'Kimi', icon: '/images/kimi.png', url: 'https://www.kimi.com/', helpText: 'سیستم جدید بهینه سازی متن روی این سایت فعال نیست و از نسخه قبلی استفاده میشه.' },
        { key: 'blackbox', name: 'Black Box', icon: '/images/BlackBox.png', url: 'https://www.blackbox.ai/' },
    ];


    useEffect(() => {
        chrome.storage.sync.get(
            services.map(service => service.key),
            (data) => setChecked(data)
        );
    }, []);

    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        chrome.storage.sync.set({ [key]: checked });
        setChecked(prev => ({ ...prev, [key]: checked }));
    };

    const handleGrokClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setGrokModalOpen(true);
    };


    return (
        <>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                subheader={
                    <ListSubheader style={{ direction: 'rtl', textAlign: 'center', lineHeight: '11px' }}>
                        سایت هایی که پشتیبانی میشود
                    </ListSubheader>
                }
            >
                {services.map((service, index) => (
                    <React.Fragment key={service.key}>
                        {service.key === 'grok' ? (
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
                                        <ListItemText primary={service.name} />
                                        <IconButton 
                                            size="medium" 
                                            sx={{ ml: 'auto' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleGrokClick(e);
                                            }}
                                        >
                                            <svg 
                                                width="24" 
                                                height="24" 
                                                viewBox="0 0 24 24" 
                                                fill="currentColor"
                                            >
                                                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                                            </svg>
                                        </IconButton>
                                    </ListItemButton>
                                </ListItem>
                            </a>
                        ) : (
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
                                        <ListItemText primary={service.name} />
                                        
                                        {service.helpText && (
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
                                                <svg 
                                                    width="20" 
                                                    height="20" 
                                                    viewBox="0 0 24 24" 
                                                    fill="currentColor"
                                                >
                                                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                                                </svg>
                                            </IconButton>
                                        )}
                                        
                                        <Switch
                                            edge="end"
                                            onChange={handleChange(service.key)}
                                            checked={checked?.[service.key] || false}
                                            inputProps={{
                                                'aria-labelledby': `switch-list-label-${service.key}`,
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </a>
                        )}
                        {index < services.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>

            {/* Grok Modal */}
            <Dialog 
                open={grokModalOpen} 
                onClose={() => setGrokModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px' }}>
                    درباره Grok
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'justify', padding: '8px 16px' }}>
                    <Typography variant="body1" paragraph sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify' }}>
                        سایت Grok از فونت <strong>وزیرمتن</strong> به صورت رسمی استفاده می‌کند. به منظور حفظ احترام <strong>مرحوم صابر راستی کردار</strong> سازنده این فونت، افزونه RTL روی این سایت فعال نمی‌باشد. همچنین این سایت دارای قابلیت RTL داخلی است.
                    </Typography>
                  
              
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px' }}>
                    <Button 
                        onClick={() => setGrokModalOpen(false)}
                        variant="contained"
                        color="primary"
                    >
                        متوجه شدم
                    </Button>
                </DialogActions>
            </Dialog>

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
                    <Typography variant="body1" paragraph sx={{ fontSize: '0.80rem', fontWeight: 300, marginBottom: '11px', textAlign: 'justify' }}>
                        {selectedService?.helpText}
                    </Typography>
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