import React from 'react';
import {
    Box,
    Typography,
    Button,
    SvgIcon,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { mdiInformationOutline, mdiChevronDown, mdiOpenInNew } from '@mdi/js';

interface InstallHintBannerProps {
    isDarkMode: boolean;
    onDismiss?: () => void;
    onOpenSettings?: () => void;
    variant: 'install' | 'troubleshooting' | 'notebook' | 'algorithm';
}

const troubleshootingSteps = [
    'بررسی آپدیت افزونه: مطمئن بشید که آخرین نسخه افزونه رو نصب دارین.',
    'بررسی فعال بودن روی سایت: چک کنید که قابلیت افزونه برای اون سایت خاص فعال (Enable) شده باشه.',
    'خاموش و روشن کردن: یک‌بار افزونه رو غیرفعال و مجدداً فعال کنید.',
    'رفرش کامل صفحه: صفحه سایت هدف رو با کلیدهای ترکیبی Ctrl + F5 (در مک: Cmd + Shift + R) رفرش کنید تا کش مرورگر پاک بشه.'
];

const InstallHintBanner: React.FC<InstallHintBannerProps> = ({
    isDarkMode,
    onDismiss,
    onOpenSettings,
    variant
}) => {
    const [expanded, setExpanded] = React.useState(false);
    const [hideConfirmOpen, setHideConfirmOpen] = React.useState(false);
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.82)' : 'rgba(0, 0, 0, 0.75)';
    const accentColor = isDarkMode ? '#00e9ff' : '#1c39bb';
    const defaultOffNote = (
        <Typography
            sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'iranyekan',
                lineHeight: 1.7,
                color: isDarkMode ? '#ffcc80' : '#e65100',
                mb: 0.8
            }}
        >
            افزونه روی برخی سایت‌ها به‌صورت پیش‌فرض فعال نیست و باید از لیست سایت‌ها فعالش کنید.
        </Typography>
    );
    const collapsibleTitle = variant === 'install'
        ? 'تازه نصب کردید و اکستنشن فعال نمی‌شه؟'
        : variant === 'algorithm'
            ? 'شخصی‌سازی الگوریتم راست‌چین'
            : 'افزونه روی برخی سایت‌ها فعال نمی‌شه؟';

    return (
        <Box
            className="install-hint-banner"
            dir="rtl"
            style={{ direction: 'rtl', textAlign: 'right' }}
            sx={{
                mx: 2,
                mb: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(0, 233, 255, 0.12) 0%, rgba(0, 233, 255, 0.04) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(30, 64, 175, 0.04) 100%)',
                border: isDarkMode
                    ? '1px solid rgba(0, 233, 255, 0.35)'
                    : '1px solid rgba(30, 64, 175, 0.25)'
            }}
        >
            {variant === 'notebook' ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <SvgIcon
                        sx={{
                            fontSize: '1.05rem',
                            mt: '2px',
                            color: accentColor,
                            flexShrink: 0
                        }}
                    >
                        <path d={mdiInformationOutline} />
                    </SvgIcon>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'iranyekan',
                                color: accentColor,
                                mb: 0.5
                            }}
                        >
                            فعال‌سازی مجدد Google Notebook
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                fontFamily: 'iranyekan',
                                lineHeight: 1.7,
                                color: isDarkMode ? '#ffcc80' : '#e65100'
                            }}
                        >
                            دامنه سایت Google Notebook تغییر کرده و مجوز قبلی روی آدرس جدید کار نمی‌کند. برای استفاده از افزونه روی این سایت، از لیست سایت‌ها یک‌بار دیگر فعالش کنید تا مجوز دامنه جدید گرفته شود.
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <>
                    <Box
                        component="button"
                        type="button"
                        dir="rtl"
                        className="install-hint-banner-toggle"
                        style={{ direction: 'rtl', textAlign: 'right' }}
                        onClick={() => setExpanded((open) => !open)}
                    >
                        <SvgIcon
                            sx={{
                                fontSize: '1.05rem',
                                color: accentColor,
                                flexShrink: 0
                            }}
                        >
                            <path d={mdiInformationOutline} />
                        </SvgIcon>
                        <Typography
                            className="install-hint-banner-title"
                            style={{ direction: 'rtl', textAlign: 'right' }}
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'iranyekan',
                                color: accentColor
                            }}
                        >
                            {collapsibleTitle}
                        </Typography>
                        <SvgIcon
                            sx={{
                                fontSize: '1.15rem',
                                color: accentColor,
                                flexShrink: 0,
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            <path d={mdiChevronDown} />
                        </SvgIcon>
                    </Box>
                    <Collapse in={expanded}>
                        <Box sx={{ mt: 1.2 }} style={{ direction: 'rtl', textAlign: 'right' }}>
                            {variant === 'install' ? (
                                <>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        اگر تازه افزونه رو نصب کردید و کار نمیکنه، اول از لیست سایت‌های پایین مطمئن بشید سایت مورد نظرتون وجود داره و فعال (Enable) هست.
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        بعد از اینکه مطمئن شدید سایت توی لیست هست و فعال شده، صفحه همون سایت رو با Ctrl + F5 (در مک: Cmd + Shift + R) رفرش کنید تا افزونه روش اعمال بشه.
                                    </Typography>
                                </>
                            ) : variant === 'algorithm' ? (
                                <>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        متن به‌صورت هوشمند بررسی می‌شه تا راست‌چین یا چپ‌چین بودنش تشخیص داده بشه. نسخه پیش‌فرض معمولاً برای بیشتر سایت‌ها خوب کار می‌کنه، ولی اگر متن‌های ترکیبی فارسی و انگلیسی، کد، یا پاسخ‌های چندزبانه درست نمایش داده نمی‌شن، می‌تونید الگوریتم دیگه‌ای رو تست کنید.
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        از طریق{' '}
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                onOpenSettings?.();
                                            }}
                                            sx={{
                                                display: 'inline',
                                                p: 0,
                                                m: 0,
                                                border: 0,
                                                background: 'none',
                                                cursor: 'pointer',
                                                font: 'inherit',
                                                fontWeight: 700,
                                                color: accentColor,
                                                textDecoration: 'underline',
                                                textUnderlineOffset: '3px',
                                                '&:hover': {
                                                    color: isDarkMode ? '#4dd4ff' : '#3b82f6'
                                                }
                                            }}
                                        >
                                            تنظیمات
                                        </Box>
                                        {' '}می‌تونید بهترین گزینه رو برای خودتون انتخاب کنید. تنظیمات از منوی سمت چپ در دسترسه.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                chrome.tabs.create({ url: chrome.runtime.getURL('options.html#algorithm') });
                                            }}
                                            endIcon={
                                                <SvgIcon sx={{ fontSize: '0.85rem !important' }}>
                                                    <path d={mdiOpenInNew} />
                                                </SvgIcon>
                                            }
                                            sx={{
                                                fontSize: '0.75rem',
                                                fontFamily: 'iranyekan',
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                minWidth: 'auto',
                                                px: 1.25,
                                                py: 0.25,
                                                borderRadius: '6px !important',
                                                color: accentColor,
                                                border: isDarkMode
                                                    ? '1px solid rgba(0, 233, 255, 0.35)'
                                                    : '1px solid rgba(30, 64, 175, 0.3)',
                                                '&:hover': {
                                                    color: isDarkMode ? '#4dd4ff' : '#3b82f6',
                                                    backgroundColor: isDarkMode
                                                        ? 'rgba(0, 233, 255, 0.1)'
                                                        : 'rgba(30, 64, 175, 0.1)'
                                                }
                                            }}
                                        >
                                            صفحه تست الگوریتم
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    {defaultOffNote}
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor,
                                            mb: 0.8
                                        }}
                                    >
                                        اگر افزونه روی سایت مورد نظرتون فعال نمی‌شه یا کار نمی‌کنه، مراحل زیر رو به ترتیب تست کنید. در ۹۰٪ مواقع مشکل با این موارد حل میشه و اگر نشد به پشتیبانی پیام بدید:
                                    </Typography>
                                    <Box
                                        component="ol"
                                        className="install-hint-banner-list"
                                        style={{ marginRight: '18px', paddingRight: '18px', paddingLeft: 0 }}
                                        sx={{ m: 0, mb: 0.8 }}
                                    >
                                        {troubleshootingSteps.map((step) => (
                                            <Typography
                                                key={step}
                                                component="li"
                                                sx={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 400,
                                                    fontFamily: 'iranyekan',
                                                    lineHeight: 1.7,
                                                    color: textColor,
                                                    mb: 0.35
                                                }}
                                            >
                                                {step}
                                            </Typography>
                                        ))}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: isDarkMode ? '#ffcc80' : '#e65100',
                                            mb: 0.5
                                        }}
                                    >
                                        ⚠️ نکته مهم: اگر تمام مراحل بالا رو انجام دادید و باز هم مشکل حل نشد، احتمالاً سایت هدف به‌روزرسانی داده و افزونه با نسخه جدید سایت هماهنگ نیست.
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 400,
                                            fontFamily: 'iranyekan',
                                            lineHeight: 1.7,
                                            color: textColor
                                        }}
                                    >
                                        در این شرایط، آدرس سایت و مشکل رو برای پشتیبانی ارسال کنید تا در سریع‌ترین زمان ممکن بررسی و آپدیت افزونه ارائه بشه.
                                    </Typography>
                                </>
                            )}
                            {onDismiss && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                                    <Button
                                        size="small"
                                        onClick={() => setHideConfirmOpen(true)}
                                        sx={{
                                            fontSize: '0.75rem',
                                            fontFamily: 'iranyekan',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            minWidth: 'auto',
                                            px: 1.5,
                                            py: 0.25,
                                            borderRadius: '6px !important',
                                            color: accentColor,
                                            '&:hover': {
                                                color: isDarkMode ? '#4dd4ff' : '#3b82f6',
                                                backgroundColor: isDarkMode
                                                    ? 'rgba(0, 233, 255, 0.1)'
                                                    : 'rgba(30, 64, 175, 0.1)'
                                            }
                                        }}
                                    >
                                        متوجه شدم
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </>
            )}
            <Dialog
                open={hideConfirmOpen}
                onClose={() => setHideConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ direction: 'rtl', textAlign: 'right', fontSize: '1rem', fontWeight: 500, padding: '16px 16px 8px 16px', fontFamily: 'iranyekan' }}>
                    پنهان کردن پیام
                </DialogTitle>
                <DialogContent style={{ direction: 'rtl', textAlign: 'right', padding: '8px 16px' }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontFamily: 'iranyekan',
                            lineHeight: 1.8
                        }}
                    >
                        این پیام پنهان بشه؟
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px 16px', gap: '8px', flexDirection: 'row-reverse' }}>
                    <Button
                        onClick={() => {
                            setHideConfirmOpen(false);
                            onDismiss?.();
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        بله
                    </Button>
                    <Button
                        onClick={() => setHideConfirmOpen(false)}
                        variant="text"
                        color="primary"
                        sx={{ fontFamily: 'iranyekan', textTransform: 'none' }}
                    >
                        خیر
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InstallHintBanner;
