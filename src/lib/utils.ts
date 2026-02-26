import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retourne l'URL SEO d'une annonce si disponible, sinon l'URL legacy
 * Format SEO: /logement/{ville}/{slug}-{id}
 * Format legacy: /listing/{id}
 */
export function getListingUrl(listing: { id: number; seo_url?: string }): string {
  return listing.seo_url || `/listing/${listing.id}`;
}
