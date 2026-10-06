const TOOL_ID = 'ai-rtl';
const PRODUCTION_API_BASE = 'https://api.ai-rtl.ir';
export const NOTICE_ALARM = 'ai-rtl-notices';
export const NOTICE_SCHEDULE_KEY = 'noticeSchedule';
const SCHEDULE_KEY = NOTICE_SCHEDULE_KEY;
export const NOTICE_CACHE_KEY = 'noticeCache';
const HOUR_MS = 60 * 60 * 1000;
const MIN_DELAY_MS = 60 * 1000;
const FIRST_DELAY_MAX_MS = 5 * 60 * 1000;
const HOUR_JITTER_MS = 10 * 60 * 1000;
const OVERDUE_MS = 2 * 60 * 1000;
const RETRY_MIN_MS = 10 * 60 * 1000;
const RETRY_MAX_MS = 20 * 60 * 1000;
const STARTUP_DELAY_MAX_MS = 15 * 60 * 1000;

let fetching = false;

let devApiBase = null;
// Top-level so production webpack never compiles devApiBase.js.
if (__AI_RTL_DEV__) {
    devApiBase = require('./devApiBase').devApiBase;
}

async function apiBase() {
    if (devApiBase) {
        return devApiBase();
    }
    return PRODUCTION_API_BASE;
}

function randomBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

async function readLocal(key) {
    const stored = await chrome.storage.local.get(key);
    return stored[key] || null;
}

function cacheIsFresh(cache, now = Date.now()) {
    return Boolean(cache?.fetchedAt) && now - cache.fetchedAt < HOUR_MS;
}

async function scheduleNext(delayMs, retry = false) {
    const dueAt = Date.now() + Math.max(MIN_DELAY_MS, delayMs);
    await chrome.storage.local.set({
        [SCHEDULE_KEY]: { dueAt, retry },
    });
    await chrome.alarms.clear(NOTICE_ALARM);
    chrome.alarms.create(NOTICE_ALARM, { when: dueAt });
}

async function fetchNotices() {
    if (fetching) return;
    fetching = true;
    try {
        const cache = await readLocal(NOTICE_CACHE_KEY);
        if (cacheIsFresh(cache)) {
            const remain = HOUR_MS - (Date.now() - cache.fetchedAt);
            await scheduleNext(remain + randomBetween(0, HOUR_JITTER_MS));
            return;
        }

        const { uid } = await chrome.storage.sync.get('uid');
        const version = chrome.runtime.getManifest().version;
        if (!uid || !version) return;

        const response = await fetch(`${await apiBase()}/api/tools/notices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tool_id: TOOL_ID,
                version,
                uid,
            }),
        });
        if (!response.ok) throw new Error('notice request failed');

        const payload = await response.json();
        await chrome.storage.local.set({
            [NOTICE_CACHE_KEY]: {
                fetchedAt: Date.now(),
                notices: Array.isArray(payload?.data?.notices) ? payload.data.notices : [],
            },
        });
        await scheduleNext(HOUR_MS + randomBetween(0, HOUR_JITTER_MS));
    } catch {
        const schedule = await readLocal(SCHEDULE_KEY);
        if (schedule?.retry) {
            await scheduleNext(HOUR_MS + randomBetween(0, HOUR_JITTER_MS));
        } else {
            await scheduleNext(randomBetween(RETRY_MIN_MS, RETRY_MAX_MS), true);
        }
    } finally {
        fetching = false;
    }
}

async function onNoticeAlarm() {
    const schedule = await readLocal(SCHEDULE_KEY);
    if (!schedule?.dueAt || fetching) return;
    if (Date.now() - schedule.dueAt > OVERDUE_MS) {
        await scheduleNext(randomBetween(MIN_DELAY_MS, STARTUP_DELAY_MAX_MS), schedule.retry === true);
        return;
    }
    await fetchNotices();
}

export function listenForNoticeAlarm() {
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === NOTICE_ALARM) onNoticeAlarm();
    });
}

export async function resumeNoticeSchedule() {
    const cache = await readLocal(NOTICE_CACHE_KEY);
    const schedule = await readLocal(SCHEDULE_KEY);
    if (schedule?.dueAt > Date.now()) {
        await chrome.alarms.clear(NOTICE_ALARM);
        chrome.alarms.create(NOTICE_ALARM, { when: schedule.dueAt });
        return;
    }
    if (cacheIsFresh(cache)) {
        const remain = HOUR_MS - (Date.now() - cache.fetchedAt);
        await scheduleNext(remain + randomBetween(0, HOUR_JITTER_MS));
    }
}

export async function considerNoticeCheck() {
    if (fetching) return;
    const cache = await readLocal(NOTICE_CACHE_KEY);
    if (cacheIsFresh(cache)) return;

    const schedule = await readLocal(SCHEDULE_KEY);
    if (schedule?.dueAt > Date.now()) return;

    await scheduleNext(randomBetween(MIN_DELAY_MS, FIRST_DELAY_MAX_MS));
}

export async function recordNoticeAction(id, action) {
    const noticeId = String(id || '');
    const actionName = String(action || '');
    if (!/^[a-f0-9]{24}$/i.test(noticeId)) return;
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(actionName)) return;

    const { uid } = await chrome.storage.sync.get('uid');
    const version = chrome.runtime.getManifest().version;
    if (!uid || !version) return;

    try {
        await fetch(`${await apiBase()}/api/tools/notices/${noticeId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tool_id: TOOL_ID,
                version,
                uid,
                action: actionName,
            }),
        });
    } catch {
        // The next hourly refresh still has the notice if this post failed.
    }
}
