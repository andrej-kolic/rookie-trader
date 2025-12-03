import { useState, useCallback } from 'react';
import { useAuthStore } from '../state/auth-store';
import { validateCredentials } from '../services/kraken-private-service';

/**
 * Hook for managing authentication state and actions
 */
export function useAuth() {
  const {
    credentials,
    isAuthenticated,
    authError,
    setCredentials,
    clearCredentials,
    setAuthError,
  } = useAuthStore();

  const [isValidating, setIsValidating] = useState(false);

  /**
   * Authenticate with API key and secret
   * Validates credentials with Kraken API before storing
   */
  const authenticate = useCallback(
    async (apiKey: string, apiSecret: string): Promise<boolean> => {
      setIsValidating(true);
      setAuthError(null);

      try {
        // Validate credentials with API call
        await validateCredentials(apiKey, apiSecret);

        // If validation succeeds, store credentials
        setCredentials(apiKey, apiSecret);
        setIsValidating(false);
        return true;
      } catch (error) {
        const authError =
          error instanceof Error ? error : new Error('Authentication failed');

        setAuthError(authError);
        setIsValidating(false);
        return false;
      }
    },
    [setCredentials, setAuthError],
  );

  /**
   * Logout and clear credentials
   */
  const logout = useCallback(() => {
    clearCredentials();
  }, [clearCredentials]);

  /**
   * Get masked API key for display
   */
  const getMaskedApiKey = useCallback((): string => {
    return credentials?.getMaskedApiKey() ?? '';
  }, [credentials]);

  return {
    credentials,
    isAuthenticated,
    isValidating,
    authError,
    authenticate,
    logout,
    getMaskedApiKey,
  };
}
