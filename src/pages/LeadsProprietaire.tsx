/**
 * LeadsProprietaire - Refonte UX v2.0
 *
 * Utilise LeadsProprietaireSimple par défaut.
 * L'ancienne version est conservée ci-dessous.
 */

// Re-export simplified version as default
export { default } from "./LeadsProprietaireSimple";

// ============================================================================
// LEGACY VERSION - Conservée pour référence
// ============================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HostDashboardTabs } from "@/components/dashboard/HostDashboardTabs";
import {
  Lock,
  Unlock,
  Crown,
  TrendingUp,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Filter,
  Sparkles,
  Users,
  CalendarCheck,
  FileQuestion,
  XCircle,
  StickyNote,
  Send
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LeadProfileModal } from "@/components/leads/LeadProfileModal";

// Quick reply templates
const QUICK_REPLIES = [
  { id: 'visit', label: 'Inviter à visiter', icon: CalendarCheck, message: "Bonjour ! Votre profil m'intéresse. Seriez-vous disponible pour une visite du logement cette semaine ?" },
  { id: 'docs', label: 'Demander documents', icon: FileQuestion, message: "Bonjour ! Votre candidature est intéressante. Pourriez-vous me fournir vos documents (preuve de revenus, références) ?" },
  { id: 'info', label: 'Plus d\'infos', icon: MessageSquare, message: "Bonjour ! J'aimerais en savoir plus sur votre situation. Pouvez-vous me donner plus de détails ?" },
];

// Notes storage key
const LEAD_NOTES_KEY = 'housing_lead_notes';

