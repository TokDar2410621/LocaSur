/**
 * Utilitaires SEO pour LocaSur (Frontend)
 * Génération de slugs optimisés pour les URLs
 */

/**
 * Normalise un nom de ville pour un slug SEO
 */
export function slugifyVille(ville: string): string {
  // Remplacements pour les accents québécois
  const replacements: Record<string, string> = {
    'é': 'e',
    'è': 'e',
    'ê': 'e',
    'à': 'a',
    'â': 'a',
    'ô': 'o',
    'ù': 'u',
    'û': 'u',
    'î': 'i',
    'ï': 'i',
    'ç': 'c',
  };

  let normalized = ville.toLowerCase();
  for (const [accent, replacement] of Object.entries(replacements)) {
    normalized = normalized.replace(new RegExp(accent, 'g'), replacement);
  }

  // Remplacer espaces et caractères spéciaux par des tirets
  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convertit un nombre de pièces en format slug
 */
export function normalizePieces(nbPieces?: number): string {
  if (!nbPieces) return 'logement';

  // Studio/1 pièce
  if (nbPieces <= 1.0) return 'studio';

  // Format X 1/2 → X-et-demi
  if (nbPieces % 1 === 0.5) {
    const base = Math.floor(nbPieces);
    return `${base}-et-demi`;
  }

  // Nombre entier de pièces
  return `${Math.floor(nbPieces)}-pieces`;
}

/**
 * Extrait le nombre de pièces depuis le titre d'une demande
 */
export function extractPiecesFromTitre(titre: string): number | null {
  const titreLower = titre.toLowerCase();

  // Détecter "studio"
  if (titreLower.includes('studio')) {
    return 1.0;
  }

  // Détecter format "X½" ou "X 1/2"
  const patterns = [
    /(\d+)½/,           // 4½
    /(\d+)\s*1\/2/,     // 4 1/2
    /(\d+)\s*et\s*demi/ // 4 et demi
  ];

  for (const pattern of patterns) {
    const match = titre.match(pattern);
    if (match) {
      return parseFloat(match[1]) + 0.5;
    }
  }

  return null;
}

/**
 * Génère un slug SEO pour une demande de logement
 *
 * Format: /demande-logement/{type}-{ville}-{id}
 *
 * @example
 * generateDemandeSlug({
 *   id: 32,
 *   titre: "Recherche 4½ à Québec",
 *   villes: ["Québec"],
 *   nb_pieces_min: 4.5
 * })
 * // Returns: "demande-logement/4-et-demi-quebec-32"
 */
export function generateDemandeSlug(demande: {
  id: number;
  titre: string;
  villes: string[];
  nb_pieces_min?: number;
}): string {
  // 1. Extraire le type de logement
  let nbPieces = extractPiecesFromTitre(demande.titre);

  // Fallback: utiliser nb_pieces_min
  if (!nbPieces && demande.nb_pieces_min) {
    nbPieces = demande.nb_pieces_min;
  }

  const typeSlug = normalizePieces(nbPieces);

  // 2. Extraire la ville (première ville de la liste)
  let villeSlug = 'quebec'; // Default
  if (demande.villes && demande.villes.length > 0) {
    villeSlug = slugifyVille(demande.villes[0]);
  }

  // 3. Construire le slug complet
  return `demande-logement/${typeSlug}-${villeSlug}-${demande.id}`;
}

/**
 * Génère l'URL canonique complète pour une demande
 */
export function generateDemandeCanonicalUrl(demande: {
  id: number;
  titre: string;
  villes: string[];
  nb_pieces_min?: number;
}, baseUrl: string = window.location.origin): string {
  const slug = generateDemandeSlug(demande);
  return `${baseUrl}/${slug}`;
}

/**
 * Parse un slug de demande pour extraire l'ID
 *
 * @example
 * parseDemandeSlug("4-et-demi-quebec-32") // Returns: 32
 * parseDemandeSlug("demande-logement/studio-montreal-45") // Returns: 45
 */
export function parseDemandeSlug(slug: string): number | null {
  // Retirer le préfixe si présent
  const cleanSlug = slug.replace(/^demande-logement\//, '');

  // L'ID est toujours le dernier élément après le dernier tiret
  const parts = cleanSlug.split('-');

  if (parts.length < 3) return null;

  const id = parseInt(parts[parts.length - 1], 10);
  return isNaN(id) ? null : id;
}

// ============================================
// LISTINGS (ANNONCES) SEO
// ============================================

/**
 * Génère un slug SEO pour un listing (annonce)
 *
 * Format: /logement/{ville}/{descriptif}-{id}
 *
 * @example
 * generateListingSlug({
 *   id: 471,
 *   titre: "Beau 4½ au centre-ville",
 *   ville: "Saguenay",
 *   nombre_pieces: 4.5
 * })
 * // Returns: "logement/saguenay/4-et-demi-centre-ville-471"
 */
export function generateListingSlug(listing: {
  id: number;
  titre: string;
  ville: string;
  nombre_pieces?: number;
}): string {
  // 1. Slugifier la ville
  const villeSlug = listing.ville ? slugifyVille(listing.ville) : 'quebec';

  // 2. Extraire le type de logement du titre
  let nbPieces = extractPiecesFromTitre(listing.titre);
  if (!nbPieces && listing.nombre_pieces) {
    nbPieces = listing.nombre_pieces;
  }

  // 3. Créer le descriptif depuis le titre
  let titreClean = listing.titre.toLowerCase();

  // Remplacer caractères spéciaux
  titreClean = titreClean.replace(/½/g, '-et-demi');
  titreClean = titreClean.replace(/1\/2/g, '-et-demi');
  titreClean = titreClean.replace(/\s+/g, ' ');

  // Garder seulement lettres, chiffres, espaces
  titreClean = titreClean.replace(/[^a-z0-9\s-]/g, '');

  // Limiter à 5-6 mots max pour le slug
  const mots = titreClean.split(' ').filter(m => m.length > 0);
  const motsCles: string[] = [];

  // Garder type de logement si trouvé
  const typeLogement = nbPieces ? normalizePieces(nbPieces) : null;
  if (typeLogement && typeLogement !== 'logement') {
    motsCles.push(typeLogement);
  }

  // Ajouter autres mots importants (max 4-5 mots)
  const motsImportants = ['centre', 'ville', 'meuble', 'renove', 'grand', 'spacieux',
                          'lumineux', 'moderne', 'neuf', 'pres', 'uqac', 'cegep'];

  for (const mot of mots) {
    if (motsImportants.includes(mot) && motsCles.length < 6) {
      motsCles.push(mot);
    } else if (mot.length >= 4 && !['dans', 'pour', 'avec', 'sans'].includes(mot) && motsCles.length < 6) {
      motsCles.push(mot);
    }
  }

  // Si pas assez de mots, prendre les premiers mots du titre
  if (motsCles.length < 3) {
    for (const mot of mots.slice(0, 5)) {
      if (!motsCles.includes(mot) && mot.length >= 3) {
        motsCles.push(mot);
      }
      if (motsCles.length >= 5) break;
    }
  }

  const descriptif = motsCles.slice(0, 6).join('-'); // Max 6 mots

  // 4. Construire le slug final
  return `logement/${villeSlug}/${descriptif}-${listing.id}`;
}

/**
 * Parse un slug de listing pour extraire l'ID
 *
 * @example
 * parseListingSlug("logement/saguenay/4-et-demi-centre-ville-471") // Returns: 471
 * parseListingSlug("4-et-demi-centre-ville-471") // Returns: 471
 */
export function parseListingSlug(slug: string): number | null {
  // Retirer le préfixe "logement/{ville}/" si présent
  let cleanSlug = slug;
  if (slug.startsWith('logement/')) {
    const parts = slug.split('/');
    if (parts.length >= 3) {
      cleanSlug = parts[2]; // Prendre la dernière partie
    }
  }

  // L'ID est toujours le dernier élément après le dernier tiret
  const parts = cleanSlug.split('-');

  if (parts.length < 2) return null;

  const id = parseInt(parts[parts.length - 1], 10);
  return isNaN(id) ? null : id;
}

/**
 * Génère l'URL canonique complète pour un listing
 */
export function generateListingCanonicalUrl(listing: {
  id: number;
  titre: string;
  ville: string;
  nombre_pieces?: number;
}, baseUrl: string = window.location.origin): string {
  const slug = generateListingSlug(listing);
  return `${baseUrl}/${slug}`;
}
