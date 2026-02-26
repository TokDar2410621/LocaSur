/**
 * API Client pour LocaSur Search
 * Endpoints pour recherche, favoris, alertes, deals
 */

import api from './api';

// ============================================================================
// INTERFACES TYPESCRIPT
// ============================================================================

export interface Listing {
  id: number;
  url: string;
  titre: string;
  description: string;
  prix: number;
  ville: string;
  quartier: string | null;
  adresse: string | null;

  // Caractéristiques
  nombre_pieces: number | null;
  nombre_chambres: number | null;
  nombre_salles_bain: number | null;
  superficie: number | null;

  // Types
  type_propriete: string | null;
  type_unite: string | null;
  type_display: string | null;
  is_colocation: boolean;
  is_studio: boolean;

  // Options
  meuble: boolean;
  animaux_acceptes: boolean;
  stationnement: boolean;
  electromenagers_inclus: boolean;
  chauffage_inclus: boolean;
  eau_incluse: boolean;
  buanderie: boolean;
  balcon: boolean;
  sous_sol: boolean;
  date_disponible: string | null;

  // Médias
  image_url: string | null;

  // Métadonnées
  source: string;
  date_publication: string | null;
  status: string;
  first_seen: string;
  last_seen: string;
  days_online: number;
  is_new: boolean;

  // Deals
  is_deal: boolean;
  deal_score: number | null;
  deal_reason: string | null;
  deal_detected_at: string | null;

  // Match scoring (from search)
  percentage?: number;
  is_perfect_match?: boolean;
  is_good_match?: boolean;
  match_label?: string;

  // Suspicious detection
  is_suspicious?: boolean;
  suspicious_reason?: string | null;

  // Enrichissement
  is_enriched: boolean;
}

export interface Favorite {
  id: number;
  created_at: string;
  notes: string;
  tags: string[];
  is_available: boolean;
  annonce: Listing;
}

export interface Alert {
  id: number;
  name: string;
  criteria: any;
  alert_enabled: boolean;
  alert_frequency: 'realtime' | 'daily' | 'weekly';
  alert_deals_only: boolean;
  created_at: string;
  last_alert_sent: string | null;
  alert_count: number;
}

export interface SearchParams {
  query?: string;
  ville?: string;
  prix_min?: number | string;
  prix_max?: number | string;
  pieces?: number | string;
  chambres?: number | string;
  type_propriete?: string;
  type_unite?: string;
  meuble?: boolean | string;
  animaux?: boolean | string;
  stationnement?: boolean | string;
  nouveautes?: 'today' | '3days' | 'week' | '';  // Filtre par nouveautés
  sources?: string;
  limit?: number;
  offset?: number;
  use_cache?: boolean;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  query_parsed: any;
  results: Listing[];
  count: number;
  search_time: number;
  from_cache: boolean;
  stats: {
    total_in_db: number;
    after_filters: number;
    after_scoring: number;
    perfect_matches: number;
    good_matches: number;
  };
}

// ============================================================================
// SEARCH API
// ============================================================================

/**
 * Recherche de logements avec parsing AI
 */
export async function searchListings(params: SearchParams) {
  return api.get<SearchResponse>('/api/search/', { params });
}

/**
 * Liste des annonces avec filtres simples
 */
export async function getAnnonces(params: SearchParams) {
  return api.get<{
    success: boolean;
    count: number;
    total: number;
    offset: number;
    limit: number;
    annonces: Listing[];
  }>('/api/annonces/', { params });
}

/**
 * Annonces proches de la position de l'utilisateur
 */
export async function getNearbyAnnonces(params: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
}) {
  return api.post<{
    success: boolean;
    count: number;
    annonces: Listing[];
    user_location: {
      latitude: number;
      longitude: number;
    };
  }>('/api/annonces/nearby/', params);
}

/**
 * Détail d'une annonce
 */
export async function getAnnonceDetail(annonceId: number) {
  return api.get<{
    success: boolean;
    annonce: Listing;
  }>(`/api/annonces/${annonceId}/`);
}