export function LeadsProprietaireLegacy() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [filterScore, setFilterScore] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Notes state
  const [leadNotes, setLeadNotes] = useState<Record<number, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // Quick reply state
  const [sendingQuickReply, setSendingQuickReply] = useState<number | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(LEAD_NOTES_KEY);
    if (savedNotes) {
      try {
        setLeadNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
  }, []);

  // Save note
  const saveNote = (leadId: number, note: string) => {
    const newNotes = { ...leadNotes, [leadId]: note };
    if (!note.trim()) {
      delete newNotes[leadId];
    }
    setLeadNotes(newNotes);
    localStorage.setItem(LEAD_NOTES_KEY, JSON.stringify(newNotes));
    setEditingNoteId(null);
    setNoteText("");
    toast.success(note.trim() ? "Note sauvegardée" : "Note supprimée");
  };

  // Send quick reply
  const handleQuickReply = async (leadId: number, message: string) => {
    if (!isPremium) {
      toast.error("Passez à Premium pour contacter les locataires");
      return;
    }

    setSendingQuickReply(leadId);
    try {
      const { startConversationWithLead, sendMessage } = await import('@/lib/matchApi');

      // Start conversation first
      const convResponse = await startConversationWithLead(leadId);
      if (convResponse.success && convResponse.conversation) {
        // Send the quick reply message
        await sendMessage(convResponse.conversation.id, { content: message });
        toast.success("Message envoyé !");
        navigate('/messages');
      }
    } catch (error: any) {
      // If conversation already exists, just navigate
      if (error.message?.includes('existe')) {
        navigate(`/messages?lead=${leadId}`);
      } else {
        toast.error("Erreur lors de l'envoi du message");
      }
    } finally {
      setSendingQuickReply(null);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      // Appel API réel
      const { getLeadsProprietaire } = await import('@/lib/matchApi');
      const response = await getLeadsProprietaire();

      if (response.success) {
        setLeads(response.leads);
        setIsPremium(true); // TODO: Get from user context
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du chargement des leads");
    }

    // Fallback mock data
    const mockLeads = [
        {
          id: 1,
          score_matching: 95,
          grade: "A+",
          preview: {
            budget_min: 700,
            budget_max: 900,
            type_logement: ["3 1/2", "4 1/2"],
            ville: "Saguenay",
            quartier: "Chicoutimi",
            date_demenagement: "1er avril 2025",
            nb_occupants: 2,
            situation: "Jeune couple",
            animaux: false
          },
          full: {
            nom: "Marc Tremblay",
            email: "marc.t@email.com",
            telephone: "418-555-1234",
            photo: null,
            description: "Jeune couple sans enfants, non-fumeurs. Marc travaille comme infirmier à l'hôpital de Chicoutimi. Recherche un logement tranquille avec stationnement.",
            documents: {
              preuve_revenu: true,
              references: true,
              enquete_credit: false
            },
            score_credit: 750,
            revenu_annuel: "75k-100k"
          }
        },
        {
          id: 2,
          score_matching: 88,
          grade: "A",
          preview: {
            budget_min: 650,
            budget_max: 850,
            type_logement: ["3 1/2"],
            ville: "Saguenay",
            quartier: "Jonquière",
            date_demenagement: "Immédiatement",
            nb_occupants: 1,
            situation: "Étudiant",
            animaux: false
          },
          full: {
            nom: "Sophie Gagnon",
            email: "sophie.g@email.com",
            telephone: "418-555-5678",
            photo: null,
            description: "Étudiante en nursing à l'UQAC, calme et responsable. Non-fumeuse, sans animaux. Recherche un logement proche de l'université.",
            documents: {
              preuve_revenu: true,
              references: true,
              enquete_credit: false
            },
            score_credit: 680,
            revenu_annuel: "30k-50k"
          }
        },
        {
          id: 3,
          score_matching: 75,
          grade: "B",
          preview: {
            budget_min: 800,
            budget_max: 1000,
            type_logement: ["4 1/2", "5 1/2"],
            ville: "Saguenay",
            quartier: "Chicoutimi Nord",
            date_demenagement: "1er juillet 2025",
            nb_occupants: 4,
            situation: "Famille",
            animaux: true
          },
          full: {
            nom: "Pierre & Marie Bouchard",
            email: "p.bouchard@email.com",
            telephone: "418-555-9012",
            photo: null,
            description: "Famille avec 2 enfants (8 et 10 ans) et un chat. Pierre est enseignant et Marie infirmière. Recherche un logement familial avec cour.",
            documents: {
              preuve_revenu: true,
              references: true,
              enquete_credit: true
            },
            score_credit: 720,
            revenu_annuel: "75k-100k"
          }
        }
      ];

    setLeads(mockLeads);
    // Mock: déterminer si l'utilisateur est premium
    setIsPremium(false); // Changez à true pour tester la vue premium
    setLoading(false);
  };

  const handleUpgradePremium = () => {
    // TODO: Rediriger vers Stripe Checkout
    toast.info("Redirection vers la page d'abonnement...");
    navigate("/host");
  };

  const handleContactLead = (leadId: number) => {
    if (!isPremium) {
      toast.error("Passez à Premium pour contacter les locataires");
      return;
    }

    navigate(`/messages?lead=${leadId}`);
  };

  const handleViewProfile = (lead: any) => {
    setSelectedLead(lead);
    setProfileModalOpen(true);
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

  const filteredLeads = filterScore === "all"
    ? leads
    : leads.filter(l => l.grade === filterScore);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-match"></div>
      </div>
    );
  }

  // Stats for HostDashboardTabs badges
  const tabStats = {
    candidatures: leads.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-navbar">
        <HostDashboardTabs stats={tabStats} />
      </div>

      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mes Leads Locataires</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Locataires qui cherchent un logement correspondant à votre annonce
            </p>
          </div>

          {/* Premium Banner (si pas premium) */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 border-2 border-yellow-500/20">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
                    Passez à Premium
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Débloquez les profils complets et contactez directement les locataires.
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4 mb-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span>Profils complets</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span>Messagerie illimitée</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span>Documents vérifiés</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span>Support prioritaire</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <Button
                      onClick={handleUpgradePremium}
                      className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 w-full sm:w-auto"
                      size="lg"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Essayer Premium - 7 jours gratuits
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      50$/mois • Annulation à tout moment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-match" />
                <span className="font-medium text-sm sm:text-base">Filtrer par score:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
                <Button
                  variant={filterScore === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterScore("all")}
                  className={cn(
                    "rounded-xl flex-shrink-0 text-xs sm:text-sm",
                    filterScore === "all" && "gradient-match text-white"
                  )}
                >
                  Tous ({leads.length})
                </Button>
                <Button
                  variant={filterScore === "A+" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterScore("A+")}
                  className={cn(
                    "rounded-xl flex-shrink-0 text-xs sm:text-sm",
                    filterScore === "A+" && "bg-green-500 text-white hover:bg-green-600"
                  )}
                >
                  A+ ({leads.filter(l => l.grade === "A+").length})
                </Button>
                <Button
                  variant={filterScore === "A" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterScore("A")}
                  className={cn(
                    "rounded-xl flex-shrink-0 text-xs sm:text-sm",
                    filterScore === "A" && "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  A ({leads.filter(l => l.grade === "A").length})
                </Button>
                <Button
                  variant={filterScore === "B" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterScore("B")}
                  className={cn(
                    "rounded-xl flex-shrink-0 text-xs sm:text-sm",
                    filterScore === "B" && "bg-yellow-500 text-white hover:bg-yellow-600"
                  )}
                >
                  B ({leads.filter(l => l.grade === "B").length})
                </Button>
              </div>
            </div>
          </div>

          {/* Leads Grid */}
          {filteredLeads.length === 0 ? (
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl sm:rounded-2xl p-8 sm:p-12 border border-border">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-violet-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  {filterScore === "all"
                    ? "Pas encore de candidatures"
                    : `Aucun lead avec le score ${filterScore}`
                  }
                </h3>
                <p className="text-muted-foreground mb-6">
                  {filterScore === "all"
                    ? "Les locataires intéressés par vos annonces apparaîtront ici. Créez une annonce attractive pour attirer des candidats qualifiés."
                    : "Essayez de modifier les filtres pour voir tous vos leads."
                  }
                </p>

                {filterScore === "all" ? (
                  <div className="space-y-4">
                    <Button
                      onClick={() => navigate("/host/listing/new")}
                      className="rounded-xl gradient-match text-white w-full sm:w-auto"
                      size="lg"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Créer une annonce
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      ou consultez les <button onClick={() => navigate("/demandes")} className="text-violet-500 hover:underline font-medium">demandes publiques</button> de locataires
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setFilterScore("all")}
                    className="rounded-xl"
                  >
                    Voir tous les leads
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all",
                    isPremium ? "border-border hover:shadow-lg" : "border-border relative overflow-hidden"
                  )}
                >
                  {/* Blur overlay si pas premium */}
                  {!isPremium && (
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center p-4">
                      <div className="text-center">
                        <Lock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-yellow-600" />
                        <h4 className="text-lg sm:text-xl font-bold mb-2">Profil verrouillé</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Passez à Premium pour voir les coordonnées
                        </p>
                        <Button
                          onClick={handleUpgradePremium}
                          className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm"
                          size="sm"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Débloquer
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                    {/* Avatar - Clickable when premium */}
                    <div className="flex items-center gap-4 sm:block">
                      <button
                        onClick={() => isPremium && lead.locataire?.id && navigate(`/user/${lead.locataire.id}`)}
                        disabled={!isPremium || !lead.locataire?.id}
                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-match/10 flex items-center justify-center flex-shrink-0 ${
                          isPremium && lead.locataire?.id ? 'cursor-pointer hover:ring-2 hover:ring-match/50 transition-all' : 'cursor-default'
                        }`}
                        title={isPremium && lead.locataire?.id ? "Voir le profil" : undefined}
                      >
                        {isPremium && lead.locataire?.avatar ? (
                          <img
                            src={lead.locataire.avatar}
                            alt={lead.locataire?.name || 'Lead'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl font-bold text-match">
                            {isPremium && lead.locataire?.name ? lead.locataire.name.charAt(0) : "?"}
                          </span>
                        )}
                      </button>
                      {/* Mobile: Grade badge next to avatar */}
                      <div className={cn(
                        "sm:hidden px-3 py-1.5 rounded-xl font-bold border-2 text-sm",
                        getGradeColor(lead.grade)
                      )}>
                        {lead.grade} • {lead.score_matching}%
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">
                            {isPremium ? (
                              <button
                                onClick={() => lead.locataire?.id && navigate(`/user/${lead.locataire.id}`)}
                                disabled={!lead.locataire?.id}
                                className={lead.locataire?.id ? 'hover:text-match hover:underline cursor-pointer' : 'cursor-default'}
                              >
                                {lead.locataire?.name || `Lead #${lead.id}`}
                              </button>
                            ) : `Lead #${lead.id}`}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span className="truncate">{lead.profil?.occupation || lead.preview?.situation || 'Non spécifié'}</span>
                            {isPremium && lead.profil?.preuve_revenu && (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          {lead.annonce && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Pour: {lead.annonce.title}
                            </p>
                          )}
                        </div>
                        {/* Desktop: Grade badge */}
                        <div className={cn(
                          "hidden sm:block px-4 py-2 rounded-xl font-bold border-2 ml-4",
                          getGradeColor(lead.grade)
                        )}>
                          {lead.grade} • {lead.score_matching}%
                        </div>
                      </div>

                      {/* Preview Info */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                        <div className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-match flex-shrink-0 mt-0.5 sm:mt-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Budget</p>
                            <p className="font-semibold text-xs sm:text-sm truncate">
                              {lead.profil?.budget_max ? `${lead.profil.budget_max}$` : (lead.preview?.budget_max ? `${lead.preview.budget_min}-${lead.preview.budget_max}$` : 'N/A')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-match flex-shrink-0 mt-0.5 sm:mt-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Occupants</p>
                            <p className="font-semibold text-xs sm:text-sm">{lead.profil?.nb_occupants || lead.preview?.nb_occupants || 1}</p>
                          </div>
                        </div>
                        <div className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-match flex-shrink-0 mt-0.5 sm:mt-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Déménagement</p>
                            <p className="font-semibold text-xs sm:text-sm truncate">{lead.profil?.date_demenagement || lead.preview?.date_demenagement || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Message de motivation */}
                      {lead.message_motivation && (
                        <div className="bg-muted/50 rounded-xl p-3 sm:p-4 mb-4">
                          <p className="text-xs sm:text-sm line-clamp-2">{lead.message_motivation}</p>
                        </div>
                      )}

                      {/* Premium Info - Contact */}
                      {isPremium && lead.locataire && (
                        <>
                          <div className="bg-muted/50 rounded-xl p-3 sm:p-4 mb-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs sm:text-sm">
                              {lead.locataire.email && (
                                <div className="min-w-0">
                                  <p className="text-muted-foreground">Email</p>
                                  <a href={`mailto:${lead.locataire.email}`} className="font-medium hover:text-match truncate block">
                                    {lead.locataire.email}
                                  </a>
                                </div>
                              )}
                              {lead.locataire.phone && (
                                <div>
                                  <p className="text-muted-foreground">Téléphone</p>
                                  <a href={`tel:${lead.locataire.phone}`} className="font-medium hover:text-match">
                                    {lead.locataire.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="flex gap-1.5 sm:gap-2 mb-4 flex-wrap">
                            {lead.profil?.preuve_revenu && (
                              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-green-500/10 text-green-600 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Revenu
                              </span>
                            )}
                            {lead.profil?.references && (
                              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-green-500/10 text-green-600 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Références
                              </span>
                            )}
                            {lead.profil?.enquete_credit && (
                              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-green-500/10 text-green-600 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Crédit
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Quick Reply Buttons */}
                      {isPremium && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">Réponse rapide :</p>
                          <div className="flex flex-wrap gap-2">
                            {QUICK_REPLIES.map((reply) => (
                              <Button
                                key={reply.id}
                                variant="outline"
                                size="sm"
                                className="rounded-lg text-xs h-8 hover:border-match hover:text-match"
                                onClick={() => handleQuickReply(lead.id, reply.message)}
                                disabled={sendingQuickReply === lead.id}
                              >
                                <reply.icon className="w-3 h-3 mr-1.5" />
                                {reply.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes Section */}
                      <div className="mb-4">
                        {editingNoteId === lead.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Ajouter une note privée sur ce candidat..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="text-sm min-h-[80px] rounded-xl"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="rounded-lg"
                                onClick={() => saveNote(lead.id, noteText)}
                              >
                                Sauvegarder
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg"
                                onClick={() => {
                                  setEditingNoteId(null);
                                  setNoteText("");
                                }}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : leadNotes[lead.id] ? (
                          <div
                            className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 cursor-pointer hover:bg-yellow-500/20 transition-colors"
                            onClick={() => {
                              setEditingNoteId(lead.id);
                              setNoteText(leadNotes[lead.id]);
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">{leadNotes[lead.id]}</p>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingNoteId(lead.id);
                              setNoteText("");
                            }}
                          >
                            <StickyNote className="w-3 h-3 mr-1.5" />
                            Ajouter une note
                          </Button>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          onClick={() => handleContactLead(lead.id)}
                          disabled={!isPremium || sendingQuickReply === lead.id}
                          className={cn(
                            "rounded-xl w-full sm:w-auto",
                            isPremium ? "gradient-match text-white" : "opacity-50"
                          )}
                          size="sm"
                        >
                          {sendingQuickReply === lead.id ? (
                            <Send className="w-4 h-4 mr-2 animate-pulse" />
                          ) : (
                            <MessageSquare className="w-4 h-4 mr-2" />
                          )}
                          Envoyer un message
                        </Button>
                        {isPremium && (
                          <Button
                            variant="outline"
                            className="rounded-xl w-full sm:w-auto"
                            size="sm"
                            onClick={() => handleViewProfile(lead)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Voir profil complet
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
      <div className="h-16 md:hidden" />

      {/* Lead Profile Modal */}
      <LeadProfileModal
        open={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        isPremium={isPremium}
        onContact={handleContactLead}
      />
    </div>
  );
}
