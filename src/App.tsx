import * as React from 'react';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import List from './list'
import "./App.css"












const darkTheme = createTheme({
    // direction: 'rtl',
    palette: {
        mode: 'dark',
    },
    typography: {
        fontFamily: [
            '"iranyekan"',
        ].join(','),
        fontSize: 10,
    },

});


function App() {

    let iconURL = chrome.runtime.getURL("/images/icon-48.png");


    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <div className="App">


                <div className="appinfo">
                    {/*<img src={iconURL} alt=""/>*/}

                    <div className="appinfo-name">
                        ChatGPT RTL (Persian/Farsi)
                    </div>

                    <div className="appinfo-text">
                        <p>
                            این افزونه ساخته شده تا استفاده از هوش مصنوعی برای فارسی زبانان شیرین تر و لذت بخش تر باشد.
                        </p>


                    </div>


                </div>

                {/*<Button variant="contained">Hello world</Button>*/}

                <div className="listSite">
                    <List/>
                </div>


                <div className="appinfo">


                    <div className="appinfo-note">


                      <span>
                          یاداشت برنامه نویس
                      </span>
                        <p>

                            در ابتدا این افزونه صرفا برای
                            ChatGPT
                            اصلی ساخته شده بود...
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

                        <a href={'https://alisaffari.ir/'} target={'_blank'}>
                            ارتباط با من
                        </a>


                    </div>


                    <div className="appinfo-note">

                        <p>

                            اگر دوست داشتید برای افزونه نظر ثبت کنید تا این افزونه بیشتر دیده بشه و من بیشتر انرژی بگیرم 😀
                        </p>


                    </div>

                    <div className="appinfo-link">

                        <a href={'https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne'}
                           target={'_blank'}>
                            صفحه افزونه
                        </a>
                    </div>

                </div>


            </div>
        </ThemeProvider>
    );
}


export default App;
