/**
 * Authentication Service - Business Logic Layer
 *
 * Framework-agnostic service containing authentication business logic.
 * Orchestrates between data services and state management.
 * Handles validation, error handling, and business rules.
 */

import { AuthSession } from '../../domain/AuthSession';
import * as authApi from '../../api/auth-api';
import { useAuthStore } from '../../state/auth-store';
import { resetWsToken } from '../../api/kraken-ws-api';

const AUTH_STORAGE_KEY = 'kraken_auth_session';

/**
 * Load session from localStorage
 * Business logic: handles parsing, validation, and expiration checks
 */
function loadSessionFromStorage(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as {
      token: string;
      createdAt: number;
    };
    const session = AuthSession.fromJSON(data);

    // Business rule: expired sessions are invalid
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
 * Business logic: serialization and error handling
 */
function saveSessionToStorage(session: AuthSession): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session.toJSON()));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save session to storage:', error);
  }
}

/**
 * Remove session from localStorage
 * Business logic: cleanup and error handling
 */
function removeSessionFromStorage(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove session from storage:', error);
  }
}

/**
 * Initialize authentication state
 * Loads persisted session and updates store
 */
export function initialize(): void {
  const session = loadSessionFromStorage();
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setLoading(false);
}

/**
 * Login with API credentials
 * Business logic: validation, API call, session creation, persistence
 *
 * @param apiKey - Kraken API key
 * @param apiSecret - Kraken API secret
 * @throws AuthServiceError if login fails
 */
export async function login(apiKey: string, apiSecret: string): Promise<void> {
  const store = useAuthStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    // Call data service
    const loginResponse = await authApi.login({ apiKey, apiSecret });

    // Create domain model
    const authSession = new AuthSession(loginResponse.token);

    // Business rule: persist session for convenience
    saveSessionToStorage(authSession);

    // Update state
    store.setSession(authSession);
    store.setLoading(false);
  } catch (error) {
    // Business logic: convert service errors to user-friendly messages
    const errorMessage =
      error instanceof authApi.AuthServiceError
        ? error.message
        : 'Failed to login. Please try again.';

    store.setSession(null);
    store.setLoading(false);
    store.setError(errorMessage);

    throw error; // Re-throw for caller to handle if needed
  }
}

/**
 * Logout and clear session
 * Business logic: cleanup, API call, state management
 */
export async function logout(): Promise<void> {
  const store = useAuthStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    // Clear WebSocket token cache to force fresh token on next login
    resetWsToken();

    // Call data service (currently no-op, but may invalidate server-side session in future)
    await authApi.logout();

    // Business rule: always clear local session, even if server call fails
    removeSessionFromStorage();
    store.setSession(null);
    store.setLoading(false);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout failed:', error);

    // Business rule: still clear local session on error
    resetWsToken();
    removeSessionFromStorage();
    store.setSession(null);
    store.setLoading(false);
  }
}

/**
 * Clear error message
 */
export function clearError(): void {
  useAuthStore.getState().setError(null);
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

/**
 * Get current auth token (if authenticated)
 */
export function getAuthToken(): string | null {
  const session = useAuthStore.getState().session;
  return session?.token ?? null;
}

/**
 * Get Authorization header value (if authenticated)
 */
export function getAuthHeader(): string | null {
  const session = useAuthStore.getState().session;
  return session?.getAuthHeader() ?? null;
}
