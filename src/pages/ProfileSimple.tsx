/**
 * Profile - Version simplifiée v2.0
 *
 * Principes:
 * - 3 zones max
 * - 1 action principale par zone
 * - Détails dans le wizard
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  Save,
  Loader2,
  Star,
  Camera,
  Edit,
  ChevronRight,
  Settings,
  CheckCircle
} from "lucide-react";
import { uploadAvatar } from "@/lib/authApi";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getProfile, getPendingReviews, type PendingReview } from "@/lib/matchApi";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import AuthModal from "@/components/auth/AuthModal";

export default function ProfileSimple() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state - minimal
  const [name, setName] = useState("");
  const [completude, setCompletude] = useState(0);
  const [grade, setGrade] = useState("");

  // Reviews
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const userType = user?.profile?.user_type;
  const isLocataire = userType === 'locataire';

  useEffect(() => {
    if (user && !user.profile) {
      navigate('/profile/type-selection');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setName(`${user.first_name || ""} ${user.last_name || ""}`.trim());

      try {
        const promises: Promise<any>[] = [getPendingReviews()];

        if (isLocataire) {
          promises.push(getProfile());
        }

        const results = await Promise.all(promises);

        // Pending reviews
        if (results[0]?.success) {
          setPendingReviews(results[0].pending_reviews || []);
        }

        // Profile (locataire only)
        if (isLocataire && results[1]?.success && results[1].profil) {
          setCompletude(results[1].profil.completude_profil || 0);
          setGrade(results[1].profil.grade_lead || "");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated, isLocataire]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop grande (max 2MB)');
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await uploadAvatar(file);
      if (response.success) {
        toast.success('Photo mise à jour!');
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveName = async () => {
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ');

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/profile/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ first_name: firstName, last_name: lastName }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Nom enregistré!');
        await refreshUser();
      }
    } catch (error: any) {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  const openReviewForm = (review: PendingReview) => {
    setSelectedReview(review);
    setReviewFormOpen(true);
  };

  const handleReviewCreated = async () => {
    const response = await getPendingReviews();
    if (response.success) {
      setPendingReviews(response.pending_reviews || []);
    }
  };

  const getGradeColor = (g: string) => {
    switch (g) {
      case 'A+': return 'bg-emerald-100 text-emerald-700';
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Connectez-vous pour voir votre profil</p>
            <Button onClick={() => setAuthModalOpen(true)} className="rounded-xl">
              Se connecter
            </Button>
          </div>
        </div>
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} trigger="login" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Mobile: pt-navbar + pb-24 accounts for both navbars */}
      <div className="pt-navbar pb-24 md:pb-8 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header simple */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Mon Profil</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">

              {/* Zone 1: Avatar + Nom */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar cliquable */}
                  <div className="relative group">
                    <Avatar
                      src={user?.profile?.avatar_url}
                      fallback={user?.first_name || user?.email?.split('@')[0]}
                      alt={user?.first_name || 'User'}
                      size="xl"
                      className="w-20 h-20"
                    />
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      className="text-lg font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Button
                  onClick={handleSaveName}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Enregistrer
                </Button>
              </div>

              {/* Zone 2: Qualité profil (locataires) */}
              {isLocataire && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Qualité du profil</span>
                    {grade && (
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", getGradeColor(grade))}>
                        Grade {grade}
                      </span>
                    )}
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
                      style={{ width: `${completude}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{completude}% complété</span>
                    <Link to="/profile/wizard">
                      <Button size="sm" className="rounded-xl">
                        <Edit className="w-4 h-4 mr-1" />
                        Compléter
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Zone 3: Avis en attente (prioritaire) */}
              {pendingReviews.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-amber-900 dark:text-amber-100">
                      {pendingReviews.length} avis à donner
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pendingReviews.slice(0, 2).map((pending) => (
                      <button
                        key={pending.candidature_id}
                        onClick={() => openReviewForm(pending)}
                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-background rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        <span className="font-medium truncate">{pending.user_to_review.name}</span>
                        <ChevronRight className="w-5 h-5 text-amber-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone 4: Actions rapides */}
              <div className="space-y-2">
                <Link to="/profile/wizard" className="block">
                  <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Edit className="w-5 h-5 text-primary" />
                      <span className="font-medium">Modifier mon profil</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </Link>

                <Link to="/profile" className="block">
                  <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Paramètres</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </Link>

                <Link to="/profile" className="block">
                  <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Mes locations</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal avis */}
      {selectedReview && (
        <ReviewForm
          open={reviewFormOpen}
          onOpenChange={setReviewFormOpen}
          candidatureId={selectedReview.candidature_id}
          reviewedUserName={selectedReview.user_to_review.name}
          typeAvis={selectedReview.type}
          annonceTitre={selectedReview.annonce_titre}
          onSuccess={handleReviewCreated}
        />
      )}

      <MobileNav />
    </div>
  );
}
