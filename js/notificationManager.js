// ===================================
// NOTIFICATION MANAGER v3
// ===================================
// ARCHITECTURE (v3):
// ─────────────────────────────────────────────────────────────────────────────
// Previous versions used setTimeout() and setInterval() in the main page to
// schedule notifications. This DOES NOT work on mobile because browsers
// aggressively throttle/suspend timers in background tabs and when the screen
// locks — which is exactly when users need the notifications most.
//
// v3 delegates ALL notification firing to the Service Worker via postMessage.
// The SW runs in a separate thread that is not subject to the same throttling,
// and it can call self.registration.showNotification() even when the page is
// closed. The main page's only job is:
//   1. Request notification permission (once, on toggle)
//   2. Sync the task list to the SW whenever tasks change
//   3. Send a keep-alive PING to the SW every 55 s while the page is open
//   4. Register for Periodic Background Sync (Android Chrome) for true background
// ─────────────────────────────────────────────────────────────────────────────

class NotificationManager {
    constructor() {
        this.permissionGranted = false;
        this._swRegistration   = null;
        this._pingInterval     = null;
        this._syncInterval     = null;
        // Sync permission state without prompting
        this._syncPermissionState();
        // Wire up SW registration as soon as it is available
        this._waitForSW();
    }

    // ── Sync permissionGranted with the current browser permission state ──────
    _syncPermissionState() {
        if (!('Notification' in window)) return;
        this.permissionGranted = (Notification.permission === 'granted');
    }

    // ── Wait for the SW to be ready, then start syncing ──────────────────────
    _waitForSW() {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.ready.then(reg => {
            this._swRegistration = reg;
            console.log('[NotificationManager] SW ready');
            // If notifications are already enabled, start syncing immediately
            if (window.gameState && window.gameState.notifications && this.permissionGranted) {
                this._startSync();
            }
        }).catch(err => {
            console.warn('[NotificationManager] SW not available:', err);
        });
    }

