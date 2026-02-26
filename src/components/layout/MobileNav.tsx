/**
 * MobileNav - Refonte UX v2.0
 *
 * Utilise MobileNavSimple par défaut (4 items max).
 * L'ancienne version MobileNavLegacy est conservée ci-dessous.
 */

// Re-export simplified version as default
export { MobileNavSimple as MobileNav } from "./MobileNavSimple";

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { Link, useLocation } from "react-router-dom";
import { Home, Search, MessageSquare, User, Building2, Plus, Heart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useState, useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { getPendingReviews } from "@/lib/matchApi";

export function MobileNavLegacy() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthContext();
  const { unreadCount } = useMessages();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTrigger, setAuthTrigger] = useState<'favorite' | 'login'>('login');
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  const userType = user?.profile?.user_type;
  const isLocataire = userType === 'locataire';
  const isBailleur = userType === 'bailleur' || userType === 'proprietaire';

  // Fetch pending reviews count for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      getPendingReviews()
        .then((response) => {
          if (response.success && response.pending_reviews) {
            setPendingReviewsCount(response.pending_reviews.length);
          }
        })
        .catch(() => {
          // Silently fail - badge just won't show
        });
    }
  }, [isAuthenticated, location.pathname]);

  // Open auth modal with appropriate trigger
  const openAuthModal = (trigger: 'favorite' | 'login') => {
    setAuthTrigger(trigger);
    setAuthModalOpen(true);
  };

  // Define navigation items based on user type - Following spec doc
  const getNavItems = () => {
    if (!isAuthenticated) {
      // Visiteur non connecté - 3 items (sans Favoris)
      return [
        { icon: Home, label: "Accueil", path: "/" },
        { icon: Search, label: "Recherche", path: "/search" },
        { icon: User, label: "Connexion", path: "#", authTrigger: 'login' as const },
      ];
    }

    if (isLocataire) {
      // Locataire connecté - 5 items avec accès direct aux actions principales
      // Dashboard regroupe stats, Favoris pour accès rapide, Créer demande au centre (highlight)
      return [
        { icon: Home, label: "Dashboard", path: "/dashboard", reviewBadge: pendingReviewsCount },
        { icon: Heart, label: "Favoris", path: "/dashboard" },
        { icon: Plus, label: "Demande", path: "/dashboard/demande/new", highlight: true },
        { icon: MessageSquare, label: "Messages", path: "/messages", badge: unreadCount },
        { icon: User, label: "Profil", path: "/profile" },
      ];
    }

    if (isBailleur) {
      // Propriétaire connecté - 5 items
      return [
        { icon: Home, label: "Dashboard", path: "/host" },
        { icon: Building2, label: "Leads", path: "/host/leads" },
        { icon: Plus, label: "Créer", path: "/host/listing/new", highlight: true },
        { icon: MessageSquare, label: "Messages", path: "/messages", badge: unreadCount },
        { icon: User, label: "Profil", path: "/profile", reviewBadge: pendingReviewsCount },
      ];
    }

    // Fallback
    return [
      { icon: Home, label: "Accueil", path: "/" },
      { icon: Search, label: "Recherche", path: "/search" },
      { icon: User, label: "Profil", path: "/profile" },
    ];
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isHighlight = 'highlight' in item && item.highlight;
            const hasAuthTrigger = 'authTrigger' in item && item.authTrigger;

            // If item has authTrigger, render as button that opens modal
            if (hasAuthTrigger) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openAuthModal(item.authTrigger as 'favorite' | 'login');
                  }}
                  className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-2 px-3 rounded-xl text-muted-foreground active:scale-95 transition-transform touch-manipulation cursor-pointer select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-[10px] font-medium mt-0.5 truncate max-w-[56px]">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-2 px-3 rounded-xl relative active:scale-95 transition-all touch-manipulation select-none",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground",
                  isHighlight && !active && "text-primary"
                )}
              >
                {isHighlight ? (
                  <div className="w-10 h-10 rounded-full gradient-search flex items-center justify-center -mt-3 shadow-lg ring-4 ring-background">
                    <Icon className="w-5 h-5 text-search-foreground" />
                  </div>
                ) : (
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    active ? "fill-current scale-110" : "stroke-[1.5]"
                  )} />
                )}
                <span className={cn(
                  "text-[10px] font-medium mt-0.5 truncate max-w-[56px]",
                  isHighlight && "-mt-1"
                )}>{item.label}</span>

                {/* Badge for messages */}
                {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-background">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Badge for pending reviews (amber color) */}
                {'reviewBadge' in item && typeof item.reviewBadge === 'number' && item.reviewBadge > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-background">
                    {item.reviewBadge > 9 ? '9+' : item.reviewBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Auth Modal - Triggered by Favoris or Connexion for visitors */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        trigger={authTrigger}
      />
    </>
  );
}