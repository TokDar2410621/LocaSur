import { motion } from "framer-motion";
import { PropertyCardCompact } from "./PropertyCardCompact";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface PropertyGridListing {
  id: number;
  titre: string;
  ville: string;
  adresse?: string;
  quartier?: string;
  prix: number;
  image_url?: string;
  type_display?: string;
  source?: string;
  is_deal?: boolean;
  is_suspicious?: boolean;
  // Match scoring
  percentage?: number;
  is_perfect_match?: boolean;
  is_good_match?: boolean;
}

interface PropertyGridProps {
  listings: PropertyGridListing[];
  favorites?: Set<number>;
  onFavoriteToggle?: (id: number) => void;
  favoriteAnimating?: number | null;
  className?: string;
  renderDesktopCard?: (listing: PropertyGridListing, index: number) => React.ReactNode;
}

export function PropertyGrid({
  listings,
  favorites = new Set(),
  onFavoriteToggle,
  favoriteAnimating,
  className,
  renderDesktopCard,
}: PropertyGridProps) {
  const isMobile = useIsMobile();

  // On mobile, use compact 2-column grid with better spacing
  if (isMobile) {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        {listings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.015, 0.3), duration: 0.2 }}
          >
            <PropertyCardCompact
              id={listing.id}
              title={listing.titre}
              location={listing.adresse ? `${listing.adresse}, ${listing.ville}` : listing.ville}
              price={listing.prix}
              image={listing.image_url || ""}
              type={listing.type_display}
              source={listing.source}
              isDeal={listing.is_deal}
              isSuspicious={listing.is_suspicious}
              isFavorite={favorites.has(listing.id)}
              onFavoriteToggle={() => onFavoriteToggle?.(listing.id)}
              isAnimating={favoriteAnimating === listing.id}
              matchPercentage={listing.percentage}
              isPerfectMatch={listing.is_perfect_match}
              isGoodMatch={listing.is_good_match}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // On desktop, use full cards with custom renderer if provided
  if (renderDesktopCard) {
    return (
      <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6", className)}>
        {listings.map((listing, index) => renderDesktopCard(listing, index))}
      </div>
    );
  }

  // Default desktop grid with compact cards
  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6", className)}>
      {listings.map((listing, index) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
        >
          <PropertyCardCompact
            id={listing.id}
            title={listing.titre}
            location={listing.adresse ? `${listing.adresse}, ${listing.ville}` : listing.ville}
            price={listing.prix}
            image={listing.image_url || ""}
            type={listing.type_display}
            source={listing.source}
            isDeal={listing.is_deal}
            isSuspicious={listing.is_suspicious}
            isFavorite={favorites.has(listing.id)}
            onFavoriteToggle={() => onFavoriteToggle?.(listing.id)}
            isAnimating={favoriteAnimating === listing.id}
            matchPercentage={listing.percentage}
            isPerfectMatch={listing.is_perfect_match}
            isGoodMatch={listing.is_good_match}
          />
        </motion.div>
      ))}
    </div>
  );
}
