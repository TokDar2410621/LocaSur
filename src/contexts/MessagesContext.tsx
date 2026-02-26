/**
 * MessagesContext - Gestion des messages non lus à travers l'application
 * Permet d'afficher les badges de messages non lus dans la MobileNav et Navbar
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuthContext } from "./AuthContext";

interface MessagesContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markConversationRead: (conversationId: number) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      // Vérifier d'abord que la session est valide
      const api = await import('@/lib/api');
      const authCheck = await api.default.get<{ authenticated: boolean }>('/api/auth/me/');
      if (!authCheck.authenticated) {
        setUnreadCount(0);
        return;
      }

      const { getMessages } = await import('@/lib/matchApi');
      const response = await getMessages();

      if (response.success) {
        // Count total unread messages across all conversations
        const totalUnread = response.conversations.reduce((acc: number, conv: any) => {
          if (typeof conv.unread === 'number') {
            return acc + conv.unread;
          } else if (conv.unread) {
            return acc + 1;
          }
          return acc;
        }, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  const markConversationRead = useCallback((conversationId: number) => {
    // Optimistically decrease the count
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Fetch unread count on auth change
  useEffect(() => {
    refreshUnreadCount();
  }, [isAuthenticated, refreshUnreadCount]);

  // Periodic refresh (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <MessagesContext.Provider value={{ unreadCount, refreshUnreadCount, markConversationRead }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
