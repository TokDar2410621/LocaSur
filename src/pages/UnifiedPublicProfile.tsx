/**
 * Unified Public Profile Page
 * Adapts content based on user type (locataire or bailleur/proprietaire)
 * Replaces both UserPublicProfile.tsx and PublicLandlordProfile.tsx
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import {
  User,
  Calendar,
  CheckCircle2,
  Star,
  Building2,
  Home,
  Loader2,
  MessageSquareText,
  ArrowLeft,
  Award,
  TrendingUp,
  DollarSign,
  MapPin,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { cn, getListingUrl } from "@/lib/utils";
import { getPublicProfile, type PublicProfile } from "@/lib/matchApi";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { getPublicTenantProfile, type PublicTenantProfile } from "@/lib/referencesApi";
import { getPublicLandlordProfile, type PublicLandlordProfile as LandlordProfileType } from "@/lib/searchApi";
import { ScoreBadge } from "@/components/ui/score-badge";
import { TrustScoreGauge } from "@/components/ui/TrustScoreGauge";
import { motion } from "framer-motion";

export default function UnifiedPublicProfile() {
  // Support both /user/:userId and /landlord/:landlordId/public routes
  const { userId, landlordId } = useParams<{ userId?: string; landlordId?: string }>();
  const profileId = userId || landlordId;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Common profile data
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  // Tenant-specific data
  const [tenantReferences, setTenantReferences] = useState<PublicTenantProfile | null>(null);

  // Landlord-specific data
  const [landlordProfile, setLandlordProfile] = useState<LandlordProfileType | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return;

      try {
        setLoading(true);
        setError(null);

        // Load base profile first
        const response = await getPublicProfile(parseInt(profileId));

        if (response.success && response.profile) {
          setProfile(response.profile);

          // Load type-specific data
          if (response.profile.user_type === 'locataire') {
            try {
              const refResponse = await getPublicTenantProfile(parseInt(profileId));
              if (refResponse) {
                setTenantReferences(refResponse);
              }
            } catch (refError) {
              console.log("Pas de références locataire disponibles");
            }
          } else if (response.profile.user_type === 'bailleur' || response.profile.user_type === 'proprietaire') {
            try {
              const landlordResponse = await getPublicLandlordProfile(parseInt(profileId));
              if (landlordResponse && landlordResponse.landlord) {
                setLandlordProfile({ success: true, ...landlordResponse } as LandlordProfileType);
              }
            } catch (landlordError) {
              console.log("Pas de profil propriétaire disponible");
            }
          }
        } else {
          setError("Profil introuvable");
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-sm text-muted-foreground">Non évalué</span>;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-4 pb-24">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-4 pb-24">
          <BackButton />
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <User className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{error || "Profil introuvable"}</p>
              <Link to="/">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isLandlord = profile.user_type === 'bailleur' || profile.user_type === 'proprietaire';
  const isTenant = profile.user_type === 'locataire';

  return (
    <>
      <Helmet>
        <title>{profile.name} - Profil {isLandlord ? 'Propriétaire' : 'Locataire'} - LocaSur</title>
        <meta
          name="description"
          content={`Profil public de ${profile.name} - ${profile.user_type_display}`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container max-w-4xl mx-auto px-4 pt-28 md:pt-20 pb-24 space-y-6">
          <BackButton className="mb-2" />

          {/* Header Card - Common to all user types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar
                    src={profile.avatar}
                    alt={profile.name}
                    fallback={initials}
                    size="xl"
                    className="w-24 h-24"
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h1 className="text-2xl font-bold">{profile.name}</h1>
                      {profile.verification_level === 'identity_confirmed' ? (
                        <Badge className="gap-1 w-fit mx-auto sm:mx-0 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Identité confirmée
                        </Badge>
                      ) : profile.verification_level === 'verified' || profile.is_verified ? (
                        <Badge className="gap-1 w-fit mx-auto sm:mx-0 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">
                          <BadgeCheck className="w-3 h-3" />
                          Vérifié
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="gap-1">
                        {isLandlord ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <Home className="w-3 h-3" />
                        )}
                        {isLandlord ? 'Propriétaire' : isTenant ? 'Locataire' : profile.user_type_display || 'Membre'}
                      </Badge>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Membre depuis {profile.member_since}
                      </span>
                    </div>

                    {/* Average rating */}
                    {profile.nb_avis > 0 && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                        <StarRatingDisplay value={profile.note_moyenne} size="md" />
                        <span className="font-medium">{profile.note_moyenne.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({profile.nb_avis} avis)
                        </span>
                      </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    {/* Contact Button - only show if not viewing own profile */}
                    {(!user || user.id !== parseInt(profileId || '0')) && (
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            if (!isAuthenticated) {
                              setShowAuthModal(true);
                            } else {
                              navigate(`/messages?user=${profileId}`);
                            }
                          }}
                          className="rounded-xl gradient-match text-white w-full sm:w-auto"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contacter {profile.name.split(' ')[0]}
                        </Button>
                      </div>
                    )}

                    {/* Landlord specific: number of properties */}
                    {isLandlord && profile.nb_logements !== null && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        {profile.nb_logements} logement{profile.nb_logements > 1 ? "s" : ""} géré{profile.nb_logements > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* LANDLORD SPECIFIC: Active Listings */}
          {isLandlord && profile.annonces && profile.annonces.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Annonces actives ({profile.annonces.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.annonces.map((annonce) => (
                      <Link
                        key={annonce.id}
                        to={getListingUrl({ id: annonce.id, seo_url: annonce.seo_url || undefined })}
                        className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {annonce.image ? (
                            <img
                              src={annonce.image}
                              alt={annonce.titre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{annonce.titre}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{annonce.ville}{annonce.quartier ? `, ${annonce.quartier}` : ''}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-primary">
                              {annonce.prix ? `${annonce.prix.toLocaleString('fr-CA')}$/mois` : 'Prix N/D'}
                            </span>
                            {annonce.nombre_pieces && (
                              <span className="text-xs text-muted-foreground">
                                {annonce.nombre_pieces} pièces
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* LANDLORD SPECIFIC: Statistics Cards */}
          {isLandlord && landlordProfile?.stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-semibold text-sm text-muted-foreground">Note moyenne</h3>
                    </div>
                    <p className="text-3xl font-bold">
                      {landlordProfile.stats.average_rating?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">sur 5 étoiles</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-sm text-muted-foreground">Loueraient à nouveau</h3>
                    </div>
                    <p className="text-3xl font-bold">
                      {landlordProfile.stats.would_rent_again_percentage !== null
                        ? `${landlordProfile.stats.would_rent_again_percentage}%`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">des locataires</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-sm text-muted-foreground">Dépôt retourné</h3>
                    </div>
                    <p className="text-3xl font-bold">
                      {landlordProfile.stats.deposit_returned_fairly_percentage !== null
                        ? `${landlordProfile.stats.deposit_returned_fairly_percentage}%`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">équitablement</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold text-sm text-muted-foreground">Références</h3>
                    </div>
                    <p className="text-3xl font-bold">{landlordProfile.stats.total_references}</p>
                    <p className="text-xs text-muted-foreground mt-1">vérifiées</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* LANDLORD SPECIFIC: Ratings Breakdown */}
          {isLandlord && landlordProfile?.stats?.ratings_breakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Détails des évaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Réactivité</span>
                      {renderStars(landlordProfile.stats.ratings_breakdown.responsiveness)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Entretien</span>
                      {renderStars(landlordProfile.stats.ratings_breakdown.maintenance)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Communication</span>
                      {renderStars(landlordProfile.stats.ratings_breakdown.communication)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Respect du bail</span>
                      {renderStars(landlordProfile.stats.ratings_breakdown.lease_respect)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* LANDLORD SPECIFIC: Tenant References */}
          {isLandlord && landlordProfile?.references && landlordProfile.references.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Références des locataires ({landlordProfile.references.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {landlordProfile.references.map((reference) => (
                    <div key={reference.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {reference.rental_period.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(reference.rental_period.start_date).toLocaleDateString('fr-CA')}
                              {' → '}
                              {reference.rental_period.end_date
                                ? new Date(reference.rental_period.end_date).toLocaleDateString('fr-CA')
                                : "En cours"}
                              {' '}({reference.rental_period.duration_months} mois)
                            </span>
                          </div>
                        </div>
                        {reference.average_rating && (
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                            <span className="font-bold text-sm">{reference.average_rating.toFixed(1)}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </div>
                        )}
                      </div>

                      {/* Boolean badges */}
                      <div className="flex flex-wrap gap-2">
                        {reference.would_rent_again && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Louerait à nouveau
                          </Badge>
                        )}
                        {reference.deposit_returned_fairly && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Dépôt retourné
                          </Badge>
                        )}
                        {reference.property_as_described && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conforme
                          </Badge>
                        )}
                      </div>

                      {/* Comment */}
                      {reference.comment && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm italic">"{reference.comment}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TENANT SPECIFIC: Trust Score Gauge */}
          {isTenant && profile.qualite_lead !== undefined && profile.qualite_lead > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-primary" />
                    Score de confiance
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-4">
                  <TrustScoreGauge score={profile.qualite_lead} size="md" showLabel={true} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TENANT SPECIFIC: Reliability Score & References */}
          {isTenant && tenantReferences && tenantReferences.stats.total_references > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Références de location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Reliability Score */}
                  {tenantReferences.reliability_score && (
                    <ScoreBadge
                      score={tenantReferences.reliability_score.score}
                      grade={tenantReferences.reliability_score.grade}
                      color={tenantReferences.reliability_score.color}
                      showDetails={true}
                      className="mb-6"
                    />
                  )}

                  {/* Global Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {tenantReferences.stats.total_references}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Référence{tenantReferences.stats.total_references > 1 ? 's' : ''}
                      </div>
                    </div>

                    {tenantReferences.stats.average_rating && (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                          {tenantReferences.stats.average_rating}
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Note moyenne</div>
                      </div>
                    )}

                    {tenantReferences.stats.would_rent_again_percentage !== null && (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                          {tenantReferences.stats.would_rent_again_percentage}%
                          <ThumbsUp className="w-5 h-5" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Reloueraient</div>
                      </div>
                    )}

                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {tenantReferences.stats.total_rental_months}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Mois de location</div>
                    </div>
                  </div>

                  {/* Ratings breakdown */}
                  {tenantReferences.stats.ratings_breakdown && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Détail des évaluations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {tenantReferences.stats.ratings_breakdown.payment && (
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Paiement</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{tenantReferences.stats.ratings_breakdown.payment}</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        )}
                        {tenantReferences.stats.ratings_breakdown.property_care && (
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Soin du logement</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{tenantReferences.stats.ratings_breakdown.property_care}</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        )}
                        {tenantReferences.stats.ratings_breakdown.communication && (
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Communication</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{tenantReferences.stats.ratings_breakdown.communication}</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* References List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Historique</h4>
                    {tenantReferences.references.map((ref, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="font-medium">{ref.rental_period.city}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(ref.rental_period.start_date).toLocaleDateString('fr-CA')}
                                {' → '}
                                {ref.rental_period.end_date
                                  ? new Date(ref.rental_period.end_date).toLocaleDateString('fr-CA')
                                  : "En cours"}
                                {' '}({ref.rental_period.duration_months} mois)
                              </p>
                            </div>
                          </div>
                          {ref.average_rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                              <span className="font-bold text-sm">{ref.average_rating}</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          )}
                        </div>

                        {/* Boolean badges */}
                        <div className="flex flex-wrap gap-2">
                          {ref.would_rent_again === true && (
                            <Badge variant="secondary" className="text-xs">✓ Relouerait</Badge>
                          )}
                          {ref.left_on_good_terms === true && (
                            <Badge variant="secondary" className="text-xs">✓ Bons termes</Badge>
                          )}
                          {ref.respected_lease_terms === true && (
                            <Badge variant="secondary" className="text-xs">✓ Bail respecté</Badge>
                          )}
                        </div>

                        {/* Comment */}
                        {ref.comment && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-sm italic text-muted-foreground">"{ref.comment}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews Distribution - Common to all types with reviews */}
          {profile.nb_avis > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Avis ({profile.nb_avis})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold">
                        {profile.note_moyenne.toFixed(1)}
                      </div>
                      <StarRatingDisplay value={profile.note_moyenne} size="md" />
                      <div className="text-sm text-muted-foreground mt-1">
                        {profile.nb_avis} avis
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = profile.distribution[star] || 0;
                        const percentage = profile.nb_avis > 0 ? (count / profile.nb_avis) * 100 : 0;

                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <Progress value={percentage} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews List */}
          {profile.reviews && profile.reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {profile.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </motion.div>
          )}
        </main>

        <MobileNav />
      </div>

      {/* Auth Modal for contacting */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          navigate(`/messages?user=${profileId}`);
        }}
        trigger="contact"
        redirectTo={`/messages?user=${profileId}`}
      />
    </>
  );
}
