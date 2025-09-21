import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ServiceList from './list';
import './App.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontFamily: ['"iranyekan"'].join(','),
        fontSize: 10,
    },
});

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className="App">
                <div className="appinfo">
                    <div className="appinfo-name">
                        ChatGPT RTL (Persian/Farsi)
                    </div>
                    <div className="appinfo-text">
                        <p>
                            این افزونه ساخته شده تا استفاده از هوش مصنوعی برای فارسی زبانان شیرین تر و لذت بخش تر باشد.
                        </p>
                    </div>
                </div>

                <div className="listSite">
                    <ServiceList />
                </div>

                <div className="appinfo">
                    <div className="appinfo-note">
                        <span>یاداشت برنامه نویس</span>
                        <p>
                            در ابتدا این افزونه صرفا برای ChatGPT اصلی ساخته شده بود...
                            ولی با توجه به استقبال فراوان و درخواست کاربران برای سایت های دیگر نیز فعال شد.
                        </p>
                        <p>
                            باید توجه داشت که این افزونه روی قالب اصلی سایت ها تغیر اعمال میکند و در صورتی که این
                            سایت ها برای آپدیت، ساختار قالب را تغیر دهند ممکن است این افزونه از کار بیوفتد یا بخشی از آن
                            کار نکند.
                            در صورت مشاهده به من خبر دهید تا با نسخه جدید سازگار کنم!
                        </p>
                    </div>

                    <div className="appinfo-link">
                        <a href="https://alisaffari.ir/" target="_blank" rel="noopener noreferrer">
                            ارتباط با من
                        </a>
                    </div>

                    <div className="appinfo-note">
                        <p>
                            اگر دوست داشتید برای افزونه نظر ثبت کنید تا این افزونه بیشتر دیده بشه و من بیشتر انرژی بگیرم 😀
                        </p>
                    </div>

                    <div className="appinfo-link">
                        <a 
                            href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            صفحه افزونه
                        </a>
                    </div>

                    <div className="appinfo-note">
                        <p>
                            افزونه‌ی ChatGPT RTL (Persian/Farsi) با عشق برای فارسی‌زبان‌ها ساخته شده و رایگانه. اگه برات مفید بوده و دوست داری توسعه‌ش ادامه پیدا کنه، می‌تونی با یه دونیت کوچیک ازم حمایت کنی.
                            <br />
                            ✔️ حمایت‌ها صرف به‌روزرسانی، اضافه کردن امکانات جدید و بهتر شدن افزونه می‌شن.
                        </p>
                    </div>

                    <div className="appinfo-link">
                        <a href="https://zarinp.al/719522" target="_blank" rel="noopener noreferrer">
                            حمایت مالی (دونیت)
                        </a>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}

export default App;