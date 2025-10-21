import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme, SvgIcon } from '@mui/material';
import { mdiFormatListBulleted, mdiArrowUp, mdiCheck } from '@mdi/js';

interface ChangeItem {
    id: string;
    text: string;
}

interface VersionChanges {
    version: string;
    changes: ChangeItem[];
}

const changesData: VersionChanges[] = [
    {
        version: "1404/06/30",
        changes: [
            { id: "1", text: "آپدیت NotebookLM" },
            { id: "2", text: "حل مشکل جدول‌ها در ChatGPT" },
            { id: "3", text: "افزودن GitHub Copilot" },
            { id: "4", text: "حل مشکل gemini" },
            { id: "5", text: "اپدیت Google AI Studio" },
            { id: "6", text: "افزودن OpenRouter" },
        ]
    },
    {
        version: "1404/06/4",
        changes: [
            { id: "1", text: "اضافه شدن الگوریتم هوشمند و پیشرفته برای تشخیص راست‌چین و چپ‌چین" },
            { id: "2", text: "به‌روزرسانی تمامی سایت‌ها" },
            { id: "3", text: "به‌روزرسانی لینک حمایت" },
            { id: "4", text: "اضافه شدن بخش تنظیمات انتخاب الگوریتم" },
            { id: "5", text: "امکان پنهان کردن متن حمایت در تنظیمات" },
            { id: "6", text: "حذف سایت‌های غیرفعال" },
            { id: "7", text: "افزودن NotebookLM" },
            { id: "8", text: "افزودن Z.ai" },
            { id: "9", text: "افزودن LMArena" }
        ]
    },
    {
        version: "1404/04/23",
        changes: [
            { id: "1", text: "هماهنگی با سایت های اپدیت شده" },
            { id: "2", text: "افزودن Mistral" },
            { id: "3", text: "افزودن Manus" },
            { id: "4", text: "افزودن Kimi" },
            { id: "5", text: "افزودن Black box" },
            { id: "6", text: "افزودن بخش حمایت از اکستنشن" }
        ]
    },
    {
        version: "1404/03/16",
        changes: [
            { id: "1", text: "اپدیت ChatGPT" },
            { id: "2", text: "اپدیت Grok" },
            { id: "3", text: "اپدیت Qwen" }
        ]
    },
    {
        version: "1404/01/31",
        changes: [
            { id: "1", text: "اپدیت ChatGPT (اصلاح فونت برای فرمول های ریاضی)" }
        ]
    },
    {
        version: "1404/01/23",
        changes: [
            { id: "1", text: "اپدیت claude" }
        ]
    },
    {
        version: "1404/01/03",
        changes: [
            { id: "1", text: "اپدیت ChatGPT" },
            { id: "2", text: "اپدیت DeepSeek" },
            { id: "3", text: "رفع مشکلات جزعی در بقیه سایت ها" }
        ]
    },
    {
        version: "1403/12/08",
        changes: [
            { id: "1", text: "سایت gemini.google.com اضافه شد (آزمایشی)" },
            { id: "2", text: "سایت grok.com اضافه شد (آزمایشی)" }
        ]
    },
    {
        version: "1403/11/18",
        changes: [
            { id: "1", text: "سایت poe.com اضافه شد" },
            { id: "2", text: "سایت monica.im اضافه شد" }
        ]
    },
    {
        version: "1403/11/16",
        changes: [
            { id: "1", text: "اپدیت DeepSeek" },
            { id: "2", text: "اپدیت ChatGPT" }
        ]
    },
    {
        version: "1403/11/06",
        changes: [
            { id: "1", text: "حل مشکلات chat.deepseek.com" },
            { id: "2", text: "حل مشکلات claude.ai" },
            { id: "3", text: "سایت you.com اضافه شد (آزمایشی)" },
            { id: "4", text: "سایت chat.qwenlm.ai اضافه شد (آزمایشی)" }
        ]
    },
    {
        version: "1403/10/11",
        changes: [
            { id: "1", text: "سایت chat.deepseek.com اضافه شد" }
        ]
    },
    {
        version: "1403/10/08",
        changes: [
            { id: "1", text: "سایت aistudio.google.com اضافه شد" }
        ]
    },
    {
        version: "1403/9/28",
        changes: [
            { id: "1", text: "فعال شدن راست چین برای قسمت های جدید ChatGPT" }
        ]
    },
    {
        version: "1403/9/25",
        changes: [
            { id: "1", text: "سایت perplexity.ai اضافه شد" },
            { id: "2", text: "سایت duckduckgo.com/aichat اضافه شد" },
            { id: "3", text: "رفع برخی ایرادات در بقیه سایت ها" }
        ]
    },
    {
        version: "1403/8/12",
        changes: [
            { id: "1", text: "هماهنگ سازی با نسخه جدید ChatGpt و Copilot" },
            { id: "2", text: "بهینه سازی جداول و کد ها در ChatGpt" },
            { id: "3", text: "بهینه سازی فرمول های ریاضی در ChatGpt" }
        ]
    },
    {
        version: "1403/6/26",
        changes: [
            { id: "1", text: "با نسخه جدید ChatGpt هماهنگ شد" }
        ]
    },
    {
        version: "1403/3/22",
        changes: [
            { id: "1", text: "با نسخه جدید ChatGpt هماهنگ شد" }
        ]
    },
    {
        version: "1403/3/1",
        changes: [
            { id: "1", text: "مشکل فرمول های ریاضی در ChatGpt حل شد" },
            { id: "2", text: "TheB Api اضافه شد" }
        ]
    },
    {
        version: "1403/2/29",
        changes: [
            { id: "1", text: "با نسخه جدید هماهنگ شد" },
            { id: "2", text: "فعال شد Claude و Copilot" },
            { id: "3", text: "منو مدیریت و تنظیمات برای مدیریت افزونه اضافه شد" }
        ]
    },
    {
        version: "1402/9/14",
        changes: [
            { id: "1", text: "هماهنگ شد ChatGPT با نسخه جدید" }
        ]
    },
    {
        version: "1402/2/30",
        changes: [
            { id: "1", text: "هماهنگ شد ChatGPT با نسخه جدید" }
        ]
    },
    {
        version: "1402/2/15",
        changes: [
            { id: "1", text: "نسخه اولیه منتشر شد" }
        ]
    }
];

