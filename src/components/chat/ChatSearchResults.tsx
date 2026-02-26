/**
 * ChatSearchResults - Affiche les résultats de recherche en mini-cartes dans le chat
 */

import { MapPin, Home, DollarSign, Maximize2, ExternalLink } from 'lucide-react';
import { cn, getListingUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { ChatSearchResult } from '@/lib/chatApi';

interface ChatSearchResultsProps {
  results: ChatSearchResult[];
  count?: number;
  onViewAll?: () => void;
  maxDisplay?: number;
}

export function ChatSearchResults({
  results,
  count = 0,
  onViewAll,
  maxDisplay = 3
}: ChatSearchResultsProps) {
  const navigate = useNavigate();
  const displayResults = results.slice(0, maxDisplay);
  const hasMore = results.length > maxDisplay || count > maxDisplay;

  const handleCardClick = (result: ChatSearchResult) => {
    if (result.id) {
      navigate(getListingUrl({ id: result.id, seo_url: result.seo_url }));
    } else if (result.url) {
      window.open(result.url, '_blank');
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {/* Mini-cartes des résultats */}
      <div className="space-y-2">
        {displayResults.map((result, index) => (
          <button
            key={result.id || index}
            onClick={() => handleCardClick(result)}
            className={cn(
              "w-full text-left p-2.5 rounded-xl border transition-all",
              "hover:shadow-md hover:border-primary/30 cursor-pointer",
              "bg-white dark:bg-gray-900"
            )}
          >
            <div className="flex gap-2.5">
              {/* Image thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                {result.image_url ? (
                  <img
                    src={result.image_url}
                    alt={result.titre || 'Logement'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Titre */}
                <h4 className="font-medium text-sm truncate">
                  {result.titre || `${result.nombre_pieces || ''} à ${result.ville || 'Québec'}`}
                </h4>

                {/* Location */}
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {result.quartier ? `${result.quartier}, ` : ''}{result.ville || 'Québec'}
                  </span>
                </div>

                {/* Prix et détails */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    {result.prix && (
                      <span className="text-sm font-semibold text-primary">
                        {result.prix}$/mois
                      </span>
                    )}
                    {result.nombre_pieces && (
                      <span className="text-xs text-muted-foreground">
                        {result.nombre_pieces}
                      </span>
                    )}
                  </div>
                  {result.superficie && (
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Maximize2 className="w-3 h-3" />
                      <span>{result.superficie} pi²</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center pl-1">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Voir plus */}
      {hasMore && (
        <button
          onClick={onViewAll}
          className={cn(
            "w-full py-2 px-3 rounded-lg text-sm font-medium",
            "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          )}
        >
          Voir les {count || results.length} résultats
        </button>
      )}
    </div>
  );
}

export default ChatSearchResults;