/**
 * Annonces géocodées pour la carte
 */
export async function getMapAnnonces(params: {
  ville?: string;
  prix_min?: number;
  prix_max?: number;
  pieces_min?: number;
  pieces_max?: number;
  deals_only?: boolean;
  bounds?: string;
  limit?: number;
}) {
  return api.get<{
    success: boolean;
    count: number;
    total: number;
    limit: number;
    annonces: Array<{
      id: number;
      lat: number;
      lng: number;
      titre: string;
      prix: number;
      ville: string;
      quartier: string;
      pieces: number | null;
      chambres: number | null;
      is_deal: boolean;
      deal_score: number | null;
      meuble: boolean;
      animaux: boolean;
      stationnement: boolean;
      image_url: string | null;
      url: string;
      is_new: boolean;
      days_online: number;
    }>;
  }>('/api/map/annonces/', { params });
}

// ============================================================================
// FAVORITES API
// ============================================================================

/**
 * Liste des favoris de l'utilisateur
 */
export async function getFavorites(params?: {
  available_only?: boolean;
  limit?: number;
  offset?: number;
}) {
  return api.get<{
    success: boolean;
    count: number;
    favoris: Favorite[];
  }>('/api/search/favorites/', { params });
}

/**
 * Ajoute une annonce aux favoris (via toggle)
 */
export async function addFavorite(data: {
  annonce_id: number;
  notes?: string;
  tags?: string[];
}) {
  return api.post<{
    success: boolean;
    favorited: boolean;
    annonce_id: number;
  }>('/api/search/favorites/toggle/', data);
}

/**
 * Retire une annonce des favoris (via toggle)
 */
export async function removeFavorite(annonceId: number) {
  return api.post<{
    success: boolean;
    favorited: boolean;
    annonce_id: number;
  }>('/api/search/favorites/toggle/', { annonce_id: annonceId });
}

/**
 * Toggle un favori (ajoute si absent, retire si présent)
 */
export async function toggleFavorite(annonceId: number) {
  return api.post<{
    success: boolean;
    favorited: boolean;
    annonce_id: number;
  }>('/api/search/favorites/toggle/', { annonce_id: annonceId });
}

/**
 * Vérifie si une annonce est dans les favoris
 */
export async function checkFavorite(annonceId: number) {
  return api.get<{
    is_favorited: boolean;
    annonce_id: number;
  }>(`/api/search/favorites/check/${annonceId}/`);
}

/**
 * Met à jour les notes d'un favori
 */
export async function updateFavoriteNotes(favoriId: number, data: {
  notes: string;
}) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/search/favorites/${favoriId}/notes/`, data);
}

// ============================================================================
// ALERTS API
// ============================================================================

/**
 * Liste des alertes de l'utilisateur
 */
export async function getAlerts() {
  return api.get<{
    success: boolean;
    count: number;
    alerts: Alert[];
  }>('/api/alerts/');
}

/**
 * Crée une nouvelle alerte
 */
export async function createAlert(data: {
  name: string;
  criteria: any;
  alert_frequency?: 'realtime' | 'daily' | 'weekly';
  alert_deals_only?: boolean;
}) {
  return api.post<{
    success: boolean;
    message: string;
    alert_id: number;
    redirect_url: string;
  }>('/api/alerts/create/', data);
}

/**
 * Active/désactive une alerte
 */
export async function toggleAlert(alertId: number) {
  return api.post<{
    success: boolean;
    alert_enabled: boolean;
  }>(`/api/alerts/${alertId}/toggle/`);
}

/**
 * Supprime une alerte
 */
export async function deleteAlert(alertId: number) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/search/alertes/${alertId}/delete/`);
}

// ============================================================================
// ALERTES API (version française - endpoints réels)
// ============================================================================

/**
 * Liste des alertes de l'utilisateur
 */
