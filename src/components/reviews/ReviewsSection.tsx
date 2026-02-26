import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { ReviewCard } from "./ReviewCard";
import { Loader2, Star, MessageSquareText } from "lucide-react";
import type { Review, ReviewStats } from "@/lib/matchApi";
import { getReviewsForUser, respondToReview } from "@/lib/matchApi";
import { toast } from "sonner";

interface ReviewsSectionProps {
  userId: number;
  title?: string;
  showStats?: boolean;
  canRespond?: boolean;
  className?: string;
}

export function ReviewsSection({
  userId,
  title = "Avis",
  showStats = true,
  canRespond = false,
  className,
}: ReviewsSectionProps) {
  const [loading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [stats, setStats] = React.useState<ReviewStats | null>(null);

  const loadReviews = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReviewsForUser(userId);
      if (response.success) {
        setReviews(response.reviews);
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des avis:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleRespond = async (reviewId: number, reponse: string) => {
    try {
      const response = await respondToReview(reviewId, reponse);
      if (response.success) {
        toast.success("Réponse ajoutée avec succès");
        // Mettre à jour l'avis dans la liste
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, reponse: response.reponse, reponse_date: response.reponse_date }
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

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Statistiques */}
      {showStats && stats && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Note moyenne */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold">
                  {stats.note_moyenne.toFixed(1)}
                </div>
                <StarRatingDisplay value={stats.note_moyenne} size="md" />
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.total_avis} avis
                </div>
              </div>

              {/* Distribution */}
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star] || 0;
                  const percentage =
                    stats.total_avis > 0
                      ? (count / stats.total_avis) * 100
                      : 0;

                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-3">{star}</span>
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des avis */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canRespond={canRespond && !review.reponse}
              onRespond={handleRespond}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquareText className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Aucun avis pour le moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ReviewsSection;
