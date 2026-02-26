/**
 * Matching Propriétaire - Système de matching annonce ↔ locataire
 *
 * Affiche pour chaque annonce les locataires compatibles avec raisons du match
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  Users, MessageSquare, MapPin, DollarSign, Calendar,
  ChevronDown, ChevronUp, Loader2, Home, Sparkles, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MatchReason {
  type: string;
  icon: string;
  text: string;
  match: boolean | 'partial';
}

interface Match {
  demande_id: number;
  score: number;
  grade: string;
  match_reasons: MatchReason[];
  locataire: {
    id: number;
    name: string;
    avatar: string;
  };
  demande: {
    titre: string;
    ville: string;
    budget_max: number | null;
    date_recherche: string | null;
    est_urgente: boolean;
  };
}

interface AnnonceMatches {
  annonce: {
    id: number;
    titre: string;
    ville: string;
    prix: number | null;
    nombre_pieces: string | null;
    image: string | null;
  };
  matches: Match[];
  total_matches: number;
}

export default function LeadsProprietaireSimple() {
  const navigate = useNavigate();
  const [matchesParAnnonce, setMatchesParAnnonce] = useState<AnnonceMatches[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAnnonces, setHasAnnonces] = useState(true);
  const [expandedAnnonces, setExpandedAnnonces] = useState<Set<number>>(new Set());
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { getLeadsProprietaire } = await import('@/lib/matchApi');
      const response = await getLeadsProprietaire();

      if (response.success) {
        setMatchesParAnnonce(response.matches_par_annonce || []);
        setHasAnnonces(response.has_annonces !== false);
        setTotalMatches(response.total_matches || 0);

        // Expand first annonce by default
        if (response.matches_par_annonce?.length > 0) {
          setExpandedAnnonces(new Set([response.matches_par_annonce[0].annonce.id]));
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors du chargement des matches");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (annonceId: number) => {
    setExpandedAnnonces(prev => {
      const next = new Set(prev);
      if (next.has(annonceId)) {
        next.delete(annonceId);
      } else {
        next.add(annonceId);
      }
      return next;
    });
  };

  const handleContact = (locataireId: number) => {
    navigate(`/messages?user=${locataireId}`);
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'A': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'B': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 md:pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Matching</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {hasAnnonces
                ? `${totalMatches} locataire${totalMatches !== 1 ? 's' : ''} compatible${totalMatches !== 1 ? 's' : ''} avec vos annonces`
                : "Créez une annonce pour voir les locataires compatibles"
              }
            </p>
          </div>

          {/* Pas d'annonces */}
          {!hasAnnonces && (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Créez votre première annonce</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Une fois votre logement publié, vous verrez ici les locataires qui correspondent à vos critères
              </p>
              <Button
                onClick={() => navigate("/host/listing/new")}
                className="rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                Créer une annonce
              </Button>
            </div>
          )}

          {/* Liste des annonces avec leurs matches */}
          {hasAnnonces && (
            <div className="space-y-4">
              {matchesParAnnonce.map((item) => (
                <div
                  key={item.annonce.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  {/* Header de l'annonce */}
                  <button
                    onClick={() => toggleExpanded(item.annonce.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Image annonce */}
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {item.annonce.image ? (
                        <img src={item.annonce.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Home className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info annonce */}
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold truncate">{item.annonce.titre}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.annonce.ville}
                        </span>
                        {item.annonce.prix && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {item.annonce.prix}$/mois
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge matches + chevron */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        item.total_matches > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.total_matches} match{item.total_matches !== 1 ? 'es' : ''}
                      </span>
                      {expandedAnnonces.has(item.annonce.id) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Liste des matches (expandable) */}
                  {expandedAnnonces.has(item.annonce.id) && (
                    <div className="border-t border-border">
                      {item.matches.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucun locataire compatible pour le moment</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {item.matches.map((match) => (
                            <div key={match.demande_id} className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <img
                                  src={match.locataire.avatar}
                                  alt=""
                                  className="w-12 h-12 rounded-full object-cover shrink-0"
                                />

                                {/* Info locataire + raisons */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold truncate">
                                      {match.locataire.name}
                                    </h4>
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-xs font-bold shrink-0",
                                      getGradeStyle(match.grade)
                                    )}>
                                      {match.grade}
                                    </span>
                                    {match.demande.est_urgente && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        Urgent
                                      </span>
                                    )}
                                  </div>

                                  {/* Raisons du match */}
                                  <div className="flex flex-wrap gap-2">
                                    {match.match_reasons.map((reason, idx) => (
                                      <span
                                        key={idx}
                                        className={cn(
                                          "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                                          reason.match === true
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                            : reason.match === 'partial'
                                            ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                            : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        )}
                                      >
                                        <span>{reason.icon}</span>
                                        <span>{reason.text}</span>
                                        {reason.match === true && (
                                          <Check className="w-3 h-3" />
                                        )}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Date recherche */}
                                  {match.demande.date_recherche && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3" />
                                      Emménagement: {match.demande.date_recherche}
                                    </div>
                                  )}
                                </div>

                                {/* Bouton contacter */}
                                <Button
                                  onClick={() => handleContact(match.locataire.id)}
                                  size="sm"
                                  className="rounded-xl shrink-0"
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Contacter
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
