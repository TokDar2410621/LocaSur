/**
 * Hook React pour les notifications push
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  enablePushNotifications,
  disablePushNotifications,
  areNotificationsEnabled,
  onForegroundMessage,
  initializeFirebase
} from '@/lib/firebase';
import { toast } from 'sonner';

interface UsePushNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isEnabled: boolean;
  isLoading: boolean;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
  toggle: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialiser l'état au montage
  useEffect(() => {
    const supported = isPushSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(getNotificationPermission());
      setIsEnabled(areNotificationsEnabled());

      // Initialiser Firebase et configurer le handler de messages foreground
      initializeFirebase();

      const unsubscribe = onForegroundMessage((payload) => {
        // Afficher un toast pour les messages reçus en foreground
        const title = payload.notification?.title || 'Nouveau message';
        const body = payload.notification?.body || '';

        toast(title, {
          description: body,
        });
      });

      return () => unsubscribe();
    }
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Votre navigateur ne supporte pas les notifications push.');
      return false;
    }

    setIsLoading(true);

    try {
      const success = await enablePushNotifications();

      if (success) {
        setIsEnabled(true);
        setPermission('granted');
        toast.success('Notifications activées');
        return true;
      } else {
        const currentPermission = getNotificationPermission();
        setPermission(currentPermission);

        if (currentPermission === 'denied') {
          toast.error('Autorisez les notifications dans les paramètres de votre navigateur.');
        } else {
          toast.error('Impossible d\'activer les notifications.');
        }
        return false;
      }
    } catch (error) {
      console.error('[usePushNotifications] Erreur enable:', error);
      toast.error('Une erreur est survenue.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const disable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const success = await disablePushNotifications();

      if (success) {
        setIsEnabled(false);
        toast.success('Notifications désactivées');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[usePushNotifications] Erreur disable:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback(async (): Promise<boolean> => {
    if (isEnabled) {
      return disable();
    } else {
      return enable();
    }
  }, [isEnabled, enable, disable]);

  return {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    enable,
    disable,
    toggle
  };
}
