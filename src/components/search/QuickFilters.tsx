/**
 * QuickFilters - Refonte UX v2.0
 *
 * Utilise QuickFiltersSimple par défaut.
 * L'ancienne version est conservée ci-dessous.
 */

// Re-export simplified version as default
export { QuickFiltersSimple as QuickFilters } from "./QuickFiltersSimple";

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Sparkles, DollarSign, Home, Bed, PawPrint, Car, Sofa,
  SlidersHorizontal, X, ChevronDown, RotateCcw, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickFiltersLegacyProps {
  nouveautesFilter: '' | 'today' | '3days' | 'week';
  setNouveautesFilter: (value: '' | 'today' | '3days' | 'week') => void;
  prixMin: string;
  setPrixMin: (value: string) => void;
  prixMax: string;
  setPrixMax: (value: string) => void;
  piecesFilter: string;
  setPiecesFilter: (value: string) => void;
  chambresFilter: string;
  setChambresFilter: (value: string) => void;
  animauxFilter: boolean | null;
  setAnimauxFilter: (value: boolean | null) => void;
  meubleFilter: boolean | null;
  setMeubleFilter: (value: boolean | null) => void;
  stationnementFilter: boolean | null;
  setStationnementFilter: (value: boolean | null) => void;
}

export function QuickFiltersLegacy({
  nouveautesFilter,
  setNouveautesFilter,
  prixMin,
  setPrixMin,
  prixMax,
  setPrixMax,
  piecesFilter,
  setPiecesFilter,
  chambresFilter,
  setChambresFilter,
  animauxFilter,
  setAnimauxFilter,
  meubleFilter,
  setMeubleFilter,
  stationnementFilter,
  setStationnementFilter,
}: QuickFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isMobile = useIsMobile();

  const activeFiltersCount = [
    prixMin, prixMax, piecesFilter, chambresFilter,
    animauxFilter, meubleFilter, stationnementFilter
  ].filter(Boolean).length;

  const resetFilters = () => {
    setPrixMin('');
    setPrixMax('');
    setPiecesFilter('');
    setChambresFilter('');
    setAnimauxFilter(null);
    setMeubleFilter(null);
    setStationnementFilter(null);
  };

  // Disable body scroll when modal is open on mobile
  useEffect(() => {
    if (showAdvanced && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAdvanced, isMobile]);

  const timeFilters: Array<{
    value: '' | 'today' | '3days' | 'week';
    label: string;
    shortLabel?: string;
    icon?: React.ElementType;
  }> = [
    { value: '', label: 'Toutes' },
    { value: 'today', label: "Aujourd'hui", shortLabel: 'Auj.', icon: Sparkles },
    { value: '3days', label: '3 jours', shortLabel: '3j' },
    { value: 'week', label: '7 jours', shortLabel: '7j' },
  ];

  return (
    <>
      <div className="bg-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
          {/* Horizontal scrollable filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1">
            {/* Time Filters */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {timeFilters.map((filter) => (
                <motion.button
                  key={filter.value}
                  onClick={() => setNouveautesFilter(filter.value)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    "min-h-[32px] min-w-[44px] flex items-center justify-center gap-1",
                    nouveautesFilter === filter.value
                      ? "bg-search text-search-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground active:bg-muted"
                  )}
                >
                  {filter.icon && <filter.icon className="w-3 h-3" />}
                  {filter.shortLabel || filter.label}
                </motion.button>
              ))}
            </div>

            {/* Separator */}
            <div className="h-5 w-px bg-border mx-1 flex-shrink-0" />

            {/* Filter Button - Opens bottom sheet on mobile */}
            <motion.button
              onClick={() => setShowAdvanced(true)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[32px] flex-shrink-0",
                activeFiltersCount > 0
                  ? "bg-search text-search-foreground"
                  : "bg-muted/60 text-muted-foreground active:bg-muted"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-search-foreground text-search text-[10px] font-bold min-w-[16px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </motion.button>

            {/* Quick filter chips when active */}
            {prixMax && (
              <QuickChip 
                label={`Max ${prixMax}$`} 
                onRemove={() => setPrixMax('')} 
              />
            )}
            {piecesFilter && (
              <QuickChip 
                label={`${piecesFilter}½`} 
                onRemove={() => setPiecesFilter('')} 
              />
            )}
            {animauxFilter && (
              <QuickChip 
                label="🐾" 
                onRemove={() => setAnimauxFilter(null)} 
              />
            )}

            {/* Reset */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs text-muted-foreground active:bg-muted min-h-[32px] flex-shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet / Desktop Dropdown */}
      <AnimatePresence>
        {showAdvanced && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdvanced(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />

            {/* Bottom Sheet (mobile) / Panel (desktop) */}
            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: -10 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "fixed z-50 bg-background",
                isMobile 
                  ? "inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh] overflow-hidden"
                  : "top-32 left-1/2 -translate-x-1/2 w-full max-w-lg rounded-2xl shadow-2xl"
              )}
            >
              {/* Handle bar (mobile only) */}
              {isMobile && (
                <div className="flex justify-center py-3">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-search" />
                  <h2 className="text-lg font-semibold">Filtres</h2>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-search text-search-foreground text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-5">
                {/* Prix */}
                <FilterSection
                  icon={DollarSign}
                  title="Budget mensuel"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Minimum"
                        value={prixMin}
                        onChange={(e) => setPrixMin(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-base placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-search/30 focus:border-search"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    </div>
                    <span className="text-muted-foreground font-medium">—</span>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Maximum"
                        value={prixMax}
                        onChange={(e) => setPrixMax(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-base placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-search/30 focus:border-search"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    </div>
                  </div>
                  {/* Quick price buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['500', '750', '1000', '1500', '2000'].map((price) => (
                      <button
                        key={price}
                        onClick={() => setPrixMax(price)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium border transition-all min-h-[40px]",
                          prixMax === price
                            ? "bg-search text-search-foreground border-search"
                            : "bg-muted/50 border-transparent active:bg-muted"
                        )}
                      >
                        ≤ {price}$
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Type de logement */}
                <FilterSection
                  icon={Home}
                  title="Type de logement"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '', label: 'Tous' },
                      { value: '1.5', label: '1½' },
                      { value: '2.5', label: '2½' },
                      { value: '3.5', label: '3½' },
                      { value: '4.5', label: '4½' },
                      { value: '5.5', label: '5½+' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setPiecesFilter(item.value)}
                        className={cn(
                          "h-12 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-1",
                          piecesFilter === item.value
                            ? "bg-search text-search-foreground border-search shadow-sm"
                            : "bg-background border-border active:border-search/50"
                        )}
                      >
                        {piecesFilter === item.value && <Check className="w-4 h-4" />}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Chambres */}
                <FilterSection
                  icon={Bed}
                  title="Nombre de chambres"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '', label: 'Toutes' },
                      { value: '0', label: 'Studio' },
                      { value: '1', label: '1 ch.' },
                      { value: '2', label: '2 ch.' },
                      { value: '3', label: '3 ch.' },
                      { value: '4', label: '4+' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setChambresFilter(item.value)}
                        className={cn(
                          "h-12 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-1",
                          chambresFilter === item.value
                            ? "bg-search text-search-foreground border-search shadow-sm"
                            : "bg-background border-border active:border-search/50"
                        )}
                      >
                        {chambresFilter === item.value && <Check className="w-4 h-4" />}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Caractéristiques */}
                <FilterSection title="Caractéristiques">
                  <div className="space-y-2">
                    <ToggleRow
                      icon={PawPrint}
                      label="Animaux acceptés"
                      active={animauxFilter === true}
                      onClick={() => setAnimauxFilter(animauxFilter ? null : true)}
                    />
                    <ToggleRow
                      icon={Sofa}
                      label="Logement meublé"
                      active={meubleFilter === true}
                      onClick={() => setMeubleFilter(meubleFilter ? null : true)}
                    />
                    <ToggleRow
                      icon={Car}
                      label="Stationnement inclus"
                      active={stationnementFilter === true}
                      onClick={() => setStationnementFilter(stationnementFilter ? null : true)}
                    />
                  </div>
                </FilterSection>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 p-4 border-t border-border bg-background safe-area-bottom">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="flex-1 h-12 rounded-xl bg-search text-search-foreground text-base font-semibold shadow-sm active:opacity-90 transition-all"
                >
                  Voir les résultats
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onRemove}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-search/10 text-search text-xs font-medium flex-shrink-0 min-h-[32px]"
    >
      {label}
      <X className="w-3 h-3 opacity-70" />
    </motion.button>
  );
}

function FilterSection({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon?: React.ElementType; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {Icon && <Icon className="w-4 h-4 text-search" />}
        {title}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-all",
        active
          ? "bg-search/10 border-search"
          : "bg-background border-border active:border-search/50"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", active ? "text-search" : "text-muted-foreground")} />
        <span className={cn("text-sm font-medium", active ? "text-search" : "text-foreground")}>
          {label}
        </span>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
        active 
          ? "bg-search border-search" 
          : "border-border"
      )}>
        {active && <Check className="w-4 h-4 text-search-foreground" />}
      </div>
    </button>
  );
}
