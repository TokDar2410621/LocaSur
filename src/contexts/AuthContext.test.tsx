/**
 * Tests pour AuthContext
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./AuthContext";
import api from "@/lib/api";

// Mock de l'API
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

// Wrapper pour les tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useAuthContext", () => {
    it("throws error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow("useAuthContext must be used within AuthProvider");

      consoleSpy.mockRestore();
    });

    it("provides initial loading state", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        authenticated: false,
        user: null,
      });

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      // Initially loading
      expect(result.current.loading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("sets user when authenticated", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        user_type: "locataire" as const,
      };

      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        authenticated: true,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("sets user to null when not authenticated", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        authenticated: false,
        user: null,
      });

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    it("calls API and sets user on successful login", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        user_type: "locataire" as const,
      };

      // Initial fetch returns no user
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        authenticated: false,
        user: null,
      });

      // Login returns user
      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        token: "test-token",
        user: mockUser,
      });

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Perform login
      const loginResponse = await result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(loginResponse.success).toBe(true);

      // Wait for user state to update
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("logout", () => {
    it("clears user on logout", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        user_type: "locataire" as const,
      };

      // Initial fetch returns user
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        authenticated: true,
        user: mockUser,
      });

      // Logout succeeds
      vi.mocked(api.post).mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Perform logout
      await result.current.logout();

      // Wait for user state to clear
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
