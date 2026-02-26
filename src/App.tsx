import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import { PublicProfileProvider } from "@/contexts/PublicProfileContext";
import { useAutoScrollInput } from "@/hooks/useAutoScrollInput";

// ============================================
// LocaSur - Architecture Simplifiée
// ~20 routes. Pas de bloat.
// ============================================

// Pages publiques
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import AnnonceDetail from "./pages/AnnonceDetail";
import Demandes from "./pages/Demandes";
import PourProprietaires from "./pages/PourProprietaires";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

// Dashboards
import DashboardLocataire from "./pages/DashboardLocataireSimple";
import DashboardProprietaire from "./pages/DashboardProprietaireSimple";

// Création
import CreerDemande from "./pages/CreerDemande";
import CreerAnnonce from "./pages/CreerAnnonce";

// Propriétaire - Leads
import LeadsProprietaire from "./pages/LeadsProprietaire";
import DetailLead from "./pages/DetailLead";

// Shared
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import UnifiedPublicProfile from "./pages/UnifiedPublicProfile";
import DemandePartage from "./pages/DemandePartage";

// Références (public, token-gated)
import SubmitReferenceSimple from "./pages/SubmitReferenceSimple";
import ConfirmTenancy from "./pages/ConfirmTenancy";

// Auth
import OAuthCallback from "./pages/OAuthCallback";

// Chat widget flottant (pas de page dédiée)
import ChatWidget from "./components/chat/ChatWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AutoScrollProvider = ({ children }: { children: React.ReactNode }) => {
  useAutoScrollInput();
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <ScrollToTop />
        <AutoScrollProvider>
        <AuthProvider>
          <MessagesProvider>
          <PublicProfileProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <Routes>
            {/* ====== PUBLIC ====== */}
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/listing/:id" element={<AnnonceDetail />} />
            <Route path="/demandes" element={<Demandes />} />
            <Route path="/pour-proprietaires" element={<PourProprietaires />} />
            <Route path="/help" element={<Help />} />

            {/* ====== LOCATAIRE ====== */}
            <Route path="/dashboard" element={<DashboardLocataire />} />
            <Route path="/dashboard/demande/new" element={<CreerDemande />} />

            {/* ====== PROPRIÉTAIRE ====== */}
            <Route path="/host" element={<DashboardProprietaire />} />
            <Route path="/host/listing/new" element={<CreerAnnonce />} />
            <Route path="/host/listing/:id/edit" element={<CreerAnnonce />} />
            <Route path="/host/leads" element={<LeadsProprietaire />} />
            <Route path="/host/leads/:id" element={<DetailLead />} />

            {/* ====== SHARED ====== */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UnifiedPublicProfile />} />
            <Route path="/match/demandes/:id/partage" element={<DemandePartage />} />

            {/* ====== RÉFÉRENCES (public, token-gated) ====== */}
            <Route path="/reference/:token" element={<SubmitReferenceSimple />} />
            <Route path="/reference/tenant/:token" element={<SubmitReferenceSimple />} />
            <Route path="/confirm/:token" element={<ConfirmTenancy />} />

            {/* ====== AUTH ====== */}
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* ====== 404 ====== */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ChatWidget />
          </TooltipProvider>
          </PublicProfileProvider>
          </MessagesProvider>
        </AuthProvider>
        </AutoScrollProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
