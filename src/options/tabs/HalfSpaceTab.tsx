import React from 'react';
import {
    Box,
    Typography,
    Switch,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Divider,
    useTheme
} from '@mui/material';
import { services } from '../../popup/list';
import {
    HALF_SPACE_STORAGE_KEY,
    isHalfSpaceEnabledForSite,
    normalizeHalfSpaceSites
} from '../../constants/halfSpaceHotkey';

interface HalfSpaceTabProps {
    isDarkMode: boolean;
}

const HalfSpaceTab: React.FC<HalfSpaceTabProps> = ({ isDarkMode }) => {
    const theme = useTheme();
    const [sites, setSites] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        chrome.storage.sync.get([HALF_SPACE_STORAGE_KEY], (result) => {
            setSites(normalizeHalfSpaceSites(result[HALF_SPACE_STORAGE_KEY]));
        });

        const handleStorageChange = (
            changes: { [key: string]: chrome.storage.StorageChange },
            areaName: string
        ) => {
            if (areaName === 'sync' && changes[HALF_SPACE_STORAGE_KEY]) {
                setSites(normalizeHalfSpaceSites(changes[HALF_SPACE_STORAGE_KEY].newValue));
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    const handleToggle = (serviceKey: string) => (
        _event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        const next = {
            ...normalizeHalfSpaceSites(sites),
            [serviceKey]: checked
        };
        setSites(next);
        chrome.storage.sync.set({ [HALF_SPACE_STORAGE_KEY]: next });
    };

    const accent = isDarkMode ? '#00e9ff' : '#1c39bb';

    return (
        <Card elevation={2}>
            <CardContent>
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: 'primary.main',
                            mb: 0.5
                        }}
                    >
                        نیم‌فاصله با Ctrl+Shift+2
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', lineHeight: 1.8, maxWidth: 640, mx: 'auto' }}
                    >
                        هنگام تایپ در کادر پیام، با کلید ترکیبی Ctrl+Shift+2 یک نیم‌فاصله درج می‌شود.
                        این قابلیت برای هر سایت جداگانه روشن یا خاموش می‌شود. به‌صورت پیش‌فرض فقط ChatGPT فعال است.
                    </Typography>
                </Box>

                <List disablePadding>
                    {services.map((service, index) => {
                        const enabled = isHalfSpaceEnabledForSite(sites, service.key);
                        return (
                            <React.Fragment key={service.key}>
                                {index > 0 && <Divider component="li" />}
                                <ListItem
                                    sx={{
                                        px: 1,
                                        py: 0.75,
                                        direction: 'ltr'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 44 }}>
                                        <Avatar
                                            src={chrome.runtime.getURL(service.icon)}
                                            alt={service.name}
                                            sx={{ width: 28, height: 28 }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={service.name}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontFamily: 'iranyekan',
                                                fontWeight: 500,
                                                color: theme.palette.text.primary
                                            }
                                        }}
                                    />
                                    <Switch
                                        checked={enabled}
                                        onChange={handleToggle(service.key)}
                                        inputProps={{ 'aria-label': `نیم‌فاصله ${service.name}` }}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: accent
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: accent
                                            }
                                        }}
                                    />
                                </ListItem>
                            </React.Fragment>
                        );
                    })}
                </List>
            </CardContent>
        </Card>
    );
};

export default HalfSpaceTab;
