/**
 * Créer Annonce - Version 2 pages v4.0
 * Style épuré, sections séparées, meilleure hiérarchie visuelle
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  MapPin, DollarSign, Home, Calendar, Image, ArrowRight, ArrowLeft,
  Loader2, X, Plus, Check, Sofa, Car, Sparkles, Type
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TYPES_LOGEMENT = ["1½", "2½", "3½", "4½", "5½", "6½+"];

const STATIONNEMENT_OPTIONS = [
  { value: "inclus", label: "Inclus", icon: "✓" },
  { value: "disponible", label: "Disponible (+$)", icon: "$" },
  { value: "non", label: "Non disponible", icon: "✗" },
];

const COMMODITES = [
  { id: "electromenagers_inclus", label: "Électroménagers", icon: "🍳" },
  { id: "chauffage_inclus", label: "Chauffage inclus", icon: "🔥" },
  { id: "eau_incluse", label: "Eau chaude incluse", icon: "💧" },
  { id: "buanderie", label: "Buanderie", icon: "🧺" },
  { id: "balcon", label: "Balcon/Terrasse", icon: "🌿" },
  { id: "animaux_acceptes", label: "Animaux acceptés", icon: "🐾" },
  { id: "sous_sol", label: "Sous-sol", icon: "🏠" },
];

export default function CreerAnnonceSimple() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { isAuthenticated } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    titre: "",
    adresse: "",
    ville: "",
    codePostal: "",
    type: "",
    prix: "",
    dateDisponible: "",
    photos: [] as File[],
    description: "",
    meuble: false,
    stationnement: "non" as "inclus" | "disponible" | "non",
    commodites: [] as string[],
  });

  // Charger les données en mode édition
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
        let typeLogement = "";
        if (annonce.nombre_pieces) {
          const pieces = Math.floor(annonce.nombre_pieces);
          typeLogement = pieces >= 6 ? "6½+" : `${pieces}½`;
        }

        const commodites: string[] = [];
        if (annonce.electromenagers_inclus) commodites.push("electromenagers_inclus");
        if (annonce.chauffage_inclus) commodites.push("chauffage_inclus");
        if (annonce.eau_incluse) commodites.push("eau_incluse");
        if (annonce.buanderie) commodites.push("buanderie");
        if (annonce.balcon) commodites.push("balcon");
        if (annonce.animaux_acceptes) commodites.push("animaux_acceptes");
        if ((annonce as any).sous_sol) commodites.push("sous_sol");

        let stationnement: "inclus" | "disponible" | "non" = "non";
        if (annonce.stationnement) {
          stationnement = "inclus";
        }

        setForm({
          titre: annonce.titre || "",
          adresse: annonce.adresse || "",
          ville: annonce.ville || "",
          codePostal: (annonce as any).code_postal || "",
          type: typeLogement,
          prix: annonce.prix?.toString() || "",
          dateDisponible: annonce.date_disponible || "",
          photos: [],
          description: annonce.description || "",
          meuble: annonce.meuble || false,
          stationnement,
          commodites,
        });

        const images: string[] = [];
        if (annonce.image_url) images.push(annonce.image_url);
        if (annonce.images_supplementaires) images.push(...annonce.images_supplementaires);
        setExistingImages(images);
      } else {
        toast.error("Annonce introuvable");
        navigate('/host/listings');
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
      console.error(error);
      navigate('/host/listings');
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).slice(0, 5 - form.photos.length - existingImages.length);
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleCommodite = (commoditeId: string) => {
    setForm(prev => ({
      ...prev,
      commodites: prev.commodites.includes(commoditeId)
        ? prev.commodites.filter(c => c !== commoditeId)
        : [...prev.commodites, commoditeId]
    }));
  };

  const canProceedStep1 = form.titre && form.adresse && form.ville && form.type && form.prix;
  const canSubmit = canProceedStep1;

  const handleNext = () => {
    if (currentStep === 1 && canProceedStep1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour publier");
      return;
    }

    try {
      setSubmitting(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');

      if (isEditMode && id) {
        const updateData = {
          titre: form.titre,
          adresse: form.adresse,
          ville: form.ville,
          code_postal: form.codePostal || null,
          nombre_pieces: parseInt(form.type.replace('½', '').replace('+', '')) || null,
          prix: form.prix,
          date_disponible: form.dateDisponible || null,
          description: form.description,
          meuble: form.meuble,
          stationnement: form.stationnement !== "non",
          electromenagers_inclus: form.commodites.includes("electromenagers_inclus"),
          chauffage_inclus: form.commodites.includes("chauffage_inclus"),
          eau_incluse: form.commodites.includes("eau_incluse"),
          buanderie: form.commodites.includes("buanderie"),
          balcon: form.commodites.includes("balcon"),
          animaux_acceptes: form.commodites.includes("animaux_acceptes"),
          sous_sol: form.commodites.includes("sous_sol"),
          image_url: existingImages[0] || null,
          images_supplementaires: existingImages.slice(1)
        };

        const response = await fetch(`${API_URL}/api/match/annonces/${id}/update/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify(updateData)
        });

        const data = await response.json();
        if (data.success) {
          toast.success("Annonce mise à jour!");
          navigate('/host/listings');
        } else {
          throw new Error(data.message || data.error || "Erreur");
        }
      } else {
        const formData = new FormData();
        formData.append('titre', form.titre);
        formData.append('adresse', form.adresse);
        formData.append('ville', form.ville);
        if (form.codePostal) formData.append('code_postal', form.codePostal);
        formData.append('type_logement', form.type.replace('½', ' 1/2'));
        formData.append('prix', form.prix);
        if (form.dateDisponible) formData.append('date_disponible', form.dateDisponible);
        if (form.description) formData.append('description', form.description);
        formData.append('meuble', String(form.meuble));
        formData.append('stationnement', String(form.stationnement !== "non"));
        formData.append('electromenagers_inclus', String(form.commodites.includes("electromenagers_inclus")));
        formData.append('chauffage_inclus', String(form.commodites.includes("chauffage_inclus")));
        formData.append('eau_incluse', String(form.commodites.includes("eau_incluse")));
        formData.append('buanderie', String(form.commodites.includes("buanderie")));
        formData.append('balcon', String(form.commodites.includes("balcon")));
        formData.append('animaux_acceptes', String(form.commodites.includes("animaux_acceptes")));
        formData.append('sous_sol', String(form.commodites.includes("sous_sol")));

        form.photos.forEach((photo, i) => {
          formData.append(`photo_${i}`, photo);
        });

        const response = await fetch(`${API_URL}/api/match/annonces/create/`, {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          if (data.address_warning) {
            toast.warning("Annonce publiée! Attention: une autre annonce existe déjà à cette adresse.", {
              duration: 6000,
            });
          } else {
            toast.success("Annonce publiée!");
          }
          navigate('/host');
        } else {
          throw new Error(data.message || "Erreur");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la publication");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 md:pt-20 pb-24 px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 md:pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isEditMode ? "Modifier l'annonce" : "Publier une annonce"}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 1 ? "Informations essentielles" : "Caractéristiques du logement"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                currentStep >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:inline",
                currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
              )}>
                Infos
              </span>
            </div>

            <div className={cn(
              "w-12 h-0.5 transition-colors",
              currentStep >= 2 ? "bg-primary" : "bg-muted"
            )} />

            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                currentStep >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                2
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:inline",
                currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
              )}>
                Détails
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section: Titre & Localisation */}
                  <div className="p-6 space-y-5">
                    {/* Titre */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                        <Type className="w-4 h-4 text-primary" />
                        Titre de l'annonce <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Ex: Beau 4½ lumineux, près du centre"
                        value={form.titre}
                        onChange={(e) => setForm({ ...form, titre: e.target.value })}
                        className="rounded-xl h-12"
                        maxLength={100}
                      />
                    </div>

                    {/* Adresse */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        Adresse <span className="text-destructive">*</span>
                      </label>
                      <AddressAutocomplete
                        value={form.adresse}
                        onChange={(value) => setForm({ ...form, adresse: value })}
                        onSelect={(suggestion) => {
                          setForm({
                            ...form,
                            adresse: suggestion.adresse,
                            ville: suggestion.ville || form.ville,
                            codePostal: suggestion.codePostal || form.codePostal
                          });
                        }}
                        placeholder="Commencez à taper l'adresse..."
                        className="rounded-xl h-12"
                      />
                    </div>

                    {/* Ville + Code postal */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold mb-2.5 block">
                          Ville <span className="text-destructive">*</span>
                        </label>
                        <Input
                          placeholder="Saguenay"
                          value={form.ville}
                          onChange={(e) => setForm({ ...form, ville: e.target.value })}
                          className="rounded-xl h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2.5 block">Code postal</label>
                        <Input
                          placeholder="G7H 1Z3"
                          value={form.codePostal}
                          onChange={(e) => setForm({ ...form, codePostal: e.target.value.toUpperCase() })}
                          className="rounded-xl h-12"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Section: Type & Prix */}
                  <div className="p-6 space-y-5">
                    {/* Type */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Home className="w-4 h-4 text-primary" />
                        Type de logement <span className="text-destructive">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TYPES_LOGEMENT.map((type) => (
                          <button
                            key={type}
                            onClick={() => setForm({ ...form, type })}
                            className={cn(
                              "h-11 min-w-[56px] px-4 rounded-xl text-sm font-medium border transition-all",
                              form.type === type
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-accent/50"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prix + Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                          <DollarSign className="w-4 h-4 text-primary" />
                          Loyer <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="850"
                          value={form.prix}
                          onChange={(e) => setForm({ ...form, prix: e.target.value })}
                          className="rounded-xl h-12"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">$/mois</p>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                          <Calendar className="w-4 h-4 text-primary" />
                          Disponible
                        </label>
                        <Input
                          type="date"
                          value={form.dateDisponible}
                          onChange={(e) => setForm({ ...form, dateDisponible: e.target.value })}
                          className="rounded-xl h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Section: Photos */}
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Image className="w-4 h-4 text-primary" />
                        Photos <span className="text-muted-foreground font-normal text-xs">(max 5)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((url, i) => (
                          <div key={`existing-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeExistingImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {form.photos.map((photo, i) => (
                          <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                            <img src={URL.createObjectURL(photo)} alt={`Nouvelle photo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(existingImages.length + form.photos.length) < 5 && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-6 h-6 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoAdd}
                        className="hidden"
                      />
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="rounded-xl"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={!canProceedStep1}
                        className="rounded-xl"
                      >
                        Suivant
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section: Meublé & Stationnement */}
                  <div className="p-6 space-y-5">
                    {/* Meublé */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Sofa className="w-4 h-4 text-primary" />
                        Logement meublé ?
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setForm({ ...form, meuble: true })}
                          className={cn(
                            "flex-1 h-11 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2",
                            form.meuble
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-accent/50"
                          )}
                        >
                          {form.meuble && <Check className="w-4 h-4" />}
                          Oui, meublé
                        </button>
                        <button
                          onClick={() => setForm({ ...form, meuble: false })}
                          className={cn(
                            "flex-1 h-11 rounded-xl text-sm font-medium border transition-all flex items-center justify-center",
                            !form.meuble
                              ? "bg-muted text-foreground border-muted"
                              : "border-border hover:border-primary/40 hover:bg-accent/50"
                          )}
                        >
                          Non meublé
                        </button>
                      </div>
                    </div>

                    {/* Stationnement */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Car className="w-4 h-4 text-primary" />
                        Stationnement
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {STATIONNEMENT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setForm({ ...form, stationnement: option.value as any })}
                            className={cn(
                              "h-14 rounded-xl text-sm font-medium border transition-all flex flex-col items-center justify-center gap-0.5",
                              form.stationnement === option.value
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-accent/50"
                            )}
                          >
                            <span className="text-base">{option.icon}</span>
                            <span className="text-xs">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Section: Commodités */}
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Commodités incluses
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMMODITES.map((commodite) => (
                          <button
                            key={commodite.id}
                            onClick={() => toggleCommodite(commodite.id)}
                            className={cn(
                              "h-12 px-3 rounded-xl text-sm border transition-all flex items-center gap-2",
                              form.commodites.includes(commodite.id)
                                ? "bg-primary/10 text-primary border-primary"
                                : "border-border hover:border-primary/40 hover:bg-accent/50"
                            )}
                          >
                            <span>{commodite.icon}</span>
                            <span className="text-left text-xs font-medium flex-1">{commodite.label}</span>
                            {form.commodites.includes(commodite.id) && (
                              <Check className="w-4 h-4 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Section: Description & Actions */}
                  <div className="p-6 space-y-5">
                    {/* Description */}
                    <div>
                      <label className="text-sm font-semibold mb-2.5 block">
                        Description <span className="text-muted-foreground font-normal text-xs">(optionnel)</span>
                      </label>
                      <textarea
                        placeholder="Décrivez votre logement: particularités, quartier, transports à proximité..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        maxLength={1000}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 touch-manipulation"
                        style={{ fontSize: '16px' }}
                      />
                      <p className="text-xs text-muted-foreground text-right mt-1">{form.description.length}/1000</p>
                    </div>

                    {/* Résumé */}
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm font-semibold mb-2">Résumé</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium text-foreground">Titre:</span> {form.titre}</p>
                        <p><span className="font-medium text-foreground">Adresse:</span> {form.adresse}, {form.ville}</p>
                        <p>
                          <span className="font-medium text-foreground">Type:</span> {form.type} •{" "}
                          <span className="font-medium text-foreground">Prix:</span> {form.prix}$/mois
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Caractéristiques:</span>{" "}
                          {form.meuble ? "Meublé" : "Non meublé"} •
                          Stationnement {form.stationnement === "inclus" ? "inclus" : form.stationnement === "disponible" ? "disponible" : "non"}
                        </p>
                        {form.commodites.length > 0 && (
                          <p>
                            <span className="font-medium text-foreground">Commodités:</span>{" "}
                            {form.commodites.map(c => COMMODITES.find(x => x.id === c)?.label).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        className="rounded-xl"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {isEditMode ? "Enregistrer" : "Publier l'annonce"}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Étape {currentStep} sur 2
          </p>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
