/**
 * Landing page pour les propriétaires
 * Proposition de valeur honnête: références vérifiées, profils complets, identité confirmée
 * Pas de promesses qu'on ne peut pas tenir (pas de score, pas de crédit, pas de relevés)
 */

import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import {
  Building2, Users, Plus, ArrowRight, CheckCircle2,
  MessageSquare, Shield, HelpCircle,
  UserCheck, Briefcase, MapPin,
  AlertTriangle, Scale, Star, Mail, Phone, BadgeCheck,
  Search, Eye
} from "lucide-react";

// FAQ data for SEO
const faqData = [
  {
    question: "Comment fonctionnent les références sur LocaSur ?",
    answer: "Les propriétaires peuvent déclarer leurs anciens locataires sur la plateforme. Le locataire reçoit une invitation pour confirmer la relation locative. Une fois que les deux parties ont validé, la référence est marquée comme vérifiée. Vous pouvez ainsi voir l'historique locatif confirmé d'un candidat."
  },
  {
    question: "Qu'est-ce que la vérification d'identité ?",
    answer: "Les locataires peuvent vérifier leur identité en 3 étapes : confirmation d'email (25 points), vérification de téléphone par SMS (35 points) et soumission d'une pièce d'identité (40 points). Un profil avec identité confirmée (100/100) vous donne plus de confiance."
  },
  {
    question: "Qu'est-ce que je vois sur le profil d'un locataire ?",
    answer: "Vous voyez son occupation professionnelle, le nombre d'occupants, ses villes recherchées, son budget, sa date d'emménagement souhaitée, son niveau de vérification d'identité, et ses références d'anciens propriétaires si disponibles."
  },
  {
    question: "Est-ce vraiment gratuit pour les propriétaires ?",
    answer: "Oui, LocaSur est 100% gratuit. Vous pouvez publier des annonces, consulter les profils des locataires et les contacter par messagerie sans aucun frais."
  },
  {
    question: "Comment les locataires publient-ils une demande ?",
    answer: "Les locataires remplissent un formulaire avec leurs critères : budget, villes recherchées, type de logement, date d'emménagement, nombre d'occupants. Vous pouvez parcourir ces demandes et contacter directement ceux qui correspondent à votre logement."
  }
];

