import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, Mail, MapPin } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

export function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState('/dashboard');
  const [authTrigger, setAuthTrigger] = useState<'login' | 'host'>('login');

  const handleProtectedClick = (e: React.MouseEvent, path: string, trigger: 'login' | 'host' = 'login') => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(path);
    } else {
      setAuthRedirectTo(path);
      setAuthTrigger(trigger);
      setShowAuthModal(true);
    }
  };

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-search flex items-center justify-center">
                <Home className="w-4 h-4 text-search-foreground" />
              </div>
              <span className="font-semibold text-lg">LocaSur</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              La plateforme immobilière intelligente du Québec.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:contact@locasur.ca" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                contact@locasur.ca
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Saguenay, Québec
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Produits</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Housing Search
                </Link>
              </li>
              <li>
                <Link to="/match" className="text-muted-foreground hover:text-foreground transition-colors">
                  Housing Match
                </Link>
              </li>
            </ul>
          </div>

          {/* Locataires */}
          <div>
            <h4 className="font-semibold mb-4">Locataires</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/dashboard"
                  onClick={(e) => handleProtectedClick(e, '/dashboard')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Mon tableau de bord
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/favoris"
                  onClick={(e) => handleProtectedClick(e, '/dashboard/favoris')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Mes favoris
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/alertes"
                  onClick={(e) => handleProtectedClick(e, '/dashboard/alertes')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Mes alertes
                </a>
              </li>
            </ul>
          </div>

          {/* Propriétaires */}
          <div>
            <h4 className="font-semibold mb-4">Propriétaires</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/host"
                  onClick={(e) => handleProtectedClick(e, '/host', 'host')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Dashboard propriétaire
                </a>
              </li>
              <li>
                <a
                  href="/host/listing/new"
                  onClick={(e) => handleProtectedClick(e, '/host/listing/new', 'host')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Publier une annonce
                </a>
              </li>
              <li>
                <a
                  href="/host/demandes"
                  onClick={(e) => handleProtectedClick(e, '/host/demandes', 'host')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Voir les demandes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ressources & SEO Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-8 pt-8 border-t border-border">
          {/* Ressources */}
          <div>
            <h4 className="font-semibold mb-4">Ressources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/blog?category=conseils-locataires" className="text-muted-foreground hover:text-foreground transition-colors">
                  Conseils locataires
                </Link>
              </li>
              <li>
                <Link to="/blog?category=conseils-proprietaires" className="text-muted-foreground hover:text-foreground transition-colors">
                  Conseils propriétaires
                </Link>
              </li>
            </ul>
          </div>

          {/* Villes populaires */}
          <div>
            <h4 className="font-semibold mb-4">Villes populaires</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/search?q=Saguenay" className="text-muted-foreground hover:text-foreground transition-colors">
                  Logement Saguenay
                </Link>
              </li>
              <li>
                <Link to="/search?q=Chicoutimi" className="text-muted-foreground hover:text-foreground transition-colors">
                  Chambre Chicoutimi
                </Link>
              </li>
              <li>
                <Link to="/search?q=Jonquière" className="text-muted-foreground hover:text-foreground transition-colors">
                  Appartement Jonquière
                </Link>
              </li>
              <li>
                <Link to="/search?q=Québec" className="text-muted-foreground hover:text-foreground transition-colors">
                  Logement Québec
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                  Donner votre avis
                </Link>
              </li>
              <li>
                <Link to="/pour-proprietaires" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pour les proprietaires
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LocaSur - Tous droits réservés
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        trigger={authTrigger}
        defaultMode="signup"
        redirectTo={authRedirectTo}
      />
    </footer>
  );
}
