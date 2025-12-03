import { OrderBook } from '../OrderBook';
import { OrderBookLevel } from '../OrderBookLevel';

/**
 * Helper function to create test order book
 */
function createTestOrderBook(overrides?: Partial<OrderBook>): OrderBook {
  const defaultBids = [
    new OrderBookLevel(42150, 2.5),
    new OrderBookLevel(42140, 1.2),
    new OrderBookLevel(42130, 3.1),
  ];

  const defaultAsks = [
    new OrderBookLevel(42160, 1.8),
    new OrderBookLevel(42170, 2.1),
    new OrderBookLevel(42180, 0.9),
  ];

  return new OrderBook(
    overrides?.symbol ?? 'BTC/USD',
    overrides?.bids ?? defaultBids,
    overrides?.asks ?? defaultAsks,
    overrides?.timestamp ?? new Date('2025-12-03T00:00:00Z'),
    overrides?.checksum ?? 123456,
  );
}

describe('OrderBookLevel', () => {
  test('formats price with decimals', () => {
    const level = new OrderBookLevel(42150.5678, 2.5);
    expect(level.formatPrice(2)).toBe('42150.57');
    expect(level.formatPrice(4)).toBe('42150.5678');
  });

  test('formats quantity with decimals', () => {
    const level = new OrderBookLevel(42150, 2.56789);
    expect(level.formatQuantity(2)).toBe('2.57');
    expect(level.formatQuantity(4)).toBe('2.5679');
  });

  test('formats cumulative total', () => {
    const level = new OrderBookLevel(42150, 2.5, 10.75);
    expect(level.formatTotal(2)).toBe('10.75');
  });

  test('detects empty level (zero quantity)', () => {
    const emptyLevel = new OrderBookLevel(42150, 0);
    const nonEmptyLevel = new OrderBookLevel(42150, 2.5);

    expect(emptyLevel.isEmpty()).toBe(true);
    expect(nonEmptyLevel.isEmpty()).toBe(false);
  });

  test('creates new level with updated quantity', () => {
    const original = new OrderBookLevel(42150, 2.5, 10);
    const updated = original.withQuantity(3.0);

    expect(updated.price).toBe(42150);
    expect(updated.quantity).toBe(3.0);
    expect(updated.total).toBe(10); // Total unchanged
    expect(original.quantity).toBe(2.5); // Original unchanged
  });

  test('creates new level with updated total', () => {
    const original = new OrderBookLevel(42150, 2.5, 10);
    const updated = original.withTotal(15);

    expect(updated.total).toBe(15);
    expect(updated.quantity).toBe(2.5); // Quantity unchanged
  });
});

