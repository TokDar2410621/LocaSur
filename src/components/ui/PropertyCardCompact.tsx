import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, AlertTriangle, Target, Star } from "lucide-react";
import { cn, getListingUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyCardCompactProps {
  id: number | string;
  title: string;
  location: string;
  price: number;
  image: string;
  type?: string;
  source?: string;
  isDeal?: boolean;
  isSuspicious?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  isAnimating?: boolean;
  className?: string;
  seo_url?: string;
  // Match scoring
  matchPercentage?: number;
  isPerfectMatch?: boolean;
  isGoodMatch?: boolean;
}

export function PropertyCardCompact({
  id,
  title,
  location,
  price,
  image,
  type,
  source,
  isDeal,
  isSuspicious = false,
  isFavorite = false,
  onFavoriteToggle,
  isAnimating = false,
  className,
  seo_url,
  matchPercentage,
  isPerfectMatch,
  isGoodMatch,
}: PropertyCardCompactProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  return (
    <Link 
      to={getListingUrl({ id: Number(id), seo_url })}
      className={cn(
        "block bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm active:scale-[0.98] transition-transform duration-150",
        className
      )}
    >
      {/* Image - Taller aspect ratio for mobile */}
      <div className="relative aspect-[4/3.5] overflow-hidden bg-muted">
        <img
          src={image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Favorite Button - Larger touch target */}
        <div className="absolute top-2 right-2 overflow-visible">
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-md",
              isFavorite ? "text-red-500" : "text-muted-foreground"
            )}
          >
            <motion.div
              animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={cn("w-4.5 h-4.5", isFavorite && "fill-current")} />
            </motion.div>
          </button>
          
          {/* Heart burst animation */}
          <AnimatePresence>
            {isAnimating && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1, 0.6],
                      opacity: [1, 1, 0],
                      x: Math.cos((i * 60) * Math.PI / 180) * 20,
                      y: Math.sin((i * 60) * Math.PI / 180) * 20,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                  >
                    <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Top left badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {/* Match Score Badge */}
          {matchPercentage && matchPercentage >= 70 && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] font-bold shadow-sm",
              isPerfectMatch
                ? "bg-emerald-500 text-white"
                : isGoodMatch
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-foreground"
            )}>
              {isPerfectMatch ? <Target className="w-3 h-3" /> : <Star className="w-3 h-3" />}
              <span>{Math.round(matchPercentage)}%</span>
            </div>
          )}

          {/* Suspicious Badge */}
          {isSuspicious && (
            <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-amber-500/90 text-white text-[10px] font-semibold shadow-sm">
              <AlertTriangle className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Bottom badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {source && (
              <span className="px-2 py-1 rounded-lg bg-background/95 backdrop-blur-sm text-[10px] font-medium shadow-sm">
                {source}
              </span>
            )}
            {isDeal && (
              <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold shadow-sm">
                🔥 Deal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content - More spacious */}
      <div className="p-3">
        {/* Price - Prominent */}
        <div className="flex items-baseline gap-0.5 mb-1">
          <span className="text-lg font-bold text-search">
            {price ? `${price.toLocaleString('fr-CA')}$` : 'Prix N/D'}
          </span>
          {price && <span className="text-[10px] text-muted-foreground">/mois</span>}
        </div>

        {/* Title with type */}
        <h3 className="text-xs font-medium text-foreground line-clamp-1 mb-1">
          {type && <span className="text-muted-foreground">{type} · </span>}
          {title}
        </h3>

        {/* Location */}
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0 text-search/70" />
          <span className="truncate">{location}</span>
        </p>
      </div>
    </Link>
  );
}
