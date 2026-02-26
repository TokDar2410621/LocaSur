/**
 * API LocaSur Match - Tous les endpoints pour le produit Match
 */

import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============================================
// TYPES
// ============================================

export interface Demande {
  id: number;
  titre: string;
  description: string;
  budget_max: number | null;
  date_recherche: string | null;
  villes: string[];
  quartiers_preferes?: string[];
  nb_pieces_min?: number | null;
  statut: string;
  nb_vues: number;
  nb_reponses: number;
  nb_favoris?: number;
  nb_matches?: number;
  est_urgente?: boolean;
  flexible_dates?: boolean;
  created_at: string | null;
}

export interface Match {
  id: number;
  title: string;
  description: string;
  price: number;
  type: string;
  city: string;
  neighborhood: string;
  address?: string;
  image: string;
  date_disponible?: string;
  score: number;
  grade: 'A+' | 'A' | 'B';
  score_details: any;
  url: string;
}

export interface Candidature {
  id: number;
  annonce: {
    id: number;
    title: string;
    price: number;
    type: string;
    city: string;
    neighborhood: string;
    image: string;
  };
  bailleur: {
    name: string;
  };
  statut: string;
  score_matching: number;
  message_motivation: string;
  created_at: string;
  vue_at?: string;
  reponse_at?: string;
}

export interface Lead {
  id: number;
  annonce: {
    id: number;
    title: string;
    price?: number;
    city: string;
  };
  locataire: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  profil: {
    occupation?: string;
    description?: string;
    nb_occupants?: number;
    budget_max?: number;
    date_demenagement?: string;
    preuve_revenu?: boolean;
    references?: boolean;
    enquete_credit?: boolean;
  };
  score_matching: number;
  score_details?: any;
  grade: 'A+' | 'A' | 'B';
  statut: string;
  message_motivation: string;
  notes_bailleur?: string;
  created_at: string;
  vue_at?: string;
  is_premium?: boolean;
}

// ============================================
// DASHBOARD
// ============================================

export async function getDashboardLocataire() {
  return api.get<{
    success: boolean;
    profile_completion: number;
    favoris: Array<{
      id: number;
      annonce: {
        id: number;
        title: string;
        price: number;
        type: string;
        city: string;
        neighborhood: string;
        image: string;
        source: string;
      };
      created_at: string;
      notes: string;
    }>;
    favoris_count: number;
    inferred_preferences: {
      ville?: string;
      prix_max?: number;
      type?: string;
    };
    demandes: Array<{
      id: number;
      titre: string;
      budget_max: number;
      villes: string[];
      statut: string;
      nb_matches: number;
      est_urgente: boolean;
      created_at: string;
    }>;
    demandes_count: number;
    candidatures: Array<{
      id: number;
      annonce: {
        id: number;
        title: string;
        price: number;
        city: string;
        neighborhood: string;
        image: string;
      };
      bailleur: {
        name: string;
      };
      statut: string;
      score_matching: number;
      created_at: string;
      vue_at: string | null;
    }>;
    candidatures_count: number;
    stats: {
      demandes_actives: number;
      demandes_acceptees: number;
      candidatures_en_attente: number;
      candidatures_acceptees: number;
      messages_non_lus: number;
    };
  }>('/api/match/dashboard/locataire/');
}

export async function getDashboardProprietaire() {
  return api.get<{
    success: boolean;
    profile_completion: number;
    annonces: any[];
    stats: {
      totalViews: number;
      totalFavorites: number;
      totalMessages: number;
      activeListings: number;
    };
    demandes: any[];
  }>('/api/match/dashboard/proprietaire/');
}

/**
 * Récupère les utilisateurs qui ont mis en favoris les annonces du propriétaire
 */
export async function getHostFavorites() {
  return api.get<{
    success: boolean;
    favorites: {
      id: number;
      user: {
        id: number;
        name: string;
        avatar?: string;
      };
      annonce: {
        id: number;
        titre: string;
        ville: string;
        prix: number;
        image?: string;
      };
      created_at: string;
    }[];
  }>('/api/match/host/favorites/');
}

/**
 * Contexte d'une annonce pour la messagerie
 */
