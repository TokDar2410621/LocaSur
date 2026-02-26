import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Home, ArrowLeft, Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { EMPTY_STATE_IMAGES } from "@/lib/images";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-lg mx-auto">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <div className="w-64 h-48 mx-auto rounded-2xl overflow-hidden shadow-lg">
              <img
                src={EMPTY_STATE_IMAGES.notFound.url}
                alt={EMPTY_STATE_IMAGES.notFound.alt}
                className="w-full h-full object-cover"
              />
            </div>
            {/* 404 Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-xl shadow-lg"
            >
              404
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Page introuvable
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Cette page n'existe pas ou a été déplacée.
              <br />
              Mais ne vous inquiétez pas, votre logement idéal vous attend !
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          >
            <Button
              size="lg"
              className="gradient-search text-search-foreground rounded-xl"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-6 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-4">Recherches populaires</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Chicoutimi", "Jonquière", "Saguenay", "Québec"].map((city) => (
                <Button
                  key={city}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(city)}`)}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {city}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default NotFound;
