/**
 * Centre d'aide - Guide pour locataires et propriétaires
 * Sections avec captures d'écran et explications
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { motion } from "framer-motion";
import {
  Search, FileText, Bell, Heart, MessageSquare, User,
  Building2, Users, Plus, Upload, Eye, ArrowRight,
  ChevronDown, HelpCircle, Mail, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = "locataire" | "proprietaire";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  steps: {
    title: string;
    description: string;
    imagePlaceholder?: string; // URL de la capture d'écran
  }[];
}

// Guides pour les locataires
const locataireGuides: GuideSection[] = [
  {
    id: "search",
    title: "Rechercher un logement",
    icon: Search,
    description: "Comment utiliser notre moteur de recherche intelligent",
    steps: [
      {
        title: "Utilisez la barre de recherche",
        description: "Tapez votre recherche en langage naturel : \"3½ Chicoutimi 800$\" ou \"appartement 2 chambres près UQAC\". Notre IA comprend vos critères.",
        imagePlaceholder: "/screenshots/search-bar.png"
      },
      {
        title: "Affinez avec les filtres",
        description: "Utilisez les filtres pour préciser le prix, le nombre de chambres, le type de logement et la localisation.",
        imagePlaceholder: "/screenshots/search-filters.png"
      },
      {
        title: "Consultez les résultats",
        description: "Parcourez les annonces, consultez les photos et les détails. Cliquez sur une annonce pour voir tous les détails.",
        imagePlaceholder: "/screenshots/search-results.png"
      }
    ]
  },
  {
    id: "demande",
    title: "Créer une demande de logement",
    icon: FileText,
    description: "Publiez ce que vous cherchez et laissez les propriétaires vous contacter",
    steps: [
      {
        title: "Décrivez vos critères",
        description: "Indiquez la ville, votre budget maximum, le type de logement souhaité et votre date d'emménagement.",
        imagePlaceholder: "/screenshots/demande-step1.png"
      },
      {
        title: "Ajoutez des détails sur vous",
        description: "Précisez votre occupation (étudiant, travailleur...) et le nombre d'occupants. Un message personnalisé augmente vos chances.",
        imagePlaceholder: "/screenshots/demande-step2.png"
      },
      {
        title: "Publiez avec ou sans compte",
        description: "Créez un compte pour gérer votre demande, ou publiez directement avec votre email. Les propriétaires vous contacteront.",
        imagePlaceholder: "/screenshots/demande-step3.png"
      }
    ]
  },
  {
    id: "alertes",
    title: "Configurer des alertes",
    icon: Bell,
    description: "Recevez un email quand un nouveau logement correspond à vos critères",
    steps: [
      {
        title: "Définissez vos critères",
        description: "Choisissez la ville, le budget et le type de logement que vous recherchez.",
        imagePlaceholder: "/screenshots/alerte-create.png"
      },
      {
        title: "Choisissez la fréquence",
        description: "Recevez des alertes instantanées ou un résumé quotidien des nouvelles annonces.",
        imagePlaceholder: "/screenshots/alerte-frequency.png"
      },
      {
        title: "Gérez vos alertes",
        description: "Activez, désactivez ou supprimez vos alertes depuis votre tableau de bord.",
        imagePlaceholder: "/screenshots/alerte-manage.png"
      }
    ]
  },
  {
    id: "favoris",
    title: "Sauvegarder des favoris",
    icon: Heart,
    description: "Gardez vos annonces préférées pour les comparer plus tard",
    steps: [
      {
        title: "Ajoutez aux favoris",
        description: "Cliquez sur le coeur sur n'importe quelle annonce pour la sauvegarder.",
        imagePlaceholder: "/screenshots/favoris-add.png"
      },
      {
        title: "Consultez vos favoris",
        description: "Retrouvez toutes vos annonces sauvegardées dans votre tableau de bord.",
        imagePlaceholder: "/screenshots/favoris-list.png"
      }
    ]
  }
];

// Guides pour les propriétaires
const proprietaireGuides: GuideSection[] = [
  {
    id: "demandes-locataires",
    title: "Consulter les demandes des locataires",
    icon: Users,
    description: "Trouvez des locataires qui cherchent activement un logement comme le vôtre",
    steps: [
      {
        title: "Accédez aux demandes",
        description: "Depuis votre dashboard propriétaire, cliquez sur \"Voir les demandes\" pour consulter les locataires qui cherchent un logement.",
        imagePlaceholder: "/screenshots/pro-demandes-access.png"
      },
      {
        title: "Filtrez par critères",
        description: "Filtrez les demandes par ville, budget et type de logement pour trouver celles qui correspondent à votre bien.",
        imagePlaceholder: "/screenshots/pro-demandes-filter.png"
      },
      {
        title: "Contactez les locataires",
        description: "Cliquez sur une demande pour voir le profil complet et envoyer un message au locataire.",
        imagePlaceholder: "/screenshots/pro-demandes-contact.png"
      }
    ]
  },
  {
    id: "creer-annonce",
    title: "Publier une annonce",
    icon: Plus,
    description: "Créez votre annonce et recevez des candidatures de locataires intéressés",
    steps: [
      {
        title: "Décrivez votre logement",
        description: "Indiquez l'adresse, le prix, le nombre de pièces et les caractéristiques de votre logement.",
        imagePlaceholder: "/screenshots/pro-annonce-step1.png"
      },
      {
        title: "Ajoutez des photos",
        description: "Téléchargez des photos de qualité. Les annonces avec photos reçoivent 5x plus de contacts.",
        imagePlaceholder: "/screenshots/pro-annonce-photos.png"
      },
      {
        title: "Publiez et gérez",
        description: "Votre annonce est visible immédiatement. Gérez les candidatures depuis votre dashboard.",
        imagePlaceholder: "/screenshots/pro-annonce-publish.png"
      }
    ]
  },
  {
    id: "gerer-leads",
    title: "Gérer les candidatures",
    icon: Eye,
    description: "Suivez et répondez aux locataires intéressés par votre logement",
    steps: [
      {
        title: "Consultez vos leads",
        description: "Accédez à la liste des locataires qui ont postulé ou consulté votre annonce.",
        imagePlaceholder: "/screenshots/pro-leads-list.png"
      },
      {
        title: "Évaluez les profils",
        description: "Consultez les profils complets : occupation, nombre d'occupants, message de présentation.",
        imagePlaceholder: "/screenshots/pro-leads-profile.png"
      },
      {
        title: "Contactez par messagerie",
        description: "Échangez avec les candidats via notre messagerie intégrée pour organiser les visites.",
        imagePlaceholder: "/screenshots/pro-leads-message.png"
      }
    ]
  }
];

function GuideCard({ guide, isExpanded, onToggle }: { guide: GuideSection; isExpanded: boolean; onToggle: () => void }) {
  const Icon = guide.icon;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{guide.title}</h3>
          <p className="text-sm text-muted-foreground">{guide.description}</p>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform",
          isExpanded && "rotate-180"
        )} />
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border"
        >
          <div className="p-5 space-y-6">
            {guide.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                  {/* Screenshot ou placeholder */}
                  {step.imagePlaceholder && (
                    <div className="relative aspect-video bg-muted rounded-xl border border-border overflow-hidden">
                      <img
                        src={step.imagePlaceholder}
                        alt={step.title}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 items-center justify-center hidden" style={{ display: 'none' }}>
                        <div className="text-center p-4">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Capture d'écran à venir
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Help() {
  const [userType, setUserType] = useState<UserType>("locataire");
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const guides = userType === "locataire" ? locataireGuides : proprietaireGuides;

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Centre d'aide - Guide locataires et proprietaires | LocaSur</title>
        <meta name="description" content="Apprenez a utiliser LocaSur : rechercher un logement, creer une demande, publier une annonce. Guides pas a pas pour locataires et proprietaires." />
        <meta name="keywords" content="aide housing ai, guide locataire, guide proprietaire, recherche logement quebec, publier annonce gratuite" />
        <link rel="canonical" href="https://locasur.ca/help" />

        {/* Open Graph */}
        <meta property="og:title" content="Centre d'aide LocaSur" />
        <meta property="og:description" content="Guides pas a pas pour locataires et proprietaires" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://locasur.ca/help" />

        {/* Schema.org FAQPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Comment rechercher un logement sur LocaSur ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Utilisez la barre de recherche en langage naturel (ex: '3½ Chicoutimi 800$'). Notre IA comprend vos critères. Affinez ensuite avec les filtres pour préciser le prix, le nombre de chambres, le type de logement et la localisation. Consultez les résultats et cliquez sur une annonce pour voir tous les détails."
                }
              },
              {
                "@type": "Question",
                "name": "Comment créer une demande de logement ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Décrivez vos critères (ville, budget, type de logement, date d'emménagement). Ajoutez des détails sur vous (occupation, nombre d'occupants). Publiez avec ou sans compte - les propriétaires vous contacteront directement."
                }
              },
              {
                "@type": "Question",
                "name": "Comment configurer des alertes pour de nouveaux logements ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Définissez vos critères (ville, budget, type de logement). Choisissez la fréquence (instantanée ou résumé quotidien). Gérez vos alertes depuis votre tableau de bord pour les activer, désactiver ou supprimer."
                }
              },
              {
                "@type": "Question",
                "name": "Comment publier une annonce en tant que propriétaire ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Décrivez votre logement (adresse, prix, nombre de pièces, caractéristiques). Ajoutez des photos de qualité - les annonces avec photos reçoivent 5x plus de contacts. Publiez et gérez les candidatures depuis votre dashboard. C'est 100% gratuit."
                }
              },
              {
                "@type": "Question",
                "name": "Comment fonctionnent les demandes de locataires ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Depuis votre dashboard propriétaire, consultez les demandes des locataires qui cherchent activement un logement. Filtrez par ville, budget et type de logement. Contactez directement les locataires qui correspondent à votre bien via notre messagerie intégrée."
                }
              },
              {
                "@type": "Question",
                "name": "LocaSur est-il gratuit ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, LocaSur est 100% gratuit pour les locataires et les propriétaires. Recherche de logements, création de demandes, publication d'annonces, alertes email, messagerie - tout est gratuit sans limite."
                }
              },
              {
                "@type": "Question",
                "name": "Quelles villes sont couvertes par LocaSur ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "LocaSur couvre toute la province de Québec : Saguenay, Chicoutimi, Québec, Montréal, Trois-Rivières, Sherbrooke, et plus."
                }
              },
              {
                "@type": "Question",
                "name": "Comment sauvegarder mes annonces préférées ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Cliquez sur le cœur sur n'importe quelle annonce pour la sauvegarder dans vos favoris. Retrouvez toutes vos annonces sauvegardées dans votre tableau de bord pour les comparer facilement."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <section className="pt-28 pb-12 px-4">
          <div className="container-narrow text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Centre d'aide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Comment utiliser LocaSur ?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Guides pas à pas pour locataires et propriétaires
            </motion.p>

            {/* Toggle locataire/propriétaire */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex p-1 rounded-xl bg-muted"
            >
              <button
                onClick={() => { setUserType("locataire"); setExpandedGuide(null); }}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  userType === "locataire"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="w-4 h-4 inline-block mr-2" />
                Je suis locataire
              </button>
              <button
                onClick={() => { setUserType("proprietaire"); setExpandedGuide(null); }}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  userType === "proprietaire"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="w-4 h-4 inline-block mr-2" />
                Je suis propriétaire
              </button>
            </motion.div>
          </div>
        </section>

        {/* Guides */}
        <section className="pb-16 px-4">
          <div className="container-narrow">
            <div className="space-y-4">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GuideCard
                    guide={guide}
                    isExpanded={expandedGuide === guide.id}
                    onToggle={() => toggleGuide(guide.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-muted/30 px-4">
          <div className="container-narrow">
            <h2 className="text-xl font-semibold mb-6 text-center">Actions rapides</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {userType === "locataire" ? (
                <>
                  <Link
                    to="/search"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-soft transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Search className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Rechercher un logement</p>
                      <p className="text-sm text-muted-foreground">Commencer votre recherche</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/dashboard/demande/new"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-violet-500/50 hover:shadow-soft transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Créer une demande</p>
                      <p className="text-sm text-muted-foreground">Les propriétaires vous contactent</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/demandes"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-soft transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Voir les demandes</p>
                      <p className="text-sm text-muted-foreground">Locataires qui cherchent</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/host/listing/new"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-violet-500/50 hover:shadow-soft transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Publier une annonce</p>
                      <p className="text-sm text-muted-foreground">Gratuit et rapide</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 px-4">
          <div className="container-narrow">
            <div className="text-center p-8 rounded-2xl border border-border bg-card">
              <Mail className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Besoin d'aide supplémentaire ?</h2>
              <p className="text-muted-foreground mb-4">
                Notre équipe est là pour vous aider
              </p>
              <a
                href="mailto:support@locasur.ca"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                support@locasur.ca
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <Footer />
        <MobileNav />
      </div>
    </>
  );
}
