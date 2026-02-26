import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { toast } from "sonner";
import type { Listing } from "@/lib/searchApi";
import { SearchHeader, QuickFilters, SearchResultsGrid } from "@/components/search";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Clé localStorage pour persister la dernière recherche
const LAST_SEARCH_KEY = 'housing_last_search';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const isMobile = useIsMobile();
  const query = searchParams.get("q") || "";

  // Lire les paramètres individuels de l'URL (envoyés par le chatbot ou les filtres)
  const villeParam = searchParams.get("ville") || "";
  const prixMaxParam = searchParams.get("prix_max") || "";
  const prixMinParam = searchParams.get("prix_min") || "";
  const typeUniteParam = searchParams.get("type_unite") || "";
  const chambresParam = searchParams.get("chambres") || "";
  const piecesParam = searchParams.get("pieces") || "";
  const animauxParam = searchParams.get("animaux") || "";
  const stationnementParam = searchParams.get("stationnement") || "";
  const meubleParam = searchParams.get("meuble") || "";
  const nouveautesParam = searchParams.get("nouveautes") || "";
  const sourcesParam = searchParams.get("sources") || "";

  // Construire la query d'affichage à partir des params individuels si pas de q
  const displayQuery = query || [
    typeUniteParam,
    villeParam,
    prixMaxParam ? `max ${prixMaxParam}$` : "",
    prixMinParam ? `min ${prixMinParam}$` : ""
  ].filter(Boolean).join(" ");

  const [searchQuery, setSearchQuery] = useState(displayQuery);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState<number | null>(null);
  const [favoriteAnimating, setFavoriteAnimating] = useState<number | null>(null);

  // Filtres de recherche - initialisés depuis l'URL
  const [nouveautesFilter, setNouveautesFilter] = useState<'today' | '3days' | 'week' | ''>(
    (nouveautesParam as 'today' | '3days' | 'week' | '') || ''
  );
  const [prixMin, setPrixMin] = useState<string>(prixMinParam);
  const [prixMax, setPrixMax] = useState<string>(prixMaxParam);
  const [piecesFilter, setPiecesFilter] = useState<string>(piecesParam);
  const [chambresFilter, setChambresFilter] = useState<string>(chambresParam);
  const [animauxFilter, setAnimauxFilter] = useState<boolean | null>(animauxParam === 'true' ? true : null);
  const [meubleFilter, setMeubleFilter] = useState<boolean | null>(meubleParam === 'true' ? true : null);
  const [stationnementFilter, setStationnementFilter] = useState<boolean | null>(stationnementParam === 'true' ? true : null);
  const [sourcesFilter, setSourcesFilter] = useState<string[]>(sourcesParam ? sourcesParam.split(',') : []);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Synchroniser les filtres avec l'URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    // Mise à jour des paramètres de filtres
    if (prixMin) newParams.set('prix_min', prixMin); else newParams.delete('prix_min');
    if (prixMax) newParams.set('prix_max', prixMax); else newParams.delete('prix_max');
    if (piecesFilter) newParams.set('pieces', piecesFilter); else newParams.delete('pieces');
    if (chambresFilter) newParams.set('chambres', chambresFilter); else newParams.delete('chambres');
    if (animauxFilter === true) newParams.set('animaux', 'true'); else newParams.delete('animaux');
    if (meubleFilter === true) newParams.set('meuble', 'true'); else newParams.delete('meuble');
    if (stationnementFilter === true) newParams.set('stationnement', 'true'); else newParams.delete('stationnement');
    if (nouveautesFilter) newParams.set('nouveautes', nouveautesFilter); else newParams.delete('nouveautes');
    if (sourcesFilter.length > 0) newParams.set('sources', sourcesFilter.join(',')); else newParams.delete('sources');

    // Mettre à jour l'URL sans recharger la page
    setSearchParams(newParams, { replace: true });
  }, [prixMin, prixMax, piecesFilter, chambresFilter, animauxFilter, meubleFilter, stationnementFilter, nouveautesFilter, sourcesFilter]);

  // Count active filters for badge
  const hasSourceFilter = sourcesFilter.length > 0 && sourcesFilter.length < 4;
  const activeFiltersCount = [prixMin, prixMax, piecesFilter, chambresFilter, animauxFilter, meubleFilter, stationnementFilter, hasSourceFilter].filter(Boolean).length;

  // WebSocket pour notifications temps réel
  const wsRef = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Restaurer la dernière recherche si pas de query dans l'URL
  useEffect(() => {
    if (!query) {
      const lastSearch = localStorage.getItem(LAST_SEARCH_KEY);
      if (lastSearch) {
        try {
          const { q } = JSON.parse(lastSearch);
          if (q) {
            setSearchQuery(q);
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }
  }, []);

  // Sauvegarder la recherche dans localStorage
  useEffect(() => {
    if (query) {
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify({
        q: query,
        timestamp: Date.now()
      }));
    }
  }, [query]);

  // Vérifier si on a des paramètres individuels (du chatbot ou filtres URL)
  const hasIndividualParams = villeParam || prixMaxParam || prixMinParam || typeUniteParam || chambresParam || piecesParam || sourcesParam;

  // Charger les résultats de recherche
  useEffect(() => {
    fetchSearchResults();
  }, [query, villeParam, prixMaxParam, prixMinParam, typeUniteParam, chambresParam, piecesParam, animauxParam, stationnementParam, nouveautesFilter, prixMin, prixMax, piecesFilter, chambresFilter, animauxFilter, meubleFilter, stationnementFilter, sourcesFilter]);

  // Charger les favoris si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);


  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const { searchListings } = await import('@/lib/searchApi');

      const filterParams: Record<string, any> = {};
      if (prixMin) filterParams.prix_min = prixMin;
      if (prixMax) filterParams.prix_max = prixMax;
      if (piecesFilter) filterParams.pieces = piecesFilter;
      if (chambresFilter) filterParams.chambres = chambresFilter;
      if (animauxFilter === true) filterParams.animaux = 'true';
      if (meubleFilter === true) filterParams.meuble = 'true';
      if (stationnementFilter === true) filterParams.stationnement = 'true';
      if (nouveautesFilter) filterParams.nouveautes = nouveautesFilter;
      if (sourcesFilter.length > 0) filterParams.sources = sourcesFilter.join(',');

      // Debug: log sources filter
      console.log('[SearchResults] sourcesFilter:', sourcesFilter, '-> filterParams.sources:', filterParams.sources);

      if (hasIndividualParams) {
        const queryParts: string[] = [];
        if (piecesParam) queryParts.push(`${piecesParam} pièces`);
        if (typeUniteParam) queryParts.push(typeUniteParam);
        if (villeParam) queryParts.push(villeParam);
        if (prixMaxParam) queryParts.push(`moins de ${prixMaxParam}$`);
        if (prixMinParam) queryParts.push(`plus de ${prixMinParam}$`);
        if (chambresParam) queryParts.push(`${chambresParam} chambres`);
        if (animauxParam === 'true') queryParts.push('animaux acceptés');
        if (stationnementParam === 'true') queryParts.push('avec stationnement');

        const constructedQuery = queryParts.join(' ');
        const response = await searchListings({ query: constructedQuery, limit: 50, ...filterParams });
        if (response.success) {
          setListings(response.results);
        }
        return;
      }

      if (!query.trim()) {
        if ('geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000
              });
            });

            const { latitude, longitude } = position.coords;
            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                { headers: { 'User-Agent': 'HousingAI/1.0' } }
              );
              const geoData = await geoResponse.json();
              const city = geoData.address?.city || geoData.address?.town || geoData.address?.municipality;

              if (city) {
                const response = await searchListings({ query: city, limit: 50, ...filterParams });
                if (response.success && response.results.length > 0) {
                  setListings(response.results);
                  return;
                }
              }
            } catch {
              // Fallback
            }
          } catch {
            // Geo unavailable
          }
        }

        const response = await searchListings({ query: 'Saguenay', limit: 50, ...filterParams });
        if (response.success) {
          setListings(response.results);
        }
        return;
      }

      const response = await searchListings({ query, ...filterParams });
      if (response.success) {
        setListings(response.results);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { getFavorites } = await import('@/lib/searchApi');
      const response = await getFavorites();
      if (response.success) {
        const favoris = response.favoris || [];
        const favIds = new Set(favoris.map(f => f.annonce.id));
        setFavorites(favIds);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleSearch = (newQuery?: string) => {
    const q = newQuery || searchQuery;
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const toggleFavorite = async (id: number) => {
    if (!isAuthenticated) {
      setPendingFavorite(id);
      setShowAuthModal(true);
      return;
    }

    try {
      const { toggleFavorite: apiToggleFavorite } = await import('@/lib/searchApi');
      const response = await apiToggleFavorite(id);

      if (response.success) {
        const wasAdded = response.favorited;

        if (wasAdded) {
          setFavoriteAnimating(id);
          setTimeout(() => setFavoriteAnimating(null), 800);
        }

        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          if (wasAdded) {
            newFavorites.add(id);
            toast.success("Ajouté aux favoris");
          } else {
            newFavorites.delete(id);
            toast.success("Retiré des favoris");
          }
          return newFavorites;
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la modification du favori");
    }
  };

  const handleAuthSuccess = () => {
    if (pendingFavorite) {
      toggleFavorite(pendingFavorite);
      setPendingFavorite(null);
    }
  };

  // SEO
  const getMetaTitle = () => {
    if (!displayQuery) return "Recherche logement | LocaSur";
    const formattedQuery = displayQuery.charAt(0).toUpperCase() + displayQuery.slice(1).toLowerCase();
    return `${formattedQuery} - ${listings.length} logement${listings.length > 1 ? 's' : ''} | LocaSur`;
  };

  const getMetaDescription = () => {
    if (!displayQuery) {
      return "Trouvez votre logement ideal au Quebec. Chambres, appartements, maisons a louer sur LocaSur.";
    }
    const count = listings.length;
    return `${count} logement${count > 1 ? 's' : ''} ${displayQuery} disponible${count > 1 ? 's' : ''}. Comparez les prix et trouvez votre chambre ou appartement sur LocaSur.`;
  };

  const canonicalUrl = displayQuery
    ? `https://locasur.ca/search?q=${encodeURIComponent(displayQuery)}`
    : "https://locasur.ca/search";

  return (
    <>
      <Helmet>
        <title>{getMetaTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={getMetaTitle()} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={getMetaTitle()} />
        <meta name="twitter:description" content={getMetaDescription()} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Desktop Navbar only - Mobile has header integrated in SearchHeader */}
        <div className="hidden md:block">
          <Navbar
            onOpenFilters={() => setFiltersOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Spacer - Different for mobile (new header) vs desktop */}
        <div className={cn("h-20", isMobile && "h-40")} />

        {/* Search Header */}
        <SearchHeader
          query={displayQuery}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={() => handleSearch()}
          onMapView={() => {
            const currentParams = new URLSearchParams(window.location.search);
            navigate(`/search/map?${currentParams.toString()}`);
          }}
          resultsCount={listings.length}
          isLoading={loading}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Quick Filters - Hidden bar on mobile, visible on desktop */}
        <div className={cn(isMobile && "hidden")}>
          <QuickFilters
            nouveautesFilter={nouveautesFilter}
            setNouveautesFilter={setNouveautesFilter}
            prixMin={prixMin}
            setPrixMin={setPrixMin}
            prixMax={prixMax}
            setPrixMax={setPrixMax}
            piecesFilter={piecesFilter}
            setPiecesFilter={setPiecesFilter}
            chambresFilter={chambresFilter}
            setChambresFilter={setChambresFilter}
            animauxFilter={animauxFilter}
            setAnimauxFilter={setAnimauxFilter}
            meubleFilter={meubleFilter}
            setMeubleFilter={setMeubleFilter}
            stationnementFilter={stationnementFilter}
            setStationnementFilter={setStationnementFilter}
            sourcesFilter={sourcesFilter}
            setSourcesFilter={setSourcesFilter}
          />
        </div>

        {/* Mobile Filter Modal - controlled from SearchHeader button */}
        {isMobile && (
          <QuickFilters
            nouveautesFilter={nouveautesFilter}
            setNouveautesFilter={setNouveautesFilter}
            prixMin={prixMin}
            setPrixMin={setPrixMin}
            prixMax={prixMax}
            setPrixMax={setPrixMax}
            piecesFilter={piecesFilter}
            setPiecesFilter={setPiecesFilter}
            chambresFilter={chambresFilter}
            setChambresFilter={setChambresFilter}
            animauxFilter={animauxFilter}
            setAnimauxFilter={setAnimauxFilter}
            meubleFilter={meubleFilter}
            setMeubleFilter={setMeubleFilter}
            stationnementFilter={stationnementFilter}
            setStationnementFilter={setStationnementFilter}
            sourcesFilter={sourcesFilter}
            setSourcesFilter={setSourcesFilter}
            isOpen={filtersOpen}
            onOpenChange={setFiltersOpen}
          />
        )}

        {/* Results Grid */}
        <SearchResultsGrid
          listings={listings}
          loading={loading}
          favorites={favorites}
          onFavoriteToggle={toggleFavorite}
          favoriteAnimating={favoriteAnimating}
          query={displayQuery}
          isMobile={isMobile}
        />

        {/* Auth Modal */}
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          trigger="favorite"
        />

        {/* Hide MobileNav when filter modal is open */}
        {!filtersOpen && (
          <>
            <MobileNav />
            {/* Spacer for mobile bottom navigation (h-20 = 80px to account for nav + safe area) */}
            <div className="h-20 md:hidden" />
          </>
        )}
      </div>
    </>
  );
}
