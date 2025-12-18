/**
 * Authentication Store - State Management Layer
 *
 * Zustand store managing global authentication state.
 * Handles session persistence, login/logout actions, and reactive state updates.
 */

import { create } from 'zustand';
import { AuthSession } from '../domain/AuthSession';
import * as authService from '../services/auth-service';

const AUTH_STORAGE_KEY = 'kraken_auth_session';

type AuthState = {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;

  // Actions
  login: (apiKey: string, apiSecret: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
};

/**
 * Load session from localStorage
 */
function loadSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as {
      token: string;
      createdAt: number;
    };
    const session = AuthSession.fromJSON(data);

    // Check if session is expired
    if (session?.isExpired()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load session from storage:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * Save session to localStorage
 */
function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session.toJSON()));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save session to storage:', error);
  }
}

/**
 * Remove session from localStorage
 */
function removeSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove session from storage:', error);
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  /**
   * Login with API credentials
   * Creates a new authenticated session and persists it
   */
  login: async (apiKey: string, apiSecret: string) => {
    set({ isLoading: true, error: null });

    try {
      const loginResponse = await authService.login({ apiKey, apiSecret });
      const authSession = new AuthSession(loginResponse.token);

      saveSession(authSession);
      set({
        session: authSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof authService.AuthServiceError
          ? error.message
          : 'Failed to login. Please try again.';

      set({
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error; // Re-throw so container can handle if needed
    }
  },

  /**
   * Logout and clear session
   * Removes session from store and localStorage
   */
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.logout();
      removeSession();
      set({
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed:', error);
      // Still clear local session even if server call fails
      removeSession();
      set({
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Initialize auth state from localStorage
   * Should be called on app startup
   */
  initialize: () => {
    const session = loadSession();
    set({
      session,
      isAuthenticated: session?.isAuthenticated() ?? false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
