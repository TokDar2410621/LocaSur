/**
 * Hook pour auto-scroll les inputs au-dessus du clavier virtuel sur mobile
 * Exclut la page de messagerie (deja geree separement)
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "./use-mobile";

// Delai pour laisser le clavier s'ouvrir avant de scroller
const KEYBOARD_OPEN_DELAY = 300;

// Marge au-dessus de l'input (en pixels)
const SCROLL_MARGIN = 120;

export function useAutoScrollInput() {
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Ne pas appliquer sur desktop ou sur la page messages
    if (!isMobile) return;

    // Exclure la page de messagerie (deja geree)
    const isMessagingPage = location.pathname.startsWith("/messages") ||
                           location.pathname.startsWith("/messagerie");
    if (isMessagingPage) return;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      // Verifier si c'est un input ou textarea
      if (
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        !target.isContentEditable
      ) {
        return;
      }

      // Ignorer certains types d'input qui n'ouvrent pas le clavier
      if (target.tagName === "INPUT") {
        const inputType = (target as HTMLInputElement).type;
        const nonKeyboardTypes = ["checkbox", "radio", "file", "submit", "button", "reset", "color", "range"];
        if (nonKeyboardTypes.includes(inputType)) {
          return;
        }
      }

      // Attendre que le clavier s'ouvre
      setTimeout(() => {
        // Verifier que l'element est toujours focused
        if (document.activeElement !== target) return;

        // Calculer la position optimale
        const rect = target.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Si l'input est dans la moitie inferieure de l'ecran visible,
        // on doit le remonter pour qu'il soit visible au-dessus du clavier
        // (le clavier prend environ 40-50% de l'ecran sur mobile)
        const keyboardEstimatedHeight = viewportHeight * 0.45;
        const safeAreaTop = SCROLL_MARGIN;
        const safeAreaBottom = viewportHeight - keyboardEstimatedHeight;

        // Si l'input est sous la zone safe (cache par le clavier)
        if (rect.bottom > safeAreaBottom || rect.top < safeAreaTop) {
          // Scroller pour centrer l'input dans la zone visible
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, KEYBOARD_OPEN_DELAY);
    };

    // Ecouter les focus sur tout le document
    document.addEventListener("focusin", handleFocus, { passive: true });

    return () => {
      document.removeEventListener("focusin", handleFocus);
    };
  }, [isMobile, location.pathname]);
}
