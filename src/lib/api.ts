/**
 * API Client pour LocaSur Backend (Django)
 * Configuration centralisée pour tous les appels API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types pour les réponses d'erreur
interface ApiError {
  detail?: string;
  message?: string;
  error?: string; // Format utilisé par notre backend Django
  errors?: Record<string, string[]>;
}

// Configuration de base pour fetch
const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',  // Bypass ngrok browser warning page
};

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

/**
 * Récupère le token d'authentification depuis localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Sauvegarde le token d'authentification
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Supprime le token d'authentification (logout)
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Client API principal avec gestion des erreurs
 */
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Ajouter les headers d'authentification
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...options.headers,
  };

  // Ajouter CSRF token pour les requêtes mutantes
  if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Ajouter auth token si disponible
  const authToken = getAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important pour les cookies CSRF
    });

    // Gérer les erreurs HTTP
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData: ApiError = await response.json();
        if (errorData.error) {
          // Notre format backend Django: { success: false, error: "..." }
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Erreurs de validation Django
          const firstError = Object.values(errorData.errors)[0];
          errorMessage = firstError ? firstError[0] : errorMessage;
        }
      } catch {
        // Si le parsing JSON échoue, garder le message par défaut
      }

      // Si 401, effacer le token (l'utilisateur devra se reconnecter via AuthModal)
      if (response.status === 401) {
        clearAuthToken();
        // Rediriger vers l'accueil où l'utilisateur peut se connecter via AuthModal
        window.location.href = '/';
      }

      throw new Error(errorMessage);
    }

    // Si 204 No Content, retourner null
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Une erreur réseau est survenue');
  }
}

/**
 * Méthodes helper pour les verbes HTTP
 */
export const api = {
  get: <T>(endpoint: string, options?: { params?: Record<string, any> }) => {
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return apiClient<T>(url, { method: 'GET' });
  },

  post: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),

  postFormData: <T>(endpoint: string, formData: FormData) => {
    const url = `${API_URL}${endpoint}`;

    // Headers pour FormData (pas de Content-Type, le browser le gère)
    const headers: HeadersInit = {
      'ngrok-skip-browser-warning': 'true',
    };

    // Ajouter CSRF token
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    // Ajouter auth token si disponible
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    }).then(async (response) => {
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }
      return response.json() as Promise<T>;
    });
  },
};

export default api;
