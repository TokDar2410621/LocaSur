import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { MessageSquare, Calendar, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/matchApi";

interface ReviewCardProps {
  review: Review;
  canRespond?: boolean;
  onRespond?: (reviewId: number, reponse: string) => Promise<void>;
  onProfileClick?: (userId: number) => void;
  className?: string;
}

export function ReviewCard({
  review,
  canRespond = false,
  onRespond,
  onProfileClick,
  className,
}: ReviewCardProps) {
  const navigate = useNavigate();
  const [showResponseForm, setShowResponseForm] = React.useState(false);
  const [responseText, setResponseText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !onRespond) return;

    setIsSubmitting(true);
    try {
      await onRespond(review.id, responseText);
      setShowResponseForm(false);
      setResponseText("");
    } catch (error) {
      console.error("Erreur lors de la soumission de la réponse:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Tags positifs/négatifs avec couleurs
  const tagColors: Record<string, string> = {
    communication_excellente: "bg-green-100 text-green-700",
    tres_professionnel: "bg-green-100 text-green-700",
    reactif: "bg-green-100 text-green-700",
    logement_conforme: "bg-green-100 text-green-700",
    bon_rapport_qualite_prix: "bg-green-100 text-green-700",
    recommande: "bg-green-100 text-green-700",
    paiement_ponctuel: "bg-green-100 text-green-700",
    respectueux: "bg-green-100 text-green-700",
    communication_difficile: "bg-red-100 text-red-700",
    pas_reactif: "bg-red-100 text-red-700",
    logement_non_conforme: "bg-red-100 text-red-700",
    problemes_non_resolus: "bg-red-100 text-red-700",
    retard_paiement: "bg-red-100 text-red-700",
  };

  const tagLabels: Record<string, string> = {
    communication_excellente: "Communication excellente",
    tres_professionnel: "Très professionnel",
    reactif: "Réactif",
    logement_conforme: "Logement conforme",
    bon_rapport_qualite_prix: "Bon rapport qualité/prix",
    recommande: "Je recommande",
    paiement_ponctuel: "Paiement ponctuel",
    respectueux: "Respectueux",
    communication_difficile: "Communication difficile",
    pas_reactif: "Pas réactif",
    logement_non_conforme: "Logement non conforme",
    problemes_non_resolus: "Problèmes non résolus",
    retard_paiement: "Retard de paiement",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 space-y-3">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {review.reviewer_id ? (
                <button
                  onClick={() => {
                    if (onProfileClick) {
                      onProfileClick(review.reviewer_id!);
                    } else {
                      navigate(`/user/${review.reviewer_id}`);
                    }
                  }}
                  className="font-medium hover:underline hover:text-primary transition-colors text-left"
                >
                  {review.reviewer_name}
                </button>
              ) : (
                <span className="font-medium">{review.reviewer_name}</span>
              )}
              <Badge variant="outline" className="text-xs">
                {review.type_avis === "locataire_to_proprietaire"
                  ? "Locataire"
                  : "Propriétaire"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(review.created_at)}
            </div>
          </div>
          <StarRating value={review.note} size="sm" readonly />
        </div>

        {/* Annonce associée */}
        {review.annonce_titre && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
            <Home className="w-3.5 h-3.5" />
            <span className="truncate">{review.annonce_titre}</span>
          </div>
        )}

        {/* Commentaire */}
        {review.commentaire && (
          <p className="text-sm text-foreground/90 leading-relaxed">
            "{review.commentaire}"
          </p>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {review.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn("text-xs", tagColors[tag] || "")}
              >
                {tagLabels[tag] || tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Critères détaillés */}
        {(review.note_communication ||
          review.note_logement ||
          review.note_rapport_qualite_prix ||
          review.note_serieux ||
          review.note_paiement ||
          review.note_respect_logement) && (
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
            {review.note_communication && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Communication</span>
                <StarRating value={review.note_communication} size="sm" readonly />
              </div>
            )}
            {review.note_logement && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logement</span>
                <StarRating value={review.note_logement} size="sm" readonly />
              </div>
            )}
            {review.note_rapport_qualite_prix && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Qualité/Prix</span>
                <StarRating value={review.note_rapport_qualite_prix} size="sm" readonly />
              </div>
            )}
            {review.note_serieux && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sérieux</span>
                <StarRating value={review.note_serieux} size="sm" readonly />
              </div>
            )}
            {review.note_paiement && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paiement</span>
                <StarRating value={review.note_paiement} size="sm" readonly />
              </div>
            )}
            {review.note_respect_logement && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Respect logement</span>
                <StarRating value={review.note_respect_logement} size="sm" readonly />
              </div>
            )}
          </div>
        )}

        {/* Réponse existante */}
        {review.reponse && (
          <div className="bg-muted/30 rounded-md p-3 mt-2 border-l-2 border-primary/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MessageSquare className="w-3 h-3" />
              <span>Réponse</span>
              {review.reponse_date && (
                <span>• {formatDate(review.reponse_date)}</span>
              )}
            </div>
            <p className="text-sm">{review.reponse}</p>
          </div>
        )}

        {/* Formulaire de réponse */}
        {canRespond && !review.reponse && (
          <div className="pt-2">
            {!showResponseForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponseForm(true)}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Répondre à cet avis
              </Button>
            ) : (
              <div className="space-y-3">
                {/* Templates de réponse rapide */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Réponses suggérées :
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {review.note >= 4 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setResponseText("Merci beaucoup pour votre avis positif ! Ce fut un plaisir de collaborer avec vous.")}
                          className="text-xs px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition-colors border border-green-200"
                        >
                          ✨ Remercier
                        </button>
                        <button
                          type="button"
                          onClick={() => setResponseText("Je vous remercie pour ce retour chaleureux. N'hésitez pas à me contacter si vous avez besoin de quoi que ce soit !")}
                          className="text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors border border-blue-200"
                        >
                          🤝 Rester disponible
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setResponseText("Merci pour votre retour. Je prends note de vos remarques et m'engage à améliorer ces points.")}
                          className="text-xs px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-full transition-colors border border-amber-200"
                        >
                          📝 Prendre note
                        </button>
                        <button
                          type="button"
                          onClick={() => setResponseText("Je suis désolé que votre expérience n'ait pas été à la hauteur de vos attentes. Je souhaite comprendre ce qui s'est passé - pouvons-nous en discuter ?")}
                          className="text-xs px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors border border-purple-200"
                        >
                          💬 Demander plus d'infos
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setResponseText("")}
                      className="text-xs px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors border border-gray-200"
                    >
                      ✏️ Personnaliser
                    </button>
                  </div>
                </div>

                <Textarea
                  placeholder="Votre réponse..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {responseText.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponseText("");
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitResponse}
                      disabled={!responseText.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Envoi..." : "Envoyer"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReviewCard;
