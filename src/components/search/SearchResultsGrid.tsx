import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Bed, Home, PawPrint, Car, ArrowRight, ExternalLink, AlertTriangle, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getListingUrl } from "@/lib/utils";
import type { Listing } from "@/lib/searchApi";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { PropertyCardSkeletonGrid } from "@/components/ui/PropertyCardSkeleton";
import { SearchEmptyState, SearchEndOfResults } from "@/components/search";

interface SearchResultsGridProps {
  listings: Listing[];
  loading: boolean;
  favorites: Set<number>;
  onFavoriteToggle: (id: number) => void;
  favoriteAnimating: number | null;
  query: string;
  isMobile: boolean;
}

export function SearchResultsGrid({
  listings,
  loading,
  favorites,
  onFavoriteToggle,
  favoriteAnimating,
  query,
  isMobile,
}: SearchResultsGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <PropertyCardSkeletonGrid count={isMobile ? 6 : 12} isMobile={isMobile} />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <SearchEmptyState query={query} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24 md:pb-8">
      {/* Mobile: Compact grid */}
      {isMobile ? (
        <PropertyGrid
          listings={listings}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
          favoriteAnimating={favoriteAnimating}
        />
      ) : (
        /* Desktop: Enhanced cards */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              index={index}
              isFavorite={favorites.has(listing.id)}
              isAnimating={favoriteAnimating === listing.id}
              onFavoriteToggle={() => onFavoriteToggle(listing.id)}
              onClick={() => navigate(getListingUrl(listing))}
            />
          ))}
        </div>
      )}

      {/* End of results CTA */}
      <SearchEndOfResults query={query} totalResults={listings.length} />
    </div>
  );
}

interface ListingCardProps {
  listing: Listing;
  index: number;
  isFavorite: boolean;
  isAnimating: boolean;
  onFavoriteToggle: () => void;
  onClick: () => void;
}

function ListingCard({
  listing,
  index,
  isFavorite,
  isAnimating,
  onFavoriteToggle,
  onClick,
}: ListingCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-search/40 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.image_url || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"}
          alt={listing.titre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
        
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className={cn(
            "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all",
            "bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm",
            isFavorite ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          )}
        >
          <motion.div
            animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </motion.div>
        </button>

        {/* Badge Suspicious - Top left */}
        {listing.is_suspicious && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-xs font-medium shadow-md">
            <AlertTriangle className="w-3 h-3" />
            <span>À vérifier</span>
          </div>
        )}

        {/* Badge Match Score - Top right (if not favorite button area) */}
        {listing.percentage && listing.percentage >= 70 && (
          <div className={cn(
            "absolute top-12 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold shadow-md",
            listing.is_perfect_match
              ? "bg-emerald-500 text-white"
              : listing.is_good_match
                ? "bg-blue-500 text-white"
                : "bg-muted text-foreground"
          )}>
            {listing.is_perfect_match ? <Target className="w-3 h-3" /> : <Star className="w-3 h-3" />}
            <span>{Math.round(listing.percentage)}%</span>
          </div>
        )}

        {/* Badges Bottom */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm text-xs font-medium shadow-sm">
            {listing.source}
          </span>
          {listing.is_deal && (
            <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-destructive to-orange-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1">
              🔥 Deal
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xl font-bold text-search">
              {listing.prix ? `${listing.prix.toLocaleString('fr-CA')}$` : 'Prix sur demande'}
            </span>
            {listing.prix && (
              <span className="text-sm font-normal text-muted-foreground">/mois</span>
            )}
          </div>
          {listing.type_display && (
            <span className="px-2 py-1 rounded-lg bg-muted text-xs font-medium flex-shrink-0">
              {listing.type_display}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm mb-2 line-clamp-1 group-hover:text-search transition-colors">
          {listing.titre}
        </h3>

        {/* Location */}
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-search flex-shrink-0" />
          <span className="line-clamp-1">
            {listing.adresse ? `${listing.adresse}, ` : ''}{listing.ville}
          </span>
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {listing.nombre_chambres && (
            <FeatureBadge icon={Bed} label={`${listing.nombre_chambres} ch.`} />
          )}
          {listing.meuble && (
            <FeatureBadge icon={Home} label="Meublé" />
          )}
          {listing.animaux_acceptes && (
            <FeatureBadge icon={PawPrint} />
          )}
          {listing.stationnement && (
            <FeatureBadge icon={Car} />
          )}
        </div>

        {/* CTA Button */}
        <Button
          variant="default"
          className="w-full h-10 rounded-xl bg-search hover:bg-search-hover text-search-foreground shadow-sm hover:shadow-md transition-all font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Voir les détails
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.article>
  );
}

function FeatureBadge({ icon: Icon, label }: { icon: React.ElementType; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
