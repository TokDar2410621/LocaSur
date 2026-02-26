/**
 * Dashboard Locataire - Refonte Pro
 * Desktop: sidebar + wide content | Mobile: single column + MobileNav
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Avatar } from "@/components/ui/avatar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import {
  Search, Heart, MessageSquare, Home, MapPin,
  ChevronRight, User, FileText, Send, Shield,
  Star, Plus, Building2, CheckCircle2, Clock, Award
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn, getListingUrl } from "@/lib/utils";
import { getMyTenancyHistory, type TenancyRecord } from "@/lib/searchApi";

// Emojis de salutation selon l'heure
const getGreetingEmoji = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "☀️";
  if (hour >= 12 && hour < 18) return "👋";
  if (hour >= 18 && hour < 22) return "🌆";
  return "🌙";
};

const getGreetingText = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bonjour";
  if (hour >= 12 && hour < 18) return "Bon après-midi";
  if (hour >= 18 && hour < 22) return "Bonsoir";
  return "Bonne nuit";
};

export default function DashboardLocataireSimple() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuthContext();
  const [favoris, setFavoris] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [hasDemande, setHasDemande] = useState(false);
  const [candidaturesCount, setCandidaturesCount] = useState(0);
  const [verificationScore, setVerificationScore] = useState(0);
  const [verificationLevel, setVerificationLevel] = useState<string>('none');
  const [loading, setLoading] = useState(true);
  const [rentalHistoryList, setRentalHistoryList] = useState<TenancyRecord[]>([]);
  const [referencesCount, setReferencesCount] = useState(0);

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
      const { getDashboardLocataire } = await import('@/lib/matchApi');
      const response = await getDashboardLocataire();

      if (response.success) {
        setFavoris(response.favoris || []);
        setUnreadMessages(response.stats?.messages_non_lus || 0);
        setProfileCompletion(response.profile_completion || 0);
        setHasDemande(!!response.demande_active);
        setCandidaturesCount(response.stats?.candidatures_total || response.candidatures?.length || 0);
      }

      // Fetch verification status
      try {
        const { getVerificationStatus } = await import('@/lib/matchApi');
        const verificationResponse = await getVerificationStatus();
        if (verificationResponse.success && verificationResponse.verification) {
          setVerificationScore(verificationResponse.verification.verification_score || 0);
          setVerificationLevel(verificationResponse.verification.verification_level || 'none');
        }
      } catch (verificationError) {
        console.log('Verification status not available');
      }

      // Fetch rental history (references)
      try {
        const historyResponse = await getMyTenancyHistory();
        if (historyResponse.success && historyResponse.records) {
          setRentalHistoryList(historyResponse.records);
          const completedRefs = historyResponse.records.filter(
            (r: TenancyRecord) => r.status === 'verified' && r.has_landlord_reference
          ).length;
          setReferencesCount(completedRefs);
        }
      } catch (refError) {
        console.log('Rental history not available');
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Home className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'Locataire';
  const initials = firstName.substring(0, 2).toUpperCase();
  const avatarUrl = user?.profile?.avatar_url;

  // Stats items for the grid
  const statsItems = [
    {
      icon: Heart,
      count: favoris.length,
      label: "Favoris",
      description: "Logements sauvegardés",
      path: "/dashboard/favoris",
      iconBg: "bg-rose-50 dark:bg-rose-950",
      iconColor: "text-rose-500",
      hoverBorder: "hover:border-rose-200 dark:hover:border-rose-800",
    },
    {
      icon: Send,
      count: candidaturesCount,
      label: "Candidatures",
      description: "Envoyées aux propriétaires",
      path: "/dashboard/candidatures",
      iconBg: "bg-violet-50 dark:bg-violet-950",
      iconColor: "text-violet-500",
      hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
    },
    {
      icon: Star,
      count: referencesCount,
      label: "Références",
      description: "Validées par des propriétaires",
      path: "/profile",
      iconBg: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-500",
      hoverBorder: "hover:border-amber-200 dark:hover:border-amber-800",
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
            userType="locataire"
            user={user}
            stats={{
              unreadMessages,
              profileCompletion,
              verificationLevel,
              verificationScore,
              favorisCount: favoris.length,
              referencesCount,
              candidaturesCount,
            }}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 pt-navbar pb-24 md:pb-8">
          <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-8">

            {/* Header avec avatar (mobile) / simple greeting (desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {/* Mobile: avatar + greeting */}
              <div className="flex items-center gap-4 md:hidden">
                <Avatar
                  src={avatarUrl}
                  alt={firstName}
                  fallback={initials}
                  size="lg"
                  className="w-14 h-14 border-2 border-primary/10"
                />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    {getGreetingText()} {getGreetingEmoji()}
                  </p>
                  <h1 className="text-2xl font-bold">{firstName}</h1>
                </div>
              </div>
              {/* Desktop: simple greeting (sidebar has avatar) */}
              <div className="hidden md:block">
                <p className="text-sm text-muted-foreground mb-1">
                  {getGreetingText()} {getGreetingEmoji()}
                </p>
                <h1 className="text-2xl font-bold">{firstName}</h1>
              </div>
            </motion.div>

            {/* Actions principales */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <Button
                onClick={() => navigate('/search')}
                className="h-14 rounded-2xl gradient-search text-white font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Rechercher
              </Button>
              <Button
                onClick={() => navigate(hasDemande ? '/dashboard/demande' : '/dashboard/demande/new')}
                variant={hasDemande ? "outline" : "default"}
                className={cn(
                  "h-14 rounded-2xl font-medium",
                  !hasDemande && "bg-violet-600 hover:bg-violet-700 text-white"
                )}
              >
                <FileText className="w-5 h-5 mr-2" />
                {hasDemande ? "Ma demande" : "Créer demande"}
              </Button>
            </motion.div>

            {/* References Section - Feature clé */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Mes Références</h3>
                      <p className="text-xs text-muted-foreground">
                        {referencesCount > 0
                          ? `${referencesCount} référence${referencesCount > 1 ? 's' : ''} validée${referencesCount > 1 ? 's' : ''}`
                          : "Ajoute tes anciennes locations"
                        }
                      </p>
                    </div>
                  </div>
                  {referencesCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20">
                      <Star className="w-3.5 h-3.5 text-green-600 fill-green-600" />
                      <span className="text-xs font-bold text-green-600">{referencesCount}</span>
                    </div>
                  )}
                </div>

                {/* Rental History Summary */}
                {rentalHistoryList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    {rentalHistoryList.slice(0, 3).map((rental) => (
                      <div
                        key={rental.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-black/20"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{rental.address}</p>
                          <p className="text-xs text-muted-foreground">{rental.city}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {rental.status === 'verified' && rental.has_landlord_reference ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Référence</span>
                            </span>
                          ) : rental.status === 'pending_landlord_confirmation' || rental.status === 'pending_tenant_confirmation' ? (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">En attente</span>
                            </span>
                          ) : rental.status === 'verified' && !rental.has_landlord_reference ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/profile');
                              }}
                              className="text-xs text-primary font-medium hover:underline"
                            >
                              Demander avis
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Ajoute tes anciennes locations pour obtenir des références
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Les propriétaires font plus confiance aux locataires avec des références
                    </p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/profile?add=true')}
                    className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une location
                  </Button>
                  {rentalHistoryList.length > 0 && (
                    <Button
                      onClick={() => navigate('/profile')}
                      variant="outline"
                      className="h-11 rounded-xl border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    >
                      Voir tout
                      <ChevronRight className="w-4 h-4 ml-1" />
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
              className="grid grid-cols-4 md:grid-cols-2 gap-2 md:gap-3 mb-6"
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
                      <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
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
                transition={{ delay: 0.2 }}
                className="mb-6"
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

            {/* Favoris */}
            {favoris.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Tes favoris</h2>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-primary font-medium flex items-center gap-1"
                  >
                    Voir tout
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {favoris.slice(0, 3).map((fav: any, index: number) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      onClick={() => navigate(getListingUrl(fav.annonce || fav))}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 cursor-pointer transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {(fav.annonce?.image || fav.image) ? (
                          <img
                            src={fav.annonce?.image || fav.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary">
                          {fav.annonce?.price || fav.price || fav.annonce?.prix || fav.prix}$/mois
                        </p>
                        <p className="text-sm truncate">
                          {fav.annonce?.title || fav.title || fav.annonce?.titre || fav.titre}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {fav.annonce?.city || fav.city || fav.annonce?.ville || fav.ville}
                        </p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center py-12 px-6 rounded-2xl bg-muted/30 border border-dashed border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Aucun favori</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Explore les annonces et sauvegarde celles qui t'intéressent
                </p>
                <Button
                  onClick={() => navigate('/search')}
                  className="rounded-xl"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
