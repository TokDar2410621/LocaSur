/**
 * Créer Demande - Version simplifiée v3.0
 * Style épuré, champs réorganisés
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MapPin, DollarSign, Home, ArrowRight, Check, Loader2, CalendarDays, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDemandes } from "@/hooks/useDemandes";
import { toast } from "sonner";
import AuthModal from "@/components/auth/AuthModal";

const TYPES_LOGEMENT = ["1½", "2½", "3½", "4½", "5½+"];
const DATES_POPULAIRES = ["Immédiatement", "1er juillet", "1er août", "Flexible"];

export default function CreerDemandeSimple() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { createDemande, loading: submitting } = useDemandes();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [form, setForm] = useState({
    ville: "",
    budgetMax: "",
    type: [] as string[],
    date: "",
    message: ""
  });

  useEffect(() => {
    if (user && !user.profile) {
      navigate('/profile/type-selection');
    }
  }, [user, navigate]);

  const toggleType = (type: string) => {
    setForm(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const canSubmit = form.ville && form.budgetMax && form.type.length > 0;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('pending_demande_simple', JSON.stringify(form));
      setShowAuthModal(true);
      return;
    }

    try {
      let dateEmmenagement = "";
      const now = new Date();
      const year = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();

      switch (form.date) {
        case "Immédiatement":
          dateEmmenagement = now.toISOString().split('T')[0];
          break;
        case "1er juillet":
          dateEmmenagement = `${year}-07-01`;
          break;
        case "1er août":
          dateEmmenagement = `${year}-08-01`;
          break;
        default:
          dateEmmenagement = `${year}-07-01`;
      }

      await createDemande({
        ville: form.ville,
        budgetMax: parseFloat(form.budgetMax),
        typeLogement: form.type.map(t => t.replace('½', ' 1/2')),
        dateEmmenagement,
        description: form.message,
        nombreOccupants: 1
      });

      toast.success("Demande publiée!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    const pending = localStorage.getItem('pending_demande_simple');
    if (pending) {
      localStorage.removeItem('pending_demande_simple');
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/api/auth/profile/type/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ user_type: 'locataire' }),
      });
    } catch (e) {
      console.warn("Type setup error:", e);
    }

    await handleSubmit();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 md:pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Créer une demande</h1>
            <p className="text-muted-foreground">
              Décrivez ce que vous cherchez en 30 secondes
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Section: Localisation & Budget */}
            <div className="p-6 space-y-5">
              {/* Ville */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Où cherchez-vous?
                </label>
                <Input
                  placeholder="Ex: Saguenay, Québec, Montréal..."
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Budget maximum
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 1000"
                  value={form.budgetMax}
                  onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                  className="rounded-xl h-12"
                />
                <p className="text-xs text-muted-foreground mt-1.5">$/mois</p>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Section: Logement & Date */}
            <div className="p-6 space-y-5">
              {/* Type de logement */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Home className="w-4 h-4 text-primary" />
                  Type de logement
                </label>
                <div className="flex flex-wrap gap-2">
                  {TYPES_LOGEMENT.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        "h-11 min-w-[56px] px-4 rounded-xl text-sm font-medium border transition-all inline-flex items-center justify-center gap-1.5",
                        form.type.includes(type)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      )}
                    >
                      {form.type.includes(type) && <Check className="w-3.5 h-3.5" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Quand?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DATES_POPULAIRES.map((date) => (
                    <button
                      key={date}
                      onClick={() => setForm({ ...form, date })}
                      className={cn(
                        "h-11 rounded-xl text-sm font-medium border transition-all flex items-center justify-center",
                        form.date === date
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      )}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Section: Message */}
            <div className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Un mot pour les propriétaires?{" "}
                  <span className="text-muted-foreground font-normal text-xs">(optionnel)</span>
                </label>
                <textarea
                  placeholder="Je suis étudiant/professionnel, calme, sans animaux..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 touch-manipulation"
                  style={{ fontSize: '16px' }}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{form.message.length}/200</p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Publier ma demande
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  Vous devrez créer un compte pour publier
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        trigger="login"
        defaultMode="signup"
      />

      <MobileNav />
    </div>
  );
}
