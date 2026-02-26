/**
 * ChatExternalResults - Affiche les résultats de recherche externe (Serper) dans le chat
 */

import { ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExternalResult {
  title?: string;
  link?: string;
  snippet?: string;
  imageUrl?: string;
  source?: string;
}

interface ChatExternalResultsProps {
  results: ExternalResult[];
  query?: string;
  maxDisplay?: number;
}

export function ChatExternalResults({
  results,
  query,
  maxDisplay = 3
}: ChatExternalResultsProps) {
  const displayResults = results.slice(0, maxDisplay);

  if (!results || results.length === 0) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg text-center mt-2">
        <p className="text-sm text-muted-foreground">Aucun résultat externe trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Globe className="w-3 h-3" />
        <span>Résultats du web{query ? ` pour "${query}"` : ''}</span>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {displayResults.map((result, index) => (
          <a
            key={index}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block p-2.5 rounded-xl border transition-all",
              "hover:shadow-md hover:border-primary/30",
              "bg-white dark:bg-gray-900"
            )}
          >
            <div className="flex gap-2.5">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate text-primary">
                  {result.title || 'Résultat'}
                </h4>
                {result.snippet && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {result.snippet}
                  </p>
                )}
                {result.source && (
                  <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                    {result.source}
                  </span>
                )}
              </div>

              {/* External link icon */}
              <div className="flex items-center">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* More results link */}
      {results.length > maxDisplay && (
        <p className="text-xs text-muted-foreground text-center">
          +{results.length - maxDisplay} autres résultats
        </p>
      )}
    </div>
  );
}

export default ChatExternalResults;