export async function getAlertes() {
  return api.get<{
    success: boolean;
    count: number;
    alertes: Array<{
      id: number;
      name: string;
      criteria: any;
      criteria_display: string;
      alert_enabled: boolean;
      alert_frequency: string;
      alert_deals_only: boolean;
      created_at: string;
      last_alert_sent: string | null;
      alert_count: number;
    }>;
  }>('/api/search/alertes/');
}

/**
 * Crée une nouvelle alerte
 */
export async function createAlerte(data: {
  name: string;
  criteria: {
    ville?: string;
    quartiers?: string[];
    prix_min?: number;
    prix_max?: number;
    type_logement?: string[];
  };
  alert_frequency?: 'realtime' | 'daily' | 'weekly';
  alert_deals_only?: boolean;
}) {
  return api.post<{
    success: boolean;
    message: string;
    alerte: {
      id: number;
      name: string;
      criteria: any;
    };
  }>('/api/search/alertes/create/', data);
}

/**
 * Toggle une alerte (active/désactive)
 */
export async function toggleAlerte(alerteId: number) {
  return api.post<{
    success: boolean;
    alert_enabled: boolean;
    message: string;
  }>(`/api/search/alertes/${alerteId}/toggle/`);
}

/**
 * Supprime une alerte
 */
export async function deleteAlerte(alerteId: number) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/search/alertes/${alerteId}/delete/`);
}

// ============================================================================
// DEALS API
// ============================================================================

/**
 * Liste des deals
 */
export async function getDeals(params?: {
  ville?: string;
  min_score?: number;
  limit?: number;
  type_propriete?: string;
}) {
  return api.get<{
    success: boolean;
    count: number;
    deals: Listing[];
  }>('/api/deals/', { params });
}

/**
 * Top deals (meilleurs scores)
 */
export async function getTopDeals(params?: {
  limit?: number;
  ville?: string;
}) {
  return api.get<{
    success: boolean;
    count: number;
    top_deals: Listing[];
  }>('/api/deals/top/', { params });
}

// ============================================================================
// STATS API
// ============================================================================

/**
 * Statistiques globales
 */
export async function getStats() {
  return api.get<{
    success: boolean;
    total_annonces: number;
    total_enrichies: number;
    taux_enrichissement: number;
    nouvelles_aujourdhui: number;
    by_ville: Array<{
      ville: string;
      count: number;
      avg_prix: number;
      min_prix: number;
      max_prix: number;
    }>;
    by_source: Array<{
      source: string;
      count: number;
    }>;
  }>('/stats/');
}

/**
 * Health check
 */
export async function healthCheck() {
  return api.get<{
    status: string;
    message: string;
    version: string;
  }>('/health/');
}

// ============================================================================
// TENANCY & REFERENCES API - BIDIRECTIONAL SYSTEM
// ============================================================================

export interface TenancyRecord {
  id: number;
  address: string;
  city: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  created_by: 'tenant' | 'landlord';
  status: 'pending_landlord_confirmation' | 'pending_tenant_confirmation' | 'verified' | 'disputed';
  has_landlord_reference: boolean;
  has_tenant_reference: boolean;
  invitation_sent: boolean;
  other_party_user_id: number | null;
  other_party_name: string;
  created_at: string;
}

export interface TenantReference {
  id: number;
  overall_sentiment?: 'positive' | 'neutral' | 'negative' | null;
  responsiveness_rating: number | null;
  maintenance_rating: number | null;
  communication_rating: number | null;
  lease_respect_rating: number | null;
  would_rent_again: boolean | null;
  property_as_described: boolean | null;
  issues_resolved_promptly: boolean | null;
  deposit_returned_fairly: boolean | null;
  comment: string;
  average_rating: number | null;
  completed_at: string | null;
  rental_period: {
    address: string;
    city: string;
    start_date: string;
    end_date: string | null;
    duration_months: number;
  };
}

export interface ContactRequestType {
  id: number;
  request_type: string;
  presentation_message: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  response_message: string;
  requester_name: string;  // Pour received requests
  recipient_name?: string;  // Pour sent requests
  requester_type: 'locataire' | 'propriétaire';
  rental_info: {
    address: string;
    city: string;
    period: string;
  };
  tenancy_context: string;  // Description textuelle de la location
  is_expired: boolean;
  expires_at: string;
  created_at: string;
  // Shared contact info (si approuvé)
  shared_email?: string | null;
  shared_phone?: string | null;
}

/**
 * Déclarer une location comme locataire
 */
export async function declareAsTenant(data: {
  address: string;
  city: string;
  start_date: string;
  end_date?: string | null;
  monthly_rent?: number | null;
  other_party_name: string;
  other_party_email?: string;
  other_party_phone?: string;
}) {
  return api.post<{
    success: boolean;
    rental_history_id: number;
    status: string;
    message: string;
  }>('/api/references/tenancy/declare-as-tenant/', data);
}

/**
 * Déclarer une location comme propriétaire
 */
export async function declareAsLandlord(data: {
  address: string;
  city: string;
  start_date: string;
  end_date?: string | null;
  monthly_rent?: number | null;
  other_party_name: string;
  other_party_email?: string;
  other_party_phone?: string;
}) {
  return api.post<{
    success: boolean;
    rental_history_id: number;
    status: string;
    message: string;
  }>('/api/references/tenancy/declare-as-landlord/', data);
}

/**
 * Mon historique de location
 */
export async function getMyTenancyHistory() {
  return api.get<{
    success: boolean;
    user_type: 'tenant' | 'landlord';
    records: TenancyRecord[];
  }>('/api/references/tenancy/my-history/');
}

/**
 * Envoyer une invitation à confirmer la location
 */
export async function sendTenancyInvitation(rentalId: number) {
  return api.post<{
    success: boolean;
    message: string;
    invitation_sent: boolean;
  }>(`/api/references/tenancy/${rentalId}/send-invitation/`);
}

/**
 * Récupérer infos location pour confirmation (public)
 */
export async function getTenancyConfirmInfo(token: string) {
  return api.get<{
    success: boolean;
    declared_by: 'tenant' | 'landlord';
    declarant_name: string;
    rental: {
      address: string;
      city: string;
      start_date: string;
      end_date: string | null;
      monthly_rent: number;
    };
  }>(`/api/references/tenancy/confirm/${token}/`);
}

/**
 * Confirmer une location (public)
 */
export async function confirmTenancy(token: string, data: {
  confirm: boolean;
  corrections?: any;
}) {
  return api.post<{
    success: boolean;
    message: string;
    status: string;
  }>(`/api/references/tenancy/confirm/${token}/`, data);
}

/**
 * Demander une référence à un ancien propriétaire (tenant)
 * Endpoint existant du système original
 */
export async function requestLandlordReference(rentalId: number) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/references/rental-history/${rentalId}/request_reference/`);
}

