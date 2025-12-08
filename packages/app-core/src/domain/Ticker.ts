/**
 * Ticker Domain Model
 * Represents real-time market data for a trading pair
 * Immutable snapshot of current market state
 */
export class Ticker {
  constructor(
    public readonly symbol: string,
    public readonly last: number,
    public readonly bid: number,
    public readonly bidQty: number,
    public readonly ask: number,
    public readonly askQty: number,
    public readonly high24h: number,
    public readonly low24h: number,
    public readonly volume24h: number,
    public readonly vwap: number,
    public readonly change24h: number,
    public readonly changePct24h: number,
    public readonly timestamp: Date,
  ) {}

  /**
   * Calculate spread (ask - bid)
   */
  getSpread(): number {
    return this.ask - this.bid;
  }

  /**
   * Calculate spread as percentage of mid price
   */
  getSpreadPercentage(): number {
    const mid = this.getMidPrice();
    if (mid === 0) return 0;
    return (this.getSpread() / mid) * 100;
  }

  /**
   * Calculate mid price (average of bid and ask)
   */
  getMidPrice(): number {
    return (this.bid + this.ask) / 2;
  }

  /**
   * Check if price is rising (positive 24h change)
   */
  isPriceRising(): boolean {
    return this.changePct24h > 0;
  }

  /**
   * Check if price is falling (negative 24h change)
   */
  isPriceFalling(): boolean {
    return this.changePct24h < 0;
  }

  /**
   * Check if current price is near 24h high (within 5%)
   */
  isNearHigh(): boolean {
    return this.last >= this.high24h * 0.95;
  }

  /**
   * Check if current price is near 24h low (within 5%)
   */
  isNearLow(): boolean {
    return this.last <= this.low24h * 1.05;
  }

  /**
   * Format price with specified decimal places
   */
  formatPrice(decimals: number): string {
    return this.last.toFixed(decimals);
  }

  /**
   * Format volume with smart adaptive decimal places and thousands separators
   * Large volumes (>= 100): max 2 decimals
   * Medium volumes (>= 1): max 4 decimals
   * Small volumes (< 1): max decimals (up to specified limit)
   */
  formatVolume(decimals: number): string {
    const value = this.volume24h;
    let precision: number;

    if (value >= 100) {
      precision = Math.min(2, decimals);
    } else if (value >= 1) {
      precision = Math.min(4, decimals);
    } else {
      precision = decimals;
    }

    return this.formatNumberWithCommas(value, precision);
  }

  /**
   * Format change percentage with sign (e.g., "+2.34%" or "-1.23%")
   */
  formatChangePct(): string {
    const sign = this.changePct24h >= 0 ? '+' : '';
    return `${sign}${this.changePct24h.toFixed(2)}%`;
  }

  /**
   * Format bid price with decimals
   */
  formatBid(decimals: number): string {
    return this.bid.toFixed(decimals);
  }

  /**
   * Format ask price with decimals
   */
  formatAsk(decimals: number): string {
    return this.ask.toFixed(decimals);
  }

  /**
   * Format bid quantity with smart adaptive decimal places and thousands separators
   * Large quantities (>= 100): max 2 decimals
   * Medium quantities (>= 1): max 4 decimals
   * Small quantities (< 1): max decimals (up to specified limit)
   */
  formatBidQty(decimals: number): string {
    const value = this.bidQty;
    let precision: number;

    if (value >= 100) {
      precision = Math.min(2, decimals);
    } else if (value >= 1) {
      precision = Math.min(4, decimals);
    } else {
      precision = decimals;
    }

    return this.formatNumberWithCommas(value, precision);
  }

  /**
   * Format ask quantity with smart adaptive decimal places and thousands separators
   * Large quantities (>= 100): max 2 decimals
   * Medium quantities (>= 1): max 4 decimals
   * Small quantities (< 1): max decimals (up to specified limit)
   */
  formatAskQty(decimals: number): string {
    const value = this.askQty;
    let precision: number;

    if (value >= 100) {
      precision = Math.min(2, decimals);
    } else if (value >= 1) {
      precision = Math.min(4, decimals);
    } else {
      precision = decimals;
    }

    return this.formatNumberWithCommas(value, precision);
  }

  /**
   * Format 24h high with decimals
   */
  formatHigh24h(decimals: number): string {
    return this.high24h.toFixed(decimals);
  }

  /**
   * Format 24h low with decimals
   */
  formatLow24h(decimals: number): string {
    return this.low24h.toFixed(decimals);
  }

  /**
   * Private helper to format numbers with thousands separators and remove trailing zeros
   */
  private formatNumberWithCommas(value: number, decimals: number): string {
    // Format with fixed decimals first
    const fixed = value.toFixed(decimals);

    // Split into integer and decimal parts
    const parts = fixed.split('.');
    const integerPart = parts[0] ?? '';
    const decimalPart = parts[1];

    // Add thousands separators to integer part
    const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Remove trailing zeros from decimal part
    if (decimalPart) {
      const trimmedDecimals = decimalPart.replace(/0+$/, '');
      return trimmedDecimals ? `${withCommas}.${trimmedDecimals}` : withCommas;
    }

    return withCommas;
  }
}
