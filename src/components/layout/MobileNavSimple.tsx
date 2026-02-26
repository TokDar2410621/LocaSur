/**
 * Navigation mobile - Refonte UX v3.0
 *
 * Structure contextuelle:
 *
 * LOCATAIRE connecté (5 items):
 * - Dashboard | Messages | +Demande | Match/Recherche | Profil
 *
 * PROPRIETAIRE connecté (5 items):
 * - Dashboard | Messages | +Annonce | Match/Recherche | Profil
 *
 * VISITEUR non connecté (3 items):
 * - Accueil | Recherche | Connexion
 */

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useState, useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import {
  Home,
  MessageSquare,
  Plus,
  Search,
  User,
  Heart,
  Users,
  FileText,
  Building2
} from "lucide-react";

export function MobileNavSimple() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthContext();
  const { unreadCount } = useMessages();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // État pour savoir si l'utilisateur a une demande/annonce active
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [hasActiveListings, setHasActiveListings] = useState(false);

  const userType = user?.profile?.user_type;
  const isLocataire = userType === 'locataire';
  const isBailleur = userType === 'bailleur' || userType === 'proprietaire';

  // Charger l'état des demandes/annonces actives
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserState = async () => {
      try {
        if (isLocataire) {
          const { getDashboardLocataire } = await import('@/lib/matchApi');
          const response = await getDashboardLocataire();
          if (response.success) {
            setHasActiveRequest(!!(response as any).demande_active);
          }
        } else if (isBailleur) {
          const { getDashboardProprietaire } = await import('@/lib/matchApi');
          const response = await getDashboardProprietaire();
          if (response.success) {
            setHasActiveListings((response.annonces?.length || 0) > 0);
          }
        }
      } catch (error) {
        console.error('Error fetching user state:', error);
      }
    };

    fetchUserState();
  }, [isAuthenticated, isLocataire, isBailleur, location.pathname]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/search") return location.pathname === "/search" || location.pathname.startsWith("/search");
    return location.pathname.startsWith(path);
  };

  // Items pour visiteur non connecté
  const visitorItems = [
    {
      icon: Home,
      label: "Accueil",
      path: "/",
      emoji: "🏠"
    },
    {
      icon: Search,
      label: "Recherche",
      path: "/search",
      emoji: "🔍"
    },
    {
      icon: User,
      label: "Connexion",
      path: "#",
      authRequired: true,
      emoji: "👤"
    },
  ];

  // Items pour locataire connecté
  const tenantItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/dashboard",
      emoji: "🏠"
    },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/messages",
      badge: unreadCount,
      emoji: "💬"
    },
    {
      icon: Plus,
      label: "Publier",
      path: hasActiveRequest ? "/dashboard/demandes" : "/dashboard/demande/new",
      emoji: "➕"
    },
    {
      icon: hasActiveRequest ? Users : Search,
      label: hasActiveRequest ? "Match" : "Recherche",
      path: hasActiveRequest ? "/dashboard/demandes" : "/search",
      emoji: hasActiveRequest ? "🤝" : "🔍"
    },
    {
      icon: User,
      label: "Profil",
      path: "/profile",
      emoji: "👤"
    },
  ];

  // Items pour propriétaire connecté
  const landlordItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/host",
      emoji: "🏠"
    },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/messages",
      badge: unreadCount,
      emoji: "💬"
    },
    {
      icon: Plus,
      label: "Publier",
      path: "/host/listing/new",
      emoji: "➕"
    },
    {
      icon: hasActiveListings ? Users : FileText,
      label: hasActiveListings ? "Match" : "Demandes",
      path: hasActiveListings ? "/host/leads" : "/demandes",
      emoji: hasActiveListings ? "🤝" : "📋"
    },
    {
      icon: User,
      label: "Profil",
      path: "/profile",
      emoji: "👤"
    },
  ];

  // Sélectionner les bons items
  const navItems = !isAuthenticated
    ? visitorItems
    : isLocataire
      ? tenantItems
      : isBailleur
        ? landlordItems
        : visitorItems;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-2px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className={cn(
          "flex items-center justify-around h-16 px-2 mx-auto",
          !isAuthenticated ? "max-w-xs" : "max-w-md"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasBadge = 'badge' in item && typeof item.badge === 'number' && item.badge > 0;
            const isAuthRequired = 'authRequired' in item && item.authRequired;

            // Si auth requise et pas connecté, ouvrir modal
            if (isAuthRequired && !isAuthenticated) {
              return (
                <motion.button
                  key={item.label}
                  onClick={() => setAuthModalOpen(true)}
                  className="flex flex-col items-center justify-center min-w-[52px] py-2 px-1"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] mt-1 font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </motion.button>
              );
            }

            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className="flex flex-col items-center justify-center min-w-[52px] py-2 px-1 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  {active ? (
                    // État actif - emoji
                    <span className="text-xl">{item.emoji}</span>
                  ) : (
                    // État inactif - icône grise
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  )}

                  {/* Badge pour messages non lus */}
                  {hasBadge && (
                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                      {item.badge! > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </motion.div>

                <span className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  active
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        trigger="login"
      />
    </>
  );
}

export default MobileNavSimple;
