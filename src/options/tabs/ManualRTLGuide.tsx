import React from 'react';
import { Typography, Box, Divider, useTheme } from '@mui/material';
import { useI18n } from '../../i18n';

interface ManualRTLGuideProps {
    image1Url?: string;
    image2Url?: string;
    image3Url?: string;
}

export const ManualRTLGuide: React.FC<ManualRTLGuideProps> = ({ image1Url, image2Url, image3Url }) => {
    const theme = useTheme();
    const { t, dir } = useI18n();
    const contentAlign = dir === 'rtl' ? 'right' : 'left';
    
    return (
        <>
            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.introTitle')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                {t('manualRtlTab.guide.intro')}
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.activateTitle')}
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
                            alt={t('manualRtlTab.guide.permissionAlt')}
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
                    {t('manualRtlTab.guide.activate1')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.activate2')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.activate3')}
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.perSiteTitle')}
            </Typography>
            <Typography component="ol" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.perSiteIntro')}
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
                            alt={t('manualRtlTab.guide.popupAlt')}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2, px: '14px', lineHeight: 2, color: 'text.secondary' }}>
                        {t('manualRtlTab.guide.sampleSite')}
                    </Typography>
                </Box>
            )}

            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.perSite1')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.perSite2')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.perSite3')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.perSite4')}
                </Typography>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.useTitle')}
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
                            alt={t('manualRtlTab.guide.useAlt')}
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
                {t('manualRtlTab.guide.step1Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step1a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step1b')}
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.step2Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step2a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step2b')}
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.step3Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step3a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step3b')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step3c')}
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.step4Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step4a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.step4b')}
                </Typography>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.modesTitle')}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                {t('manualRtlTab.guide.modesIntro')}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.mode1Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.mode1a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.mode1b')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.mode1c')}
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.mode2Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.mode2a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.mode2b')}
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.tipsTitle')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.tip1')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.tip2')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.tip3')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.tip4')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.tip5')}
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.examplesTitle')}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.example1Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.example1a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.example1b')}
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.example2Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.example2a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.example2b')}
                </Typography>
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.example3Title')}
            </Typography>
            <Typography component="ul" sx={{ pb: 2, px: '32px', lineHeight: 2 }}>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.example3a')}
                </Typography>
                <Typography component="li" sx={{ mb: 1.5 }}>
                    {t('manualRtlTab.guide.example3b')}
                </Typography>
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt: 4 }}>
                {t('manualRtlTab.guide.faqTitle')}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.faq1q')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                {t('manualRtlTab.guide.faq1a')}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.faq2q')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                {t('manualRtlTab.guide.faq2a')}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, mt: 1.5, mx: '13px' }}>
                {t('manualRtlTab.guide.faq3q')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, px: '14px', lineHeight: 2 }}>
                {t('manualRtlTab.guide.faq3a')}
            </Typography>
        </>
    );
};