export default function PourProprietaires() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState('/demandes');

  const handleCTAClick = (destination: string) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      setAuthRedirectTo(destination);
      setAuthModalOpen(true);
    }
  };

  // Schema.org FAQ markup
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Trouver un locataire fiable au Québec - Références vérifiées | LocaSur</title>
        <meta name="description" content="Trouvez des locataires avec références vérifiées d'anciens propriétaires et identité confirmée. Consultez les profils détaillés avant de contacter. 100% gratuit." />
        <meta name="keywords" content="trouver locataire quebec, reference ancien proprietaire, verification locataire, louer logement, proprietaire, locataire fiable" />
        <link rel="canonical" href="https://locasur.ca/pour-proprietaires" />

        {/* Open Graph */}
        <meta property="og:title" content="Trouver un locataire fiable - Références vérifiées | LocaSur" />
        <meta property="og:description" content="Références vérifiées d'anciens propriétaires, identité confirmée, profils détaillés. Gratuit." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://locasur.ca/pour-proprietaires" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Locataires avec références vérifiées | LocaSur" />
        <meta name="twitter:description" content="Références d'anciens propriétaires vérifiées, identité confirmée. 100% gratuit." />

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-32 md:pb-20 px-4">
        <div className="container-narrow">
          <div className="text-center max-w-2xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Building2 className="w-4 h-4" />
              <span>Pour les propriétaires</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            >
              Trouvez des locataires
              <br />
              <span className="text-gradient-match">avec références vérifiées</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Consultez les références d'anciens propriétaires, l'identité vérifiée et le profil complet de chaque candidat avant de le contacter.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="gradient-match text-match-foreground rounded-xl h-12 px-6"
                onClick={() => handleCTAClick('/demandes')}
              >
                <Users className="w-5 h-5 mr-2" />
                Voir les locataires disponibles
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl h-12 px-6"
                onClick={() => handleCTAClick('/host/listing/new')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Publier une annonce
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ce que vous savez sur chaque candidat */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-4"
            >
              <Shield className="w-4 h-4" />
              <span>Transparence</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ce que vous savez avant de contacter
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Chaque locataire a un profil détaillé que vous consultez librement
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Références vérifiées */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border-2 border-primary/30 shadow-soft"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Références d'anciens propriétaires</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Les anciens propriétaires déclarent leurs locataires sur la plateforme. Le locataire confirme. Les deux parties valident = référence vérifiée.
              </p>
              <div className="bg-emerald-500/10 rounded-lg p-3">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">Confirmation bidirectionnelle</span>
                </div>
              </div>
            </motion.div>

            {/* Identité vérifiée */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Identité vérifiée</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                3 niveaux de vérification : email confirmé, téléphone vérifié par SMS, et pièce d'identité soumise.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Mail, label: "Email confirmé", points: "25 pts" },
                  { icon: Phone, label: "Téléphone vérifié", points: "35 pts" },
                  { icon: BadgeCheck, label: "Pièce d'identité", points: "40 pts" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <step.icon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{step.label}</span>
                    </div>
                    <span className="text-muted-foreground">{step.points}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Profil détaillé */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Profil complet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Consultez toutes les informations du candidat avant de le contacter.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Briefcase, label: "Occupation professionnelle" },
                  { icon: Users, label: "Nombre d'occupants" },
                  { icon: MapPin, label: "Villes et budget recherchés" },
                  { icon: MessageSquare, label: "Message de présentation" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <item.icon className="w-3.5 h-3.5 text-violet-500" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 md:py-24">
        <div className="container-wide px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              2 façons de trouver vos locataires
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Option 1: Demandes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-card rounded-2xl p-6 border-2 border-primary/50 shadow-soft"
            >
              <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Recommandé
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Parcourez les demandes</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Des locataires ont déjà publié ce qu'ils cherchent avec leur budget, villes et critères. Contactez ceux qui correspondent à votre logement.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Locataires actifs qui cherchent maintenant",
                  "Budget et critères affichés clairement",
                  "Références et vérification visibles",
                  "Contact direct par messagerie"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-xl gradient-match text-match-foreground"
                onClick={() => handleCTAClick('/demandes')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir les demandes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Option 2: Publier */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-soft transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Publiez une annonce</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Créez votre annonce et laissez les locataires vous contacter. Recevez des candidatures directement dans votre messagerie.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Publication gratuite et illimitée",
                  "Photos et description détaillée",
                  "Les locataires vous trouvent",
                  "Gestion des candidatures simplifiée"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => handleCTAClick('/host/listing/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer mon annonce
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mieux choisir, éviter les mauvaises surprises */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-card rounded-2xl border border-amber-500/30 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Mieux choisir, éviter les mauvaises surprises</h2>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Un mauvais choix de locataire peut mener à des <span className="font-semibold text-foreground">mois de procédures au TAL</span> et des <span className="font-semibold text-foreground">milliers de dollars</span> en loyers impayés. Mieux vaut bien choisir dès le départ.
                </p>
              </div>

              <p className="font-medium mb-4">
                LocaSur vous donne les outils pour faire un choix éclairé :
              </p>

              <div className="space-y-3">
                {[
                  "Références d'anciens propriétaires avec confirmation des deux parties",
                  "Identité vérifiée (email, téléphone, pièce d'identité)",
                  "Profil détaillé : occupation, nombre d'occupants, présentation",
                  "Messagerie intégrée pour poser vos questions avant de vous engager",
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  className="w-full sm:w-auto rounded-xl gradient-match text-match-foreground"
                  onClick={() => handleCTAClick('/demandes')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Voir les locataires disponibles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 md:py-24">
        <div className="container-wide px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Pourquoi LocaSur ?
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Star,
                title: "Références vérifiées",
                description: "Avis d'anciens propriétaires confirmés par les deux parties"
              },
              {
                icon: BadgeCheck,
                title: "Identité confirmée",
                description: "Email, téléphone et pièce d'identité vérifiés"
              },
              {
                icon: UserCheck,
                title: "Profils détaillés",
                description: "Occupation, situation et présentation de chaque candidat"
              },
              {
                icon: Shield,
                title: "100% Gratuit",
                description: "Publication, consultation et messagerie sans frais"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - SEO */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Questions fréquentes</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold"
            >
              FAQ Propriétaires
            </motion.h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground pl-8">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container-narrow px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-2xl p-8 md:p-12 text-center border border-primary/20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-match flex items-center justify-center">
              <Shield className="w-8 h-8 text-match-foreground" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Choisissez votre prochain locataire en toute confiance
            </h2>

            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Consultez les références, l'identité vérifiée et le profil complet de chaque candidat. Gratuitement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="gradient-match text-match-foreground rounded-xl h-12 px-8"
                  onClick={() => handleCTAClick('/demandes')}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Voir les locataires disponibles
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl h-12 px-8"
                onClick={() => handleCTAClick('/host/listing/new')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Publier une annonce
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Références vérifiées • Identité confirmée • 100% gratuit
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <MobileNav />

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        trigger="host"
        defaultMode="signup"
        redirectTo={authRedirectTo}
      />
    </div>
    </>
  );
}
