/**
 * AuthSession Domain Model
 *
 * Represents an authenticated user session with encrypted credentials.
 * Contains business logic for session management and token handling.
 */
export class AuthSession {
  constructor(
    public readonly token: string,
    public readonly createdAt: number = Date.now(),
  ) {}

  /**
   * Check if the session is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token && this.token.length > 0;
  }

  /**
   * Get the Authorization header value for API requests
   */
  getAuthHeader(): string {
    return `Bearer ${this.token}`;
  }

  /**
   * Get the age of the session in milliseconds
   */
  getAge(): number {
    return Date.now() - this.createdAt;
  }

  /**
   * TODO: Implement token expiration check
   * Current implementation: tokens don't expire
   * Future: Add expiration time and validation logic
   *
   * @returns true if session is expired, false otherwise
   */
  isExpired(): boolean {
    // TODO: Implement expiration logic
    // const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    // return this.getAge() > MAX_AGE;
    return false;
  }

  /**
   * Convert session to JSON for persistence
   */
  toJSON(): { token: string; createdAt: number } {
    return {
      token: this.token,
      createdAt: this.createdAt,
    };
  }

  /**
   * Create session from JSON (e.g., from localStorage)
   */
  static fromJSON(data: {
    token: string;
    createdAt: number;
  }): AuthSession | null {
    if (!data.token) {
      return null;
    }
    return new AuthSession(data.token, data.createdAt);
  }
}
