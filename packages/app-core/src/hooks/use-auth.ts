/**
 * useAuth Hook - Hook Layer
 *
 * Custom React hook providing access to authentication state and actions.
 * This is the primary interface for components to interact with auth functionality.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../state/auth-store';

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const initialize = useAuthStore((state) => state.initialize);
  const clearError = useAuthStore((state) => state.clearError);

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    session,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    clearError,

    // Helpers
    getAuthToken: () => session?.token ?? null,
    getAuthHeader: () => session?.getAuthHeader() ?? null,
  };
}
