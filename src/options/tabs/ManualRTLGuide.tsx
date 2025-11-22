import React from 'react';
import { Typography, Box, Divider, useTheme } from '@mui/material';

interface ManualRTLGuideProps {
    image1Url?: string;
    image2Url?: string;
    image3Url?: string;
}

export const ManualRTLGuide: React.FC<ManualRTLGuideProps> = ({ image1Url, image2Url, image3Url }) => {
    const theme = useTheme();
    
    return (
        <>
            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                🎯 معرفی قابلیت
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                قابلیت «راست‌چین دستی» به شما امکان می‌دهد تا به صورت دستی و دقیق، متن‌های مورد نظر خود را در هر سایتی راست‌چین یا چپ‌چین کنید. این قابلیت برای مواقعی که الگوریتم هوشمند خودکار به درستی کار نمی‌کند یا شما می‌خواهید کنترل بیشتری روی جهت متن داشته باشید، بسیار مفید است.
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                ✅ نحوه فعال‌سازی
            </Typography>

            {image1Url && (
                <Box sx={{ 
                    mt: 2, 
                    mb: 2,
                    textAlign: 'center'
                }}>
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                        }}
                    >
                        <img 
                            src={image1Url}
                            alt="درخواست مجوز دسترسی به تب‌ها"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                </Box>
            )}

            <Typography component="ol" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    ابتدا مطمئن شوید که قابلیت «راست‌چین دستی» در حالت فعال قرار دارد (Switch را روشن کنید)
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    در اولین بار استفاده، مرورگر از شما مجوز دسترسی به تب‌ها را درخواست می‌کند
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    روی دکمه «اعطای دسترسی» کلیک کنید تا قابلیت فعال شود
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                📌 روش فعال کردن این قابلیت برای هر سایت
            </Typography>
            <Typography component="ol" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    برای فعال کردن قابلیت روی هر سایت، باید از طریق پاپ‌آپ (Popup) افزونه اقدام کنید:
                </Typography>
            </Typography>

            {image2Url && (
                <Box sx={{ 
                    mt: 2, 
                    mb: 2,
                    textAlign: 'center'
                }}>
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                        }}
                    >
                        <img 
                            src={image2Url}
                            alt="فعال‌سازی راست‌چین دستی از طریق پاپ‌آپ"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2, px: '14px', lineHeight: 2, color: 'text.secondary' }}>
                        برای نمونه برای chatgpt-rtl.ir فعال می‌کنیم
                    </Typography>
                </Box>
            )}

            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    روی آیکون افزونه در نوار ابزار مرورگر کلیک کنید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    در پاپ‌آپ باز شده، بخش «راست‌چین دستی» را پیدا کنید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    Switch مربوط به «راست‌چین دستی» را برای سایت فعلی فعال کنید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    این کار باید برای هر سایت به صورت جداگانه انجام شود
                </Typography>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                🚀 نحوه استفاده (مراحل ساده)
            </Typography>

            {image3Url && (
                <Box sx={{ 
                    mt: 2, 
                    mb: 2,
                    textAlign: 'center'
                }}>
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                        }}
                    >
                        <img 
                            src={image3Url}
                            alt="نحوه استفاده از راست‌چین دستی"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                </Box>
            )}

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مرحله ۱: انتخاب متن
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    متن مورد نظر خود را در صفحه انتخاب کنید (مثل انتخاب متن در مرورگر)
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    می‌توانید یک کلمه، جمله، پاراگراف یا هر بخشی از متن را انتخاب کنید
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مرحله ۲: نمایش منو
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    بعد از انتخاب متن، یک منوی کوچک در کنار متن انتخاب شده ظاهر می‌شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    این منو شامل دو گزینه است: «راست چین» و «چپ چین»
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مرحله ۳: انتخاب جهت
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    روی گزینه «راست چین» کلیک کنید تا متن به راست چین شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    یا روی گزینه «چپ چین» کلیک کنید تا متن به چپ چین شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    تغییر جهت به صورت فوری و خودکار اعمال می‌شود
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مرحله ۴: تکرار (در صورت نیاز)
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    می‌توانید این فرآیند را برای بخش‌های دیگر متن نیز تکرار کنید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    هر بخش به صورت مستقل قابل تغییر جهت است
                </Typography>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                ⚙️ حالت‌های نمایش منو
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                این قابلیت دو حالت نمایش منو دارد که می‌توانید از تنظیمات پیشرفته انتخاب کنید:
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                📌 حالت ۱: ابتدا لوگو نمایش داده شود (دو مرحله‌ای)
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    در این حالت، ابتدا یک لوگوی کوچک در کنار متن انتخاب شده ظاهر می‌شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    با کلیک روی لوگو، منوی کامل با گزینه‌های «راست چین» و «چپ چین» باز می‌شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    این حالت برای صفحات شلوغ و جلوگیری از مزاحمت بصری مناسب است
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                📌 حالت ۲: مستقیم منو نمایش داده شود (تک مرحله‌ای)
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    در این حالت، منوی کامل به صورت مستقیم و بدون نیاز به کلیک روی لوگو ظاهر می‌شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    این حالت برای دسترسی سریع‌تر مناسب است
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                💡 نکات مهم و کاربردی
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    ✓ این قابلیت کاملاً مستقل از الگوریتم هوشمند خودکار است
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    ✓ می‌توانید همزمان از هر دو قابلیت استفاده کنید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    ✓ تغییرات فقط روی متن‌های انتخاب شده اعمال می‌شود
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    ✓ می‌توانید برای هر بخش از صفحه، جهت متفاوتی انتخاب کنید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    ✓ تغییرات تا زمان بستن صفحه یا رفرش مرورگر باقی می‌ماند
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                📝 مثال‌های کاربردی
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مثال ۱: متن چندزبانه
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    اگر صفحه شما شامل متن فارسی و انگلیسی است
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    می‌توانید بخش فارسی را راست‌چین و بخش انگلیسی را چپ‌چین کنید
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مثال ۲: تصحیح الگوریتم
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    اگر الگوریتم خودکار یک بخش را اشتباه تشخیص داده
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    می‌توانید به صورت دستی جهت صحیح را اعمال کنید
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                مثال ۳: کنترل دقیق
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    برای صفحات پیچیده که نیاز به کنترل دقیق دارید
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    می‌توانید هر بخش را به صورت جداگانه و دستی تنظیم کنید
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                ❓ سوالات متداول
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                سوال: آیا این قابلیت روی همه سایت‌ها کار می‌کند؟
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                پاسخ: این قابلیت روی سایت‌هایی که امکان فعال‌سازی وجود داشته باشد کار می‌کند و ممکن است برای بعضی سایت‌ها کار نکند.
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                سوال: آیا تغییرات ذخیره می‌شوند؟
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                پاسخ: تغییرات تا زمان بستن صفحه یا رفرش مرورگر باقی می‌مانند. برای تغییرات دائمی، باید از تنظیمات سایت استفاده کنید.
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                سوال: آیا می‌توانم چند بخش را همزمان تغییر جهت دهم؟
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                پاسخ: بله، می‌توانید هر بخش را به صورت جداگانه انتخاب کرده و جهت مورد نظر را اعمال کنید.
            </Typography>
        </>
    );
};
