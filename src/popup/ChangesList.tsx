import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme, SvgIcon } from '@mui/material';
import { mdiFormatListBulleted, mdiArrowUp, mdiCheck } from '@mdi/js';
import { previousChanges, splitVersionChanges, getSiteShortName, versionChanges, filterVersionChangesForBrowser } from '../constants/versionChanges';
import { isFirefoxRuntime } from '../utils/isFirefox';
import { useI18n } from '../i18n';

const ChangesList: React.FC = () => {
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { menuChanges, features, updatedSites, addedSites } = splitVersionChanges(
        filterVersionChangesForBrowser(versionChanges, isFirefoxRuntime())
    );

    const renderSiteGrid = (siteList: typeof updatedSites) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 0.75 }}>
            {siteList.map((site) => (
                <Box
                    key={site.id}
                    title={site.text}
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.4,
                        p: 0.75,
                        borderRadius: 1.5,
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            position: 'absolute',
                            top: 2,
                            left: 5,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: site.type === 'add'
                                ? (isDarkMode ? '#00ff7f' : '#2E7D32')
                                : (isDarkMode ? '#ff8c00' : '#ef6c00')
                        }}
                    >
                        {site.type === 'add' ? '+' : '↻'}
                    </Box>
                    <Box
                        component="img"
                        src={chrome.runtime.getURL('images/' + site.icon)}
                        alt={getSiteShortName(site)}
                        sx={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        textAlign: 'center',
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {getSiteShortName(site)}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
    
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
                    {t('changes.title')}
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ maxHeight: '280px', overflowY: 'auto', pr: 1 }}>
                    <Box sx={{ mb: 1 }}>
                        <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            {menuChanges.length > 0 && (
                                <Box>
                                    <Typography variant="body2" sx={{
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        fontWeight: 700,
                                        mb: 0.5,
                                        fontSize: '0.8rem'
                                    }}>
                                        {t('changes.menuChanges')}
                                    </Typography>
                                    {menuChanges.map((change, changeIndex) => (
                                        <Typography key={`menu-${changeIndex}-${change.id}`} variant="body2" sx={{ 
                                            color: isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)', 
                                            mb: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
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
                                            {change.note && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: 300,
                                                        color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                                                        mr: 0.5
                                                    }}
                                                >
                                                    {change.note}
                                                </Box>
                                            )}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                            {features.length > 0 && (
                                <Box>
                                    <Typography variant="body2" sx={{
                                        color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                        fontWeight: 700,
                                        mb: 0.5,
                                        fontSize: '0.8rem'
                                    }}>
                                        {t('changes.versionChanges')}
                                    </Typography>
                                    {features.map((change, changeIndex) => (
                                        <Typography key={`version-${changeIndex}-${change.id}`} variant="body2" sx={{ 
                                            color: isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)', 
                                            mb: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 0.5,
                                            fontWeight: 600
                                        }}>
                                            {/^(sites|logo)\//.test(String(change.icon || '')) && (
                                                <Box
                                                    component="img"
                                                    src={chrome.runtime.getURL('images/' + change.icon)}
                                                    alt=""
                                                    sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                                                />
                                            )}
                                            <SvgIcon sx={{ 
                                                fontSize: '0.9rem',
                                                color: isDarkMode ? '#4CAF50' : '#2E7D32'
                                            }}>
                                                <path d={mdiCheck} />
                                            </SvgIcon>
                                            {change.text}
                                            {change.note && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: 300,
                                                        color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                                                        mr: 0.5
                                                    }}
                                                >
                                                    {change.note}
                                                </Box>
                                            )}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                        {(updatedSites.length > 0 || addedSites.length > 0) && (
                            <Box sx={{ mt: 1.25, pl: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                {updatedSites.length > 0 && (
                                    <Box>
                                        <Typography variant="body2" sx={{
                                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            fontWeight: 700,
                                            mb: 0.75,
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1
                                        }}>
                                            {t('changes.updatedSites')}
                                            <Box component="span" sx={{ fontWeight: 600, color: isDarkMode ? '#ff8c00' : '#ef6c00' }}>
                                                {t('changes.siteCount', { count: updatedSites.length })}
                                            </Box>
                                        </Typography>
                                        {renderSiteGrid(updatedSites)}
                                    </Box>
                                )}
                                {addedSites.length > 0 && (
                                    <Box>
                                        <Typography variant="body2" sx={{
                                            color: isDarkMode ? '#00e9ff' : '#1c39bb',
                                            fontWeight: 700,
                                            mb: 0.75,
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1
                                        }}>
                                            {t('changes.addedSites')}
                                            <Box component="span" sx={{ fontWeight: 600, color: isDarkMode ? '#00e9ff' : '#1c39bb' }}>
                                                {t('changes.siteCount', { count: addedSites.length })}
                                            </Box>
                                        </Typography>
                                        {renderSiteGrid(addedSites)}
                                    </Box>
                                )}
                            </Box>
                        )}
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
                                {t('changes.previous')}
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
