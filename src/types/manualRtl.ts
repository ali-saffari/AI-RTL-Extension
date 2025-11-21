export interface ManualRtlSettings {
    highlightMode: 'disabled' | 'on_selection' | 'on_direction_change';
    highlightColor: string;
    highlightOpacity: number;
    logoDisplay: 'always' | 'on_hover' | 'disabled';
    manualRtlEnabled?: boolean;
    manualRtlSiteMode?: 'all' | 'ai_sites' | 'allowed_sites' | 'ai_and_allowed';
    menuDisplayMode?: 'logo_first' | 'menu_direct';
    applyFont?: boolean;
}

export interface ManualRtlActiveSite {
    hostname: string;
    favicon?: string;
    addedAt: number;
}

export const DEFAULT_MANUAL_RTL_SETTINGS: ManualRtlSettings = {
    manualRtlEnabled: true,
    manualRtlSiteMode: 'all',
    menuDisplayMode: 'logo_first',
    highlightMode: 'on_direction_change',
    highlightColor: '#ff0000',
    highlightOpacity: 0.3,
    logoDisplay: 'always',
    applyFont: true
};