export interface AnnonceContext {
  id: number;
  titre: string;
  prix: number;
  ville: string;
  quartier: string;
  type_logement: string;
  image_url: string | null;
}

/**
 * Démarre une conversation avec un utilisateur
 * @param userId - ID de l'utilisateur cible
 * @param annonceId - ID optionnel de l'annonce pour ajouter du contexte
 */
export async function startConversationWithUser(userId: number, annonceId?: number) {
  return api.post<{
    success: boolean;
    conversation: {
      id: number;
      name: string;
      sujet: string;
      created_at: string;
    };
    annonce_context?: AnnonceContext;
    suggested_message?: string;
  }>(`/api/match/messages/start-with-user/${userId}/`, annonceId ? { annonce_id: annonceId } : {});
}

// ============================================
// RECOMMANDATIONS
// ============================================

export interface Recommendation {
  id: number;
  title: string;
  price: number;
  type: string;
  city: string;
  neighborhood: string;
  source: string;
  image: string;
  matchScore: number;
  url: string;
}

export async function getRecommendations() {
  return api.get<{
    success: boolean;
    recommendations: Recommendation[];
    count: number;
    patterns_detected: boolean;
  }>('/api/match/recommendations/');
}

// ============================================
// DEMANDES DE LOGEMENT
// ============================================

export async function getMesDemandes() {
  return api.get<{
    success: boolean;
    demandes: Demande[];
    count: number;
  }>('/api/match/demandes/');
}

export async function getDemandeDetail(demandeId: number) {
  return api.get<{
    success: boolean;
    demande: Demande;
    matches: Match[];
    matches_count: number;
  }>(`/api/match/demandes/${demandeId}/`);
}

export async function createDemande(data: {
  ville: string;
  quartiers?: string[];
  budgetMax: number;
  typeLogement: string[];
  nombreChambres?: number;
  dateEmmenagement: string;
  description?: string;
  occupation?: string;
  nombreOccupants?: number;
}) {
  return api.post<{
    success: boolean;
    message: string;
    demande: {
      id: number;
      titre: string;
      created_at: string;
    };
  }>('/api/match/demandes/create/', data);
}

export async function updateDemande(demandeId: number, data: {
  titre?: string;
  description?: string;
  budget_max?: number;
  date_recherche?: string;
  villes?: string;
  nb_pieces_min?: number;
  est_urgente?: boolean;
  est_active?: boolean;
  flexible_dates?: boolean;
}) {
  return api.put<{
    success: boolean;
    demande: Demande;
  }>(`/api/match/demandes/${demandeId}/update/`, data);
}

export async function deleteDemande(demandeId: number) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/match/demandes/${demandeId}/delete/`);
}

// ============================================
// CANDIDATURES (1-CLICK APPLY)
// ============================================

export async function getMesCandidatures() {
  return api.get<{
    success: boolean;
    candidatures: Candidature[];
    stats: {
      total: number;
      en_attente: number;
      vue: number;
      en_examen: number;
      acceptee: number;
      refusee: number;
    };
  }>('/api/match/candidatures/');
}

export async function createCandidature(data: {
  annonce_id: number;
  message?: string;
}) {
  return api.post<{
    success: boolean;
    message: string;
    candidature_id: number;
  }>('/api/match/candidatures/create/', data);
}

export async function annulerCandidature(candidatureId: number) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/match/candidatures/${candidatureId}/annuler/`);
}

// ============================================
// CANDIDATURES REÇUES - PROPRIÉTAIRE
// ============================================

export interface CandidatureRecue {
  id: number;
  annonce: {
    id: number;
    titre: string;
    prix: number | null;
    ville: string;
    quartier: string;
    image: string | null;
  } | null;
  locataire: {
    id: number;
    name: string;
    avatar: string | null;
    score_profil: number;
  };
  statut: string;
  score_matching: number;
  message_motivation: string;
  created_at: string;
  vue_at: string | null;
}

export async function getCandidaturesRecues() {
  return api.get<{
    success: boolean;
    candidatures: CandidatureRecue[];
    stats: {
      total: number;
      nouvelles: number;
      vues: number;
      acceptees: number;
      refusees: number;
    };
  }>('/api/match/pro/candidatures/');
}

