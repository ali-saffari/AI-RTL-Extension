// ============================================
// Analytics Session Manager (Content Script)
// ============================================

import { sendRuntimeMessage } from '../../utils/chromeMessaging.js';

export class SessionManager {
    constructor() {
        this.service = null;
        this.hostname = null;
        this.isActive = false;
        this.analyticsEnabled = true;
        this.init();
    }
    
    async init() {
        try {
            const settings = await chrome.storage.sync.get(['analyticsEnabled']);
            this.analyticsEnabled = settings.analyticsEnabled !== false;
            if (this.analyticsEnabled) {
                this.setupEvents();
            }
        } catch (error) {
            // Extension context might be invalidated
            if (this.isContextInvalidated(error)) {
                this.reset();
            }
        }
    }
    
    setupEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.resume();
            else this.pause();
        });
        window.addEventListener('focus', () => this.resume());
        window.addEventListener('blur', () => this.pause());
        window.addEventListener('beforeunload', () => this.stop());
        window.addEventListener('pageshow', () => this.service && this.resume());
        window.addEventListener('pagehide', () => this.pause());
    }
    
    isContextInvalidated(error) {
        if (!error) return false;
        const message = error.message || String(error);
        return message.includes('Extension context invalidated') || 
               message.includes('message port closed') ||
               !chrome.runtime?.id;
    }
    
    reset() {
        this.isActive = false;
        this.service = null;
        this.hostname = null;
    }
    
    async start(serviceKey, hostname) {
        if (!this.analyticsEnabled) return;
        if (this.isActive && this.service === serviceKey && this.hostname === hostname) return;
        
        if (this.isActive) await this.stop();
        
        this.service = serviceKey;
        this.hostname = hostname;
        this.isActive = true;
        
        try {
            await sendRuntimeMessage({
                type: 'SESSION_START',
                serviceName: serviceKey,
                hostname: hostname
            });
        } catch (error) {
            if (this.isContextInvalidated(error)) {
                this.reset();
            }
        }
    }
    
    async pause() {
        if (!this.isActive) return;
        try {
            await sendRuntimeMessage({ type: 'SESSION_PAUSE' });
        } catch (error) {
            if (this.isContextInvalidated(error)) {
                this.reset();
            }
        }
    }
    
    async resume() {
        if (!this.isActive) return;
        try {
            await sendRuntimeMessage({ type: 'SESSION_RESUME' });
        } catch (error) {
            if (this.isContextInvalidated(error)) {
                this.reset();
            }
        }
    }
    
    async stop() {
        if (!this.isActive) return;
        
        const service = this.service;
        const hostname = this.hostname;
        this.isActive = false;
        this.service = null;
        this.hostname = null;
        
        try {
            await sendRuntimeMessage({ type: 'SESSION_END' });
        } catch (error) {
            // Ignore errors when stopping (context might be invalidated)
        }
    }
}

