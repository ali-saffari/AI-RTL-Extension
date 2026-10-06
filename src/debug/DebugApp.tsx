import React from 'react';
import { buildInstallLocalDefaults, buildInstallSyncDefaults } from '../constants/installDefaults';
import { NOTICE_ALARM, NOTICE_CACHE_KEY, NOTICE_SCHEDULE_KEY } from '../background/notices';
import './debug.css';

const DEBUG_PAGE_MARKER = 'AI_RTL_DEBUG_PAGE';
const API_TARGET_KEY = 'debugApiTarget';
const API_TARGETS = {
    production: 'https://api.ai-rtl.ir',
    local: 'http://127.0.0.1:4000',
} as const;

type ApiTarget = keyof typeof API_TARGETS;

type FetchResult = {
    ok: boolean;
    status: number;
    ms: number;
    url: string;
    requestBody: Record<string, string>;
    body: unknown;
};

type NoticeCache = {
    fetchedAt?: number;
    notices?: Array<{ title?: string }>;
};

function formatTehran(timestamp: number) {
    return new Intl.DateTimeFormat('fa-IR', {
        timeZone: 'Asia/Tehran',
        dateStyle: 'short',
        timeStyle: 'medium',
    }).format(new Date(timestamp));
}

async function readUid() {
    const stored = await chrome.storage.sync.get('uid');
    return typeof stored.uid === 'string' ? stored.uid : '';
}

async function readNoticeCache(): Promise<NoticeCache | null> {
    const stored = await chrome.storage.local.get(NOTICE_CACHE_KEY);
    const value = stored[NOTICE_CACHE_KEY];
    if (!value || typeof value !== 'object') {
        return null;
    }
    return value as NoticeCache;
}

function normalizeApiTarget(value: unknown): ApiTarget {
    return value === 'local' ? 'local' : 'production';
}

