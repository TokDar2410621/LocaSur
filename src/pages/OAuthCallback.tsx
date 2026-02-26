import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { setAuthToken } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Page de callback OAuth (Google)
 *
 * Après authentification Google via Django Allauth:
 * 1. Django redirige vers cette page AVEC un token dans l'URL (?token=xxx)
 * 2. On extrait et stocke le token pour l'auth cross-origin
 * 3. On vérifie l'état de connexion via l'API /api/auth/me/
 * 4. Si pending_demande existe dans localStorage:
 *    - Auto-définir user_type = 'locataire'
 *    - Créer la demande automatiquement
 * 5. Sinon rediriger selon le profil:
 *    - Pas de user_type → sélection du type d'utilisateur
 *    - user_type défini → dashboard selon type (locataire/proprietaire)
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, refreshUser } = useAuthContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Connexion en cours...");

  useEffect(() => {
    handleCallback();
  }, []);

  /**
   * Traite le cas où l'utilisateur avait une demande en attente avant inscription
   * Auto-configure le profil locataire et crée la demande
   */
  const handlePendingDemande = async (pendingData: any, authToken: string) => {
    try {
      setMessage("Configuration de votre profil locataire...");

      // Headers communs avec le token d'auth
      const authHeaders = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${authToken}`,
      };

      // 1. Définir automatiquement user_type = 'locataire'
      const typeResponse = await fetch(`${API_URL}/api/auth/profile/type/`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({ user_type: 'locataire' }),
      });

      if (!typeResponse.ok) {
        console.error("Erreur lors de la définition du type utilisateur");
        // Continuer quand même - on essaiera de créer la demande
      }

      // 2. Pré-remplir le profil avec les données de la demande
      setMessage("Pré-remplissage de vos préférences...");

      const profileData: any = {
        villes_preferees: pendingData.ville ? [pendingData.ville] : [],
        accepte_contact_proprietaires: true,
      };

      // Mapper les données de la demande vers le profil
      if (pendingData.budgetMax) {
        profileData.budget_max = pendingData.budgetMax;
      }
      if (pendingData.budgetMin) {
        profileData.budget_min = pendingData.budgetMin;
      }
      if (pendingData.typeLogement && pendingData.typeLogement.length > 0) {
        profileData.type_logement = pendingData.typeLogement;
      }
      if (pendingData.occupation) {
        profileData.situation = pendingData.occupation;
      }
      if (pendingData.nombreOccupants) {
        profileData.nb_occupants = pendingData.nombreOccupants;
      }
      if (pendingData.description) {
        profileData.bio = pendingData.description;
      }

      // Appeler l'API pour compléter le profil (ignorer les erreurs)
      try {
        await fetch(`${API_URL}/api/match/profil/complete/`, {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify(profileData),
        });
      } catch (e) {
        console.warn("Erreur lors du pré-remplissage du profil:", e);
      }

      // 3. Créer la demande automatiquement
      setMessage("Création de votre demande...");

      const demandeData = {
        ville: pendingData.ville,
        quartiers: pendingData.quartiers || [],
        budgetMax: parseFloat(pendingData.budgetMax) || 0,
        typeLogement: pendingData.typeLogement || [],
        nombreChambres: pendingData.nombreChambres ? parseInt(pendingData.nombreChambres) : undefined,
        dateEmmenagement: pendingData.dateEmmenagement,
        description: pendingData.description || '',
        occupation: pendingData.occupation || '',
        nombreOccupants: parseInt(pendingData.nombreOccupants) || 1,
      };

      const demandeResponse = await fetch(`${API_URL}/api/match/demandes/create/`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify(demandeData),
      });

      if (demandeResponse.ok) {
        toast.success("Votre demande a été créée avec succès !");
      } else {
        console.error("Erreur lors de la création de la demande");
        toast.warning("Compte créé, mais erreur lors de la création de la demande. Vous pouvez la recréer depuis le dashboard.");
      }

      // 4. Nettoyer le localStorage
      localStorage.removeItem('pending_demande');

      // 5. Rafraîchir les données utilisateur
      await refreshUser();

      return true; // Succès
    } catch (error) {
      console.error("Erreur handlePendingDemande:", error);
      // Nettoyer quand même pour éviter de boucler
      localStorage.removeItem('pending_demande');
      return false;
    }
  };

  const handleCallback = async () => {
    try {
      setStatus('loading');
      setMessage("Vérification de votre connexion...");

      // ========================================
      // ÉTAPE 1: Extraire le token temporaire de l'URL
      // ========================================
      const tempToken = searchParams.get('token');

      if (!tempToken) {
        throw new Error("Token manquant dans l'URL. Veuillez réessayer la connexion.");
      }

      // ========================================
      // ÉTAPE 2: Échanger le token temporaire contre le vrai token
      // (Sécurité: le token temp est à usage unique, expire en 5 min)
      // ========================================
      setMessage("Authentification sécurisée...");

      const exchangeResponse = await fetch(`${API_URL}/api/auth/exchange-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ token: tempToken }),
      });

      if (!exchangeResponse.ok) {
        const errorData = await exchangeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Token invalide ou expiré");
      }

      const data = await exchangeResponse.json();

      if (!data.success || !data.token || !data.user) {
        throw new Error("Échec de l'échange de token");
      }

      // Stocker le VRAI token (session key) pour les futures requêtes API
      const authToken = data.token;
      setAuthToken(authToken);
      console.log("OAuth: secure token exchange completed");

      const currentUser = data.user;

      // Rafraîchir le contexte d'auth avec les nouvelles données
      await refreshUser();

      // ========================================
      // ÉTAPE 3: Vérifier s'il y a une demande en attente
      // ========================================
      const pendingDemandeStr = localStorage.getItem('pending_demande');
      if (pendingDemandeStr) {
        try {
          const pendingData = JSON.parse(pendingDemandeStr);

          // Traiter la demande en attente (passer le vrai token pour l'auth)
          const success = await handlePendingDemande(pendingData, authToken);

          setStatus('success');
          setMessage("Compte créé et demande publiée !");

          // Petit délai pour afficher le succès
          await new Promise(resolve => setTimeout(resolve, 800));

          // Rediriger vers le dashboard locataire
          navigate('/dashboard');
          return;
        } catch (e) {
          console.error("Erreur parsing pending_demande:", e);
          localStorage.removeItem('pending_demande');
        }
      }

      setStatus('success');
      setMessage("Connexion réussie! Redirection...");

      // Petit délai pour afficher le succès
      await new Promise(resolve => setTimeout(resolve, 800));

      // Vérifier s'il y a une redirection personnalisée (ex: page alerte, recherche, etc.)
      const customRedirect = localStorage.getItem('oauth_redirect_to');
      if (customRedirect) {
        localStorage.removeItem('oauth_redirect_to');
        navigate(customRedirect);
        return;
      }

      // Vérifier si l'utilisateur a un profil complet
      if (!currentUser.profile || !currentUser.profile.user_type) {
        // Nouveau compte Google → Sélection du type d'utilisateur
        navigate('/profile');
        return;
      }

      // Profil existant → Dashboard selon type
      if (currentUser.profile.user_type === 'proprietaire' || currentUser.profile.user_type === 'bailleur') {
        // Propriétaire: vérifier si onboarding complété
        if (!currentUser.profile.onboarding_completed) {
          navigate('/profile');
        } else {
          navigate('/host');
        }
      } else {
        // Locataire: vérifier si onboarding complété
        if (!currentUser.profile.onboarding_completed) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }

    } catch (error: any) {
      console.error("OAuth callback error:", error);
      setStatus('error');
      setMessage(error.message || "Erreur lors de la connexion");

      // Redirection vers l'accueil après erreur
      setTimeout(() => {
        navigate('/?error=oauth_failed');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-card border border-border">
          {status === 'loading' && (
            <Loader2 className="w-10 h-10 text-search animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-10 h-10 text-destructive" />
          )}
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-3">
          {status === 'loading' && "Connexion avec Google"}
          {status === 'success' && "Connexion réussie!"}
          {status === 'error' && "Erreur de connexion"}
        </h1>

        <p className="text-muted-foreground mb-6">
          {message}
        </p>

        {/* Loading bar */}
        {status === 'loading' && (
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-search to-match animate-pulse w-3/4"></div>
          </div>
        )}

        {/* Error actions */}
        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="text-search hover:underline text-sm"
            >
              Retour à l'accueil
            </button>
            <p className="text-xs text-muted-foreground">
              Redirection automatique dans 3 secondes...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