// ============================================
// ANNONCES PROPRIÉTAIRE
// ============================================

export async function getMesAnnonces() {
  return api.get<{
    success: boolean;
    annonces: any[];
    count: number;
  }>('/api/match/annonces/');
}

export async function getAnnonceDetail(annonceId: number) {
  return api.get<{
    success: boolean;
    annonce: {
      id: number;
      titre: string;
      description: string;
      prix: number | null;
      ville: string;
      quartier: string;
      adresse: string;
      nombre_pieces: number | null;
      nombre_chambres: number | null;
      superficie: number | null;
      meuble: boolean | null;
      animaux_acceptes: boolean | null;
      stationnement: boolean | null;
      electromenagers_inclus: boolean | null;
      chauffage_inclus: boolean | null;
      eau_incluse: boolean | null;
      buanderie: boolean | null;
      balcon: boolean | null;
      date_disponible: string;
      image_url: string | null;
      images_supplementaires: string[];
      status: string;
      is_active: boolean;
      type_propriete: string | null;
      type_unite: string | null;
      proprietaire?: {
        nom: string;
        prenom: string;
        photo: string | null;
        verifie: boolean;
      };
      candidature_envoyee: boolean;
      candidature_statut: string | null;  // en_attente, vue, en_examen, acceptee, refusee, annulee
      candidature_id: number | null;
      is_owner: boolean;
    };
  }>(`/api/match/annonces/${annonceId}/public/`);
}

/**
 * Récupère une annonce du propriétaire (pour édition - requiert d'être le propriétaire)
 */
export async function getMyAnnonceDetail(annonceId: number) {
  return api.get<{
    success: boolean;
    annonce: {
      id: number;
      titre: string;
      description: string;
      prix: number | null;
      ville: string;
      quartier: string;
      adresse: string;
      nombre_pieces: number | null;
      nombre_chambres: number | null;
      superficie: number | null;
      meuble: boolean | null;
      animaux_acceptes: boolean | null;
      stationnement: boolean | null;
      electromenagers_inclus: boolean | null;
      chauffage_inclus: boolean | null;
      eau_incluse: boolean | null;
      buanderie: boolean | null;
      balcon: boolean | null;
      date_disponible: string;
      image_url: string | null;
      images_supplementaires: string[];
      status: string;
      is_active: boolean;
      type_propriete: string | null;
      type_unite: string | null;
    };
  }>(`/api/match/annonces/${annonceId}/`);
}

export async function createAnnonce(data: any) {
  return api.post<{
    success: boolean;
    message: string;
  }>('/api/match/annonces/create/', data);
}

export async function updateAnnonce(annonceId: number, data: any) {
  return api.put<{
    success: boolean;
    message: string;
  }>(`/api/match/annonces/${annonceId}/update/`, data);
}

export async function changeAnnonceStatus(annonceId: number, status: 'active' | 'en_attente' | 'loue' | 'expired') {
  return api.post<{
    success: boolean;
    message: string;
    status: string;
    is_active: boolean;
  }>(`/api/match/annonces/${annonceId}/status/`, { status });
}

export async function deleteAnnonce(annonceId: number) {
  return api.delete<{
    success: boolean;
    message: string;
  }>(`/api/match/annonces/${annonceId}/delete/`);
}

// ============================================
// LEADS PROPRIÉTAIRE
// ============================================

export async function getLeadsProprietaire() {
  return api.get<{
    success: boolean;
    matches_par_annonce: Array<{
      annonce: {
        id: number;
        titre: string;
        ville: string;
        prix: number | null;
        nombre_pieces: string | null;
        image: string | null;
      };
      matches: Array<{
        demande_id: number;
        score: number;
        grade: string;
        match_reasons: Array<{
          type: string;
          icon: string;
          text: string;
          match: boolean | 'partial';
        }>;
        locataire: {
          id: number;
          name: string;
          avatar: string;
        };
        demande: {
          titre: string;
          ville: string;
          budget_max: number | null;
          date_recherche: string | null;
          est_urgente: boolean;
        };
      }>;
      total_matches: number;
    }>;
    total_matches: number;
    has_annonces: boolean;
    message?: string;
  }>('/api/match/pro/leads/');
}

