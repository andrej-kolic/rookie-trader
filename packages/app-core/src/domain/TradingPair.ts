/**
 * Trading Pair Domain Model
 * Represents a tradable asset pair with all Kraken-specific information and business logic
 */
export class TradingPair {
  constructor(
    public readonly id: string,
    public readonly altname: string,
    public readonly wsname: string,
    public readonly aclassBase: string,
    public readonly base: string,
    public readonly aclassQuote: string,
    public readonly quote: string,
    public readonly pairDecimals: number,
    public readonly costDecimals: number,
    public readonly lotDecimals: number,
    public readonly lotMultiplier: number,
    public readonly leverageBuy: number[],
    public readonly leverageSell: number[],
    public readonly fees: [number, number][],
    public readonly feesMaker: [number, number][],
    public readonly feeVolumeCurrency: string,
    public readonly marginCall: number,
    public readonly marginStop: number,
    public readonly ordermin: string,
    public readonly costmin: string,
    public readonly tickSize: string,
    public readonly status:
      | 'online'
      | 'cancel_only'
      | 'post_only'
      | 'limit_only'
      | 'reduce_only',
    public readonly longPositionLimit: number,
    public readonly shortPositionLimit: number,
  ) {}

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
    const minOrder = parseFloat(this.ordermin);
    if (isNaN(minOrder)) {
      return {
        valid: false,
        error: 'Invalid minimum order size configuration',
      };
    }
    if (volume < minOrder) {
      return {
        valid: false,
        error: `Minimum order size is ${this.ordermin} ${this.base}`,
      };
    }
    return { valid: true };
  }

  /**
   * Validate order cost against minimum requirements
   */
  validateOrderCost(cost: number): { valid: boolean; error?: string } {
    const minCost = parseFloat(this.costmin);
    if (isNaN(minCost)) {
      return { valid: false, error: 'Invalid minimum cost configuration' };
    }
    if (cost < minCost) {
      return {
        valid: false,
        error: `Minimum order cost is ${this.costmin} ${this.quote}`,
      };
    }
    return { valid: true };
  }

  /**
   * Format price according to pair decimals
   */
  formatPrice(price: number): string {
    return price.toFixed(this.pairDecimals);
  }

  /**
   * Format volume according to lot decimals
   */
  formatVolume(volume: number): string {
    return volume.toFixed(this.lotDecimals);
  }

  /**
   * Calculate trading fee for a given volume
   * @param volume Trading volume in base currency
   * @param isMaker Whether this is a maker order (true) or taker order (false)
   * @returns Fee percentage as decimal (e.g., 0.0026 for 0.26%)
   */
  calculateFeeRate(volume: number, isMaker = false): number {
    const feeSchedule = isMaker ? this.feesMaker : this.fees;

    // Find the appropriate fee tier based on volume
    // Fee schedule is ordered by volume thresholds
    for (let i = feeSchedule.length - 1; i >= 0; i--) {
      const tier = feeSchedule[i];
      if (tier) {
        const [threshold, feeRate] = tier;
        if (volume >= threshold) {
          return feeRate / 100; // Convert percentage to decimal
        }
      }
    }

    // If volume is below all thresholds, use the first tier
    return feeSchedule[0]?.[1] ? feeSchedule[0][1] / 100 : 0;
  }

  /**
   * Calculate actual fee amount for a trade
   */
  calculateFeeAmount(volume: number, price: number, isMaker = false): number {
    const feeRate = this.calculateFeeRate(volume, isMaker);
    const tradeValue = volume * price;
    return tradeValue * feeRate;
  }

  /**
   * Get display name for the pair (uses wsname as primary)
   */
  getDisplayName(): string {
    return this.wsname || this.altname;
  }

  /**
   * Get pair symbol in standard format (BASE/QUOTE)
   */
  getSymbol(): string {
    return `${this.base}/${this.quote}`;
  }

  /**
   * Check if leverage is available for buying
   */
  hasLeverageBuy(): boolean {
    return this.leverageBuy.length > 0;
  }

  /**
   * Check if leverage is available for selling
   */
  hasLeverageSell(): boolean {
    return this.leverageSell.length > 0;
  }

  /**
   * Get maximum leverage for buying
   */
  getMaxLeverageBuy(): number {
    return this.leverageBuy.length > 0 ? Math.max(...this.leverageBuy) : 1;
  }

  /**
   * Get maximum leverage for selling
   */
  getMaxLeverageSell(): number {
    return this.leverageSell.length > 0 ? Math.max(...this.leverageSell) : 1;
  }
}
