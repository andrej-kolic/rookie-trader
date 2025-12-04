import { TradingPair } from '../TradingPair';

describe('TradingPair', () => {
  const createTestPair = (
    overrides?: Partial<ConstructorParameters<typeof TradingPair>>,
  ) => {
    const defaults: ConstructorParameters<typeof TradingPair> = [
      'BTC/USD', // symbol
      'BTC', // base
      'USD', // quote
      'online', // status
      0.00005, // qtyMin
      0.5, // costMin
      0.00000001, // qtyIncrement
      0.1, // priceIncrement
      8, // qtyPrecision
      1, // pricePrecision
      5, // costPrecision
      true, // marginable
      0.02, // marginInitial
      300, // longPositionLimit
      240, // shortPositionLimit
      true, // hasIndex
    ];

    if (overrides) {
      return new TradingPair(
        ...(defaults.map(
          (val, idx) => overrides[idx] ?? val,
        ) as ConstructorParameters<typeof TradingPair>),
      );
    }

    return new TradingPair(...defaults);
  };

  describe('isTradeable', () => {
    it('should return true for online status', () => {
      const pair = createTestPair();
      expect(pair.isTradeable()).toBe(true);
    });

    it('should return false for cancel_only status', () => {
      const pair = createTestPair(['BTC/USD', 'BTC', 'USD', 'cancel_only']);
      expect(pair.isTradeable()).toBe(false);
    });
  });

  describe('isMarketOrderAllowed', () => {
    it('should return true for online status', () => {
      const pair = createTestPair();
      expect(pair.isMarketOrderAllowed()).toBe(true);
    });

    it('should return false for limit_only status', () => {
      const pair = createTestPair(['BTC/USD', 'BTC', 'USD', 'limit_only']);
      expect(pair.isMarketOrderAllowed()).toBe(false);
    });
  });

  describe('canOpenPosition', () => {
    it('should return true for online status', () => {
      const pair = createTestPair();
      expect(pair.canOpenPosition()).toBe(true);
    });

    it('should return false for reduce_only status', () => {
      const pair = createTestPair(['BTC/USD', 'BTC', 'USD', 'reduce_only']);
      expect(pair.canOpenPosition()).toBe(false);
    });
  });

  describe('isCancelOnly', () => {
    it('should return false for online status', () => {
      const pair = createTestPair();
      expect(pair.isCancelOnly()).toBe(false);
    });

    it('should return true for cancel_only status', () => {
      const pair = createTestPair(['BTC/USD', 'BTC', 'USD', 'cancel_only']);
      expect(pair.isCancelOnly()).toBe(true);
    });
  });

  describe('validateOrderSize', () => {
    it('should pass validation for valid volume', () => {
      const pair = createTestPair();
      const result = pair.validateOrderSize(0.001);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for volume below minimum', () => {
      const pair = createTestPair();
      const result = pair.validateOrderSize(0.00001);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum order size');
    });
  });

  describe('validateOrderCost', () => {
    it('should pass validation for valid cost', () => {
      const pair = createTestPair();
      const result = pair.validateOrderCost(10);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for cost below minimum', () => {
      const pair = createTestPair();
      const result = pair.validateOrderCost(0.1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum order cost');
    });
  });

  describe('formatting methods', () => {
    it('should format price with correct precision', () => {
      const pair = createTestPair();
      expect(pair.formatPrice(12345.6789)).toBe('12345.7');
    });

    it('should format volume with correct precision', () => {
      const pair = createTestPair();
      expect(pair.formatVolume(1.23456789)).toBe('1.23456789');
    });

    it('should format cost with correct precision', () => {
      const pair = createTestPair();
      expect(pair.formatCost(123.456789)).toBe('123.45679');
    });
  });

  describe('display methods', () => {
    it('should return symbol as display name', () => {
      const pair = createTestPair();
      expect(pair.getDisplayName()).toBe('BTC/USD');
    });

    it('should return symbol from getSymbol', () => {
      const pair = createTestPair();
      expect(pair.getSymbol()).toBe('BTC/USD');
    });

    it('should return symbol as id', () => {
      const pair = createTestPair();
      expect(pair.id).toBe('BTC/USD');
    });
  });

  describe('margin methods', () => {
    it('should check if margin is available', () => {
      const pair = createTestPair();
      expect(pair.hasMargin()).toBe(true);
    });

    it('should return margin requirement', () => {
      const pair = createTestPair();
      expect(pair.getMarginRequirement()).toBe(0.02);
    });

    it('should return null when no margin requirement', () => {
      const pair = createTestPair([
        'ETH/USD',
        'ETH',
        'USD',
        'online',
        0.001,
        1,
        0.001,
        0.01,
        8,
        2,
        5,
        false,
      ]);
      expect(pair.getMarginRequirement()).toBe(null);
    });
  });
});
