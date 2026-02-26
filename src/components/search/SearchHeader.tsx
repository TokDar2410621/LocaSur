/**
 * SearchHeader - Refonte UX v2.0 (Style Airbnb)
 *
 * Mobile ONLY:
 *   Row 1: Grosse barre recherche | Bouton filtre
 *   Row 2: Tabs 🏠 Logements | 📝 Demandes
 *   Row 3: Résultats count | Bouton carte
 *
 * Desktop: Géré par NavbarSimple (search bar + filtres dans le navbar)
 */

import { motion } from "framer-motion";
import { SlidersHorizontal, Map } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SearchInput } from "@/components/ui/search-input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SearchHeaderProps {
  query: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onMapView: () => void;
  resultsCount: number;
  isLoading: boolean;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
}

export function SearchHeader({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onMapView,
  resultsCount,
  isLoading,
  onOpenFilters,
  activeFiltersCount = 0,
}: SearchHeaderProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for tab animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop: Return null (navbar handles everything)
  if (!isMobile) {
    return null;
  }

  // Current tab
  const mobileTab = location.pathname.startsWith('/demandes') ? 'demandes' : 'logements';

  // ========== MOBILE LAYOUT - Style Airbnb ==========
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      {/* Row 1: Search Bar + Filter Button */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        {/* Big Search Bar */}
        <div className="flex-1 relative">
          <SearchInput
            placeholder="Où cherchez-vous ?"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onSearch={onSearch}
            className="h-12 rounded-xl border-border bg-muted/50 shadow-sm focus-within:border-primary focus-within:bg-background focus-within:shadow-md transition-all text-base"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={onOpenFilters}
          className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all flex-shrink-0",
            activeFiltersCount > 0
              ? "border-primary bg-primary/10"
              : "border-border bg-background hover:border-primary/50"
          )}
        >
          <SlidersHorizontal className={cn(
            "w-5 h-5",
            activeFiltersCount > 0 ? "text-primary" : "text-muted-foreground"
          )} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Row 2: Pills Toggle - Logements | Demandes */}
      <div className={cn(
        "flex justify-center pb-2 transition-all duration-300",
        isScrolled ? "pb-1.5" : "pb-2"
      )}>
        <div className="inline-flex bg-muted rounded-full p-1">
          {/* Logements Tab */}
          <Link
            to="/search"
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
            to={searchQuery ? `/demandes?ville=${encodeURIComponent(searchQuery)}` : "/demandes"}
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

      {/* Row 3: Results count + Map button */}
      <div className="flex items-center justify-between px-4 pb-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground">Recherche...</span>
            </div>
          ) : (
            <>
              <motion.span
                key={resultsCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold text-foreground"
              >
                {resultsCount}
              </motion.span>
              <span className="text-xs text-muted-foreground">
                logement{resultsCount > 1 ? 's' : ''}
              </span>
            </>
          )}
        </motion.div>

        {/* Map button */}
        <button
          onClick={onMapView}
          className="flex items-center gap-1.5 text-xs text-primary font-medium px-2 py-1 rounded-md active:bg-primary/10"
        >
          <Map className="w-3.5 h-3.5" />
          Carte
        </button>
      </div>
    </div>
  );
}
