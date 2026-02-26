/**
 * DashboardTabs - Navigation par onglets pour le dashboard locataire
 * Permet une navigation fluide entre les sections du dashboard
 * Gère l'authentification: affiche login modal si non connecté
 */

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Heart, FileText, CheckCircle2, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

interface Tab {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  requiresAuth?: boolean;
}

interface DashboardTabsProps {
  stats?: {
    favoris?: number;
    demandes?: number;
    candidatures?: number;
    alertes?: number;
  };
}

export function DashboardTabs({ stats }: DashboardTabsProps) {
  const location = useLocation();
  const { user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const tabs: Tab[] = [
    {
      label: "Aperçu",
      path: "/dashboard",
      icon: Home,
      requiresAuth: false,
    },
    {
      label: "Favoris",
      path: "/dashboard",
      icon: Heart,
      badge: stats?.favoris,
      requiresAuth: true,
    },
    {
      label: "Demandes",
      path: "/dashboard/demandes",
      icon: FileText,
      badge: stats?.demandes,
      requiresAuth: true,
    },
    {
      label: "Candidatures",
      path: "/dashboard",
      icon: CheckCircle2,
      badge: stats?.candidatures,
      requiresAuth: true,
    },
    {
      label: "Alertes",
      path: "/search",
      icon: Bell,
      badge: stats?.alertes,
      requiresAuth: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
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
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    isDisabled && "opacity-60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>

                  {/* Badge */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={cn(
                      "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {tab.badge}
                    </span>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="dashboard-tab-indicator"
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
        trigger="login"
      />
    </>
  );
}
