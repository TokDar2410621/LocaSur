/**
 * Hook pour gérer les demandes de logement
 */

import { useState } from 'react';
import api from '@/lib/api';

export interface DemandeData {
  ville: string;
  quartiers?: string[];
  budgetMax: number;
  typeLogement: string[];
  nombreChambres?: number;
  dateEmmenagement: string;
  description?: string;
  occupation?: string;
  nombreOccupants?: number;
}

// Données pour guest (sans compte)
export interface GuestDemandeData extends DemandeData {
  guestEmail: string;
  guestPhone?: string;
}

export function useDemandes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDemande = async (data: DemandeData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<{ success: boolean; message: string; demande: any }>('/api/match/demandes/create/', data);

      if (response.success) {
        return response.demande;
      } else {
        throw new Error('Erreur lors de la création de la demande');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création de la demande';
      setError(errorMessage);
      console.error('Error creating demande:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMesDemandes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{ success: boolean; demandes: any[] }>('/api/match/demandes/');

      if (response.success) {
        return response.demandes;
      }
      return [];
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des demandes');
      console.error('Error fetching demandes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Créer une demande en tant que guest (sans compte)
   * Les propriétaires contacteront le guest via email/téléphone
   */
  const createGuestDemande = async (data: GuestDemandeData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<{ success: boolean; message: string; demande: any; confirmationToken?: string }>(
        '/api/match/demandes/guest/create/',
        data
      );

      if (response.success) {
        return response;
      } else {
        throw new Error('Erreur lors de la création de la demande');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création de la demande';
      setError(errorMessage);
      console.error('Error creating guest demande:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createDemande,
    createGuestDemande,
    getMesDemandes,
  };
}
