/**
 * Modale d'édition de demande de logement
 */

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { updateDemande, type Demande } from "@/lib/matchApi";
import { toast } from "sonner";
import { Loader2, Zap, Clock, Calendar, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type UrgenceType = 'asap' | '1mois' | '2-3mois' | 'flexible';

interface EditDemandeModalProps {
  open: boolean;
  onClose: () => void;
  demande: Demande | null;
  onSuccess?: (updatedDemande: Demande) => void;
}

export default function EditDemandeModal({ open, onClose, demande, onSuccess }: EditDemandeModalProps) {
  const [loading, setLoading] = useState(false);

  // Form state
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [urgenceType, setUrgenceType] = useState<UrgenceType>('flexible');
  const [villes, setVilles] = useState('');
  const [nbPiecesMin, setNbPiecesMin] = useState('');
  const [estActive, setEstActive] = useState(true);

  // Urgence options
  const urgenceOptions: { value: UrgenceType; label: string; icon: React.ElementType; desc: string }[] = [
    { value: 'asap', label: 'Urgent', icon: Zap, desc: 'Le plus tôt possible' },
    { value: '1mois', label: '1 mois', icon: Clock, desc: "D'ici 1 mois" },
    { value: '2-3mois', label: '2-3 mois', icon: Calendar, desc: 'Dans 2 à 3 mois' },
    { value: 'flexible', label: 'Flexible', icon: CalendarCheck, desc: 'Pas de date précise' },
  ];

  // Populate form when demande changes
  useEffect(() => {
    if (demande) {
      setTitre(demande.titre || '');
      setDescription(demande.description || '');
      setBudgetMax(demande.budget_max?.toString() || '');

      // Determine urgence type from demande data
      if (demande.est_urgente) {
        setUrgenceType('asap');
      } else if (demande.flexible_dates) {
        setUrgenceType('flexible');
      } else {
        setUrgenceType('flexible');
      }

      setVilles(Array.isArray(demande.villes) ? demande.villes.join(', ') : demande.villes || '');
      setNbPiecesMin(demande.nb_pieces_min?.toString() || '');
      setEstActive(true);
    }
  }, [demande]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!demande) return;

    setLoading(true);

    try {
      // Convert villes string to array
      const villesArray = villes
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      // Calculate date based on urgence type
      const now = new Date();
      let dateRecherche: string | undefined;

      switch (urgenceType) {
        case 'asap':
          dateRecherche = now.toISOString().split('T')[0];
          break;
        case '1mois':
          now.setMonth(now.getMonth() + 1);
          dateRecherche = now.toISOString().split('T')[0];
          break;
        case '2-3mois':
          now.setMonth(now.getMonth() + 2);
          dateRecherche = now.toISOString().split('T')[0];
          break;
        default:
          // flexible - no specific date
          dateRecherche = undefined;
      }

      const response = await updateDemande(demande.id, {
        titre,
        description,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
        date_recherche: dateRecherche,
        villes: villesArray.join(', '),
        nb_pieces_min: nbPiecesMin ? parseFloat(nbPiecesMin) : undefined,
        est_urgente: urgenceType === 'asap',
        est_active: estActive,
        flexible_dates: urgenceType === 'flexible',
      });

      if (response.success) {
        toast.success("Demande mise à jour avec succès");

        if (onSuccess && response.demande) {
          onSuccess(response.demande);
        }

        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la mise à jour de la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onClose}>
      <ResponsiveModalContent className="sm:max-w-2xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-lg sm:text-xl">
            Modifier la demande
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Titre */}
          <div>
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Cherche 3½ à Chicoutimi"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez vos besoins..."
              rows={4}
              required
            />
          </div>

          {/* Budget Max */}
          <div>
            <Label htmlFor="budget">Budget maximum ($/mois)</Label>
            <Input
              id="budget"
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="1000"
              required
            />
          </div>

          {/* Quand emménager */}
          <div>
            <Label>Quand souhaitez-vous emménager ?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {urgenceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUrgenceType(option.value)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                    urgenceType === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <option.icon className={cn(
                    "w-5 h-5 mb-1",
                    urgenceType === option.value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Villes */}
          <div>
            <Label htmlFor="villes">Ville(s)</Label>
            <Input
              id="villes"
              value={villes}
              onChange={(e) => setVilles(e.target.value)}
              placeholder="Saguenay, Chicoutimi"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Séparez les villes par des virgules
            </p>
          </div>

          {/* Nombre de pièces min */}
          <div>
            <Label htmlFor="pieces">Nombre de pièces minimum (optionnel)</Label>
            <Input
              id="pieces"
              type="number"
              step="0.5"
              value={nbPiecesMin}
              onChange={(e) => setNbPiecesMin(e.target.value)}
              placeholder="3.5"
            />
          </div>

          {/* Demande active */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div className="space-y-0.5">
              <Label htmlFor="active">Demande active</Label>
              <p className="text-xs text-muted-foreground">
                Visible aux propriétaires
              </p>
            </div>
            <Switch
              id="active"
              checked={estActive}
              onCheckedChange={setEstActive}
            />
          </div>

          <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[100px] h-11 sm:h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
