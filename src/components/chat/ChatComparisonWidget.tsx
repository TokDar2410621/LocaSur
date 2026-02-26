/**
 * ChatComparisonWidget - Affiche une comparaison de logements dans le chat
 */

import { Check, X, MapPin, DollarSign, Home, Scale, Crown } from 'lucide-react';
import { cn, getListingUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ComparisonItem {
  id: number;
  titre?: string;
  prix?: number;
  ville?: string;
  quartier?: string;
  nombre_pieces?: string;
  superficie?: number;
  image_url?: string;
  score?: number;
  is_recommended?: boolean;
  seo_url?: string;
}

interface ComparisonData {
  items?: ComparisonItem[];
  winner?: ComparisonItem;
  summary?: string;
  criteria_scores?: Record<string, Record<number, number>>;
}

interface ChatComparisonWidgetProps {
  comparison: ComparisonData;
}

export function ChatComparisonWidget({ comparison }: ChatComparisonWidgetProps) {
  const navigate = useNavigate();
  const items = comparison?.items || [];

  if (items.length === 0) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg text-center mt-2">
        <p className="text-sm text-muted-foreground">Aucune comparaison disponible</p>
      </div>
    );
  }

  const handleItemClick = (item: ComparisonItem) => {
    if (item.id) {
      navigate(getListingUrl({ id: item.id, seo_url: item.seo_url }));
    }
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Scale className="w-3 h-3" />
        <span>Comparaison de {items.length} logements</span>
      </div>

      {/* Comparison cards */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isWinner = comparison.winner?.id === item.id || item.is_recommended;

          return (
            <button
              key={item.id || index}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full text-left p-3 rounded-xl border-2 transition-all",
                "hover:shadow-md cursor-pointer",
                isWinner
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white dark:bg-gray-900"
              )}
            >
              {/* Winner badge */}
              {isWinner && (
                <div className="flex items-center gap-1 text-primary text-xs font-medium mb-2">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Recommandé</span>
                </div>
              )}

              <div className="flex gap-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.titre || 'Logement'}
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
                  <h4 className="font-medium text-sm truncate">
                    {item.titre || `${item.nombre_pieces || ''} à ${item.ville || 'Québec'}`}
                  </h4>

                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {item.quartier ? `${item.quartier}, ` : ''}{item.ville || 'Québec'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-semibold",
                        isWinner ? "text-primary" : "text-foreground"
                      )}>
                        {item.prix}$/mois
                      </span>
                      {item.nombre_pieces && (
                        <span className="text-xs text-muted-foreground">
                          {item.nombre_pieces}
                        </span>
                      )}
                    </div>

                    {item.score && (
                      <div className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        item.score >= 80
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : item.score >= 60
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {item.score}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {comparison.summary && (
        <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-lg">
          {comparison.summary}
        </p>
      )}
    </div>
  );
}

export default ChatComparisonWidget;
