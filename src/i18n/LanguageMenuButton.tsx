import React from 'react';
import { Box, Menu, MenuItem, SvgIcon } from '@mui/material';
import { mdiTranslate } from '@mdi/js';
import { useI18n } from './I18nProvider';

type LanguageMenuButtonProps = {
    compact?: boolean;
};

export default function LanguageMenuButton({ compact = false }: LanguageMenuButtonProps) {
    const { t, locale, locales, setLocale } = useI18n();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const current = locales.find((item) => item.code === locale) ?? locales[0];

    return (
        <>
            <Box
                component="button"
                type="button"
                aria-label={t('header.language')}
                aria-haspopup="listbox"
                aria-expanded={Boolean(anchorEl)}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                dir="ltr"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: compact ? 0.35 : 0.5,
                    flexShrink: 0,
                    margin: 0,
                    px: compact ? 0.55 : 0.75,
                    py: compact ? 0.3 : 0.4,
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.92)',
                    background: 'transparent',
                    fontFamily: 'iranyekan',
                    fontWeight: 500,
                    fontSize: compact ? '0.68rem' : '0.85rem',
                    lineHeight: 1,
                    '&:hover': {
                        color: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.55)',
                    },
                }}
            >
                {compact ? current.shortLabel : current.nativeName}
                <SvgIcon sx={{ fontSize: compact ? '0.95rem' : '1.05rem', color: 'inherit' }}>
                    <path d={mdiTranslate} />
                </SvgIcon>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                MenuListProps={{ dir: 'rtl' }}
                PaperProps={{ dir: 'rtl' }}
            >
                {locales.map((item) => (
                    <MenuItem
                        key={item.code}
                        dir="rtl"
                        selected={item.code === locale}
                        onClick={() => {
                            setLocale(item.code);
                            setAnchorEl(null);
                        }}
                        sx={{
                            fontFamily: 'iranyekan',
                            fontSize: '0.9rem',
                            minWidth: 140,
                            justifyContent: 'flex-start',
                            textAlign: 'right',
                        }}
                    >
                        {item.nativeName}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
