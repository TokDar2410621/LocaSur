/**
 * Context pour afficher le profil public d'un utilisateur dans un modal
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { PublicProfileModal } from "@/components/profile/PublicProfileModal";

interface PublicProfileContextType {
  openProfile: (userId: number) => void;
  closeProfile: () => void;
}

const PublicProfileContext = createContext<PublicProfileContextType | null>(null);

export function PublicProfileProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openProfile = useCallback((id: number) => {
    setUserId(id);
    setIsOpen(true);
  }, []);

  const closeProfile = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <PublicProfileContext.Provider value={{ openProfile, closeProfile }}>
      {children}
      <PublicProfileModal
        userId={userId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </PublicProfileContext.Provider>
  );
}

export function usePublicProfile() {
  const context = useContext(PublicProfileContext);
  if (!context) {
    throw new Error("usePublicProfile must be used within a PublicProfileProvider");
  }
  return context;
}
