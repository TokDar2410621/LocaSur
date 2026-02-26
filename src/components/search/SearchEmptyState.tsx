/**
 * SearchEmptyState - Composant affiché quand aucun résultat n'est trouvé
 * Objectif: Convertir la frustration en inscription via alerte ou demande
 *
 * P0 UX Optimisations:
 * - 1 CTA primaire (alerte) + 1 secondaire (demande)
 * - Preview des attentes (temps, fréquence)
 * - Suggestions actionnables avec boutons
 * - Pas de statistiques inventées
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, FileText, Search, ChevronRight, MapPin, Clock, Plus } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface SearchEmptyStateProps {
  query?: string;
  filters?: {
    ville?: string;
    budget_min?: number;
    budget_max?: number;
    type?: string;
  };
}

export function SearchEmptyState({ query, filters }: SearchEmptyStateProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<'alert' | 'demande'>('alert');

  // Résumé des critères de recherche
  const searchSummary = [
    query,
    filters?.ville,
    filters?.budget_min && filters?.budget_max
      ? `${filters.budget_min}$ - ${filters.budget_max}$`
      : filters?.budget_max
      ? `Max ${filters.budget_max}$`
      : null,
    filters?.type,
  ].filter(Boolean).join(' • ');

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
    if (filters?.ville) params.set('ville', filters.ville);
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
    if (filters?.ville) params.set('ville', filters.ville);
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
    // Relancer la recherche sans filtre de quartier spécifique
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (filters?.budget_max) newParams.set('budget_max', filters.budget_max.toString());
    // On garde la ville mais pas le quartier
    if (filters?.ville) newParams.set('ville', filters.ville);
    newParams.set('rayon', '10'); // Rayon élargi
    navigate(`/search?${newParams.toString()}`);
  };

  return (
    <div className="py-12 px-4">
      {/* Illustration et message d'empathie */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-search/20 to-search/5 flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-search/60" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Aucun logement ne correspond
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Pas de panique ! De nouvelles annonces arrivent chaque jour. On peut vous prévenir.
        </p>

        {/* Résumé des critères */}
        {searchSummary && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <MapPin className="w-4 h-4 text-search" />
            {searchSummary}
          </div>
        )}
      </div>

      {/* CTA Principal: Publier une demande - Les propriétaires viennent à vous */}
      <div className="max-w-lg mx-auto space-y-4">
        <button
          onClick={handleCreateDemande}
          className="w-full group p-5 rounded-2xl border-2 border-violet-500 hover:border-violet-600 bg-gradient-to-r from-violet-500/15 to-violet-500/5 hover:from-violet-500/20 hover:to-violet-500/10 transition-all text-left relative overflow-hidden"
        >
          {/* Badge recommandé */}
          <div className="absolute -top-1 -right-1 px-3 py-1 bg-violet-500 text-white text-xs font-semibold rounded-bl-lg rounded-tr-xl">
            Recommandé
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0 group-hover:bg-violet-500/30 transition-colors">
              <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg mb-1">
                Publiez votre recherche
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Les propriétaires avec un logement correspondant vous contactent directement.
              </p>
              {/* Preview des attentes */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-violet-600 dark:text-violet-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  2 minutes
                </span>
                <span>•</span>
                <span>100% gratuit</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-violet-500 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
          </div>
        </button>

        {/* Séparateur */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* CTA Secondaire: Créer une alerte */}
        <button
          onClick={handleCreateAlert}
          className="w-full group p-4 rounded-xl border border-border hover:border-search/50 bg-muted/30 hover:bg-muted/50 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-search/10 flex items-center justify-center shrink-0 group-hover:bg-search/20 transition-colors">
              <Bell className="w-5 h-5 text-search" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm">
                Créer une alerte email
              </h3>
              <p className="text-xs text-muted-foreground">
                Recevez un email quand un logement correspond
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-search group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </button>

        {/* Suggestions actionnables */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/60">
          <p className="text-sm font-medium text-amber-900 mb-3">
            Élargissez votre recherche :
          </p>
          <div className="flex flex-wrap gap-2">
            {currentBudget > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpandBudget(50)}
                  className="bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  50$ de budget
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpandBudget(100)}
                  className="bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  100$ de budget
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandArea}
              className="bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Quartiers voisins
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        trigger={authAction === 'alert' ? 'favorite' : 'login'}
      />
    </div>
  );
}

export default SearchEmptyState;
