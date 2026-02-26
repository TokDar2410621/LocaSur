import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn, getListingUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyCardProps {
  id: number | string;
  title: string;
  location: string;
  price: number;
  images: string[];
  type?: string;
  rooms?: string;
  deal?: {
    percentage: number;
    score?: string;
  };
  source?: string;
  availableDate?: string;
  isFavorite?: boolean;
  isSuspicious?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
  seo_url?: string;
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  images,
  type,
  rooms,
  deal,
  source,
  availableDate,
  isFavorite = false,
  isSuspicious = false,
  onFavoriteToggle,
  className,
  seo_url,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  return (
    <Link 
      to={getListingUrl({ id: Number(id), seo_url })}
      className={cn("property-card block", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Container */}
      <div className="property-card-image bg-muted">
        {/* Images Carousel */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Deal Badge */}
        {deal && (
          <div className="badge-deal">
            Deal -{deal.percentage}%
          </div>
        )}

        {/* Suspicious Badge */}
        {isSuspicious && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-xs font-medium shadow-md">
            <AlertTriangle className="w-3 h-3" />
            <span>À vérifier</span>
          </div>
        )}

        {/* Source Badge */}
        {source && (
          <div className="badge-source">
            {source}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "favorite-btn",
            isFavorite ? "favorite-btn-active" : "favorite-btn-inactive"
          )}
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-transform",
              isFavorite && "fill-current scale-110"
            )}
          />
        </button>

        {/* Navigation Arrows - Show on hover when multiple images */}
        {images.length > 1 && (
          <>
            <AnimatePresence>
              {isHovering && (
                <>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 shadow-soft flex items-center justify-center hover:bg-background transition-colors z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 shadow-soft flex items-center justify-center hover:bg-background transition-colors z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === currentImageIndex 
                      ? "bg-white w-2" 
                      : "bg-white/60 hover:bg-white/80"
                  )}
                />
              ))}
              {images.length > 5 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="pt-3 space-y-1">
        {/* Location */}
        <p className="text-sm text-muted-foreground truncate">
          {location}
        </p>

        {/* Title with type */}
        <h3 className="font-medium truncate">
          {type && `${type} · `}{rooms && `${rooms} · `}{title}
        </h3>

        {/* Price */}
        <p className="font-bold">
          {price ? `${price.toLocaleString('fr-CA')}$/mois` : 'Prix sur demande'}
        </p>

        {/* Deal score or availability */}
        {(deal?.score || availableDate) && (
          <p className="text-sm text-success">
            {deal?.score ? `Score: ${deal.score}` : `Dispo: ${availableDate}`}
          </p>
        )}
      </div>
    </Link>
  );
}