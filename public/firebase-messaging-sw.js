// Service Worker Firebase Cloud Messaging
// Ce fichier DOIT être à la racine du domaine
// NOTE: Les clés sont injectées au build via le plugin Vite (vite.config.ts)

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuration Firebase - injectée par le build process
// En dev, créer un fichier .env.local avec les variables VITE_FIREBASE_*
const firebaseConfig = {
    apiKey: self.__FIREBASE_CONFIG__?.apiKey || '',
    authDomain: self.__FIREBASE_CONFIG__?.authDomain || '',
    projectId: self.__FIREBASE_CONFIG__?.projectId || '',
    storageBucket: self.__FIREBASE_CONFIG__?.storageBucket || '',
    messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId || '',
    appId: self.__FIREBASE_CONFIG__?.appId || '',
    measurementId: self.__FIREBASE_CONFIG__?.measurementId || ''
};

// Initialiser Firebase dans le Service Worker
firebase.initializeApp(firebaseConfig);

// Récupérer l'instance de messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan (quand le navigateur est fermé ou l'onglet inactif)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan:', payload);

    // Extraire les données de la notification
    const notificationTitle = payload.notification?.title || 'Nouveau message';
    const notificationBody = payload.notification?.body || '';
    const conversationId = payload.data?.conversation_id;

    // Options de notification
    const notificationOptions = {
        body: notificationBody,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `message-${conversationId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: {
            url: `/messages/${conversationId}`,
            conversationId: conversationId
        },
        actions: [
            {
                action: 'open',
                title: 'Ouvrir'
            },
            {
                action: 'close',
                title: 'Fermer'
            }
        ]
    };

    // Afficher la notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification cliquée:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Ouvrir ou focus sur la conversation
    const urlToOpen = event.notification.data?.url || '/messages';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Chercher si une fenêtre est déjà ouverte
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ('focus' in client) {
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        url: urlToOpen
                    });
                    return client.focus();
                }
            }

            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Log quand le Service Worker est activé
self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker activé');
});

// Log quand le Service Worker est installé
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker installé');
    // Force le nouveau SW à devenir actif immédiatement
    self.skipWaiting();
});
