import { useEffect, useState } from 'react';

function finishOnce(done: { current: boolean }, resolve: (value: boolean) => void, value: boolean) {
    if (done.current) {
        return;
    }
    done.current = true;
    resolve(value);
}

function askBridge(tabId: number, finish: (value: boolean) => void) {
    try {
        chrome.tabs.sendMessage(tabId, { action: 'harnessPluginPresent' }, (response) => {
            if (chrome.runtime.lastError) {
                finish(false);
                return;
            }
            finish(response?.present === true);
        });
    } catch {
        finish(false);
    }
}

// True only when this tab's page has published data-ai-rtl-dsh-present.
export function askHarnessPluginPresent(): Promise<boolean> {
    return new Promise((resolve) => {
        const done = { current: false };
        const timer = window.setTimeout(() => finishOnce(done, resolve, false), 1500);
        const finish = (value: boolean) => {
            window.clearTimeout(timer);
            finishOnce(done, resolve, value);
        };
        try {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tabId = tabs && tabs[0] ? tabs[0].id : undefined;
                if (tabId == null) {
                    finish(false);
                    return;
                }
                const scripting = chrome.scripting;
                if (!scripting || !scripting.executeScript) {
                    askBridge(tabId, finish);
                    return;
                }
                scripting.executeScript({
                    target: { tabId },
                    func: () => document.documentElement?.getAttribute('data-ai-rtl-dsh-present') === 'on',
                }).then((results) => {
                    finish(results?.[0]?.result === true);
                }).catch(() => {
                    askBridge(tabId, finish);
                });
            });
        } catch {
            finish(false);
        }
    });
}

// null while the active Harness tab has not been read yet.
export function useHarnessPluginPresent(enabled: boolean): boolean | null {
    const [present, setPresent] = useState<boolean | null>(null);

    useEffect(() => {
        if (!enabled) {
            setPresent(null);
            return undefined;
        }
        let cancelled = false;
        let retry = 0;
        setPresent(null);
        askHarnessPluginPresent().then((first) => {
            if (cancelled) {
                return;
            }
            if (first) {
                setPresent(true);
                return;
            }
            // A late plugin publish should not flash the desktop note first.
            retry = window.setTimeout(() => {
                askHarnessPluginPresent().then((second) => {
                    if (!cancelled) {
                        setPresent(second);
                    }
                });
            }, 400);
        });
        return () => {
            cancelled = true;
            window.clearTimeout(retry);
        };
    }, [enabled]);

    return present;
}