    // ── Send a message to the active Service Worker ───────────────────────────
    _postToSW(message) {
        if (!('serviceWorker' in navigator)) return;
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(message);
        } else if (this._swRegistration && this._swRegistration.active) {
            this._swRegistration.active.postMessage(message);
        }
    }

    // ── Sync all active tasks to the SW ──────────────────────────────────────
    syncTasksToSW() {
        if (!window.gameState || !window.gameState.notifications) return;
        if (!this.permissionGranted) return;

        const tasks = (window.gameState.tasks || [])
            .filter(t => !t.completed && t.dueDate)
            .map(t => ({
                id:        t.id,
                title:     t.title,
                dueDate:   t.dueDate,
                completed: !!t.completed
            }));

        this._postToSW({ type: 'SYNC_TASKS', tasks });
        console.log('[NotificationManager] Synced', tasks.length, 'tasks to SW');
    }

    // ── Start the sync loop (called when notifications are enabled) ───────────
    _startSync() {
        // Immediate sync
        this.syncTasksToSW();

        // Sync every 30 s to keep SW task list fresh
        if (!this._syncInterval) {
            this._syncInterval = setInterval(() => {
                this.syncTasksToSW();
            }, 30 * 1000);
        }

        // Keep-alive PING every 25 s
        if (!this._pingInterval) {
            this._pingInterval = setInterval(() => {
                this._postToSW({ type: 'PING' });
            }, 25 * 1000);
        }

        // Register for Periodic Background Sync (Android Chrome)
        this._registerPeriodicSync();
    }

    // ── Stop the sync loop (called when notifications are disabled) ───────────
    _stopSync() {
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
            this._syncInterval = null;
        }
        if (this._pingInterval) {
            clearInterval(this._pingInterval);
            this._pingInterval = null;
        }
        // Tell SW to clear its task list
        this._postToSW({ type: 'CLEAR_ALL' });
    }

    // ── Register Periodic Background Sync ────────────────────────────────────
    async _registerPeriodicSync() {
        try {
            if (!this._swRegistration) return;
            if (!('periodicSync' in this._swRegistration)) return;
            const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
            if (status.state === 'granted') {
                await this._swRegistration.periodicSync.register('task-reminder-check', {
                    minInterval: 15 * 60 * 1000
                });
                console.log('[NotificationManager] Periodic background sync registered');
            }
        } catch (err) {
            console.warn('[NotificationManager] Periodic sync not available:', err);
        }
    }

    // ── Request notification permission (called by the Settings toggle) ───────
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('[NotificationManager] Notifications not supported');
            return false;
        }
        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            return true;
        }
        if (Notification.permission === 'denied') {
            console.warn('[NotificationManager] Permission previously denied');
            this.permissionGranted = false;
            return false;
        }
        try {
            const permission = await Notification.requestPermission();
            this.permissionGranted = (permission === 'granted');
            console.log('[NotificationManager] Permission result:', permission);
            return this.permissionGranted;
        } catch (err) {
            console.error('[NotificationManager] requestPermission error:', err);
            this.permissionGranted = false;
            return false;
        }
    }

    // ── Called when notifications are enabled ─────────────────────────────────
    rescheduleAllNotifications() {
        this._syncPermissionState();
        if (!this.permissionGranted) return;
        if (this._swRegistration) {
            this._startSync();
        } else {
            navigator.serviceWorker.ready.then(reg => {
                this._swRegistration = reg;
                this._startSync();
            }).catch(() => {});
        }
    }

    // ── Called when a single task is created or updated ───────────────────────
    scheduleTaskNotifications(task, taskIndex) {
        if (!task.dueDate) return;
        if (!window.gameState || !window.gameState.notifications) return;
        if (!this.permissionGranted) return;
        // Clear old records for this task in the SW, then re-sync
        const taskId = task.id || taskIndex;
        this._postToSW({ type: 'CLEAR_TASK', taskId });
        setTimeout(() => this.syncTasksToSW(), 200);
    }

    // ── Called when a single task is completed or deleted ─────────────────────
    clearTaskNotifications(taskIndex) {
        const task   = window.gameState && window.gameState.tasks && window.gameState.tasks[taskIndex];
        const taskId = (task && task.id) ? task.id : taskIndex;
        this._postToSW({ type: 'CLEAR_TASK', taskId });
    }

    // ── Clear ALL notifications (notifications disabled) ──────────────────────
    clearAllNotifications() {
        this._stopSync();
    }

    // ── Legacy stub: fallback for non-SW environments (HTTP, old browsers) ────
    sendNotification(title, body, icon, tag) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        try {
            const n = new Notification(title, {
                body,
                icon:  icon || 'assets/logo/favicon.png',
                badge: icon || 'assets/logo/favicon.png',
                tag:   tag  || ('task-monsters-' + Date.now()),
                requireInteraction: false
            });
            setTimeout(() => { try { n.close(); } catch (_) {} }, 10000);
            n.onclick = () => { window.focus(); n.close(); };
        } catch (err) {
            console.error('[NotificationManager] sendNotification fallback error:', err);
        }
    }
}

// ── Global instance ───────────────────────────────────────────────────────────
window.notificationManager = new NotificationManager();

// ── On page load: if notifications were previously enabled, re-sync to SW ─────
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.gameState && window.gameState.notifications) {
            window.notificationManager._syncPermissionState();
            if (window.notificationManager.permissionGranted) {
                window.notificationManager.rescheduleAllNotifications();
                console.log('[NotificationManager] Auto-synced on page load');
            } else {
                console.warn('[NotificationManager] Permission lost – disabling notifications');
                window.gameState.notifications = false;
                if (window.saveGameState) window.saveGameState();
                if (window.updateSettingsDisplay) window.updateSettingsDisplay();
            }
        }
    }, 1500);
});

// ── Re-sync when the page becomes visible (tab switch / phone unlock) ─────────
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (window.gameState && window.gameState.notifications &&
            window.notificationManager.permissionGranted) {
            window.notificationManager.syncTasksToSW();
        }
    }
});
