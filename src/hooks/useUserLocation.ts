/**
 * Hook pour detecter la ville de l'utilisateur via Geolocation
 * Cache le resultat dans localStorage pour les visites suivantes
 */

import { useState, useEffect } from "react";
import { QUEBEC_CITIES } from "@/lib/seo";

interface UserLocation {
  city: string;
  slug: string;
  region: string;
  isDetected: boolean; // true = geolocated, false = fallback
}

const STORAGE_KEY = "housing_user_location";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

// Fallback par defaut (generique "au Québec")
const DEFAULT_LOCATION: UserLocation = {
  city: "Québec",
  slug: "_fallback", // Slug special pour afficher "au Québec"
  region: "Québec",
  isDetected: false,
};

// Calcul distance Haversine entre 2 points GPS
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Trouver la ville la plus proche dans QUEBEC_CITIES
function findNearestCity(lat: number, lon: number): UserLocation | null {
  let nearest: UserLocation | null = null;
  let minDistance = Infinity;

  for (const city of QUEBEC_CITIES) {
    const distance = getDistance(lat, lon, city.coordinates.lat, city.coordinates.lng);

    // Max 100km pour etre considere "dans" cette ville
    if (distance < minDistance && distance < 100) {
      minDistance = distance;
      nearest = {
        city: city.city,
        slug: city.slug,
        region: city.region,
        isDetected: true,
      };
    }
  }

  return nearest;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Charger le cache si disponible (pour affichage immediat)
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        setLocation(data);
        setIsLoading(false);
      }
    } catch (e) {
      // Ignore cache errors
    }

    // 2. Toujours tenter la geolocation pour mettre a jour si necessaire
    if (!navigator.geolocation) {
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearestCity = findNearestCity(latitude, longitude);

        const result = nearestCity || DEFAULT_LOCATION;

        // Mettre a jour le cache
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              data: result,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          // Ignore storage errors
        }

        // Mise a jour directe sans reload (plus rapide)
        setLocation(result);
        setIsLoading(false);
      },
      () => {
        // Geolocation refused ou erreur - garder le cache ou fallback
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 2000, // Reduit de 5s a 2s pour UX rapide
        maximumAge: 300000, // 5 min cache GPS (etait 1 min)
      }
    );
  }, []);

  return { location, isLoading };
}

// Helper pour formater "à [ville]" ou "dans le [region]"
export function formatLocationText(location: UserLocation): string {
  // Fallback generique
  if (!location.isDetected || location.slug === "_fallback") {
    return "au Québec";
  }

  // Cas speciaux pour les articles
  const articlesSpeciaux: Record<string, string> = {
    saguenay: "dans le Saguenay",
    montreal: "à Montréal",
    quebec: "à Québec",
    "trois-rivieres": "à Trois-Rivières",
    sherbrooke: "à Sherbrooke",
    gatineau: "à Gatineau",
    levis: "à Lévis",
    chicoutimi: "à Chicoutimi",
    jonquiere: "à Jonquière",
    alma: "à Alma",
  };

  return articlesSpeciaux[location.slug] || `à ${location.city}`;
}
