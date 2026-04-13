/**
 * useAuth Hook - Hook Layer
 *
 * Custom React hook providing access to authentication state and actions.
 * This is the primary interface for components to interact with auth functionality.
 * Wraps the business service layer with React integration.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../state/auth-store';
import * as authBusinessService from '../services/auth-service';

export function useAuth() {
  // Subscribe to state
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // Initialize auth state on mount
  useEffect(() => {
    authBusinessService.initialize();
  }, []);

  return {
    // State
    session,
    isAuthenticated,
    isLoading,
    error,

    // Actions (from business service)
    login: authBusinessService.login,
    logout: authBusinessService.logout,
    clearError: authBusinessService.clearError,

    // Helpers (from business service)
    getAuthToken: authBusinessService.getAuthToken,
    getAuthHeader: authBusinessService.getAuthHeader,
  };
}
