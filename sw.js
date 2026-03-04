/**
 * Task Monsters – Service Worker v3
 *
 * NOTIFICATION STRATEGY (why this works on mobile):
 * ─────────────────────────────────────────────────
 * The browser suspends JavaScript timers (setTimeout/setInterval) in
 * background tabs and when the phone screen locks. This means in-page
 * polling CANNOT reliably fire notifications on mobile.
 *
 * The ONLY reliable approach is:
 *   1. Main page stores task due-times in Cache Storage via postMessage.
 *   2. Service Worker checks those times and calls
 *      self.registration.showNotification() directly — this works even
 *      when the page is closed or the screen is locked.
 *   3. periodicsync wakes the SW every ~15 min on Android Chrome.
 *   4. While the page IS open, it sends PING messages every 55 s to keep
 *      the SW alive and trigger extra checks.
 *
 * Task data flow:
 *   Main page → postMessage({type:'SYNC_TASKS', tasks:[...]})
 *   SW stores tasks in its in-memory cache + Cache Storage
 *   SW checks tasks every 60 s (SW-side timer)
 *   SW fires showNotification() for any threshold within ±90 s window
 */

const CACHE_NAME      = 'task-monsters-v4';
const TASKS_CACHE_KEY = 'task-monsters-tasks-v4';
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './assets/logo/favicon.png',
];

// ─── In-memory task store ─────────────────────────────────────────────────────
let _tasks    = [];           // [{id, title, dueDate, completed}]
let _sentKeys = new Set();    // "taskId_minutes" already notified this session
let _checkTimer = null;

const THRESHOLDS_MIN = [20, 15, 10, 5, 2];
const WINDOW_SEC     = 120; // ±120 s window around each threshold (wider = more reliable)

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log('[SW] Installing v3...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating v3...');
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
            ))
            .then(() => self.clients.claim())
            .then(() => {
                // Load any previously cached tasks and start the check loop
                return loadTasksFromCache().then(() => {
                    scheduleNextCheck();
                });
            })
    );
});

// ─── Fetch (network-first, cache fallback) ────────────────────────────────────
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ─── Messages from the main page ──────────────────────────────────────────────
self.addEventListener('message', (event) => {
    const msg = event.data;
    if (!msg || !msg.type) return;

    switch (msg.type) {

        case 'SYNC_TASKS':
            // Main page sends full task list on load, on task create/edit/delete,
            // and every 55 s as a keep-alive ping.
            if (Array.isArray(msg.tasks)) {
                _tasks = msg.tasks.filter(t => !t.completed && t.dueDate);
                console.log('[SW] Task sync received:', _tasks.length, 'active tasks');
                // Persist to Cache Storage so we can reload after SW restart
                persistTasksToCache(_tasks);
                // Run an immediate check
                checkAndNotify();
            }
            break;

        case 'CLEAR_TASK':
            // Task was completed, deleted, or edited — clear its sent-keys
            if (msg.taskId !== undefined) {
                THRESHOLDS_MIN.forEach(m => _sentKeys.delete(`${msg.taskId}_${m}`));
                _tasks = _tasks.filter(t => (t.id || t.title) !== msg.taskId);
                persistTasksToCache(_tasks);
            }
            break;

        case 'CLEAR_ALL':
            _tasks = [];
            _sentKeys.clear();
            persistTasksToCache([]);
            break;

        case 'PING':
            // Keep-alive from the main page; run a check while we're awake
            checkAndNotify();
            break;
    }
});

// ─── Periodic Background Sync (Android Chrome) ────────────────────────────────
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'task-reminder-check') {
        console.log('[SW] Periodic sync fired');
        event.waitUntil(
            loadTasksFromCache().then(() => checkAndNotify())
        );
    }
});

// ─── Server-side FCM push (future use) ────────────────────────────────────────
self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        try { data = event.data.json(); }
        catch (_) { data = { title: '\u23F0 Task Reminder', body: event.data.text() }; }
    }
    const title   = (data.notification && data.notification.title) || data.title || '\u23F0 Task Reminder';
    const options = {
        body:   (data.notification && data.notification.body) || data.body || 'A task is due soon!',
        icon:   './assets/logo/favicon.png',
        badge:  './assets/logo/favicon.png',
        tag:    data.tag || ('push-' + Date.now()),
        data:   { url: self.location.origin }
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || self.location.origin;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const client of list) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});

// ─── Core: check tasks and fire notifications ─────────────────────────────────
function checkAndNotify() {
    const now      = Date.now();
    const windowMs = WINDOW_SEC * 1000;

    _tasks.forEach(task => {
        if (task.completed) return;
        const dueMs = new Date(task.dueDate).getTime();
        if (isNaN(dueMs)) return;

        const msRemaining = dueMs - now;
        if (msRemaining < 0) return; // overdue

        THRESHOLDS_MIN.forEach(minutes => {
            const thresholdMs = minutes * 60 * 1000;
            const diff        = msRemaining - thresholdMs; // positive = not yet at threshold

            if (Math.abs(diff) <= windowMs) {
                const key = `${task.id || task.title}_${minutes}`;
                if (!_sentKeys.has(key)) {
                    _sentKeys.add(key);
                    const title = `\u23F0 Task Due in ${minutes} Minute${minutes === 1 ? '' : 's'}!`;
                    const body  = `"${task.title}" is due in ${minutes} minute${minutes === 1 ? '' : 's'}. Time to finish up!`;
                    self.registration.showNotification(title, {
                        body,
                        icon:               './assets/logo/favicon.png',
                        badge:              './assets/logo/favicon.png',
                        tag:                `task-monsters-${task.id || task.title}-${minutes}min`,
                        requireInteraction: false,
                        data:               { url: self.location.origin }
                    }).then(() => {
                        console.log('[SW] Notification fired:', title);
                    }).catch(err => {
                        console.error('[SW] showNotification error:', err);
                    });
                }
            }
        });
    });
}

// ─── Self-scheduling check loop (runs while SW is alive) ─────────────────────
function scheduleNextCheck() {
    if (_checkTimer) clearTimeout(_checkTimer);
    _checkTimer = setTimeout(() => {
        checkAndNotify();
        scheduleNextCheck();
    }, 30 * 1000); // every 30 seconds — ensures no threshold window is missed
}

// ─── Persist tasks to Cache Storage ──────────────────────────────────────────
async function persistTasksToCache(tasks) {
    try {
        const cache    = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(tasks), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(TASKS_CACHE_KEY, response);
    } catch (err) {
        console.warn('[SW] Could not persist tasks to cache:', err);
    }
}

// ─── Load tasks from Cache Storage (fallback when page is closed) ─────────────
async function loadTasksFromCache() {
    try {
        const cache    = await caches.open(CACHE_NAME);
        const response = await cache.match(TASKS_CACHE_KEY);
        if (response) {
            const data = await response.json();
            if (Array.isArray(data)) {
                _tasks = data.filter(t => !t.completed && t.dueDate);
                console.log('[SW] Loaded', _tasks.length, 'tasks from cache');
            }
        }
    } catch (err) {
        console.warn('[SW] Could not load tasks from cache:', err);
    }
}
