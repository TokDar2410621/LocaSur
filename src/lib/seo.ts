/**
 * SEO Configuration - LocaSur
 * Configuration centralisee pour l'optimisation SEO au Quebec
 */

// ============================================
// CONFIGURATION GLOBALE
// ============================================

export const SEO_CONFIG = {
  siteName: "LocaSur",
  siteUrl: "https://locasur.ca",
  defaultLocale: "fr_CA",
  supportedLocales: ["fr_CA", "en_CA"],
  twitterHandle: "@housingai",
  defaultImage: "https://locasur.ca/og-image.png",
  logo: "https://locasur.ca/logo.png",
  email: "contact@locasur.ca",
};

// ============================================
// MOTS-CLES PRINCIPAUX PAR REGION
// ============================================

export interface CityKeywords {
  city: string;
  slug: string;
  region: string;
  universities?: string[];
  neighborhoods: string[];
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const QUEBEC_CITIES: CityKeywords[] = [
  // ===== SAGUENAY-LAC-SAINT-JEAN =====
  {
    city: "Saguenay",
    slug: "saguenay",
    region: "Saguenay-Lac-Saint-Jean",
    universities: ["UQAC"],
    neighborhoods: ["Chicoutimi", "Jonquiere", "La Baie", "Laterriere", "Shipshaw"],
    keywords: {
      primary: [
        "chambre a louer saguenay",
        "appartement saguenay",
        "logement saguenay",
      ],
      secondary: [
        "3 1/2 saguenay",
        "4 1/2 saguenay",
        "5 1/2 saguenay",
        "studio saguenay",
        "colocation saguenay",
      ],
      longTail: [
        "chambre a louer pres UQAC",
        "logement etudiant saguenay",
        "appartement meuble saguenay",
        "logement accepte animaux saguenay",
        "chambre a louer chauffee eclairee saguenay",
      ],
    },
    coordinates: { lat: 48.4284, lng: -71.0683 },
  },
  {
    city: "Chicoutimi",
    slug: "chicoutimi",
    region: "Saguenay-Lac-Saint-Jean",
    universities: ["UQAC"],
    neighborhoods: ["Centre-ville", "Riviere-du-Moulin", "Chicoutimi-Nord", "Laterriere"],
    keywords: {
      primary: [
        "chambre a louer chicoutimi",
        "appartement chicoutimi",
        "logement chicoutimi",
      ],
      secondary: [
        "3 1/2 chicoutimi",
        "4 1/2 chicoutimi",
        "studio chicoutimi",
      ],
      longTail: [
        "logement etudiant UQAC chicoutimi",
        "chambre pres universite chicoutimi",
        "appartement centre-ville chicoutimi",
      ],
    },
    coordinates: { lat: 48.4279, lng: -71.0600 },
  },
  {
    city: "Jonquiere",
    slug: "jonquiere",
    region: "Saguenay-Lac-Saint-Jean",
    neighborhoods: ["Arvida", "Kenogami", "Centre-ville"],
    keywords: {
      primary: [
        "chambre a louer jonquiere",
        "appartement jonquiere",
        "logement jonquiere",
      ],
      secondary: [
        "3 1/2 jonquiere",
        "4 1/2 jonquiere",
        "5 1/2 jonquiere",
      ],
      longTail: [
        "logement arvida jonquiere",
        "appartement kenogami",
        "chambre meublee jonquiere",
      ],
    },
    coordinates: { lat: 48.4153, lng: -71.2436 },
  },
  {
    city: "Alma",
    slug: "alma",
    region: "Saguenay-Lac-Saint-Jean",
    neighborhoods: ["Centre-ville", "Delisle", "Isle-Maligne"],
    keywords: {
      primary: [
        "chambre a louer alma",
        "appartement alma",
        "logement alma",
      ],
      secondary: [
        "3 1/2 alma",
        "4 1/2 alma",
      ],
      longTail: [
        "logement lac saint-jean",
        "appartement pres rio tinto alma",
      ],
    },
    coordinates: { lat: 48.5499, lng: -71.6508 },
  },

  // ===== QUEBEC CITY =====
  {
    city: "Quebec",
    slug: "quebec",
    region: "Capitale-Nationale",
    universities: ["Universite Laval", "UQAM - Campus Quebec"],
    neighborhoods: [
      "Sainte-Foy",
      "Limoilou",
      "Saint-Roch",
      "Vieux-Quebec",
      "Charlesbourg",
      "Beauport",
      "Cap-Rouge",
      "Sillery",
    ],
    keywords: {
      primary: [
        "appartement a louer quebec",
        "chambre a louer quebec",
        "logement quebec",
      ],
      secondary: [
        "3 1/2 quebec",
        "4 1/2 quebec",
        "5 1/2 quebec",
        "studio quebec",
        "condo a louer quebec",
      ],
      longTail: [
        "logement etudiant universite laval",
        "chambre sainte-foy quebec",
        "appartement limoilou",
        "logement vieux-quebec",
        "chambre pres cegep quebec",
      ],
    },
    coordinates: { lat: 46.8139, lng: -71.2080 },
  },
  {
    city: "Levis",
    slug: "levis",
    region: "Chaudiere-Appalaches",
    neighborhoods: ["Levis Centre", "Saint-Romuald", "Charny", "Saint-Nicolas"],
    keywords: {
      primary: [
        "appartement a louer levis",
        "chambre a louer levis",
        "logement levis",
      ],
      secondary: [
        "3 1/2 levis",
        "4 1/2 levis",
      ],
      longTail: [
        "appartement traverse quebec levis",
        "logement saint-romuald",
      ],
    },
    coordinates: { lat: 46.8032, lng: -71.1827 },
  },

  // ===== TROIS-RIVIERES =====
  {
    city: "Trois-Rivieres",
    slug: "trois-rivieres",
    region: "Mauricie",
    universities: ["UQTR"],
    neighborhoods: ["Centre-ville", "Cap-de-la-Madeleine", "Sainte-Marthe-du-Cap", "Pointe-du-Lac"],
    keywords: {
      primary: [
        "appartement a louer trois-rivieres",
        "chambre a louer trois-rivieres",
        "logement trois-rivieres",
      ],
      secondary: [
        "3 1/2 trois-rivieres",
        "4 1/2 trois-rivieres",
        "studio trois-rivieres",
      ],
      longTail: [
        "logement etudiant UQTR",
        "chambre pres universite trois-rivieres",
        "appartement cap-de-la-madeleine",
      ],
    },
    coordinates: { lat: 46.3432, lng: -72.5477 },
  },

  // ===== SHERBROOKE =====
  {
    city: "Sherbrooke",
    slug: "sherbrooke",
    region: "Estrie",
    universities: ["Universite de Sherbrooke", "Bishop's University"],
    neighborhoods: ["Centre-ville", "Lennoxville", "Fleurimont", "Rock Forest", "Jacques-Cartier"],
    keywords: {
      primary: [
        "appartement a louer sherbrooke",
        "chambre a louer sherbrooke",
        "logement sherbrooke",
      ],
      secondary: [
        "3 1/2 sherbrooke",
        "4 1/2 sherbrooke",
        "studio sherbrooke",
      ],
      longTail: [
        "logement etudiant universite sherbrooke",
        "chambre lennoxville bishops",
        "appartement pres UdeS",
      ],
    },
    coordinates: { lat: 45.4042, lng: -71.8929 },
  },

  // ===== MONTREAL =====
  {
    city: "Montreal",
    slug: "montreal",
    region: "Montreal",
    universities: ["McGill", "Universite de Montreal", "UQAM", "Concordia", "HEC Montreal", "Polytechnique"],
    neighborhoods: [
      "Plateau Mont-Royal",
      "Rosemont",
      "Mile End",
      "Hochelaga",
      "Villeray",
      "Verdun",
      "NDG",
      "Cote-des-Neiges",
      "Saint-Henri",
      "Griffintown",
    ],
    keywords: {
      primary: [
        "appartement a louer montreal",
        "chambre a louer montreal",
        "logement montreal",
      ],
      secondary: [
        "3 1/2 montreal",
        "4 1/2 montreal",
        "5 1/2 montreal",
        "studio montreal",
        "colocation montreal",
        "condo a louer montreal",
      ],
      longTail: [
        "logement etudiant mcgill",
        "chambre plateau mont-royal",
        "appartement metro montreal",
        "colocation uqam",
        "logement pres concordia",
      ],
    },
    coordinates: { lat: 45.5017, lng: -73.5673 },
  },

  // ===== GATINEAU =====
  {
    city: "Gatineau",
    slug: "gatineau",
    region: "Outaouais",
    universities: ["UQO"],
    neighborhoods: ["Hull", "Aylmer", "Gatineau (secteur)", "Buckingham", "Masson-Angers"],
    keywords: {
      primary: [
        "appartement a louer gatineau",
        "chambre a louer gatineau",
        "logement gatineau",
      ],
      secondary: [
        "3 1/2 gatineau",
        "4 1/2 gatineau",
        "studio hull",
      ],
      longTail: [
        "logement etudiant UQO",
        "appartement pres ottawa gatineau",
        "chambre hull centre-ville",
      ],
    },
    coordinates: { lat: 45.4765, lng: -75.7013 },
  },
];

// ============================================
// TYPES DE LOGEMENT (TERMINOLOGIE QUEBECOISE)
// ============================================

export const PROPERTY_TYPES = [
  { slug: "chambre", label: "Chambre", searchTerms: ["chambre a louer", "chambre meublee"] },
  { slug: "studio", label: "Studio", searchTerms: ["studio", "bachelor", "1 1/2"] },
  { slug: "3-et-demi", label: "3 1/2", searchTerms: ["3 1/2", "3 et demi", "1 chambre"] },
  { slug: "4-et-demi", label: "4 1/2", searchTerms: ["4 1/2", "4 et demi", "2 chambres"] },
  { slug: "5-et-demi", label: "5 1/2", searchTerms: ["5 1/2", "5 et demi", "3 chambres"] },
  { slug: "6-et-demi", label: "6 1/2+", searchTerms: ["6 1/2", "4+ chambres", "grand logement"] },
  { slug: "colocation", label: "Colocation", searchTerms: ["colocation", "roommate", "colocataire"] },
  { slug: "condo", label: "Condo", searchTerms: ["condo a louer", "condominium"] },
  { slug: "maison", label: "Maison", searchTerms: ["maison a louer", "house"] },
];

// ============================================
// CARACTERISTIQUES POPULAIRES
// ============================================

export const POPULAR_FEATURES = [
  { slug: "meuble", label: "Meuble", searchTerms: ["meuble", "furnished"] },
  { slug: "chauffe-eclaire", label: "Chauffe et eclaire", searchTerms: ["chauffe", "eclaire", "tout inclus"] },
  { slug: "animaux-acceptes", label: "Animaux acceptes", searchTerms: ["animaux", "chien", "chat", "pets allowed"] },
  { slug: "stationnement", label: "Stationnement", searchTerms: ["stationnement", "parking"] },
  { slug: "laveuse-secheuse", label: "Laveuse/Secheuse", searchTerms: ["laveuse", "secheuse", "buanderie"] },
  { slug: "balcon", label: "Balcon", searchTerms: ["balcon", "terrasse"] },
  { slug: "piscine", label: "Piscine", searchTerms: ["piscine", "pool"] },
  { slug: "gym", label: "Gym", searchTerms: ["gym", "salle entrainement"] },
];

// ============================================
// META TAG TEMPLATES
// ============================================

export function generateCityMetaTags(city: CityKeywords, totalListings: number) {
  return {
    title: `Chambre a louer ${city.city} | ${totalListings}+ annonces | LocaSur`,
    description: `Trouvez votre chambre ou appartement a louer a ${city.city}, ${city.region}. ${totalListings}+ annonces verifiees. Recherche gratuite avec alertes.`,
    keywords: [
      ...city.keywords.primary,
      ...city.keywords.secondary.slice(0, 5),
      `logement ${city.city.toLowerCase()}`,
      `location ${city.city.toLowerCase()}`,
    ].join(", "),
    ogTitle: `Chambre a louer ${city.city} - ${totalListings}+ logements disponibles`,
    ogDescription: `Trouvez votre logement ideal a ${city.city}. Recherche unifiee sur 4+ plateformes.`,
  };
}

export function generatePropertyTypeMetaTags(
  propertyType: (typeof PROPERTY_TYPES)[0],
  city: CityKeywords,
  totalListings: number
) {
  const typeLabel = propertyType.label;
  return {
    title: `${typeLabel} a louer ${city.city} | ${totalListings} annonces | LocaSur`,
    description: `${totalListings} ${typeLabel.toLowerCase()} a louer a ${city.city}, ${city.region}. Comparez les prix et trouvez votre logement sur LocaSur.`,
    keywords: [
      `${typeLabel.toLowerCase()} a louer ${city.city.toLowerCase()}`,
      `${typeLabel.toLowerCase()} ${city.city.toLowerCase()}`,
      ...city.keywords.primary.slice(0, 3),
    ].join(", "),
  };
}

export function generateNeighborhoodMetaTags(
  neighborhood: string,
  city: CityKeywords,
  totalListings: number
) {
  return {
    title: `Logement a louer ${neighborhood}, ${city.city} | LocaSur`,
    description: `${totalListings} logements a louer dans le quartier ${neighborhood} a ${city.city}. Studios, 3 1/2, 4 1/2 et plus.`,
    keywords: [
      `logement ${neighborhood.toLowerCase()}`,
      `appartement ${neighborhood.toLowerCase()}`,
      `chambre ${neighborhood.toLowerCase()} ${city.city.toLowerCase()}`,
    ].join(", "),
  };
}

// ============================================
// SCHEMA.ORG GENERATORS
// ============================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SEO_CONFIG.siteName,
    "alternateName": "HousingAI",
    "url": SEO_CONFIG.siteUrl,
    "logo": SEO_CONFIG.logo,
    "sameAs": [
      "https://www.facebook.com/housingai",
      "https://www.instagram.com/housingai",
      "https://twitter.com/housingai",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": SEO_CONFIG.email,
      "availableLanguage": ["French", "English"],
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Saguenay",
      "addressRegion": "QC",
      "addressCountry": "CA",
    },
    "description": "Plateforme intelligente de recherche de logement au Quebec. Annonces verifiees avec references.",
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    "description": "Trouvez votre chambre a louer ou appartement au Quebec. Annonces verifiees avec references.",
  };
}

