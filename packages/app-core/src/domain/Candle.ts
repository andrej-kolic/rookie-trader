/**
 * Candle (OHLC) Domain Model
 * Represents a single candlestick/OHLC bar for price chart analysis
 */
export class Candle {
  constructor(
    public readonly timestamp: number, // Unix seconds
    public readonly open: number,
    public readonly high: number,
    public readonly low: number,
    public readonly close: number,
    public readonly vwap: number, // Volume weighted average price
    public readonly volume: number,
    public readonly tradeCount: number,
  ) {}

  /**
   * Get candle body size (distance between open and close)
   */
  getBodySize(): number {
    return Math.abs(this.close - this.open);
  }

  /**
   * Get upper wick size
   */
  getUpperWickSize(): number {
    return this.high - Math.max(this.open, this.close);
  }

  /**
   * Get lower wick size
   */
  getLowerWickSize(): number {
    return Math.min(this.open, this.close) - this.low;
  }

  /**
   * Get total candle range (high to low)
   */
  getRange(): number {
    return this.high - this.low;
  }

  /**
   * Check if candle is bullish (close > open)
   */
  isBullish(): boolean {
    return this.close > this.open;
  }

  /**
   * Check if candle is bearish (close < open)
   */
  isBearish(): boolean {
    return this.close < this.open;
  }

  /**
   * Check if candle is doji (open ≈ close, within 0.1% tolerance)
   * Indicates market indecision
   */
  isDoji(): boolean {
    const range = this.getRange();
    if (range === 0) return true;
    const bodyRatio = this.getBodySize() / range;
    return bodyRatio < 0.001;
  }

  /**
   * Check if candle is a hammer pattern
   * Long lower wick (2x body), small/no upper wick, potential bottom reversal
   */
  isHammer(): boolean {
    const body = this.getBodySize();
    const lowerWick = this.getLowerWickSize();
    const upperWick = this.getUpperWickSize();

    // Avoid division by zero for doji
    if (body === 0) return false;

    // Lower wick should be at least 2x the body
    // Upper wick should be small (less than or equal to body)
    return lowerWick >= body * 2 && upperWick <= body;
  }

  /**
   * Check if candle is a shooting star pattern
   * Long upper wick (2x body), small/no lower wick, potential top reversal
   */
  isShootingStar(): boolean {
    const body = this.getBodySize();
    const lowerWick = this.getLowerWickSize();
    const upperWick = this.getUpperWickSize();

    // Avoid division by zero for doji
    if (body === 0) return false;

    // Upper wick should be at least 2x the body
    // Lower wick should be small (less than or equal to body)
    return upperWick >= body * 2 && lowerWick <= body;
  }

  /**
   * Check if this candle engulfs the previous candle
   * Body completely contains previous candle's body
   */
  isEngulfing(previous: Candle): boolean {
    const thisBullish = this.isBullish();
    const prevBullish = previous.isBullish();

    // Must be opposite direction
    if (thisBullish === prevBullish) return false;

    const thisBodyTop = Math.max(this.open, this.close);
    const thisBodyBottom = Math.min(this.open, this.close);
    const prevBodyTop = Math.max(previous.open, previous.close);
    const prevBodyBottom = Math.min(previous.open, previous.close);

    // This candle's body must completely engulf previous candle's body
    return thisBodyTop >= prevBodyTop && thisBodyBottom <= prevBodyBottom;
  }

  /**
   * Check if price closed above VWAP
   */
  isPriceAboveVWAP(): boolean {
    return this.close > this.vwap;
  }

  /**
   * Check if price closed below VWAP
   */
  isPriceBelowVWAP(): boolean {
    return this.close < this.vwap;
  }

  /**
   * Get VWAP deviation percentage
   * Positive = price above VWAP, Negative = price below VWAP
   */
  getVWAPDeviation(): number {
    return ((this.close - this.vwap) / this.vwap) * 100;
  }

  /**
   * Format timestamp as date string
   */
  formatDate(locale = 'en-US'): string {
    return new Date(this.timestamp * 1000).toLocaleDateString(locale);
  }

  /**
   * Format timestamp as time string
   */
  formatTime(locale = 'en-US'): string {
    return new Date(this.timestamp * 1000).toLocaleTimeString(locale);
  }

  /**
   * Format timestamp as full datetime
   */
  formatDateTime(locale = 'en-US'): string {
    return new Date(this.timestamp * 1000).toLocaleString(locale);
  }

  /**
   * Format price with specified decimals
   */
  formatPrice(price: number, decimals: number): string {
    return price.toFixed(decimals);
  }

  /**
   * Format volume
   */
  formatVolume(decimals = 2): string {
    return this.volume.toFixed(decimals);
  }

  /**
   * Format VWAP with specified decimals
   */
  formatVWAP(decimals: number): string {
    return this.vwap.toFixed(decimals);
  }

  /**
   * Get change percentage from open to close
   */
  getChangePercentage(): number {
    return ((this.close - this.open) / this.open) * 100;
  }

  /**
   * Format change percentage
   */
  formatChangePercentage(): string {
    const change = this.getChangePercentage();
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  }

  /**
   * Convert to lightweight-charts candlestick format
   */
  toChartData(): {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  } {
    return {
      time: this.timestamp,
      open: this.open,
      high: this.high,
      low: this.low,
      close: this.close,
    };
  }

  /**
   * Convert volume for volume series in chart
   */
  toVolumeData(): { time: number; value: number; color: string } {
    return {
      time: this.timestamp,
      value: this.volume,
      color: this.isBullish() ? '#26a69a' : '#ef5350', // Green for bullish, red for bearish
    };
  }
}
