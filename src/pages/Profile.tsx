/**
 * Profile - Refonte UX v2.0
 *
 * Utilise ProfileSimple par défaut.
 * L'ancienne version est conservée ci-dessous.
 */

// Re-export simplified version as default
export { default } from "./ProfileSimple";

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Save,
  Loader2,
  Phone,
  DollarSign,
  MapPin,
  Home,
  Briefcase,
  Users,
  FileText,
  Edit,
  CheckCircle2,
  XCircle,
  Star,
  Camera
} from "lucide-react";
import { uploadAvatar } from "@/lib/authApi";
import { BackButton } from "@/components/ui/back-button";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getProfile, getMyReviews, getPendingReviews, respondToReview, type ReviewStats, type PendingReview, type Review } from "@/lib/matchApi";
import { ReviewsSection } from "@/components/reviews";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import AuthModal from "@/components/auth/AuthModal";

interface ProfilData {
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
}

export function ProfileLegacy() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Determiner le type d'utilisateur
  const userType = user?.profile?.user_type;
  const isLocataire = userType === 'locataire';
  const isProprietaire = userType === 'bailleur' || userType === 'proprietaire';

  // Redirect users without profile to type selection
  useEffect(() => {
    if (user && !user.profile) {
      navigate('/profile');
    }
  }, [user, navigate]);

  // États pour les avis
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewsRecues, setReviewsRecues] = useState<(Review & { peut_repondre: boolean })[]>([]);
  const [reviewsDonnees, setReviewsDonnees] = useState<Array<{
    id: number;
    reviewed_user_name: string;
    reviewed_user_id: number;
    note: number;
    commentaire: string;
    type_avis: string;
    annonce_titre?: string | null;
    created_at: string;
  }>>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedPendingReview, setSelectedPendingReview] = useState<PendingReview | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Charger les données utilisateur et profil au montage
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
        });
      }

      // Charger les donnees selon le type d'utilisateur
      try {
        // Les avis sont charges pour tous les utilisateurs
        const reviewsPromises = [
          getMyReviews(),
          getPendingReviews(),
        ];

        // Le profil locataire n'est charge que pour les locataires
        const isUserLocataire = user?.profile?.user_type === 'locataire';

        if (isUserLocataire) {
          const [profilResponse, reviewsResponse, pendingResponse] = await Promise.all([
            getProfile(),
            ...reviewsPromises,
          ]);

          if (profilResponse.success && profilResponse.profil) {
            setProfil(profilResponse.profil);
          }

          if (reviewsResponse.success && 'stats' in reviewsResponse) {
            setReviewStats(reviewsResponse.stats);
            setReviewsRecues(reviewsResponse.reviews_recues || []);
            setReviewsDonnees(reviewsResponse.reviews_donnees || []);
          }

          if (pendingResponse.success && 'pending_reviews' in pendingResponse) {
            setPendingReviews(pendingResponse.pending_reviews || []);
          }
        } else {
          // Pour les proprietaires, charger uniquement les avis
          const [reviewsResponse, pendingResponse] = await Promise.all(reviewsPromises);

          if (reviewsResponse.success && 'stats' in reviewsResponse) {
            setReviewStats(reviewsResponse.stats);
            setReviewsRecues(reviewsResponse.reviews_recues || []);
            setReviewsDonnees(reviewsResponse.reviews_donnees || []);
          }

          if (pendingResponse.success && 'pending_reviews' in pendingResponse) {
            setPendingReviews(pendingResponse.pending_reviews || []);
          }
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Fonction pour ouvrir le formulaire d'avis
  const openReviewForm = (pending: PendingReview) => {
    setSelectedPendingReview(pending);
    setReviewFormOpen(true);
  };

  // Callback après création d'un avis
  const handleReviewCreated = async () => {
    // Recharger les avis en attente
    try {
      const response = await getPendingReviews();
      if (response.success) {
        setPendingReviews(response.pending_reviews || []);
      }
    } catch (error) {
      console.error("Erreur rechargement avis:", error);
    }
  };

  // Handler pour répondre à un avis reçu
  const handleRespondToReview = async (reviewId: number, reponse: string) => {
    try {
      const response = await respondToReview(reviewId, reponse);
      if (response.success) {
        toast.success("Réponse ajoutée avec succès");
        // Mettre à jour l'avis dans la liste locale
        setReviewsRecues((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, reponse: response.reponse, reponse_date: response.reponse_date, peut_repondre: false }
              : r
          )
        );
      } else {
        toast.error("Erreur lors de l'ajout de la réponse");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image trop volumineuse. Maximum 2MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await uploadAvatar(file);

      if (response.success) {
        toast.success('Photo de profil mise à jour !');
        // Rafraîchir les données utilisateur pour mettre à jour l'avatar partout
        await refreshUser();
      }
    } catch (error: any) {
      console.error('Erreur upload avatar:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingAvatar(false);
      // Reset input pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/profile/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du profil');
      }

      // Rafraîchir les données utilisateur dans le contexte
      await refreshUser();

      toast.success('Profil mis à jour avec succès!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  // Helper pour afficher le grade avec couleur
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-emerald-600 bg-emerald-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper pour afficher la situation
  const getSituationLabel = (situation: string) => {
    const labels: Record<string, string> = {
      'etudiant': 'Étudiant',
      'professionnel': 'Professionnel',
      'famille': 'Famille',
      'retraite': 'Retraité',
    };
    return labels[situation] || situation || 'Non spécifié';
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder à cette page</p>
            <Button onClick={() => setAuthModalOpen(true)} className="rounded-xl">Se connecter</Button>
          </div>
        </div>
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          trigger="login"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-5 sm:mb-8">
            <BackButton className="mb-3 sm:mb-4" />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Mon Profil</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Consultez et gérez vos informations
                </p>
              </div>
              <Link to="/profile">
                <Button className="rounded-xl gradient-match text-white w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-match" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Complétude du profil - LOCATAIRES UNIQUEMENT */}
              {isLocataire && profil && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-match" />
                      Qualité du profil
                    </h3>
                    {profil.grade_lead && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold",
                        getGradeColor(profil.grade_lead)
                      )}>
                        Grade {profil.grade_lead}
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Complétude</span>
                    <span className="font-medium">{profil.completude_profil || 0}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-match to-primary transition-all duration-500"
                      style={{ width: `${profil.completude_profil || 0}%` }}
                    />
                  </div>

                  {(profil.completude_profil || 0) < 80 && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Complétez votre profil pour augmenter vos chances d'être contacté par les propriétaires.
                    </p>
                  )}
                </div>
              )}

              {/* Informations de base */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-border space-y-4 sm:space-y-6">
                {/* Photo et nom */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Avatar avec bouton d'upload */}
                  <div className="relative group">
                    <Avatar
                      src={user?.profile?.avatar_url}
                      fallback={user?.first_name || user?.email?.split('@')[0]}
                      alt={user?.first_name || 'User'}
                      size="xl"
                      className="w-16 h-16 sm:w-20 sm:h-20"
                    />
                    {/* Overlay pour changer la photo */}
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </button>
                    {/* Input file caché */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg sm:text-xl mb-0.5 sm:mb-1 truncate">
                      {formData.firstName} {formData.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{formData.email}</p>
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      Changer la photo
                    </button>
                  </div>
                </div>

                {/* Informations personnelles éditables */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="rounded-xl h-12"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="rounded-xl h-12"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        className="rounded-xl h-12 pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl"
                      variant="outline"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer le nom
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* AVIS EN ATTENTE - Section prioritaire avec style premium */}
              {pendingReviews.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-amber-300 relative overflow-hidden">
                  {/* Indicateur visuel */}
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                    Action requise
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-amber-500 rounded-full p-2.5">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">
                        {pendingReviews.length} avis en attente
                      </h3>
                      <p className="text-sm text-amber-700">
                        Votre avis aide la communauté LocaSur
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pendingReviews.map((pending) => (
                      <div
                        key={pending.candidature_id}
                        className="bg-white/80 backdrop-blur rounded-xl p-4 flex items-center justify-between shadow-sm border border-amber-200/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            {pending.user_to_review.name}
                          </p>
                          {pending.annonce_titre && (
                            <p className="text-sm text-muted-foreground truncate">
                              {pending.annonce_titre}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => openReviewForm(pending)}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shrink-0 ml-3"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Noter
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordonnées de contact */}
              {profil && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-match" />
                    Coordonnées de contact
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                      <p className="font-medium">
                        {profil.telephone || (
                          <span className="text-muted-foreground italic">Non renseigné</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Email de contact</p>
                      <p className="font-medium">
                        {profil.email_contact || formData.email || (
                          <span className="text-muted-foreground italic">Non renseigné</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget - LOCATAIRES UNIQUEMENT */}
              {isLocataire && profil && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-match" />
                    Budget mensuel
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Minimum</p>
                      <p className="font-medium text-lg">
                        {profil.budget_min ? `${profil.budget_min} $` : (
                          <span className="text-muted-foreground italic">Non renseigné</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Maximum</p>
                      <p className="font-medium text-lg">
                        {profil.budget_max ? `${profil.budget_max} $` : (
                          <span className="text-muted-foreground italic">Non renseigné</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Localisation - LOCATAIRES UNIQUEMENT */}
              {isLocataire && profil && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-match" />
                    Localisation recherchee
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Villes préférées</p>
                      {profil.villes_preferees && profil.villes_preferees.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profil.villes_preferees.map((ville, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-match/10 text-match rounded-full text-sm"
                            >
                              {ville}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">Aucune ville sélectionnée</p>
                      )}
                    </div>

                    {profil.quartiers_preferes && profil.quartiers_preferes.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Quartiers préférés</p>
                        <div className="flex flex-wrap gap-2">
                          {profil.quartiers_preferes.map((quartier, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-muted rounded-full text-sm"
                            >
                              {quartier}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Préférences de logement - LOCATAIRES UNIQUEMENT */}
              {isLocataire && profil && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-match" />
                    Preferences de logement
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Types de logement</p>
                      {profil.types_logement && profil.types_logement.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profil.types_logement.map((type, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-match/10 text-match rounded-full text-sm capitalize"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">Aucun type sélectionné</p>
                      )}
                    </div>

                    {profil.commodites_requises && profil.commodites_requises.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Commodités requises</p>
                        <div className="flex flex-wrap gap-2">
                          {profil.commodites_requises.map((commodite, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                            >
                              {commodite}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* À propos - LOCATAIRES UNIQUEMENT */}
              {isLocataire && profil && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-match" />
                    A propos de vous
                  </h3>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">Situation</p>
                        <p className="font-medium">{getSituationLabel(profil.situation)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">Occupation</p>
                        <p className="font-medium">
                          {profil.emploi_actuel || (
                            <span className="text-muted-foreground italic">Non renseigné</span>
                          )}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">Occupants</p>
                        <p className="font-medium flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {profil.nb_occupants || 1} personne{Number(profil.nb_occupants) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {profil.bio && (
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-2">Bio</p>
                        <p className="whitespace-pre-wrap">{profil.bio}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                        {profil.accepte_contact_proprietaires ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-sm">
                          {profil.accepte_contact_proprietaires
                            ? "Accepte d'être contacté par les propriétaires"
                            : "Ne souhaite pas être contacté directement"
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                        {profil.a_animaux ? (
                          <>
                            <span className="text-xl">🐾</span>
                            <span className="text-sm">
                              A des animaux{profil.type_animaux ? `: ${profil.type_animaux}` : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">🚫🐾</span>
                            <span className="text-sm">Pas d'animaux</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mes avis donnés */}
              {reviewsDonnees.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-blue-500" />
                    Mes avis donnés ({reviewsDonnees.length})
                  </h3>

                  <div className="space-y-3">
                    {reviewsDonnees.map((review) => (
                      <div
                        key={review.id}
                        className="bg-muted/50 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <button
                              onClick={() => navigate(`/user/${review.reviewed_user_id}`)}
                              className="font-medium hover:underline hover:text-primary transition-colors text-left"
                            >
                              {review.reviewed_user_name}
                            </button>
                            {review.annonce_titre && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {review.annonce_titre}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-4 h-4",
                                  star <= review.note
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        {review.commentaire && (
                          <p className="text-sm text-muted-foreground italic">
                            "{review.commentaire}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString("fr-CA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mes avis reçus */}
              {(reviewsRecues.length > 0 || (reviewStats && reviewStats.total_avis > 0)) && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Mes avis reçus
                    </h3>
                    {reviewStats && reviewStats.total_avis > 0 && (
                      <StarRatingDisplay
                        value={reviewStats.note_moyenne}
                        showCount={reviewStats.total_avis}
                        size="sm"
                      />
                    )}
                  </div>

                  {reviewsRecues.length > 0 ? (
                    <div className="space-y-3">
                      {reviewsRecues.slice(0, 3).map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          canRespond={review.peut_repondre}
                          onRespond={handleRespondToReview}
                        />
                      ))}
                      {reviewsRecues.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          Et {reviewsRecues.length - 3} autre(s) avis...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Vous n'avez pas encore reçu d'avis.
                    </p>
                  )}
                </div>
              )}

              {/* Bouton modifier en bas - LOCATAIRES UNIQUEMENT */}
              {isLocataire && (
                <div className="text-center pt-4">
                  <Link to="/profile">
                    <Button className="rounded-xl gradient-match text-white px-8">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier mon profil locataire
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création d'avis */}
      {selectedPendingReview && (
        <ReviewForm
          open={reviewFormOpen}
          onOpenChange={setReviewFormOpen}
          candidatureId={selectedPendingReview.candidature_id}
          reviewedUserName={selectedPendingReview.user_to_review.name}
          typeAvis={selectedPendingReview.type}
          annonceTitre={selectedPendingReview.annonce_titre}
          onSuccess={handleReviewCreated}
        />
      )}

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
