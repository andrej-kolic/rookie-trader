/**
 * Domain model for a single price level in the order book
 * Represents a bid or ask at a specific price with quantity
 */
export class OrderBookLevel {
  constructor(
    public readonly price: number,
    public readonly quantity: number,
    public readonly total = 0, // Cumulative quantity
  ) {}

  /**
   * Format price with specified decimal places
   */
  formatPrice(decimals: number): string {
    return this.price.toFixed(decimals);
  }

  /**
   * Format quantity with specified decimal places
   */
  formatQuantity(decimals: number): string {
    return this.quantity.toFixed(decimals);
  }

  /**
   * Format cumulative total with specified decimal places
   */
  formatTotal(decimals: number): string {
    return this.total.toFixed(decimals);
  }

  /**
   * Check if this level should be removed (zero quantity)
   */
  isEmpty(): boolean {
    return this.quantity === 0;
  }

  /**
   * Create a new level with updated quantity
   */
  withQuantity(newQuantity: number): OrderBookLevel {
    return new OrderBookLevel(this.price, newQuantity, this.total);
  }

  /**
   * Create a new level with updated cumulative total
   */
  withTotal(newTotal: number): OrderBookLevel {
    return new OrderBookLevel(this.price, this.quantity, newTotal);
  }
}