export async function getLeadDetail(leadId: number) {
  return api.get<{
    success: boolean;
    lead: Lead;
  }>(`/api/match/pro/leads/${leadId}/`);
}

export async function leadAction(leadId: number, data: {
  action: 'accept' | 'reject' | 'note';
  notes?: string;
}) {
  return api.post<{
    success: boolean;
    message: string;
  }>(`/api/match/pro/leads/${leadId}/action/`, data);
}

// ============================================
// PROFIL WIZARD
// ============================================

export async function getProfile() {
  return api.get<{
    success: boolean;
    profil: {
      telephone: string;
      email_contact: string;
      budget_min: string;
      budget_max: string;
      statut_recherche: string;
      villes_preferees: string[];
      quartiers_preferes: string[];
      types_logement: string[];
      commodites_requises: string[];
      commodites_souhaitees: string[];
      situation: string;
      emploi_actuel: string;
      nb_occupants: string | number;
      bio: string;
      a_animaux: boolean;
      type_animaux: string;
      fumeur: boolean;
      accepte_contact_proprietaires: boolean;
      profil_public: boolean;
      completude_profil: number;
      qualite_lead: number;
      grade_lead: string;
    };
  }>('/api/match/profil/');
}

export async function completeProfile(data: {
  // Étape 1: Coordonnées & Budget
  telephone?: string;
  email_contact?: string;
  budget_min?: string;
  budget_max?: string;
  statut_recherche?: string;
  // Étape 2: Préférences
  commodites?: string[];
  type_logement?: string[];
  villes_preferees?: string[];
  // Étape 3: À propos
  situation?: string;
  occupation?: string;
  nb_occupants?: string;
  bio?: string;
  // Opt-in
  accepte_contact_proprietaires?: boolean;
}) {
  return api.post<{
    success: boolean;
    message: string;
  }>('/api/match/profil/complete/', data);
}

// ============================================
// PROFIL PROPRIETAIRE
// ============================================

export async function getProfilProprietaire() {
  return api.get<{
    success: boolean;
    profil: {
      telephone: string;
      email_professionnel: string;
      nom_entreprise: string;
      type_compte: string;
      bio: string;
      quartiers_cibles: string[];
      type_logements_offerts: string[];
      nb_logements_geres: number;
      completude_profil: number;
    } | null;
  }>('/api/match/profil/proprietaire/');
}

export async function completeProfilProprietaire(data: {
  telephone?: string;
  email_professionnel?: string;
  nom_entreprise?: string;
  type_compte?: string;
  bio?: string;
  quartiers_cibles?: string[];
  type_logements_offerts?: string[];
  nb_logements_geres?: string;
}) {
  return api.post<{
    success: boolean;
    message: string;
    completude_profil: number;
  }>('/api/match/profil/proprietaire/complete/', data);
}

// ============================================
// MESSAGERIE
// ============================================

export interface Conversation {
  id: number;
  other_user_id?: number;  // ID de l'autre participant pour profil public
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unread_count?: number;
  avatar?: string;
  is_other_deleted?: boolean;  // True si l'autre participant a supprimé son compte
}

export interface MessageAttachment {
  url: string;
  type: 'image' | 'file';
  filename?: string;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  is_mine: boolean;
  timestamp: string;
  read: boolean;
  is_deleted?: boolean;
  reaction?: string | null;
  reply_to?: {
    id: number;
    content: string;
    sender_name: string;
  };
  attachments?: MessageAttachment[];
}

export async function getMessages() {
  return api.get<{
    success: boolean;
    conversations: Conversation[];
    total: number;
  }>('/api/match/messages/');
}

/**
 * Récupère un token JWT pour l'authentification WebSocket
 * Nécessaire pour les connexions WebSocket cross-origin
 */
export async function getWebSocketToken() {
  return api.get<{
    success: boolean;
    token: string;
    expires_in: number;
  }>('/api/match/ws/token/');
}

export async function getConversationMessages(convId: number) {
  return api.get<{
    success: boolean;
    messages: Message[];
    conversation: {
      id: number;
      other_participant_name: string;
    };
  }>(`/api/match/messages/${convId}/`);
}