export default function DebugApp() {
    const version = chrome.runtime.getManifest().version;
    const [uid, setUid] = React.useState('');
    const [uidState, setUidState] = React.useState('در حال خواندن شناسه…');
    const [copied, setCopied] = React.useState(false);
    const [cache, setCache] = React.useState<NoticeCache | null>(null);
    const [apiTarget, setApiTarget] = React.useState<ApiTarget>('production');
    const [testing, setTesting] = React.useState(false);
    const [testError, setTestError] = React.useState('');
    const [testResult, setTestResult] = React.useState<FetchResult | null>(null);
    const [confirmingReset, setConfirmingReset] = React.useState(false);
    const [resetting, setResetting] = React.useState(false);
    const [resetError, setResetError] = React.useState('');

    const loadState = React.useCallback(async () => {
        const [nextUid, nextCache, storedTarget] = await Promise.all([
            readUid(),
            readNoticeCache(),
            chrome.storage.local.get(API_TARGET_KEY),
        ]);
        setUid(nextUid);
        setCache(nextCache);
        setApiTarget(normalizeApiTarget(storedTarget[API_TARGET_KEY]));
        setUidState(nextUid ? '' : 'شناسه هنوز ساخته نشده. یک‌بار پاپ‌آپ را باز کنید یا افزونه را ریست کنید.');
    }, []);

    React.useEffect(() => {
        loadState().catch(() => {
            setUidState('خواندن حافظه افزونه ناموفق بود.');
        });
    }, [loadState]);

    const copyUid = async () => {
        if (!uid) return;
        try {
            await navigator.clipboard.writeText(uid);
        } catch {
            const input = document.createElement('textarea');
            input.value = uid;
            input.setAttribute('readonly', '');
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const chooseApiTarget = async (next: ApiTarget) => {
        setApiTarget(next);
        await chrome.storage.local.set({ [API_TARGET_KEY]: next });
        if (next === apiTarget) return;
        await chrome.storage.local.remove([NOTICE_CACHE_KEY, NOTICE_SCHEDULE_KEY]);
        await chrome.alarms.clear(NOTICE_ALARM);
        setCache(null);
        setTestResult(null);
        setTestError('');
    };

    const testFetch = async () => {
        if (!uid || testing) return;
        setTesting(true);
        setTestError('');
        setTestResult(null);
        const requestBody = {
            tool_id: 'ai-rtl',
            version,
            uid,
        };
        const url = `${API_TARGETS[apiTarget]}/api/tools/notices`;
        const started = Date.now();
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const text = await response.text();
            let body: unknown = text;
            try {
                body = JSON.parse(text);
            } catch {
                body = text;
            }
            setTestResult({
                ok: response.ok,
                status: response.status,
                ms: Date.now() - started,
                url,
                requestBody,
                body,
            });
            if (!response.ok) {
                setTestError('سرور پاسخ موفق نداد.');
            }
        } catch (error) {
            setTestError(error instanceof Error ? error.message : 'دریافت اطلاعات ناموفق بود.');
        } finally {
            setTesting(false);
        }
    };

    const resetExtension = async () => {
        if (resetting) return;
        setResetting(true);
        setResetError('');
        try {
            await chrome.storage.sync.clear();
            await chrome.storage.local.clear();
            await chrome.storage.sync.set(buildInstallSyncDefaults());
            const localDefaults = buildInstallLocalDefaults();
            if (Object.keys(localDefaults).length > 0) {
                await chrome.storage.local.set(localDefaults);
            }
            await chrome.alarms.clear(NOTICE_ALARM);
            chrome.runtime.reload();
        } catch (error) {
            setResetting(false);
            setResetError(error instanceof Error ? error.message : 'ریست حافظه ناموفق بود.');
        }
    };

    const notices = testResult && testResult.body && typeof testResult.body === 'object'
        ? (testResult.body as { data?: { notices?: Array<{ id?: string; title?: string; body?: string }> } }).data?.notices
        : undefined;

    return (
        <main className="debug-shell" data-debug-build={DEBUG_PAGE_MARKER}>
            <header className="debug-header">
                <div>
                    <p className="debug-kicker">فقط بیلد توسعه</p>
                    <h1>دیباگ افزونه</h1>
                    <p>این صفحه در بیلد انتشار ساخته نمی‌شود.</p>
                </div>
                <span className="debug-version">نسخه {version}</span>
            </header>

            <section className="debug-card">
                <h2>شناسه کاربر</h2>
                <div className="debug-uid-row">
                    <code className="debug-uid">{uid || '—'}</code>
                    <button type="button" className="debug-button" onClick={copyUid} disabled={!uid}>
                        {copied ? 'کپی شد' : 'کپی'}
                    </button>
                    <button type="button" className="debug-button-quiet" onClick={() => loadState()}>
                        خواندن دوباره
                    </button>
                </div>
                {uidState ? <p className="debug-status">{uidState}</p> : null}
            </section>

            <section className="debug-card">
                <h2>تست دریافت اطلاعات</h2>
                <p>
                    یک درخواست واقعی می‌فرستد و پاسخ را همین‌جا نشان می‌دهد.
                    خودِ این تست کش را نمی‌نویسد. با عوض کردن سرور، کش قبلی پاک می‌شود تا دریافت بعدی افزونه از سرور تازه باشد.
                </p>
                <fieldset className="debug-target">
                    <legend>سرور دریافت</legend>
                    <label>
                        <input
                            type="radio"
                            name="debug-api-target"
                            checked={apiTarget === 'production'}
                            onChange={() => chooseApiTarget('production')}
                        />
                        سرور اصلی
                        <code>{API_TARGETS.production}</code>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="debug-api-target"
                            checked={apiTarget === 'local'}
                            onChange={() => chooseApiTarget('local')}
                        />
                        بک‌اند لوکال
                        <code>{API_TARGETS.local}</code>
                    </label>
                </fieldset>
                <dl className="debug-meta">
                    <dt>درخواست</dt>
                    <dd dir="ltr">{API_TARGETS[apiTarget]}/api/tools/notices</dd>
                    <dt>ابزار</dt>
                    <dd dir="ltr">ai-rtl</dd>
                    <dt>نسخه</dt>
                    <dd dir="ltr">{version}</dd>
                    <dt>شناسه</dt>
                    <dd dir="ltr">{uid || '—'}</dd>
                    <dt>کش فعلی</dt>
                    <dd>
                        {cache?.fetchedAt
                            ? `${formatTehran(cache.fetchedAt)}، ${cache.notices?.length || 0} اطلاعیه`
                            : 'خالی'}
                    </dd>
                </dl>
                <div className="debug-actions">
                    <button type="button" className="debug-button" onClick={testFetch} disabled={!uid || testing}>
                        {testing ? 'در حال دریافت…' : 'تست دریافت اطلاعات'}
                    </button>
                </div>
                {testError ? <p className="debug-status is-error">{testError}</p> : null}
                {testResult ? (
                    <>
                        <p className="debug-status">
                            وضعیت {testResult.status} در {testResult.ms} میلی‌ثانیه
                            {Array.isArray(notices) ? `، ${notices.length} اطلاعیه` : ''}
                        </p>
                        <p className="debug-status" dir="ltr">{testResult.url}</p>
                        {Array.isArray(notices) && notices.length > 0 ? (
                            <ul className="debug-notice-list">
                                {notices.map((notice) => (
                                    <li key={notice.id || notice.title}>
                                        <strong>{notice.title || 'بدون عنوان'}</strong>
                                        {notice.body ? <span>{notice.body}</span> : null}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                        <pre className="debug-output">{JSON.stringify(testResult.body, null, 2)}</pre>
                    </>
                ) : null}
            </section>

            <section className="debug-card">
                <h2>ریست اکستنشن</h2>
                <p>
                    حافظه افزونه پاک می‌شود و همان مقدارهای پیش‌فرض نصب تازه نوشته می‌شود.
                    شناسه فعلی از بین می‌رود و بعد از بارگذاری دوباره، شناسه جدیدی ساخته می‌شود.
                </p>
                {confirmingReset ? (
                    <div className="debug-confirm">
                        <strong>حافظه sync و local پاک شود؟</strong>
                        <p>تنظیمات، کش اطلاعیه‌ها و شناسه فعلی برمی‌گردند به حالت پیش‌فرض.</p>
                        <div className="debug-confirm-actions">
                            <button type="button" className="debug-button-danger" onClick={resetExtension} disabled={resetting}>
                                {resetting ? 'در حال ریست…' : 'ریست قطعی'}
                            </button>
                            <button type="button" className="debug-button-quiet" onClick={() => setConfirmingReset(false)} disabled={resetting}>
                                انصراف
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="debug-actions">
                        <button type="button" className="debug-button-danger" onClick={() => setConfirmingReset(true)}>
                            ریست اکستنشن
                        </button>
                    </div>
                )}
                {resetError ? <p className="debug-status is-error">{resetError}</p> : null}
            </section>
        </main>
    );
}
