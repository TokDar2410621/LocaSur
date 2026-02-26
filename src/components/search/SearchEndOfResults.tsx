/**
 * SearchEndOfResults - Composant affiché à la fin des résultats de recherche
 * Objectif: Capturer les utilisateurs qui n'ont pas trouvé ce qu'ils cherchent
 *
 * P0 UX Optimisations:
 * - 1 CTA primaire (alerte) + 1 secondaire (demande en lien)
 * - Preview des attentes (temps, fréquence)
 * - Suggestions actionnables avec boutons
 * - Design compact pour fin de liste
 */

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, FileText, ArrowUp, Clock, Mail, Plus, MapPin, ChevronRight, BookOpen, Sparkles, MessageSquare, Heart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface SearchEndOfResultsProps {
  query?: string;
  totalResults: number;
  filters?: {
    ville?: string;
    budget_min?: number;
    budget_max?: number;
    type?: string;
  };
}

export function SearchEndOfResults({ query, totalResults, filters }: SearchEndOfResultsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<'alert' | 'demande'>('alert');

  // Budget actuel pour les suggestions
  const currentBudget = filters?.budget_max || 0;

  const handleCreateAlert = () => {
    if (!isAuthenticated) {
      setAuthAction('alert');
      setShowAuthModal(true);
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    // Utilise filters.ville si disponible, sinon query comme fallback
    const ville = filters?.ville || query;
    if (ville) params.set('ville', ville);
    if (filters?.budget_max) params.set('budget_max', filters.budget_max.toString());
    navigate(`/search?${params.toString()}`);
  };

  const handleCreateDemande = () => {
    if (!isAuthenticated) {
      setAuthAction('demande');
      setShowAuthModal(true);
      return;
    }
    const params = new URLSearchParams();
    // Utilise filters.ville si disponible, sinon query comme fallback
    const ville = filters?.ville || query;
    if (ville) params.set('ville', ville);
    if (filters?.budget_max) params.set('budget_max', filters.budget_max.toString());
    navigate(`/dashboard/demande/new?${params.toString()}`);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (authAction === 'alert') {
      handleCreateAlert();
    } else {
      handleCreateDemande();
    }
  };

  // Élargir le budget de recherche
  const handleExpandBudget = (amount: number) => {
    const newBudget = currentBudget + amount;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('budget_max', newBudget.toString());
    if (query) newParams.set('q', query);
    navigate(`/search?${newParams.toString()}`);
  };

  // Rechercher dans les quartiers voisins
  const handleExpandArea = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (filters?.budget_max) newParams.set('budget_max', filters.budget_max.toString());
    if (filters?.ville) newParams.set('ville', filters.ville);
    newParams.set('rayon', '10');
    navigate(`/search?${newParams.toString()}`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 mb-4">
      {/* Séparateur fin de résultats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">
          Fin des {totalResults} résultats
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* CTA Match Premium - Uniquement pour les utilisateurs non connectés */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-50 via-purple-50 to-violet-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-violet-950/40 border-2 border-violet-300 dark:border-violet-700 rounded-2xl p-6 md:p-8 mb-6 text-center relative overflow-hidden"
        >
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Arretez de chercher.
              <br />
              <span className="text-violet-600">Laissez les proprietaires vous trouver.</span>
            </h3>

            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Creez votre profil locataire en 2 minutes. Recevez des offres
              correspondant a vos criteres. Sans effort.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-6 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs font-medium">Alertes intelligentes</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs font-medium">Messages directs</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs font-medium">Favoris sauvegardes</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 px-8"
                onClick={handleCreateDemande}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Creer mon profil gratuit
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-xl h-12"
                onClick={() => setShowAuthModal(true)}
              >
                J ai deja un compte
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Gratuit - Sans engagement - 2 minutes
            </p>
          </div>
        </motion.div>
      )}

      {/* Card de conversion - design compact */}
      <div className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-2xl p-5 border border-border">
        {/* CTA Principal compact */}
        <button
          onClick={handleCreateAlert}
          className="w-full group p-4 rounded-xl border-2 border-search hover:border-search bg-gradient-to-r from-search/10 to-search/5 hover:from-search/15 hover:to-search/10 transition-all text-left mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-search/20 flex items-center justify-center shrink-0 group-hover:bg-search/30 transition-colors">
              <Bell className="w-5 h-5 text-search" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm mb-0.5">
                Rien de parfait ? Créez une alerte
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  30 sec
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  1 email/jour max
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-search group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </button>

        {/* CTA Secondaire en lien */}
        <div className="text-center mb-4">
          <button
            onClick={handleCreateDemande}
            className="text-match hover:text-match/80 font-medium text-xs inline-flex items-center gap-1 hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            Ou publiez votre recherche pour que les proprios vous contactent
          </button>
        </div>

        {/* Suggestions actionnables */}
        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/50">
          <p className="text-xs font-medium text-amber-900 mb-2">
            Voir plus de résultats :
          </p>
          <div className="flex flex-wrap gap-2">
            {currentBudget > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpandBudget(50)}
                  className="h-7 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  50$
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpandBudget(100)}
                  className="h-7 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  100$
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandArea}
              className="h-7 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Quartiers voisins
            </Button>
          </div>
        </div>

        {/* Lien aide */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <Link
              to="/help"
              className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
            >
              Besoin d'aide ? Consultez notre centre d'aide →
            </Link>
          </div>
        </div>

        {/* Retour en haut */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-muted-foreground hover:text-foreground h-8 text-xs"
          >
            <ArrowUp className="w-3.5 h-3.5 mr-1.5" />
            Retour en haut
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        trigger={authAction === 'alert' ? 'alert' : 'login'}
        redirectTo={(() => {
          // Construire l'URL de redirection pour après OAuth
          const params = new URLSearchParams();
          if (query) params.set('q', query);
          const ville = filters?.ville || query;
          if (ville) params.set('ville', ville);
          if (filters?.budget_max) params.set('budget_max', filters.budget_max.toString());
          const queryStr = params.toString();
          if (authAction === 'alert') {
            return `/search${queryStr ? `?${queryStr}` : ''}`;
          } else {
            return `/dashboard/demande/new${queryStr ? `?${queryStr}` : ''}`;
          }
        })()}
      />
    </div>
  );
}

export default SearchEndOfResults;
