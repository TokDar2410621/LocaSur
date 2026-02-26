import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, Building2, Sparkles, Shield,
  Zap, MapPin, Users, FileText, MessageSquare, CheckCircle2, Bot, ChevronDown
} from "lucide-react";
import { HERO_CAROUSEL_IMAGES, getCityImage } from "@/lib/images";
import { useUserLocation, formatLocationText } from "@/hooks/useUserLocation";
import { useIsMobile } from "@/hooks/use-mobile";

const popularCities = [
  "Montréal", "Québec", "Laval", "Gatineau", "Saguenay", "Sherbrooke"
];

const exploreCities = [
  "Montréal", "Québec", "Saguenay", "Sherbrooke", "Gatineau", "Trois-Rivières"
];

const cityOptions = [
  { value: "", label: "Où ?" },
  { value: "Montréal", label: "Montréal" },
  { value: "Québec", label: "Québec" },
  { value: "Laval", label: "Laval" },
  { value: "Gatineau", label: "Gatineau" },
  { value: "Saguenay", label: "Saguenay" },
  { value: "Sherbrooke", label: "Sherbrooke" },
  { value: "Trois-Rivières", label: "Trois-Rivières" },
];

const budgetOptions = [
  { value: "", label: "Budget" },
  { value: "0-600", label: "Moins de 600$" },
  { value: "600-800", label: "600$ - 800$" },
  { value: "800-1000", label: "800$ - 1 000$" },
  { value: "1000-1200", label: "1 000$ - 1 200$" },
  { value: "1200-1500", label: "1 200$ - 1 500$" },
  { value: "1500+", label: "1 500$+" },
];

const typeOptions = [
  { value: "", label: "Type" },
  { value: "1½", label: "Studio / 1½" },
  { value: "2½", label: "2½" },
  { value: "3½", label: "3½" },
  { value: "4½", label: "4½" },
  { value: "5½", label: "5½+" },
  { value: "condo", label: "Condo" },
  { value: "maison", label: "Maison" },
];

