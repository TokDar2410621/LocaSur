/**
 * Navigation contextuelle - Refonte UX v2.0
 *
 * Mobile - Contextuel selon la page:
 * - Accueil: Logo | Profil + tabs Locataires | Propriétaires
 * - Recherche: CACHÉ (SearchHeader gère tout)
 * - Autres pages: Logo | Profil + tabs Logements | Demandes
 *
 * Desktop:
 * - Recherche: Logo | [Search Bar] | Filtre | Louer | Profil
 * - Accueil/Autres: Logo | <spacer> | Louer mon logement | Créer un compte | Profil
 */

import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Home, Menu, User, LogOut, MessageSquare, Search, FileText, Building2, Users, HelpCircle, SlidersHorizontal, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchInput } from "@/components/ui/search-input";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";

interface NavbarSimpleProps {
  // Optional props for search page integration
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
}

export function NavbarSimple({ onOpenFilters, activeFiltersCount = 0 }: NavbarSimpleProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isScrolled, setIsScrolled] = useState(false);
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { unreadCount } = useMessages();
  const [notifCount, setNotifCount] = useState(0);

  const userType = user?.profile?.user_type;
  const isBailleur = userType === 'bailleur' || userType === 'proprietaire';
  const isLocataire = userType === 'locataire';

  // Sync desktop search with URL params
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('ville') || '';
    setDesktopSearchQuery(q);
  }, [searchParams]);

  // Handle desktop search
  const handleDesktopSearch = () => {
    if (desktopSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(desktopSearchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  // Detect scroll for mobile icons animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch notification count (address alerts)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const { default: api } = await import('@/lib/api');
        const data = await api.get<{ success: boolean; alerts: any[] }>('/api/references/address-alerts/');
        if (data.success && data.alerts) {
          setNotifCount(data.alerts.filter((a: any) => a.status === 'pending').length);
        }
      } catch { /* silent */ }
    };
    fetchNotifs();
  }, [isAuthenticated]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  // Navigation links based on user type
  const getNavLinks = () => {
    if (!isAuthenticated) {
      // Visiteur
      return [
        { label: "Trouver un logement", to: "/search", icon: Search },
        { label: "Publier une demande", to: "/dashboard/demande/new", icon: FileText },
      ];
    }

    if (isLocataire) {
      // Locataire
      return [
        { label: "Ma demande", to: "/dashboard/demandes", icon: FileText },
        { label: "Messages", to: "/messages", icon: MessageSquare, badge: unreadCount },
        { label: "Explorer", to: "/search", icon: Search },
      ];
    }

    // Propriétaire
    return [
      { label: "Voir locataires", to: "/host/leads", icon: Users },
      { label: "Mes annonces", to: "/host/annonces", icon: Building2 },
      { label: "Messages", to: "/messages", icon: MessageSquare, badge: unreadCount },
    ];
  };

  const navLinks = getNavLinks();

  // Detect current page context
  const isSearchPage = location.pathname.startsWith('/search');
  const isDemandesPage = location.pathname.startsWith('/demandes');
  const isHomePage = location.pathname === '/' || location.pathname.startsWith('/pour-proprietaires');

  // Mobile tabs context
  const homepageTab = location.pathname.startsWith('/pour-proprietaires') ? 'proprietaires' : 'locataires';
  const otherPagesTab = location.pathname.startsWith('/demandes')
    ? 'demandes'
    : 'logements';

  // On search/demandes page, hide mobile navbar (SearchHeader/DemandesHeader handles it)
  if (isSearchPage || isDemandesPage) {
    return (
      <>
        {/* ========== DESKTOP NAVBAR - SEARCH PAGE ========== */}
        {/* Layout: Logo | [Search Bar] | Filtre | Louer | Profil */}
        <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block bg-background border-b border-border">
          <div className="container-wide">
            <div className="flex h-16 items-center gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 shrink-0 group">
                <motion.div
                  className="w-8 h-8 rounded-lg gradient-search flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-4 h-4 text-white" />
                </motion.div>
                <span className="font-semibold text-lg">LocaSur</span>
              </Link>

              {/* Center - Big Search Bar */}
              <div className="flex-1 max-w-2xl mx-auto">
                <SearchInput
                  placeholder="Rechercher une ville, un quartier..."
                  value={desktopSearchQuery}
                  onChange={(e) => setDesktopSearchQuery(e.target.value)}
                  onSearch={handleDesktopSearch}
                  className="h-11 rounded-full border-border bg-muted/50 shadow-sm focus-within:border-primary focus-within:bg-background focus-within:shadow-md transition-all"
                />
              </div>

              {/* Filter Button */}
              {onOpenFilters && (
                <button
                  onClick={onOpenFilters}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all",
                    activeFiltersCount > 0
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}

              {/* Louer Link */}
              <Link
                to="/pour-proprietaires"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Louer</span>
              </Link>

              {/* Notification Bell */}
              {isAuthenticated && notifCount > 0 && (
                <Link
                  to="/host"
                  className="relative p-2 rounded-full hover:bg-muted transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                    {notifCount}
                  </span>
                </Link>
              )}

              {/* Profile Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 border border-border rounded-full p-1 pl-3 transition-shadow",
                    isMenuOpen ? "shadow-lg" : "hover:shadow-md"
                  )}
                >
                  <Menu className="w-4 h-4" />
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {isAuthenticated && user ? (
                      <Avatar
                        src={user.profile?.avatar_url}
                        fallback={user.first_name || user.email?.split('@')[0]}
                        alt="Avatar"
                        size="sm"
                      />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
                    >
                      {!isAuthenticated ? (
                        <div className="py-2">
                          <button onClick={() => openAuth('signup')} className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left font-medium">
                            Inscription
                          </button>
                          <button onClick={() => openAuth('login')} className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left">
                            Connexion
                          </button>
                          <div className="border-t border-border my-1" />
                          <Link to="/pour-proprietaires" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            Louer mon logement
                          </Link>
                          <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            Centre d'aide
                          </Link>
                        </div>
                      ) : (
                        <div className="py-2">
                          <Link to={isBailleur ? "/host" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted font-medium">
                            <Home className="w-4 h-4" />
                            Tableau de bord
                          </Link>
                          <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                            <User className="w-4 h-4 text-muted-foreground" />
                            Mon profil
                          </Link>
                          <div className="border-t border-border my-1" />
                          <Link to="/pour-proprietaires" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            Louer mon logement
                          </Link>
                          <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            Centre d'aide
                          </Link>
                          <div className="border-t border-border my-1" />
                          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left text-muted-foreground">
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          trigger="login"
          defaultMode={authModalMode}
        />
      </>
    );
  }

  return (
    <>
      {/* ========== MOBILE NAVBAR - Contextuel ========== */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300",
        isHomePage && !isScrolled
          ? "bg-transparent"
          : "bg-background border-b border-border"
      )}>
        {/* Row 1: Logo + Avatar Menu */}
        <div className="flex h-12 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-7 h-7 rounded-lg gradient-search flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4 text-white" />
            </motion.div>
            <span className="font-semibold text-base">LocaSur</span>
          </Link>

          {/* Notification Bell (Mobile) */}
          <div className="flex items-center gap-2">
            {isAuthenticated && notifCount > 0 && (
              <Link
                to="/host"
                className="relative p-1.5 rounded-full hover:bg-muted transition-colors"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full">
                  {notifCount}
                </span>
              </Link>
            )}

          {/* Avatar Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex items-center gap-1.5 border border-border rounded-full p-0.5 pl-2 transition-shadow",
                isMenuOpen ? "shadow-lg" : "hover:shadow-md"
              )}
            >
              <Menu className="w-3.5 h-3.5" />
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {isAuthenticated && user ? (
                  <Avatar
                    src={user.profile?.avatar_url}
                    fallback={user.first_name || user.email?.split('@')[0]}
                    alt="Avatar"
                    size="sm"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Mobile Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                >
                  {!isAuthenticated ? (
                    <div className="py-2">
                      <button onClick={() => openAuth('signup')} className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left font-medium">
                        Inscription
                      </button>
                      <button onClick={() => openAuth('login')} className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left">
                        Connexion
                      </button>
                      <div className="border-t border-border my-1" />
                      <Link to="/pour-proprietaires" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Louer mon logement
                      </Link>
                      <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        Centre d'aide
                      </Link>
                      <div className="border-t border-border my-1 px-4">
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-muted-foreground">Thème</span>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Link to={isBailleur ? "/host" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted font-medium">
                        <Home className="w-4 h-4" />
                        Tableau de bord
                      </Link>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Mon profil
                      </Link>
                      <div className="border-t border-border my-1" />
                      <Link to="/pour-proprietaires" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Louer mon logement
                      </Link>
                      <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        Centre d'aide
                      </Link>
                      <div className="border-t border-border my-1 px-4">
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-muted-foreground">Thème</span>
                          <ThemeToggle />
                        </div>
                      </div>
                      <div className="border-t border-border my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left text-muted-foreground">
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>

        {/* Row 2: Pills Toggle - Contextuel selon la page */}
        <div className={cn(
          "flex justify-center pb-2 transition-all duration-300",
          isScrolled ? "pb-1.5" : "pb-3"
        )}>
          <div className="inline-flex bg-muted rounded-full p-1">
            {isHomePage ? (
              <>
                {/* Homepage: Locataires | Propriétaires */}
                <Link
                  to="/"
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    homepageTab === 'locataires'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <motion.div
                    animate={{
                      opacity: isScrolled ? 0 : 1,
                      width: isScrolled ? 0 : 'auto',
                      marginRight: isScrolled ? 0 : 6
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden text-base"
                  >
                    🏠
                  </motion.div>
                  <span>Locataires</span>
                </Link>

                <Link
                  to="/pour-proprietaires"
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    homepageTab === 'proprietaires'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <motion.div
                    animate={{
                      opacity: isScrolled ? 0 : 1,
                      width: isScrolled ? 0 : 'auto',
                      marginRight: isScrolled ? 0 : 6
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden text-base"
                  >
                    🏢
                  </motion.div>
                  <span>Propriétaires</span>
                </Link>
              </>
            ) : (
              <>
                {/* Other pages: Logements | Demandes */}
                <Link
                  to="/search"
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    otherPagesTab === 'logements'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <motion.div
                    animate={{
                      opacity: isScrolled ? 0 : 1,
                      width: isScrolled ? 0 : 'auto',
                      marginRight: isScrolled ? 0 : 6
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden text-base"
                  >
                    🏠
                  </motion.div>
                  <span>Logements</span>
                </Link>

                <Link
                  to="/demandes"
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    otherPagesTab === 'demandes'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <motion.div
                    animate={{
                      opacity: isScrolled ? 0 : 1,
                      width: isScrolled ? 0 : 'auto',
                      marginRight: isScrolled ? 0 : 6
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden text-base"
                  >
                    📝
                  </motion.div>
                  <span>Demandes</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ========== DESKTOP NAVBAR - ACCUEIL/AUTRES ========== */}
      {/* Layout: Logo | <spacer> | Louer mon logement | Créer un compte | Profil */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 hidden md:block transition-all duration-300",
        isHomePage && !isScrolled
          ? "bg-transparent"
          : "bg-background border-b border-border"
      )}>
        <div className="container-wide">
          <div className="flex h-16 items-center gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <motion.div
                className="w-8 h-8 rounded-lg gradient-search flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-semibold text-lg">LocaSur</span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side - Links + Avatar menu */}
            <div className="flex items-center gap-3">
              {isHomePage ? (
                /* Homepage: Locataires/Propriétaires tab pills */
                <div className="flex items-center bg-white/25 dark:bg-white/10 rounded-full p-0.5">
                  <Link
                    to="/"
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                      homepageTab === 'locataires'
                        ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    Locataires
                  </Link>
                  <Link
                    to="/pour-proprietaires"
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                      homepageTab === 'proprietaires'
                        ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    Propriétaires
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/pour-proprietaires"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Louer mon logement</span>
                  </Link>
                  {!isAuthenticated && (
                    <button
                      onClick={() => openAuth('signup')}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Créer un compte
                    </button>
                  )}
                </>
              )}

              {/* Notification Bell */}
              {isAuthenticated && notifCount > 0 && (
                <Link
                  to="/host"
                  className="relative p-2 rounded-full hover:bg-muted transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                    {notifCount}
                  </span>
                </Link>
              )}

              {/* Avatar Menu Button */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 border border-border rounded-full p-1 pl-3 transition-shadow",
                    isMenuOpen ? "shadow-lg" : "hover:shadow-md"
                  )}
                >
                  <Menu className="w-4 h-4" />
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {isAuthenticated && user ? (
                      <Avatar
                        src={user.profile?.avatar_url}
                        fallback={user.first_name || user.email?.split('@')[0]}
                        alt="Avatar"
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
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
                  >
                    {!isAuthenticated ? (
                      // Visiteur Menu
                      <div className="py-2">
                        <button
                          onClick={() => openAuth('signup')}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left font-medium"
                        >
                          Inscription
                        </button>
                        <button
                          onClick={() => openAuth('login')}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left"
                        >
                          Connexion
                        </button>
                        <div className="border-t border-border my-1" />
                        <Link
                          to="/pour-proprietaires"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                        >
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          Louer mon logement
                        </Link>
                        <Link
                          to="/help"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                        >
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          Centre d'aide
                        </Link>
                        <div className="border-t border-border my-1 px-4">
                          <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-muted-foreground">Thème</span>
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Utilisateur connecté
                      <div className="py-2">
                        <Link
                          to={isBailleur ? "/host" : "/dashboard"}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted font-medium"
                        >
                          <Home className="w-4 h-4" />
                          Tableau de bord
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          Mon profil
                        </Link>

                        <div className="border-t border-border my-1" />

                        <Link
                          to="/pour-proprietaires"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                        >
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          Louer mon logement
                        </Link>
                        <Link
                          to="/help"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                        >
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          Centre d'aide
                        </Link>

                        <div className="border-t border-border my-1 px-4">
                          <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-muted-foreground">Thème</span>
                            <ThemeToggle />
                          </div>
                        </div>

                        <div className="border-t border-border my-1" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left text-muted-foreground"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
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
      </nav>

    {/* Auth Modal */}
    <AuthModal
      open={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      trigger="login"
      defaultMode={authModalMode}
    />
  </>
  );
}

export default NavbarSimple;
