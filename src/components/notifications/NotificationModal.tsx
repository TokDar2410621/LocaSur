/**
 * Modal pour demander l'activation des notifications push
 * S'affiche quand l'utilisateur entre dans la messagerie
 */

import { useState, useEffect } from 'react';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationModalProps {
  /** Délai avant d'afficher le modal (ms) */
  delay?: number;
}

export function NotificationModal({ delay = 1500 }: NotificationModalProps) {
  const { isSupported, permission, isEnabled, isLoading, enable } = usePushNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Ne pas afficher si:
    // - Pas supporté
    // - Déjà activé
    // - Permission refusée définitivement
    if (!isSupported || isEnabled || permission === 'denied') {
      return;
    }

    // Vérifier si l'utilisateur a déjà vu ce modal récemment
    const lastShown = localStorage.getItem('notificationModalShown');
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      const hoursSinceShown = (Date.now() - lastShownTime) / (1000 * 60 * 60);

      // Ne pas réafficher pendant 48h
      if (hoursSinceShown < 48) {
        return;
      }
    }

    // Afficher après un court délai
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem('notificationModalShown', Date.now().toString());
    }, delay);

    return () => clearTimeout(timer);
  }, [isSupported, isEnabled, permission, delay]);

  const handleEnable = async () => {
    const success = await enable();
    if (success) {
      setOpen(false);
    }
  };

  const handleLater = () => {
    setOpen(false);
  };

  // Ne rien rendre si pas nécessaire
  if (!isSupported || isEnabled || permission === 'denied') {
    return null;
  }

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader className="flex-col items-center text-center">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center mb-3">
            <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <ResponsiveModalTitle className="text-center text-lg sm:text-xl">
            Activer les notifications ?
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="text-center space-y-4 py-2">
          <p className="text-sm sm:text-base text-muted-foreground">
            Recevez une alerte instantanée dès qu'un propriétaire ou locataire vous envoie un message.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleEnable}
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 sm:h-11 touch-manipulation"
            >
              {isLoading ? (
                'Activation...'
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Activer les notifications
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleLater}
              className="w-full text-muted-foreground h-11 touch-manipulation"
            >
              Plus tard
            </Button>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-2">
            <Settings className="w-3 h-3" />
            Modifiable à tout moment dans les paramètres
          </p>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