export function generateLocalBusinessSchema(city: CityKeywords) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": `${SEO_CONFIG.siteName} - ${city.city}`,
    "@id": `${SEO_CONFIG.siteUrl}/chambre-a-louer/${city.slug}`,
    "url": `${SEO_CONFIG.siteUrl}/chambre-a-louer/${city.slug}`,
    "email": SEO_CONFIG.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.city,
      "addressRegion": "QC",
      "addressCountry": "CA",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": city.coordinates.lat,
      "longitude": city.coordinates.lng,
    },
    "areaServed": {
      "@type": "City",
      "name": city.city,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": city.region,
      },
    },
    "priceRange": "Gratuit",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59",
    },
  };
}

export function generateRentalListingSchema(listing: {
  id: number;
  titre: string;
  description?: string;
  prix: number;
  ville: string;
  quartier?: string;
  adresse?: string;
  nombre_chambres?: number;
  superficie?: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  date_publication?: string;
  seo_url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "@id": `${SEO_CONFIG.siteUrl}${listing.seo_url || `/listing/${listing.id}`}`,
    "name": listing.titre,
    "description": listing.description || listing.titre,
    "url": `${SEO_CONFIG.siteUrl}${listing.seo_url || `/listing/${listing.id}`}`,
    "image": listing.image_url,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": listing.adresse || "",
      "addressLocality": listing.ville,
      "addressRegion": "QC",
      "addressCountry": "CA",
    },
    ...(listing.latitude && listing.longitude
      ? {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": listing.latitude,
            "longitude": listing.longitude,
          },
        }
      : {}),
    "numberOfRooms": listing.nombre_chambres,
    "floorSize": listing.superficie
      ? {
          "@type": "QuantitativeValue",
          "value": listing.superficie,
          "unitCode": "FTK", // Square feet
        }
      : undefined,
    "offers": {
      "@type": "Offer",
      "price": listing.prix,
      "priceCurrency": "CAD",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "availability": "https://schema.org/InStock",
    },
    "datePosted": listing.date_publication || new Date().toISOString(),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

