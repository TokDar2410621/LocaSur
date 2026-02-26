/**
 * Modal Profil Lead - Affiche le profil complet d'un lead locataire
 * Utilisé depuis la liste des leads pour un aperçu rapide
 * Mobile: Bottom sheet, Desktop: Dialog
 */

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Users,
  DollarSign,
  Home,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  MapPin,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface LeadData {
  id: number;
  grade: string;
  score_matching: number;
  locataire?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  profil?: {
    occupation?: string;
    nb_occupants?: number;
    budget_max?: number;
    budget_min?: number;
    date_demenagement?: string;
    villes_preferees?: string[];
    types_logement?: string[];
    preuve_revenu?: boolean;
    references?: boolean;
    enquete_credit?: boolean;
    description?: string;
  };
  preview?: {
    situation?: string;
    budget_min?: number;
    budget_max?: number;
    nb_occupants?: number;
    date_demenagement?: string;
    ville?: string;
    quartier?: string;
    type_logement?: string[];
    animaux?: boolean;
  };
  annonce?: {
    id?: number;
    title?: string;
  };
  message_motivation?: string;
}

interface LeadProfileModalProps {
  open: boolean;
  onClose: () => void;
  lead: LeadData | null;
  isPremium?: boolean;
  onContact?: (leadId: number) => void;
}

export function LeadProfileModal({
  open,
  onClose,
  lead,
  isPremium = true,
  onContact
}: LeadProfileModalProps) {
  const navigate = useNavigate();

  if (!lead) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "A":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "B":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact(lead.id);
    } else {
      navigate(`/messages?lead=${lead.id}`);
    }
    onClose();
  };

  const handleViewFullProfile = () => {
    navigate(`/host/leads/${lead.id}`);
    onClose();
  };

  // Extraire les données (API réelle ou preview mock)
  const name = lead.locataire?.name || `Lead #${lead.id}`;
  const email = lead.locataire?.email;
  const phone = lead.locataire?.phone;
  const avatar = lead.locataire?.avatar;
  const occupation = lead.profil?.occupation || lead.preview?.situation || 'Non spécifié';
  const nbOccupants = lead.profil?.nb_occupants || lead.preview?.nb_occupants || 1;
  const budgetMax = lead.profil?.budget_max || lead.preview?.budget_max;
  const budgetMin = lead.profil?.budget_min || lead.preview?.budget_min;
  const dateDemenagement = lead.profil?.date_demenagement || lead.preview?.date_demenagement;
  const ville = lead.preview?.ville;
  const quartier = lead.preview?.quartier;
  const description = lead.profil?.description;

  return (
    <ResponsiveModal open={open} onOpenChange={onClose}>
      <ResponsiveModalContent className="sm:max-w-lg">
        <ResponsiveModalHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-match/10 flex items-center justify-center flex-shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-match">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <ResponsiveModalTitle className="text-lg sm:text-xl font-bold truncate">{name}</ResponsiveModalTitle>
                <p className="text-sm text-muted-foreground truncate">{occupation}</p>
              </div>
            </div>

            {/* Grade Badge */}
            <div className={cn(
              "px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold border-2 text-xs sm:text-sm flex-shrink-0",
              getGradeColor(lead.grade)
            )}>
              {lead.grade} • {lead.score_matching}%
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="space-y-6 py-4">
          {/* Annonce concernée */}
          {lead.annonce?.title && (
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Candidature pour</p>
              <p className="text-sm font-medium">{lead.annonce.title}</p>
            </div>
          )}

          {/* Contact Info */}
          {isPremium && (email || phone) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-match" />
                Coordonnées
              </h4>
              <div className="bg-card rounded-xl p-4 border border-border space-y-3">
                {email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${email}`} className="text-sm hover:text-match transition-colors">
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${phone}`} className="text-sm hover:text-match transition-colors">
                      {phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Critères de recherche */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-match" />
              Critères de recherche
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Budget */}
              <div className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-match" />
                  <span className="text-xs text-muted-foreground">Budget</span>
                </div>
                <p className="font-semibold text-sm">
                  {budgetMin && budgetMax
                    ? `${budgetMin}$ - ${budgetMax}$`
                    : budgetMax
                      ? `${budgetMax}$`
                      : 'N/A'
                  }
                </p>
              </div>

              {/* Occupants */}
              <div className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-match" />
                  <span className="text-xs text-muted-foreground">Occupants</span>
                </div>
                <p className="font-semibold text-sm">{nbOccupants}</p>
              </div>

              {/* Date déménagement */}
              <div className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-match" />
                  <span className="text-xs text-muted-foreground">Déménagement</span>
                </div>
                <p className="font-semibold text-sm">{dateDemenagement || 'N/A'}</p>
              </div>

              {/* Localisation */}
              {(ville || quartier) && (
                <div className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-match" />
                    <span className="text-xs text-muted-foreground">Localisation</span>
                  </div>
                  <p className="font-semibold text-sm">
                    {quartier ? `${quartier}, ${ville}` : ville}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message de motivation */}
          {lead.message_motivation && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-match" />
                Message de motivation
              </h4>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm italic leading-relaxed">"{lead.message_motivation}"</p>
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-match" />
                À propos
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          )}

          {/* Documents vérifiés */}
          {isPremium && lead.profil && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-match" />
                Documents vérifiés
              </h4>
              <div className="flex flex-wrap gap-2">
                <DocumentBadge
                  label="Revenu"
                  verified={lead.profil.preuve_revenu}
                />
                <DocumentBadge
                  label="Références"
                  verified={lead.profil.references}
                />
                <DocumentBadge
                  label="Crédit"
                  verified={lead.profil.enquete_credit}
                />
              </div>
            </div>
          )}

          {/* Score matching */}
          <div className="bg-match/5 rounded-xl p-4 border border-match/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-match" />
                <span className="font-semibold text-sm">Score de compatibilité</span>
              </div>
              <span className="text-2xl font-bold text-match">{lead.score_matching}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-match rounded-full transition-all duration-500"
                style={{ width: `${lead.score_matching}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border pb-safe">
          <Button
            onClick={handleContact}
            className="flex-1 rounded-xl gradient-match text-white h-11 sm:h-10"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Envoyer un message
          </Button>
          <Button
            variant="outline"
            onClick={handleViewFullProfile}
            className="flex-1 rounded-xl h-11 sm:h-10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Voir page complète
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

// Composant helper pour les badges de documents
function DocumentBadge({ label, verified }: { label: string; verified?: boolean }) {
  return (
    <span className={cn(
      "text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5",
      verified
        ? "bg-green-500/10 text-green-600 border border-green-500/20"
        : "bg-muted text-muted-foreground border border-border"
    )}>
      {verified ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

export default LeadProfileModal;
