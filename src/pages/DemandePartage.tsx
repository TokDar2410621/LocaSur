/**
 * Page publique pour afficher une demande de logement partagée
 * Accessible sans authentification
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import {
  MapPin,
  DollarSign,
  Home,
  Calendar,
  Eye,
  AlertCircle,
  Users,
  PawPrint,
  Cigarette,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DemandePublic {
  id: number;
  titre: string;
  description: string;
  budget_max: number;
  villes: string[];
  nb_pieces_min?: number;
  date_recherche: string;
  statut: string;
  est_urgente?: boolean;
  est_publique?: boolean;
  nb_vues: number;
  created_at: string;
  profil_locataire?: {
    situation?: string;
    nb_occupants?: number;
    a_animaux?: boolean;
    type_animaux?: string;
    fumeur?: boolean;
    bio?: string;
  };
}

export default function DemandePartage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [demande, setDemande] = useState<DemandePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDemande(parseInt(id));
    }
  }, [id]);

  const fetchDemande = async (demandeId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Call Django API for public demande data (JSON)
      const response = await fetch(`/match/api/demandes/${demandeId}/publique/`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Demande non trouvée ou non disponible");
        }
        throw new Error("Erreur lors du chargement de la demande");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors du chargement de la demande");
      }

      setDemande(data.demande);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers!");

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-match"></div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto py-16 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Demande non trouvée</h1>
            <p className="text-muted-foreground mb-6">
              Cette demande n'existe pas ou n'est plus disponible.
            </p>
            <Button onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Generate meta description
  const metaDescription = demande
    ? `${demande.description ? demande.description.substring(0, 155) : `Recherche de logement à ${demande.villes?.join(", ")} - Budget max ${demande.budget_max}$/mois`}`
    : "Demande de logement au Québec";

  const metaTitle = demande
    ? `${demande.titre} - LocaSur`
    : "Demande de logement - LocaSur";

  const shareUrl = `${window.location.origin}/match/demandes/${id}/partage`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Open Graph */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content="https://locasur.ca/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="fr_CA" />
        <meta property="og:site_name" content="LocaSur" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://locasur.ca/og-image.png" />
      </Helmet>

      <Navbar />

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Banner Info */}
          <div className="bg-blue-500/10 rounded-2xl p-4 sm:p-6 mb-6 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-1">
                  Demande de logement partagée
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Cette demande a été partagée publiquement par un locataire à la recherche d'un logement.
                </p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg mb-6">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-match to-primary/80 px-6 py-8 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {demande.titre}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                      {demande.statut === "active" && "Active"}
                    </span>
                    {demande.est_urgente && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/30 backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-white/80 text-xs mb-1">Budget max</div>
                  <div className="text-xl font-bold">{demande.budget_max}$</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-white/80 text-xs mb-1">Date</div>
                  <div className="text-lg font-semibold">
                    {new Date(demande.date_recherche).toLocaleDateString("fr-CA")}
                  </div>
                </div>
                {demande.nb_pieces_min && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-white/80 text-xs mb-1">Pièces min.</div>
                    <div className="text-lg font-semibold">{demande.nb_pieces_min} 1/2</div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-white/80 text-xs mb-1">Villes</div>
                  <div className="text-sm font-semibold">
                    {demande.villes.length} ville{demande.villes.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {demande.description}
                </p>
              </div>

              {/* Villes */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Villes recherchées</h2>
                <div className="flex flex-wrap gap-2">
                  {demande.villes.map((ville, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {ville}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profil Locataire */}
              {demande.profil_locataire && (
                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-semibold mb-4">
                    À propos du locataire
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demande.profil_locataire.situation && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-match mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Situation</div>
                          <div className="text-sm text-muted-foreground">
                            {demande.profil_locataire.situation}
                          </div>
                        </div>
                      </div>
                    )}

                    {demande.profil_locataire.nb_occupants && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-match mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Occupants</div>
                          <div className="text-sm text-muted-foreground">
                            {demande.profil_locataire.nb_occupants} personne
                            {demande.profil_locataire.nb_occupants > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}

                    {demande.profil_locataire.a_animaux && (
                      <div className="flex items-start gap-3">
                        <PawPrint className="w-5 h-5 text-match mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Animaux</div>
                          <div className="text-sm text-muted-foreground">
                            {demande.profil_locataire.type_animaux || "Oui"}
                          </div>
                        </div>
                      </div>
                    )}

                    {demande.profil_locataire.fumeur !== undefined && (
                      <div className="flex items-start gap-3">
                        <Cigarette className="w-5 h-5 text-match mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Fumeur</div>
                          <div className="text-sm text-muted-foreground">
                            {demande.profil_locataire.fumeur ? "Oui" : "Non"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {demande.profil_locataire.bio && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground italic">
                        {demande.profil_locataire.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 bg-muted/50 border-t border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Vous êtes propriétaire et cette demande vous intéresse?
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="rounded-xl gradient-match text-white w-full sm:w-auto"
                  size="lg"
                >
                  Connectez-vous pour contacter le locataire
                </Button>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <h3 className="text-lg font-semibold mb-2">Partagez cette demande</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aidez ce locataire à trouver son logement en partageant cette demande
            </p>
            <Button
              onClick={handleCopyLink}
              variant={copied ? "default" : "outline"}
              className={cn(
                "rounded-xl",
                copied && "bg-green-500 hover:bg-green-600 text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Lien copié!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le lien
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
