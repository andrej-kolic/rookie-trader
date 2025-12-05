export type SystemStatusType =
  | 'online'
  | 'cancel_only'
  | 'maintenance'
  | 'post_only';

/**
 * System Status Domain Model
 * Represents the current status of Kraken's trading engine
 * Received automatically on WebSocket connection and when status changes
 */
export class SystemStatus {
  constructor(
    public readonly system: SystemStatusType,
    public readonly apiVersion: string,
    public readonly connectionId: number,
    public readonly version: string,
    public readonly timestamp: Date,
  ) {}

  /**
   * Check if system is fully online and operating normally
   */
  isOnline(): boolean {
    return this.system === 'online';
  }

  /**
   * Check if new orders can be placed
   * Returns false only during maintenance
   */
  canPlaceOrders(): boolean {
    return this.system !== 'maintenance';
  }

  /**
   * Check if existing orders can be cancelled
   * Returns false only during maintenance
   */
  canCancelOrders(): boolean {
    return this.system !== 'maintenance';
  }

  /**
   * Check if only limit orders with post_only flag are allowed
   */
  isPostOnly(): boolean {
    return this.system === 'post_only';
  }

  /**
   * Check if only order cancellations are allowed
   */
  isCancelOnly(): boolean {
    return this.system === 'cancel_only';
  }

  /**
   * Check if system is under maintenance
   */
  isMaintenance(): boolean {
    return this.system === 'maintenance';
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(): string {
    switch (this.system) {
      case 'online':
        return 'All systems operational';
      case 'cancel_only':
        return 'Cancel only - no new orders';
      case 'post_only':
        return 'Post-only limit orders allowed';
      case 'maintenance':
        return 'System maintenance in progress';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Get formatted timestamp
   */
  getFormattedTimestamp(locale = 'en-US'): string {
    return this.timestamp.toLocaleString(locale);
  }
}
