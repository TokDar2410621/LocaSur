import { useNavigate } from "react-router-dom";
import { MapPin, Home, AlertCircle, CheckCircle2, PawPrint, MessageSquare, BadgeCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemandePublique } from "@/lib/matchApi";

interface DemandCardCompactProps {
  demande: DemandePublique;
  onContact?: (demande: DemandePublique) => void;
  onProfileClick?: (userId: number) => void;
  className?: string;
}

export function DemandCardCompact({
  demande,
  onContact,
  onProfileClick,
  className,
}: DemandCardCompactProps) {
  const navigate = useNavigate();

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContact?.(demande);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (demande.locataire?.id) {
      if (onProfileClick) {
        onProfileClick(demande.locataire.id);
      } else {
        navigate(`/user/${demande.locataire.id}`);
      }
    }
  };

  return (
    <div
      className={cn(
        "block bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      {/* Header avec titre + badges */}
      <div className="relative p-3 pb-0">
        {/* Titre de la recherche */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold text-foreground line-clamp-2 flex-1">
            {demande.titre || `Recherche à ${demande.villes?.[0] || 'définir'}`}
          </h3>
          {demande.est_urgente && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 text-[9px] font-bold flex-shrink-0">
              <AlertCircle className="w-2.5 h-2.5" />
              Urgent
            </span>
          )}
        </div>

        {/* Photo + Nom (cliquable) */}
        <button
          onClick={handleProfileClick}
          disabled={!demande.locataire?.id}
          className={cn(
            "flex items-center gap-2 group w-full text-left",
            demande.locataire?.id && "cursor-pointer"
          )}
        >
          <div className={cn(
            "w-9 h-9 rounded-full bg-match/10 flex items-center justify-center flex-shrink-0",
            demande.locataire?.id && "group-hover:ring-2 group-hover:ring-match/50 transition-all"
          )}>
            {demande.locataire?.avatar ? (
              <img
                src={demande.locataire.avatar}
                alt={demande.locataire.name || ""}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-match">
                {demande.locataire?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className={cn(
                "text-xs font-medium truncate",
                demande.locataire?.id && "group-hover:text-match group-hover:underline transition-colors"
              )}>
                {demande.locataire?.name || "Locataire"}
              </p>
              {demande.locataire?.verification_level === 'identity_confirmed' ? (
                <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
              ) : (demande.locataire?.verification_level === 'verified' || demande.locataire?.is_verified) ? (
                <BadgeCheck className="w-3 h-3 text-blue-600 flex-shrink-0" />
              ) : null}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {demande.profil?.occupation || "Recherche un logement"}
            </p>
          </div>
        </button>
      </div>

      {/* Détails */}
      <div className="p-3 pt-2 space-y-2">
        {/* Budget + Ville */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-match">
            {demande.budget_max ? `${demande.budget_max.toLocaleString('fr-CA')}$/mois` : 'Flexible'}
          </span>
          <span className="text-muted-foreground flex items-center gap-1 truncate max-w-[50%]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{demande.villes?.[0] || "—"}</span>
          </span>
        </div>

        {/* Badges de confiance */}
        <div className="flex items-center gap-1 flex-wrap">
          {demande.profil?.preuve_revenu && (
            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 text-[9px] font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Revenu
            </span>
          )}
          {demande.profil?.references && (
            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 text-[9px] font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Réf.
            </span>
          )}
          {demande.nb_pieces_min && (
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-medium flex items-center gap-0.5">
              <Home className="w-2.5 h-2.5" />
              {demande.nb_pieces_min}½+
            </span>
          )}
          {demande.profil?.animaux && (
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-medium flex items-center gap-0.5">
              <PawPrint className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Bouton Contact */}
        <button
          onClick={handleContactClick}
          className="w-full py-2 rounded-xl bg-match text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-match/90 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Contacter
        </button>
      </div>
    </div>
  );
}
