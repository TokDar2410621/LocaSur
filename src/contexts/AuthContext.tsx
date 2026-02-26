/**
 * Contexte d'authentification global
 * Fournit l'état user et les méthodes auth à toute l'application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken, clearAuthToken, isAuthenticated as checkAuth } from '@/lib/api';
import type { User, AuthResponse, LoginRequest, SignupRequest } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  signup: (data: SignupRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  googleLogin: (code: string, userType?: 'locataire' | 'proprietaire') => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Charger l'utilisateur au montage
  // On essaie toujours de récupérer l'utilisateur car il peut être connecté via cookie de session (Google OAuth)
  // même sans token dans localStorage
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get<{ success: boolean; authenticated: boolean; user: User | null }>('/api/auth/me/');
      if (response.authenticated && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/api/auth/login/', credentials);
      // Sauvegarder le token pour l'auth cross-origin
      if (response.token) {
        setAuthToken(response.token);
      }
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/api/auth/signup/', data);
      // Sauvegarder le token pour l'auth cross-origin
      if (response.token) {
        setAuthToken(response.token);
      }
      // Mettre à jour l'état utilisateur
      if (response.user) {
        setUser(response.user);
      } else {
        await fetchCurrentUser();
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthToken();
      setUser(null);
      navigate('/');
    }
  };

  const googleLogin = async (
    code: string,
    userType?: 'locataire' | 'proprietaire'
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/api/auth/google/callback/', {
        code,
        user_type: userType,
      });
      setAuthToken(response.token);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    googleLogin,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 * @throws Error si utilisé hors du AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
