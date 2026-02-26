/**
 * Firebase Cloud Messaging - Push Notifications
 * LocaSur
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Configuration Firebase via variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// VAPID Key pour les notifications web push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialise Firebase App et Messaging
 */
export function initializeFirebase(): boolean {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
    }

    // Messaging n'est disponible que dans un contexte navigateur sécurisé
    if (typeof window !== 'undefined' && 'Notification' in window) {
      messaging = getMessaging(app);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Firebase] Erreur initialisation:', error);
    return false;
  }
}

/**
 * Vérifie si les notifications push sont supportées
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Vérifie le statut de permission des notifications
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Demande la permission de notification et retourne le token FCM
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!isPushSupported()) {
    console.warn('[Firebase] Notifications push non supportées');
    return null;
  }

  try {
    // Demander la permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('[Firebase] Permission refusée:', permission);
      return null;
    }

    // Initialiser Firebase si nécessaire
    if (!messaging) {
      const initialized = initializeFirebase();
      if (!initialized || !messaging) {
        console.error('[Firebase] Impossible d\'initialiser messaging');
        return null;
      }
    }

    // Enregistrer le service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[Firebase] Service Worker enregistré:', registration.scope);

    // Obtenir le token FCM
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[Firebase] Token FCM obtenu:', token.substring(0, 20) + '...');
      return token;
    }

    console.warn('[Firebase] Aucun token obtenu');
    return null;

  } catch (error) {
    console.error('[Firebase] Erreur demande permission:', error);
    return null;
  }
}

/**
 * Enregistre le token FCM auprès du backend
 */
export async function registerTokenWithBackend(token: string): Promise<boolean> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Utiliser auth_token (stocké par api.ts lors de l'authentification)
    const authToken = localStorage.getItem('auth_token');

    const response = await fetch(`${apiUrl}/api/fcm/register-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({
        token: token,
        device_type: 'web',
        user_agent: navigator.userAgent
      })
    });

    if (response.ok) {
      console.log('[Firebase] Token enregistré avec succès');
      // Sauvegarder le token localement
      localStorage.setItem('fcmToken', token);
      return true;
    }

    console.error('[Firebase] Erreur enregistrement token:', response.status);
    return false;

  } catch (error) {
    console.error('[Firebase] Erreur enregistrement token:', error);
    return false;
  }
}

/**
 * Désenregistre le token FCM du backend
 */
export async function unregisterTokenFromBackend(): Promise<boolean> {
  try {
    const token = localStorage.getItem('fcmToken');
    if (!token) {
      return true; // Pas de token à supprimer
    }

    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Utiliser auth_token (stocké par api.ts lors de l'authentification)
    const authToken = localStorage.getItem('auth_token');

    const response = await fetch(`${apiUrl}/api/fcm/unregister-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      console.log('[Firebase] Token supprimé avec succès');
      localStorage.removeItem('fcmToken');
      return true;
    }

    return false;

  } catch (error) {
    console.error('[Firebase] Erreur suppression token:', error);
    return false;
  }
}

/**
 * Active les notifications push (demande permission + enregistre token)
 */
export async function enablePushNotifications(): Promise<boolean> {
  const token = await requestNotificationPermission();
  if (!token) {
    return false;
  }

  return await registerTokenWithBackend(token);
}

/**
 * Désactive les notifications push
 */
export async function disablePushNotifications(): Promise<boolean> {
  return await unregisterTokenFromBackend();
}

/**
 * Configure le handler pour les messages reçus en foreground
 */
export function onForegroundMessage(callback: (payload: any) => void): () => void {
  if (!messaging) {
    initializeFirebase();
  }

  if (!messaging) {
    console.warn('[Firebase] Messaging non disponible');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('[Firebase] Message reçu en foreground:', payload);
    callback(payload);
  });
}

/**
 * Vérifie si les notifications sont actuellement activées
 */
export function areNotificationsEnabled(): boolean {
  return (
    isPushSupported() &&
    Notification.permission === 'granted' &&
    !!localStorage.getItem('fcmToken')
  );
}
