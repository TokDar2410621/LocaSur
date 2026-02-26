/**
 * Navbar - Refonte UX v2.0
 *
 * Utilise NavbarSimple par défaut (version épurée).
 * L'ancienne version NavbarLegacy est conservée ci-dessous.
 */

import { NavbarSimple } from "./NavbarSimple";

// Props interface for Navbar
interface NavbarProps {
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
}

// Wrapper component that forwards props to NavbarSimple
export function Navbar(props: NavbarProps) {
  return <NavbarSimple {...props} />;
}

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, Menu, User, LogOut, Settings, MessageSquare, Plus, Building2, HelpCircle, ChevronRight, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";

export function NavbarLegacy() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { unreadCount } = useMessages();

  const [authTrigger, setAuthTrigger] = useState<'login' | 'favorite' | 'host'>('login');
  const [authRedirectTo, setAuthRedirectTo] = useState<string | undefined>(undefined);

  const openAuthModal = (mode: 'login' | 'signup', trigger: 'login' | 'favorite' | 'host' = 'login', redirectTo?: string) => {
    setAuthModalMode(mode);
    setAuthTrigger(trigger);
    setAuthRedirectTo(redirectTo);
    setAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleHostClick = () => {
    if (isAuthenticated) {
      navigate('/host/listing/new');
    } else {
      // Redirect to landing page for non-authenticated users
      navigate('/pour-proprietaires');
      setIsMenuOpen(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  // User type detection
  const userType = user?.profile?.user_type;
  const isBailleur = userType === 'bailleur' || userType === 'proprietaire';
  const isLocataire = userType === 'locataire';

  // Check if we're on the homepage (don't show search bar in header)
  const isHomePage = location.pathname === '/';

  // Handle quick search from header
  const handleQuickSearch = () => {
    navigate('/search');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-wide">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-search flex items-center justify-center">
              <Home className="w-4 h-4 text-search-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">LocaSur</span>
          </Link>

          {/* Center - Mobile: CTA Propriétaire | Desktop: Search Bar */}
          <div className="flex-1 flex justify-center mx-4">
            {/* Mobile: Louer CTA (hidden if already proprietaire) */}
            {!isBailleur && (
              <Link
                to="/pour-proprietaires"
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Je veux louer</span>
              </Link>
            )}

            {/* Desktop: Search Bar (hidden on home) */}
            {!isHomePage && (
              <button
                onClick={handleQuickSearch}
                className="hidden md:flex search-bar-compact flex-1 max-w-md cursor-pointer"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Rechercher un logement...</span>
              </button>
            )}
          </div>

          {/* Right Side - CTA + Menu */}
          <div className="flex items-center gap-3">
            {/* Louer mon logement - Desktop CTA */}
            {!isBailleur && (
              <button
                onClick={handleHostClick}
                className="hidden md:block text-sm font-medium text-foreground hover:bg-muted rounded-full px-4 py-2 transition-colors"
              >
                Louer mon logement
              </button>
            )}

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* CTA Inscription - Visible pour visiteurs */}
            {!isAuthenticated && (
              <Button
                onClick={() => openAuthModal('signup')}
                className="hidden sm:flex gradient-search text-search-foreground rounded-full px-5 h-10 font-medium"
              >
                Créer un compte
              </Button>
            )}

            {/* Menu Button (Airbnb style) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "flex items-center gap-2 border border-border rounded-full p-1 pl-3 transition-shadow",
                  isMenuOpen ? "shadow-soft-lg" : "hover:shadow-soft"
                )}
              >
                <Menu className="w-4 h-4 text-foreground" />
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {isAuthenticated && user ? (
                    <Avatar
                      src={user.profile?.avatar_url}
                      fallback={user.first_name || user.email?.split('@')[0]}
                      alt={user.first_name || 'User'}
                      size="sm"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-soft-xl border border-border overflow-hidden"
                  >
                    {!isAuthenticated ? (
                      /* Visitor Menu */
                      <div className="py-2">
                        <button
                          onClick={() => openAuthModal('login')}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors w-full text-left"
                        >
                          <span className="font-semibold">Inscription / Connexion</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>

                        <div className="border-t border-border my-2" />
                        
                        <button
                          onClick={handleHostClick}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
                        >
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>Louer mon logement</span>
                        </button>
                        <Link
                          to="/blog"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>Blog</span>
                        </Link>
                        <Link
                          to="/help"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span>Centre d'aide</span>
                        </Link>

                        <div className="border-t border-border my-2 px-4">
                          <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-muted-foreground">Thème</span>
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    ) : isLocataire ? (
                      /* Locataire Menu */
                      <div className="py-2">
                        <Link
                          to="/messages"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span>Messages</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span>Mon tableau de bord</span>
                        </Link>

                        <div className="border-t border-border my-2" />

                        <button
                          onClick={handleHostClick}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
                        >
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>Devenir propriétaire</span>
                        </button>
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Mon profil</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          <span>Paramètres</span>
                        </Link>
                        
                        <div className="border-t border-border my-2" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 text-muted-foreground" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    ) : (
                      /* Propriétaire Menu */
                      <div className="py-2">
                        <Link
                          to="/messages"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span>Messages</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/host"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span>Dashboard propriétaire</span>
                        </Link>
                        <Link
                          to="/host/leads"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>Mes leads</span>
                        </Link>
                        <Link
                          to="/host/listing/new"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-primary"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Créer une annonce</span>
                        </Link>
                        
                        <div className="border-t border-border my-2" />
                        
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Mon profil</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          <span>Paramètres</span>
                        </Link>
                        
                        <div className="border-t border-border my-2" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 text-muted-foreground" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        trigger={authTrigger}
        defaultMode={authModalMode}
        redirectTo={authRedirectTo}
      />
    </nav>
  );
}