/**
 * Demander une référence à un ancien locataire (landlord)
 */
export async function requestTenantReference(rentalId: number) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/references/tenancy/${rentalId}/request-tenant-reference/`);
}

/**
 * Récupérer infos pour formulaire référence tenant (public)
 */
export async function getTenantReferenceInfo(token: string) {
  return api.get<{
    landlord_name: string;
    address: string;
    city: string;
    start_date: string;
    end_date: string | null;
  }>(`/api/references/submit-tenant/${token}/`);
}

/**
 * Soumettre une référence sur un propriétaire (public)
 */
export async function submitTenantReference(token: string, data: {
  // Nouveau champ simplifié
  overall_sentiment?: 'positive' | 'neutral' | 'negative';
  // Champs legacy (pour rétro-compatibilité)
  responsiveness_rating?: number;
  maintenance_rating?: number;
  communication_rating?: number;
  lease_respect_rating?: number;
  would_rent_again?: boolean;
  property_as_described?: boolean;
  issues_resolved_promptly?: boolean;
  deposit_returned_fairly?: boolean;
  comment?: string;
  tenant_confirmed_email: string;
}) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/references/submit-tenant/${token}/`, data);
}

/**
 * Profil public propriétaire avec références
 */
export async function getPublicLandlordProfile(landlordId: number) {
  return api.get<{
    landlord: {
      id: number;
      name: string;
      bio: string;
    };
    references: TenantReference[];
    stats: {
      total_references: number;
      average_rating: number | null;
      would_rent_again_percentage: number | null;
      deposit_returned_fairly_percentage: number | null;
      ratings_breakdown: {
        responsiveness: number | null;
        maintenance: number | null;
        communication: number | null;
        lease_respect: number | null;
      };
    };
  }>(`/api/references/landlord/${landlordId}/public/`);
}

