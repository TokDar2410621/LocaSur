/**
 * Formulaire d'avis simplifié - 30 secondes max
 *
 * 3 étapes seulement:
 * 1. Comment ça s'est passé ? 👍/😐/👎
 * 2. Recommanderais-tu cette personne ? Oui/Non
 * 3. Un mot ? (optionnel, 140 chars)
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Calendar, Home } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
type Sentiment = 'positive' | 'neutral' | 'negative' | null;
type ReferenceType = 'landlord' | 'tenant'; // landlord = proprio évalue locataire, tenant = locataire évalue proprio

interface RentalInfo {
  tenant_name?: string;
  landlord_name?: string;
  address: string;
  city: string;
  start_date: string;
  end_date?: string;
}

export default function SubmitReferenceSimple() {
  const { token } = useParams<{ token: string }>();

  // Detect type from URL path
  const isTenantReference = window.location.pathname.includes('/tenant/');
  const referenceType: ReferenceType = isTenantReference ? 'tenant' : 'landlord';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalInfo, setRentalInfo] = useState<RentalInfo | null>(null);

  // Form state - ultra simplifié
  const [step, setStep] = useState(1);
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReferenceForm();
  }, [token]);

  const loadReferenceForm = async () => {
    if (!token) {
      setError("Lien invalide");
      setLoading(false);
      return;
    }

    try {
      if (referenceType === 'tenant') {
        // Locataire évalue proprio
        const { getTenantReferenceForm } = await import('@/lib/searchApi');
        const response = await getTenantReferenceForm(token);
        if (response.success) {
          setRentalInfo({
            landlord_name: response.landlord_name,
            address: response.address,
            city: response.city,
            start_date: response.start_date,
            end_date: response.end_date
          });
        } else {
          setError("Lien invalide ou référence déjà soumise");
        }
      } else {
        // Proprio évalue locataire
        const { getReferenceForm } = await import('@/lib/referencesApi');
        const response = await getReferenceForm(token);
        setRentalInfo({
          tenant_name: response.tenant_name,
          address: response.address,
          city: response.city,
          start_date: response.start_date,
          end_date: response.end_date
        });
      }
    } catch (error: any) {
      if (error.message?.includes('déjà')) {
        setError("Cet avis a déjà été donné. Merci!");
      } else {
        setError("Lien invalide ou expiré");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!token || sentiment === null || wouldRecommend === null) return;

    setSubmitting(true);

    try {
      // Mapper les sentiments vers les notes (pour compatibilité backend)
      const sentimentToRating: Record<string, number> = {
        'positive': 5,
        'neutral': 3,
        'negative': 1
      };

      if (referenceType === 'tenant') {
        // Soumettre référence locataire→proprio
        const { submitTenantReference } = await import('@/lib/searchApi');
        await submitTenantReference(token, {
          // Champs simplifiés mappés vers le backend
          overall_sentiment: sentiment,
          would_rent_again: wouldRecommend,
          comment: comment,
          // Champs legacy pour compatibilité (on utilise le sentiment pour tous)
          responsiveness_rating: sentimentToRating[sentiment],
          communication_rating: sentimentToRating[sentiment],
          tenant_confirmed_email: '' // Pas de vérification email en mode simplifié
        });
      } else {
        // Soumettre référence proprio→locataire
        const { submitReference } = await import('@/lib/referencesApi');
        await submitReference(token, {
          overall_sentiment: sentiment,
          would_rent_again: wouldRecommend,
          comment: comment,
          // Champs legacy pour compatibilité
          payment_rating: sentimentToRating[sentiment],
          property_care_rating: sentimentToRating[sentiment],
          communication_rating: sentimentToRating[sentiment],
          left_on_good_terms: wouldRecommend,
          respected_lease_terms: sentiment !== 'negative',
          landlord_confirmed_email: ''
        });
      }

      setSubmitted(true);
      toast.success("Merci pour ton avis!");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const personName = referenceType === 'tenant'
    ? rentalInfo?.landlord_name
    : rentalInfo?.tenant_name;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Oups</h2>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Merci!</h2>
          <p className="text-muted-foreground">
            Ton avis aide la communauté à mieux se connaître.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Donner mon avis - LocaSur</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header avec contexte */}
        <div className="bg-card border-b border-border px-4 py-6">
          <div className="max-w-md mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-1">Location terminée</p>
            <h1 className="text-lg font-semibold mb-3">
              {rentalInfo?.address}, {rentalInfo?.city}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(rentalInfo?.start_date || '').toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' })}
                {' → '}
                {rentalInfo?.end_date
                  ? new Date(rentalInfo.end_date).toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' })
                  : 'Maintenant'}
              </span>
            </div>
            <p className="mt-2 text-sm">
              Avec <span className="font-medium text-foreground">{personName}</span>
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="px-4 py-3 bg-muted/30">
          <div className="max-w-md mx-auto flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full">
            <AnimatePresence mode="wait">
              {/* Step 1: Sentiment */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <h2 className="text-xl font-bold mb-8">Comment ça s'est passé ?</h2>

                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setSentiment('positive');
                        setStep(2);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                        sentiment === 'positive'
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                      )}
                    >
                      <span className="text-4xl">👍</span>
                      <span className="text-sm font-medium">Bien</span>
                    </button>

                    <button
                      onClick={() => {
                        setSentiment('neutral');
                        setStep(2);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                        sentiment === 'neutral'
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : "border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                      )}
                    >
                      <span className="text-4xl">😐</span>
                      <span className="text-sm font-medium">Correct</span>
                    </button>

                    <button
                      onClick={() => {
                        setSentiment('negative');
                        setStep(2);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                        sentiment === 'negative'
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-border hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10"
                      )}
                    >
                      <span className="text-4xl">👎</span>
                      <span className="text-sm font-medium">Difficile</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Would recommend */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <h2 className="text-xl font-bold mb-8">
                    Recommanderais-tu {personName?.split(' ')[0]} ?
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setWouldRecommend(true);
                        setStep(3);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all",
                        wouldRecommend === true
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-border hover:border-emerald-300 hover:bg-emerald-50/50"
                      )}
                    >
                      <span className="text-4xl">✅</span>
                      <span className="text-lg font-medium">Oui</span>
                    </button>

                    <button
                      onClick={() => {
                        setWouldRecommend(false);
                        setStep(3);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all",
                        wouldRecommend === false
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-border hover:border-red-300 hover:bg-red-50/50"
                      )}
                    >
                      <span className="text-4xl">❌</span>
                      <span className="text-lg font-medium">Non</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Retour
                  </button>
                </motion.div>
              )}

              {/* Step 3: Comment (optional) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <h2 className="text-xl font-bold mb-2">Un mot ?</h2>
                  <p className="text-sm text-muted-foreground mb-6">(Optionnel)</p>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 140))}
                    placeholder="Super expérience..."
                    className="w-full p-4 rounded-xl border border-border bg-background text-center resize-none h-28"
                    maxLength={140}
                  />
                  <p className="text-xs text-muted-foreground mt-2 mb-6">
                    {comment.length}/140
                  </p>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-14 rounded-xl text-lg font-semibold"
                    size="lg"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi...
                      </div>
                    ) : (
                      "Envoyer"
                    )}
                  </Button>

                  <button
                    onClick={() => setStep(2)}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Retour
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recap footer (shown after step 1) */}
        {step > 1 && (
          <div className="bg-muted/30 border-t border-border px-4 py-3">
            <div className="max-w-md mx-auto flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                {sentiment === 'positive' && '👍 Bien'}
                {sentiment === 'neutral' && '😐 Correct'}
                {sentiment === 'negative' && '👎 Difficile'}
              </span>
              {step > 2 && wouldRecommend !== null && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-2">
                    {wouldRecommend ? '✅ Recommande' : '❌ Ne recommande pas'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
