/**
 * Dashboard Propriétaire - Refonte Pro
 * Desktop: sidebar + wide content | Mobile: single column + MobileNav
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import {
  Users, MessageSquare, Building2, Plus,
  ChevronRight, User, Star, MapPin, DollarSign, Inbox,
  Shield, Award, UserPlus, ClipboardList,
  CheckCircle2, Clock, AlertTriangle, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AddressAlert {
  id: number;
  address: string;
  city: string;
  status: string;
  created_at: string;
  original_annonce: { id: number; titre: string };
  new_poster: { id: number; name: string };
  new_annonce: { id: number; titre: string } | null;
}

// Type pour l'historique des locataires déclarés par le propriétaire
interface DeclaredTenancy {
  id: number;
  tenant_name: string;
  tenant_email: string;
  address: string;
  city: string;
  status: 'pending_tenant_confirmation' | 'pending_landlord_confirmation' | 'verified' | 'disputed';
  landlord_reference_completed: boolean;
  tenant_reference_completed: boolean;
}

export default function DashboardProprietaireSimple() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuthContext();
  const [leads, setLeads] = useState<any[]>([]);
  const [annoncesCount, setAnnoncesCount] = useState(0);
  const [candidaturesCount, setCandidaturesCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verificationScore, setVerificationScore] = useState(0);
  const [verificationLevel, setVerificationLevel] = useState<string>('none');
  const [declaredTenancies, setDeclaredTenancies] = useState<DeclaredTenancy[]>([]);
  const [referencesGivenCount, setReferencesGivenCount] = useState(0);
  const [addressAlerts, setAddressAlerts] = useState<AddressAlert[]>([]);

  // Redirect users without profile or incomplete onboarding
  useEffect(() => {
    if (user) {
      if (!user.profile || !user.profile.user_type) {
        navigate('/profile');
        return;
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { getDashboardProprietaire, getLeads, getVerificationStatus } = await import('@/lib/matchApi');

      const dashResponse = await getDashboardProprietaire();
      if (dashResponse.success) {
        setAnnoncesCount(dashResponse.annonces?.length || 0);
        setUnreadMessages(dashResponse.unread_messages || 0);
        setProfileCompletion(dashResponse.profile_completion || 0);
        setCandidaturesCount(dashResponse.candidatures_total || dashResponse.stats?.candidatures_recues || 0);
      }

      try {
        const verificationResponse = await getVerificationStatus();
        if (verificationResponse.success && verificationResponse.verification) {
          setVerificationScore(verificationResponse.verification.verification_score || 0);
          setVerificationLevel(verificationResponse.verification.verification_level || 'none');
        }
      } catch (e) {
        console.log('Could not fetch verification status');
      }

      try {
        const leadsResponse = await getLeads();
        if (leadsResponse.success && leadsResponse.leads) {
          const sortedLeads = leadsResponse.leads
            .sort((a: any, b: any) => {
              const gradeOrder: Record<string, number> = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3 };
              return (gradeOrder[a.grade] || 4) - (gradeOrder[b.grade] || 4);
            })
            .slice(0, 4);
          setLeads(sortedLeads);
        }
      } catch (e) {
        console.log('No leads available');
      }

      try {
        const { default: api } = await import('@/lib/api');
        const tenancyResponse = await api.get<{
          success: boolean;
          results: DeclaredTenancy[];
        }>('/api/references/tenancy/my-history/');
        if (tenancyResponse.success && tenancyResponse.results) {
          setDeclaredTenancies(tenancyResponse.results.slice(0, 3));
          const givenCount = tenancyResponse.results.filter(
            (t: DeclaredTenancy) => t.landlord_reference_completed
          ).length;
          setReferencesGivenCount(givenCount);
        }
      } catch (e) {
        console.log('Tenancy history not available');
      }

      // Fetch address alerts
      try {
        const { default: api } = await import('@/lib/api');
        const alertsResponse = await api.get<{
          success: boolean;
          alerts: AddressAlert[];
        }>('/api/references/address-alerts/');
        if (alertsResponse.success && alertsResponse.alerts) {
          setAddressAlerts(alertsResponse.alerts);
        }
      } catch (e) {
        console.log('Address alerts not available');
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dismissAlert = async (alertId: number) => {
    try {
      const { default: api } = await import('@/lib/api');
      await api.post(`/api/references/address-alerts/${alertId}/dismiss/`, {});
      setAddressAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success("Alerte ignorée");
    } catch {
      toast.error("Erreur");
    }
  };

  const reportAlert = async (alertId: number) => {
    try {
      const { default: api } = await import('@/lib/api');
      await api.post(`/api/references/address-alerts/${alertId}/report/`, {});
      setAddressAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success("Signalement envoyé");
    } catch {
      toast.error("Erreur");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-2xl gradient-match flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-white animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'Propriétaire';

  // Grade color helper
  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500 text-white';
      case 'A': return 'bg-emerald-400 text-white';
      case 'B': return 'bg-amber-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  // Stats items for the grid
  const statsItems = [
    {
      icon: Building2,
      count: annoncesCount,
      label: "Annonces",
      description: "Logements publiés",
      path: "/host/annonces",
      iconBg: "bg-violet-50 dark:bg-violet-950",
      iconColor: "text-violet-500",
      hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
    },
    {
      icon: Inbox,
      count: candidaturesCount,
      label: "Candidatures",
      description: "Reçues de locataires",
      path: "/host/candidatures",
      iconBg: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-500",
      hoverBorder: "hover:border-amber-200 dark:hover:border-amber-800",
    },
    {
      icon: Star,
      count: referencesGivenCount,
      label: "Références",
      description: "Données à des locataires",
      path: "/host/references",
      iconBg: "bg-violet-50 dark:bg-violet-950",
      iconColor: "text-violet-500",
      hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
    },
    {
      icon: MessageSquare,
      count: unreadMessages,
      label: "Messages",
      description: "Non lus",
      path: "/messages",
      iconBg: "bg-emerald-50 dark:bg-emerald-950",
      iconColor: "text-emerald-500",
      hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden md:block">
          <DashboardSidebar
            userType="proprietaire"
            user={user}
            stats={{
              unreadMessages,
              profileCompletion,
              verificationLevel,
              verificationScore,
              annoncesCount,
              referencesGivenCount,
            }}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 pt-navbar pb-24 md:pb-8">
          <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <p className="text-sm text-muted-foreground mb-1">Bonjour,</p>
              <h1 className="text-2xl font-bold">{firstName}</h1>
            </motion.div>

            {/* Address Alerts */}
            {addressAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="mb-6 space-y-2"
              >
                {addressAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                          Doublon d'adresse détecté
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                          <strong>{alert.new_poster.name}</strong> a posté une annonce au{" "}
                          <strong>{alert.address}, {alert.city}</strong>
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                          Votre annonce : {alert.original_annonce.titre}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => reportAlert(alert.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                          >
                            Signaler
                          </button>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 transition-colors"
                          >
                            Ignorer
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-amber-400 hover:text-amber-600 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* CTA Principal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <Button
                onClick={() => navigate('/host/leads')}
                className="h-14 rounded-2xl gradient-match text-white font-semibold shadow-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Locataires
              </Button>
              <Button
                onClick={() => navigate('/host/listing/new')}
                variant="outline"
                className="h-14 rounded-2xl font-semibold border-violet-500/30 hover:bg-violet-500/10"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer annonce
              </Button>
            </motion.div>

            {/* References & Reputation Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Références & Réputation</h3>
                      <p className="text-xs text-muted-foreground">
                        {referencesGivenCount > 0
                          ? `${referencesGivenCount} référence${referencesGivenCount > 1 ? 's' : ''} donnée${referencesGivenCount > 1 ? 's' : ''}`
                          : "Déclare tes anciens locataires"
                        }
                      </p>
                    </div>
                  </div>
                  {referencesGivenCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20">
                      <Star className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
                      <span className="text-xs font-bold text-violet-600">{referencesGivenCount}</span>
                    </div>
                  )}
                </div>

                {/* Declared Tenancies Summary */}
                {declaredTenancies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    {declaredTenancies.slice(0, 3).map((tenancy) => (
                      <div
                        key={tenancy.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-black/20"
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tenancy.tenant_name || tenancy.tenant_email}</p>
                          <p className="text-xs text-muted-foreground">{tenancy.address}, {tenancy.city}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {tenancy.status === 'verified' ? (
                            tenancy.landlord_reference_completed ? (
                              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Référence</span>
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/host/references?give=${tenancy.id}`);
                                }}
                                className="text-xs text-violet-600 font-medium hover:underline"
                              >
                                Donner avis
                              </button>
                            )
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">En attente</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Déclare tes anciens locataires pour construire ta réputation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Les locataires font confiance aux propriétaires avec des avis positifs
                    </p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/profile?add=true')}
                    className="flex-1 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Déclarer un locataire
                  </Button>
                  {declaredTenancies.length > 0 && (
                    <Button
                      onClick={() => navigate('/profile')}
                      variant="outline"
                      className="h-11 rounded-xl border-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                    >
                      <ClipboardList className="w-4 h-4 mr-1" />
                      Historique
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats Grid - 4col mobile / 2col desktop */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-4 md:grid-cols-2 gap-2 md:gap-3 mb-8"
            >
              {statsItems.map((stat) => {
                const Icon = stat.icon;
                return (
                  <button
                    key={stat.path}
                    onClick={() => navigate(stat.path)}
                    className={cn(
                      "p-3 md:p-4 rounded-2xl bg-card border border-border transition-all group text-left",
                      stat.hoverBorder
                    )}
                  >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-1.5 md:gap-3">
                      <div className={cn(
                        "w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        stat.iconBg
                      )}>
                        <Icon className={cn("w-4 h-4 md:w-5 md:h-5", stat.iconColor)} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <span className="text-lg md:text-2xl font-bold block">{stat.count}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</span>
                        <p className="hidden md:block text-[11px] text-muted-foreground mt-0.5">
                          {stat.description}
                        </p>
                      </div>
                      <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* Profil + Verification compact card */}
            {(profileCompletion < 100 || verificationLevel !== 'identity_confirmed') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.17 }}
                className="mb-8"
              >
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Complétude du profil</h3>
                    <button
                      onClick={() => navigate('/profile')}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Améliorer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileCompletion < 100 && (
                      <button
                        onClick={() => navigate('/profile')}
                        className="text-left group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Profil {profileCompletion}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${profileCompletion}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </button>
                    )}

                    {verificationLevel !== 'identity_confirmed' && (
                      <button
                        onClick={() => navigate('/profile')}
                        className="text-left group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Vérification {verificationScore}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              verificationLevel === 'verified' ? "bg-blue-500" : "bg-green-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${verificationScore}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leads Récents */}
            {leads.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Meilleurs profils</h2>
                  <button
                    onClick={() => navigate('/host/leads')}
                    className="text-sm text-primary font-medium flex items-center gap-1"
                  >
                    Voir tout
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leads.map((lead: any, index: number) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                      onClick={() => navigate(`/host/lead/${lead.id}`)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-violet-500/30 cursor-pointer transition-all group"
                    >
                      {/* Avatar + Grade */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted">
                          {lead.avatar ? (
                            <img
                              src={lead.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-violet-100">
                              <User className="w-6 h-6 text-violet-400" />
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm",
                          getGradeStyle(lead.grade)
                        )}>
                          {lead.grade}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{lead.name || lead.prenom || 'Locataire'}</p>
                          {lead.reliability_score >= 80 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                              Fiable
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {lead.budget_max || lead.budget}$/mois
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {lead.ville || lead.city || 'Non spécifié'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ) : (
              /* État Vide */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12 px-6 rounded-2xl bg-muted/30 border border-dashed border-border"
              >
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="font-semibold mb-2">Trouve ton locataire</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Parcours les profils de locataires disponibles et contacte ceux qui t'intéressent
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/host/leads')}
                    className="rounded-xl gradient-match text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Voir les locataires
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/host/listing/new')}
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une annonce
                  </Button>
                </div>
              </motion.div>
            )}

            {/* CTA Secondaire - Créer Annonce (si pas d'annonces) */}
            {annoncesCount === 0 && leads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <button
                  onClick={() => navigate('/host/listing/new')}
                  className="w-full p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-left group hover:bg-violet-500/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Publie ton annonce</p>
                        <p className="text-xs text-muted-foreground">Reçois des candidatures directement</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-violet-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
