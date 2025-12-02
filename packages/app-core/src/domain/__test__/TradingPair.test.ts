import { TradingPair } from '../TradingPair';

describe('TradingPair', () => {
  const createTestPair = (
    overrides?: Partial<ConstructorParameters<typeof TradingPair>>,
  ) => {
    const defaults: ConstructorParameters<typeof TradingPair> = [
      'XXBTZUSD',
      'XBTUSD',
      'XBT/USD',
      'currency',
      'XXBT',
      'currency',
      'ZUSD',
      1,
      5,
      8,
      1,
      [2, 3, 4, 5],
      [2, 3, 4, 5],
      [
        [0, 0.26],
        [50000, 0.24],
        [100000, 0.22],
      ],
      [
        [0, 0.16],
        [50000, 0.14],
        [100000, 0.12],
      ],
      'ZUSD',
      80,
      40,
      '0.0001',
      '0.5',
      '0.1',
      'online',
      250,
      200,
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
      const pair = createTestPair([
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
        'cancel_only',
      ]);
      expect(pair.isTradeable()).toBe(false);
    });
  });

  describe('isMarketOrderAllowed', () => {
    it('should return true for online status', () => {
      const pair = createTestPair();
      expect(pair.isMarketOrderAllowed()).toBe(true);
    });

    it('should return false for limit_only status', () => {
      const pair = createTestPair([
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
        'limit_only',
      ]);
      expect(pair.isMarketOrderAllowed()).toBe(false);
    });
  });

  describe('canOpenPosition', () => {
    it('should return true for online status', () => {
      const pair = createTestPair();
      expect(pair.canOpenPosition()).toBe(true);
    });

    it('should return false for reduce_only status', () => {
      const pair = createTestPair([
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
        'reduce_only',
      ]);
      expect(pair.canOpenPosition()).toBe(false);
    });
  });

  describe('validateOrderSize', () => {
    it('should validate volume against minimum order size', () => {
      const pair = createTestPair();

      expect(pair.validateOrderSize(0.001)).toEqual({
        valid: true,
      });

      expect(pair.validateOrderSize(0.00005)).toEqual({
        valid: false,
        error: 'Minimum order size is 0.0001 XXBT',
      });
    });
  });

  describe('validateOrderCost', () => {
    it('should validate cost against minimum order cost', () => {
      const pair = createTestPair();

      expect(pair.validateOrderCost(1)).toEqual({
        valid: true,
      });

      expect(pair.validateOrderCost(0.1)).toEqual({
        valid: false,
        error: 'Minimum order cost is 0.5 ZUSD',
      });
    });
  });

  describe('formatPrice', () => {
    it('should format price according to pair decimals', () => {
      const pair = createTestPair();
      expect(pair.formatPrice(45123.456789)).toBe('45123.5');
    });
  });

  describe('formatVolume', () => {
    it('should format volume according to lot decimals', () => {
      const pair = createTestPair();
      expect(pair.formatVolume(1.123456789)).toBe('1.12345679');
    });
  });

  describe('calculateFeeRate', () => {
    it('should return correct fee rate for taker orders', () => {
      const pair = createTestPair();

      expect(pair.calculateFeeRate(1000, false)).toBe(0.0026); // 0.26%
      expect(pair.calculateFeeRate(60000, false)).toBe(0.0024); // 0.24%
      expect(pair.calculateFeeRate(150000, false)).toBe(0.0022); // 0.22%
    });

    it('should return correct fee rate for maker orders', () => {
      const pair = createTestPair();

      expect(pair.calculateFeeRate(1000, true)).toBeCloseTo(0.0016, 4); // 0.16%
      expect(pair.calculateFeeRate(60000, true)).toBeCloseTo(0.0014, 4); // 0.14%
      expect(pair.calculateFeeRate(150000, true)).toBeCloseTo(0.0012, 4); // 0.12%
    });
  });

  describe('calculateFeeAmount', () => {
    it('should calculate fee amount correctly', () => {
      const pair = createTestPair();

      const volume = 1; // 1 BTC
      const price = 45000; // $45,000
      const feeAmount = pair.calculateFeeAmount(volume, price, false);

      expect(feeAmount).toBe(117); // 45000 * 0.0026 = 117
    });
  });

  describe('getDisplayName', () => {
    it('should return wsname as primary display name', () => {
      const pair = createTestPair();
      expect(pair.getDisplayName()).toBe('XBT/USD');
    });
  });

  describe('getSymbol', () => {
    it('should return formatted symbol', () => {
      const pair = createTestPair();
      expect(pair.getSymbol()).toBe('XXBT/ZUSD');
    });
  });

  describe('leverage', () => {
    it('should check leverage availability', () => {
      const pair = createTestPair();
      expect(pair.hasLeverageBuy()).toBe(true);
      expect(pair.hasLeverageSell()).toBe(true);
    });

    it('should return max leverage', () => {
      const pair = createTestPair();
      expect(pair.getMaxLeverageBuy()).toBe(5);
      expect(pair.getMaxLeverageSell()).toBe(5);
    });

    it('should handle no leverage', () => {
      const pair = createTestPair([
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
        [],
        [],
      ]);
      expect(pair.hasLeverageBuy()).toBe(false);
      expect(pair.hasLeverageSell()).toBe(false);
      expect(pair.getMaxLeverageBuy()).toBe(1);
      expect(pair.getMaxLeverageSell()).toBe(1);
    });
  });
});
