import { Ticker } from '../Ticker';

describe('Ticker', () => {
  const createTestTicker = (
    overrides?: Partial<ConstructorParameters<typeof Ticker>>,
  ) => {
    const defaults: ConstructorParameters<typeof Ticker> = [
      'XBT/USD',
      45000, // last
      44995, // bid
      1.5, // bidQty
      45005, // ask
      2.3, // askQty
      46500, // high24h
      44000, // low24h
      1234.56, // volume24h
      45200, // vwap
      1000, // change24h
      2.27, // changePct24h
      new Date('2025-12-03T10:00:00Z'),
    ];

    if (overrides) {
      return new Ticker(
        ...(defaults.map(
          (val, idx) => overrides[idx] ?? val,
        ) as ConstructorParameters<typeof Ticker>),
      );
    }

    return new Ticker(...defaults);
  };

  describe('getSpread', () => {
    it('should calculate spread correctly', () => {
      const ticker = createTestTicker();
      expect(ticker.getSpread()).toBe(10); // 45005 - 44995
    });
  });

  describe('getSpreadPercentage', () => {
    it('should calculate spread percentage correctly', () => {
      const ticker = createTestTicker();
      const spreadPct = ticker.getSpreadPercentage();
      expect(spreadPct).toBeCloseTo(0.0222, 4); // 10 / 45000 * 100
    });

    it('should return 0 when mid price is 0', () => {
      const ticker = createTestTicker([undefined, undefined, 0, undefined, 0]);
      expect(ticker.getSpreadPercentage()).toBe(0);
    });
  });

  describe('getMidPrice', () => {
    it('should calculate mid price correctly', () => {
      const ticker = createTestTicker();
      expect(ticker.getMidPrice()).toBe(45000); // (44995 + 45005) / 2
    });
  });

  describe('isPriceRising', () => {
    it('should return true for positive change', () => {
      const ticker = createTestTicker();
      expect(ticker.isPriceRising()).toBe(true);
    });

    it('should return false for negative change', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        -1.5,
      ]);
      expect(ticker.isPriceRising()).toBe(false);
    });

    it('should return false for zero change', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
      ]);
      expect(ticker.isPriceRising()).toBe(false);
    });
  });

  describe('isPriceFalling', () => {
    it('should return false for positive change', () => {
      const ticker = createTestTicker();
      expect(ticker.isPriceFalling()).toBe(false);
    });

    it('should return true for negative change', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        -1.5,
      ]);
      expect(ticker.isPriceFalling()).toBe(true);
    });
  });

  describe('isNearHigh', () => {
    it('should return true when price is within 5% of high', () => {
      const ticker = createTestTicker([
        undefined,
        46400, // last = 46400, high = 46500
      ]);
      expect(ticker.isNearHigh()).toBe(true);
    });

    it('should return false when price is below 95% of high', () => {
      const ticker = createTestTicker([
        undefined,
        44000, // last = 44000, high = 46500
      ]);
      expect(ticker.isNearHigh()).toBe(false);
    });
  });

  describe('isNearLow', () => {
    it('should return true when price is within 5% of low', () => {
      const ticker = createTestTicker([
        undefined,
        44100, // last = 44100, low = 44000
      ]);
      expect(ticker.isNearLow()).toBe(true);
    });

    it('should return false when price is above 105% of low', () => {
      const ticker = createTestTicker([
        undefined,
        46500, // last = 46500, low = 44000
      ]);
      expect(ticker.isNearLow()).toBe(false);
    });
  });

  describe('formatPrice', () => {
    it('should format price with specified decimals', () => {
      const ticker = createTestTicker();
      expect(ticker.formatPrice(1)).toBe('45000.0');
      expect(ticker.formatPrice(2)).toBe('45000.00');
    });
  });

  describe('formatVolume', () => {
    it('should format large volume (>= 100) with max 2 decimals and commas', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        1234.56,
      ]);
      expect(ticker.formatVolume(8)).toBe('1,234.56'); // Uses 2 decimals for large volumes
      expect(ticker.formatVolume(4)).toBe('1,234.56'); // Uses 2 decimals
      expect(ticker.formatVolume(2)).toBe('1,234.56'); // Uses 2 decimals
    });

    it('should format medium volume (>= 1, < 100) with max 4 decimals', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        12.3456789,
      ]);
      expect(ticker.formatVolume(8)).toBe('12.3457'); // Uses 4 decimals for medium volumes
      expect(ticker.formatVolume(4)).toBe('12.3457');
      expect(ticker.formatVolume(2)).toBe('12.35'); // Respects lower limit
    });

    it('should format small volume (< 1) with full precision', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0.123456789,
      ]);
      expect(ticker.formatVolume(8)).toBe('0.12345679'); // Uses full 8 decimals
      expect(ticker.formatVolume(4)).toBe('0.1235'); // Uses 4 decimals
    });

    it('should remove trailing zeros', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        1234.5,
      ]);
      expect(ticker.formatVolume(4)).toBe('1,234.5'); // Removes trailing zeros
    });
  });

  describe('formatChangePct', () => {
    it('should format positive change with plus sign', () => {
      const ticker = createTestTicker();
      expect(ticker.formatChangePct()).toBe('+2.27%');
    });

    it('should format negative change with minus sign', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        -1.5,
      ]);
      expect(ticker.formatChangePct()).toBe('-1.50%');
    });

    it('should format zero change with plus sign', () => {
      const ticker = createTestTicker([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
      ]);
      expect(ticker.formatChangePct()).toBe('+0.00%');
    });
  });

  describe('format helpers', () => {
    const ticker = createTestTicker();

    it('should format bid', () => {
      expect(ticker.formatBid(1)).toBe('44995.0');
    });

    it('should format ask', () => {
      expect(ticker.formatAsk(1)).toBe('45005.0');
    });

    it('should format bid quantity with smart decimals (medium qty)', () => {
      expect(ticker.formatBidQty(2)).toBe('1.5'); // 1.5 uses max 4 decimals, removes trailing zeros
      expect(ticker.formatBidQty(8)).toBe('1.5'); // Uses max 4 decimals for medium qty
    });

    it('should format ask quantity with smart decimals (medium qty)', () => {
      expect(ticker.formatAskQty(2)).toBe('2.3'); // 2.3 uses max 4 decimals, removes trailing zeros
      expect(ticker.formatAskQty(8)).toBe('2.3'); // Uses max 4 decimals for medium qty
    });

    it('should format large bid quantity with max 2 decimals and commas', () => {
      const tickerLargeQty = createTestTicker([
        undefined,
        undefined,
        undefined,
        150.123456,
      ]);
      expect(tickerLargeQty.formatBidQty(8)).toBe('150.12'); // Uses max 2 decimals for large qty
    });

    it('should format small bid quantity with full precision', () => {
      const tickerSmallQty = createTestTicker([
        undefined,
        undefined,
        undefined,
        0.00012345,
      ]);
      expect(tickerSmallQty.formatBidQty(8)).toBe('0.00012345'); // Uses full 8 decimals for small qty
    });

    it('should format 24h high', () => {
      expect(ticker.formatHigh24h(1)).toBe('46500.0');
    });

    it('should format 24h low', () => {
      expect(ticker.formatLow24h(1)).toBe('44000.0');
    });
  });
});
