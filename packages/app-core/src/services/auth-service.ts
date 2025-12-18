/**
 * Authentication Service - Data Layer
 *
 * Handles all HTTP communication with the kraken-proxy for authentication.
 * This service is responsible for:
 * - User login (encrypting and storing credentials)
 * - WebSocket token retrieval
 * - Logout operations
 */

import { getEnvironmentVariables } from '../utils/environment';

export type LoginCredentials = {
  apiKey: string;
  apiSecret: string;
};

export type LoginResponse = {
  token: string;
};

export type WsTokenResponse = {
  result: {
    token: string;
  };
};

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

/**
 * Login with API credentials
 * Sends credentials to kraken-proxy which encrypts them into a stateless token
 *
 * @param credentials - User's Kraken API key and secret
 * @returns Promise with encrypted token
 * @throws AuthServiceError if login fails
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const krakenProxyUrl = getEnvironmentVariables().APP_REACT_KRAKEN_PROXY_URL;

  try {
    const response = await fetch(`${krakenProxyUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AuthServiceError(errorText || 'Login failed', response.status);
    }

    const loginResponse = (await response.json()) as LoginResponse;
    return loginResponse;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      error instanceof Error ? error.message : 'Failed to connect to server',
    );
  }
}

/**
 * Get WebSocket authentication token
 * Uses the stored auth token to fetch a WebSocket-specific token from Kraken
 *
 * @param authToken - The encrypted authentication token from login
 * @returns Promise with WebSocket token
 * @throws AuthServiceError if token fetch fails
 */
export async function getWsToken(authToken: string): Promise<string> {
  const krakenProxyUrl = getEnvironmentVariables().APP_REACT_KRAKEN_PROXY_URL;

  try {
    const response = await fetch(`${krakenProxyUrl}/ws-token`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AuthServiceError(
        errorText || 'Failed to fetch WebSocket token',
        response.status,
      );
    }

    const data = (await response.json()) as WsTokenResponse;
    return data.result.token;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      error instanceof Error
        ? error.message
        : 'Failed to fetch WebSocket token',
    );
  }
}

/**
 * Logout - clears local session
 * Currently no server-side session to invalidate (stateless tokens)
 *
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
  // Currently stateless - just resolve
  // TODO: If we add server-side session management, invalidate token here
  return Promise.resolve();
}