export async function sendMessage(convId: number, data: { content: string }) {
  return api.post<{
    success: boolean;
    message: Message;
  }>(`/api/match/messages/${convId}/send/`, data);
}

/**
 * Envoie un message avec des images
 * 1. Upload chaque image vers Cloudinary
 * 2. Envoie le message avec le contenu et les URLs des images
 */
export async function sendMessageWithImages(
  convId: number,
  content: string,
  images: File[],
  onProgress?: (uploaded: number, total: number) => void
): Promise<{
  success: boolean;
  message?: Message;
  error?: string;
}> {
  try {
    // Upload toutes les images d'abord
    const imageUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const result = await uploadImage(images[i]);
      if (result.success && result.url) {
        imageUrls.push(result.url);
      } else {
        return {
          success: false,
          error: `Erreur lors de l'upload de l'image ${i + 1}: ${result.error || 'Erreur inconnue'}`
        };
      }
      onProgress?.(i + 1, images.length);
    }

    // Construire le contenu du message avec les images
    // Format: texte + images en markdown-like format
    let fullContent = content.trim();

    if (imageUrls.length > 0) {
      // Ajouter les images au contenu avec un format spécial
      const imagesMarkup = imageUrls.map(url => `[image:${url}]`).join('\n');
      fullContent = fullContent
        ? `${fullContent}\n\n${imagesMarkup}`
        : imagesMarkup;
    }

    // Envoyer le message
    const response = await sendMessage(convId, { content: fullContent });
    return response;

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'envoi du message'
    };
  }
}

export async function startConversationWithLead(leadId: number) {
  return api.post<{
    success: boolean;
    conversation: {
      id: number;
      name: string;
      sujet: string;
      created_at: string;
    };
  }>(`/api/match/messages/start-with-lead/${leadId}/`, {});
}

/**
 * Supprime un message (soft delete)
 * Seul l'expéditeur peut supprimer son propre message
 */
export async function deleteMessage(messageId: number): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  return api.post(`/api/match/messages/${messageId}/delete/`, {});
}

/**
 * Ajoute ou retire une réaction emoji sur un message
 * Si la réaction existe déjà → la retire
 * Sinon → l'ajoute
 */
export async function addReaction(messageId: number, emoji: string | null): Promise<{
  success: boolean;
  action?: 'added' | 'removed';
  emoji?: string;
  error?: string;
}> {
  return api.post(`/api/match/messages/${messageId}/reaction/`, { emoji });
}

export interface DemandeContext {
  id: number;
  titre: string;
  villes: string[];
  budget_max: number | null;
  date_recherche: string | null;
  nb_pieces_min: number | null;
  est_urgente: boolean;
  description: string | null;
}

export async function startConversationWithDemande(demandeId: number) {
  return api.post<{
    success: boolean;
    conversation: {
      id: number;
      name: string;
      sujet: string;
      created_at: string;
    };
    demande_context?: DemandeContext;
    suggested_message?: string;
  }>(`/api/match/messages/start-with-demande/${demandeId}/`, {});
}

// ============================================
// UPLOAD
// ============================================

/**
 * Récupère le token CSRF depuis les cookies Django
 */
