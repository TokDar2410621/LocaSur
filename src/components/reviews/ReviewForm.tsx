import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createReview } from "@/lib/matchApi";
import { toast } from "sonner";

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatureId: number;
  reviewedUserName: string;
  typeAvis: "locataire_to_proprietaire" | "proprietaire_to_locataire";
  annonceTitre?: string | null;
  onSuccess?: () => void;
}

const TAGS_PROPRIETAIRE = [
  { id: "communication_excellente", label: "Communication excellente" },
  { id: "reactif", label: "Réactif" },
  { id: "logement_conforme", label: "Logement conforme" },
  { id: "bon_rapport_qualite_prix", label: "Bon rapport qualité/prix" },
  { id: "recommande", label: "Je recommande" },
  { id: "communication_difficile", label: "Communication difficile" },
  { id: "pas_reactif", label: "Pas réactif" },
  { id: "logement_non_conforme", label: "Logement non conforme" },
  { id: "problemes_non_resolus", label: "Problèmes non résolus" },
];

const TAGS_LOCATAIRE = [
  { id: "tres_professionnel", label: "Très professionnel" },
  { id: "paiement_ponctuel", label: "Paiement ponctuel" },
  { id: "respectueux", label: "Respectueux" },
  { id: "recommande", label: "Je recommande" },
  { id: "communication_difficile", label: "Communication difficile" },
  { id: "retard_paiement", label: "Retard de paiement" },
];

export function ReviewForm({
  open,
  onOpenChange,
  candidatureId,
  reviewedUserName,
  typeAvis,
  annonceTitre,
  onSuccess,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [note, setNote] = React.useState(0);
  const [commentaire, setCommentaire] = React.useState("");
  const [estAnonyme, setEstAnonyme] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Critères détaillés
  const [noteCommunication, setNoteCommunication] = React.useState(0);
  const [noteLogement, setNoteLogement] = React.useState(0);
  const [noteRapportQualitePrix, setNoteRapportQualitePrix] = React.useState(0);
  const [noteSerieux, setNoteSerieux] = React.useState(0);
  const [notePaiement, setNotePaiement] = React.useState(0);
  const [noteRespectLogement, setNoteRespectLogement] = React.useState(0);

  const isReviewingProprietaire = typeAvis === "locataire_to_proprietaire";
  const availableTags = isReviewingProprietaire ? TAGS_PROPRIETAIRE : TAGS_LOCATAIRE;

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (note === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Parameters<typeof createReview>[0] = {
        candidature_id: candidatureId,
        note,
        commentaire,
        est_anonyme: estAnonyme,
        tags: selectedTags,
      };

      // Ajouter les critères détaillés selon le type
      if (isReviewingProprietaire) {
        if (noteCommunication > 0) data.note_communication = noteCommunication;
        if (noteLogement > 0) data.note_logement = noteLogement;
        if (noteRapportQualitePrix > 0)
          data.note_rapport_qualite_prix = noteRapportQualitePrix;
      } else {
        if (noteSerieux > 0) data.note_serieux = noteSerieux;
        if (notePaiement > 0) data.note_paiement = notePaiement;
        if (noteRespectLogement > 0) data.note_respect_logement = noteRespectLogement;
      }

      const response = await createReview(data);

      if (response.success) {
        toast.success(response.message || "Avis envoyé avec succès !");
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setNote(0);
        setCommentaire("");
        setEstAnonyme(false);
        setSelectedTags([]);
        setNoteCommunication(0);
        setNoteLogement(0);
        setNoteRapportQualitePrix(0);
        setNoteSerieux(0);
        setNotePaiement(0);
        setNoteRespectLogement(0);
      } else {
        toast.error("Erreur lors de l'envoi de l'avis");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReviewingProprietaire
              ? "Évaluer le propriétaire"
              : "Évaluer le locataire"}
          </DialogTitle>
          <DialogDescription>
            Partagez votre expérience avec {reviewedUserName}
            {annonceTitre && (
              <span className="block text-xs mt-1">
                Concernant : {annonceTitre}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Note principale */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Note globale *</Label>
            <div className="flex items-center gap-3">
              <StarRating value={note} onChange={setNote} size="lg" />
              {note > 0 && (
                <span className="text-lg font-medium">{note}/5</span>
              )}
            </div>
          </div>

          {/* Critères détaillés */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Critères détaillés (optionnel)
            </Label>
            <div className="grid gap-3">
              {isReviewingProprietaire ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Communication</span>
                    <StarRating
                      value={noteCommunication}
                      onChange={setNoteCommunication}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">État du logement</span>
                    <StarRating
                      value={noteLogement}
                      onChange={setNoteLogement}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rapport qualité/prix</span>
                    <StarRating
                      value={noteRapportQualitePrix}
                      onChange={setNoteRapportQualitePrix}
                      size="sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sérieux</span>
                    <StarRating
                      value={noteSerieux}
                      onChange={setNoteSerieux}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paiement</span>
                    <StarRating
                      value={notePaiement}
                      onChange={setNotePaiement}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Respect du logement</span>
                    <StarRating
                      value={noteRespectLogement}
                      onChange={setNoteRespectLogement}
                      size="sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Tags (optionnel)
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTags.includes(tag.id)
                      ? tag.id.includes("difficile") ||
                        tag.id.includes("non_") ||
                        tag.id.includes("retard") ||
                        tag.id.includes("pas_")
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                      : ""
                  )}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
            <Textarea
              id="commentaire"
              placeholder="Partagez votre expérience..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {commentaire.length}/1000
            </p>
          </div>

          {/* Anonyme */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonyme"
              checked={estAnonyme}
              onCheckedChange={(checked) => setEstAnonyme(checked === true)}
            />
            <Label htmlFor="anonyme" className="text-sm font-normal">
              Publier anonymement
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || note === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publier l'avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewForm;
