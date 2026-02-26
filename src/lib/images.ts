/**
 * Centralized image constants for LocaSur frontend
 * Uses Unsplash for high-quality, free images
 */

// ============================================
// HERO & LANDING PAGE IMAGES
// ============================================

export const HERO_IMAGES = {
  // Main hero - Modern apartment interior
  main: {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop",
    alt: "Appartement moderne et lumineux",
  },
  // Secondary hero - Person searching on laptop
  searching: {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
    alt: "Personne recherchant un logement sur ordinateur",
  },
  // Mobile app mockup style
  mobile: {
    url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=800&fit=crop",
    alt: "Application mobile de recherche de logement",
  },
};

// Hero carousel images - rotates every 5 seconds
export const HERO_CAROUSEL_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop",
    alt: "Salon moderne avec grandes fenêtres",
  },
  {
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
    alt: "Intérieur d'appartement contemporain",
  },
  {
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
    alt: "Salon cosy avec mobilier moderne",
  },
  {
    url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&h=800&fit=crop",
    alt: "Chambre lumineuse et spacieuse",
  },
  {
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop",
    alt: "Cuisine moderne équipée",
  },
];

// ============================================
// PROPERTY / APARTMENT IMAGES (Placeholders)
// ============================================

export const PROPERTY_PLACEHOLDERS = [
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    alt: "Salon moderne avec grandes fenêtres",
  },
  {
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    alt: "Intérieur d'appartement contemporain",
  },
  {
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    alt: "Salon cosy avec mobilier moderne",
  },
  {
    url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=600&h=400&fit=crop",
    alt: "Chambre lumineuse et spacieuse",
  },
  {
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
    alt: "Cuisine moderne équipée",
  },
];

// Get a random property placeholder
export const getPropertyPlaceholder = (index?: number) => {
  const idx = index !== undefined ? index % PROPERTY_PLACEHOLDERS.length : Math.floor(Math.random() * PROPERTY_PLACEHOLDERS.length);
  return PROPERTY_PLACEHOLDERS[idx];
};

// ============================================
// CITY IMAGES (Quebec cities)
// ============================================

export const CITY_IMAGES: Record<string, { url: string; alt: string }> = {
  // Saguenay-Lac-Saint-Jean
  chicoutimi: {
    url: "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=600&h=400&fit=crop",
    alt: "Vue de Chicoutimi",
  },
  jonquiere: {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    alt: "Paysage de Jonquière",
  },
  saguenay: {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    alt: "Fjord du Saguenay",
  },
  alma: {
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop",
    alt: "Lac Saint-Jean près d'Alma",
  },
  // Other Quebec cities
  montreal: {
    url: "https://images.unsplash.com/photo-1519178614-68673b201f36?w=600&h=400&fit=crop",
    alt: "Skyline de Montréal",
  },
  quebec: {
    url: "https://images.unsplash.com/photo-1558019589-c0161b7d33b8?w=600&h=400&fit=crop",
    alt: "Château Frontenac à Québec",
  },
  sherbrooke: {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    alt: "Vue de Sherbrooke",
  },
  gatineau: {
    url: "https://images.unsplash.com/photo-1569596082827-c5e8990da884?w=600&h=400&fit=crop",
    alt: "Vue de Gatineau et la rivière des Outaouais",
  },
  "trois-rivieres": {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop",
    alt: "Vue de Trois-Rivières",
  },
  laval: {
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
    alt: "Vue de Laval",
  },
  // Default for unknown cities
  default: {
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
    alt: "Vue urbaine",
  },
};

export const getCityImage = (cityName: string) => {
  const key = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  return CITY_IMAGES[key] || CITY_IMAGES.default;
};

// ============================================
// HOW IT WORKS / PROCESS ILLUSTRATIONS
// ============================================

export const PROCESS_IMAGES = {
  // Step 1: Create request / Search
  search: {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=350&fit=crop",
    alt: "Personne créant une demande de logement",
  },
  // Step 2: Matching / Connection
  connect: {
    url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=350&fit=crop",
    alt: "Connexion entre locataire et propriétaire",
  },
  // Step 3: Messages / Communication
  message: {
    url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=500&h=350&fit=crop",
    alt: "Discussion entre locataire et propriétaire",
  },
  // Step 4: Move in / Success
  movein: {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=350&fit=crop",
    alt: "Emménagement dans un nouveau logement",
  },
};

// ============================================
// EMPTY STATE ILLUSTRATIONS
// ============================================

export const EMPTY_STATE_IMAGES = {
  // No results found
  noResults: {
    url: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=400&h=300&fit=crop",
    alt: "Aucun résultat trouvé",
  },
  // No favorites
  noFavorites: {
    url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop",
    alt: "Aucun favori enregistré",
  },
  // No messages
  noMessages: {
    url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300&fit=crop",
    alt: "Aucun message",
  },
  // No requests
  noRequests: {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop",
    alt: "Aucune demande de logement",
  },
  // No listings (landlord)
  noListings: {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    alt: "Aucune annonce publiée",
  },
  // Error page
  error: {
    url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&h=300&fit=crop",
    alt: "Une erreur s'est produite",
  },
  // 404 - Not found
  notFound: {
    url: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400&h=300&fit=crop",
    alt: "Page non trouvée",
  },
};

// ============================================
// USER PROFILE / AVATAR IMAGES
// ============================================

export const AVATAR_PLACEHOLDERS = {
  tenant: {
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    alt: "Avatar locataire",
  },
  landlord: {
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    alt: "Avatar propriétaire",
  },
  default: {
    url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop",
    alt: "Avatar par défaut",
  },
};

// ============================================
// FEATURE / BENEFIT ILLUSTRATIONS
// ============================================

export const FEATURE_IMAGES = {
  // Search unified
  searchUnified: {
    url: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=400&h=300&fit=crop",
    alt: "Recherche unifiée de logements",
  },
  // Alerts
  alerts: {
    url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
    alt: "Alertes de nouveaux logements",
  },
  // Security / Trust
  security: {
    url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    alt: "Sécurité et confiance",
  },
  // Speed / Fast
  speed: {
    url: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&h=300&fit=crop",
    alt: "Recherche rapide",
  },
};

// ============================================
// DASHBOARD ILLUSTRATIONS
// ============================================

export const DASHBOARD_IMAGES = {
  // Welcome tenant
  welcomeTenant: {
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    alt: "Bienvenue sur votre tableau de bord",
  },
  // Welcome landlord
  welcomeLandlord: {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    alt: "Gérez vos propriétés",
  },
  // Stats / Analytics
  analytics: {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=350&fit=crop",
    alt: "Statistiques et analyses",
  },
};

// ============================================
// LANDLORD PAGE IMAGES
// ============================================

export const LANDLORD_PAGE_IMAGES = {
  // Hero - Property management
  hero: {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&h=600&fit=crop",
    alt: "Gestion de propriété locative",
  },
  // Method 1: Browse requests
  browseRequests: {
    url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=350&fit=crop",
    alt: "Consulter les demandes de locataires",
  },
  // Method 2: Publish listing
  publishListing: {
    url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=500&h=350&fit=crop",
    alt: "Publier une annonce de logement",
  },
};

// ============================================
// HELP PAGE SCREENSHOTS (to be replaced with actual screenshots)
// ============================================

export const HELP_IMAGES = {
  searchTutorial: {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    alt: "Comment rechercher un logement",
  },
  createRequestTutorial: {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
    alt: "Comment créer une demande",
  },
  messagingTutorial: {
    url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop",
    alt: "Comment utiliser la messagerie",
  },
};
