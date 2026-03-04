/**
 * Task Notifications Manager v3
 * ─────────────────────────────────────────────────────────────────────────────
 * This module is now a SECONDARY safety-net layer. The primary notification
 * mechanism is the Service Worker (notificationManager.js -> sw.js).
 *
 * This module handles:
 *   1. A lightweight in-page polling loop that fires notifications when the
 *      app tab is ACTIVE and in the foreground (belt-and-suspenders).
 *   2. Keeping the SW task list in sync whenever tasks change.
 *   3. Exposing helper methods used by index.html call-sites.
 * ─────────────────────────────────────────────────────────────────────────────
 */
class TaskNotificationsManager {
    constructor() {
        this.checkInterval          = null;
        this.notificationThresholds = [20, 15, 10, 5, 2]; // minutes
        this.sentNotifications      = new Map(); // key -> timestamp
        this.isInitialized          = false;
        this.WINDOW_SECONDS         = 90; // +-90 s window around each threshold
    }

    /** Initialize - called once after gameState is loaded */
    async init() {
        if (this.isInitialized) return;
        console.log('[TaskNotifications] Initializing...');
        this.loadSentNotifications();
        this.startBackgroundCheck();
        this.isInitialized = true;
        console.log('[TaskNotifications] Initialized');
    }

    /** Start in-page polling loop (every 30 s) */
    startBackgroundCheck() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.checkTasksAndNotify();
        this.checkInterval = setInterval(() => {
            this.checkTasksAndNotify();
        }, 30 * 1000);
        console.log('[TaskNotifications] In-page polling started (every 30 s)');
    }

    /** Stop in-page polling loop */
    stopBackgroundCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[TaskNotifications] In-page polling stopped');
        }
    }

    /**
     * Check all tasks and send in-page notifications for those approaching due
     * time. This only fires reliably when the tab is active; the SW handles
     * the background case.
     */
    checkTasksAndNotify() {
        if (!window.gameState || !window.gameState.notifications) return;

        const tasks    = window.gameState.tasks || [];
        const now      = Date.now();
        const windowMs = this.WINDOW_SECONDS * 1000;

        tasks.forEach((task, index) => {
            if (task.completed || !task.dueDate) return;

            const dueTime     = new Date(task.dueDate).getTime();
            const msRemaining = dueTime - now;

            if (msRemaining < 0) {
                this.cleanupTaskNotifications(task.id || index);
                return;
            }

            this.notificationThresholds.forEach(threshold => {
                const thresholdMs = threshold * 60 * 1000;
                const diff        = msRemaining - thresholdMs;

                if (Math.abs(diff) <= windowMs) {
                    const key = `${task.id || index}_${threshold}`;
                    if (!this.sentNotifications.has(key)) {
                        this._sendNotification(task, threshold);
                        this.sentNotifications.set(key, Date.now());
                        this.saveSentNotifications();
                    }
                }
            });
        });
    }

    /** Send a notification for a specific task (in-page fallback) */
    _sendNotification(task, minutesRemaining) {
        const title = '\u23F0 Task Due in ' + minutesRemaining + ' Minute' + (minutesRemaining === 1 ? '' : 's') + '!';
        const body  = '"' + task.title + '" is due in ' + minutesRemaining + ' minute' + (minutesRemaining === 1 ? '' : 's') + '. Time to finish up!';
        console.log('[TaskNotifications] In-page notification:', title);

        if (window.notificationManager) {
            const taskId    = task.id || task.title;
            const uniqueTag = 'task-monsters-inpage-' + taskId + '-' + minutesRemaining + 'min';
            window.notificationManager.sendNotification(title, body, 'assets/logo/favicon.png', uniqueTag);
            return;
        }

        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            const n = new Notification(title, {
                body: body,
                icon: 'assets/logo/favicon.png',
                tag:  'task-reminder-basic-' + Date.now()
            });
            setTimeout(function() { try { n.close(); } catch (_) {} }, 10000);
            n.onclick = function() { window.focus(); n.close(); };
        } catch (err) {
            console.error('[TaskNotifications] Direct notification error:', err);
        }
    }

    /** Remove sent-notification records for a specific task */
    cleanupTaskNotifications(taskId) {
        var changed = false;
        this.notificationThresholds.forEach(function(threshold) {
            var key = taskId + '_' + threshold;
            if (this.sentNotifications.has(key)) {
                this.sentNotifications.delete(key);
                changed = true;
            }
        }.bind(this));
        if (changed) this.saveSentNotifications();
    }

    /** Load sent notifications from localStorage */
    loadSentNotifications() {
        try {
            var saved = localStorage.getItem('sentTaskNotifications');
            if (saved) {
                var data = JSON.parse(saved);
                this.sentNotifications = new Map(Object.entries(data));
                var oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                for (var entry of this.sentNotifications.entries()) {
                    if (entry[1] < oneDayAgo) this.sentNotifications.delete(entry[0]);
                }
            }
        } catch (err) {
            console.error('[TaskNotifications] Error loading sent notifications:', err);
            this.sentNotifications = new Map();
        }
    }

    /** Persist sent notifications to localStorage */
    saveSentNotifications() {
        try {
            var data = Object.fromEntries(this.sentNotifications);
            localStorage.setItem('sentTaskNotifications', JSON.stringify(data));
        } catch (err) {
            console.error('[TaskNotifications] Error saving sent notifications:', err);
        }
    }

    /** Clear all sent-notification records */
    clearAllNotifications() {
        this.sentNotifications.clear();
        localStorage.removeItem('sentTaskNotifications');
        console.log('[TaskNotifications] All notification records cleared');
    }

    /** Request notification permission */
    async requestPermission() {
        if (window.notificationManager) {
            return window.notificationManager.requestPermission();
        }
        if (!('Notification' in window)) return false;
        try {
            var perm = await Notification.requestPermission();
            return perm === 'granted';
        } catch (err) {
            console.error('[TaskNotifications] Permission error:', err);
            return false;
        }
    }
}

// Global instance
window.taskNotificationsManager = new TaskNotificationsManager();

// Auto-initialize after DOM + gameState are ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() { window.taskNotificationsManager.init(); }, 2000);
    });
} else {
    setTimeout(function() { window.taskNotificationsManager.init(); }, 2000);
}
