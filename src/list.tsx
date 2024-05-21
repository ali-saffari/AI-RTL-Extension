import React, {useEffect, useState} from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';

export default function SwitchListSecondary() {
    const [checked, setChecked] = React.useState<any>({
        chatGpt: true,
        claude: true,
        copilot: true,
        freegpt: true
    });





    // const [chatgpt, setChatgpt] = React.useState<any>(true);


    // chatGpt , claude ,  copilot ,  freegpt

    useEffect(() => {


        chrome.storage.sync.get(['chatGpt' , 'claude' ,  'copilot' ,  'freegpt'], (data) => {
            // @ts-ignore

            console.log("Get DAta" , data)

            return setChecked(data);
        });
    }, []);






    // chatGpt , claude ,  copilot ,  freegpt


    let copilotIconURL = chrome.runtime.getURL("/images/copilot-icon.png");
    let chatgptIconURL = chrome.runtime.getURL("/images/chatgpt-icon.png");
    let claudeIconURL = chrome.runtime.getURL("/images/claude-icon.png");
    let openAiIconURL = chrome.runtime.getURL("/images/openAi-icon.png");


    return (
        <List
            sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
            subheader={<ListSubheader style={{direction: 'rtl', textAlign:'center', lineHeight: '11px'}}>سایت هایی که پشتیبانی میشود</ListSubheader>}
        >

            <a href={'https://chatgpt.com/'} target={'_blank'}>
                <ListItem disablePadding>
                    <ListItemButton>

                        <ListItemIcon sx={{minWidth: 40}}>
                            {/*<WifiIcon />*/}

                            <Avatar sx={{width: 30, height: 30}} sizes={'small'} alt="ChatGPT" src={openAiIconURL}/>

                        </ListItemIcon>
                        <ListItemText id="switch-list-label-chatGpt" primary="ChatGPT"/>
                        <Switch
                            edge="end"
                            onChange={(e , aa) => {
                                console.log("onChange" , e, aa)

                                chrome.storage.sync.set({ chatGpt: aa });

                                return setChecked({...checked , chatGpt: aa });


                                // setChatgpt(aa);
                            }}
                            checked={checked && checked.chatGpt ? true : false}
                            inputProps={{
                                'aria-labelledby': 'switch-list-label-chatGpt',
                            }}
                        />

                    </ListItemButton>
                </ListItem>
            </a>
            <Divider/>
            <a href={'https://www.bing.com/chat?setlang=fa'} target={'_blank'}>
                <ListItem disablePadding>
                    <ListItemButton>

                        <ListItemIcon sx={{minWidth: 40}}>
                            <Avatar sx={{width: 30, height: 30}} sizes={'small'} alt="copilot" src={copilotIconURL}/>
                        </ListItemIcon>
                        <ListItemText id="switch-list-label-copilot" primary="Copilot"/>
                        <Switch
                            edge="end"
                            onChange={(e , aa) => {
                                console.log("onChange" , e, aa)

                                chrome.storage.sync.set({ copilot: aa });

                                return setChecked({...checked , copilot: aa });


                                // setChatgpt(aa);
                            }}
                            checked={checked && checked.copilot ? true : false}
                            inputProps={{
                                'aria-labelledby': 'switch-list-label-copilot',
                            }}
                        />
                    </ListItemButton>
                </ListItem>

            </a>
            <Divider/>
            <a href={'https://claude.ai'} target={'_blank'}>
                <ListItem disablePadding>
                    <ListItemButton>

                        <ListItemIcon sx={{minWidth: 40}}>
                            <Avatar sx={{width: 30, height: 30}} sizes={'small'} alt="Claude" src={claudeIconURL}/>
                        </ListItemIcon>
                        <ListItemText id="switch-list-label-claude" primary="Claude"/>
                        <Switch
                            edge="end"
                            onChange={(e , aa) => {
                                console.log("onChange" , e, aa)

                                chrome.storage.sync.set({ claude: aa });

                                return setChecked({...checked , claude: aa });


                                // setChatgpt(aa);
                            }}
                            checked={checked && checked.claude ? true : false}
                            inputProps={{
                                'aria-labelledby': 'switch-list-label-claude',
                            }}
                        />

                    </ListItemButton>
                </ListItem>

            </a>

            <Divider/>
            <a href={'https://freegpt.cc/'} target={'_blank'}>
                <ListItem disablePadding>
                    <ListItemButton>

                        <ListItemIcon sx={{minWidth: 40}}>
                            <Avatar sx={{width: 30, height: 30}} sizes={'small'} alt="FreeGPT" src={chatgptIconURL}/>
                        </ListItemIcon>
                        <ListItemText id="switch-list-label-freegpt" primary="FreeGPT"/>
                        <Switch
                            edge="end"
                            onChange={(e , aa) => {
                                console.log("onChange" , e, aa)

                                chrome.storage.sync.set({ freegpt: aa });

                                return setChecked({...checked , freegpt: aa });


                                // setChatgpt(aa);
                            }}
                            checked={checked && checked.freegpt ? true : false}
                            inputProps={{
                                'aria-labelledby': 'switch-list-label-freegpt',
                            }}
                        />

                    </ListItemButton>
                </ListItem>

            </a>

        </List>
    )
        ;
}