/**
 * Créer une demande de contact
 */
export async function createContactRequest(data: {
  rental_history_id: number;
  request_type: string;
  presentation_message: string;
}) {
  return api.post<{
    success: boolean;
    request_id: number;
    message: string;
    expires_at: string;
  }>('/api/references/contact-requests/', data);
}

/**
 * Liste des demandes de contact reçues (pending)
 */
export async function getPendingContactRequests() {
  return api.get<{
    success: boolean;
    requests: ContactRequestType[];
  }>('/api/references/contact-requests/pending/');
}

/**
 * Alias pour getPendingContactRequests - Liste toutes mes demandes reçues
 */
export async function getMyContactRequests() {
  return getPendingContactRequests();
}

/**
 * Liste des demandes de contact envoyées
 */
export async function getSentContactRequests() {
  return api.get<{
    success: boolean;
    requests: ContactRequestType[];
  }>('/api/references/contact-requests/sent/');
}

/**
 * Répondre à une demande de contact
 */
export async function respondContactRequest(requestId: number, data: {
  approved: boolean;
  response_message?: string;
  share_email?: boolean;
  share_phone?: boolean;
}) {
  return api.post<{
    success: boolean;
    message: string;
    status: string;
  }>(`/api/references/contact-requests/${requestId}/respond/`, data);
}

/**
 * Récupérer infos de contact si approuvé
 */
export async function getContactInfo(requestId: number) {
  return api.get<{
    success: boolean;
    approved: boolean;
    shared_email: string | null;
    shared_phone: string | null;
    response_message: string;
    status?: string;
  }>(`/api/references/contact-requests/${requestId}/contact-info/`);
}

// ============================================================================
// TENANCY CONFIRMATION (Public)
// ============================================================================

export interface TenancyConfirmationInfo {
  success: boolean;
  tenancy_record: TenancyRecord;
  declared_by: 'tenant' | 'landlord';
}

/**
 * Récupère les infos pour confirmer une location (vue publique)
 */
export async function getTenancyConfirmationInfo(token: string) {
  return api.get<TenancyConfirmationInfo>(
    `/api/references/tenancy/confirm/${token}/`
  );
}

// ============================================================================
// TENANT REFERENCE SUBMISSION (Public - Tenant evaluates Landlord)
// ============================================================================

export interface TenantReferenceFormInfo {
  success: boolean;
  landlord_name: string;
  address: string;
  city: string;
  start_date: string;
  end_date: string | null;
  tenant_email?: string;
}

/**
 * Récupère les infos pour le formulaire de référence locataire (vue publique)
 */
export async function getTenantReferenceForm(token: string) {
  return api.get<TenantReferenceFormInfo>(
    `/api/references/submit-tenant/${token}/`
  );
}

// ============================================================================
// PUBLIC LANDLORD PROFILE
// ============================================================================

export interface PublicLandlordProfile {
  success: boolean;
  landlord: {
    id: number;
    name: string;
    bio: string;
  };
  stats: {
    total_references: number;
    average_rating: number | null;
    would_rent_again_percent?: number | null;
    would_rent_again_percentage?: number | null;
    deposit_returned_fairly_percent?: number | null;
    deposit_returned_fairly_percentage?: number | null;
    ratings_breakdown: {
      responsiveness: number | null;
      maintenance: number | null;
      communication: number | null;
      lease_respect: number | null;
    };
  };
  references: TenantReference[];
}
