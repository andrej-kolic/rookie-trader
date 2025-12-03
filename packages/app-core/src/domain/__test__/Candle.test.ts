import { Candle } from '../Candle';

describe('Candle', () => {
  const createTestCandle = (
    overrides?: Partial<{
      timestamp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      vwap: number;
      volume: number;
      tradeCount: number;
    }>,
  ) => {
    return new Candle(
      overrides?.timestamp ?? 1701604800,
      overrides?.open ?? 50000,
      overrides?.high ?? 51000,
      overrides?.low ?? 49500,
      overrides?.close ?? 50500,
      overrides?.vwap ?? 50300,
      overrides?.volume ?? 125.5,
      overrides?.tradeCount ?? 450,
    );
  };

  describe('getBodySize', () => {
    it('should calculate body size for bullish candle', () => {
      const candle = createTestCandle({ open: 50000, close: 50500 });
      expect(candle.getBodySize()).toBe(500);
    });

    it('should calculate body size for bearish candle', () => {
      const candle = createTestCandle({ open: 50500, close: 50000 });
      expect(candle.getBodySize()).toBe(500);
    });

    it('should return 0 for doji (open === close)', () => {
      const candle = createTestCandle({ open: 50000, close: 50000 });
      expect(candle.getBodySize()).toBe(0);
    });
  });

  describe('getUpperWickSize', () => {
    it('should calculate upper wick size correctly', () => {
      const candle = createTestCandle({
        open: 50000,
        close: 50500,
        high: 51000,
      });
      expect(candle.getUpperWickSize()).toBe(500); // 51000 - 50500
    });
  });

  describe('getLowerWickSize', () => {
    it('should calculate lower wick size correctly', () => {
      const candle = createTestCandle({
        open: 50000,
        close: 50500,
        low: 49500,
      });
      expect(candle.getLowerWickSize()).toBe(500); // 50000 - 49500
    });
  });

  describe('getRange', () => {
    it('should calculate total range correctly', () => {
      const candle = createTestCandle({ high: 51000, low: 49500 });
      expect(candle.getRange()).toBe(1500);
    });
  });

  describe('isBullish / isBearish', () => {
    it('should identify bullish candle', () => {
      const candle = createTestCandle({ open: 50000, close: 50500 });
      expect(candle.isBullish()).toBe(true);
      expect(candle.isBearish()).toBe(false);
    });

    it('should identify bearish candle', () => {
      const candle = createTestCandle({ open: 50500, close: 50000 });
      expect(candle.isBullish()).toBe(false);
      expect(candle.isBearish()).toBe(true);
    });

    it('should handle doji (neither bullish nor bearish)', () => {
      const candle = createTestCandle({ open: 50000, close: 50000 });
      expect(candle.isBullish()).toBe(false);
      expect(candle.isBearish()).toBe(false);
    });
  });

  describe('isDoji', () => {
    it('should identify doji pattern with small body', () => {
      const candle = createTestCandle({
        open: 50000,
        close: 50001,
        high: 51000,
        low: 49000,
      });
      expect(candle.isDoji()).toBe(true);
    });

    it('should identify perfect doji (open === close)', () => {
      const candle = createTestCandle({
        open: 50000,
        close: 50000,
        high: 51000,
        low: 49000,
      });
      expect(candle.isDoji()).toBe(true);
    });

    it('should not identify large body as doji', () => {
      const candle = createTestCandle({
        open: 50000,
        close: 50500,
        high: 51000,
        low: 49000,
      });
      expect(candle.isDoji()).toBe(false);
    });
  });

  describe('isHammer', () => {
    it('should identify hammer pattern', () => {
      const candle = createTestCandle({
        open: 50500,
        close: 50600, // Small body (100)
        high: 50700, // Small upper wick (100)
        low: 50000, // Long lower wick (500, 5x body)
      });
      expect(candle.isHammer()).toBe(true);
    });

    it('should not identify hammer with short lower wick', () => {
      const candle = createTestCandle({
        open: 50500,
        close: 50600,
        high: 50700,
        low: 50400, // Lower wick only 100
      });
      expect(candle.isHammer()).toBe(false);
    });

    it('should not identify hammer with long upper wick', () => {
      const candle = createTestCandle({
        open: 50500,
        close: 50600, // Body 100
        high: 51200, // Upper wick 600 (too long)
        low: 50000, // Lower wick 500
      });
      expect(candle.isHammer()).toBe(false);
    });
  });

  describe('isShootingStar', () => {
    it('should identify shooting star pattern', () => {
      const candle = createTestCandle({
        open: 50600,
        close: 50500, // Small body (100)
        high: 51000, // Long upper wick (500, 5x body)
        low: 50400, // Small lower wick (100)
      });
      expect(candle.isShootingStar()).toBe(true);
    });

    it('should not identify shooting star with short upper wick', () => {
      const candle = createTestCandle({
        open: 50600,
        close: 50500,
        high: 50700, // Upper wick only 100
        low: 50400,
      });
      expect(candle.isShootingStar()).toBe(false);
    });
  });

  describe('isEngulfing', () => {
    it('should identify bullish engulfing pattern', () => {
      const previous = createTestCandle({ open: 50500, close: 50300 }); // Bearish
      const current = createTestCandle({ open: 50200, close: 50600 }); // Bullish, engulfs
      expect(current.isEngulfing(previous)).toBe(true);
    });

    it('should identify bearish engulfing pattern', () => {
      const previous = createTestCandle({ open: 50300, close: 50500 }); // Bullish
      const current = createTestCandle({ open: 50600, close: 50200 }); // Bearish, engulfs
      expect(current.isEngulfing(previous)).toBe(true);
    });

    it('should not identify engulfing when same direction', () => {
      const previous = createTestCandle({ open: 50300, close: 50500 }); // Bullish
      const current = createTestCandle({ open: 50200, close: 50600 }); // Bullish
      expect(current.isEngulfing(previous)).toBe(false);
    });

    it('should not identify engulfing when body does not fully contain', () => {
      const previous = createTestCandle({ open: 50300, close: 50500 });
      const current = createTestCandle({ open: 50450, close: 50250 }); // Partial overlap
      expect(current.isEngulfing(previous)).toBe(false);
    });
  });

  describe('VWAP methods', () => {
    describe('isPriceAboveVWAP', () => {
      it('should return true when close above VWAP', () => {
        const candle = createTestCandle({ close: 50500, vwap: 50300 });
        expect(candle.isPriceAboveVWAP()).toBe(true);
      });

      it('should return false when close below VWAP', () => {
        const candle = createTestCandle({ close: 50100, vwap: 50300 });
        expect(candle.isPriceAboveVWAP()).toBe(false);
      });
    });

    describe('isPriceBelowVWAP', () => {
      it('should return true when close below VWAP', () => {
        const candle = createTestCandle({ close: 50100, vwap: 50300 });
        expect(candle.isPriceBelowVWAP()).toBe(true);
      });

      it('should return false when close above VWAP', () => {
        const candle = createTestCandle({ close: 50500, vwap: 50300 });
        expect(candle.isPriceBelowVWAP()).toBe(false);
      });
    });

    describe('getVWAPDeviation', () => {
      it('should calculate positive deviation', () => {
        const candle = createTestCandle({ close: 50500, vwap: 50000 });
        expect(candle.getVWAPDeviation()).toBeCloseTo(1.0, 2);
      });

      it('should calculate negative deviation', () => {
        const candle = createTestCandle({ close: 49500, vwap: 50000 });
        expect(candle.getVWAPDeviation()).toBeCloseTo(-1.0, 2);
      });
    });

    describe('formatVWAP', () => {
      it('should format VWAP with specified decimals', () => {
        const candle = createTestCandle({ vwap: 50300.123456 });
        expect(candle.formatVWAP(2)).toBe('50300.12');
        expect(candle.formatVWAP(4)).toBe('50300.1235');
      });
    });
  });

  describe('formatting methods', () => {
    const candle = createTestCandle({ timestamp: 1701604800 }); // Dec 3, 2023

    describe('formatDate', () => {
      it('should format date correctly', () => {
        const formatted = candle.formatDate('en-US');
        expect(formatted).toContain('2023');
      });
    });

    describe('formatTime', () => {
      it('should format time correctly', () => {
        const formatted = candle.formatTime('en-US');
        expect(formatted).toBeTruthy();
      });
    });

    describe('formatDateTime', () => {
      it('should format datetime correctly', () => {
        const formatted = candle.formatDateTime('en-US');
        expect(formatted).toBeTruthy();
        expect(formatted).toContain('2023');
      });
    });

    describe('formatPrice', () => {
      it('should format price with specified decimals', () => {
        const candle = createTestCandle({ close: 50000.123456 });
        expect(candle.formatPrice(50000.123456, 2)).toBe('50000.12');
        expect(candle.formatPrice(50000.123456, 4)).toBe('50000.1235');
      });
    });

    describe('formatVolume', () => {
      it('should format volume with default 2 decimals', () => {
        const candle = createTestCandle({ volume: 125.567 });
        expect(candle.formatVolume()).toBe('125.57');
      });

      it('should format volume with custom decimals', () => {
        const candle = createTestCandle({ volume: 125.567 });
        expect(candle.formatVolume(1)).toBe('125.6');
      });
    });
  });

  describe('getChangePercentage', () => {
    it('should calculate positive change percentage', () => {
      const candle = createTestCandle({ open: 50000, close: 51000 });
      expect(candle.getChangePercentage()).toBeCloseTo(2.0, 2);
    });

    it('should calculate negative change percentage', () => {
      const candle = createTestCandle({ open: 50000, close: 49000 });
      expect(candle.getChangePercentage()).toBeCloseTo(-2.0, 2);
    });

    it('should return 0 for no change', () => {
      const candle = createTestCandle({ open: 50000, close: 50000 });
      expect(candle.getChangePercentage()).toBe(0);
    });
  });

  describe('formatChangePercentage', () => {
    it('should format positive change with + sign', () => {
      const candle = createTestCandle({ open: 50000, close: 51000 });
      expect(candle.formatChangePercentage()).toBe('+2.00%');
    });

    it('should format negative change with - sign', () => {
      const candle = createTestCandle({ open: 50000, close: 49000 });
      expect(candle.formatChangePercentage()).toBe('-2.00%');
    });

    it('should format zero change', () => {
      const candle = createTestCandle({ open: 50000, close: 50000 });
      expect(candle.formatChangePercentage()).toBe('+0.00%');
    });
  });

  describe('toChartData', () => {
    it('should convert to lightweight-charts format', () => {
      const candle = createTestCandle({
        timestamp: 1701604800,
        open: 50000,
        high: 51000,
        low: 49500,
        close: 50500,
      });

      const chartData = candle.toChartData();

      expect(chartData).toEqual({
        time: 1701604800,
        open: 50000,
        high: 51000,
        low: 49500,
        close: 50500,
      });
    });
  });

  describe('toVolumeData', () => {
    it('should convert bullish candle to green volume bar', () => {
      const candle = createTestCandle({
        timestamp: 1701604800,
        open: 50000,
        close: 50500,
        volume: 125.5,
      });

      const volumeData = candle.toVolumeData();

      expect(volumeData).toEqual({
        time: 1701604800,
        value: 125.5,
        color: '#26a69a',
      });
    });

    it('should convert bearish candle to red volume bar', () => {
      const candle = createTestCandle({
        timestamp: 1701604800,
        open: 50500,
        close: 50000,
        volume: 125.5,
      });

      const volumeData = candle.toVolumeData();

      expect(volumeData).toEqual({
        time: 1701604800,
        value: 125.5,
        color: '#ef5350',
      });
    });
  });
});
