/**
 * Modale d'authentification - Design "Social-First" (2026)
 * Flux: Social Login prioritaire → Email en option secondaire
 * Principe: 1 clic pour 90% des utilisateurs
 * Mobile: Bottom sheet, Desktop: Dialog
 */

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  trigger?: 'favorite' | 'alert' | 'message' | 'login' | 'contact' | 'host';
  defaultMode?: 'login' | 'signup';
  redirectTo?: string;
}

type Step = 'social' | 'email' | 'password';

export default function AuthModal({ open, onClose, onSuccess, trigger = 'favorite', defaultMode = 'login', redirectTo }: AuthModalProps) {
  const navigate = useNavigate();
  const { login, signup } = useAuthContext();
  const isMobile = useIsMobile();
  const haptic = useHapticFeedback();
  const { isKeyboardOpen } = useKeyboardHeight();
  const formRef = useRef<HTMLDivElement>(null);

  // Step-based state
  const [step, setStep] = useState<Step>('social');
  const [mode, setMode] = useState<'login' | 'signup' | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setStep('social');
    setMode(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setLoading(false);
  };

  const saveRedirectInfo = () => {
    if (redirectTo) {
      localStorage.setItem('oauth_redirect_to', redirectTo);
    } else if (trigger === 'alert' || trigger === 'contact' || trigger === 'message') {
      localStorage.setItem('oauth_redirect_to', window.location.pathname + window.location.search);
    }
  };

  const handleGoogleAuth = () => {
    saveRedirectInfo();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${API_URL}/accounts/google/login/`;
  };

  const handleAppleAuth = () => {
    saveRedirectInfo();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${API_URL}/accounts/apple/login/`;
  };

  // Step 2: Check if email exists
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/auth/check-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de vérification');
      }

      setMode(data.exists ? 'login' : 'signup');
      setStep('password');

    } catch (error: any) {
      console.error('Email check error:', error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Login or Signup
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Le mot de passe doit contenir au moins 8 caractères");
          setLoading(false);
          return;
        }
        if (!/[A-Z]/.test(password)) {
          setError("Le mot de passe doit contenir au moins une majuscule");
          setLoading(false);
          return;
        }
        if (!/[a-z]/.test(password)) {
          setError("Le mot de passe doit contenir au moins une minuscule");
          setLoading(false);
          return;
        }
        if (!/\d/.test(password)) {
          setError("Le mot de passe doit contenir au moins un chiffre");
          setLoading(false);
          return;
        }

        const response = await signup({
          email,
          password,
          password_confirm: confirmPassword,
        });

        toast.success("Compte créé avec succès!");

        if (onSuccess) {
          onClose();
          resetForm();
          onSuccess();
          return;
        }

        onClose();
        resetForm();

        if (trigger === 'host') {
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            await fetch(`${API_URL}/api/auth/profile/type/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                ...(response.token ? { 'Authorization': `Bearer ${response.token}` } : {}),
              },
              credentials: 'include',
              body: JSON.stringify({ user_type: 'bailleur' }),
            });
            navigate('/profile/wizard/proprietaire');
          } catch (e) {
            console.warn("Failed to set user type:", e);
            navigate('/profile/type-selection');
          }
          return;
        }

        navigate('/profile/type-selection');
      } else {
        await login({ email, password });
        toast.success("Connexion réussie!");

        if (onSuccess) {
          onClose();
          resetForm();
          onSuccess();
          return;
        }

        onClose();
        resetForm();

        if (redirectTo) {
          navigate(redirectTo);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('email');
      setMode(null);
      setPassword('');
      setConfirmPassword('');
    } else if (step === 'email') {
      setStep('social');
      setEmail('');
    }
    setError(null);
  };

  const getTriggerMessage = () => {
    if (step === 'password' && mode) {
      return mode === 'login' ? 'Bon retour!' : 'Créez votre compte';
    }
    if (step === 'email') {
      return 'Continuer avec email';
    }

    switch (trigger) {
      case 'favorite':
        return 'Sauvegardez vos favoris';
      case 'alert':
        return 'Créez une alerte';
      case 'message':
        return 'Contactez le propriétaire';
      case 'host':
        return 'Publiez votre annonce';
      default:
        return 'Bienvenue';
    }
  };

  const getSubtitle = () => {
    if (step !== 'social') return null;

    switch (trigger) {
      case 'favorite':
        return 'Retrouvez vos logements préférés sur tous vos appareils';
      case 'alert':
        return 'Soyez notifié des nouvelles annonces';
      case 'host':
        return 'Rejoignez des milliers de propriétaires';
      default:
        return 'Connectez-vous pour continuer';
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onClose}>
      <ResponsiveModalContent className="sm:max-w-[400px] overflow-hidden">
        <ResponsiveModalHeader className="pb-2">
          <div className="text-center select-none">
            {/* Logo */}
            {step === 'social' && !(isKeyboardOpen && isMobile) && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-xl font-bold">H</span>
              </motion.div>
            )}

            <ResponsiveModalTitle className="text-xl font-semibold">
              {getTriggerMessage()}
            </ResponsiveModalTitle>

            {step === 'social' && getSubtitle() && (
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[280px] mx-auto">
                {getSubtitle()}
              </p>
            )}

            {step === 'password' && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {email}
              </p>
            )}
          </div>
        </ResponsiveModalHeader>

        <div ref={formRef} className="space-y-3 py-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Social Login (Primary) */}
            {step === 'social' && (
              <motion.div
                key="social-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Apple Button - Primary (Dark, prominent) */}
                <Button
                  type="button"
                  onClick={() => {
                    haptic.medium();
                    handleAppleAuth();
                  }}
                  className="w-full h-12 text-[15px] font-medium rounded-xl bg-black hover:bg-black/90 text-white touch-manipulation transition-transform active:scale-[0.98]"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continuer avec Apple
                </Button>

                {/* Google Button - Secondary (Outline) */}
                <Button
                  type="button"
                  onClick={() => {
                    haptic.medium();
                    handleGoogleAuth();
                  }}
                  variant="outline"
                  className="w-full h-12 text-[15px] font-medium rounded-xl border-2 hover:bg-muted/50 touch-manipulation transition-transform active:scale-[0.98]"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </Button>

                {/* Divider */}
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs text-muted-foreground bg-background">ou</span>
                  </div>
                </div>

                {/* Email Option - Tertiary (Light button) */}
                <Button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setStep('email');
                  }}
                  variant="secondary"
                  className="w-full h-12 text-[15px] font-medium rounded-xl bg-muted hover:bg-muted/80 text-foreground touch-manipulation transition-transform active:scale-[0.98]"
                  size="lg"
                >
                  <Mail className="w-5 h-5 mr-2.5" />
                  Continuer avec email
                </Button>

                {/* Terms */}
                <p className="text-[11px] text-center text-muted-foreground/60 pt-4 leading-relaxed">
                  En continuant, vous acceptez nos{' '}
                  <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Conditions</a>
                  {' '}et notre{' '}
                  <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Politique de confidentialité</a>
                </p>
              </motion.div>
            )}

            {/* Step 2: Email Form */}
            {step === 'email' && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    handleBack();
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors min-h-[44px] px-2 -ml-2 rounded-lg touch-manipulation active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 rounded-xl text-[15px]"
                        required
                        autoFocus={!isMobile}
                        onFocus={(e) => {
                          if (isMobile) {
                            setTimeout(() => {
                              e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 150);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-[15px] font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md touch-manipulation transition-transform active:scale-[0.98]"
                    disabled={loading || !email.trim()}
                    onClick={() => haptic.light()}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Continuer'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Password Form */}
            {step === 'password' && (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    handleBack();
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors min-h-[44px] px-2 -ml-2 rounded-lg touch-manipulation active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Changer d'email
                </button>

                {/* Password Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 rounded-xl text-[15px]"
                        required
                        autoFocus={!isMobile}
                        onFocus={(e) => {
                          if (isMobile) {
                            setTimeout(() => {
                              e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 150);
                          }
                        }}
                      />
                    </div>
                    {mode === 'signup' && !isKeyboardOpen && (
                      <p className="text-xs text-muted-foreground">
                        Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                      </p>
                    )}
                  </div>

                  {/* Confirm Password - Only for signup */}
                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-11 h-12 rounded-xl text-[15px]"
                          required
                          onFocus={(e) => {
                            if (isMobile) {
                              setTimeout(() => {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 150);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-[15px] font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md touch-manipulation transition-transform active:scale-[0.98]"
                    disabled={loading}
                    onClick={() => haptic.medium()}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : mode === 'login' ? (
                      'Se connecter'
                    ) : (
                      'Créer mon compte'
                    )}
                  </Button>

                  {/* Forgot password link - only for login */}
                  {mode === 'login' && !(isKeyboardOpen && isMobile) && (
                    <button
                      type="button"
                      className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => toast.info("Fonctionnalité à venir")}
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
