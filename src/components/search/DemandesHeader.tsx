/**
 * DemandesHeader - Header mobile pour la page /demandes
 * Style identique à SearchHeader:
 * - Grosse barre recherche + bouton filtre
 * - Tabs: Logements | Demandes
 * - Results count
 */

import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Users, X, DollarSign, Sofa, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SearchInput } from "@/components/ui/search-input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DemandesFilters {
  ville: string;
  budgetMin: string;
  meuble: boolean | null;
  typePieces: string;
}

interface DemandesHeaderProps {
  filters: DemandesFilters;
  onFiltersChange: (filters: DemandesFilters) => void;
  resultsCount: number;
  isLoading: boolean;
}

const TYPE_PIECES_OPTIONS = [
  { value: "", label: "Tous types" },
  { value: "1.5", label: "Studio / 1½" },
  { value: "2.5", label: "2½" },
  { value: "3.5", label: "3½" },
  { value: "4.5", label: "4½" },
  { value: "5", label: "5½+" },
];

export function DemandesHeader({
  filters,
  onFiltersChange,
  resultsCount,
  isLoading,
}: DemandesHeaderProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Detect scroll for tab animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Count active filters
  const activeFiltersCount = [
    filters.budgetMin,
    filters.meuble !== null,
    filters.typePieces,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      budgetMin: "",
      meuble: null,
      typePieces: "",
    });
  };

  // Desktop: Return null (navbar handles everything)
  if (!isMobile) {
    return null;
  }

  // Current tab
  const mobileTab = location.pathname.startsWith('/demandes') ? 'demandes' : 'logements';

  // ========== MOBILE LAYOUT - Style SearchHeader ==========
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      {/* Row 1: Search Bar + Filter Button */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        {/* Big Search Bar */}
        <div className="flex-1 relative">
          <SearchInput
            placeholder="Rechercher une ville..."
            value={filters.ville}
            onChange={(e) => onFiltersChange({ ...filters, ville: e.target.value })}
            onSearch={() => {}}
            className="h-12 rounded-xl border-border bg-muted/50 shadow-sm focus-within:border-match focus-within:bg-background focus-within:shadow-md transition-all text-base"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all flex-shrink-0",
            activeFiltersCount > 0
              ? "border-match bg-match/10"
              : "border-border bg-background hover:border-match/50"
          )}
        >
          <SlidersHorizontal className={cn(
            "w-5 h-5",
            activeFiltersCount > 0 ? "text-match" : "text-muted-foreground"
          )} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-match text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-3 bg-muted/30">
              {/* Budget Min */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Budget minimum
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Ex: 1000"
                    value={filters.budgetMin}
                    onChange={(e) => onFiltersChange({ ...filters, budgetMin: e.target.value })}
                    className="rounded-xl h-10 pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $/mois
                  </span>
                </div>
              </div>

              {/* Meublé Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sofa className="w-3.5 h-3.5" />
                  Cherche meublé
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onFiltersChange({ ...filters, meuble: filters.meuble === true ? null : true })}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all border",
                      filters.meuble === true
                        ? "bg-match text-white border-match"
                        : "bg-background border-border text-muted-foreground hover:border-match/50"
                    )}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => onFiltersChange({ ...filters, meuble: filters.meuble === false ? null : false })}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all border",
                      filters.meuble === false
                        ? "bg-match text-white border-match"
                        : "bg-background border-border text-muted-foreground hover:border-match/50"
                    )}
                  >
                    Non
                  </button>
                </div>
              </div>

              {/* Type de logement */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  Type recherché
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_PIECES_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFiltersChange({
                        ...filters,
                        typePieces: filters.typePieces === option.value ? "" : option.value
                      })}
                      className={cn(
                        "py-1.5 px-3 rounded-lg text-xs font-medium transition-all border",
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

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Effacer les filtres
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 2: Pills Toggle - Logements | Demandes */}
      <div className={cn(
        "flex justify-center pb-2 transition-all duration-300",
        isScrolled ? "pb-1.5" : "pb-2"
      )}>
        <div className="inline-flex bg-muted rounded-full p-1">
          {/* Logements Tab */}
          <Link
            to={filters.ville ? `/search?q=${encodeURIComponent(filters.ville)}` : "/search"}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              mobileTab === 'logements'
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

          {/* Demandes Tab */}
          <Link
            to="/demandes"
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              mobileTab === 'demandes'
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
        </div>
      </div>

      {/* Row 3: Results count */}
      <div className="flex items-center justify-between px-4 pb-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-match border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground">Recherche...</span>
            </div>
          ) : (
            <>
              <Users className="w-4 h-4 text-match" />
              <motion.span
                key={resultsCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold text-foreground"
              >
                {resultsCount}
              </motion.span>
              <span className="text-xs text-muted-foreground">
                locataire{resultsCount > 1 ? 's' : ''} actif{resultsCount > 1 ? 's' : ''}
              </span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
