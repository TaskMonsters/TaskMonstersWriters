/**
 * Firebase Configuration and Initialization
 * Handles Firebase Cloud Messaging for push notifications.
 *
 * NOTE: Firebase SDK scripts are loaded via CDN in index.html before this file.
 * If the Firebase SDK is unavailable, all functions degrade gracefully to
 * local Notification API calls.
 */

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_Y5V35a0PPpj1dbFM6-FSWUPgWdGXhiA",
    authDomain: "taskmonsters-d2b42.firebaseapp.com",
    projectId: "taskmonsters-d2b42",
    storageBucket: "taskmonsters-d2b42.firebasestorage.app",
    messagingSenderId: "608700693426",
    appId: "1:608700693426:web:62eee03afb7d16a5ca82ab",
    measurementId: "G-40NHKEG48H"
};

// VAPID key for Web Push
const vapidKey = "BG88qdZIOq9bJ1hh6z4eQpaOdKatlPhv2pklxSlKygJQAcbS1icFdTgBDg6bnHad3GA2oSR2Furf0g0BTxPZWmg";

let app, messaging;

/**
 * Initialize Firebase app and Cloud Messaging.
 * Returns true on success, false if Firebase SDK is unavailable or unsupported.
 */
async function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('[Firebase] Firebase SDK not loaded – using local notifications only');
            return false;
        }

        if (!firebase.apps || !firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('[Firebase] App initialized');
        } else {
            app = firebase.app();
        }

        if (firebase.messaging && firebase.messaging.isSupported()) {
            messaging = firebase.messaging();
            console.log('[Firebase] Messaging initialized');
            return true;
        } else {
            console.warn('[Firebase] Messaging not supported in this browser');
            return false;
        }
    } catch (error) {
        console.error('[Firebase] Initialization error:', error);
        return false;
    }
}

/**
 * Request notification permission and obtain an FCM token.
 * Saves the token to gameState for server-side push delivery.
 * Returns the token string, or null on failure.
 */
async function requestNotificationPermission() {
    try {
        if (!('Notification' in window)) {
            console.warn('[Notifications] Not supported in this browser');
            return null;
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('[Notifications] Permission granted');

            if (messaging) {
                try {
                    const token = await messaging.getToken({ vapidKey });
                    console.log('[FCM] Token obtained');

                    if (window.gameState) {
                        window.gameState.fcmToken = token;
                        if (window.saveGameState) window.saveGameState();
                    }

                    return token;
                } catch (tokenErr) {
                    console.warn('[FCM] Could not get token:', tokenErr);
                }
            }

            return null;
        } else {
            console.warn('[Notifications] Permission denied');
            return null;
        }
    } catch (error) {
        console.error('[Notifications] Permission error:', error);
        return null;
    }
}

/**
 * Send a local browser notification.
 * Uses a unique tag per call so notifications are never silently replaced
 * by the browser's same-tag deduplication behaviour.
 *
 * @param {string} title  - Notification title
 * @param {string} body   - Notification body text
 * @param {string} [icon] - Icon URL (defaults to Pink_Monster_idle.gif)
 * @param {string} [tag]  - Optional explicit tag; auto-generated if omitted
 * @returns {boolean} true if the notification was created successfully
 */
function sendLocalNotification(title, body, icon, tag) {
    try {
        if (!('Notification' in window)) {
            console.warn('[Notifications] Not supported');
            return false;
        }

        if (Notification.permission !== 'granted') {
            console.warn('[Notifications] Permission not granted');
            return false;
        }

        const notifIcon = icon || 'assets/Pink_Monster_idle.gif';
        // Generate a unique tag when none is provided so notifications stack
        const notifTag = tag || ('task-reminder-' + Date.now());

        const notification = new Notification(title, {
            body: body,
            icon: notifIcon,
            badge: notifIcon,
            tag: notifTag,
            requireInteraction: false,
            silent: false
        });

        // Auto-close after 10 seconds
        setTimeout(() => {
            try { notification.close(); } catch (_) {}
        }, 10000);

        notification.onclick = function () {
            window.focus();
            notification.close();
        };

        console.log('[Notifications] Local notification sent:', title);
        return true;
    } catch (error) {
        console.error('[Notifications] Error sending local notification:', error);
        return false;
    }
}

/**
 * Handle incoming FCM messages when the app is in the foreground.
 * Requires messaging to be initialized first via initializeFirebase().
 */
function setupForegroundMessageHandler() {
    if (!messaging) return;

    messaging.onMessage((payload) => {
        console.log('[FCM] Foreground message received:', payload);

        const notificationTitle = (payload.notification && payload.notification.title) || 'Task Reminder';
        const notificationBody  = (payload.notification && payload.notification.body)  || 'A task is due soon!';

        sendLocalNotification(notificationTitle, notificationBody);
    });
}

// Expose all functions globally
window.initializeFirebase            = initializeFirebase;
window.requestNotificationPermission = requestNotificationPermission;
window.sendLocalNotification         = sendLocalNotification;
window.setupForegroundMessageHandler = setupForegroundMessageHandler;