describe('OrderBook', () => {
  test('returns best bid (highest price)', () => {
    const book = createTestOrderBook();
    const bestBid = book.getBestBid();

    expect(bestBid).not.toBeNull();
    expect(bestBid?.price).toBe(42150);
    expect(bestBid?.quantity).toBe(2.5);
  });

  test('returns best ask (lowest price)', () => {
    const book = createTestOrderBook();
    const bestAsk = book.getBestAsk();

    expect(bestAsk).not.toBeNull();
    expect(bestAsk?.price).toBe(42160);
    expect(bestAsk?.quantity).toBe(1.8);
  });

  test('returns null for best bid when no bids', () => {
    const book = createTestOrderBook({ bids: [] });
    expect(book.getBestBid()).toBeNull();
  });

  test('returns null for best ask when no asks', () => {
    const book = createTestOrderBook({ asks: [] });
    expect(book.getBestAsk()).toBeNull();
  });

  test('calculates spread correctly', () => {
    const book = createTestOrderBook();
    // Spread = 42160 - 42150 = 10
    expect(book.getSpread()).toBe(10);
  });

  test('returns zero spread when no bids or asks', () => {
    const emptyBook = createTestOrderBook({ bids: [], asks: [] });
    expect(emptyBook.getSpread()).toBe(0);
  });

  test('calculates spread percentage correctly', () => {
    const book = createTestOrderBook();
    // Mid price = (42150 + 42160) / 2 = 42155
    // Spread % = (10 / 42155) * 100 ≈ 0.0237%
    const spreadPct = book.getSpreadPercentage();
    expect(spreadPct).toBeCloseTo(0.0237, 4);
  });

  test('formats spread percentage with % symbol', () => {
    const book = createTestOrderBook();
    const formatted = book.formatSpreadPercentage();
    expect(formatted).toMatch(/^\d+\.\d{4}%$/);
    expect(formatted).toContain('%');
  });

  test('calculates mid price correctly', () => {
    const book = createTestOrderBook();
    // Mid = (42150 + 42160) / 2 = 42155
    expect(book.getMidPrice()).toBe(42155);
  });

  test('returns zero mid price when no bids or asks', () => {
    const emptyBook = createTestOrderBook({ bids: [], asks: [] });
    expect(emptyBook.getMidPrice()).toBe(0);
  });

  test('calculates total bid volume', () => {
    const book = createTestOrderBook();
    // 2.5 + 1.2 + 3.1 = 6.8
    expect(book.getTotalBidVolume()).toBeCloseTo(6.8, 10);
  });

  test('calculates total ask volume', () => {
    const book = createTestOrderBook();
    // 1.8 + 2.1 + 0.9 = 4.8
    expect(book.getTotalAskVolume()).toBeCloseTo(4.8, 10);
  });

  test('returns bid depth with max levels', () => {
    const book = createTestOrderBook();
    const depth = book.getBidDepth(2);

    expect(depth).toHaveLength(2);
    expect(depth.at(0)?.price).toBe(42150);
    expect(depth.at(1)?.price).toBe(42140);
  });

  test('returns ask depth with max levels', () => {
    const book = createTestOrderBook();
    const depth = book.getAskDepth(2);

    expect(depth).toHaveLength(2);
    expect(depth.at(0)?.price).toBe(42160);
    expect(depth.at(1)?.price).toBe(42170);
  });

  test('returns all levels when max exceeds available', () => {
    const book = createTestOrderBook();
    const bidDepth = book.getBidDepth(100);
    expect(bidDepth).toHaveLength(3); // Only 3 bids available
  });

  test('formats spread with decimals', () => {
    const book = createTestOrderBook();
    expect(book.formatSpread(2)).toBe('10.00');
    expect(book.formatSpread(0)).toBe('10');
  });

  test('calculates volume imbalance ratio', () => {
    const book = createTestOrderBook();
    // Bid volume: 6.8, Ask volume: 4.8
    // Imbalance: 6.8 / 4.8 ≈ 1.4167
    const imbalance = book.getVolumeImbalance();
    expect(imbalance).toBeCloseTo(1.4167, 4);
  });

  test('returns Infinity for imbalance when no asks', () => {
    const book = createTestOrderBook({ asks: [] });
    expect(book.getVolumeImbalance()).toBe(Infinity);
  });

  test('returns 1 for imbalance when both volumes are zero', () => {
    const book = createTestOrderBook({ bids: [], asks: [] });
    expect(book.getVolumeImbalance()).toBe(1);
  });

  test('validates order book has data', () => {
    const validBook = createTestOrderBook();
    const invalidBook1 = createTestOrderBook({ bids: [] });
    const invalidBook2 = createTestOrderBook({ asks: [] });
    const invalidBook3 = createTestOrderBook({ bids: [], asks: [] });

    expect(validBook.isValid()).toBe(true);
    expect(invalidBook1.isValid()).toBe(false);
    expect(invalidBook2.isValid()).toBe(false);
    expect(invalidBook3.isValid()).toBe(false);
  });

  test('calculates cumulative totals correctly', () => {
    const book = createTestOrderBook();
    const withTotals = book.withCumulativeTotals();

    // Bid totals: 2.5, 3.7 (2.5+1.2), 6.8 (3.7+3.1)
    expect(withTotals.bids.at(0)?.total).toBeCloseTo(2.5, 10);
    expect(withTotals.bids.at(1)?.total).toBeCloseTo(3.7, 10);
    expect(withTotals.bids.at(2)?.total).toBeCloseTo(6.8, 10);

    // Ask totals: 1.8, 3.9 (1.8+2.1), 4.8 (3.9+0.9)
    expect(withTotals.asks.at(0)?.total).toBeCloseTo(1.8, 10);
    expect(withTotals.asks.at(1)?.total).toBeCloseTo(3.9, 10);
    expect(withTotals.asks.at(2)?.total).toBeCloseTo(4.8, 10);
  });

  test('preserves original book when creating with cumulative totals', () => {
    const original = createTestOrderBook();
    const withTotals = original.withCumulativeTotals();

    // Original unchanged
    expect(original.bids.at(0)?.total).toBe(0);
    expect(original.asks.at(0)?.total).toBe(0);

    // New book has totals
    expect(withTotals.bids.at(0)?.total).toBeGreaterThan(0);
    expect(withTotals.asks.at(0)?.total).toBeGreaterThan(0);
  });
});