const ChangesList: React.FC = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    return (
        <Accordion 
            sx={{ 
                border: isDarkMode ? '1px solid rgba(0, 233, 255, 0.5)' : '1px solid rgba(30, 64, 175, 0.5)',
                backgroundColor: isDarkMode ? '#2f2f41' : '#ffffff',
                borderRadius: 2,
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                    margin: 0,      
                    border: isDarkMode ? '1px solid rgba(0, 233, 255, 0.5)' : '1px solid rgba(30, 64, 175, 0.5)'
                }
            }}
        >
            <AccordionSummary
                expandIcon={<Typography sx={{ 
                    color: isDarkMode ? '#00e9ff' : '#1c39bb', 
                    fontSize: '0.8rem' 
                }}>▼</Typography>}
                sx={{
                    '& .MuiAccordionSummary-content': {
                        margin: '8px 0'
                    }
                }}
            >
                <Typography variant="body2" sx={{ 
                    color: isDarkMode ? '#00e9ff' : '#1c39bb',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <SvgIcon sx={{ 
                        fontSize: '1.2rem',
                        color: isDarkMode ? '#00e9ff' : '#1c39bb'
                    }}>
                        <path d={mdiFormatListBulleted} />
                    </SvgIcon>
                    لیست تغییرات افزونه
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}>
                    {changesData.map((versionData, index) => (
                        <Box key={versionData.version} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ 
                                color: isDarkMode ? '#00e9ff' : '#1c39bb', 
                                fontWeight: 600, 
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}>
                                <SvgIcon sx={{ 
                                    fontSize: '1rem',
                                    color: isDarkMode ? '#4CAF50' : '#2E7D32'
                                }}>
                                    <path d={mdiArrowUp} />
                                </SvgIcon>
                                {versionData.version}
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                                {versionData.changes.map((change) => (
                                    <Typography key={change.id} variant="body2" sx={{ 
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)', 
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        <SvgIcon sx={{ 
                                            fontSize: '0.9rem',
                                            color: isDarkMode ? '#4CAF50' : '#2E7D32'
                                        }}>
                                            <path d={mdiCheck} />
                                        </SvgIcon>
                                        {change.text}
                                    </Typography>
                                ))}
                            </Box>
                            {index < changesData.length - 1 && (
                                <Typography variant="body2" sx={{ 
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)', 
                                    textAlign: 'center', 
                                    my: 1 
                                }}>
                                    -------
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default ChangesList;
