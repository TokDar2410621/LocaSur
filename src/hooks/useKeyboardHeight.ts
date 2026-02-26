import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour détecter la hauteur du clavier iOS/Android via visualViewport
 * Permet d'adapter l'UI quand le clavier est ouvert
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // Calculer la différence entre la hauteur de la fenêtre et le viewport visible
      const currentHeight = window.innerHeight - viewport.height;
      // Seuil de 100px pour éviter les faux positifs (barres de navigation, etc.)
      const isOpen = currentHeight > 100;
      
      setKeyboardHeight(Math.max(0, currentHeight));
      setIsKeyboardOpen(isOpen);
    };

    // Écouter les changements de taille du viewport
    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);
    
    // Check initial
    handleResize();

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  // Fonction utilitaire pour scroll vers l'input actif
  const scrollToActiveInput = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      // Petit délai pour laisser le clavier s'ouvrir
      setTimeout(() => {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  return { 
    keyboardHeight, 
    isKeyboardOpen,
    scrollToActiveInput 
  };
}
