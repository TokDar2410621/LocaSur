/**
 * QuickFilters - Version Airbnb v3.0
 *
 * Principes:
 * - Modal bottom sheet style Airbnb
 * - Sections aérées avec animations fluides
 * - Boutons tactiles avec feedback visuel
 */

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles, DollarSign, Home, X, SlidersHorizontal, Check, RotateCcw, PawPrint, Sofa, Car, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PriceRangeSlider } from "@/components/ui/price-range-slider";

// Sources disponibles
const AVAILABLE_SOURCES = [
  { id: 'locasur', label: 'LocaSur', color: 'bg-violet-500' },
];

interface QuickFiltersSimpleProps {
  nouveautesFilter: '' | 'today' | '3days' | 'week';
  setNouveautesFilter: (value: '' | 'today' | '3days' | 'week') => void;
  prixMax: string;
  setPrixMax: (value: string) => void;
  piecesFilter: string;
  setPiecesFilter: (value: string) => void;
  // Props commodités
  animauxFilter?: boolean | null;
  setAnimauxFilter?: (value: boolean | null) => void;
  meubleFilter?: boolean | null;
  setMeubleFilter?: (value: boolean | null) => void;
  stationnementFilter?: boolean | null;
  setStationnementFilter?: (value: boolean | null) => void;
  // Props sources
  sourcesFilter?: string[];
  setSourcesFilter?: (value: string[]) => void;
  // Props legacy pour compatibilité
  prixMin?: string;
  setPrixMin?: (value: string) => void;
  chambresFilter?: string;
  setChambresFilter?: (value: string) => void;
  // Control modal from outside
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickFiltersSimple({
  nouveautesFilter,
  setNouveautesFilter,
  prixMax,
  setPrixMax,
  prixMin = '',
  setPrixMin,
  piecesFilter,
  setPiecesFilter,
  animauxFilter,
  setAnimauxFilter,
  meubleFilter,
  setMeubleFilter,
  stationnementFilter,
  setStationnementFilter,
  sourcesFilter = [],
  setSourcesFilter,
  isOpen: externalOpen,
  onOpenChange,
}: QuickFiltersSimpleProps) {
  const [internalShowPanel, setInternalShowPanel] = useState(false);
  const isMobile = useIsMobile();

  // Use external control if provided, otherwise internal state
  const isExternallyControlled = externalOpen !== undefined;
  const showPanel = isExternallyControlled ? externalOpen : internalShowPanel;
  const setShowPanel = onOpenChange || setInternalShowPanel;

  const hasAmenityFilters = animauxFilter || meubleFilter || stationnementFilter;
  const hasSourceFilters = sourcesFilter.length > 0 && sourcesFilter.length < AVAILABLE_SOURCES.length;
  const hasPriceFilter = prixMin || prixMax;
  const hasActiveFilters = hasPriceFilter || piecesFilter || nouveautesFilter || hasAmenityFilters || hasSourceFilters;

  // Toggle source filter
  const toggleSource = (sourceId: string) => {
    if (!setSourcesFilter) return;
    if (sourcesFilter.includes(sourceId)) {
      setSourcesFilter(sourcesFilter.filter(s => s !== sourceId));
    } else {
      setSourcesFilter([...sourcesFilter, sourceId]);
    }
  };

  // Toggle amenity filter (cycle: null -> true -> null)
  const toggleAmenity = (
    current: boolean | null | undefined,
    setter?: (value: boolean | null) => void
  ) => {
    if (!setter) return;
    setter(current ? null : true);
  };

  // Lock body scroll on mobile
  useEffect(() => {
    if (showPanel && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showPanel, isMobile]);

  const timeFilters = [
    { value: '' as const, label: 'Tout' },
    { value: 'today' as const, label: 'Nouveau', icon: Sparkles },
    { value: '3days' as const, label: '3 jours' },
  ];

  const sizeOptions = [
    { value: '', label: 'Tout' },
    { value: '2.5', label: '2½' },
    { value: '3.5', label: '3½' },
    { value: '4.5', label: '4½+' },
  ];

  return (
    <>
      {/* Barre horizontale - 3 éléments max (hidden when externally controlled, e.g. mobile) */}
      {!isExternallyControlled && (
      <div className="bg-background border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2">

            {/* Filtre temps */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {timeFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setNouveautesFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1",
                    nouveautesFilter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {f.icon && <f.icon className="w-3 h-3" />}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="h-5 w-px bg-border mx-1" />

            {/* Bouton Filtres - ouvre le panel */}
            <button
              onClick={() => setShowPanel(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                hasActiveFilters
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtres
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </button>

            {/* Chips actifs */}
            {prixMax && (
              <Chip label={`≤${prixMax}$`} onRemove={() => setPrixMax('')} />
            )}
            {piecesFilter && (
              <Chip label={piecesFilter} onRemove={() => setPiecesFilter('')} />
            )}
          </div>
        </div>
      </div>
      )}

      {/* Panel bottom sheet style Airbnb */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop avec blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className={cn(
                "fixed z-50 bg-background overflow-hidden flex flex-col",
                isMobile
                  ? "inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh]"
                  : "top-28 left-1/2 -translate-x-1/2 w-full max-w-lg rounded-3xl shadow-2xl max-h-[80vh]"
              )}
            >
              {/* Handle - style Airbnb */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-1">
                  <motion.div
                    className="w-12 h-1.5 rounded-full bg-muted-foreground/30"
                    whileHover={{ scaleX: 1.1 }}
                  />
                </div>
              )}

              {/* Header style Airbnb - Close left, Title center, Clear right */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <button
                  onClick={() => setShowPanel(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-base">Filtres</h2>
                {hasActiveFilters ? (
                  <button
                    onClick={() => {
                      setPrixMin?.('');
                      setPrixMax('');
                      setPiecesFilter('');
                      setNouveautesFilter('');
                      setAnimauxFilter?.(null);
                      setMeubleFilter?.(null);
                      setStationnementFilter?.(null);
                      setSourcesFilter?.([]);
                    }}
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Effacer
                  </button>
                ) : (
                  <div className="w-16" /> // Spacer pour centrer le titre
                )}
              </div>

              {/* Content avec scroll */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-5 pb-8 space-y-8">

                  {/* Section Nouveautés (dans le modal sur mobile) */}
                  {isMobile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        Quand ?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {timeFilters.map((f) => (
                          <motion.button
                            key={f.value}
                            onClick={() => setNouveautesFilter(f.value)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-sm font-medium transition-all",
                              "border-2 active:scale-95",
                              nouveautesFilter === f.value
                                ? "bg-foreground text-background border-foreground shadow-lg"
                                : "border-border bg-background hover:border-foreground/30"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              {f.icon && <f.icon className="w-4 h-4" />}
                              {f.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Section Budget - Slider style Airbnb */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      Fourchette de prix
                    </label>
                    <PriceRangeSlider
                      min={0}
                      max={3000}
                      step={50}
                      minValue={prixMin ? parseInt(prixMin) : 0}
                      maxValue={prixMax ? parseInt(prixMax) : 3000}
                      onMinChange={(value) => setPrixMin?.(value === 0 ? '' : String(value))}
                      onMaxChange={(value) => setPrixMax(value === 3000 ? '' : String(value))}
                    />
                  </motion.div>

                  {/* Section Taille */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Taille du logement
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {sizeOptions.map((opt) => (
                        <motion.button
                          key={opt.value}
                          onClick={() => setPiecesFilter(opt.value)}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "h-14 rounded-2xl text-sm font-medium transition-all",
                            "border-2 active:scale-95 flex items-center justify-center",
                            piecesFilter === opt.value
                              ? "bg-foreground text-background border-foreground shadow-lg"
                              : "border-border bg-background hover:border-foreground/30"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {piecesFilter === opt.value && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                <Check className="w-4 h-4" />
                              </motion.span>
                            )}
                            {opt.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Section Commodités */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Sofa className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Commodités
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {/* Animaux acceptés */}
                      <motion.button
                        onClick={() => toggleAmenity(animauxFilter, setAnimauxFilter)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                          "border-2 active:scale-95 flex items-center gap-2",
                          animauxFilter
                            ? "bg-foreground text-background border-foreground shadow-lg"
                            : "border-border bg-background hover:border-foreground/30"
                        )}
                      >
                        <PawPrint className="w-4 h-4" />
                        Animaux acceptés
                        {animauxFilter && <Check className="w-4 h-4" />}
                      </motion.button>

                      {/* Meublé */}
                      <motion.button
                        onClick={() => toggleAmenity(meubleFilter, setMeubleFilter)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                          "border-2 active:scale-95 flex items-center gap-2",
                          meubleFilter
                            ? "bg-foreground text-background border-foreground shadow-lg"
                            : "border-border bg-background hover:border-foreground/30"
                        )}
                      >
                        <Sofa className="w-4 h-4" />
                        Meublé
                        {meubleFilter && <Check className="w-4 h-4" />}
                      </motion.button>

                      {/* Stationnement */}
                      <motion.button
                        onClick={() => toggleAmenity(stationnementFilter, setStationnementFilter)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                          "border-2 active:scale-95 flex items-center gap-2",
                          stationnementFilter
                            ? "bg-foreground text-background border-foreground shadow-lg"
                            : "border-border bg-background hover:border-foreground/30"
                        )}
                      >
                        <Car className="w-4 h-4" />
                        Stationnement
                        {stationnementFilter && <Check className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Section Sources / Plateformes */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      Sources
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Par défaut, toutes les sources sont affichées
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SOURCES.map((source) => {
                        const isSelected = sourcesFilter.length === 0 || sourcesFilter.includes(source.id);
                        const isExplicitlySelected = sourcesFilter.includes(source.id);
                        return (
                          <motion.button
                            key={source.id}
                            onClick={() => toggleSource(source.id)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                              "border-2 active:scale-95 flex items-center gap-2",
                              isExplicitlySelected
                                ? "bg-foreground text-background border-foreground shadow-lg"
                                : sourcesFilter.length === 0
                                  ? "border-border bg-background hover:border-foreground/30 opacity-100"
                                  : isSelected
                                    ? "border-border bg-background"
                                    : "border-border bg-background opacity-40"
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", source.color)} />
                            {source.label}
                            {isExplicitlySelected && <Check className="w-4 h-4" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer sticky avec effet gradient */}
              <div className="relative flex-shrink-0">
                <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
                <div className="p-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border/50 bg-background relative z-20">
                  <motion.button
                    onClick={() => setShowPanel(false)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full h-14 rounded-2xl font-semibold text-base transition-all",
                      "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
                      "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                    )}
                  >
                    Voir les résultats
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
    >
      {label}
      <X className="w-3 h-3" />
    </button>
  );
}

export default QuickFiltersSimple;
