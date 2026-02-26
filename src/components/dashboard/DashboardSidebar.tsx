/**
 * DashboardSidebar - Sidebar navigation desktop pour locataire & proprietaire
 * Hidden on mobile (md:block), sticky below navbar
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  Home, Heart, FileText, Send, Star, MessageSquare, Bell,
  Users, Building2, Plus, Inbox, User, Shield, ShieldCheck,
  Settings, HelpCircle, LogOut, ChevronRight
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  highlight?: boolean;
}

interface DashboardSidebarProps {
  userType: 'locataire' | 'proprietaire';
  user: any;
  stats: {
    unreadMessages: number;
    profileCompletion: number;
    verificationLevel: string;
    verificationScore: number;
    favorisCount?: number;
    referencesCount?: number;
    candidaturesCount?: number;
    annoncesCount?: number;
    referencesGivenCount?: number;
  };
  onLogout: () => void;
}

export function DashboardSidebar({ userType, user, stats, onLogout }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const firstName = user?.first_name || user?.email?.split('@')[0] || (userType === 'locataire' ? 'Locataire' : 'Proprietaire');
  const initials = firstName.substring(0, 2).toUpperCase();
  const avatarUrl = user?.profile?.avatar_url;

  const tenantNav: NavItem[] = [
    { icon: Home, label: "Apercu", path: "/dashboard" },
    { icon: Heart, label: "Favoris", path: "/dashboard", badge: stats.favorisCount },
    { icon: FileText, label: "Ma demande", path: "/dashboard/demande" },
    { icon: Send, label: "Candidatures", path: "/dashboard", badge: stats.candidaturesCount },
    { icon: Star, label: "References", path: "/profile", badge: stats.referencesCount },
    { icon: MessageSquare, label: "Messages", path: "/messages", badge: stats.unreadMessages },
    { icon: Bell, label: "Alertes", path: "/search" },
  ];

  const landlordNav: NavItem[] = [
    { icon: Home, label: "Apercu", path: "/host" },
    { icon: Users, label: "Locataires", path: "/host/leads" },
    { icon: Building2, label: "Annonces", path: "/host", badge: stats.annoncesCount },
    { icon: Inbox, label: "Candidatures", path: "/host" },
    { icon: Star, label: "References", path: "/profile", badge: stats.referencesGivenCount },
    { icon: MessageSquare, label: "Messages", path: "/messages", badge: stats.unreadMessages },
    { icon: Plus, label: "Creer annonce", path: "/host/listing/new", highlight: true },
  ];

  const navItems = userType === 'locataire' ? tenantNav : landlordNav;

  const isActive = (path: string) => {
    if (path === "/dashboard" || path === "/host") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-60 h-[calc(100vh-5rem)] sticky top-[5rem] border-r border-border bg-card flex flex-col overflow-hidden">
      {/* User Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={avatarUrl}
            alt={firstName}
            fallback={initials}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{firstName}</p>
            <span className={cn(
              "inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              userType === 'locataire'
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                : "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
            )}>
              {userType === 'locataire' ? 'Locataire' : 'Proprietaire'}
            </span>
          </div>
        </div>

        {/* Compact Verification Bar */}
        <button
          onClick={() => navigate('/verification')}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          {stats.verificationLevel === 'identity_confirmed' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  stats.verificationLevel === 'identity_confirmed'
                    ? "bg-green-500"
                    : stats.verificationLevel === 'verified'
                    ? "bg-blue-500"
                    : "bg-muted-foreground/30"
                )}
                style={{ width: `${stats.verificationScore}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
            {stats.verificationLevel === 'identity_confirmed'
              ? "Verifie"
              : `${stats.verificationScore}%`
            }
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                  item.highlight
                    ? "gradient-match text-white shadow-sm hover:shadow-md mt-2"
                    : active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {/* Active indicator bar */}
                {active && !item.highlight && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                )}

                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && !item.highlight && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <div className="space-y-0.5">
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              location.pathname === '/profile'
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" />
            <span>Mon profil</span>
          </Link>
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              location.pathname === '/profile'
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Parametres</span>
          </Link>
          <Link
            to="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Aide</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Deconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
