import React, { useEffect, useState } from "react";
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Switch,
    Avatar,
    Divider,
    ListItemButton
} from '@mui/material';

export default function SwitchListSecondary() {
    const [checked, setChecked] = useState<{ [key: string]: boolean }>({
        chatGpt: true,
        claude: true,
        copilot: true,
        freegpt: true,
        thebAi: true,
        duckduckgo: true,
        perplexity: true,
        aiStudio: true,
        deepseek: true,
        youCom: true,
        qwenlm: true,
        poeCom: true,
        monica: true,


    });



    const services = [
        { key: 'chatGpt', name: 'ChatGPT', icon: '/images/openAi-icon.png', url: 'https://chatgpt.com/' },
        { key: 'deepseek', name: 'DeepSeek', icon: '/images/deepseek.jpg', url: 'https://chat.deepseek.com' },
        { key: 'aiStudio', name: 'Ai Studio', icon: '/images/google-ai-studio.png', url: 'https://aistudio.google.com/' },
        { key: 'copilot', name: 'Copilot', icon: '/images/copilot-icon.png', url: 'https://www.bing.com/chat?setlang=fa' },
        { key: 'claude', name: 'Claude', icon: '/images/claude-icon.png', url: 'https://claude.ai' },
        { key: 'freegpt', name: 'FreeGPT', icon: '/images/chatgpt-icon.png', url: 'https://freegpt.cc/' },
        { key: 'thebAi', name: 'TheB AI', icon: '/images/theb-ai-icon.png', url: 'https://beta.theb.ai' },
        { key: 'duckduckgo', name: 'DuckDuckGo AI', icon: '/images/duckduckgo.png', url: 'https://duckduckgo.com/aichat' },
        { key: 'perplexity', name: 'perplexity AI', icon: '/images/White on Turquiose.png', url: 'https://perplexity.ai' },
        { key: 'youCom', name: 'you.com', icon: '/images/you com.jpg', url: 'https://you.com' },
        { key: 'qwenlm', name: 'QWEN CHAT', icon: '/images/qwen.png', url: 'https://chat.qwenlm.ai' },
        { key: 'poeCom', name: 'poe.com', icon: '/images/poe.png', url: 'https://poe.com/' },
        { key: 'monica', name: 'Monica', icon: '/images/monica.png', url: 'https://monica.im/' }
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

    return (
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
                    <a href={service.url} target="_blank" rel="noopener noreferrer">
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Avatar 
                                        sx={{ width: 30, height: 30 }} 
                                        sizes="small" 
                                        alt={service.name} 
                                        src={chrome.runtime.getURL(service.icon)}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={service.name} />
                                <Switch
                                    edge="end"
                                    onChange={handleChange(service.key)}
                                    checked={checked && checked[service.key] || false}
                                    inputProps={{
                                        'aria-labelledby': `switch-list-label-${service.key}`,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </a>
                    {index < services.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    );
}