export default function Index() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchCity, setSearchCity] = useState("");
  const [searchBudget, setSearchBudget] = useState("");
  const [searchType, setSearchType] = useState("");

  const { location: userLocation, isLoading: isLocationLoading } = useUserLocation();
  const heroLocationText = formatLocationText(userLocation);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleStructuredSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set("q", searchCity);
    if (searchBudget) params.set("budget", searchBudget);
    if (searchType) params.set("type", searchType);
    navigate(`/search?${params.toString()}`);
  };

  const handleCitySearch = (city: string) => {
    navigate(`/search?q=${encodeURIComponent(city)}`);
  };

  return (
    <>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* ===================== HERO - Full Bleed ===================== */}
        <section className="relative min-h-[85vh] md:min-h-[75vh] flex items-center justify-center overflow-hidden">
          {/* Background Image Carousel */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={HERO_CAROUSEL_IMAGES[currentImageIndex].url}
                alt={HERO_CAROUSEL_IMAGES[currentImageIndex].alt}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                loading="eager"
              />
            </AnimatePresence>
            {/* Base dimming layer */}
            <div className="absolute inset-0 dark:hidden" style={{
              background: `hsla(230,60%,96%,0.45)`
            }} />
            <div className="absolute inset-0 hidden dark:block" style={{
              background: `hsla(230,20%,5%,0.5)`
            }} />
            {/* Couche 1 - Radial central */}
            <div className="absolute inset-0 dark:hidden" style={{
              background: `radial-gradient(circle at 50% 45%, hsla(0,0%,100%,0.92) 0%, transparent 60%)`
            }} />
            <div className="absolute inset-0 hidden dark:block" style={{
              background: `radial-gradient(circle at 50% 45%, hsla(230,20%,5%,0.75) 0%, transparent 60%)`
            }} />
            {/* Couche 2 - Vignette bords */}
            <div className="absolute inset-0 dark:hidden" style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 45%, transparent 25%, hsla(230,60%,92%,0.85) 100%)`
            }} />
            <div className="absolute inset-0 hidden dark:block" style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, hsla(230,20%,4%,0.85) 100%)`
            }} />
            {/* Couche 3 - Gradient haut */}
            <div className="absolute inset-0 dark:hidden" style={{
              background: `linear-gradient(to bottom, hsla(230,80%,95%,0.7) 0%, transparent 55%)`
            }} />
            <div className="absolute inset-0 hidden dark:block" style={{
              background: `linear-gradient(to bottom, hsla(230,20%,5%,0.6) 0%, transparent 50%)`
            }} />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full px-4 pt-24 pb-16 md:pt-32 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-white mb-2 md:mb-3 leading-tight font-display"
              >
                Trouvez votre{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  logement idéal
                </span>
                <br />
                <motion.span
                  key={heroLocationText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-[hsl(280,70%,50%)]"
                >
                  {isLocationLoading ? "au Québec" : heroLocationText}
                </motion.span>
              </motion.h1>

              {/* Subtitle - matching reference */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-lg sm:text-xl md:text-2xl text-foreground/80 dark:text-white/80 mb-1.5 font-semibold"
              >
                Grâce à{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-bold">
                  l'IA
                </span>
                , en quelques secondes.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base text-muted-foreground dark:text-white/60 mb-2"
              >
                Matching intelligent entre étudiants et propriétaires.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-sm text-muted-foreground dark:text-white/50 mb-7 md:mb-8"
              >
                Simple. Rapide. Gratuit.
              </motion.p>

              {/* ===== Search Bar ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="max-w-2xl mx-auto mb-4"
              >
                <div className="bg-card/95 dark:bg-card/90 backdrop-blur-xl rounded-full p-1.5 shadow-xl border border-border/50 flex items-center gap-0">
                  {/* Où ? */}
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full h-11 pl-4 pr-8 bg-transparent text-foreground text-sm font-medium rounded-full appearance-none cursor-pointer focus:outline-none focus:bg-muted/50 transition-colors"
                    >
                      {cityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <div className="w-px h-6 bg-border/60 flex-shrink-0" />

                  {/* Budget */}
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                      className="w-full h-11 pl-4 pr-8 bg-transparent text-foreground text-sm font-medium rounded-full appearance-none cursor-pointer focus:outline-none focus:bg-muted/50 transition-colors"
                    >
                      {budgetOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Type - Desktop only */}
                  {!isMobile && (
                    <>
                      <div className="w-px h-6 bg-border/60 flex-shrink-0" />
                      <div className="relative flex-1 min-w-0">
                        <select
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                          className="w-full h-11 pl-4 pr-8 bg-transparent text-foreground text-sm font-medium rounded-full appearance-none cursor-pointer focus:outline-none focus:bg-muted/50 transition-colors"
                        >
                          {typeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </>
                  )}

                  {/* Recherche Button */}
                  <motion.button
                    onClick={handleStructuredSearch}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 h-11 px-5 md:px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Recherche</span>
                    <Search className="w-4 h-4 sm:hidden" />
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Secondary CTA - Trouver pour moi (IA) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-center"
              >
                <Link
                  to="/dashboard/demande/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 dark:bg-white/15 backdrop-blur-sm border border-border/60 dark:border-white/20 text-sm font-medium text-secondary hover:text-secondary/80 hover:bg-card dark:hover:bg-white/25 transition-all shadow-sm"
                >
                  <Bot className="w-4 h-4" />
                  <span>
                    Trouver <span className="font-bold">pour moi</span>{" "}
                    <span className="text-primary font-bold">(IA)</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {HERO_CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "bg-primary w-6" : "bg-foreground/20 hover:bg-foreground/40"
                }`}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ===================== 3 FEATURE CARDS ===================== */}
        <section className="relative z-20 -mt-10 md:-mt-14 pb-8 md:pb-12">
          <div className="container-wide px-4">
            {/* Desktop: 3 separate cards */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                {
                  icon: "🧠",
                  title: "Matching IA",
                  titleHighlight: "intelligent",
                  description: "L'IA vous recommande les logements qui correspondent vraiment à vos besoins.",
                },
                {
                  icon: "💬",
                  title: "Chat direct",
                  titleHighlight: "propriétaire",
                  description: "Discutez directement avec les proprios. Simple et sans engagement.",
                },
                {
                  icon: "🛡️",
                  title: "Logements",
                  titleHighlight: "vérifiés",
                  description: "Chaque logement est vérifié par notre équipe pour votre tranquillité.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl p-5 md:p-6 border border-border shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">
                        {feature.title}{" "}
                        <span className="text-primary">{feature.titleHighlight}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile: Single card container with stacked items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:hidden bg-card rounded-2xl border border-border shadow-lg overflow-hidden max-w-lg mx-auto"
            >
              {[
                {
                  icon: "🧠",
                  title: "Matching IA",
                  titleHighlight: "intelligent",
                  description: "L'IA vous recommande les logements qui correspondent vraiment à vos besoins.",
                },
                {
                  icon: "💬",
                  title: "Chat direct",
                  titleHighlight: "propriétaire",
                  description: "Discutez directement avec les proprios. Simple et sans engagement.",
                },
                {
                  icon: "🛡️",
                  title: "Logements",
                  titleHighlight: "vérifiés",
                  description: "Chaque logement est vérifié par notre équipe pour votre tranquillité.",
                },
              ].map((feature, index) => (
                <div key={feature.title}>
                  {index > 0 && <div className="h-px bg-border mx-5" />}
                  <div className="flex items-start gap-3.5 p-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xl">
                      {feature.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm mb-0.5">
                        {feature.title}{" "}
                        <span className="text-primary">{feature.titleHighlight}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===================== COMMENT ÇA MARCHE ===================== */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
          <div className="container-wide px-4">
            <div className="text-center mb-12 md:mb-16">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Notre modèle unique</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-display"
              >
                Les propriétaires viennent à vous
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base"
              >
                Publiez votre demande et recevez des offres de propriétaires vérifiés.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mb-12">
              {[
                {
                  step: 1,
                  icon: FileText,
                  title: "Décrivez ce que vous cherchez",
                  description: "Budget, ville, type de logement, date... Remplissez votre profil en 2 minutes.",
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  step: 2,
                  icon: Users,
                  title: "Les propriétaires vous trouvent",
                  description: "Votre profil est visible par les propriétaires de la région qui ont un logement correspondant.",
                  color: "text-secondary",
                  bg: "bg-secondary/10",
                },
                {
                  step: 3,
                  icon: MessageSquare,
                  title: "Recevez des offres directes",
                  description: "Les propriétaires intéressés vous contactent. Échangez par messagerie et visitez.",
                  color: "text-success",
                  bg: "bg-success/10",
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="relative bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all group text-center"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                    {item.step}
                  </div>

                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-secondary/50 to-transparent" />
                  )}

                  <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-4 mx-auto mt-2`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-12 px-8 text-base shadow-lg"
                asChild
              >
                <Link to="/dashboard/demande/new">
                  <FileText className="w-5 h-5 mr-2" />
                  Créer ma demande gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Gratuit · 2 minutes · Sans engagement
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===================== DEUX PRODUITS ===================== */}
        <section className="py-14 md:py-20">
          <div className="container-wide px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-display">
                Deux façons de trouver votre logement
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Choisissez l'approche qui vous convient
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5 md:gap-8 max-w-4xl mx-auto">
              {/* Search Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onClick={() => navigate('/search')}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/50 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Chercher des annonces</h3>
                    <span className="text-sm text-success font-medium">Gratuit</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-5 text-sm sm:text-base">
                  Parcourez les annonces vérifiées sur LocaSur. Filtrez par ville, prix, type.
                </p>

                <div className="space-y-2.5 mb-6">
                  {["Alertes email automatiques", "Carte interactive", "Annonces vérifiées"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full rounded-xl h-12 text-base group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  Chercher un logement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Match Card - Recommended */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onClick={() => navigate('/dashboard/demande/new')}
                className="bg-secondary/5 border-2 border-secondary rounded-2xl p-6 md:p-8 hover:border-secondary/80 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer relative group order-first md:order-none"
              >
                <div className="flex justify-end -mt-1 mb-2">
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMANDÉ
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Créer mon profil locataire</h3>
                    <span className="text-sm text-success font-medium">Gratuit · 2 min</span>
                  </div>
                </div>

                <p className="text-foreground/90 mb-5 font-medium text-sm sm:text-base">
                  Les propriétaires consultent votre profil vérifié et vous contactent directement.
                </p>

                <div className="space-y-2.5 mb-6">
                  {["Les proprios vous écrivent", "Références vérifiées", "Postulez en 1 clic"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full rounded-xl h-12 text-base bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg">
                  Créer mon profil en 2 min
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center text-sm text-muted-foreground mt-8"
            >
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Profils avec références vérifiées et identité confirmée
              </span>
            </motion.p>
          </div>
        </section>

        {/* ===================== POURQUOI HOUSING AI ===================== */}
        <section className="py-14 md:py-20 bg-muted/30">
          <div className="container-wide px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 font-display">
                Pourquoi LocaSur ?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Ce qui nous différencie des autres plateformes
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "Références vérifiées",
                  description: "Historique locatif confirmé par les deux parties",
                  gradient: "from-secondary to-secondary/80",
                },
                {
                  icon: Search,
                  title: "Recherche intelligente",
                  description: "Trouvez le logement parfait en quelques clics",
                  gradient: "from-primary to-primary/80",
                },
                {
                  icon: Users,
                  title: "Marché inversé",
                  description: "Les proprios vous contactent, pas l'inverse",
                  gradient: "from-success to-success/80",
                },
                {
                  icon: Zap,
                  title: "100% gratuit",
                  description: "Aucun frais pour locataires et propriétaires",
                  gradient: "from-warning to-warning/80",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center group"
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA PROPRIÉTAIRES ===================== */}
        <section className="py-14 md:py-20">
          <div className="container-narrow px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-8 md:p-14 text-center border border-secondary/20"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-secondary-foreground" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-display">Vous êtes propriétaire ?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm sm:text-base">
                Consultez les profils de locataires avec références vérifiées. Publiez votre annonce et trouvez votre locataire idéal. 100% gratuit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-12 px-8 shadow-lg" asChild>
                  <Link to="/pour-proprietaires">
                    Louer mon logement
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8" asChild>
                  <Link to="/host/demandes">
                    <Users className="w-4 h-4 mr-2" />
                    Voir les demandes
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Références vérifiées · Identité confirmée · 100% gratuit
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===================== VILLES POPULAIRES ===================== */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container-wide px-4">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">
                Explorer par ville
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Trouvez des logements dans les principales villes du Québec
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {exploreCities.map((city, index) => {
                const cityImage = getCityImage(city);
                return (
                  <motion.button
                    key={city}
                    onClick={() => handleCitySearch(city)}
                    aria-label={`Rechercher des logements à ${city}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all aspect-[4/3]"
                  >
                    <img
                      src={cityImage.url}
                      alt={`Logements à louer à ${city}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/70 transition-all duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <MapPin className="w-4 h-4 text-white/90" />
                        <p className="font-bold text-white">{city}</p>
                      </div>
                      <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors flex items-center gap-1">
                        Voir les annonces
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Popular city pills */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center gap-2 mt-8"
            >
              <span className="text-sm text-muted-foreground mr-1">Recherches populaires:</span>
              {popularCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySearch(city)}
                  className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary text-sm font-medium transition-all"
                >
                  {city}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        <Footer />
        <MobileNav />
        <div className="h-20 md:hidden" />
      </div>
    </>
  );
}
