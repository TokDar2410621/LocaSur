/**
 * API Client pour l'authentification
 * Endpoints pour profil, avatar, etc.
 */

import api from './api';

// ============================================================================
// AVATAR UPLOAD
// ============================================================================

/**
 * Upload une image de profil (avatar)
 * @param file - Le fichier image à uploader
 * @returns L'URL de l'avatar uploadé
 */
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  // Utiliser fetch directement car axios ne gère pas bien FormData avec notre config
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_URL}/api/auth/avatar/upload/`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de l\'upload');
  }

  return response.json() as Promise<{
    success: boolean;
    avatar_url: string;
    message: string;
  }>;
}

// ============================================================================
// PROFILE API
// ============================================================================

/**
 * Met à jour les informations du profil utilisateur
 */
export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
}) {
  return api.post<{
    success: boolean;
    message: string;
  }>('/api/auth/profile/', data);
}

// ============================================================================
// PASSWORD
// ============================================================================

/**
 * Change le mot de passe de l'utilisateur
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  return api.post<{
    success: boolean;
    message: string;
  }>('/api/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

/**
 * Supprime le compte de l'utilisateur
 */
export async function deleteAccount() {
  return api.post<{
    success: boolean;
    message: string;
  }>('/api/auth/delete-account/', {});
}

// ============================================================================
// SOCIAL ACCOUNTS
// ============================================================================

/**
 * Liste les comptes sociaux liés
 */
export async function listSocialAccounts() {
  return api.get<{
    success: boolean;
    accounts: Array<{
      provider: string;
      uid: string;
    }>;
  }>('/api/auth/social-accounts/');
}

/**
 * Déconnecte un compte social
 */
export async function disconnectSocialAccount(provider: string) {
  return api.post<{
    success: boolean;
    message: string;
  }>('/api/auth/disconnect-social/', { provider });
}
