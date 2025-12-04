/**
 * Trading Pair Domain Model
 * Represents a tradable asset pair from Kraken WebSocket instrument channel
 */
export class TradingPair {
  constructor(
    public readonly symbol: string, // WebSocket v2 symbol (e.g., "BTC/USD")
    public readonly base: string, // Base currency (e.g., "BTC")
    public readonly quote: string, // Quote currency (e.g., "USD")
    public readonly status:
      | 'online'
      | 'cancel_only'
      | 'post_only'
      | 'limit_only'
      | 'reduce_only'
      | 'delisted'
      | 'maintenance'
      | 'work_in_progress',
    public readonly qtyMin: number, // Minimum order quantity
    public readonly costMin: number, // Minimum order cost
    public readonly qtyIncrement: number, // Quantity increment
    public readonly priceIncrement: number, // Price increment (tick size)
    public readonly qtyPrecision: number, // Quantity precision decimals
    public readonly pricePrecision: number, // Price precision decimals
    public readonly costPrecision: number, // Cost precision decimals
    public readonly marginable: boolean, // Can trade on margin
    public readonly marginInitial?: number, // Initial margin requirement (%)
    public readonly longPositionLimit?: number, // Long position limit
    public readonly shortPositionLimit?: number, // Short position limit
    public readonly hasIndex?: boolean, // Has index for stop-loss triggers
  ) {}

  /**
   * Get unique identifier for the pair (same as symbol)
   */
  get id(): string {
    return this.symbol;
  }

  /**
   * Check if the pair is available for trading
   */
  isTradeable(): boolean {
    return this.status === 'online';
  }

  /**
   * Check if market orders are allowed (not limit_only)
   */
  isMarketOrderAllowed(): boolean {
    return this.status !== 'limit_only';
  }

  /**
   * Check if new positions can be opened (not reduce_only)
   */
  canOpenPosition(): boolean {
    return this.status !== 'reduce_only';
  }

  /**
   * Check if pair is in cancel-only mode
   */
  isCancelOnly(): boolean {
    return this.status === 'cancel_only';
  }

  /**
   * Validate order size against minimum requirements
   */
  validateOrderSize(volume: number): { valid: boolean; error?: string } {
    if (volume < this.qtyMin) {
      return {
        valid: false,
        error: `Minimum order size is ${this.qtyMin} ${this.base}`,
      };
    }
    return { valid: true };
  }

  /**
   * Validate order cost against minimum requirements
   */
  validateOrderCost(cost: number): { valid: boolean; error?: string } {
    if (cost < this.costMin) {
      return {
        valid: false,
        error: `Minimum order cost is ${this.costMin} ${this.quote}`,
      };
    }
    return { valid: true };
  }

  /**
   * Format price according to pair precision
   */
  formatPrice(price: number): string {
    return price.toFixed(this.pricePrecision);
  }

  /**
   * Format volume according to quantity precision
   */
  formatVolume(volume: number): string {
    return volume.toFixed(this.qtyPrecision);
  }

  /**
   * Format cost according to cost precision
   */
  formatCost(cost: number): string {
    return cost.toFixed(this.costPrecision);
  }

  /**
   * Get display name for the pair
   */
  getDisplayName(): string {
    return this.symbol;
  }

  /**
   * Get pair symbol (alias for display)
   */
  getSymbol(): string {
    return this.symbol;
  }

  /**
   * Check if margin trading is available
   */
  hasMargin(): boolean {
    return this.marginable;
  }

  /**
   * Get initial margin requirement as percentage
   */
  getMarginRequirement(): number | null {
    return this.marginInitial ?? null;
  }
}
