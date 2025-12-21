/**
 * Authentication Store - Pure State Management Layer
 *
 * Anemic state container for authentication data.
 * Contains no business logic - only state and simple setters.
 * Business logic lives in auth-business-service.ts
 */

import { create } from 'zustand';
import { AuthSession } from '../domain/AuthSession';

type AuthState = {
  // State
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;

  // Computed (derived state)
  isAuthenticated: boolean;

  // State setters (no business logic)
  setSession: (session: AuthSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  // Initial state
  session: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  /**
   * Set session and update computed isAuthenticated state
   */
  setSession: (session: AuthSession | null) => {
    set({
      session,
      isAuthenticated: session?.isAuthenticated() ?? false,
    });
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error });
  },
}));