function getCsrfToken(): string | null {
  const name = 'csrftoken';
  let cookieValue: string | null = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function uploadImage(file: File): Promise<{
  success: boolean;
  url?: string;
  filename?: string;
  message?: string;
  error?: string;
}> {
  const formData = new FormData();
  formData.append('image', file);

  // Préparer les headers avec token d'auth et CSRF
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',  // Bypass ngrok browser warning page
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/match/upload/image/`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
    // Note: Ne pas mettre Content-Type, le navigateur le fait automatiquement avec boundary
  });

  return response.json();
}

// ============================================
// IMPORT FROM URL (AI EXTRACTION)
// ============================================

export interface ImportedListingData {
  titre?: string;
  description?: string;
  prix?: number;
  ville?: string;
  quartier?: string;
  adresse?: string;
  typeLogement?: string;
  nbChambres?: number;
  disponibilite?: string;
  commodites?: string[];
  imageUrl?: string;
  images?: string[];
  source?: string;
  confidence?: number;
}

export async function importFromUrl(url: string): Promise<{
  success: boolean;
  data?: ImportedListingData;
  message?: string;
  error?: string;
}> {
  return api.post('/api/match/import-from-url/', { url });
}

// ============================================
// DEMANDES PUBLIQUES (PROPRIÉTAIRES)
// ============================================

export interface DemandePublique {
  id: number;
  titre: string;
  description?: string;
  budget_max: number | null;
  date_recherche: string;
  villes: string[];
  quartiers_preferes?: string[];
  nb_pieces_min?: number;
  est_urgente?: boolean;
  created_at: string;
  locataire: {
    id: number;
    name: string;
    avatar?: string;
    is_verified?: boolean;
    verification_level?: 'none' | 'verified' | 'identity_confirmed';
  };
  profil?: {
    occupation?: string;
    description?: string;
    nb_occupants?: number;
    date_demenagement?: string;
    preuve_revenu?: boolean;
    references?: boolean;
    animaux?: boolean;
  };
}

export async function getDemandesPubliques(filters?: {
  ville?: string;
  budget_max?: number;
  nb_pieces_min?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.ville) params.append('ville', filters.ville);
  if (filters?.budget_max) params.append('budget_max', filters.budget_max.toString());
  if (filters?.nb_pieces_min) params.append('nb_pieces_min', filters.nb_pieces_min.toString());

  const queryString = params.toString();
  const url = `/api/match/pro/demandes/${queryString ? `?${queryString}` : ''}`;

  return api.get<{
    success: boolean;
    demandes: DemandePublique[];
    total: number;
  }>(url);
}

// ============================================
// AVIS / REVIEWS
// ============================================

export interface Review {
  id: number;
  reviewer_name: string;
  reviewer_id: number | null;
  note: number;
  note_etoiles: string;
  commentaire: string;
  type_avis: 'locataire_to_proprietaire' | 'proprietaire_to_locataire';
  tags: string[];
  // Critères détaillés
  note_communication?: number | null;
  note_logement?: number | null;
  note_rapport_qualite_prix?: number | null;
  note_serieux?: number | null;
  note_paiement?: number | null;
  note_respect_logement?: number | null;
  // Réponse
  reponse?: string;
  reponse_date?: string | null;
  // Contexte
  annonce_titre?: string | null;
  created_at: string;
}

export interface ReviewStats {
  note_moyenne: number;
  total_avis: number;
  distribution: { [key: number]: number };
  criteres: {
    communication: number;
    logement: number;
    rapport_qualite_prix: number;
    serieux: number;
    paiement: number;
    respect_logement: number;
  };
}

export interface PendingReview {
  candidature_id: number;
  type: 'locataire_to_proprietaire' | 'proprietaire_to_locataire';
  user_to_review: {
    id: number;
    name: string;
  };
  annonce_titre?: string | null;
  accepted_at: string;
}

/**
 * Récupère les avis publics pour un utilisateur
 */
export async function getReviewsForUser(userId: number) {
  return api.get<{
    success: boolean;
    reviews: Review[];
    stats: ReviewStats;
    total: number;
  }>(`/api/match/reviews/user/${userId}/`);
}

/**
 * Récupère mes avis (donnés et reçus)
 */
export async function getMyReviews() {
  return api.get<{
    success: boolean;
    reviews_donnees: Array<{
      id: number;
      reviewed_user_name: string;
      reviewed_user_id: number;
      note: number;
      commentaire: string;
      type_avis: string;
      annonce_titre?: string | null;
      created_at: string;
    }>;
    reviews_recues: Array<Review & { peut_repondre: boolean }>;
    stats: ReviewStats;
  }>('/api/match/reviews/my/');
}

/**
 * Récupère les candidatures en attente d'avis
 */
export async function getPendingReviews() {
  return api.get<{
    success: boolean;
    pending_reviews: PendingReview[];
    total: number;
  }>('/api/match/reviews/pending/');
}

/**
 * Vérifie si l'utilisateur peut laisser un avis pour une candidature
 */
export async function canReview(candidatureId: number) {
  return api.get<{
    success: boolean;
    can_review: boolean;
    reason?: string;
    reviewed_user?: {
      id: number;
      name: string;
    };
    type_avis?: string;
    annonce_titre?: string | null;
  }>(`/api/match/reviews/can-review/${candidatureId}/`);
}

/**
 * Crée un nouvel avis
 */
export async function createReview(data: {
  candidature_id: number;
  note: number;
  commentaire?: string;
  est_anonyme?: boolean;
  tags?: string[];
  // Critères détaillés pour propriétaires
  note_communication?: number;
  note_logement?: number;
  note_rapport_qualite_prix?: number;
  // Critères détaillés pour locataires
  note_serieux?: number;
  note_paiement?: number;
  note_respect_logement?: number;
}) {
  return api.post<{
    success: boolean;
    message: string;
    review: {
      id: number;
      note: number;
      note_etoiles: string;
    };
  }>('/api/match/reviews/create/', data);
}

/**
 * Répond à un avis reçu
 */
export async function respondToReview(reviewId: number, reponse: string) {
  return api.post<{
    success: boolean;
    message: string;
    reponse: string;
    reponse_date: string;
  }>(`/api/match/reviews/${reviewId}/respond/`, { reponse });
}

// ============================================
// PROFIL PUBLIC
// ============================================

export interface PublicProfileAnnonce {
  id: number;
  titre: string;
  prix: number | null;
  ville: string;
  quartier: string;
  nombre_pieces: number | null;
  image: string | null;
  seo_url: string | null;
}

export interface PublicProfile {
  id: number;
  name: string;
  first_name: string;
  member_since: string;
  member_since_date: string;
  user_type: 'locataire' | 'bailleur' | 'proprietaire' | null;
  user_type_display: string;
  avatar: string | null;
  note_moyenne: number;
  nb_avis: number;
  distribution: Record<number, number>;
  is_verified: boolean;
  verification_level?: 'none' | 'verified' | 'identity_confirmed';
  nb_logements: number | null;
  bio: string | null;
  reviews: Review[];
  annonces?: PublicProfileAnnonce[];
  // Score de confiance (locataires)
  qualite_lead?: number;
  grade_lead?: string;
}

/**
 * Récupère le profil public d'un utilisateur
 */
export async function getPublicProfile(userId: number) {
  return api.get<{
    success: boolean;
    profile: PublicProfile;
  }>(`/api/match/user/${userId}/`);
}

// ============================================
// VÉRIFICATION DE PROFIL
// ============================================

export interface VerificationStatus {
  // Score et niveau
  verification_score: number;
  verification_level: 'none' | 'verified' | 'identity_confirmed';
  verification_level_display: string;

  // Status détaillé
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;

  // Métadonnées
  phone?: string;
  id_status: 'none' | 'pending' | 'approved' | 'rejected';
  id_rejection_reason?: string;

  // Points
  points_email: number;
  points_phone: number;
  points_id: number;
  points_max: number;
}

/**
 * Récupère le statut de vérification de l'utilisateur connecté
 */
export async function getVerificationStatus() {
  return api.get<{
    success: boolean;
    verification: VerificationStatus;
  }>('/api/match/verification/status/');
}

/**
 * Envoie un code de vérification par SMS
 */
export async function sendPhoneVerification(phone: string) {
  return api.post<{
    success: boolean;
    message: string;
    expires_in?: number;
    // En mode debug uniquement
    debug_code?: string;
  }>('/api/match/verification/phone/send/', { phone_number: phone });
}

/**
 * Vérifie le code SMS
 */
export async function verifyPhoneCode(code: string) {
  return api.post<{
    success: boolean;
    message: string;
    new_score?: number;
    new_level?: string;
  }>('/api/match/verification/phone/verify/', { code });
}

/**
 * Upload un document d'identité + selfie pour vérification
 */
export async function uploadIdDocument(documentFile: File, selfieFile?: File) {
  const formData = new FormData();
  formData.append('document', documentFile);

  if (selfieFile) {
    formData.append('selfie', selfieFile);
  }

  return api.postFormData<{
    success: boolean;
    message: string;
    status: string;
  }>('/api/match/verification/id/upload/', formData);
}
