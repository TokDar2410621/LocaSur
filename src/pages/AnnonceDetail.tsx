/**
 * Page Détail Annonce Search - Affiche les détails d'une annonce externe
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  MapPin,
  DollarSign,
  Home,
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Loader2,
  MessageSquare,
  XCircle,
  CheckCircle,
  BadgeCheck,
  Clock,
  Eye,
  FileSearch,
  Edit2,
  Send,
  AlertTriangle
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";
import { PublicProfileModal } from "@/components/profile/PublicProfileModal";

export default function AnnonceDetail() {
  const { id, slug, ville } = useParams<{ id?: string; slug?: string; ville?: string }>();
  
  // Extraire l'ID: soit directement depuis /listing/:id, soit depuis le slug SEO /logement/:ville/:slug-:id
  const annonceId = id || (slug?.match(/-(\d+)$/)?.[1]);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [annonce, setAnnonce] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [applying, setApplying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [candidatureStatut, setCandidatureStatut] = useState<string | null>(null);
  const [candidatureId, setCandidatureId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showPostulerInfoModal, setShowPostulerInfoModal] = useState(false);
  const [pendingPostuler, setPendingPostuler] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [contactingOwner, setContactingOwner] = useState(false);

  // Clé localStorage pour l'action en attente
  const PENDING_ACTION_KEY = 'housing_pending_action';

  // Track carousel slide changes
  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    fetchAnnonceDetail();
  }, [id]);

  // Vérifier s'il y a une action en attente après connexion
  useEffect(() => {
    if (isAuthenticated && id) {
      const pendingAction = localStorage.getItem(PENDING_ACTION_KEY);
      if (pendingAction) {
        try {
          const action = JSON.parse(pendingAction);
          // Vérifier que c'est pour cette annonce et pas expiré (15 min)
          if (action.annonceId === annonceId && action.action === 'postuler' && Date.now() - action.timestamp < 15 * 60 * 1000) {
            localStorage.removeItem(PENDING_ACTION_KEY);
            setPendingPostuler(true);
            toast.success("Vous pouvez maintenant postuler !");
          } else {
            // Action expirée ou pour une autre annonce
            localStorage.removeItem(PENDING_ACTION_KEY);
          }
        } catch {
          localStorage.removeItem(PENDING_ACTION_KEY);
        }
      }
    }
  }, [isAuthenticated, id]);

  const fetchAnnonceDetail = async () => {
    try {
      setLoading(true);

      // D'abord, essayer l'API search pour avoir les données de base
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/search/annonces/${annonceId}/`,
        {
          credentials: 'include',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Annonce introuvable');
      }

      const data = await response.json();

      // Si c'est une annonce housing_match, utiliser l'API match pour avoir les infos complètes
      if (data.source === 'housing_match') {
        try {
          const { getAnnonceDetail } = await import('@/lib/matchApi');
          const matchResponse = await getAnnonceDetail(Number(annonceId));

          if (matchResponse.success) {
            const matchData = matchResponse.annonce;
            // Fusionner les données - matchData a priorité pour les champs spécifiques
            const mergedData = {
              ...data,
              is_housing_match: true,
              is_active: matchData.is_active,
              is_owner: matchData.is_owner,
              proprietaire: matchData.proprietaire,
              candidature_envoyee: matchData.candidature_envoyee,
              candidature_statut: matchData.candidature_statut,
              candidature_id: matchData.candidature_id,
            };
            setAnnonce(mergedData);
            setIsFavorite(data.is_favorite || false);
            setHasApplied(matchData.candidature_envoyee || false);
            setCandidatureStatut(matchData.candidature_statut || null);
            setCandidatureId(matchData.candidature_id || null);
            return;
          }
        } catch (matchError) {
          console.error('Erreur API match, fallback sur données search:', matchError);
        }
      }

      // Fallback: utiliser les données search directement
      setAnnonce({
        ...data,
        is_housing_match: data.source === 'housing_match',
        is_active: data.status === 'active' || data.status === 'new',
      });
      setIsFavorite(data.is_favorite || false);
      setHasApplied(data.has_applied || false);
    } catch (error: any) {
      toast.error("Erreur lors du chargement de l'annonce");
      console.error(error);
      setAnnonce(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour sauvegarder des favoris");
      setAuthModalOpen(true);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/search/favorites/toggle/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ annonce_id: annonceId })
      });

      const data = await response.json();

      if (data.success) {
        const wasNotFavorite = !isFavorite;
        setIsFavorite(!isFavorite);

        // Trigger animation only when adding to favorites
        if (wasNotFavorite) {
          setFavoriteAnimating(true);
          setTimeout(() => setFavoriteAnimating(false), 800);
        }

        toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
      } else {
        throw new Error(data.message || "Erreur");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handlePostuler = async () => {
    if (!isAuthenticated) {
      setShowPostulerInfoModal(true);
      return;
    }

    try {
      setApplying(true);
      const { createCandidature } = await import('@/lib/matchApi');
      const response = await createCandidature({
        annonce_id: Number(annonceId),
        message: ""
      });

      if (response.success) {
        setHasApplied(true);
        setCandidatureStatut('en_attente');
        setCandidatureId(response.candidature_id);
        toast.success("Candidature envoyée avec succès !");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la candidature");
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: annonce.titre,
        text: `${annonce.prix}$/mois - ${annonce.type_logement} à ${annonce.ville}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  const handleContactOwner = async () => {
    if (!annonce?.proprietaire?.id) {
      toast.error("Impossible de contacter le propriétaire");
      return;
    }

    try {
      setContactingOwner(true);
      const { startConversationWithUser } = await import('@/lib/matchApi');
      // Passer l'ID de l'annonce pour avoir le contexte dans la conversation
      const response = await startConversationWithUser(annonce.proprietaire.id, Number(annonceId));

      if (response.success && response.conversation) {
        // Naviguer vers la page messages avec l'ID de la conversation et le contexte
        navigate('/messages', {
          state: {
            conversationId: response.conversation.id,
            annonceContext: response.annonce_context,
            suggestedMessage: response.suggested_message
          }
        });
      } else {
        throw new Error("Échec de la création de la conversation");
      }
    } catch (error: any) {
      console.error('Erreur contact propriétaire:', error);
      toast.error(error.message || "Erreur lors du contact");
    } finally {
      setContactingOwner(false);
    }
  };

  const handleCancelClick = () => {
    if (!candidatureId) return;
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!candidatureId) return;

    try {
      setCancelling(true);
      setShowCancelDialog(false);
      const { annulerCandidature } = await import('@/lib/matchApi');
      const response = await annulerCandidature(candidatureId);

      if (response.success) {
        setCandidatureStatut('annulee');
        toast.success("Candidature annulée");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  // Helper pour obtenir les infos de statut
  const getStatutInfo = (statut: string | null) => {
    switch (statut) {
      case 'en_attente':
        return { label: 'En attente de réponse', color: 'yellow', icon: Clock };
      case 'vue':
        return { label: 'Vue par le propriétaire', color: 'blue', icon: Eye };
      case 'en_examen':
        return { label: 'Dossier en cours d\'examen', color: 'purple', icon: FileSearch };
      case 'acceptee':
        return { label: 'Candidature acceptée !', color: 'green', icon: CheckCircle };
      case 'refusee':
        return { label: 'Candidature refusée', color: 'red', icon: XCircle };
      case 'annulee':
        return { label: 'Candidature annulée', color: 'gray', icon: XCircle };
      default:
        return { label: 'Candidature envoyée', color: 'green', icon: CheckCircle };
    }
  };

  const photos = annonce?.photos?.length > 0
    ? annonce.photos
    : ['/static/img/placeholder.jpg'];

  // Mapping des commodités vers emojis
  const getCommoditeEmoji = (commodite: string): string => {
    const lower = commodite.toLowerCase();
    if (lower.includes('parking') || lower.includes('stationnement')) return '🚗';
    if (lower.includes('meublé') || lower.includes('furnished')) return '🛋️';
    if (lower.includes('animaux') || lower.includes('pet')) return '🐾';
    if (lower.includes('chauffage') || lower.includes('heat')) return '🔥';
    if (lower.includes('électricité') || lower.includes('electric')) return '⚡';
    if (lower.includes('laveuse') || lower.includes('sécheuse') || lower.includes('washer') || lower.includes('dryer')) return '🧺';
    if (lower.includes('balcon') || lower.includes('terrasse')) return '🌿';
    if (lower.includes('piscine') || lower.includes('pool')) return '🏊';
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('exercice')) return '💪';
    if (lower.includes('climatisé') || lower.includes('air conditionné') || lower.includes('ac')) return '❄️';
    if (lower.includes('internet') || lower.includes('wifi')) return '📶';
    if (lower.includes('rangement') || lower.includes('storage')) return '📦';
    if (lower.includes('ascenseur') || lower.includes('elevator')) return '🛗';
    if (lower.includes('buanderie') || lower.includes('laundry')) return '👕';
    if (lower.includes('jardin') || lower.includes('garden')) return '🌳';
    if (lower.includes('cour') || lower.includes('yard')) return '🏡';
    if (lower.includes('sous-sol') || lower.includes('basement')) return '🏠';
    if (lower.includes('eau chaude') || lower.includes('hot water')) return '🚿';
    if (lower.includes('câble') || lower.includes('cable') || lower.includes('tv')) return '📺';
    if (lower.includes('sécurité') || lower.includes('security')) return '🔒';
    if (lower.includes('concierge') || lower.includes('doorman')) return '🛎️';
    if (lower.includes('vue') || lower.includes('view')) return '🌆';
    if (lower.includes('lumineux') || lower.includes('bright')) return '☀️';
    if (lower.includes('rénové') || lower.includes('renovated')) return '✨';
    if (lower.includes('neuf') || lower.includes('new')) return '🆕';
    return '✓'; // Default
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-search"></div>
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Annonce introuvable</p>
          <Button onClick={() => navigate('/search')}>Retour à la recherche</Button>
        </div>
      </div>
    );
  }

  // Generate meta description
  const metaDescription = annonce ?
    `${annonce.titre} - ${annonce.prix}$/mois à ${annonce.ville}${annonce.quartier ? `, ${annonce.quartier}` : ''}. ${annonce.nombre_chambres ? `${annonce.nombre_chambres} chambre(s).` : ''} Trouvez votre logement sur LocaSur.`
    : '';

  return (
    <>

    <div className="min-h-screen bg-background">
      {/* Desktop Navbar only */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden">
        {/* Image Carousel with rounded container */}
        <div className="relative bg-muted rounded-b-3xl overflow-hidden">
          <Carousel
            className="w-full"
            opts={{ loop: true }}
            setApi={setCarouselApi}
          >
            <CarouselContent>
              {photos.map((photo: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-72 object-cover"
                    />
                    {/* Image counter */}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {index + 1} / {photos.length}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* No arrows on mobile - swipe to navigate */}
          </Carousel>
          {/* Back button overlaid on image */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-2 mt-3 px-4 overflow-x-auto pb-2 scrollbar-hide">
            {photos.map((photo: string, index: number) => (
              <button
                key={index}
                onClick={() => carouselApi?.scrollTo(index)}
                className={cn(
                  "relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300",
                  "w-14 h-10",
                  index === currentImageIndex
                    ? "ring-2 ring-search ring-offset-1 ring-offset-background"
                    : "opacity-50"
                )}
              >
                <img
                  src={photo}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Mobile Header: Title + Location + Favorite + Share */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{annonce.titre}</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{annonce.quartier}, {annonce.ville}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleToggleFavorite}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center"
              >
                <Heart className={cn(
                  "w-5 h-5 transition-all",
                  isFavorite && "fill-red-500 text-red-500"
                )} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <BackButton label="Retour aux résultats" fallbackPath="/search" />
          </div>

          {/* Image Carousel */}
          <div className="mb-8">
            <Carousel
              className="w-full"
              opts={{ loop: true }}
              setApi={setCarouselApi}
            >
              <CarouselContent>
                {photos.map((photo: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-[450px] lg:h-[500px] object-cover rounded-2xl"
                      />
                      {/* Image counter */}
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {index + 1} / {photos.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {photos.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 w-10 h-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all" />
                  <CarouselNext className="right-4 w-10 h-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all" />
                </>
              )}
            </Carousel>
            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex justify-center gap-3 mt-5 px-2 overflow-x-auto pb-2 scrollbar-hide">
                {photos.map((photo: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={cn(
                      "relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
                      "w-24 h-16 lg:w-28 lg:h-20",
                      index === currentImageIndex
                        ? "ring-2 ring-search ring-offset-2 ring-offset-background scale-105"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <img
                      src={photo}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== SHARED CONTENT (Mobile + Desktop) ========== */}
      <div className="px-4 pb-8 md:pt-0">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Title & Price - Hidden on mobile (already in mobile header) */}
              <div className="hidden md:block">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{annonce.titre}</h1>
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="relative overflow-visible">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleToggleFavorite}
                        className="rounded-xl w-9 h-9 sm:w-10 sm:h-10"
                      >
                        <motion.div
                          animate={favoriteAnimating ? {
                            scale: [1, 1.4, 1],
                          } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300",
                            isFavorite && "fill-red-500 text-red-500"
                          )} />
                        </motion.div>
                      </Button>
                      {/* Fun heart burst animation */}
                      <AnimatePresence>
                        {favoriteAnimating && (
                          <>
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{
                                  scale: [0, 1.2, 0.8],
                                  opacity: [1, 1, 0],
                                  x: Math.cos((i * 45) * Math.PI / 180) * 35,
                                  y: Math.sin((i * 45) * Math.PI / 180) * 35,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                              >
                                <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-red-500 text-red-500 drop-shadow-sm" />
                              </motion.div>
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                      className="rounded-xl w-9 h-9 sm:w-10 sm:h-10"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{annonce.quartier}, {annonce.ville}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-muted rounded-lg">
                    {annonce.source}
                  </span>
                  <span className="text-xs">{annonce.last_seen}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-search mb-4">
                  {annonce.prix}$ <span className="text-lg sm:text-xl text-muted-foreground">/mois</span>
                </div>
              </div>

              {/* Mobile Price - shown only on mobile */}
              <div className="md:hidden">
                <div className="text-2xl font-bold text-search">
                  {annonce.prix}$ <span className="text-base text-muted-foreground">/mois</span>
                </div>
              </div>

              {/* Suspicious Warning Banner */}
              {annonce.is_suspicious && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-500 mb-1">
                      Attention - Vérifiez cette annonce
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {annonce.suspicious_reason || "Cette annonce présente des caractéristiques inhabituelles (prix très bas, contenu suspect). Soyez prudent et ne versez jamais d'argent avant d'avoir visité le logement."}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-search" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold text-sm sm:text-base">{annonce.type_logement}</p>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
                  <Bed className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-search" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Chambres</p>
                  <p className="font-semibold text-sm sm:text-base">{annonce.chambres}</p>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
                  <Bath className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-search" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Salle bain</p>
                  <p className="font-semibold text-sm sm:text-base">{annonce.salles_bain}</p>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
                  <Square className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-search" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Superficie</p>
                  <p className="font-semibold text-sm sm:text-base">{annonce.superficie} pi²</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Description</h2>
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
                  {annonce.description}
                </p>
              </div>

              {/* Commodités */}
              {annonce.commodites && annonce.commodites.length > 0 && (
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Commodités</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {annonce.commodites.map((commodite: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-base flex-shrink-0">{getCommoditeEmoji(commodite)}</span>
                        <span className="text-sm sm:text-base">{commodite}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date disponible */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-search" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Disponibilité</p>
                    <p className="font-semibold text-sm sm:text-base">{annonce.date_disponible}</p>
                  </div>
                </div>
              </div>

              {/* Mobile: Contact Card (shown before sidebar on mobile) */}
              <div className="lg:hidden space-y-4">
                {/* Propriétaire card - pour annonces housing_match */}
                {annonce.proprietaire && !annonce.is_owner && annonce.is_housing_match && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Propriétaire</h3>
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (annonce.proprietaire?.id) {
                          setSelectedProfileId(annonce.proprietaire.id);
                          setProfileModalOpen(true);
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {annonce.proprietaire.prenom?.[0] || annonce.proprietaire.nom?.[0] || 'P'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm hover:underline">
                            {annonce.proprietaire.prenom || annonce.proprietaire.nom
                              ? `${annonce.proprietaire.prenom || ''} ${annonce.proprietaire.nom?.[0] ? annonce.proprietaire.nom[0] + '.' : ''}`.trim()
                              : 'Propriétaire'}
                          </p>
                          {annonce.proprietaire.verifie && (
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {annonce.proprietaire.verifie ? 'Propriétaire vérifié' : 'Propriétaire'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-card rounded-xl p-4 border border-border">
                  {/* Actions selon le contexte */}
                  {annonce.is_owner ? (
                    // Propriétaire - boutons de gestion
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                        <Home className="w-4 h-4" />
                        <span className="font-medium text-sm">C'est votre annonce</span>
                      </div>
                      <Button
                        onClick={() => navigate(`/host/listing/${id}/edit`)}
                        className="w-full h-11 rounded-xl"
                        variant="outline"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier l'annonce
                      </Button>
                      <Button
                        onClick={() => navigate('/host')}
                        className="w-full rounded-xl"
                        variant="ghost"
                      >
                        Retour au tableau de bord
                      </Button>
                    </div>
                  ) : annonce.is_housing_match && annonce.is_active !== false ? (
                    // Locataire - annonce LocaSur Match active
                    <div className="space-y-3">
                      {hasApplied ? (
                        <>
                          {/* Statut détaillé de la candidature */}
                          {(() => {
                            const statutInfo = getStatutInfo(candidatureStatut);
                            const StatutIcon = statutInfo.icon;
                            return (
                              <div className={cn(
                                "rounded-xl p-3 text-center border",
                                statutInfo.color === 'yellow' && "bg-yellow-500/10 border-yellow-500/20",
                                statutInfo.color === 'blue' && "bg-blue-500/10 border-blue-500/20",
                                statutInfo.color === 'purple' && "bg-purple-500/10 border-purple-500/20",
                                statutInfo.color === 'green' && "bg-green-500/10 border-green-500/20",
                                statutInfo.color === 'red' && "bg-red-500/10 border-red-500/20",
                                statutInfo.color === 'gray' && "bg-muted border-border"
                              )}>
                                <StatutIcon className={cn(
                                  "w-6 h-6 mx-auto mb-2",
                                  statutInfo.color === 'yellow' && "text-yellow-600",
                                  statutInfo.color === 'blue' && "text-blue-600",
                                  statutInfo.color === 'purple' && "text-purple-600",
                                  statutInfo.color === 'green' && "text-green-600",
                                  statutInfo.color === 'red' && "text-red-600",
                                  statutInfo.color === 'gray' && "text-muted-foreground"
                                )} />
                                <p className={cn(
                                  "font-medium text-sm",
                                  statutInfo.color === 'yellow' && "text-yellow-600",
                                  statutInfo.color === 'blue' && "text-blue-600",
                                  statutInfo.color === 'purple' && "text-purple-600",
                                  statutInfo.color === 'green' && "text-green-600",
                                  statutInfo.color === 'red' && "text-red-600",
                                  statutInfo.color === 'gray' && "text-muted-foreground"
                                )}>
                                  {statutInfo.label}
                                </p>
                              </div>
                            );
                          })()}

                          {/* Bouton Contacter (sauf si annulée ou refusée) */}
                          {candidatureStatut && !['annulee', 'refusee'].includes(candidatureStatut) && (
                            <Button
                              onClick={handleContactOwner}
                              disabled={contactingOwner}
                              className="w-full rounded-xl gradient-match text-white h-11"
                            >
                              {contactingOwner ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <MessageSquare className="w-4 h-4 mr-2" />
                              )}
                              Contacter le propriétaire
                            </Button>
                          )}

                          {/* Bouton Annuler (seulement si en_attente, vue ou en_examen) */}
                          {candidatureStatut && ['en_attente', 'vue', 'en_examen'].includes(candidatureStatut) && (
                            <Button
                              onClick={handleCancelClick}
                              disabled={cancelling}
                              variant="ghost"
                              className="w-full rounded-xl text-destructive hover:text-destructive"
                            >
                              {cancelling ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Annuler ma candidature
                            </Button>
                          )}

                          {/* Message spécial si acceptée */}
                          {candidatureStatut === 'acceptee' && (
                            <div className="p-3 bg-green-500/5 rounded-xl text-center">
                              <p className="text-xs text-green-600">
                                Félicitations ! Contactez le propriétaire pour finaliser.
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <Button
                          onClick={handlePostuler}
                          disabled={applying}
                          className="w-full h-11 rounded-xl gradient-match text-white"
                        >
                          {applying ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Postuler
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : annonce.is_housing_match && annonce.is_active === false ? (
                    // Annonce LocaSur Match inactive
                    <div className="p-3 bg-muted rounded-xl text-center">
                      <p className="text-muted-foreground text-sm">Cette annonce n'est plus disponible</p>
                    </div>
                  ) : (
                    // Annonce externe (source non housing_match)
                    <>
                      <h3 className="font-bold mb-3">Contactez le propriétaire</h3>

                      {annonce.contact && (
                        <div className="space-y-3 mb-4">
                          {annonce.contact.telephone && (
                            <a
                              href={`tel:${annonce.contact.telephone}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="w-9 h-9 rounded-full bg-search/10 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-search" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Téléphone</p>
                                <p className="font-medium text-sm">{annonce.contact.telephone}</p>
                              </div>
                            </a>
                          )}

                          {annonce.contact.email && (
                            <a
                              href={`mailto:${annonce.contact.email}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="w-9 h-9 rounded-full bg-search/10 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-search" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium text-sm truncate">{annonce.contact.email}</p>
                              </div>
                            </a>
                          )}
                        </div>
                      )}

                      <Button
                        asChild
                        className="w-full rounded-xl gradient-search text-white h-11 mb-3"
                      >
                        <a href={annonce.url_externe} target="_blank" rel="noopener noreferrer">
                          Voir l'annonce complète
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </>
                  )}

                  {/* Bouton favori (pour tous sauf propriétaire) */}
                  {!annonce.is_owner && (
                    <Button
                      variant="outline"
                      onClick={handleToggleFavorite}
                      className="w-full rounded-xl mt-3"
                    >
                      <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-red-500 text-red-500")} />
                      {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block space-y-4">
              {/* Propriétaire card - pour annonces housing_match */}
              {annonce.proprietaire && !annonce.is_owner && annonce.is_housing_match && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-3">Propriétaire</h3>
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      if (annonce.proprietaire?.id) {
                        setSelectedProfileId(annonce.proprietaire.id);
                        setProfileModalOpen(true);
                      }
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {annonce.proprietaire.prenom?.[0] || annonce.proprietaire.nom?.[0] || 'P'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium hover:underline">
                          {annonce.proprietaire.prenom || annonce.proprietaire.nom
                            ? `${annonce.proprietaire.prenom || ''} ${annonce.proprietaire.nom?.[0] ? annonce.proprietaire.nom[0] + '.' : ''}`.trim()
                            : 'Propriétaire'}
                        </p>
                        {annonce.proprietaire.verifie && (
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {annonce.proprietaire.verifie ? 'Propriétaire vérifié' : 'Propriétaire'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                {/* Prix */}
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-search">{annonce.prix}$/mois</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {annonce.type_logement} {annonce.quartier && `à ${annonce.quartier}`}
                  </p>
                </div>

                {/* Actions selon le contexte */}
                {annonce.is_owner ? (
                  // Propriétaire - boutons de gestion
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 p-4 bg-blue-500/10 text-blue-600 rounded-xl">
                      <Home className="w-5 h-5" />
                      <span className="font-medium">C'est votre annonce</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/host/listing/${id}/edit`)}
                      className="w-full h-12 rounded-xl"
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier l'annonce
                    </Button>
                    <Button
                      onClick={() => navigate('/host')}
                      className="w-full rounded-xl"
                      variant="ghost"
                    >
                      Retour au tableau de bord
                    </Button>
                  </div>
                ) : annonce.is_housing_match && annonce.is_active !== false ? (
                  // Locataire - annonce LocaSur Match active
                  <div className="space-y-3">
                    {hasApplied ? (
                      <>
                        {/* Statut détaillé de la candidature */}
                        {(() => {
                          const statutInfo = getStatutInfo(candidatureStatut);
                          const StatutIcon = statutInfo.icon;
                          return (
                            <div className={cn(
                              "rounded-xl p-4 text-center border",
                              statutInfo.color === 'yellow' && "bg-yellow-500/10 border-yellow-500/20",
                              statutInfo.color === 'blue' && "bg-blue-500/10 border-blue-500/20",
                              statutInfo.color === 'purple' && "bg-purple-500/10 border-purple-500/20",
                              statutInfo.color === 'green' && "bg-green-500/10 border-green-500/20",
                              statutInfo.color === 'red' && "bg-red-500/10 border-red-500/20",
                              statutInfo.color === 'gray' && "bg-muted border-border"
                            )}>
                              <StatutIcon className={cn(
                                "w-8 h-8 mx-auto mb-2",
                                statutInfo.color === 'yellow' && "text-yellow-600",
                                statutInfo.color === 'blue' && "text-blue-600",
                                statutInfo.color === 'purple' && "text-purple-600",
                                statutInfo.color === 'green' && "text-green-600",
                                statutInfo.color === 'red' && "text-red-600",
                                statutInfo.color === 'gray' && "text-muted-foreground"
                              )} />
                              <p className={cn(
                                "font-medium",
                                statutInfo.color === 'yellow' && "text-yellow-600",
                                statutInfo.color === 'blue' && "text-blue-600",
                                statutInfo.color === 'purple' && "text-purple-600",
                                statutInfo.color === 'green' && "text-green-600",
                                statutInfo.color === 'red' && "text-red-600",
                                statutInfo.color === 'gray' && "text-muted-foreground"
                              )}>
                                {statutInfo.label}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Bouton Contacter (sauf si annulée ou refusée) */}
                        {candidatureStatut && !['annulee', 'refusee'].includes(candidatureStatut) && (
                          <Button
                            onClick={handleContactOwner}
                            disabled={contactingOwner}
                            className="w-full rounded-xl gradient-match text-white"
                          >
                            {contactingOwner ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <MessageSquare className="w-4 h-4 mr-2" />
                            )}
                            Contacter le propriétaire
                          </Button>
                        )}

                        {/* Bouton Annuler (seulement si en_attente, vue ou en_examen) */}
                        {candidatureStatut && ['en_attente', 'vue', 'en_examen'].includes(candidatureStatut) && (
                          <Button
                            onClick={handleCancelClick}
                            disabled={cancelling}
                            variant="ghost"
                            className="w-full rounded-xl text-destructive hover:text-destructive"
                          >
                            {cancelling ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Annuler ma candidature
                          </Button>
                        )}

                        {/* Message spécial si acceptée */}
                        {candidatureStatut === 'acceptee' && (
                          <div className="p-3 bg-green-500/5 rounded-xl text-center">
                            <p className="text-sm text-green-600">
                              Félicitations ! Contactez le propriétaire pour finaliser.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={handlePostuler}
                        disabled={applying}
                        className="w-full h-12 rounded-xl gradient-match text-white"
                      >
                        {applying ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Postuler
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : annonce.is_housing_match && annonce.is_active === false ? (
                  // Annonce LocaSur Match inactive
                  <div className="p-4 bg-muted rounded-xl text-center">
                    <p className="text-muted-foreground">Cette annonce n'est plus disponible</p>
                  </div>
                ) : (
                  // Annonce externe (source non housing_match)
                  <>
                    {annonce.contact && (
                      <div className="space-y-3 mb-6">
                        {annonce.contact.telephone && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-search/10 flex items-center justify-center">
                              <Phone className="w-5 h-5 text-search" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Téléphone</p>
                              <a href={`tel:${annonce.contact.telephone}`} className="font-medium hover:text-search">
                                {annonce.contact.telephone}
                              </a>
                            </div>
                          </div>
                        )}

                        {annonce.contact.email && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-search/10 flex items-center justify-center">
                              <Mail className="w-5 h-5 text-search" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Email</p>
                              <a href={`mailto:${annonce.contact.email}`} className="font-medium hover:text-search text-sm">
                                {annonce.contact.email}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      asChild
                      className="w-full rounded-xl gradient-search text-white h-12 mb-3"
                    >
                      <a href={annonce.url_externe} target="_blank" rel="noopener noreferrer">
                        Voir l'annonce complète
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </>
                )}

                {/* Bouton favori (pour tous) */}
                {!annonce.is_owner && (
                  <Button
                    variant="outline"
                    onClick={handleToggleFavorite}
                    className="w-full rounded-xl mt-3"
                  >
                    <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-red-500 text-red-500")} />
                    {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </Button>
                )}
              </div>

              {/* Similar Annonces */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold mb-4">Annonces similaires</h3>
                <p className="text-sm text-muted-foreground">
                  Découvrez d'autres logements dans le même quartier
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4 rounded-xl"
                  onClick={() => navigate(`/search?ville=${annonce.ville}&quartier=${annonce.quartier}`)}
                >
                  Voir les annonces similaires
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler votre candidature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le propriétaire ne pourra plus voir votre profil pour cette annonce.
              Vous pourrez postuler à nouveau plus tard si l'annonce est toujours disponible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder ma candidature</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal explicatif pour postuler */}
      <Dialog open={showPostulerInfoModal} onOpenChange={setShowPostulerInfoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Comment postuler ?
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              Pour postuler à cette annonce, vous devez avoir un compte LocaSur.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Créez votre compte gratuitement ou connectez-vous
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complétez votre profil locataire (budget, préférences, etc.)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Envoyez votre candidature au propriétaire en un clic
                </p>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                className="w-full rounded-xl gradient-match text-white"
                onClick={() => {
                  // Sauvegarder l'action en attente
                  localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({
                    annonceId: id,
                    action: 'postuler',
                    timestamp: Date.now()
                  }));
                  setShowPostulerInfoModal(false);
                  setAuthModalOpen(true);
                }}
              >
                Se connecter / S'inscrire
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-xl"
                onClick={() => setShowPostulerInfoModal(false)}
              >
                Plus tard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <PublicProfileModal
        userId={selectedProfileId}
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={async () => {
          // Vérifier s'il y a une action en attente et l'exécuter
          const pendingAction = localStorage.getItem(PENDING_ACTION_KEY);
          if (pendingAction) {
            try {
              const action = JSON.parse(pendingAction);
              if (action.annonceId === annonceId && action.action === 'postuler') {
                localStorage.removeItem(PENDING_ACTION_KEY);
                // Attendre un peu pour que le token soit bien enregistré
                await new Promise(resolve => setTimeout(resolve, 500));
                toast.success("Connexion réussie ! Envoi de votre candidature...");
                // Déclencher la candidature automatiquement
                try {
                  const { createCandidature } = await import('@/lib/matchApi');
                  const response = await createCandidature({
                    annonce_id: Number(annonceId),
                    message: ""
                  });
                  if (response.success) {
                    setHasApplied(true);
                    setCandidatureStatut('en_attente');
                    setCandidatureId(response.candidature_id);
                    toast.success("Candidature envoyée avec succès !");
                  }
                } catch (error: any) {
                  toast.error(error.message || "Erreur lors de la candidature");
                }
              }
            } catch {
              localStorage.removeItem(PENDING_ACTION_KEY);
            }
          }
        }}
        trigger="login"
        redirectTo={`/listing/${id}`}
      />
    </div>
    </>
  );
}
