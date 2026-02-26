/**
 * Types TypeScript pour les données du backend Django
 * Correspond aux modèles Django dans logements/models.py
 */

// ============================================================================
// AUTH & USER
// ============================================================================

export interface UserProfile {
  user_type: 'locataire' | 'bailleur' | 'proprietaire';
  onboarding_completed: boolean;
  onboarding_step: number;
  avatar_url?: string | null;
}

export interface User {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_authenticated?: boolean;
  profile?: UserProfile | null;
}

export interface ProfilLocataire {
  id: number;
  user: number;
  budget_min?: number;
  budget_max?: number;
  ville_preferee?: string;
  type_logement?: string;
  date_emmenagement?: string;
  onboarding_completed: boolean;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfilProprietaire {
  id: number;
  user: number;
  tier: 'free' | 'premium';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ANNONCES (Search - Externes)
// ============================================================================

export interface AnnonceExterne {
  id: number;
  url: string;
  titre: string;
  description: string;
  prix: number;
  ville: string;
  quartier?: string;
  adresse?: string;
  nombre_pieces?: string;
  chambres?: number;
  superficie?: number;
  date_disponible?: string;
  source?: string;
  status: 'active' | 'inactive';
  latitude?: number;
  longitude?: number;
  geocoded: boolean;
  images?: string[];
  created_at: string;
  updated_at: string;
  deal_score?: number;
  is_deal: boolean;
  // SEO-friendly URL
  seo_url?: string;
  slug?: string;
}

// ============================================================================
// MATCH (Annonces internes)
// ============================================================================

export interface AnnonceMatch {
  id: number;
  proprietaire: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  titre: string;
  description: string;
  prix: number;
  ville: string;
  quartier?: string;
  adresse: string;
  type_logement: string;
  nombre_pieces?: string;
  chambres?: number;
  superficie?: number;
  date_disponible?: string;
  status: 'active' | 'inactive';
  latitude?: number;
  longitude?: number;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface DemandeLogement {
  id: number;
  locataire: number;
  budget_min: number;
  budget_max: number;
  ville: string;
  type_logement: string;
  date_emmenagement?: string;
  description?: string;
  status: 'active' | 'inactive' | 'found';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FAVORIS & ALERTES
// ============================================================================

export interface Favorite {
  id: number;
  user: number;
  annonce: number;
  annonce_details?: AnnonceExterne;
  notes?: string;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  user: number;
  query: string;
  ville?: string;
  budget_max?: number;
  type_logement?: string;
  alert_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MESSAGERIE
// ============================================================================

export interface Conversation {
  id: number;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: User;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AnnonceExterne[];
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: User;
  profile?: ProfilLocataire | ProfilProprietaire;
  message?: string;
  // Champs pour signup avec vérification email
  email_verification_required?: boolean;
  redirect_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  password_confirm: string;
  user_type?: 'locataire' | 'proprietaire';  // Optional - if not provided, user goes to type selection
  first_name?: string;
  last_name?: string;
}

export interface GoogleAuthRequest {
  code: string;
  user_type?: 'locataire' | 'proprietaire';
}

// ============================================================================
// MATCH LEADS (Propriétaire)
// ============================================================================

export interface LeadLocataire {
  id: number;
  locataire: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  demande: DemandeLogement;
  match_score: string; // 'A+', 'A', 'B', 'C', 'D', 'F'
  compatibility: number; // 0-100
  is_blurred: boolean; // true si freemium
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
