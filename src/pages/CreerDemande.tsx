/**
 * CreerDemande - Refonte UX v2.0
 *
 * Utilise CreerDemandeSimple par défaut.
 * L'ancienne version est conservée ci-dessous.
 */

// Re-export simplified version as default
export { default } from "./CreerDemandeSimple";

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { BackButton } from "@/components/ui/back-button";
import { ArrowLeft, ArrowRight, Check, MapPin, DollarSign, Home, Calendar, User, UserPlus, Mail, Phone, Shield, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDemandes } from "@/hooks/useDemandes";
import { toast } from "sonner";
import AuthModal from "@/components/auth/AuthModal";

// Steps de base (1-5) pour tous les users
const BASE_STEPS = [
  { id: 1, title: "Localisation", icon: MapPin },
  { id: 2, title: "Budget", icon: DollarSign },
  { id: 3, title: "Type de logement", icon: Home },
  { id: 4, title: "Date d'emménagement", icon: Calendar },
  { id: 5, title: "À propos de vous", icon: User },
];

// Step 6 seulement pour les users non connectés
const GUEST_STEP = { id: 6, title: "Finaliser", icon: UserPlus };

// Interface pour les données de quartier depuis l'API
interface QuartierInfo {
  nom: string;
  pres_ecole: boolean;
  ecole?: string;
}

interface CityInfo {
  quartiers: QuartierInfo[];
  education?: {
    cegeps?: string[];
    universites?: string[];
  };
  has_cegep: boolean;
  has_university: boolean;
}

interface DemandeData {
  ville: string;
  quartiers: string[];
  budgetMin: string;
  budgetMax: string;
  typeLogement: string[];
  nombreChambres: string;
  dateEmmenagement: string;
  description: string;
  occupation: string;
  nombreOccupants: string;
  // Champs guest (step 6 pour non-connectés)
  guestEmail: string;
  guestPhone: string;
  accepteContact: boolean;
}

