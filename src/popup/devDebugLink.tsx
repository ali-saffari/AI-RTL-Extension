import React from 'react';
import { SvgIcon } from '@mui/material';
import { mdiBugOutline } from '@mdi/js';

export default function DevDebugLink() {
    const openDebugPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const url = chrome.runtime.getURL('debug.html');
        chrome.tabs.create({ url }).catch(() => {
            window.open(url, '_blank');
        });
    };

    return (
        <a
            href={chrome.runtime.getURL('debug.html')}
            target="_blank"
            rel="noopener noreferrer"
            className="popup-side-item"
            aria-label="دیباگ"
            style={{ color: '#f59e0b' }}
            onClick={openDebugPage}
        >
            <span className="popup-side-item-icon">
                <SvgIcon>
                    <path d={mdiBugOutline} />
                </SvgIcon>
            </span>
            <span className="popup-side-item-label">دیباگ</span>
        </a>
    );
}