// ============================================
// CITY LANDING PAGE URLS
// ============================================

export function getCityLandingUrl(citySlug: string): string {
  return `/chambre-a-louer/${citySlug}`;
}

export function getPropertyTypeLandingUrl(typeSlug: string, citySlug: string): string {
  return `/logement/${typeSlug}/${citySlug}`;
}

export function getNeighborhoodLandingUrl(citySlug: string, neighborhoodSlug: string): string {
  return `/logement/${neighborhoodSlug}/${citySlug}`;
}

// ============================================
// INTERNAL LINKING HELPERS
// ============================================

export function getRelatedCities(currentCitySlug: string): CityKeywords[] {
  const currentCity = QUEBEC_CITIES.find((c) => c.slug === currentCitySlug);
  if (!currentCity) return [];

  // Return cities from the same region first, then nearby regions
  return QUEBEC_CITIES.filter((c) => c.slug !== currentCitySlug)
    .sort((a, b) => {
      if (a.region === currentCity.region && b.region !== currentCity.region) return -1;
      if (b.region === currentCity.region && a.region !== currentCity.region) return 1;
      return 0;
    })
    .slice(0, 5);
}

export function getStudentCities(): CityKeywords[] {
  return QUEBEC_CITIES.filter((c) => c.universities && c.universities.length > 0);
}
