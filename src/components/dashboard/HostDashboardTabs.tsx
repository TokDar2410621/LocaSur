/**
 * HostDashboardTabs - Navigation par onglets pour le dashboard propriétaire
 * Permet une navigation fluide entre les sections du dashboard host
 * Gère l'authentification: affiche login modal si non connecté
 */

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Building2, Plus, Search, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

interface Tab {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  highlight?: boolean;
  hideOnMobile?: boolean;
  requiresAuth?: boolean;
}

interface HostDashboardTabsProps {
  stats?: {
    annonces?: number;
    candidatures?: number;
  };
}

export function HostDashboardTabs({ stats }: HostDashboardTabsProps) {
  const location = useLocation();
  const { user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const tabs: Tab[] = [
    {
      label: "Aperçu",
      path: "/host",
      icon: Home,
      hideOnMobile: true,
      requiresAuth: true,
    },
    {
      label: "Locataires",
      path: "/demandes",
      icon: Search,
      requiresAuth: false, // Page publique
    },
    {
      label: "Mes Annonces",
      path: "/host",
      icon: Building2,
      badge: stats?.annonces,
      requiresAuth: true,
    },
    {
      label: "Candidatures",
      path: "/host/leads",
      icon: FileCheck,
      badge: stats?.candidatures,
      requiresAuth: true,
    },
    {
      label: "Créer",
      path: "/host/listing/new",
      icon: Plus,
      highlight: true,
      requiresAuth: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/host") {
      return location.pathname === "/host";
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (e: React.MouseEvent, tab: Tab) => {
    if (tab.requiresAuth && !user) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-20 z-30">
        <div className="container-wide px-4">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 -mb-px">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              const Icon = tab.icon;
              const isDisabled = tab.requiresAuth && !user;

              return (
                <Link
                  key={tab.path}
                  to={isDisabled ? "#" : tab.path}
                  onClick={(e) => handleTabClick(e, tab)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    tab.highlight
                      ? "text-white gradient-match shadow-sm hover:shadow-md"
                      : active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    tab.hideOnMobile && "hidden md:flex",
                    isDisabled && !tab.highlight && "opacity-60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>

                  {/* Badge */}
                  {tab.badge !== undefined && tab.badge > 0 && !tab.highlight && (
                    <span className={cn(
                      "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {tab.badge}
                    </span>
                  )}

                  {/* Active indicator - only for non-highlighted tabs */}
                  {active && !tab.highlight && (
                    <motion.div
                      layoutId="host-dashboard-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
        redirectTo={location.pathname}
        trigger="host"
      />
    </>
  );
}
