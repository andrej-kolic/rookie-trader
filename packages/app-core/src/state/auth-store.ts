import { create } from 'zustand';
import { AuthCredentials } from '../domain/AuthCredentials';

const STORAGE_KEY = 'kraken-rookie-trader-auth';

type AuthState = {
  credentials: AuthCredentials | null;
  isAuthenticated: boolean;
  authError: Error | null;

  // Actions
  setCredentials: (apiKey: string, apiSecret: string) => void;
  clearCredentials: () => void;
  setAuthError: (error: Error | null) => void;
  loadCredentialsFromStorage: () => void;

  // Getters
  getCredentials: () => AuthCredentials | null;
};

/**
 * Load credentials from localStorage
 */
function loadFromStorage(): AuthCredentials | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const json = JSON.parse(stored) as {
      apiKey: string;
      apiSecret: string;
      createdAt: string;
    };
    return AuthCredentials.fromJSON(json);
  } catch {
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Save credentials to localStorage
 */
function saveToStorage(credentials: AuthCredentials): void {
  try {
    const json = credentials.toJSON();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  } catch {
    // Silent failure
  }
}

/**
 * Remove credentials from localStorage
 */
function removeFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent failure
  }
}

/**
 * Auth store using Zustand
 * Manages authentication state and persists credentials to localStorage
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  credentials: null,
  isAuthenticated: false,
  authError: null,

  setCredentials: (apiKey: string, apiSecret: string) => {
    const credentials = new AuthCredentials(apiKey, apiSecret);

    // Save to localStorage
    saveToStorage(credentials);

    set({
      credentials,
      isAuthenticated: true,
      authError: null,
    });
  },

  clearCredentials: () => {
    // Remove from localStorage
    removeFromStorage();

    set({
      credentials: null,
      isAuthenticated: false,
      authError: null,
    });
  },

  setAuthError: (error: Error | null) => {
    set({ authError: error });
  },

  loadCredentialsFromStorage: () => {
    const credentials = loadFromStorage();

    if (credentials) {
      set({
        credentials,
        isAuthenticated: true,
        authError: null,
      });
    }
  },

  getCredentials: () => {
    return get().credentials;
  },
}));

/**
 * Initialize auth store on app load
 * Call this once when app starts
 */
export function initializeAuthStore(): void {
  useAuthStore.getState().loadCredentialsFromStorage();
}
