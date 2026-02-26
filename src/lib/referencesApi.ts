/**
 * API Client pour le système de références locataires
 */
import api from './api';

// ============================================================================
// INTERFACES TYPESCRIPT
// ============================================================================

export interface RentalHistory {
  id: number;
  address: string;
  city: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number | null;
  landlord_name: string;
  landlord_email: string;
  landlord_phone: string;
  reference_requested: boolean;
  reference_request_date: string | null;
  reference_status: 'not_requested' | 'pending' | 'completed';
  duration_months: number;
  is_current: boolean;
  created_at: string;
}

export interface LandlordReference {
  id: number;
  overall_sentiment?: 'positive' | 'neutral' | 'negative' | null;
  payment_rating: number | null;
  property_care_rating: number | null;
  communication_rating: number | null;
  would_rent_again: boolean | null;
  left_on_good_terms: boolean | null;
  respected_lease_terms: boolean | null;
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

export interface ReferenceFormData {
  // Nouveau champ simplifié
  overall_sentiment?: 'positive' | 'neutral' | 'negative';
  // Champs legacy (pour rétro-compatibilité)
  payment_rating?: number;
  property_care_rating?: number;
  communication_rating?: number;
  would_rent_again?: boolean;
  left_on_good_terms?: boolean;
  respected_lease_terms?: boolean;
  comment?: string;
  landlord_confirmed_email: string;
}

export interface PublicTenantProfile {
  tenant: {
    id: number;
    name: string;
    bio: string;
    occupation: string;
    revenus_mensuels: number | null;
    nb_occupants: number;
  };
  references: LandlordReference[];
  stats: {
    total_references: number;
    average_rating: number | null;
    would_rent_again_percentage: number | null;
    total_rental_months: number;
    ratings_breakdown: {
      payment: number | null;
      property_care: number | null;
      communication: number | null;
    };
  };
  reliability_score?: {
    score: number;
    grade: string;
    color: string;
    total_references: number;
  };
}

// ============================================================================
// RENTAL HISTORY API (Locataire)
// ============================================================================

/**
 * Liste l'historique de location du locataire connecté
 */
export async function getRentalHistory() {
  return api.get<{
    success: boolean;
    results: RentalHistory[];
  }>('/api/references/rental-history/');
}

/**
 * Ajoute une nouvelle entrée d'historique de location
 */
export async function createRentalHistory(data: {
  address: string;
  city: string;
  start_date: string;
  end_date?: string | null;
  monthly_rent?: number | null;
  landlord_name: string;
  landlord_email: string;
  landlord_phone?: string;
}) {
  return api.post<{
    success: boolean;
    rental_history: RentalHistory;
  }>('/api/references/rental-history/', data);
}

/**
 * Met à jour une entrée d'historique
 */
export async function updateRentalHistory(id: number, data: Partial<RentalHistory>) {
  return api.patch<{
    success: boolean;
    rental_history: RentalHistory;
  }>(`/api/references/rental-history/${id}/`, data);
}

/**
 * Supprime une entrée d'historique
 */
export async function deleteRentalHistory(id: number) {
  return api.delete<{
    success: boolean;
  }>(`/api/references/rental-history/${id}/`);
}

/**
 * Envoie une demande de référence à l'ancien propriétaire
 */
export async function requestReference(rentalHistoryId: number) {
  return api.post<{
    success: boolean;
    status: string;
    message: string;
  }>(`/api/references/rental-history/${rentalHistoryId}/request_reference/`);
}

// ============================================================================
// SUBMIT REFERENCE API (Propriétaire - Public)
// ============================================================================

/**
 * Récupère les infos pour le formulaire de référence (vue publique)
 */
export async function getReferenceForm(token: string) {
  return api.get<{
    tenant_name: string;
    address: string;
    city: string;
    start_date: string;
    end_date: string | null;
    landlord_name: string;
    landlord_email: string;
  }>(`/api/references/submit/${token}/`);
}

/**
 * Soumet une référence (vue publique - pas besoin d'auth)
 */
export async function submitReference(token: string, data: ReferenceFormData) {
  return api.post<{
    success: boolean;
    status: string;
    message: string;
  }>(`/api/references/submit/${token}/`, data);
}

// ============================================================================
// PUBLIC PROFILE API
// ============================================================================

/**
 * Récupère le profil public d'un locataire avec ses références
 */
export async function getPublicTenantProfile(tenantId: number) {
  return api.get<PublicTenantProfile>(`/api/references/tenant/${tenantId}/public/`);
}
