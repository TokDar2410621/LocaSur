import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MapPin, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { motion } from "framer-motion";
import {
  getTenancyConfirmationInfo,
  confirmTenancy,
  type TenancyConfirmationInfo
} from "@/lib/searchApi";

export default function ConfirmTenancy() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tenancyInfo, setTenancyInfo] = useState<TenancyConfirmationInfo | null>(null);
  const [confirmDecision, setConfirmDecision] = useState<boolean | null>(null);

  // Form pour corrections (si l'utilisateur conteste)
  const [corrections, setCorrections] = useState({
    address: '',
    city: '',
    start_date: '',
    end_date: '',
    monthly_rent: ''
  });

  useEffect(() => {
    if (token) {
      loadTenancyInfo();
    }
  }, [token]);

  const loadTenancyInfo = async () => {
    if (!token) return;

    try {
      const response = await getTenancyConfirmationInfo(token);
      if (response.success && response.tenancy_record) {
        setTenancyInfo(response);
        // Pré-remplir avec les valeurs existantes
        setCorrections({
          address: response.tenancy_record.address,
          city: response.tenancy_record.city,
          start_date: response.tenancy_record.start_date,
          end_date: response.tenancy_record.end_date || '',
          monthly_rent: response.tenancy_record.monthly_rent?.toString() || ''
        });
      } else {
        toast.error("Invitation invalide ou expirée");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement");
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!token || confirmDecision === null) return;

    setSubmitting(true);
    try {
      const data = confirmDecision
        ? { confirm: true }
        : {
            confirm: false,
            corrections: {
              address: corrections.address,
              city: corrections.city,
              start_date: corrections.start_date,
              end_date: corrections.end_date || undefined,
              monthly_rent: corrections.monthly_rent ? parseFloat(corrections.monthly_rent) : undefined
            }
          };

      const response = await confirmTenancy(token, data);
      if (response.success) {
        toast.success(
          confirmDecision
            ? "Location confirmée avec succès!"
            : "Corrections envoyées avec succès!"
        );
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la confirmation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <MobileNav />
        <div className="min-h-screen bg-background pt-28 md:pt-20 pb-24 md:pb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  if (!tenancyInfo) {
    return null;
  }

  const { tenancy_record, declared_by } = tenancyInfo;

  return (
    <>
      <Helmet>
        <title>Confirmer une location - LocaSur</title>
      </Helmet>

      <Navbar />
      <MobileNav />

      <div className="min-h-screen bg-background pt-28 md:pt-20 pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Confirmation de location</h1>
            <p className="text-muted-foreground">
              {declared_by === 'tenant'
                ? "Un ancien locataire a déclaré avoir loué chez vous"
                : "Un ancien propriétaire a déclaré vous avoir loué un logement"}
            </p>
          </motion.div>

          {/* Rental Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Détails déclarés</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{tenancy_record.address}</p>
                  <p className="text-sm text-muted-foreground">{tenancy_record.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Du:</span>{" "}
                    {new Date(tenancy_record.start_date).toLocaleDateString('fr-CA')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Au:</span>{" "}
                    {tenancy_record.end_date
                      ? new Date(tenancy_record.end_date).toLocaleDateString('fr-CA')
                      : "En cours"}
                  </p>
                </div>
              </div>

              {tenancy_record.monthly_rent && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm">
                    <span className="font-medium">Loyer:</span> {tenancy_record.monthly_rent}$/mois
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Decision Section */}
          {confirmDecision === null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center">
                Ces informations sont-elles correctes?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-auto py-6 flex flex-col gap-2"
                  onClick={() => setConfirmDecision(true)}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Oui, tout est correct</span>
                  <span className="text-xs opacity-80">Confirmer la location</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-2"
                  onClick={() => setConfirmDecision(false)}
                >
                  <XCircle className="w-6 h-6" />
                  <span className="font-semibold">Non, il y a des erreurs</span>
                  <span className="text-xs opacity-80">Proposer des corrections</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Confirm Action */}
          {confirmDecision === true && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Confirmation
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    En confirmant, vous activez le système de références bidirectionnel pour cette location.
                    Vous pourrez ensuite échanger des références avec{" "}
                    {declared_by === 'tenant' ? "votre ancien locataire" : "votre ancien propriétaire"}.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Confirmation..." : "Confirmer la location"}
                </Button>
                <Button variant="outline" onClick={() => setConfirmDecision(null)}>
                  Annuler
                </Button>
              </div>
            </motion.div>
          )}

          {/* Corrections Form */}
          {confirmDecision === false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Proposer des corrections
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                    Modifiez les informations incorrectes ci-dessous. Vos corrections seront envoyées pour révision.
                  </p>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Adresse</label>
                    <AddressAutocomplete
                      value={corrections.address}
                      onChange={(value) => setCorrections({ ...corrections, address: value })}
                      onSelect={(suggestion) => {
                        setCorrections({
                          ...corrections,
                          address: suggestion.adresse,
                          city: suggestion.ville || corrections.city
                        });
                      }}
                      placeholder="Commencez à taper l'adresse..."
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ville</label>
                    <input
                      type="text"
                      required
                      value={corrections.city}
                      onChange={(e) => setCorrections({ ...corrections, city: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Date de début</label>
                    <input
                      type="date"
                      required
                      value={corrections.start_date}
                      onChange={(e) => setCorrections({ ...corrections, start_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Date de fin</label>
                    <input
                      type="date"
                      value={corrections.end_date}
                      onChange={(e) => setCorrections({ ...corrections, end_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Loyer mensuel</label>
                    <input
                      type="number"
                      value={corrections.monthly_rent}
                      onChange={(e) => setCorrections({ ...corrections, monthly_rent: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Envoi..." : "Envoyer les corrections"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmDecision(null)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
