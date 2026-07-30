import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme, SvgIcon } from '@mui/material';
import { mdiFormatListBulleted, mdiArrowUp, mdiCheck } from '@mdi/js';
import { versionChanges, previousChanges } from '../constants/versionChanges';

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
                <Box sx={{ maxHeight: '280px', overflowY: 'auto', pr: 1 }}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                            color: isDarkMode ? '#4CAF50' : '#2E7D32', 
                            fontWeight: 700, 
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
                            تغییرات این نسخه
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            {versionChanges.map((change, changeIndex) => (
                                <Typography key={`version-${changeIndex}-${change.id}`} variant="body2" sx={{ 
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)', 
                                    mb: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontWeight: 600
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
                    </Box>

                    <Accordion
                        disableGutters
                        elevation={0}
                        sx={{
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': { margin: 0 }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<Typography sx={{
                                color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                fontSize: '0.7rem'
                            }}>▼</Typography>}
                            sx={{
                                minHeight: 36,
                                px: 0,
                                '& .MuiAccordionSummary-content': {
                                    margin: '6px 0'
                                }
                            }}
                        >
                            <Typography variant="body2" sx={{
                                color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                fontWeight: 600
                            }}>
                                تغییرات قبلی
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0 }}>
                            {previousChanges.map((versionData, index) => (
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
                                        {versionData.changes.map((change, changeIndex) => (
                                            <Typography key={`${versionData.version}-${changeIndex}-${change.id}`} variant="body2" sx={{ 
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
                                    {index < previousChanges.length - 1 && (
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
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default ChangesList;