export function CreerDemandeLegacy() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { createDemande, createGuestDemande, loading: submitting } = useDemandes();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // State pour les données de ville depuis l'API
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [loadingCity, setLoadingCity] = useState(false);

  const [formData, setFormData] = useState<DemandeData>({
    ville: "",
    quartiers: [],
    budgetMin: "",
    budgetMax: "",
    typeLogement: [],
    nombreChambres: "",
    dateEmmenagement: "",
    description: "",
    occupation: "",
    nombreOccupants: "1",
    // Guest fields
    guestEmail: "",
    guestPhone: "",
    accepteContact: false,
  });

  // Steps dynamiques selon l'état de connexion
  const STEPS = isAuthenticated ? BASE_STEPS : [...BASE_STEPS, GUEST_STEP];
  const totalSteps = STEPS.length;

  // Ref pour éviter la double soumission
  const hasSubmittedPending = useRef(false);

  // Restaurer le formulaire depuis localStorage au montage (si retour après OAuth interrompu)
  useEffect(() => {
    const pendingData = localStorage.getItem('pending_demande');
    if (pendingData && !isAuthenticated) {
      try {
        const parsed = JSON.parse(pendingData);
        setFormData(parsed);
        // Restaurer aussi l'étape (dernière étape avant OAuth = étape 6 pour guest)
        setCurrentStep(6);
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effet pour récupérer et soumettre automatiquement une demande en attente après connexion
  useEffect(() => {
    const checkPendingDemande = async () => {
      if (isAuthenticated && !hasSubmittedPending.current) {
        const pendingData = localStorage.getItem('pending_demande');
        if (pendingData) {
          try {
            const parsed = JSON.parse(pendingData);
            // Restaurer les données du formulaire
            setFormData(parsed);
            // Marquer comme en cours de soumission
            hasSubmittedPending.current = true;
            // Soumettre automatiquement après un court délai (pour que l'état soit mis à jour)
            toast.info('Création de votre demande en cours...');
            setTimeout(async () => {
              try {
                await createDemande({
                  ville: parsed.ville,
                  quartiers: parsed.quartiers,
                  budgetMax: parseFloat(parsed.budgetMax),
                  typeLogement: parsed.typeLogement,
                  nombreChambres: parsed.nombreChambres ? parseInt(parsed.nombreChambres) : undefined,
                  dateEmmenagement: parsed.dateEmmenagement,
                  description: parsed.description,
                  occupation: parsed.occupation,
                  nombreOccupants: parseInt(parsed.nombreOccupants),
                });
                localStorage.removeItem('pending_demande');
                toast.success('Demande créée avec succès!');
                navigate('/dashboard');
              } catch (error: any) {
                toast.error(error.message || 'Erreur lors de la création de la demande');
                hasSubmittedPending.current = false;
              }
            }, 500);
          } catch (e) {
            localStorage.removeItem('pending_demande');
          }
        }
      }
    };
    checkPendingDemande();
  }, [isAuthenticated]);

  // Fetch city info when ville changes (avec debounce)
  useEffect(() => {
    const fetchCityInfo = async () => {
      if (!formData.ville || formData.ville.length < 3) {
        setCityInfo(null);
        return;
      }

      setLoadingCity(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // Détecter si l'utilisateur est étudiant pour trier par proximité école
        const isStudent = formData.occupation?.toLowerCase().includes('étudiant') ||
                          formData.occupation?.toLowerCase().includes('etudiant') ||
                          formData.occupation?.toLowerCase().includes('student');

        const response = await fetch(
          `${API_URL}/api/match/villes/${encodeURIComponent(formData.ville.toLowerCase())}/info/?for_student=${isStudent}`,
          {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCityInfo(data.data);
          } else {
            setCityInfo(null);
          }
        } else {
          setCityInfo(null);
        }
      } catch (error) {
        console.error('Error fetching city info:', error);
        setCityInfo(null);
      } finally {
        setLoadingCity(false);
      }
    };

    // Debounce de 300ms pour éviter trop de requêtes
    const timeoutId = setTimeout(fetchCityInfo, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.ville, formData.occupation]);

  const updateFormData = (field: keyof DemandeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof DemandeData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handler pour créer un compte depuis step 6
  const handleCreateAccount = () => {
    // Sauvegarder les données du formulaire dans localStorage pour les récupérer après inscription
    localStorage.setItem('pending_demande', JSON.stringify(formData));
    setShowAuthModal(true);
  };

  // Callback après connexion/inscription réussie (email/password)
  const handleAuthSuccess = async () => {
    setShowAuthModal(false);

    // IMPORTANT: Marquer comme soumis ET supprimer du localStorage AVANT tout
    // pour éviter que le useEffect ne soumette aussi la demande (double soumission)
    hasSubmittedPending.current = true;
    localStorage.removeItem('pending_demande');

    // Définir automatiquement user_type = 'locataire' (l'utilisateur a créé une demande, donc c'est un locataire)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');

      await fetch(`${API_URL}/api/auth/profile/type/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ user_type: 'locataire' }),
      });

      // Pré-remplir le profil avec les données de la demande
      const profileData: any = {
        villes_preferees: formData.ville ? [formData.ville] : [],
        accepte_contact_proprietaires: true,
      };
      if (formData.budgetMax) profileData.budget_max = formData.budgetMax;
      if (formData.budgetMin) profileData.budget_min = formData.budgetMin;
      if (formData.typeLogement.length > 0) profileData.type_logement = formData.typeLogement;
      if (formData.occupation) profileData.situation = formData.occupation;
      if (formData.nombreOccupants) profileData.nb_occupants = formData.nombreOccupants;

      await fetch(`${API_URL}/api/match/profil/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
    } catch (e) {
      console.warn("Erreur lors de la configuration du profil:", e);
      // Continuer quand même - la demande peut être créée
    }

    // Soumettre la demande maintenant que l'user est connecté
    await handleSubmit();
  };

  // Soumission pour utilisateur connecté
  const handleSubmit = async () => {
    try {
      await createDemande({
        ville: formData.ville,
        quartiers: formData.quartiers,
        budgetMax: parseFloat(formData.budgetMax),
        typeLogement: formData.typeLogement,
        nombreChambres: formData.nombreChambres ? parseInt(formData.nombreChambres) : undefined,
        dateEmmenagement: formData.dateEmmenagement,
        description: formData.description,
        occupation: formData.occupation,
        nombreOccupants: parseInt(formData.nombreOccupants),
      });

      // Nettoyer le localStorage si on avait sauvegardé une demande en attente
      localStorage.removeItem('pending_demande');

      toast.success('Demande créée avec succès!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la demande');
    }
  };

  // Soumission pour guest (sans compte)
  const handleGuestSubmit = async () => {
    // Validation
    if (!formData.guestEmail && !formData.guestPhone) {
      toast.error('Veuillez fournir au moins un moyen de contact (email ou téléphone)');
      return;
    }
    if (!formData.accepteContact) {
      toast.error('Vous devez accepter d\'être contacté par les propriétaires');
      return;
    }

    try {
      await createGuestDemande({
        ville: formData.ville,
        quartiers: formData.quartiers,
        budgetMax: parseFloat(formData.budgetMax),
        typeLogement: formData.typeLogement,
        nombreChambres: formData.nombreChambres ? parseInt(formData.nombreChambres) : undefined,
        dateEmmenagement: formData.dateEmmenagement,
        description: formData.description,
        occupation: formData.occupation,
        nombreOccupants: parseInt(formData.nombreOccupants),
        // Champs guest
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
      });

      toast.success('Demande publiée! Les propriétaires pourront vous contacter directement.');
      // Rediriger vers une page de confirmation
      navigate('/demande/confirmation');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la demande');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.ville.trim() !== "";
      case 2:
        return formData.budgetMax.trim() !== "";
      case 3:
        return formData.typeLogement.length > 0;
      case 4:
        return formData.dateEmmenagement.trim() !== "";
      case 5:
        return true; // Description optionnelle
      case 6:
        // Guest step - validation faite dans handleGuestSubmit
        return true;
      default:
        return false;
    }
  };

  // Vérifie si on est à la dernière étape du formulaire (avant choix compte/guest)
  const isLastFormStep = currentStep === 5;
  // Vérifie si on est à l'étape guest (step 6)
  const isGuestStep = currentStep === 6 && !isAuthenticated;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-navbar pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BackButton fallbackPath="/dashboard" className="mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Créer une demande de logement</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Décrivez votre logement idéal et recevez des propositions de propriétaires
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isActive && "border-primary bg-primary text-white",
                        isCompleted && "border-green-500 bg-green-500 text-white",
                        !isActive && !isCompleted && "border-muted bg-background text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 mx-1 sm:mx-2 transition-colors",
                          isCompleted ? "bg-green-500" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {STEPS.map((step) => (
                <div key={step.id} className="flex-1 text-center hidden sm:block">
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 shadow-soft border border-border">
            {/* Step 1: Localisation */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Où cherchez-vous un logement ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Indiquez la ville et les quartiers qui vous intéressent
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ville">Ville *</Label>
                    <Input
                      id="ville"
                      placeholder="Ex: Chicoutimi, Québec, Montréal..."
                      value={formData.ville}
                      onChange={(e) => updateFormData("ville", e.target.value)}
                      className="rounded-xl h-12"
                    />
                  </div>

                  {/* Quartiers dynamiques depuis l'API */}
                  {loadingCity && (
                    <div className="text-sm text-muted-foreground animate-pulse">
                      Chargement des quartiers...
                    </div>
                  )}

                  {!loadingCity && cityInfo && cityInfo.quartiers.length > 0 && (
                    <div>
                      <Label>Quartiers préférés (optionnel)</Label>

                      {/* Info éducation si disponible */}
                      {(cityInfo.has_cegep || cityInfo.has_university) && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mt-2 mb-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">🎓</span>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>{formData.ville}</strong> possède{' '}
                              {cityInfo.has_cegep && cityInfo.has_university
                                ? 'un cégep et une université'
                                : cityInfo.has_cegep
                                ? 'un cégep'
                                : 'une université'}
                              . Les quartiers près des écoles sont marqués avec 🎓.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {cityInfo.quartiers.map((quartier) => (
                          <button
                            key={quartier.nom}
                            onClick={() => toggleArrayItem("quartiers", quartier.nom)}
                            className={cn(
                              "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors text-left",
                              formData.quartiers.includes(quartier.nom)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              {quartier.nom}
                              {quartier.pres_ecole && (
                                <span title={quartier.ecole || 'Près d\'une école'} className="text-base">🎓</span>
                              )}
                            </span>
                            {quartier.pres_ecole && quartier.ecole && (
                              <span className="text-xs text-muted-foreground block mt-0.5 truncate">
                                {quartier.ecole}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Budget */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Quel est votre budget ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Indiquez votre budget mensuel pour le loyer
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetMin">Budget minimum (optionnel)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="Ex: 500"
                      value={formData.budgetMin}
                      onChange={(e) => updateFormData("budgetMin", e.target.value)}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budgetMax">Budget maximum *</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="Ex: 800"
                      value={formData.budgetMax}
                      onChange={(e) => updateFormData("budgetMax", e.target.value)}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Astuce:</strong> Les logements entre 600$ et 900$ par mois sont les plus courants dans votre région.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Type de logement */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Quel type de logement ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez un ou plusieurs types
                  </p>
                </div>

                <div>
                  <Label>Type de logement *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {["1 1/2", "2 1/2", "3 1/2", "4 1/2", "5 1/2", "6 1/2+"].map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleArrayItem("typeLogement", type)}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors",
                          formData.typeLogement.includes(type)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="nombreChambres">Nombre de chambres minimum (optionnel)</Label>
                  <Input
                    id="nombreChambres"
                    type="number"
                    placeholder="Ex: 1"
                    value={formData.nombreChambres}
                    onChange={(e) => updateFormData("nombreChambres", e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Date d'emménagement */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Quand souhaitez-vous emménager ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Choisissez une date ou indiquez si vous êtes flexible
                  </p>
                </div>

                {/* Dates rapides */}
                <div>
                  <Label>Dates populaires</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(() => {
                      const today = new Date();
                      const year = today.getFullYear();
                      const nextYear = year + 1;
                      // Si on est après juillet, proposer l'année prochaine
                      const targetYear = today.getMonth() >= 6 ? nextYear : year;

                      return [
                        { label: "1er juillet", value: `${targetYear}-07-01` },
                        { label: "1er août", value: `${targetYear}-08-01` },
                        { label: "1er septembre", value: `${targetYear}-09-01` },
                        { label: "Immédiatement", value: today.toISOString().split('T')[0] },
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() => updateFormData("dateEmmenagement", option.value)}
                          className={cn(
                            "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors",
                            formData.dateEmmenagement === option.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {option.label}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Date personnalisée */}
                <div>
                  <Label htmlFor="dateEmmenagement">Ou choisir une date précise</Label>
                  <Input
                    id="dateEmmenagement"
                    type="date"
                    value={formData.dateEmmenagement}
                    onChange={(e) => updateFormData("dateEmmenagement", e.target.value)}
                    className="rounded-xl h-12 mt-2"
                  />
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Astuce:</strong> Au Québec, la plupart des baux commencent le 1er juillet.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: À propos */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Parlez-nous de vous</h2>
                  <p className="text-sm text-muted-foreground">
                    Ces informations aident les propriétaires à mieux vous connaître
                  </p>
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation (optionnel)</Label>
                  <Input
                    id="occupation"
                    placeholder="Ex: Étudiant, Professionnel, Retraité..."
                    value={formData.occupation}
                    onChange={(e) => updateFormData("occupation", e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="nombreOccupants">Nombre d'occupants</Label>
                  <Input
                    id="nombreOccupants"
                    type="number"
                    min="1"
                    value={formData.nombreOccupants}
                    onChange={(e) => updateFormData("nombreOccupants", e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Message aux propriétaires (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Présentez-vous brièvement et expliquez ce que vous recherchez..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="rounded-xl min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Un message personnalisé augmente vos chances de recevoir des réponses
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Finaliser (seulement pour non-connectés) */}
            {isGuestStep && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Comment souhaitez-vous continuer ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Choisissez comment vous souhaitez gérer votre demande
                  </p>
                </div>

                {/* Option 1: Créer un compte */}
                <button
                  onClick={handleCreateAccount}
                  className="w-full group p-5 rounded-2xl border-2 border-violet-500 hover:border-violet-600 bg-gradient-to-r from-violet-500/10 to-violet-500/5 hover:from-violet-500/15 hover:to-violet-500/10 transition-all text-left relative"
                >
                  <div className="absolute -top-2 right-4 px-3 py-0.5 bg-violet-500 text-white text-xs font-semibold rounded-full">
                    Recommandé
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                      <UserPlus className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Créer un compte gratuit</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Modifier votre demande à tout moment
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Recevoir des alertes pour de nouvelles annonces
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Messagerie intégrée avec les propriétaires
                        </li>
                      </ul>
                    </div>
                    <ArrowRight className="w-5 h-5 text-violet-500 group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
                  </div>
                </button>

                {/* Séparateur */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Option 2: Continuer sans compte */}
                <div className="p-5 rounded-2xl border border-border bg-muted/30">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Continuer sans compte</h3>
                      <p className="text-sm text-muted-foreground">
                        Les propriétaires vous contacteront directement par email ou téléphone
                      </p>
                    </div>
                  </div>

                  {/* Avertissement */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Attention :</strong> Sans compte, vous ne pourrez pas modifier ou supprimer votre demande ultérieurement.
                      </div>
                    </div>
                  </div>

                  {/* Formulaire guest */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="guestEmail">Email *</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.guestEmail}
                        onChange={(e) => updateFormData("guestEmail", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="guestPhone">Téléphone (optionnel)</Label>
                      <Input
                        id="guestPhone"
                        type="tel"
                        placeholder="(418) 555-0123"
                        value={formData.guestPhone}
                        onChange={(e) => updateFormData("guestPhone", e.target.value)}
                        className="rounded-xl h-11"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Augmente vos chances d'être contacté rapidement
                      </p>
                    </div>

                    {/* Consentement */}
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.accepteContact}
                          onChange={(e) => updateFormData("accepteContact", e.target.checked)}
                          className="w-5 h-5 rounded border-violet-500 text-violet-500 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium">J'accepte que mes coordonnées soient partagées avec les propriétaires intéressés</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Votre email{formData.guestPhone ? ' et téléphone seront' : ' sera'} visible uniquement pour les propriétaires ayant un logement correspondant à vos critères.
                          </p>
                        </div>
                      </label>
                    </div>

                    <Button
                      onClick={handleGuestSubmit}
                      disabled={submitting || !formData.guestEmail || !formData.accepteContact}
                      className="w-full rounded-xl h-12"
                      variant="outline"
                    >
                      {submitting ? 'Publication en cours...' : 'Publier sans compte'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Cachés sur l'étape 6 (les actions sont dans le contenu) */}
            {!isGuestStep && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>

                {/* User connecté à l'étape 5 → Publier directement */}
                {isAuthenticated && isLastFormStep ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-xl gradient-search text-white"
                  >
                    {submitting ? 'Création en cours...' : 'Publier ma demande'}
                    {!submitting && <Check className="w-4 h-4 ml-2" />}
                  </Button>
                ) : (
                  /* User non-connecté ou pas à la dernière étape → Suivant */
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="rounded-xl gradient-search text-white"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {/* Bouton Précédent seul sur l'étape 6 */}
            {isGuestStep && (
              <div className="mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </div>
        </div>
      </div>

      {/* Auth Modal pour création de compte */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        trigger="login"
        defaultMode="signup"
      />

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
