/**
 * Modal Profil Public - Affichage du profil d'un utilisateur dans un modal
 * Mobile: Bottom sheet, Desktop: Dialog
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Calendar,
  CheckCircle2,
  Star,
  Building2,
  Home,
  Loader2,
  MessageSquareText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicProfile, type PublicProfile } from "@/lib/matchApi";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { TrustScoreGauge } from "@/components/ui/TrustScoreGauge";

interface PublicProfileModalProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicProfileModal({
  userId,
  open,
  onOpenChange,
}: PublicProfileModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  const handleViewFullProfile = () => {
    if (userId) {
      onOpenChange(false);
      navigate(`/user/${userId}`);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId || !open) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getPublicProfile(userId);
        if (response.success && response.profile) {
          setProfile(response.profile);
        } else {
          setError("Profil introuvable");
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setProfile(null);
      setError(null);
      setLoading(true);
    }
  }, [open]);

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="max-w-lg">
        {loading ? (
          <>
            <VisuallyHidden>
              <ResponsiveModalTitle>Chargement du profil</ResponsiveModalTitle>
              <ResponsiveModalDescription>Veuillez patienter...</ResponsiveModalDescription>
            </VisuallyHidden>
            <div className="flex items-center justify-center py-16 sm:py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </>
        ) : error || !profile ? (
          <>
            <VisuallyHidden>
              <ResponsiveModalTitle>Erreur</ResponsiveModalTitle>
              <ResponsiveModalDescription>{error || "Profil introuvable"}</ResponsiveModalDescription>
            </VisuallyHidden>
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center px-6">
              <User className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{error || "Profil introuvable"}</p>
            </div>
          </>
        ) : (
          <>
            <VisuallyHidden>
              <ResponsiveModalDescription>
                Profil de {profile.name} - {profile.user_type_display}
              </ResponsiveModalDescription>
            </VisuallyHidden>
            <ResponsiveModalHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar
                  src={profile.avatar}
                  alt={profile.name}
                  fallback={initials}
                  size="lg"
                  className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ResponsiveModalTitle className="text-lg sm:text-xl truncate">{profile.name}</ResponsiveModalTitle>
                    {profile.is_verified && (
                      <Badge variant="secondary" className="gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Badge variant="outline" className="gap-1 text-xs">
                      {profile.user_type === "bailleur" ? (
                        <Building2 className="w-3 h-3" />
                      ) : (
                        <Home className="w-3 h-3" />
                      )}
                      {profile.user_type_display}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      Membre depuis {profile.member_since}
                    </span>
                  </div>
                  {profile.nb_avis > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarRatingDisplay value={profile.note_moyenne} size="sm" />
                      <span className="text-sm font-medium">
                        {profile.note_moyenne.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({profile.nb_avis} avis)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ResponsiveModalHeader>

            <ScrollArea className="max-h-[50vh] sm:max-h-[calc(85vh-200px)]">
              <div className="px-4 sm:px-6 py-4 space-y-4">
                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Score de confiance (locataires) */}
                {profile.user_type === "locataire" && profile.qualite_lead !== undefined && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <TrustScoreGauge score={profile.qualite_lead} size="sm" showLabel={true} />
                  </div>
                )}

                {/* Infos proprietaire */}
                {profile.user_type === "bailleur" && profile.nb_logements !== null && (
                  <div className="text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    {profile.nb_logements} logement{profile.nb_logements > 1 ? "s" : ""} gere
                    {profile.nb_logements > 1 ? "s" : ""}
                  </div>
                )}

                {/* Distribution des notes */}
                {profile.nb_avis > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm">
                        Distribution des avis
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = profile.distribution[star] || 0;
                        const percentage =
                          profile.nb_avis > 0 ? (count / profile.nb_avis) * 100 : 0;

                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs w-3">{star}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <Progress value={percentage} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground w-6 text-right">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Liste des avis */}
                {profile.reviews && profile.reviews.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <MessageSquareText className="w-4 h-4" />
                      Avis recus
                    </h3>
                    {profile.reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        className="border-0 shadow-none bg-muted/20"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquareText className="w-10 h-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucun avis pour le moment
                    </p>
                  </div>
                )}

                {/* Bouton vers profil complet */}
                <div className="pt-4 border-t pb-safe">
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={handleViewFullProfile}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir le profil complet
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

export default PublicProfileModal;
