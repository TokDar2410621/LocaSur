/**
 * Page Détail Lead - Vue détaillée d'une candidature pour le bailleur
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { BackButton } from "@/components/ui/back-button";
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
  Lock,
  Unlock,
  Crown,
  TrendingUp,
  MapPin,
  AlertCircle,
  Download,
  Shield,
  ClipboardList,
  Clock,
  Zap
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DemandeLogement {
  id: number;
  titre: string;
  description: string;
  budget_max: number | null;
  villes: string[];
  nb_pieces_min: number | null;
  date_recherche: string | null;
  est_urgente: boolean;
  flexible_dates: boolean;
  created_at: string;
}

interface Lead {
  id: number;
  locataire: {
    prenom: string;
    nom: string;
    photo: string | null;
    email: string;
    telephone: string;
    occupation: string;
    nb_occupants: number;
    description: string;
  };
  annonce: {
    id: number;
    titre: string;
    prix: number;
    type_logement: string;
  };
  profil: {
    budget_max: number;
    budget_min: number;
    villes_preferees: string[];
    types_logement: string[];
    date_emmenagement: string;
    flexible_dates: boolean;
  };
  demandes?: DemandeLogement[];
  documents: {
    preuve_revenu: boolean;
    references: boolean;
    enquete_credit: boolean;
  };
  message_motivation: string;
  score_matching: number;
  grade: string;
  score_details: {
    critere: string;
    points: number;
    max_points: number;
    match: boolean;
  }[];
  statut: string;
  date_candidature: string;
  date_vue: string | null;
}

export default function DetailLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false); // TODO: Get from user context

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);

      // Appel API réel
      const { getLeadDetail } = await import('@/lib/matchApi');
      const response = await getLeadDetail(parseInt(id!));

      if (response.success) {
        setLead(response.lead as any);
        setIsPremium(response.lead.is_premium !== false);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du chargement du lead");
    }

    // Fallback mock lead
    const mockLead: Lead = {
        id: parseInt(id!),
        locataire: {
          prenom: "Sophie",
          nom: "Tremblay",
          photo: null,
          email: "sophie.tremblay@example.com",
          telephone: "(418) 555-0123",
          occupation: "Infirmière à l'Hôpital de Chicoutimi",
          nb_occupants: 1,
          description: "Professionnelle sérieuse et calme, non-fumeuse. Je cherche un logement tranquille près de mon travail. Excellentes références disponibles."
        },
        annonce: {
          id: 1,
          titre: "3 1/2 lumineux au centre-ville",
          prix: 850,
          type_logement: "3 1/2"
        },
        profil: {
          budget_max: 950,
          budget_min: 700,
          villes_preferees: ["Saguenay", "Chicoutimi"],
          types_logement: ["3 1/2", "4 1/2"],
          date_emmenagement: "2025-04-01",
          flexible_dates: true
        },
        documents: {
          preuve_revenu: true,
          references: true,
          enquete_credit: true
        },
        message_motivation: "Bonjour, je suis très intéressée par votre logement. Je suis infirmière et je recherche un appartement calme et bien situé. J'ai d'excellentes références de mes anciens propriétaires. Disponible pour une visite quand vous le souhaitez.",
        score_matching: 95,
        grade: "A+",
        score_details: [
          { critere: "Budget aligné", points: 30, max_points: 30, match: true },
          { critere: "Profil complet", points: 25, max_points: 25, match: true },
          { critere: "Documents vérifiés", points: 20, max_points: 20, match: true },
          { critere: "Occupation stable", points: 15, max_points: 15, match: true },
          { critere: "Timing parfait", points: 5, max_points: 10, match: true }
        ],
        statut: "en_examen",
        date_candidature: "2025-01-20T10:30:00Z",
        date_vue: "2025-01-20T14:00:00Z"
      };

      setLead(mockLead);
      setIsPremium(true);

      // Marquer comme vue si pas déjà fait
      if (!mockLead.date_vue) {
        // TODO: API call to mark as viewed
      }

      setLoading(false);
  };

  const handleAccepter = async () => {
    try {
      const { leadAction } = await import('@/lib/matchApi');
      const response = await leadAction(parseInt(id!), { action: 'accept' });

      if (response.success) {
        toast.success(response.message || "Candidature acceptée! Logement marqué comme loué.");
        setLead(lead ? { ...lead, statut: "acceptee" } : null);
      } else {
        toast.error("Erreur lors de l'acceptation");
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const handleRefuser = async () => {
    if (!confirm("Êtes-vous sûr de vouloir refuser cette candidature?")) {
      return;
    }

    try {
      const { leadAction } = await import('@/lib/matchApi');
      const response = await leadAction(parseInt(id!), { action: 'reject' });

      if (response.success) {
        toast.success("Candidature refusée");
        setLead(lead ? { ...lead, statut: "refusee" } : null);
      } else {
        toast.error("Erreur lors du refus");
      }
    } catch (error: any) {
      toast.error("Erreur lors du refus");
    }
  };

  const handleUpgradePremium = () => {
    toast.info("Redirection vers la page d'abonnement Premium...");
    navigate('/match/pro/premium');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-match"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Lead introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-navbar pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BackButton label="Retour aux candidatures" fallbackPath="/host/leads" className="mb-4" />
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {lead.locataire?.prenom && lead.locataire?.nom 
                    ? `${lead.locataire.prenom} ${lead.locataire.nom}` 
                    : "Candidat"}
                </h1>
                <p className="text-muted-foreground">
                  Candidature pour: {lead.annonce.titre}
                </p>
              </div>
              <div className={cn("px-4 py-2 rounded-xl font-bold border-2", getGradeColor(lead.grade))}>
                Grade {lead.grade} • {lead.score_matching}%
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Profil */}
            <div className="md:col-span-2 space-y-6">
              {/* Profil Card */}
              <div className="bg-card rounded-2xl p-6 border border-border relative">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-match" />
                  Profil du locataire
                </h3>

                {/* Freemium Blur Overlay */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-card/90 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-8">
                    <Lock className="w-16 h-16 text-yellow-600 mb-4" />
                    <h4 className="text-xl font-bold mb-2">Profil verrouillé</h4>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      Passez à Premium pour accéder aux coordonnées complètes, documents vérifiés et historique du locataire.
                    </p>
                    <Button
                      onClick={handleUpgradePremium}
                      className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Débloquer avec Premium
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      50$/mois • Essai gratuit 7 jours
                    </p>
                  </div>
                )}

                {/* Profile Content (blurred if not premium) */}
                <div className={cn(!isPremium && "blur-sm pointer-events-none")}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-match/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-match" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{lead.locataire?.prenom && lead.locataire?.nom ? `${lead.locataire.prenom} ${lead.locataire.nom}` : "Candidat"}</p>
                        <p className="text-sm text-muted-foreground">{lead.locataire?.occupation || "Non spécifié"}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-match" />
                        <span className="text-sm">{lead.locataire?.email || "Non communiqué"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-match" />
                        <span className="text-sm">{lead.locataire?.telephone || "Non communiqué"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-match" />
                        <span className="text-sm">{lead.locataire?.nb_occupants || 1} occupant(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-match" />
                        <span className="text-sm">{lead.locataire?.occupation || "Non spécifié"}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">À propos:</p>
                      <p className="text-sm">{lead.locataire?.description || "Aucune description fournie"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message de motivation */}
              {lead.message_motivation && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-match" />
                    Message de motivation
                  </h3>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm italic">"{lead.message_motivation}"</p>
                  </div>
                </div>
              )}

              {/* Critères de recherche */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-match" />
                  Critères de recherche
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-match" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-semibold text-sm">
                        {lead.profil?.budget_min || "N/A"}$ - {lead.profil?.budget_max || "N/A"}$/mois
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-match" />
                    <div>
                      <p className="text-xs text-muted-foreground">Villes</p>
                      <p className="font-semibold text-sm">
                        {(lead.profil?.villes_preferees || []).join(", ") || "Non spécifié"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-match" />
                    <div>
                      <p className="text-xs text-muted-foreground">Types recherchés</p>
                      <p className="font-semibold text-sm">
                        {(lead.profil?.types_logement || []).join(", ") || "Non spécifié"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-match" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date emménagement</p>
                      <p className="font-semibold text-sm">
                        {lead.profil?.date_emmenagement
                          ? new Date(lead.profil.date_emmenagement).toLocaleDateString('fr-CA')
                          : "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demandes de logement du locataire */}
              {lead.demandes && lead.demandes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-match" />
                    Demandes de logement actives ({lead.demandes.length})
                  </h3>
                  <div className="space-y-4">
                    {lead.demandes.map((demande) => (
                      <div
                        key={demande.id}
                        className="bg-muted/50 rounded-xl p-4 border border-border hover:border-match/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{demande.titre}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {demande.est_urgente && (
                              <span className="bg-red-500/10 text-red-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Urgent
                              </span>
                            )}
                            {demande.flexible_dates && (
                              <span className="bg-blue-500/10 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                Dates flexibles
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {demande.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {demande.budget_max && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              Max {demande.budget_max}$/mois
                            </div>
                          )}
                          {demande.villes && demande.villes.length > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {demande.villes.slice(0, 2).join(", ")}
                              {demande.villes.length > 2 && `+${demande.villes.length - 2}`}
                            </div>
                          )}
                          {demande.nb_pieces_min && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Home className="w-3 h-3" />
                              {demande.nb_pieces_min}+ pièces
                            </div>
                          )}
                          {demande.date_recherche && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(demande.date_recherche).toLocaleDateString('fr-CA')}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Créée le {new Date(demande.created_at).toLocaleDateString('fr-CA')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Breakdown */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-match" />
                  Détails du score de qualité ({lead.score_matching || 0}/100)
                </h3>
                <div className="space-y-3">
                  {Array.isArray(lead.score_details) && lead.score_details.length > 0 ? (
                    lead.score_details.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={cn("text-sm", detail.match ? "text-foreground" : "text-muted-foreground")}>
                          {detail.critere}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", detail.match ? "bg-green-500" : "bg-red-500")}
                              style={{ width: `${(detail.points / detail.max_points) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold w-12 text-right text-sm">
                            {detail.points}/{detail.max_points}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Détails du score non disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Documents */}
            <div className="space-y-6">
              {/* Actions Card */}
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                <h3 className="font-semibold mb-4">Actions</h3>

                {/* Statuts permettant les actions: en_attente, vue, en_examen */}
                {["en_attente", "vue", "en_examen"].includes(lead.statut) ? (
                  <div className="space-y-3">
                    {/* Badge de statut */}
                    <div className={cn(
                      "rounded-xl p-3 text-center border",
                      lead.statut === "en_attente" && "bg-yellow-500/10 border-yellow-500/20",
                      lead.statut === "vue" && "bg-blue-500/10 border-blue-500/20",
                      lead.statut === "en_examen" && "bg-purple-500/10 border-purple-500/20"
                    )}>
                      <p className={cn(
                        "text-sm font-medium",
                        lead.statut === "en_attente" && "text-yellow-600",
                        lead.statut === "vue" && "text-blue-600",
                        lead.statut === "en_examen" && "text-purple-600"
                      )}>
                        {lead.statut === "en_attente" && "En attente de votre réponse"}
                        {lead.statut === "vue" && "Candidature consultée"}
                        {lead.statut === "en_examen" && "En cours d'examen"}
                      </p>
                    </div>

                    <Button
                      onClick={handleAccepter}
                      className="w-full rounded-xl gradient-match text-white"
                      size="lg"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accepter la candidature
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/messages?lead=${lead.id}`)}
                      className="w-full rounded-xl"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleRefuser}
                      className="w-full rounded-xl text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                ) : lead.statut === "acceptee" ? (
                  <div className="space-y-3">
                    <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-600">Candidature acceptée</p>
                    </div>
                    <Button
                      onClick={() => navigate(`/messages?lead=${lead.id}`)}
                      className="w-full rounded-xl gradient-match text-white"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contacter le locataire
                    </Button>
                  </div>
                ) : lead.statut === "refusee" ? (
                  <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="font-semibold text-red-600">Candidature refusée</p>
                  </div>
                ) : (
                  // annulee ou autre
                  <div className="bg-muted rounded-xl p-4 text-center border border-border">
                    <p className="font-semibold text-muted-foreground">Candidature annulée</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                  <p>Candidature envoyée le {new Date(lead.date_candidature).toLocaleDateString('fr-CA')}</p>
                  {lead.date_vue && (
                    <p>Vue le {new Date(lead.date_vue).toLocaleDateString('fr-CA')}</p>
                  )}
                </div>
              </div>

              {/* Documents vérifiés */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-match" />
                  Documents vérifiés
                </h3>

                {!isPremium && (
                  <div className="bg-yellow-500/10 rounded-xl p-3 mb-4 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-600">
                        Premium requis pour télécharger les documents
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2",
                    lead.documents?.preuve_revenu
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-gray-500/10 border-gray-500/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Preuve de revenu</span>
                    </div>
                    {lead.documents?.preuve_revenu ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2",
                    lead.documents?.references
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-gray-500/10 border-gray-500/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Références</span>
                    </div>
                    {lead.documents?.references ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2",
                    lead.documents?.enquete_credit
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-gray-500/10 border-gray-500/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Enquête de crédit</span>
                    </div>
                    {lead.documents?.enquete_credit ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  {isPremium && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl mt-2"
                      disabled={!lead.documents?.preuve_revenu && !lead.documents?.references && !lead.documents?.enquete_credit}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger tout
                    </Button>
                  )}
                </div>
              </div>

              {/* Premium Upsell */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
                  <div className="flex items-start gap-3 mb-4">
                    <Crown className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Passez à Premium</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Débloquez tous les profils, coordonnées complètes et documents vérifiés.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Profils détaillés illimités
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Accès aux documents
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Support prioritaire
                        </li>
                      </ul>
                      <Button
                        onClick={handleUpgradePremium}
                        className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Essayer 7 jours gratuits
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        50$/mois • Annulation à tout moment
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
