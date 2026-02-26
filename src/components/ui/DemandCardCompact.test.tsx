/**
 * Tests pour DemandCardCompact
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { DemandCardCompact } from "./DemandCardCompact";
import type { DemandePublique } from "@/lib/matchApi";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Données de test
const mockDemande: DemandePublique = {
  id: 1,
  titre: "Recherche 4½ à Saguenay",
  villes: ["Saguenay"],
  budget_max: 1200,
  nb_pieces_min: 4,
  est_urgente: false,
  locataire: {
    id: 42,
    name: "Jean Tremblay",
    avatar: null,
    is_verified: true,
    verification_level: "verified",
  },
  profil: {
    occupation: "Étudiant",
    preuve_revenu: true,
    references: true,
    animaux: false,
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("DemandCardCompact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the demand title", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.getByText("Recherche 4½ à Saguenay")).toBeInTheDocument();
  });

  it("renders the tenant name", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.getByText("Jean Tremblay")).toBeInTheDocument();
  });

  it("renders the budget", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.getByText("1 200$/mois")).toBeInTheDocument();
  });

  it("renders the city", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.getByText("Saguenay")).toBeInTheDocument();
  });

  it("shows urgent badge when demande is urgent", () => {
    const urgentDemande = { ...mockDemande, est_urgente: true };
    render(<DemandCardCompact demande={urgentDemande} />, { wrapper });

    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("does not show urgent badge when demande is not urgent", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.queryByText("Urgent")).not.toBeInTheDocument();
  });

  it("shows verification badge for verified tenant", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    // The BadgeCheck icon should be present (verified)
    const verifiedIcon = document.querySelector('[class*="text-blue-600"]');
    expect(verifiedIcon).toBeInTheDocument();
  });

  it("calls onContact when contact button is clicked", async () => {
    const user = userEvent.setup();
    const onContact = vi.fn();

    render(
      <DemandCardCompact demande={mockDemande} onContact={onContact} />,
      { wrapper }
    );

    const contactButton = screen.getByRole("button", { name: /contacter/i });
    await user.click(contactButton);

    expect(onContact).toHaveBeenCalledWith(mockDemande);
  });

  it("calls onProfileClick when profile is clicked", async () => {
    const user = userEvent.setup();
    const onProfileClick = vi.fn();

    render(
      <DemandCardCompact demande={mockDemande} onProfileClick={onProfileClick} />,
      { wrapper }
    );

    const profileButton = screen.getByText("Jean Tremblay").closest("button");
    expect(profileButton).toBeInTheDocument();

    if (profileButton) {
      await user.click(profileButton);
      expect(onProfileClick).toHaveBeenCalledWith(42);
    }
  });

  it("navigates to user profile when onProfileClick is not provided", async () => {
    const user = userEvent.setup();

    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    const profileButton = screen.getByText("Jean Tremblay").closest("button");

    if (profileButton) {
      await user.click(profileButton);
      expect(mockNavigate).toHaveBeenCalledWith("/user/42");
    }
  });

  it("shows trust badges when profil has proofs", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.getByText("Revenu")).toBeInTheDocument();
    expect(screen.getByText("Réf.")).toBeInTheDocument();
  });

  it("shows rooms badge when specified", () => {
    render(<DemandCardCompact demande={mockDemande} />, { wrapper });

    expect(screen.getByText("4½+")).toBeInTheDocument();
  });
});
