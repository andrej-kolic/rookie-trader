import { OrderBookLevel } from './OrderBookLevel';

/**
 * Domain model for order book (Level 2 market depth)
 * Contains bid and ask price levels with quantities
 */
export class OrderBook {
  constructor(
    public readonly symbol: string,
    public readonly bids: readonly OrderBookLevel[],
    public readonly asks: readonly OrderBookLevel[],
    public readonly timestamp: Date,
    public readonly checksum: number,
  ) {}

  /**
   * Get the best bid (highest buy price)
   */
  getBestBid(): OrderBookLevel | null {
    return this.bids[0] ?? null;
  }

  /**
   * Get the best ask (lowest sell price)
   */
  getBestAsk(): OrderBookLevel | null {
    return this.asks[0] ?? null;
  }

  /**
   * Calculate the spread (difference between best ask and best bid)
   */
  getSpread(): number {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();

    if (!bestBid || !bestAsk) return 0;

    return bestAsk.price - bestBid.price;
  }

  /**
   * Calculate the spread as a percentage of the mid price
   */
  getSpreadPercentage(): number {
    const spread = this.getSpread();
    const midPrice = this.getMidPrice();

    if (midPrice === 0) return 0;

    return (spread / midPrice) * 100;
  }

  /**
   * Calculate the mid price (average of best bid and best ask)
   */
  getMidPrice(): number {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();

    if (!bestBid || !bestAsk) return 0;

    return (bestBid.price + bestAsk.price) / 2;
  }

  /**
   * Calculate total bid volume (sum of all bid quantities)
   */
  getTotalBidVolume(): number {
    return this.bids.reduce((sum, level) => sum + level.quantity, 0);
  }

  /**
   * Calculate total ask volume (sum of all ask quantities)
   */
  getTotalAskVolume(): number {
    return this.asks.reduce((sum, level) => sum + level.quantity, 0);
  }

  /**
   * Get bid levels up to a maximum depth
   */
  getBidDepth(maxLevels: number): OrderBookLevel[] {
    return this.bids.slice(0, maxLevels);
  }

  /**
   * Get ask levels up to a maximum depth
   */
  getAskDepth(maxLevels: number): OrderBookLevel[] {
    return this.asks.slice(0, maxLevels);
  }

  /**
   * Format spread with specified decimal places
   */
  formatSpread(decimals: number): string {
    return this.getSpread().toFixed(decimals);
  }

  /**
   * Format spread percentage
   */
  formatSpreadPercentage(): string {
    return this.getSpreadPercentage().toFixed(4) + '%';
  }

  /**
   * Calculate bid/ask volume imbalance ratio
   * > 1 means more bids (bullish), < 1 means more asks (bearish)
   */
  getVolumeImbalance(): number {
    const bidVolume = this.getTotalBidVolume();
    const askVolume = this.getTotalAskVolume();

    if (askVolume === 0) return bidVolume > 0 ? Infinity : 1;

    return bidVolume / askVolume;
  }

  /**
   * Check if order book has valid data
   */
  isValid(): boolean {
    return this.bids.length > 0 && this.asks.length > 0;
  }

  /**
   * Create new OrderBook with cumulative totals calculated
   */
  withCumulativeTotals(): OrderBook {
    const bidsWithTotals = this.calculateCumulativeTotals(this.bids);
    const asksWithTotals = this.calculateCumulativeTotals(this.asks);

    return new OrderBook(
      this.symbol,
      bidsWithTotals,
      asksWithTotals,
      this.timestamp,
      this.checksum,
    );
  }

  /**
   * Calculate cumulative totals for price levels
   */
  private calculateCumulativeTotals(
    levels: readonly OrderBookLevel[],
  ): OrderBookLevel[] {
    let cumulative = 0;
    return levels.map((level) => {
      cumulative += level.quantity;
      return level.withTotal(cumulative);
    });
  }
}
