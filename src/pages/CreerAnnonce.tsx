/**
 * CreerAnnonce - Refonte UX v2.0
 *
 * Utilise CreerAnnonceSimple par défaut.
 * L'ancienne version est conservée ci-dessous.
 */

// Re-export simplified version as default
export { default } from "./CreerAnnonceSimple";

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { BackButton } from "@/components/ui/back-button";
import { ArrowLeft, ArrowRight, Check, MapPin, DollarSign, Home, Camera, FileText, Loader2, Upload, X, Link as LinkIcon, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AuthModal from "@/components/auth/AuthModal";

const STEPS = [
  { id: 1, title: "Adresse", icon: MapPin },
  { id: 2, title: "Type & Prix", icon: Home },
  { id: 3, title: "Description", icon: FileText },
  { id: 4, title: "Photos", icon: Camera },
];

interface AnnonceData {
  adresse: string;
  ville: string;
  quartier: string;
  codePostal: string;
  typeLogement: string;
  nbChambres: string;
  prix: string;
  disponibilite: string;
  titre: string;
  description: string;
  commodites: string[];
  imageUrl: string;
  imagesSupplementaires: string[];
}

export function CreerAnnonceLegacy() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // Afficher le modal d'auth si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supplementaryFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSupplementary, setUploadingSupplementary] = useState(false);

  // Import from URL
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<AnnonceData>({
    adresse: "",
    ville: "",
    quartier: "",
    codePostal: "",
    typeLogement: "",
    nbChambres: "",
    prix: "",
    disponibilite: "",
    titre: "",
    description: "",
    commodites: [],
    imageUrl: "",
    imagesSupplementaires: [],
  });

  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEditMode && id) {
      loadAnnonceData(parseInt(id));
    }
  }, [id, isEditMode]);

  const loadAnnonceData = async (annonceId: number) => {
    try {
      setLoading(true);
      const { getMyAnnonceDetail } = await import('@/lib/matchApi');
      const response = await getMyAnnonceDetail(annonceId);

      if (response.success) {
        const annonce = response.annonce;
        // Map nombre_pieces to typeLogement string
        const typeLogement = annonce.nombre_pieces
          ? `${annonce.nombre_pieces} 1/2`
          : "";

        // Build commodites array from boolean fields
        const commodites: string[] = [];
        if (annonce.stationnement) commodites.push("Stationnement");
        if (annonce.electromenagers_inclus) commodites.push("Électros");
        if (annonce.chauffage_inclus) commodites.push("Chauffage");
        if (annonce.animaux_acceptes) commodites.push("Animaux acceptés");
        if (annonce.meuble) commodites.push("Meublé");
        if (annonce.buanderie) commodites.push("Buanderie");
        if (annonce.balcon) commodites.push("Balcon");
        if (annonce.eau_incluse) commodites.push("Eau incluse");

        const newFormData = {
          adresse: annonce.adresse || "",
          ville: annonce.ville || "",
          quartier: annonce.quartier || "",
          codePostal: "",
          typeLogement,
          nbChambres: annonce.nombre_chambres?.toString() || "",
          prix: annonce.prix?.toString() || "",
          disponibilite: annonce.date_disponible || "",
          titre: annonce.titre || "",
          description: annonce.description || "",
          commodites,
          imageUrl: annonce.image_url || "",
          imagesSupplementaires: annonce.images_supplementaires || [],
        };
        setFormData(newFormData);
      } else {
        toast.error("Erreur: impossible de charger l'annonce");
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement de l'annonce");
      console.error(error);
      navigate("/host");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof AnnonceData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation rules
  const validateStep = (step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.adresse.trim()) {
          stepErrors.adresse = "L'adresse est requise";
        } else if (formData.adresse.trim().length < 5) {
          stepErrors.adresse = "L'adresse doit contenir au moins 5 caractères";
        }
        if (!formData.ville.trim()) {
          stepErrors.ville = "La ville est requise";
        } else if (formData.ville.trim().length < 2) {
          stepErrors.ville = "Nom de ville invalide";
        }
        break;

      case 2:
        if (!formData.typeLogement) {
          stepErrors.typeLogement = "Sélectionnez un type de logement";
        }
        if (!formData.prix) {
          stepErrors.prix = "Le prix est requis";
        } else {
          const prixNum = parseFloat(formData.prix);
          if (isNaN(prixNum) || prixNum <= 0) {
            stepErrors.prix = "Le prix doit être supérieur à 0";
          } else if (prixNum < 100) {
            stepErrors.prix = "Le prix semble trop bas (minimum 100$)";
          } else if (prixNum > 10000) {
            stepErrors.prix = "Le prix semble trop élevé (maximum 10 000$)";
          }
        }
        break;

      case 3:
        if (!formData.titre.trim()) {
          stepErrors.titre = "Le titre est requis";
        } else if (formData.titre.trim().length < 10) {
          stepErrors.titre = "Le titre doit contenir au moins 10 caractères";
        } else if (formData.titre.trim().length > 100) {
          stepErrors.titre = "Le titre est trop long (max 100 caractères)";
        }
        if (!formData.description.trim()) {
          stepErrors.description = "La description est requise";
        } else if (formData.description.trim().length < 50) {
          stepErrors.description = "La description doit contenir au moins 50 caractères pour attirer des locataires";
        }
        break;

      case 4:
        // Photos are optional but recommended
        break;
    }

    return stepErrors;
  };

  const toggleArrayItem = (field: keyof AnnonceData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  // ============================================
  // IMAGE UPLOAD HANDLERS
  // ============================================

  const handleFileUpload = useCallback(async (file: File, isSupplementary: boolean = false) => {
    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image trop volumineuse. Maximum 5MB.');
      return;
    }

    try {
      setUploading(true);
      const { uploadImage } = await import('@/lib/matchApi');
      const response = await uploadImage(file);

      if (response.success && response.url) {
        if (isSupplementary) {
          // Ajouter aux images supplémentaires
          setFormData(prev => ({
            ...prev,
            imagesSupplementaires: [...prev.imagesSupplementaires, response.url!]
          }));
          toast.success('Image ajoutée à la galerie!');
        } else {
          updateFormData('imageUrl', response.url);
          toast.success('Image principale uploadée!');
        }
      } else {
        toast.error(response.error || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleSupplementaryFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadingSupplementary(true);
      // Upload chaque fichier
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i], true);
      }
      setUploadingSupplementary(false);
      // Reset input pour permettre re-upload du même fichier
      if (supplementaryFileInputRef.current) {
        supplementaryFileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload]);

  const handleRemoveImage = useCallback(() => {
    updateFormData('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ============================================
  // IMPORT FROM URL (AI EXTRACTION)
  // ============================================

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    try {
      setImporting(true);
      const { importFromUrl } = await import("@/lib/matchApi");
      const response = await importFromUrl(importUrl);

      if (response.success && response.data) {
        const data = response.data;

        // Pré-remplir le formulaire avec les données extraites
        // images[0] est l'image principale (imageUrl), le reste sont les supplémentaires
        const allImages = data.images || [];
        const mainImage = data.imageUrl || allImages[0] || "";
        const supplementaryImages = allImages.length > 1 ? allImages.slice(1) : [];

        setFormData((prev) => ({
          ...prev,
          titre: data.titre || prev.titre,
          description: data.description || prev.description,
          prix: data.prix ? String(data.prix) : prev.prix,
          ville: data.ville || prev.ville,
          quartier: data.quartier || prev.quartier,
          adresse: data.adresse || prev.adresse,
          typeLogement: data.typeLogement || prev.typeLogement,
          nbChambres: data.nbChambres ? String(data.nbChambres) : prev.nbChambres,
          disponibilite: data.disponibilite || prev.disponibilite,
          commodites: data.commodites && data.commodites.length > 0 ? data.commodites : prev.commodites,
          imageUrl: mainImage || prev.imageUrl,
          imagesSupplementaires: supplementaryImages.length > 0 ? supplementaryImages : prev.imagesSupplementaires,
        }));

        const confidence = data.confidence ? Math.round(data.confidence * 100) : 0;
        const imagesCount = data.images?.length || 0;
        toast.success(
          `✨ Données importées! Confiance: ${confidence}%${imagesCount > 0 ? ` • ${imagesCount} images trouvées` : ""}`
        );
        setShowImportModal(false);
        setImportUrl("");
      } else {
        toast.error(response.error || "Erreur lors de l'import");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const handleNext = () => {
    // Validate current step
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      // Mark all fields as touched to show errors
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const allErrors: Record<string, string> = {};
    for (let step = 1; step <= 3; step++) {
      const stepErrors = validateStep(step);
      Object.assign(allErrors, stepErrors);
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error("Veuillez corriger les erreurs avant de publier");
      return;
    }

    try {
      setSubmitting(true);

      // Parse nombre_pieces from typeLogement
      const nombrePieces = formData.typeLogement
        ? parseFloat(formData.typeLogement.replace(" 1/2", ".5"))
        : null;

      // Build API data
      const apiData = {
        titre: formData.titre,
        description: formData.description,
        prix: parseFloat(formData.prix) || null,
        ville: formData.ville,
        quartier: formData.quartier,
        adresse: formData.adresse,
        nombre_pieces: nombrePieces,
        nombre_chambres: formData.nbChambres ? parseInt(formData.nbChambres) : null,
        date_disponible: formData.disponibilite,
        image_url: formData.imageUrl,
        images_supplementaires: formData.imagesSupplementaires,
        // Commodités
        stationnement: formData.commodites.includes("Stationnement"),
        electromenagers_inclus: formData.commodites.includes("Électros"),
        chauffage_inclus: formData.commodites.includes("Chauffage"),
        animaux_acceptes: formData.commodites.includes("Animaux acceptés"),
        meuble: formData.commodites.includes("Meublé"),
        buanderie: formData.commodites.includes("Buanderie"),
        balcon: formData.commodites.includes("Balcon"),
        eau_incluse: formData.commodites.includes("Eau incluse"),
      };

      if (isEditMode && id) {
        const { updateAnnonce } = await import('@/lib/matchApi');
        const response = await updateAnnonce(parseInt(id), apiData);
        if (response.success) {
          toast.success('Annonce modifiée avec succès!');
          navigate('/host');
        } else {
          toast.error('Erreur: ' + (response as any).error);
        }
      } else {
        const { createAnnonce } = await import('@/lib/matchApi');
        const response = await createAnnonce(apiData);
        if (response.success) {
          toast.success('Annonce créée avec succès!');
          navigate('/host');
        } else {
          toast.error('Erreur: ' + (response as any).error);
        }
      }
    } catch (error: any) {
      console.error('📤 Error:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.adresse && formData.ville;
      case 2:
        return formData.typeLogement && formData.prix;
      case 3:
        return formData.titre && formData.description;
      case 4:
        return true; // Photos optionnelles
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-match" />
          <p className="text-muted-foreground">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-navbar pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BackButton fallbackPath="/match" className="mb-4" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {isEditMode ? "Modifier l'annonce" : "Publier une annonce"}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {isEditMode
                    ? "Mettez à jour les informations de votre annonce"
                    : "Trouvez votre locataire idéal en quelques minutes"
                  }
                </p>
              </div>

              {/* Création manuelle uniquement */}
            </div>
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
            {/* Step 1: Adresse */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Où se trouve votre logement ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Entrez l'adresse complète de votre propriété
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adresse">Adresse complète *</Label>
                    <Input
                      id="adresse"
                      placeholder="123 Rue Principale"
                      value={formData.adresse}
                      onChange={(e) => updateFormData("adresse", e.target.value)}
                      onBlur={() => markTouched("adresse")}
                      className={cn("rounded-xl h-12", errors.adresse && touched.adresse && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.adresse && touched.adresse && (
                      <p className="text-sm text-destructive mt-1">{errors.adresse}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ville">Ville *</Label>
                      <Input
                        id="ville"
                        placeholder="Chicoutimi"
                        value={formData.ville}
                        onChange={(e) => updateFormData("ville", e.target.value)}
                        onBlur={() => markTouched("ville")}
                        className={cn("rounded-xl h-12", errors.ville && touched.ville && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.ville && touched.ville && (
                        <p className="text-sm text-destructive mt-1">{errors.ville}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quartier">Quartier</Label>
                      <Input
                        id="quartier"
                        placeholder="Centre-ville"
                        value={formData.quartier}
                        onChange={(e) => updateFormData("quartier", e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Type & Prix */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Type de logement et prix</h2>
                  <p className="text-sm text-muted-foreground">
                    Décrivez votre propriété
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Type de logement *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {["1 1/2", "2 1/2", "3 1/2", "4 1/2", "5 1/2", "6 1/2+"].map((type) => (
                        <button
                          key={type}
                          onClick={() => updateFormData("typeLogement", type)}
                          className={cn(
                            "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors",
                            formData.typeLogement === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50",
                            errors.typeLogement && touched.typeLogement && !formData.typeLogement && "border-destructive"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.typeLogement && touched.typeLogement && (
                      <p className="text-sm text-destructive mt-1">{errors.typeLogement}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nbChambres">Nombre de chambres</Label>
                      <Input
                        id="nbChambres"
                        type="number"
                        placeholder="1"
                        value={formData.nbChambres}
                        onChange={(e) => updateFormData("nbChambres", e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prix">Prix mensuel ($/mois) *</Label>
                      <Input
                        id="prix"
                        type="number"
                        placeholder="800"
                        value={formData.prix}
                        onChange={(e) => updateFormData("prix", e.target.value)}
                        onBlur={() => markTouched("prix")}
                        className={cn("rounded-xl h-12", errors.prix && touched.prix && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.prix && touched.prix && (
                        <p className="text-sm text-destructive mt-1">{errors.prix}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="disponibilite">Date de disponibilité</Label>
                    <Input
                      id="disponibilite"
                      type="text"
                      placeholder="Disponible immédiatement"
                      value={formData.disponibilite}
                      onChange={(e) => updateFormData("disponibilite", e.target.value)}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div>
                    <Label>Commodités incluses</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["Stationnement", "Électros", "Chauffage", "Buanderie", "Animaux acceptés", "Meublé", "Balcon", "Eau incluse"].map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleArrayItem("commodites", item)}
                          className={cn(
                            "px-3 py-2 rounded-xl border-2 text-sm transition-colors",
                            formData.commodites.includes(item)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Décrivez votre logement</h2>
                  <p className="text-sm text-muted-foreground">
                    Une bonne description attire plus de locataires qualifiés
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="titre">Titre de l'annonce *</Label>
                      <span className={cn(
                        "text-xs",
                        formData.titre.length < 10 ? "text-muted-foreground" :
                        formData.titre.length > 100 ? "text-destructive" : "text-green-600"
                      )}>
                        {formData.titre.length}/100
                      </span>
                    </div>
                    <Input
                      id="titre"
                      placeholder="Beau 3 1/2 au centre-ville"
                      value={formData.titre}
                      onChange={(e) => updateFormData("titre", e.target.value)}
                      onBlur={() => markTouched("titre")}
                      maxLength={100}
                      className={cn("rounded-xl h-12", errors.titre && touched.titre && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.titre && touched.titre && (
                      <p className="text-sm text-destructive mt-1">{errors.titre}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description">Description complète *</Label>
                      <span className={cn(
                        "text-xs",
                        formData.description.length < 50 ? "text-muted-foreground" : "text-green-600"
                      )}>
                        {formData.description.length} caractères {formData.description.length < 50 && "(min. 50)"}
                      </span>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre logement en détail : caractéristiques, emplacement, proximité des services..."
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      onBlur={() => markTouched("description")}
                      className={cn("rounded-xl min-h-[200px]", errors.description && touched.description && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.description && touched.description ? (
                      <p className="text-sm text-destructive mt-1">{errors.description}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        Plus votre description est détaillée, plus vous recevrez de candidatures qualifiées
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Photo de couverture</h2>
                  <p className="text-sm text-muted-foreground">
                    Les annonces avec photos reçoivent 5x plus de candidatures
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Si pas encore d'image, afficher la zone d'upload */}
                  {!formData.imageUrl ? (
                    <>
                      {/* Zone de drag & drop */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={cn(
                          "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                          isDragging && "border-primary bg-primary/5 scale-[1.02]",
                          uploading && "opacity-50 cursor-wait",
                          !isDragging && !uploading && "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileInputChange}
                          className="hidden"
                          disabled={uploading}
                        />

                        {uploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm font-medium">Upload en cours...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {isDragging ? "Déposez l'image ici" : "Glissez-déposez une image"}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                ou <span className="text-primary font-medium">cliquez pour parcourir</span>
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG, WebP ou GIF • Maximum 5MB
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Basculer vers mode URL */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <button
                          type="button"
                          onClick={() => setUseUrlMode(!useUrlMode)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {useUrlMode ? "Masquer le champ URL" : "Utiliser une URL à la place"}
                        </button>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      {/* Champ URL (optionnel) */}
                      {useUrlMode && (
                        <div>
                          <Label htmlFor="imageUrl">URL de l'image</Label>
                          <Input
                            id="imageUrl"
                            placeholder="https://exemple.com/image.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => updateFormData("imageUrl", e.target.value)}
                            className="rounded-xl h-12"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Collez l'URL d'une image hébergée en ligne
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Aperçu de l'image uploadée */
                    <div className="space-y-3">
                      <Label>Aperçu de l'image</Label>
                      <div className="relative rounded-2xl overflow-hidden border border-border group">
                        <img
                          src={formData.imageUrl}
                          alt="Aperçu"
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
                          }}
                        />
                        {/* Overlay avec bouton supprimer */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveImage}
                            className="rounded-xl"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Survolez l'image pour la supprimer et en choisir une autre
                      </p>
                    </div>
                  )}

                  {/* Section Images supplémentaires - Toujours visible si image principale existe */}
                  {formData.imageUrl && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Images supplémentaires ({formData.imagesSupplementaires.length})</Label>
                        {formData.imagesSupplementaires.length > 0 && (
                          <button
                            type="button"
                            onClick={() => updateFormData("imagesSupplementaires", [])}
                            className="text-xs text-destructive hover:underline"
                          >
                            Tout supprimer
                          </button>
                        )}
                      </div>

                      {/* Input file caché pour images supplémentaires */}
                      <input
                        ref={supplementaryFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleSupplementaryFileInputChange}
                        className="hidden"
                        multiple
                        disabled={uploadingSupplementary}
                      />

                      {/* Grille des images + bouton ajouter */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {formData.imagesSupplementaires.map((imgUrl, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                          >
                            <img
                              src={imgUrl}
                              alt={`Image ${index + 2}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
                              }}
                            />
                            {/* Overlay avec bouton supprimer */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.imagesSupplementaires.filter((_, i) => i !== index);
                                  updateFormData("imagesSupplementaires", newImages);
                                }}
                                className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Badge position */}
                            <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 2}
                            </div>
                          </div>
                        ))}

                        {/* Bouton Ajouter plus d'images */}
                        <button
                          type="button"
                          onClick={() => !uploadingSupplementary && supplementaryFileInputRef.current?.click()}
                          disabled={uploadingSupplementary}
                          className={cn(
                            "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all",
                            uploadingSupplementary
                              ? "border-muted cursor-wait opacity-50"
                              : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                          )}
                        >
                          {uploadingSupplementary ? (
                            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Ajouter</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Ajoutez jusqu'à 10 photos pour montrer votre logement sous tous les angles
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
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

              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="rounded-xl gradient-match text-white"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl gradient-match text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? 'Modification...' : 'Publication...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? 'Sauvegarder' : "Publier l'annonce"}
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Étape {currentStep} sur {STEPS.length}
          </div>
        </div>
      </div>

      <MobileNav />
      <div className="h-16 md:hidden" />

      {/* Auth Modal - Affiché si utilisateur non connecté */}
      <AuthModal
        open={showAuthModal && !isAuthenticated}
        onClose={() => {
          setShowAuthModal(false);
          // Rediriger vers la page pour propriétaires si l'utilisateur ferme sans se connecter
          if (!isAuthenticated) {
            navigate('/pour-proprietaires');
          }
        }}
        trigger="host"
        defaultMode="signup"
        redirectTo="/host/listing/new"
      />
    </div>
  );
}
