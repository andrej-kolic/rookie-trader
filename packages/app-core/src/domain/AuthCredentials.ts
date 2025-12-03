/**
 * AuthCredentials Domain Model
 * Represents API authentication credentials for Kraken private endpoints
 */
export class AuthCredentials {
  readonly apiKey: string;
  readonly apiSecret: string;
  readonly createdAt: Date;

  constructor(apiKey: string, apiSecret: string, createdAt?: Date) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.createdAt = createdAt ?? new Date();
  }

  /**
   * Returns masked API key for safe display
   * Shows first 4 and last 4 characters
   * @example "XYZ1...JK89"
   */
  getMaskedApiKey(): string {
    if (this.apiKey.length <= 8) {
      return '***';
    }
    const start = this.apiKey.substring(0, 4);
    const end = this.apiKey.substring(this.apiKey.length - 4);
    return `${start}...${end}`;
  }

  /**
   * Returns completely masked API secret for display
   * Never shows actual secret value
   */
  getMaskedApiSecret(): string {
    return '••••••••••••••••';
  }

  /**
   * Basic format validation for API key
   * Kraken API keys are typically 56 characters (base64-like)
   */
  isValidKeyFormat(): boolean {
    // Basic length check - Kraken keys are usually 56 chars
    return this.apiKey.length >= 40 && this.apiKey.length <= 80;
  }

  /**
   * Basic format validation for API secret
   * Kraken API secrets are typically 88 characters (base64)
   */
  isValidSecretFormat(): boolean {
    // Basic length check - Kraken secrets are usually 88 chars
    return this.apiSecret.length >= 60 && this.apiSecret.length <= 120;
  }

  /**
   * Validates both key and secret format
   */
  isValidFormat(): boolean {
    return this.isValidKeyFormat() && this.isValidSecretFormat();
  }

  /**
   * Check if credentials are older than specified hours
   * Useful for prompting re-authentication
   */
  isOlderThan(hours: number): boolean {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > hours;
  }

  /**
   * Returns credentials in ts-kraken ApiCredentials format
   */
  toApiCredentials(): { apiKey: string; apiSecret: string } {
    return {
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
    };
  }

  /**
   * Serialize for localStorage (includes timestamp)
   */
  toJSON(): { apiKey: string; apiSecret: string; createdAt: string } {
    return {
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Deserialize from localStorage
   */
  static fromJSON(json: {
    apiKey: string;
    apiSecret: string;
    createdAt: string;
  }): AuthCredentials {
    return new AuthCredentials(
      json.apiKey,
      json.apiSecret,
      new Date(json.createdAt),
    );
  }
}
