/**
 * Page Demandes - Grid compact des locataires qui cherchent
 * Style similaire à SearchResults avec PropertyGrid
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemandCardCompact } from "@/components/ui/DemandCardCompact";
import { DemandesHeader } from "@/components/search/DemandesHeader";
import {
  Search,
  MapPin,
  DollarSign,
  Users,
  Filter,
  X,
  Sofa,
  Home
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getDemandesPubliques, DemandePublique } from "@/lib/matchApi";
import AuthModal from "@/components/auth/AuthModal";
import { PublicProfileModal } from "@/components/profile/PublicProfileModal";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const TYPE_PIECES_OPTIONS = [
  { value: "", label: "Tous types" },
  { value: "1.5", label: "Studio / 1½" },
  { value: "2.5", label: "2½" },
  { value: "3.5", label: "3½" },
  { value: "4.5", label: "4½" },
  { value: "5", label: "5½+" },
];

export default function Demandes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthContext();
  const isMobile = useIsMobile();
  const [demandes, setDemandes] = useState<DemandePublique[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingContact, setPendingContact] = useState<number | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  // Filters state - initialize from URL params
  const [filters, setFilters] = useState(() => ({
    ville: searchParams.get('ville') || "",
    budgetMin: searchParams.get('budgetMin') || "",
    meuble: null as boolean | null,
    typePieces: searchParams.get('type') || "",
  }));

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const response = await getDemandesPubliques();

      if (response.success) {
        setDemandes(response.demandes);
      } else {
        toast.error("Erreur lors du chargement des demandes");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (demande: DemandePublique) => {
    if (!isAuthenticated) {
      setPendingContact(demande.id);
      setShowAuthModal(true);
      return;
    }

    toast.success(`Ouverture de la conversation avec ${demande.locataire?.name || 'le locataire'}...`);
    navigate(`/messages?demande=${demande.id}`);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingContact) {
      navigate(`/messages?demande=${pendingContact}`);
      setPendingContact(null);
    }
  };

  const handleProfileClick = (userId: number) => {
    setSelectedProfileId(userId);
    setProfileModalOpen(true);
  };

  // Filter logic
  const filteredDemandes = demandes.filter(demande => {
    // Ville filter
    if (filters.ville) {
      const villeMatch = demande.villes?.some(v =>
        v.toLowerCase().includes(filters.ville.toLowerCase())
      );
      if (!villeMatch) return false;
    }

    // Budget min filter - show tenants with at least this budget
    if (filters.budgetMin) {
      const budgetMin = parseInt(filters.budgetMin);
      if (!demande.budget_max || demande.budget_max < budgetMin) return false;
    }

    // Meublé filter
    if (filters.meuble !== null) {
      // Check if demande has meuble preference matching filter
      const demandeWantsMeuble = demande.profil?.meuble || demande.criteres?.meuble;
      if (filters.meuble && !demandeWantsMeuble) return false;
      if (filters.meuble === false && demandeWantsMeuble) return false;
    }

    // Type pieces filter
    if (filters.typePieces) {
      const filterPieces = parseFloat(filters.typePieces);
      const demandePieces = demande.nb_pieces_min;

      if (demandePieces) {
        // For 5½+, check >= 5
        if (filterPieces >= 5) {
          if (demandePieces < 5) return false;
        } else {
          // Check if demand pieces match (with some tolerance)
          if (Math.abs(demandePieces - filterPieces) > 0.5) return false;
        }
      }
    }

    return true;
  });

  const activeFiltersCount = [
    filters.budgetMin,
    filters.meuble !== null,
    filters.typePieces,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      ville: "",
      budgetMin: "",
      meuble: null,
      typePieces: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navbar only - Mobile has header integrated in DemandesHeader */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header - DemandesHeader component */}
      <DemandesHeader
        filters={filters}
        onFiltersChange={setFilters}
        resultsCount={filteredDemandes.length}
        isLoading={loading}
      />

      {/* Spacer - Different for mobile (new header) vs desktop */}
      <div className={cn("h-20", isMobile && "h-40")} />

      {/* Desktop Content */}
      <div>
        {/* Desktop Header & Filters */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Locataires qui cherchent</h1>
                <p className="text-muted-foreground">Trouvez des locataires potentiels pour vos logements</p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-match" />
                <span className="font-bold">{filteredDemandes.length}</span>
                <span className="text-muted-foreground">locataires actifs</span>
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-2xl border border-border">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              {/* Ville */}
              <div className="relative flex-1 max-w-xs">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ville..."
                  value={filters.ville}
                  onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                  className="pl-9 rounded-xl"
                />
              </div>

              {/* Budget min */}
              <div className="relative w-44">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Budget min"
                  type="number"
                  value={filters.budgetMin}
                  onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                  className="pl-9 pr-16 rounded-xl"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  $/mois
                </span>
              </div>

              {/* Meublé */}
              <div className="flex items-center gap-2">
                <Sofa className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilters({ ...filters, meuble: filters.meuble === true ? null : true })}
                    className={cn(
                      "py-1.5 px-3 rounded-lg text-xs font-medium transition-all border",
                      filters.meuble === true
                        ? "bg-match text-white border-match"
                        : "bg-background border-border text-muted-foreground hover:border-match/50"
                    )}
                  >
                    Meublé
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, meuble: filters.meuble === false ? null : false })}
                    className={cn(
                      "py-1.5 px-3 rounded-lg text-xs font-medium transition-all border",
                      filters.meuble === false
                        ? "bg-match text-white border-match"
                        : "bg-background border-border text-muted-foreground hover:border-match/50"
                    )}
                  >
                    Non meublé
                  </button>
                </div>
              </div>

              {/* Type pieces */}
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-1 flex-wrap">
                  {TYPE_PIECES_OPTIONS.slice(1).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({
                        ...filters,
                        typePieces: filters.typePieces === option.value ? "" : option.value
                      })}
                      className={cn(
                        "py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all border",
                        filters.typePieces === option.value
                          ? "bg-match text-white border-match"
                          : "bg-background border-border text-muted-foreground hover:border-match/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground ml-auto">
                  <X className="w-4 h-4 mr-2" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="px-4 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
              {loading ? (
                // Loading skeleton grid
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                      <div className="aspect-[4/3] bg-muted animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-5 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredDemandes.length === 0 ? (
                // Empty state
                <div className="bg-card rounded-2xl p-8 md:p-12 text-center border border-border">
                  <Search className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">Aucune demande trouvée</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {activeFiltersCount > 0
                      ? "Essayez de modifier vos filtres"
                      : "Aucun locataire ne cherche actuellement"
                    }
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      Effacer les filtres
                    </Button>
                  )}
                </div>
              ) : (
                // Grid of demand cards
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {filteredDemandes.map((demande) => (
                    <DemandCardCompact
                      key={demande.id}
                      demande={demande}
                      onContact={handleContact}
                      onProfileClick={handleProfileClick}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      <MobileNav />

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingContact(null);
        }}
        onSuccess={handleAuthSuccess}
        trigger="contact"
        redirectTo={pendingContact ? `/messages?demande=${pendingContact}` : undefined}
      />

      {/* Profile Modal */}
      <PublicProfileModal
        userId={selectedProfileId}
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
}
